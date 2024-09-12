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
const fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () => ({
    name: 'Check File Exists',
    description: 'Check file Exists',
    style: {
        borderColor: 'orange',
    },
    tags: 'video',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faQuestion',
    inputs: [
        {
            label: 'File To Check',
            name: 'fileToCheck',
            type: 'string',
            // eslint-disable-next-line no-template-curly-in-string
            defaultValue: '${fileName}_720p.${container}',
            inputUI: {
                type: 'text',
            },
            // eslint-disable-next-line no-template-curly-in-string
            tooltip: 'Specify file to check using templating e.g. ${fileName}_720p.${container}',
        },
        {
            label: 'Directory',
            name: 'directory',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'directory',
            },
            tooltip: 'Specify directory to check. Leave blank to use working directory.'
                + ' Put below Input File plugin to check original file directory.',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'File exists',
        },
        {
            number: 2,
            tooltip: 'File does not exist',
        },
    ],
});
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = (args) => __awaiter(void 0, void 0, void 0, function* () {
    const lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    const directory = String(args.inputs.directory).trim() || (0, fileUtils_1.getFileAbosluteDir)(args.inputFileObj._id);
    const fileName = (0, fileUtils_1.getFileName)(args.inputFileObj._id);
    let fileToCheck = String(args.inputs.fileToCheck).trim();
    fileToCheck = fileToCheck.replace(/\${fileName}/g, fileName);
    fileToCheck = fileToCheck.replace(/\${container}/g, (0, fileUtils_1.getContainer)(args.inputFileObj._id));
    fileToCheck = `${directory}/${fileToCheck}`;
    let fileDoesExist = false;
    if (yield (0, fileUtils_1.fileExists)(fileToCheck)) {
        fileDoesExist = true;
        args.jobLog(`File exists: ${fileToCheck}`);
    }
    else {
        args.jobLog(`File does not exist: ${fileToCheck}`);
    }
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: fileDoesExist ? 1 : 2,
        variables: args.variables,
    };
});
exports.plugin = plugin;
