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
const fs_1 = require("fs");
const fileUtils_1 = require("./fileUtils");
const getSizeBytes = (fPath) => __awaiter(void 0, void 0, void 0, function* () {
    let size = 0;
    try {
        size = yield (0, fileUtils_1.getFileSize)(fPath);
    }
    catch (err) {
        // err
    }
    return size;
});
const compareOldNew = ({ sourceFileSize, destinationSize, args, }) => {
    if (destinationSize !== sourceFileSize) {
        args.jobLog(`After move/copy, destination file of size ${destinationSize} does not match`
            + ` cache file of size ${sourceFileSize}`);
    }
    else {
        args.jobLog(`After move/copy, destination file of size ${destinationSize} does match`
            + ` cache file of size ${sourceFileSize}`);
    }
};
const tryMove = (_a) => __awaiter(void 0, [_a], void 0, function* ({ sourcePath, destinationPath, sourceFileSize, args, }) {
    args.jobLog(`Attempting move from ${sourcePath} to ${destinationPath}, method 1`);
    let error = false;
    try {
        yield fs_1.promises.rename(sourcePath, destinationPath);
    }
    catch (err) {
        error = true;
        args.jobLog(`File move error: ${JSON.stringify(err)}`);
    }
    const destinationSize = yield getSizeBytes(destinationPath);
    compareOldNew({
        sourceFileSize,
        destinationSize,
        args,
    });
    if (error || destinationSize !== sourceFileSize) {
        return false;
    }
    return true;
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const tryMvdir = (_a) => __awaiter(void 0, [_a], void 0, function* ({ sourcePath, destinationPath, sourceFileSize, args, }) {
    args.jobLog(`Attempting move from ${sourcePath} to ${destinationPath}, method 2`);
    let error = false;
    yield new Promise((resolve) => {
        // fs-extra and move-file don't work when destination is on windows root of drive
        // mvdir will try to move else fall back to copy/unlink
        // potential bug on unraid
        args.deps.mvdir(sourcePath, destinationPath, { overwrite: true })
            .then(() => {
            resolve(true);
        }).catch((err) => {
            error = true;
            args.jobLog(`File move error: ${err}`);
            resolve(err);
        });
    });
    const destinationSize = yield getSizeBytes(destinationPath);
    compareOldNew({
        sourceFileSize,
        destinationSize,
        args,
    });
    if (error || destinationSize !== sourceFileSize) {
        return false;
    }
    return true;
});
// Keep in e.g. https://github.com/HaveAGitGat/Tdarr/issues/858
const tyNcp = (_a) => __awaiter(void 0, [_a], void 0, function* ({ sourcePath, destinationPath, sourceFileSize, args, }) {
    // added in 2.14.01
    if (args.deps.ncp) {
        args.jobLog(`Attempting copy from ${sourcePath} to ${destinationPath} , method 1`);
        let error = false;
        yield new Promise((resolve) => {
            args.deps.ncp(sourcePath, destinationPath, (err) => {
                if (err) {
                    error = true;
                    args.jobLog(`File copy error: ${err}`);
                    resolve(err);
                }
                else {
                    resolve(true);
                }
            });
        });
        const destinationSize = yield getSizeBytes(destinationPath);
        compareOldNew({
            sourceFileSize,
            destinationSize,
            args,
        });
        if (error || destinationSize !== sourceFileSize) {
            return false;
        }
        return true;
    }
    return false;
});
const tryNormalCopy = (_a) => __awaiter(void 0, [_a], void 0, function* ({ sourcePath, destinationPath, sourceFileSize, args, }) {
    args.jobLog(`Attempting copy from ${sourcePath} to ${destinationPath} , method 2`);
    let error = false;
    try {
        yield fs_1.promises.copyFile(sourcePath, destinationPath);
    }
    catch (err) {
        error = true;
        args.jobLog(`File copy error: ${JSON.stringify(err)}`);
    }
    const destinationSize = yield getSizeBytes(destinationPath);
    compareOldNew({
        sourceFileSize,
        destinationSize,
        args,
    });
    if (error || destinationSize !== sourceFileSize) {
        return false;
    }
    return true;
});
const cleanSourceFile = (_a) => __awaiter(void 0, [_a], void 0, function* ({ args, sourcePath, }) {
    try {
        args.jobLog(`Deleting source file ${sourcePath}`);
        yield fs_1.promises.unlink(sourcePath);
    }
    catch (err) {
        args.jobLog(`Failed to delete source file ${sourcePath}: ${JSON.stringify(err)}`);
    }
});
const fileMoveOrCopy = (_a) => __awaiter(void 0, [_a], void 0, function* ({ operation, sourcePath, destinationPath, args, }) {
    args.jobLog('Calculating cache file size in bytes');
    const sourceFileSize = yield getSizeBytes(sourcePath);
    args.jobLog(`${sourceFileSize}`);
    if (operation === 'move') {
        const moved = yield tryMove({
            sourcePath,
            destinationPath,
            args,
            sourceFileSize,
        });
        if (moved) {
            return true;
        }
        // disable: https://github.com/HaveAGitGat/Tdarr/issues/885
        // const mvdird = await tryMvdir({
        //   sourcePath,
        //   destinationPath,
        //   args,
        //   sourceFileSize,
        // });
        // if (mvdird) {
        //   return true;
        // }
        args.jobLog('Failed to move file, trying copy');
    }
    const ncpd = yield tyNcp({
        sourcePath,
        destinationPath,
        args,
        sourceFileSize,
    });
    if (ncpd) {
        if (operation === 'move') {
            yield cleanSourceFile({
                args,
                sourcePath,
            });
        }
        return true;
    }
    const copied = yield tryNormalCopy({
        sourcePath,
        destinationPath,
        args,
        sourceFileSize,
    });
    if (copied) {
        if (operation === 'move') {
            yield cleanSourceFile({
                args,
                sourcePath,
            });
        }
        return true;
    }
    throw new Error(`Failed to ${operation} file`);
});
exports.default = fileMoveOrCopy;
