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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var details = function () { return ({
    name: 'Advanced Video Converter',
    description: 'Convert video with various options including NVIDIA acceleration, container selection, subtitle embedding, and audio stream handling.',
    style: {
        borderColor: 'blue',
    },
    tags: 'video,conversion,ffmpeg',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faVideo',
    inputs: [
        {
            label: 'NVIDIA Acceleration',
            name: 'useNvidia',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'dropdown',
                options: ['true', 'false'],
            },
            tooltip: 'Use NVIDIA acceleration for encoding',
        },
        {
            label: 'Output Container',
            name: 'outputContainer',
            type: 'string',
            defaultValue: 'mp4',
            inputUI: {
                type: 'dropdown',
                options: ['mp4', 'mkv'],
            },
            tooltip: 'Select output container format',
        },
        {
            label: 'CPU Encoding Speed',
            name: 'cpuEncodingSpeed',
            type: 'string',
            defaultValue: 'medium',
            inputUI: {
                type: 'dropdown',
                options: ['ultrafast', 'superfast', 'veryfast', 'faster', 'fast', 'medium', 'slow', 'slower', 'veryslow'],
            },
            tooltip: 'Select CPU encoding speed preset',
        },
        {
            label: 'GPU Encoding Speed',
            name: 'gpuEncodingSpeed',
            type: 'string',
            defaultValue: 'p7',
            inputUI: {
                type: 'dropdown',
                options: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'],
            },
            tooltip: 'Select GPU encoding speed preset (p1 fastest, p7 slowest)',
        },
        {
            label: 'Use B-Frames',
            name: 'useBFrames',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Enable or disable B-frames',
        },
        {
            label: 'B-Frames Count',
            name: 'bFramesCount',
            type: 'number',
            defaultValue: '3',
            inputUI: {
                type: 'dropdown',
                options: Array.from({ length: 21 }, function (_, i) { return i.toString(); }),
            },
            tooltip: 'Select the number of B-frames (0-20)',
            conditions: {
                useBFrames: true,
            },
        },
        {
            label: 'Video Bitrate (kbps)',
            name: 'videoBitrate',
            type: 'number',
            defaultValue: '5000',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Specify the video bitrate in kbps',
        },
        {
            label: 'Use HEVC (H.265)',
            name: 'useHEVC',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'dropdown',
                options: ['true', 'false'],
            },
            tooltip: 'Use HEVC (H.265) encoding instead of H.264',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Success',
        },
        {
            number: 2,
            tooltip: 'Error',
        },
    ],
}); };
exports.details = details;
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, ffmpegCommand, hasDTSAudio, useNvidia, useHEVC, encoder, encoder, bFramesCount, videoBitrate;
    return __generator(this, function (_a) {
        lib = require('../../../../../methods/lib')();
        args.inputs = lib.loadDefaultValues(args.inputs, details);
        args.jobLog('Input arguments:');
        args.jobLog(JSON.stringify(args.inputs, null, 2));
        // Initialize ffmpegCommand if it doesn't exist
        if (!args.variables.ffmpegCommand) {
            args.variables.ffmpegCommand = {
                inputFiles: [args.inputFileObj._id],
                streams: [],
                container: args.inputs.outputContainer,
                hardwareDecoding: false,
                shouldProcess: true,
                overallInputArguments: [],
                overallOuputArguments: [],
            };
        }
        ffmpegCommand = args.variables.ffmpegCommand;
        args.jobLog('Initial ffmpegCommand:');
        args.jobLog(JSON.stringify(ffmpegCommand, null, 2));
        hasDTSAudio = ffmpegCommand.streams.some(function (stream) {
            return stream.codec_type === 'audio' && stream.codec_name === 'dts';
        });
        if (hasDTSAudio && ffmpegCommand.container === 'mp4') {
            ffmpegCommand.container = 'mkv';
            args.jobLog('DTS audio detected. Defaulting to MKV container.');
        }
        else {
            ffmpegCommand.container = args.inputs.outputContainer;
            args.jobLog("Set output container to: ".concat(ffmpegCommand.container));
        }
        useNvidia = Boolean(args.inputs.useNvidia);
        useHEVC = Boolean(args.inputs.useHEVC);
        args.jobLog("encoder settings: useNvidia = ".concat(useNvidia, " and useHEVC = ").concat(useHEVC));
        if (useNvidia) {
            ffmpegCommand.hardwareDecoding = true;
            ffmpegCommand.overallInputArguments.push('-hwaccel', 'cuda');
            encoder = useHEVC ? 'hevc_nvenc' : 'h264_nvenc';
            ffmpegCommand.overallOuputArguments.push('-c:v', encoder, '-preset', args.inputs.gpuEncodingSpeed);
            args.jobLog("Enabled NVIDIA acceleration with ".concat(encoder, " and preset ").concat(args.inputs.gpuEncodingSpeed));
        }
        else {
            encoder = useHEVC ? 'libx265' : 'libx264';
            ffmpegCommand.overallOuputArguments.push('-c:v', encoder, '-preset', args.inputs.cpuEncodingSpeed);
            args.jobLog("Using ".concat(encoder, " for CPU encoding with preset ").concat(args.inputs.cpuEncodingSpeed));
        }
        // B-frames
        if (args.inputs.useBFrames === true) {
            bFramesCount = parseInt(args.inputs.bFramesCount) || 3;
            ffmpegCommand.overallOuputArguments.push('-bf', bFramesCount.toString());
            args.jobLog("Enabled B-frames with count: ".concat(bFramesCount));
        }
        else {
            ffmpegCommand.overallOuputArguments.push('-bf', '0');
            args.jobLog('Disabled B-frames');
        }
        // Video bitrate
        if (isNaN(Number(args.inputs.videoBitrate))) {
            args.jobLog('Invalid video bitrate detected');
        }
        videoBitrate = isNaN(Number(args.inputs.videoBitrate)) ? '0' : args.inputs.videoBitrate;
        ffmpegCommand.overallOuputArguments.push('-b:v', "".concat(videoBitrate, "k"));
        args.jobLog("Set video bitrate to: ".concat(videoBitrate, "k"));
        // Handle streams
        ffmpegCommand.streams.forEach(function (stream, index) {
            args.jobLog("Processing stream ".concat(index, ": ").concat(stream.codec_type, " - ").concat(stream.codec_name));
            switch (stream.codec_type) {
                case 'video':
                    // Auto-detect 10-bit
                    if (stream.bits_per_raw_sample === 10) {
                        ffmpegCommand.overallOuputArguments.push('-pix_fmt', 'yuv420p10le');
                        ffmpegCommand.overallOuputArguments.push('-profile', 'main10');
                        args.jobLog('Detected 10-bit video, set pixel format to yuv420p10le');
                    }
                    break;
                case 'audio':
                    if (stream.codec_name === 'dts') {
                        if (ffmpegCommand.container === 'mkv') {
                            stream.outputArgs.push('-c:a', 'copy');
                            args.jobLog("Set DTS stream ".concat(index, " to copy"));
                        }
                        else {
                            stream.outputArgs.push('-c:a', 'ac3', '-b:a', '640k');
                            args.jobLog("Transcoding DTS stream ".concat(index, " to AC3 for MP4 compatibility"));
                        }
                    }
                    else if (stream.codec_name === 'ac3') {
                        stream.outputArgs.push('-c:a', 'copy');
                        args.jobLog("Set AC3 stream ".concat(index, " to copy"));
                    }
                    else {
                        stream.outputArgs.push('-c:a', 'aac', '-b:a', '192k');
                        args.jobLog("Transcoding audio stream ".concat(index, " to AAC"));
                    }
                    break;
                case 'subtitle':
                    if (ffmpegCommand.container === 'mkv') {
                        stream.outputArgs.push('-c:s', 'copy');
                        args.jobLog("Set subtitle stream ".concat(index, " to copy"));
                    }
                    else {
                        // For MP4, we need to handle subtitles differently
                        if (stream.codec_name === 'mov_text') {
                            stream.outputArgs.push('-c:s', 'mov_text');
                            args.jobLog("Set subtitle stream ".concat(index, " to mov_text for MP4"));
                        }
                        else {
                            try {
                                // Convert incompatible subtitle formats to mov_text for MP4
                                stream.outputArgs.push('-c:s', 'mov_text');
                                args.jobLog("Converted subtitle stream ".concat(index, " to mov_text for MP4"));
                            }
                            catch (error) {
                                stream.removed = true;
                                args.jobLog("Removed incompatible subtitle stream ".concat(index, " for MP4 Error: ").concat(error));
                            }
                        }
                    }
                    break;
                default:
                    args.jobLog("Unknown stream type ".concat(stream.codec_type, " for stream ").concat(index, ", skipping"));
            }
        });
        args.jobLog('Final ffmpegCommand:');
        args.jobLog(JSON.stringify(ffmpegCommand, null, 2));
        args.jobLog('FFmpeg command prepared successfully');
        return [2 /*return*/, {
                outputFileObj: args.inputFileObj,
                outputNumber: 1,
                variables: args.variables,
            }];
    });
}); };
exports.plugin = plugin;
