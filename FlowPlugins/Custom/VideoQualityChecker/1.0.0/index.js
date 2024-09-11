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
    name: 'Video Quality Checker',
    description: 'Check video quality based on bitrate, FPS, and frame size',
    style: {
        borderColor: 'blue',
    },
    tags: 'video,quality,bitrate,fps',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.00.00',
    inputs: [
        {
            name: 'qualityFactor',
            type: 'text',
            tooltip: 'Quality factor (0.5 to 2.0, where 1.0 is standard quality)',
        },
        {
            name: 'fpsThreshold',
            type: 'text',
            tooltip: 'FPS threshold (e.g., 30)',
        },
    ],
    outputs: [
        {
            number: '1',
            tooltip: 'High quality',
        },
        {
            number: '2',
            tooltip: 'Lower quality',
        },
    ],
}); };
exports.details = details;
var calculateBitrateThreshold = function (width, height, fps, qualityFactor) {
    var pixelCount = width * height;
    var baseBitrate;
    if (pixelCount <= 921600) { // 1280x720 or lower
        baseBitrate = 5000000; // 5 Mbps
    }
    else if (pixelCount <= 2073600) { // 1920x1080
        baseBitrate = 8000000; // 8 Mbps
    }
    else if (pixelCount <= 8294400) { // 3840x2160 (4K)
        baseBitrate = 20000000; // 20 Mbps
    }
    else {
        baseBitrate = 30000000; // 30 Mbps for anything higher
    }
    // Adjust for frame rate
    var fpsAdjustment = fps / 30;
    // Apply quality factor and FPS adjustment
    return Math.round(baseBitrate * qualityFactor * fpsAdjustment);
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, inputs, inputFileObj, otherArguments, response, qualityFactor, fpsThreshold, videoStream, bitrate, fps, width, height, bitrateThreshold, isHighQuality;
    var _a;
    return __generator(this, function (_b) {
        lib = require('../../../methods/lib')();
        inputs = args.inputs, inputFileObj = args.inputFileObj, otherArguments = args.otherArguments;
        response = {
            processFile: false,
            preset: '',
            container: '.mp4',
            handBrakeMode: false,
            FFmpegMode: true,
            reQueueAfter: false,
            infoLog: '',
        };
        qualityFactor = Math.max(0.5, Math.min(2.0, parseFloat(inputs.qualityFactor)));
        fpsThreshold = parseFloat(inputs.fpsThreshold);
        videoStream = inputFileObj.ffProbeData.streams.find(function (stream) { return stream.codec_type === 'video'; });
        if (!videoStream) {
            throw new Error('No video stream found in the input file');
        }
        bitrate = parseFloat(videoStream.bit_rate || '0');
        fps = parseFloat(((_a = videoStream.r_frame_rate) === null || _a === void 0 ? void 0 : _a.split('/')[0]) || '0');
        width = parseInt(videoStream.width || '0');
        height = parseInt(videoStream.height || '0');
        bitrateThreshold = calculateBitrateThreshold(width, height, fps, qualityFactor);
        isHighQuality = bitrate >= bitrateThreshold && fps >= fpsThreshold;
        if (isHighQuality) {
            response.infoLog += "\u2611 Video meets high quality criteria (Bitrate: ".concat(bitrate, " >= ").concat(bitrateThreshold, ", FPS: ").concat(fps, " >= ").concat(fpsThreshold, ")\n");
            return [2 /*return*/, {
                    outputFileObj: args.inputFileObj,
                    outputNumber: 1, // High quality output
                    variables: args.variables,
                }];
        }
        else {
            response.infoLog += "\u2612 Video does not meet high quality criteria (Bitrate: ".concat(bitrate, " < ").concat(bitrateThreshold, " or FPS: ").concat(fps, " < ").concat(fpsThreshold, ")\n");
            return [2 /*return*/, {
                    outputFileObj: args.inputFileObj,
                    outputNumber: 2, // Lower quality output
                    variables: args.variables,
                }];
        }
        return [2 /*return*/];
    });
}); };
exports.plugin = plugin;
