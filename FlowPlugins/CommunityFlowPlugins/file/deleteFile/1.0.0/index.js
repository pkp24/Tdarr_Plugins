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
const fs_1 = require("fs");
const fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () => ({
    name: 'Delete File',
    description: 'Delete the working file or original file.',
    style: {
        borderColor: 'red',
    },
    tags: 'video',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faTrash',
    inputs: [
        {
            label: 'File To Delete',
            name: 'fileToDelete',
            type: 'string',
            defaultValue: 'workingFile',
            inputUI: {
                type: 'dropdown',
                options: [
                    'workingFile',
                    'originalFile',
                ],
            },
            tooltip: 'Specify the file to delete',
        },
        {
            label: 'Delete Parent Folder If Empty',
            name: 'deleteParentFolderIfEmpty',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'If the folder that the file is in is empty after the file is deleted, delete the folder.',
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
    const fileToDelete = String(args.inputs.fileToDelete);
    const { deleteParentFolderIfEmpty } = args.inputs;
    if (fileToDelete === 'workingFile') {
        args.jobLog(`Deleting working file ${args.inputFileObj._id}`);
        yield fs_1.promises.unlink(args.inputFileObj._id);
    }
    else if (fileToDelete === 'originalFile') {
        args.jobLog(`Deleting original file ${args.originalLibraryFile._id}`);
        yield fs_1.promises.unlink(args.originalLibraryFile._id);
    }
    const fileDir = (0, fileUtils_1.getFileAbosluteDir)(args.originalLibraryFile._id);
    if (deleteParentFolderIfEmpty) {
        args.jobLog(`Checking if folder ${fileDir} is empty`);
        const files = yield fs_1.promises.readdir(fileDir);
        if (files.length === 0) {
            args.jobLog(`Deleting empty folder ${fileDir}`);
            yield fs_1.promises.rmdir(fileDir);
        }
        else {
            args.jobLog(`Folder ${fileDir} is not empty, skipping delete`);
        }
    }
    else {
        args.jobLog(`Skipping delete of parent folder ${fileDir}`);
    }
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
});
exports.plugin = plugin;
