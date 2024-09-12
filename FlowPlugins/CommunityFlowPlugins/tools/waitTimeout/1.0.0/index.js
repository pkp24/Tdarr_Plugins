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
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () => ({
    name: 'Wait',
    description: 'Wait for a specified amount of time before continuing to the next plugin',
    style: {
        borderColor: 'yellow',
    },
    tags: '',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faClock',
    inputs: [
        {
            label: 'Amount',
            name: 'amount',
            type: 'string',
            defaultValue: '1',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Specify the amount of time to wait',
        },
        {
            label: 'Unit',
            name: 'unit',
            type: 'string',
            defaultValue: 'seconds',
            inputUI: {
                type: 'dropdown',
                options: [
                    'seconds',
                    'minutes',
                    'hours',
                ],
            },
            tooltip: 'Specify the unit of time to wait',
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
    const { amount, unit, } = args.inputs;
    const amountNum = Number(amount);
    if (Number.isNaN(amountNum)) {
        throw new Error('Amount must be a number');
    }
    let multiplier = 1;
    if (unit === 'seconds') {
        multiplier = 1000;
    }
    else if (unit === 'minutes') {
        multiplier = 60000;
    }
    else if (unit === 'hours') {
        multiplier = 3600000;
    }
    const waitTime = amountNum * multiplier;
    args.jobLog(`Waiting for ${amount} ${unit}`);
    args.jobLog(`Waiting for ${waitTime} milliseconds`);
    let finished = false;
    const logWait = () => {
        if (!finished) {
            args.jobLog('Waiting...');
            setTimeout(logWait, 5000);
        }
    };
    logWait();
    yield new Promise((resolve) => setTimeout(resolve, waitTime));
    finished = true;
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
});
exports.plugin = plugin;
