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
    name: 'Copy to Directory',
    description: 'Copy the working file to a directory',
    style: {
        borderColor: 'green',
    },
    tags: '',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faArrowRight',
    inputs: [
        {
            label: 'Output Directory',
            name: 'outputDirectory',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'directory',
            },
            tooltip: 'Specify ouput directory',
        },
        {
            label: 'Keep Relative Path',
            name: 'keepRelativePath',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Specify whether to keep the relative path',
        },
        {
            label: 'Make Working File',
            name: 'makeWorkingFile',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Make the copied file the working file',
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
    const { keepRelativePath, makeWorkingFile, } = args.inputs;
    const outputDirectory = String(args.inputs.outputDirectory);
    const originalFileName = (0, fileUtils_1.getFileName)(args.inputFileObj._id);
    const newContainer = (0, fileUtils_1.getContainer)(args.inputFileObj._id);
    let outputPath = '';
    if (keepRelativePath) {
        const subStem = (0, fileUtils_1.getSubStem)({
            inputPathStem: args.librarySettings.folder,
            inputPath: args.originalLibraryFile._id,
        });
        outputPath = (0, normJoinPath_1.default)({
            upath: args.deps.upath,
            paths: [
                outputDirectory,
                subStem,
            ],
        });
    }
    else {
        outputPath = outputDirectory;
    }
    const ouputFilePath = (0, normJoinPath_1.default)({
        upath: args.deps.upath,
        paths: [
            outputPath,
            `${originalFileName}.${newContainer}`,
        ],
    });
    let workingFile = args.inputFileObj._id;
    if (makeWorkingFile) {
        workingFile = ouputFilePath;
    }
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
            _id: workingFile,
        },
        outputNumber: 1,
        variables: args.variables,
    };
});
exports.plugin = plugin;
