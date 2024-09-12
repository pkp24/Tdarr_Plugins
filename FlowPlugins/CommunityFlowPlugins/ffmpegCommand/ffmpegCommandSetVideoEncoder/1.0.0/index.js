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
const hardwareUtils_1 = require("../../../../FlowHelpers/1.0.0/hardwareUtils");
const flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
/* eslint-disable no-param-reassign */
const details = () => ({
    name: 'Set Video Encoder',
    description: 'Set the video encoder for all streams',
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
            label: 'Output Codec',
            name: 'outputCodec',
            type: 'string',
            defaultValue: 'hevc',
            inputUI: {
                type: 'dropdown',
                options: [
                    'hevc',
                    // 'vp9',
                    'h264',
                    // 'vp8',
                    'av1',
                ],
            },
            tooltip: 'Specify codec of the output file',
        },
        {
            label: 'Enable FFmpeg Preset',
            name: 'ffmpegPresetEnabled',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Specify whether to use an FFmpeg preset',
        },
        {
            label: 'FFmpeg Preset',
            name: 'ffmpegPreset',
            type: 'string',
            defaultValue: 'fast',
            inputUI: {
                type: 'dropdown',
                options: [
                    'veryslow',
                    'slower',
                    'slow',
                    'medium',
                    'fast',
                    'faster',
                    'veryfast',
                    'superfast',
                    'ultrafast',
                ],
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'ffmpegPresetEnabled',
                                    value: 'true',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Specify ffmpeg preset',
        },
        {
            label: 'Enable FFmpeg Quality',
            name: 'ffmpegQualityEnabled',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Specify whether to set crf (or qp for GPU encoding)',
        },
        {
            label: 'FFmpeg Quality',
            name: 'ffmpegQuality',
            type: 'number',
            defaultValue: '25',
            inputUI: {
                type: 'text',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'ffmpegQualityEnabled',
                                    value: 'true',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Specify ffmpeg quality crf (or qp for GPU encoding)',
        },
        {
            label: 'Hardware Encoding',
            name: 'hardwareEncoding',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Specify whether to use hardware encoding if available',
        },
        {
            label: 'Hardware Type',
            name: 'hardwareType',
            type: 'string',
            defaultValue: 'auto',
            inputUI: {
                type: 'dropdown',
                options: [
                    'auto',
                    'nvenc',
                    'qsv',
                    'vaapi',
                    'videotoolbox',
                ],
            },
            tooltip: 'Specify codec of the output file',
        },
        {
            label: 'Hardware Decoding',
            name: 'hardwareDecoding',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Specify whether to use hardware decoding if available',
        },
        {
            label: 'Force Encoding',
            name: 'forceEncoding',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Specify whether to force encoding if stream already has the target codec',
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
    (0, flowUtils_1.checkFfmpegCommandInit)(args);
    const hardwareDecoding = args.inputs.hardwareDecoding === true;
    const hardwareType = String(args.inputs.hardwareType);
    args.variables.ffmpegCommand.hardwareDecoding = hardwareDecoding;
    for (let i = 0; i < args.variables.ffmpegCommand.streams.length; i += 1) {
        const stream = args.variables.ffmpegCommand.streams[i];
        if (stream.codec_type === 'video') {
            const targetCodec = String(args.inputs.outputCodec);
            const { ffmpegPresetEnabled, ffmpegQualityEnabled } = args.inputs;
            const ffmpegPreset = String(args.inputs.ffmpegPreset);
            const ffmpegQuality = String(args.inputs.ffmpegQuality);
            const forceEncoding = args.inputs.forceEncoding === true;
            const hardwarEncoding = args.inputs.hardwareEncoding === true;
            if (forceEncoding
                || stream.codec_name !== targetCodec) {
                args.variables.ffmpegCommand.shouldProcess = true;
                // eslint-disable-next-line no-await-in-loop
                const encoderProperties = yield (0, hardwareUtils_1.getEncoder)({
                    targetCodec,
                    hardwareEncoding: hardwarEncoding,
                    hardwareType,
                    args,
                });
                stream.outputArgs.push('-c:{outputIndex}', encoderProperties.encoder);
                if (ffmpegQualityEnabled) {
                    if (encoderProperties.isGpu) {
                        stream.outputArgs.push('-qp', ffmpegQuality);
                    }
                    else {
                        stream.outputArgs.push('-crf', ffmpegQuality);
                    }
                }
                if (ffmpegPresetEnabled) {
                    if (targetCodec !== 'av1' && ffmpegPreset) {
                        stream.outputArgs.push('-preset', ffmpegPreset);
                    }
                }
                if (hardwareDecoding) {
                    stream.inputArgs.push(...encoderProperties.inputArgs);
                }
                if (encoderProperties.outputArgs) {
                    stream.outputArgs.push(...encoderProperties.outputArgs);
                }
            }
        }
    }
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
});
exports.plugin = plugin;
