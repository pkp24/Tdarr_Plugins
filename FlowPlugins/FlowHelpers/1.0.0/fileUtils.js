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
exports.getScanTypes = exports.getPluginWorkDir = exports.moveFileAndValidate = exports.getFileSize = exports.getSubStem = exports.getFfType = exports.getFileAbosluteDir = exports.getFileName = exports.getContainer = exports.fileExists = void 0;
const fs_1 = require("fs");
const fileExists = (path) => __awaiter(void 0, void 0, void 0, function* () { return !!(yield fs_1.promises.stat(path).catch(() => false)); });
exports.fileExists = fileExists;
const getContainer = (filePath) => {
    const parts = filePath.split('.');
    return parts[parts.length - 1];
};
exports.getContainer = getContainer;
const getFileName = (filePath) => {
    const parts = filePath.split('/');
    const fileNameAndContainer = parts[parts.length - 1];
    const parts2 = fileNameAndContainer.split('.');
    parts2.pop();
    return parts2.join('.');
};
exports.getFileName = getFileName;
const getFileAbosluteDir = (filePath) => {
    const parts = filePath.split('/');
    parts.pop();
    return parts.join('/');
};
exports.getFileAbosluteDir = getFileAbosluteDir;
const getFfType = (codecType) => (codecType === 'video' ? 'v' : 'a');
exports.getFfType = getFfType;
const getSubStem = ({ inputPathStem, inputPath, }) => {
    const subStem = inputPath.substring(inputPathStem.length);
    const parts = subStem.split('/');
    parts.pop();
    return parts.join('/');
};
exports.getSubStem = getSubStem;
const getFileSize = (file) => __awaiter(void 0, void 0, void 0, function* () {
    const stats = yield fs_1.promises.stat(file);
    const { size } = stats;
    return size;
});
exports.getFileSize = getFileSize;
const moveFileAndValidate = (_a) => __awaiter(void 0, [_a], void 0, function* ({ inputPath, outputPath, args, }) {
    const inputSize = yield (0, exports.getFileSize)(inputPath);
    args.jobLog(`Attempt 1: Moving file from ${inputPath} to ${outputPath}`);
    const res1 = yield new Promise((resolve) => {
        args.deps.gracefulfs.rename(inputPath, outputPath, (err) => {
            if (err) {
                args.jobLog(`Failed to move file from ${inputPath} to ${outputPath}`);
                args.jobLog(JSON.stringify(err));
                resolve(false);
            }
            else {
                resolve(true);
            }
        });
    });
    let outputSize = 0;
    try {
        outputSize = yield (0, exports.getFileSize)(outputPath);
    }
    catch (err) {
        args.jobLog(JSON.stringify(err));
    }
    if (!res1 || inputSize !== outputSize) {
        if (inputSize !== outputSize) {
            args.jobLog(`File sizes do not match, input: ${inputSize} `
                + `does not equal  output: ${outputSize}`);
        }
        args.jobLog(`Attempt 1  failed: Moving file from ${inputPath} to ${outputPath}`);
        args.jobLog(`Attempt 2: Moving file from ${inputPath} to ${outputPath}`);
        const res2 = yield new Promise((resolve) => {
            args.deps.mvdir(inputPath, outputPath, { overwrite: true })
                .then(() => {
                resolve(true);
            }).catch((err) => {
                args.jobLog(`Failed to move file from ${inputPath} to ${outputPath}`);
                args.jobLog(JSON.stringify(err));
                resolve(false);
            });
        });
        outputSize = yield (0, exports.getFileSize)(outputPath);
        if (!res2 || inputSize !== outputSize) {
            if (inputSize !== outputSize) {
                args.jobLog(`File sizes do not match, input: ${inputSize} `
                    + `does not equal  output: ${outputSize}`);
            }
            const errMessage = `Failed to move file from ${inputPath} to ${outputPath}, check errors above`;
            args.jobLog(errMessage);
            throw new Error(errMessage);
        }
    }
});
exports.moveFileAndValidate = moveFileAndValidate;
const getPluginWorkDir = (args) => {
    const pluginWorkDir = `${args.workDir}/${new Date().getTime()}`;
    args.deps.fsextra.ensureDirSync(pluginWorkDir);
    return pluginWorkDir;
};
exports.getPluginWorkDir = getPluginWorkDir;
const getScanTypes = (pluginsTextRaw) => {
    const scanTypes = {
        exifToolScan: true,
        mediaInfoScan: false,
        closedCaptionScan: false,
    };
    const scannerTypes = [
        // needed for frame and duration data for ffmpeg
        // {
        //   type: 'exifToolScan',
        //   terms: [
        //     'meta',
        //   ],
        // },
        {
            type: 'mediaInfoScan',
            terms: [
                'mediaInfo',
            ],
        },
        {
            type: 'closedCaptionScan',
            terms: [
                'hasClosedCaptions',
            ],
        },
    ];
    const text = pluginsTextRaw.join('');
    scannerTypes.forEach((scanner) => {
        scanner.terms.forEach((term) => {
            if (text.includes(term)) {
                scanTypes[scanner.type] = true;
            }
        });
    });
    return scanTypes;
};
exports.getScanTypes = getScanTypes;
