"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
const classicPlugins_1 = require("../../../../FlowHelpers/1.0.0/classicPlugins");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () => ({
    name: 'Run Classic Filter Plugin',
    description: 'Run one of Tdarr\'s classic plugins that has Operation: Filter',
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
            label: 'Plugin Source ID',
            name: 'pluginSourceId',
            type: 'string',
            defaultValue: 'Community:Tdarr_Plugin_00td_filter_by_codec',
            inputUI: {
                type: 'dropdown',
                options: [],
            },
            tooltip: 'Specify the classic plugin ID',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'File met conditions, would traditionally continue to next plugin in plugin stack',
        },
        {
            number: 2,
            tooltip: 'File did not meet conditions, would traditionally break out of plugin stack',
        },
    ],
});
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = async (args) => {
    const lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    const outcome = await (0, classicPlugins_1.runClassicPlugin)(args, 'filter');
    const { result } = outcome;
    args.jobLog(JSON.stringify(result, null, 2));
    const outputNumber = result?.processFile ? 1 : 2;
    return {
        outputFileObj: args.inputFileObj,
        outputNumber,
        variables: args.variables,
    };
};
exports.plugin = plugin;
