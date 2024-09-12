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
const plugin = (args) => __awaiter(void 0, void 0, void 0, function* () {
    const lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    const outcome = yield (0, classicPlugins_1.runClassicPlugin)(args, 'filter');
    const { result } = outcome;
    args.jobLog(JSON.stringify(result, null, 2));
    const outputNumber = (result === null || result === void 0 ? void 0 : result.processFile) ? 1 : 2;
    return {
        outputFileObj: args.inputFileObj,
        outputNumber,
        variables: args.variables,
    };
});
exports.plugin = plugin;
