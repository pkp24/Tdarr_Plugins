"use strict";
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
    requiresVersion: '2.14.01',
    sidebarPosition: -1,
    icon: '',
    inputs: [
        {
            label: 'Use JSON Preset',
            name: 'useJsonPreset',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Specify whether to use a JSON preset or not',
        },
        {
            label: 'Custom Arguments',
            name: 'customArguments',
            type: 'string',
            defaultValue: '-Z "Fast 1080p30" --all-subtitles',
            inputUI: {
                type: 'text',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'useJsonPreset',
                                    value: 'true',
                                    condition: '!==',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Specify HandBrake arguments',
        },
        {
            label: 'Paste Contents of .json File Here',
            name: 'jsonPreset',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'textarea',
                style: {
                    height: '100px',
                },
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'useJsonPreset',
                                    value: 'true',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Paste a HandBrake JSON preset here.',
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
const plugin = async (args) => {
    const lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    const customArguments = String(args.inputs.customArguments);
    const { useJsonPreset } = args.inputs;
    const presetString = String(args.inputs.jsonPreset);
    let container = String(args.inputs.container);
    if (container === 'original') {
        container = (0, fileUtils_1.getContainer)(args.inputFileObj._id);
    }
    const outputFilePath = `${(0, fileUtils_1.getPluginWorkDir)(args)}/${(0, fileUtils_1.getFileName)(args.inputFileObj._id)}.${container}`;
    const cliArgs = [
        '-i',
        `${args.inputFileObj._id}`,
        '-o',
        `${outputFilePath}`,
    ];
    const presetPath = `${args.workDir}/preset.json`;
    if (useJsonPreset) {
        const preset = JSON.parse(presetString);
        await fs_1.promises.writeFile(presetPath, JSON.stringify(preset, null, 2));
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
    const res = await cli.runCli();
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
};
exports.plugin = plugin;
