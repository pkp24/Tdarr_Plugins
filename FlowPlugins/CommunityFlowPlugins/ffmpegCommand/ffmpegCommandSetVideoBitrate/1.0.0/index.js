"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
const fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
const flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () => ({
    name: 'Set Video Bitrate',
    description: 'Set Video Bitrate',
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
            label: 'Use % of Input Bitrate',
            name: 'useInputBitrate',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Specify whether to use a % of input bitrate as the output bitrate',
        },
        {
            label: 'Target Bitrate %',
            name: 'targetBitratePercent',
            type: 'string',
            defaultValue: '50',
            inputUI: {
                type: 'text',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'useInputBitrate',
                                    value: 'true',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Specify the target bitrate as a % of the input bitrate',
        },
        {
            label: 'Fallback Bitrate',
            name: 'fallbackBitrate',
            type: 'string',
            defaultValue: '4000',
            inputUI: {
                type: 'text',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'useInputBitrate',
                                    value: 'true',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Specify fallback bitrate in kbps if input bitrate is not available',
        },
        {
            label: 'Bitrate',
            name: 'bitrate',
            type: 'string',
            defaultValue: '5000',
            inputUI: {
                type: 'text',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'useInputBitrate',
                                    value: 'true',
                                    condition: '!==',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Specify bitrate in kbps',
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
const plugin = (args) => {
    const lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    (0, flowUtils_1.checkFfmpegCommandInit)(args);
    const { useInputBitrate } = args.inputs;
    const targetBitratePercent = String(args.inputs.targetBitratePercent);
    const fallbackBitrate = String(args.inputs.fallbackBitrate);
    const bitrate = String(args.inputs.bitrate);
    args.variables.ffmpegCommand.streams.forEach((stream) => {
        var _a, _b, _c, _d;
        if (stream.codec_type === 'video') {
            const ffType = (0, fileUtils_1.getFfType)(stream.codec_type);
            if (useInputBitrate) {
                args.jobLog('Attempting to use % of input bitrate as output bitrate');
                // check if input bitrate is available
                const mediainfoIndex = stream.index + 1;
                let inputBitrate = (_d = (_c = (_b = (_a = args === null || args === void 0 ? void 0 : args.inputFileObj) === null || _a === void 0 ? void 0 : _a.mediaInfo) === null || _b === void 0 ? void 0 : _b.track) === null || _c === void 0 ? void 0 : _c[mediainfoIndex]) === null || _d === void 0 ? void 0 : _d.BitRate;
                if (inputBitrate) {
                    args.jobLog(`Found input bitrate: ${inputBitrate}`);
                    // @ts-expect-error type
                    inputBitrate = parseInt(inputBitrate, 10) / 1000;
                    const targetBitrate = (inputBitrate * (parseInt(targetBitratePercent, 10) / 100));
                    args.jobLog(`Setting video bitrate as ${targetBitrate}k`);
                    stream.outputArgs.push(`-b:${ffType}:{outputTypeIndex}`, `${targetBitrate}k`);
                }
                else {
                    args.jobLog(`Unable to find input bitrate, setting fallback bitrate as ${fallbackBitrate}k`);
                    stream.outputArgs.push(`-b:${ffType}:{outputTypeIndex}`, `${fallbackBitrate}k`);
                }
            }
            else {
                args.jobLog(`Using fixed bitrate. Setting video bitrate as ${bitrate}k`);
                stream.outputArgs.push(`-b:${ffType}:{outputTypeIndex}`, `${bitrate}k`);
            }
        }
    });
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;
