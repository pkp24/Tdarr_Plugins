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
const fs_1 = require("fs");
const cliUtils_1 = require("../../../../FlowHelpers/1.0.0/cliUtils");
const fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () => ({
    name: 'HandBrake Custom Arguments',
    description: 'HandBrake Custom Arguments',
    style: {
        borderColor: 'green',
    },
    tags: '',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: '',
    inputs: [
        {
            label: 'Custom Arguments',
            name: 'customArguments',
            type: 'string',
            defaultValue: '-Z "Fast 1080p30" --all-subtitles',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Specify HandBrake arguments',
        },
        {
            label: 'JSON Preset',
            name: 'jsonPreset',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Paste a HandBrake JSON preset here. Leave blank to disable.',
        },
        {
            label: 'Container',
            name: 'container',
            type: 'string',
            defaultValue: 'mkv',
            inputUI: {
                type: 'dropdown',
                options: [
                    'original',
                    'mkv',
                    'mp4',
                    'm4v',
                    'avi',
                    'mov',
                    'mpg',
                    'mpeg',
                ],
            },
            tooltip: 'Specify output container',
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
    const customArguments = String(args.inputs.customArguments);
    let container = String(args.inputs.container);
    if (container === 'original') {
        container = (0, fileUtils_1.getContainer)(args.inputFileObj._id);
    }
    const outputFilePath = `${(0, fileUtils_1.getPluginWorkDir)(args)}/${(0, fileUtils_1.getFileName)(args.inputFileObj._id)}.${container}`;
    const presetString = String(args.inputs.jsonPreset);
    const cliArgs = [
        '-i',
        `${args.inputFileObj._id}`,
        '-o',
        `${outputFilePath}`,
    ];
    const presetPath = `${args.workDir}/preset.json`;
    if (presetString.trim() !== '') {
        const preset = JSON.parse(presetString);
        yield fs_1.promises.writeFile(presetPath, JSON.stringify(preset, null, 2));
        cliArgs.push('--preset-import-file');
        cliArgs.push(presetPath);
        cliArgs.push('-Z');
        cliArgs.push(preset.PresetList[0].PresetName);
    }
    else {
        cliArgs.push(...args.deps.parseArgsStringToArgv(customArguments, '', ''));
    }
    args.updateWorker({
        CLIType: args.handbrakePath,
        preset: cliArgs.join(' '),
    });
    const cli = new cliUtils_1.CLI({
        cli: args.handbrakePath,
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
    if (res.cliExitCode !== 0) {
        args.jobLog('Running HandBrake failed');
        throw new Error('Running HandBrake failed');
    }
    args.logOutcome('tSuc');
    return {
        outputFileObj: {
            _id: outputFilePath,
        },
        outputNumber: 1,
        variables: args.variables,
    };
});
exports.plugin = plugin;
