"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
const fs_1 = require("fs");
const fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
const normJoinPath_1 = __importDefault(require("../../../../FlowHelpers/1.0.0/normJoinPath"));
const fileMoveOrCopy_1 = __importDefault(require("../../../../FlowHelpers/1.0.0/fileMoveOrCopy"));
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () => ({
    name: 'Copy/Move Folder Content',
    description: `Copy or move folder content to another folder. 
Does not apply to the current file being processed (either the original or working file).
Useful if, for example, you want to move things like subtitle files or cover art to a new folder.`,
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
            label: 'Source Directory',
            name: 'sourceDirectory',
            type: 'string',
            defaultValue: 'originalDirectory',
            inputUI: {
                type: 'dropdown',
                options: [
                    'originalDirectory',
                    'workingDirectory',
                ],
            },
            tooltip: 'Specify the source location of where files will be copied/moved from',
        },
        {
            label: 'Copy or Move',
            name: 'copyOrMove',
            type: 'string',
            defaultValue: 'copy',
            inputUI: {
                type: 'dropdown',
                options: [
                    'copy',
                    'move',
                ],
            },
            tooltip: 'Specify whether to copy or move the files',
        },
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
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Specify whether to keep the relative path',
        },
        {
            label: 'All Files?',
            name: 'allFiles',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: `Specify whether to copy/move all files in the directory (excluding the original and working file)
       or use the input below to specify file extensions`,
        },
        {
            label: 'File Extensions',
            name: 'fileExtensions',
            type: 'string',
            defaultValue: 'srt,ass',
            inputUI: {
                type: 'text',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'allFiles',
                                    value: 'false',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Specify a comma separated list of file extensions to copy/move',
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
const doOperation = async ({ args, sourcePath, destinationPath, operation, }) => {
    args.jobLog(`Input path: ${sourcePath}`);
    args.jobLog(`Output path: ${destinationPath}`);
    if (sourcePath === destinationPath) {
        args.jobLog(`Input and output path are the same, skipping ${operation}`);
    }
    else {
        args.deps.fsextra.ensureDirSync((0, fileUtils_1.getFileAbosluteDir)(destinationPath));
        await (0, fileMoveOrCopy_1.default)({
            operation,
            sourcePath,
            destinationPath,
            args,
        });
    }
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = async (args) => {
    const lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    const { keepRelativePath, allFiles, } = args.inputs;
    const sourceDirectory = String(args.inputs.sourceDirectory);
    const outputDirectory = String(args.inputs.outputDirectory);
    const copyOrMove = String(args.inputs.copyOrMove);
    const fileExtensions = String(args.inputs.fileExtensions).split(',').map((row) => row.trim());
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
    let sourceDir = (0, fileUtils_1.getFileAbosluteDir)(args.originalLibraryFile._id);
    if (sourceDirectory === 'workingDirectory') {
        sourceDir = (0, fileUtils_1.getFileAbosluteDir)(args.inputFileObj._id);
    }
    let filesInDir = (await fs_1.promises.readdir(sourceDir))
        .map((row) => ({
        source: `${sourceDir}/${row}`,
        destination: (0, normJoinPath_1.default)({
            upath: args.deps.upath,
            paths: [
                outputPath,
                row,
            ],
        }),
    }))
        .filter((row) => row.source !== args.originalLibraryFile._id && row.source !== args.inputFileObj._id);
    if (!allFiles) {
        filesInDir = filesInDir.filter((row) => fileExtensions.includes((0, fileUtils_1.getContainer)(row.source)));
    }
    for (let i = 0; i < filesInDir.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await doOperation({
            args,
            sourcePath: filesInDir[i].source,
            destinationPath: filesInDir[i].destination,
            operation: copyOrMove,
        });
    }
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;
