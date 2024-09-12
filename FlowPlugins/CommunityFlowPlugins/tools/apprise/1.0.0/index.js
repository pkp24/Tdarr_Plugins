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
const cliUtils_1 = require("../../../../FlowHelpers/1.0.0/cliUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () => ({
    name: 'Apprise',
    description: 'Use Apprise to send notifications.',
    style: {
        borderColor: 'green',
    },
    tags: '',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.18.01',
    sidebarPosition: -1,
    icon: 'faBell',
    inputs: [
        {
            label: 'Command',
            name: 'command',
            type: 'string',
            defaultValue: '-vv -t "Success" -b "File {{{args.inputFileObj._id}}}" "discord://xxx/xxxx"',
            inputUI: {
                type: 'textarea',
                style: {
                    height: '100px',
                },
            },
            tooltip: `Visit the following for more information on Apprise: https://github.com/caronc/apprise
      \\nExample\\n
     -vv -t "Success" -b "File {{{args.inputFileObj._id}}}" "discord://xxx/xxxx"


     \\nExample\\n
     -vv -t "Processing" -b "File {{{args.inputFileObj._id}}}" `
                + `"discord://{{{args.userVariables.global.discord_webhook}}}"
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
const plugin = (args) => __awaiter(void 0, void 0, void 0, function* () {
    const lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    const { command } = args.inputs;
    const cliArgs = [
        ...args.deps.parseArgsStringToArgv(command, '', ''),
    ];
    const cli = new cliUtils_1.CLI({
        cli: 'apprise',
        spawnArgs: cliArgs,
        spawnOpts: {},
        jobLog: args.jobLog,
        outputFilePath: '',
        inputFileObj: args.inputFileObj,
        logFullCliOutput: args.logFullCliOutput,
        updateWorker: args.updateWorker,
        args,
    });
    const res = yield cli.runCli();
    if (res.cliExitCode !== 0) {
        args.jobLog('Running Apprise failed');
        throw new Error('Running Apprise failed');
    }
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
});
exports.plugin = plugin;
