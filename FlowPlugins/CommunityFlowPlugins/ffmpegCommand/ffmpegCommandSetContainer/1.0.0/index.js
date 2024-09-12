"use strict";
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
const fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
const flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
/* eslint-disable no-param-reassign */
const details = () => ({
    name: 'Set Container',
    description: 'Set the container of the output file',
    style: {
        borderColor: '#6efefc',
    },
    tags: 'video',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: '',
    inputs: [
        {
            label: 'Container',
            name: 'container',
            type: 'string',
            defaultValue: 'mkv',
            inputUI: {
                type: 'dropdown',
                options: [
                    'mkv',
                    'mp4',
                ],
            },
            tooltip: 'Specify the container to use',
        },
        {
            label: 'Force Conform',
            name: 'forceConform',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: `
Specify if you want to force conform the file to the new container,
This is useful if not all streams are supported by the new container. 
For example mkv does not support data streams.
      `,
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
const plugin = (args) => {
    const lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    (0, flowUtils_1.checkFfmpegCommandInit)(args);
    const newContainer = String(args.inputs.container);
    const { forceConform } = args.inputs;
    if ((0, fileUtils_1.getContainer)(args.inputFileObj._id) !== newContainer) {
        args.variables.ffmpegCommand.container = newContainer;
        args.variables.ffmpegCommand.shouldProcess = true;
        if (forceConform === true) {
            for (let i = 0; i < args.variables.ffmpegCommand.streams.length; i += 1) {
                const stream = args.variables.ffmpegCommand.streams[i];
                try {
                    const codecType = stream.codec_type.toLowerCase();
                    const codecName = stream.codec_name.toLowerCase();
                    if (newContainer === 'mkv') {
                        if (codecType === 'data'
                            || [
                                'mov_text',
                                'eia_608',
                                'timed_id3',
                            ].includes(codecName)) {
                            stream.removed = true;
                        }
                    }
                    if (newContainer === 'mp4') {
                        if (codecType === 'attachment'
                            || [
                                'hdmv_pgs_subtitle',
                                'eia_608',
                                'timed_id3',
                                'subrip',
                                'ass',
                                'ssa',
                            ].includes(codecName)) {
                            stream.removed = true;
                        }
                    }
                }
                catch (err) {
                    // Error
                }
            }
        }
        // handle genpts if coming from odd container
        const container = args.inputFileObj.container.toLowerCase();
        if ([
            'ts',
            'avi',
            'mpg',
            'mpeg',
        ].includes(container)) {
            args.variables.ffmpegCommand.overallOuputArguments.push('-fflags', '+genpts');
        }
    }
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;
