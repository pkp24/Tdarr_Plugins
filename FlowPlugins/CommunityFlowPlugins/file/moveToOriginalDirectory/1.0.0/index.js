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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
const fileMoveOrCopy_1 = __importDefault(require("../../../../FlowHelpers/1.0.0/fileMoveOrCopy"));
const fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () => ({
    name: 'Move To Original Directory',
    description: 'Move working file original directory.',
    style: {
        borderColor: 'green',
    },
    tags: '',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faArrowRight',
    inputs: [],
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
    const fileName = (0, fileUtils_1.getFileName)(args.inputFileObj._id);
    const container = (0, fileUtils_1.getContainer)(args.inputFileObj._id);
    const outputDir = (0, fileUtils_1.getFileAbosluteDir)(args.originalLibraryFile._id);
    const ouputFilePath = `${outputDir}/${fileName}.${container}`;
    if (args.inputFileObj._id === ouputFilePath) {
        args.jobLog('Input and output path are the same, skipping move.');
        return {
            outputFileObj: {
                _id: args.inputFileObj._id,
            },
            outputNumber: 1,
            variables: args.variables,
        };
    }
    yield (0, fileMoveOrCopy_1.default)({
        operation: 'move',
        sourcePath: args.inputFileObj._id,
        destinationPath: ouputFilePath,
        args,
    });
    return {
        outputFileObj: {
            _id: ouputFilePath,
        },
        outputNumber: 1,
        variables: args.variables,
    };
});
exports.plugin = plugin;
