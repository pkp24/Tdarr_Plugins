"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
const cliUtils_1 = require("../../../../FlowHelpers/1.0.0/cliUtils");
const fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
const flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () => ({
    name: 'Execute',
    description: 'Execute the created FFmpeg command',
    style: {
        borderColor: 'green',
    },
    tags: 'video',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: 2,
    icon: 'faPlay',
    inputs: [],
    outputs: [
        {
            number: 1,
            tooltip: 'Continue to next plugin',
        },
    ],
});
exports.details = details;
const getOuputStreamIndex = (streams, stream) => {
    let index = -1;
    for (let idx = 0; idx < streams.length; idx += 1) {
        if (!stream.removed) {
            index += 1;
        }
        if (streams[idx].index === stream.index) {
            break;
        }
    }
    return index;
};
const getOuputStreamTypeIndex = (streams, stream) => {
    let index = -1;
    for (let idx = 0; idx < streams.length; idx += 1) {
        if (!stream.removed && streams[idx].codec_type === stream.codec_type) {
            index += 1;
        }
        if (streams[idx].index === stream.index) {
            break;
        }
    }
    return index;
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = async (args) => {
    const lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    (0, flowUtils_1.checkFfmpegCommandInit)(args);
    const cliArgs = [];
    cliArgs.push('-y');
    cliArgs.push('-i');
    cliArgs.push(args.inputFileObj._id);
    let { shouldProcess, streams } = args.variables.ffmpegCommand;
    if (args.variables.ffmpegCommand.overallInputArguments.length > 0) {
        shouldProcess = true;
    }
    const inputArgs = [
        ...args.variables.ffmpegCommand.overallInputArguments,
    ];
    streams = streams.filter((stream) => {
        if (stream.removed) {
            shouldProcess = true;
        }
        return !stream.removed;
    });
    if (streams.length === 0) {
        args.jobLog('No streams mapped for new file');
        throw new Error('No streams mapped for new file');
    }
    for (let i = 0; i < streams.length; i += 1) {
        const stream = streams[i];
        stream.outputArgs = stream.outputArgs.map((arg) => {
            if (arg.includes('{outputIndex}')) {
                // eslint-disable-next-line no-param-reassign
                arg = arg.replace('{outputIndex}', String(getOuputStreamIndex(streams, stream)));
            }
            if (arg.includes('{outputTypeIndex}')) {
                // eslint-disable-next-line no-param-reassign
                arg = arg.replace('{outputTypeIndex}', String(getOuputStreamTypeIndex(streams, stream)));
            }
            return arg;
        });
        cliArgs.push(...stream.mapArgs);
        if (stream.outputArgs.length === 0) {
            cliArgs.push(`-c:${getOuputStreamIndex(streams, stream)}`, 'copy');
        }
        else {
            cliArgs.push(...stream.outputArgs);
        }
        inputArgs.push(...stream.inputArgs);
    }
    const idx = cliArgs.indexOf('-i');
    cliArgs.splice(idx, 0, ...inputArgs);
    if (args.variables.ffmpegCommand.overallOuputArguments.length > 0) {
        cliArgs.push(...args.variables.ffmpegCommand.overallOuputArguments);
        shouldProcess = true;
    }
    if (!shouldProcess) {
        args.jobLog('No need to process file, already as required');
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 1,
            variables: args.variables,
        };
    }
    const outputFilePath = `${(0, fileUtils_1.getPluginWorkDir)(args)}/${(0, fileUtils_1.getFileName)(args.inputFileObj._id)}`
        + `.${args.variables.ffmpegCommand.container}`;
    cliArgs.push(outputFilePath);
    const spawnArgs = cliArgs.map((row) => row.trim()).filter((row) => row !== '');
    args.jobLog('Processing file');
    args.jobLog(JSON.stringify({
        spawnArgs,
        outputFilePath,
    }));
    args.updateWorker({
        CLIType: args.ffmpegPath,
        preset: spawnArgs.join(' '),
    });
    const cli = new cliUtils_1.CLI({
        cli: args.ffmpegPath,
        spawnArgs,
        spawnOpts: {},
        jobLog: args.jobLog,
        outputFilePath,
        inputFileObj: args.inputFileObj,
        logFullCliOutput: args.logFullCliOutput,
        updateWorker: args.updateWorker,
        args,
    });
    const res = await cli.runCli();
    if (res.cliExitCode !== 0) {
        args.jobLog('Running FFmpeg failed');
        throw new Error('FFmpeg failed');
    }
    args.logOutcome('tSuc');
    // eslint-disable-next-line no-param-reassign
    args.variables.ffmpegCommand.init = false;
    return {
        outputFileObj: {
            _id: outputFilePath,
        },
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;
