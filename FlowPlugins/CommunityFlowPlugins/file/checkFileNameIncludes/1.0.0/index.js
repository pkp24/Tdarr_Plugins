"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
const fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () => ({
    name: 'Check File Name Includes',
    description: 'Check if a file name includes specific terms. Only needs to match one term',
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
            label: 'Terms',
            name: 'terms',
            type: 'string',
            defaultValue: '_720p,_1080p',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Specify terms to check for in file name using comma seperated list e.g. _720p,_1080p',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'File name contains terms',
        },
        {
            number: 2,
            tooltip: 'File name does not contains terms',
        },
    ],
});
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = (args) => {
    const lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    const fileName = `${(0, fileUtils_1.getFileName)(args.inputFileObj._id)}.${(0, fileUtils_1.getContainer)(args.inputFileObj._id)}`;
    const terms = String(args.inputs.terms).trim().split(',');
    let containsTerms = false;
    for (let i = 0; i < terms.length; i++) {
        if (fileName.includes(terms[i])) {
            containsTerms = true;
            break;
        }
    }
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: containsTerms ? 1 : 2,
        variables: args.variables,
    };
};
exports.plugin = plugin;
