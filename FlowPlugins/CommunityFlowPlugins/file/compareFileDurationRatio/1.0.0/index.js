"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () => ({
    name: 'Compare File Duration Ratio',
    description: 'Compare file duration ratio of working file compared to original file using percentage.',
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
            label: 'Greater Than',
            name: 'greaterThan',
            type: 'number',
            defaultValue: '99.5',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Specify lower bound.'
                + 'Default value is 99.5% so new file duration must be at least 40% of original file duration.',
        },
        {
            label: 'Less Than',
            name: 'lessThan',
            type: 'number',
            defaultValue: '100.5',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Specify upper bound.'
                + ' Default value is 100.5% so new file duration must be at most 100.5% of original file duration.',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Working file duration % is within range',
        },
        {
            number: 2,
            tooltip: 'Working file duration % is smaller than lower bound',
        },
        {
            number: 3,
            tooltip: 'Working file duration % is larger than upper bound',
        },
    ],
});
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = (args) => {
    const lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    const getData = (obj) => {
        var _a, _b;
        try {
            if ((_b = (_a = obj === null || obj === void 0 ? void 0 : obj.ffProbeData) === null || _a === void 0 ? void 0 : _a.format) === null || _b === void 0 ? void 0 : _b.duration) {
                const dur = Number(obj.ffProbeData.format.duration);
                if (dur > 0) {
                    return dur;
                }
            }
        }
        catch (err) {
            // err
        }
        return 0;
    };
    const newFileDuration = getData(args.inputFileObj);
    const origFileDuration = getData(args.originalLibraryFile);
    args.jobLog(`newFileDuration: ${newFileDuration}`);
    args.jobLog(`origFileDuration: ${origFileDuration}`);
    const greaterThanPerc = Number(args.inputs.greaterThan);
    const lessThanPerc = Number(args.inputs.lessThan);
    const ratio = (newFileDuration / origFileDuration) * 100;
    const durationText = `New file has duration ${newFileDuration.toFixed(3)} which is ${ratio}% `
        + `of original file duration:  ${origFileDuration.toFixed(3)}`;
    const getBound = (bound) => (bound / 100) * origFileDuration;
    let outputNumber = 1;
    const errText = 'New file duration not within limits.';
    if (newFileDuration > getBound(lessThanPerc)) {
        // Item will be errored in UI
        args.jobLog(`${errText} ${durationText}. upperBound is ${lessThanPerc}%`);
        outputNumber = 3;
    }
    else if (newFileDuration < getBound(greaterThanPerc)) {
        // // Item will be errored in UI
        args.jobLog(`${errText} ${durationText}. lowerBound is ${greaterThanPerc}%`);
        outputNumber = 2;
    }
    else {
        args.jobLog(durationText);
    }
    return {
        outputFileObj: args.inputFileObj,
        outputNumber,
        variables: args.variables,
    };
};
exports.plugin = plugin;
