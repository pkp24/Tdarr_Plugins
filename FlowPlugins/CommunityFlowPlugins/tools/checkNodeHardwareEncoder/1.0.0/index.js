"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
const hardwareUtils_1 = require("../../../../FlowHelpers/1.0.0/hardwareUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () => ({
    name: 'Check Node Hardware Encoder',
    description: `
  Check if node hardware encoder is available. Can also be used to check for specific hardware.
  For example:

  hevc_nvenc = Nvidia
  hevc_amf = AMD
  hevc_vaapi = Intel
  hevc_qsv = Intel
  hevc_videotoolbox = Apple
  `,
    style: {
        borderColor: 'orange',
    },
    tags: '',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faQuestion',
    inputs: [
        {
            label: 'Hardware Encoder',
            name: 'hardwareEncoder',
            type: 'string',
            defaultValue: 'hevc_nvenc',
            inputUI: {
                type: 'dropdown',
                options: [
                    'hevc_nvenc',
                    'hevc_amf',
                    'hevc_vaapi',
                    'hevc_qsv',
                    'hevc_videotoolbox',
                ],
            },
            tooltip: 'Specify hardware (based on encoder) to check for',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Node has hardware',
        },
        {
            number: 2,
            tooltip: 'Node does not have hardware',
        },
    ],
});
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = async (args) => {
    const lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    const { hardwareEncoder } = args.inputs;
    // eslint-disable-next-line no-await-in-loop
    const encoderProperties = await (0, hardwareUtils_1.getEncoder)({
        targetCodec: 'hevc',
        hardwareEncoding: true,
        hardwareType: 'auto',
        args,
    });
    const nodeHasHardware = encoderProperties.enabledDevices.some((row) => row.encoder === hardwareEncoder);
    args.jobLog(`Node has hardwareEncoder ${hardwareEncoder}: ${nodeHasHardware}`);
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: nodeHasHardware ? 1 : 2,
        variables: args.variables,
    };
};
exports.plugin = plugin;
