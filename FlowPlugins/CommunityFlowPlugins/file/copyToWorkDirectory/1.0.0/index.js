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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
const fs_1 = require("fs");
const fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
const normJoinPath_1 = __importDefault(require("../../../../FlowHelpers/1.0.0/normJoinPath"));
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () => ({
    name: 'Copy to Working Directory',
    description: 'Copy the working file to the working directory of the Tdarr worker. '
        + 'Useful if you want to copy the file to the library cache before transcoding begins',
    style: {
        borderColor: 'green',
    },
    tags: '',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faArrowRight',
    inputs: [],
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
    const originalFileName = (0, fileUtils_1.getFileName)(args.inputFileObj._id);
    const newContainer = (0, fileUtils_1.getContainer)(args.inputFileObj._id);
    const outputPath = args.workDir;
    const ouputFilePath = (0, normJoinPath_1.default)({
        upath: args.deps.upath,
        paths: [
            outputPath,
            `${originalFileName}.${newContainer}`,
        ],
    });
    args.jobLog(`Input path: ${args.inputFileObj._id}`);
    args.jobLog(`Output path: ${outputPath}`);
    if (args.inputFileObj._id === ouputFilePath) {
        args.jobLog('Input and output path are the same, skipping copy.');
        return {
            outputFileObj: {
                _id: args.inputFileObj._id,
            },
            outputNumber: 1,
            variables: args.variables,
        };
    }
    args.deps.fsextra.ensureDirSync(outputPath);
    yield fs_1.promises.copyFile(args.inputFileObj._id, ouputFilePath);
    return {
        outputFileObj: {
            _id: ouputFilePath,
        },
        outputNumber: 1,
        variables: args.variables,
    };
});
exports.plugin = plugin;
