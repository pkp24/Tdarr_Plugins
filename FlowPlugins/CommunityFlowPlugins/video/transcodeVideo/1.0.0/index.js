"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
const fs_1 = require("fs");
const fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () => ({
    name: 'Transcode Video File',
    description: 'Transcode a video file using ffmpeg. GPU transcoding will be used if possible.',
    style: {
        borderColor: '#6efefc',
        opacity: 0.5,
    },
    tags: '',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: '',
    inputs: [
        {
            label: 'Target Codec',
            name: 'target_codec',
            type: 'string',
            defaultValue: 'hevc',
            inputUI: {
                type: 'dropdown',
                options: [
                    'hevc',
                    // 'vp9',
                    'h264',
                    // 'vp8',
                ],
            },
            tooltip: 'Specify the codec to use',
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
    const oldFile = args.inputFileObj._id;
    const newFile = `${args.inputFileObj._id}.tmp`;
    if (await (0, fileUtils_1.fileExists)(newFile)) {
        await fs_1.promises.unlink(newFile);
    }
    await fs_1.promises.copyFile(oldFile, newFile);
    return {
        outputFileObj: { _id: newFile },
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;
