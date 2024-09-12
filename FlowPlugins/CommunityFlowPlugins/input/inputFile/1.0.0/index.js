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
    name: 'Input File',
    description: 'Start the flow with an input file',
    style: {
        borderColor: 'pink',
    },
    tags: '',
    isStartPlugin: true,
    pType: 'start',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: '',
    inputs: [
        {
            label: 'File Access Checks',
            name: 'fileAccessChecks',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Will check if input file and cache are readable and writable',
        },
        {
            label: 'Pause Node If Access Checks Fail',
            name: 'pauseNodeIfAccessChecksFail',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'This will pause the node if the file access checks fail',
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
    const orignalFolder = (0, fileUtils_1.getFileAbosluteDir)(args.originalLibraryFile._id);
    const { fileAccessChecks, pauseNodeIfAccessChecksFail } = args.inputs;
    const nodeID = process.argv[8];
    const { serverIP, serverPort } = args.deps.configVars.config;
    const url = `http://${serverIP}:${serverPort}/api/v2/update-node`;
    const pauseNode = () => __awaiter(void 0, void 0, void 0, function* () {
        args.jobLog('Pausing node');
        const requestConfig = {
            method: 'post',
            url,
            headers: {},
            data: {
                data: {
                    nodeID,
                    nodeUpdates: {
                        nodePaused: true,
                    },
                },
            },
        };
        yield args.deps.axios(requestConfig);
        args.jobLog('Node paused');
    });
    const checkReadWrite = (location) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield fs_1.promises.access(location, fs_1.promises.constants.R_OK);
        }
        catch (err) {
            args.jobLog(JSON.stringify(err));
            if (pauseNodeIfAccessChecksFail) {
                yield pauseNode();
            }
            throw new Error(`Location not readable:${location}`);
        }
        try {
            yield fs_1.promises.access(location, fs_1.promises.constants.W_OK);
        }
        catch (err) {
            args.jobLog(JSON.stringify(err));
            if (pauseNodeIfAccessChecksFail) {
                yield pauseNode();
            }
            throw new Error(`Location not writeable:${location}`);
        }
    });
    if (fileAccessChecks) {
        args.jobLog('Checking file access');
        yield checkReadWrite(orignalFolder);
        yield checkReadWrite(args.librarySettings.cache);
    }
    else {
        args.jobLog('Skipping file access checks');
    }
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
});
exports.plugin = plugin;
