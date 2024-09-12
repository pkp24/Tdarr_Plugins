"use strict";
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
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
/* eslint-disable no-param-reassign */
const details = () => ({
    name: 'Run Health Check',
    description: 'Run a quick health check using HandBrake or a thorough health check using FFmpeg',
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
            label: 'Type',
            name: 'type',
            type: 'string',
            defaultValue: 'quick',
            inputUI: {
                type: 'dropdown',
                options: [
                    'quick',
                    'thorough',
                ],
            },
            tooltip: 'Specify the container to use',
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
    const type = String(args.inputs.type);
    args.jobLog(`Running health check of type ${type}`);
    const outputFilePath = `${(0, fileUtils_1.getPluginWorkDir)(args)}/${(0, fileUtils_1.getFileName)(args.inputFileObj._id)}`
        + `.${(0, fileUtils_1.getContainer)(args.inputFileObj._id)}`;
    let cliPath = args.handbrakePath;
    let cliArgs = [
        '-i',
        args.inputFileObj._id,
        '-o',
        outputFilePath,
        '--scan',
    ];
    if (type === 'thorough') {
        cliPath = args.ffmpegPath;
        cliArgs = [
            '-stats',
            '-v',
            'error',
            '-i',
            args.inputFileObj._id,
            '-f',
            'null',
            '-max_muxing_queue_size',
            '9999',
            outputFilePath,
        ];
    }
    const cli = new cliUtils_1.CLI({
        cli: cliPath,
        spawnArgs: cliArgs,
        spawnOpts: {},
        jobLog: args.jobLog,
        outputFilePath,
        inputFileObj: args.inputFileObj,
        logFullCliOutput: args.logFullCliOutput,
        updateWorker: args.updateWorker,
        args,
    });
    const res = yield cli.runCli();
    // Added in 2.19.01
    if (typeof args.updateStat !== 'undefined') {
        yield args.updateStat(args.originalLibraryFile.DB, 'totalHealthCheckCount', 1);
    }
    if (res.cliExitCode !== 0) {
        args.jobLog('Running CLI failed');
        args.logOutcome('hErr');
        throw new Error('Running CLI failed');
    }
    args.logOutcome('hSuc');
    // will cause item to go into the health check success table
    args.variables.healthCheck = 'Success';
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
});
exports.plugin = plugin;
