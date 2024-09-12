"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () => ({
    name: 'Check Channel Count',
    description: 'Check streams for specified channel count',
    style: {
        borderColor: 'orange',
    },
    tags: 'audio',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faQuestion',
    inputs: [
        {
            label: 'Channel Count',
            name: 'channelCount',
            type: 'number',
            defaultValue: '2',
            inputUI: {
                type: 'dropdown',
                options: [
                    '1',
                    '2',
                    '6',
                    '8',
                ],
            },
            tooltip: 'Specify channel count to check for',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'File has stream with specified channel count',
        },
        {
            number: 2,
            tooltip: 'File does not have stream with specified channel count',
        },
    ],
});
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = (args) => {
    var _a, _b;
    const lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    const channelCount = Number(args.inputs.channelCount);
    let hasSpecifiedChannelCount = false;
    args.jobLog(`Checking for ${channelCount} channels`);
    if (Array.isArray((_b = (_a = args === null || args === void 0 ? void 0 : args.inputFileObj) === null || _a === void 0 ? void 0 : _a.ffProbeData) === null || _b === void 0 ? void 0 : _b.streams)) {
        for (let i = 0; i < args.inputFileObj.ffProbeData.streams.length; i += 1) {
            const stream = args.inputFileObj.ffProbeData.streams[i];
            args.jobLog(`Stream ${i} has ${stream.channels} channels`);
            if (stream.channels === channelCount) {
                hasSpecifiedChannelCount = true;
            }
        }
    }
    else {
        throw new Error('File has no stream data');
    }
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: hasSpecifiedChannelCount ? 1 : 2,
        variables: args.variables,
    };
};
exports.plugin = plugin;
