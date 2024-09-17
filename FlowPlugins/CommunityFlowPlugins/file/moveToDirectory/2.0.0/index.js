"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
const fileMoveOrCopy_1 = __importDefault(require("../../../../FlowHelpers/1.0.0/fileMoveOrCopy"));
const fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
const normJoinPath_1 = __importDefault(require("../../../../FlowHelpers/1.0.0/normJoinPath"));
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () => ({
    name: 'Move To Directory',
    description: 'Move working file to directory.',
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
    const { keepRelativePath, } = args.inputs;
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
    args.jobLog(`Input path: ${args.inputFileObj._id}`);
    args.jobLog(`Output path: ${ouputFilePath}`);
    if (args.inputFileObj._id === ouputFilePath) {
        args.jobLog('Input and output path are the same, skipping move.');
        return {
            outputFileObj: {
                _id: args.inputFileObj._id,
            },
            outputNumber: 1,
            variables: args.variables,
        };
    }
    args.deps.fsextra.ensureDirSync(outputPath);
    await (0, fileMoveOrCopy_1.default)({
        operation: 'move',
        sourcePath: args.inputFileObj._id,
        destinationPath: ouputFilePath,
        args,
    });
    return {
        outputFileObj: {
            _id: ouputFilePath,
        },
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;
