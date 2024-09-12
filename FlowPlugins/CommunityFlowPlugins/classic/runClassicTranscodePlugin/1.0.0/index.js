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
const classicPlugins_1 = require("../../../../FlowHelpers/1.0.0/classicPlugins");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () => ({
    name: 'Run Classic Transcode Plugin',
    description: 'Run one of Tdarr\'s classic plugins that has Operation: Transcode',
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
            label: 'Plugin Source ID',
            name: 'pluginSourceId',
            type: 'string',
            defaultValue: 'Community:Tdarr_Plugin_MC93_Migz1FFMPEG',
            inputUI: {
                type: 'dropdown',
                options: [],
            },
            tooltip: 'Specify the classic plugin ID',
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
const replaceContainer = (filePath, container) => {
    const parts = filePath.split('.');
    parts[parts.length - 1] = container.split('.').join('');
    return parts.join('.');
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = (args) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    const outcome = yield (0, classicPlugins_1.runClassicPlugin)(args, 'transcode');
    const { result, absolutePath } = outcome;
    let { cacheFilePath } = outcome;
    args.jobLog(JSON.stringify(result, null, 2));
    if (!result) {
        args.jobLog('No result from classic plugin. Continuing to next flow plugin.');
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 1,
            variables: args.variables,
        };
    }
    // --- Backwards compatibility------------
    if (result.handBrakeMode) {
        result.handbrakeMode = result.handBrakeMode;
    }
    if (result.FFmpegMode) {
        result.ffmpegMode = result.FFmpegMode;
    }
    //----------------------------------------
    if (result.ffmpegMode) {
        result.cliToUse = 'ffmpeg';
    }
    else if (result.handbrakeMode) {
        result.cliToUse = 'handbrake';
    }
    else if (typeof ((_a = result === null || result === void 0 ? void 0 : result.custom) === null || _a === void 0 ? void 0 : _a.cliPath) === 'string') {
        const { cliPath } = result.custom;
        if (cliPath.toLowerCase().includes('ffmpeg')) {
            result.cliToUse = 'ffmpeg';
        }
        else if (cliPath.toLowerCase().includes('handbrake')) {
            result.cliToUse = 'handbrake';
        }
        else if (cliPath.toLowerCase().includes('editready')) {
            result.cliToUse = 'editready';
        }
        else if (cliPath.toLowerCase().includes('av1an')) {
            result.cliToUse = 'av1an';
        }
    }
    result.workerLog = result.transcodeSettingsLog;
    args.jobLog(JSON.stringify(result, null, 2));
    if (result.error) {
        throw new Error(`Plugin ${absolutePath} failed: ${result.error}`);
    }
    if (result.processFile !== true) {
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 1,
            variables: args.variables,
        };
    }
    const customArgs = (_b = result === null || result === void 0 ? void 0 : result.custom) === null || _b === void 0 ? void 0 : _b.args;
    const isCustomConfig = (Array.isArray(customArgs) && customArgs.length > 0)
        || (typeof customArgs === 'string'
            // @ts-expect-error length
            && customArgs.length
                > 0);
    if (!isCustomConfig) {
        cacheFilePath = replaceContainer(cacheFilePath, result.container);
    }
    else {
        // @ts-expect-error type
        cacheFilePath = result.custom.outputPath;
    }
    let presetSplit;
    if (result.preset.includes('<io>')) {
        presetSplit = result.preset.split('<io>');
    }
    else {
        presetSplit = result.preset.split(',');
    }
    let workerCommand = [];
    let cliPath = '';
    if (isCustomConfig) {
        // @ts-expect-error cliPath
        cliPath = (_c = result === null || result === void 0 ? void 0 : result.custom) === null || _c === void 0 ? void 0 : _c.cliPath;
        if (Array.isArray(customArgs)) {
            workerCommand = customArgs;
        }
        else {
            workerCommand = [
                ...args.deps.parseArgsStringToArgv(customArgs, '', ''),
            ];
        }
    }
    else {
        // working on windows with '` and spaces
        // working on unix with '
        switch (true) {
            case result.cliToUse === 'handbrake':
                workerCommand = [
                    '-i',
                    `${args.inputFileObj._id}`,
                    '-o',
                    `${cacheFilePath}`,
                    ...args.deps.parseArgsStringToArgv(result.preset, '', ''),
                ];
                cliPath = `${args.handbrakePath}`;
                break;
            case result.cliToUse === 'ffmpeg':
                workerCommand = [
                    ...args.deps.parseArgsStringToArgv(presetSplit[0], '', ''),
                    '-i',
                    `${args.inputFileObj._id}`,
                    ...args.deps.parseArgsStringToArgv(presetSplit[1], '', ''),
                    `${cacheFilePath}`,
                ];
                cliPath = `${args.ffmpegPath}`;
                break;
            default:
        }
    }
    const cli = new cliUtils_1.CLI({
        cli: cliPath,
        spawnArgs: workerCommand,
        spawnOpts: {},
        jobLog: args.jobLog,
        outputFilePath: cacheFilePath,
        inputFileObj: args.inputFileObj,
        logFullCliOutput: args.logFullCliOutput,
        updateWorker: args.updateWorker,
        args,
    });
    const res = yield cli.runCli();
    if (res.cliExitCode !== 0) {
        args.jobLog(`Running ${cliPath} failed`);
        throw new Error(`Running ${cliPath} failed`);
    }
    args.logOutcome('tSuc');
    return {
        outputFileObj: {
            _id: cacheFilePath,
        },
        outputNumber: 1,
        variables: args.variables,
    };
});
exports.plugin = plugin;
