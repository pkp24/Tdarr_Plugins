"use strict";
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
const plugin = async (args) => {
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
    const res = await cli.runCli();
    if (res.cliExitCode !== 0) {
        args.jobLog('Running Apprise failed');
        throw new Error('Running Apprise failed');
    }
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;
