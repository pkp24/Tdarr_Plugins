"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLI = exports.getFFmpegVar = void 0;
const fs_1 = __importDefault(require("fs"));
const cliParsers_1 = require("./cliParsers");
const fileUtils_1 = require("./fileUtils");
const fancyTimeFormat = (time) => {
    // Hours, minutes and seconds
    // eslint-disable-next-line no-bitwise
    const hrs = ~~(time / 3600);
    // eslint-disable-next-line no-bitwise
    const mins = ~~((time % 3600) / 60);
    // eslint-disable-next-line no-bitwise
    const secs = ~~time % 60;
    // Output like "1:01" or "4:03:59" or "123:03:59"
    let ret = '';
    //  if (hrs > 0) {
    ret += `${hrs}:${mins < 10 ? '0' : ''}`;
    // }
    ret += `${mins}:${secs < 10 ? '0' : ''}`;
    ret += `${secs}`;
    return ret;
};
// frame=  889 fps=106 q=26.0 Lsize=   25526kB time=00:00:35.69 bitrate=5858.3kbits/s speed=4.25x
const getFFmpegVar = ({ str, variable, }) => {
    if (typeof str !== 'string') {
        return '';
    }
    const idx = str.indexOf(variable);
    let out = '';
    let initSpacesEnded = false;
    if (idx >= 0) {
        const startIdx = idx + variable.length + 1;
        for (let i = startIdx; i < str.length; i += 1) {
            if (initSpacesEnded === true && str[i] === ' ') {
                break;
            }
            else if (initSpacesEnded === false && str[i] !== ' ') {
                initSpacesEnded = true;
            }
            if (initSpacesEnded === true && str[i] !== ' ') {
                out += str[i];
            }
        }
    }
    return out;
};
exports.getFFmpegVar = getFFmpegVar;
class CLI {
    constructor(config) {
        // @ts-expect-error init
        this.config = {};
        this.progAVG = [];
        this.oldOutSize = 0;
        this.oldEstSize = 0;
        this.oldProgress = 0;
        this.lastProgCheck = 0;
        this.hbPass = 0;
        this.cancelled = false;
        this.startTime = new Date().getTime();
        this.updateETA = async (perc) => {
            if (perc > 0) {
                if (this.lastProgCheck === 0) {
                    this.lastProgCheck = new Date().getTime();
                    this.oldProgress = perc;
                }
                else if (perc !== this.oldProgress) {
                    const n = new Date().getTime();
                    const secsSinceLastCheck = (n - this.lastProgCheck) / 1000;
                    if (secsSinceLastCheck > 1) {
                        // eta total
                        let eta = Math.round((100 / (perc - this.oldProgress)) * secsSinceLastCheck);
                        // eta remaining
                        eta *= ((100 - perc) / 100);
                        this.progAVG.push(eta);
                        // let values = [2, 56, 3, 41, 0, 4, 100, 23];
                        const sum = this.progAVG.reduce(
                        // eslint-disable-next-line
                        (previous, current) => (current += previous));
                        const avg = sum / this.progAVG.length;
                        // est size
                        let estSize = 0;
                        let outputFileSizeInGbytes;
                        try {
                            if (await (0, fileUtils_1.fileExists)(this.config.outputFilePath)) {
                                let singleFileSize = fs_1.default.statSync(this.config.outputFilePath);
                                // @ts-expect-error type
                                singleFileSize = singleFileSize.size;
                                // @ts-expect-error type
                                outputFileSizeInGbytes = singleFileSize / (1024 * 1024 * 1024);
                                if (outputFileSizeInGbytes !== this.oldOutSize) {
                                    this.oldOutSize = outputFileSizeInGbytes;
                                    estSize = outputFileSizeInGbytes
                                        + ((100 - perc) / perc) * outputFileSizeInGbytes;
                                    this.oldEstSize = estSize;
                                }
                            }
                        }
                        catch (err) {
                            // eslint-disable-next-line no-console
                            console.log(err);
                        }
                        this.config.updateWorker({
                            ETA: fancyTimeFormat(avg),
                            outputFileSizeInGbytes: outputFileSizeInGbytes === undefined ? 0 : outputFileSizeInGbytes,
                            estSize: this.oldEstSize === undefined ? 0 : this.oldEstSize,
                        });
                        if (this.progAVG.length > 30) {
                            this.progAVG.splice(0, 1);
                        }
                        this.lastProgCheck = n;
                        this.oldProgress = perc;
                        const secondsSinceStart = (new Date().getTime() - this.startTime) / 1000;
                        // live size compare
                        if (this.config.args.variables.liveSizeCompare?.enabled) {
                            const { compareMethod, thresholdPerc, checkDelaySeconds, } = this.config.args.variables.liveSizeCompare;
                            if (secondsSinceStart > checkDelaySeconds) {
                                // MB
                                const inputFileSize = this.config.inputFileObj.file_size;
                                const inputFileSizeInGbytes = inputFileSize / 1024;
                                const cancel = (ratio) => {
                                    this.config.jobLog(`Input file size: ${inputFileSizeInGbytes}GB`);
                                    this.config.jobLog(`Ratio: ${ratio}%`);
                                    this.config.jobLog(`Ratio is greater than threshold: ${thresholdPerc}%, cancelling job`);
                                    this.cancelled = true;
                                    // @ts-expect-error must exist to be here
                                    this.config.args.variables.liveSizeCompare.error = true;
                                    this.killThread();
                                };
                                if (compareMethod === 'estimatedFinalSize'
                                    && estSize !== undefined
                                    && estSize > 0) {
                                    const ratio = (estSize / inputFileSizeInGbytes) * 100;
                                    if (ratio > thresholdPerc) {
                                        this.config.jobLog(`Estimated final size: ${estSize}GB`);
                                        cancel(ratio);
                                    }
                                }
                                else if (compareMethod === 'currentSize'
                                    && outputFileSizeInGbytes !== undefined
                                    && outputFileSizeInGbytes > 0) {
                                    const ratio = (outputFileSizeInGbytes / inputFileSizeInGbytes) * 100;
                                    if (ratio > thresholdPerc) {
                                        this.config.jobLog(`Current output size: ${outputFileSizeInGbytes}GB`);
                                        cancel(ratio);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
        this.parseOutput = (data) => {
            const str = `${data}`;
            //
            if (this.config.logFullCliOutput === true) {
                this.config.jobLog(str);
            }
            if (this.config.cli.toLowerCase().includes('handbrake')) {
                if (str.includes('task 1 of 2')) {
                    this.hbPass = 1;
                }
                else if (str.includes('task 2 of 2')) {
                    this.hbPass = 2;
                }
                const percentage = (0, cliParsers_1.handbrakeParser)({
                    str,
                    hbPass: this.hbPass,
                });
                if (percentage > 0) {
                    void this.updateETA(percentage);
                    this.config.updateWorker({
                        percentage,
                    });
                }
                const fps = (0, cliParsers_1.getHandBrakeFps)({
                    str,
                });
                if (fps > 0) {
                    this.config.updateWorker({
                        fps,
                    });
                }
            }
            else if (this.config.cli.toLowerCase().includes('ffmpeg')) {
                const n = str.indexOf('fps');
                const shouldUpdate = str.length >= 6 && n >= 6;
                const fps = parseInt((0, exports.getFFmpegVar)({
                    str,
                    variable: 'fps',
                }), 10);
                let frameCount = 0;
                try {
                    // @ts-expect-error type
                    const frameCountTmp = this.config.inputFileObj.ffProbeData?.streams
                        .filter((row) => row.codec_type === 'video')[0].nb_frames;
                    if (frameCountTmp
                        // @ts-expect-error type
                        && !isNaN(frameCountTmp)) { // eslint-disable-line no-restricted-globals
                        // @ts-expect-error type
                        frameCount = frameCountTmp;
                    }
                }
                catch (err) {
                    // err
                }
                const percentage = (0, cliParsers_1.ffmpegParser)({
                    str,
                    frameCount,
                    videoFrameRate: this.config.inputFileObj?.meta?.VideoFrameRate,
                    ffprobeDuration: this.config.inputFileObj.ffProbeData?.format?.duration,
                    metaDuration: this.config.inputFileObj?.meta?.Duration,
                });
                if (shouldUpdate === true && fps > 0) {
                    this.config.updateWorker({
                        fps,
                    });
                }
                if (percentage > 0) {
                    void this.updateETA(percentage);
                    this.config.updateWorker({
                        percentage,
                    });
                }
            }
            else if (this.config.cli.toLowerCase().includes('editready')) {
                const percentage = (0, cliParsers_1.editreadyParser)({
                    str,
                });
                if (percentage > 0) {
                    void this.updateETA(percentage);
                    this.config.updateWorker({
                        percentage,
                    });
                }
            }
        };
        this.killThread = () => {
            const killArray = [
                'SIGKILL',
                'SIGHUP',
                'SIGTERM',
                'SIGINT',
            ];
            try {
                this.thread.kill();
            }
            catch (err) {
                // err
            }
            killArray.forEach((com) => {
                try {
                    this.thread.kill(com);
                }
                catch (err) {
                    // err
                }
            });
        };
        this.runCli = async () => {
            const childProcess = require('child_process');
            const errorLogFull = [];
            this.config.jobLog(`Running ${this.config.cli} ${this.config.spawnArgs.join(' ')}`);
            const exitHandler = () => {
                if (this.thread) {
                    try {
                        // eslint-disable-next-line no-console
                        console.log('Main thread exiting, cleaning up running CLI');
                        this.killThread();
                    }
                    catch (err) {
                        // eslint-disable-next-line no-console
                        console.log('Error running cliUtils on Exit function');
                        // eslint-disable-next-line no-console
                        console.log(err);
                    }
                }
            };
            process.on('exit', exitHandler);
            let cliExitCode = await new Promise((resolve) => {
                try {
                    const opts = this.config.spawnOpts || {};
                    const spawnArgs = this.config.spawnArgs.map((row) => row.trim()).filter((row) => row !== '');
                    this.thread = childProcess.spawn(this.config.cli, spawnArgs, opts);
                    this.thread.stdout.on('data', (data) => {
                        errorLogFull.push(data.toString());
                        this.parseOutput(data);
                    });
                    this.thread.stderr.on('data', (data) => {
                        // eslint-disable-next-line no-console
                        errorLogFull.push(data.toString());
                        this.parseOutput(data);
                    });
                    this.thread.on('error', () => {
                        // catches execution error (bad file)
                        // eslint-disable-next-line no-console
                        console.log(`Error executing binary: ${this.config.cli}`);
                        this.config.jobLog(`Error executing binary: ${this.config.cli}`);
                        resolve(1);
                    });
                    // thread.stdout.pipe(process.stdout);
                    // thread.stderr.pipe(process.stderr);
                    this.thread.on('close', (code) => {
                        if (code !== 0) {
                            // eslint-disable-next-line no-console
                            console.log(`CLI error code: ${code}`);
                            this.config.jobLog(`CLI error code: ${code}`);
                        }
                        resolve(code);
                    });
                }
                catch (err) {
                    // catches execution error (no file)
                    // eslint-disable-next-line no-console
                    console.log(`Error executing binary: ${this.config.cli}: ${err}`);
                    this.config.jobLog(`Error executing binary: ${this.config.cli}: ${err}`);
                    resolve(1);
                }
            });
            process.removeListener('exit', exitHandler);
            this.thread = undefined;
            if (!this.config.logFullCliOutput) {
                this.config.jobLog(errorLogFull.slice(-1000).join(''));
            }
            if (this.cancelled) {
                cliExitCode = 1;
            }
            this.config.jobLog(`CLI ${this.config.cli} exited with code: ${cliExitCode}`);
            return {
                cliExitCode,
                errorLogFull,
            };
        };
        this.config = config;
    }
}
exports.CLI = CLI;
