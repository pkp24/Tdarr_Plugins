"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
const fs_1 = require("fs");
const fileMoveOrCopy_1 = __importDefault(require("../../../../FlowHelpers/1.0.0/fileMoveOrCopy"));
const fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () => ({
    name: 'Replace Original File',
    description: 'Replace the original file. If the file hasn\'t changed then no action is taken.',
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
const plugin = async (args) => {
    const lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    if (args.inputFileObj._id === args.originalLibraryFile._id
        && args.inputFileObj.file_size === args.originalLibraryFile.file_size) {
        args.jobLog('File has not changed, no need to replace file');
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 1,
            variables: args.variables,
        };
    }
    args.jobLog('File has changed, replacing original file');
    const currentPath = args.inputFileObj._id;
    const orignalFolder = (0, fileUtils_1.getFileAbosluteDir)(args.originalLibraryFile._id);
    const fileName = (0, fileUtils_1.getFileName)(args.inputFileObj._id);
    const container = (0, fileUtils_1.getContainer)(args.inputFileObj._id);
    const newPath = `${orignalFolder}/${fileName}.${container}`;
    const newPathTmp = `${newPath}.tmp`;
    args.jobLog(JSON.stringify({
        currentPath,
        newPath,
        newPathTmp,
    }));
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await (0, fileMoveOrCopy_1.default)({
        operation: 'move',
        sourcePath: currentPath,
        destinationPath: newPathTmp,
        args,
    });
    // delete original file
    if (await (0, fileUtils_1.fileExists)(args.originalLibraryFile._id)
        && args.originalLibraryFile._id !== currentPath) {
        args.jobLog(`Deleting original file:${args.originalLibraryFile._id}`);
        await fs_1.promises.unlink(args.originalLibraryFile._id);
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await (0, fileMoveOrCopy_1.default)({
        operation: 'move',
        sourcePath: newPathTmp,
        destinationPath: newPath,
        args,
    });
    return {
        outputFileObj: {
            _id: newPath,
        },
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;
