"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
const cliUtils_1 = require("../../../../FlowHelpers/1.0.0/cliUtils");
const fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () => ({
    name: 'Normalize Audio',
    description: 'Normalize Audio',
    style: {
        borderColor: '#6efefc',
    },
    tags: 'video',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: '',
    inputs: [
        {
            label: 'i',
            name: 'i',
            type: 'string',
            defaultValue: '-23.0',
            inputUI: {
                type: 'text',
            },
            tooltip: `"i" value used in loudnorm pass \\n
              defaults to -23.0`,
        },
        {
            label: 'lra',
            name: 'lra',
            type: 'string',
            defaultValue: '7.0',
            inputUI: {
                type: 'text',
            },
            tooltip: `Desired lra value. \\n Defaults to 7.0  
            `,
        },
        {
            label: 'tp',
            name: 'tp',
            type: 'string',
            defaultValue: '-2.0',
            inputUI: {
                type: 'text',
            },
            tooltip: `Desired "tp" value. \\n Defaults to -2.0 
              `,
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Continue to next plugin',
        },
    ],
});
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = (args) => __awaiter(void 0, void 0, void 0, function* () {
    const lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    // setup required varibles
    const loudNorm_i = args.inputs.i;
    const { lra } = args.inputs;
    const { tp } = args.inputs;
    const container = (0, fileUtils_1.getContainer)(args.inputFileObj._id);
    const outputFilePath = `${(0, fileUtils_1.getPluginWorkDir)(args)}/${(0, fileUtils_1.getFileName)(args.inputFileObj._id)}.${container}`;
    const normArgs1 = [
        '-i',
        args.inputFileObj._id,
        '-af',
        `loudnorm=I=${loudNorm_i}:LRA=${lra}:TP=${tp}:print_format=json`,
        '-f',
        'null',
        'NUL',
        '-map',
        '0',
        '-c',
        'copy',
    ];
    const cli = new cliUtils_1.CLI({
        cli: args.ffmpegPath,
        spawnArgs: normArgs1,
        spawnOpts: {},
        jobLog: args.jobLog,
        outputFilePath: '',
        inputFileObj: args.inputFileObj,
        logFullCliOutput: args.logFullCliOutput,
        updateWorker: args.updateWorker,
        args,
    });
    const res = yield cli.runCli();
    if (res.cliExitCode !== 0) {
        args.jobLog('Running FFmpeg failed');
        throw new Error('FFmpeg failed');
    }
    const lines = res.errorLogFull;
    let idx = -1;
    // get last index of Parsed_loudnorm
    lines.forEach((line, i) => {
        if (line.includes('Parsed_loudnorm')) {
            idx = i;
        }
    });
    if (idx === -1) {
        throw new Error('Failed to find loudnorm in report, please rerun');
    }
    const parts = lines[idx].split(']');
    parts.shift();
    let infoLine = parts.join(']');
    infoLine = infoLine.split('\r\n').join('').split('\t').join('');
    const loudNormValues = JSON.parse(infoLine);
    args.jobLog(`Loudnorm first pass values returned:  \n${JSON.stringify(loudNormValues)}`);
    const normArgs2 = [
        '-i',
        args.inputFileObj._id,
        '-map',
        '0',
        '-c',
        'copy',
        '-c:a',
        'aac',
        '-b:a',
        '192k',
        '-af',
        `loudnorm=print_format=summary:linear=true:I=${loudNorm_i}:LRA=${lra}:TP=${tp}:`
            + `measured_i=${loudNormValues.input_i}:`
            + `measured_lra=${loudNormValues.input_lra}:`
            + `measured_tp=${loudNormValues.input_tp}:`
            + `measured_thresh=${loudNormValues.input_thresh}:offset=${loudNormValues.target_offset} `,
        outputFilePath,
    ];
    const cli2 = new cliUtils_1.CLI({
        cli: args.ffmpegPath,
        spawnArgs: normArgs2,
        spawnOpts: {},
        jobLog: args.jobLog,
        outputFilePath,
        inputFileObj: args.inputFileObj,
        logFullCliOutput: args.logFullCliOutput,
        updateWorker: args.updateWorker,
        args,
    });
    const res2 = yield cli2.runCli();
    if (res2.cliExitCode !== 0) {
        args.jobLog('Running FFmpeg failed');
        throw new Error('FFmpeg failed');
    }
    return {
        outputFileObj: {
            _id: outputFilePath,
        },
        outputNumber: 1,
        variables: args.variables,
    };
});
exports.plugin = plugin;
