"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const fileUtils_1 = require("./fileUtils");
const getSizeBytes = async (fPath) => {
    let size = 0;
    try {
        size = await (0, fileUtils_1.getFileSize)(fPath);
    }
    catch (err) {
        // err
    }
    return size;
};
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
const tryMove = async ({ sourcePath, destinationPath, sourceFileSize, args, }) => {
    args.jobLog(`Attempting move from ${sourcePath} to ${destinationPath}, method 1`);
    let error = false;
    try {
        await fs_1.promises.rename(sourcePath, destinationPath);
    }
    catch (err) {
        error = true;
        args.jobLog(`File move error: ${JSON.stringify(err)}`);
    }
    const destinationSize = await getSizeBytes(destinationPath);
    compareOldNew({
        sourceFileSize,
        destinationSize,
        args,
    });
    if (error || destinationSize !== sourceFileSize) {
        return false;
    }
    return true;
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const tryMvdir = async ({ sourcePath, destinationPath, sourceFileSize, args, }) => {
    args.jobLog(`Attempting move from ${sourcePath} to ${destinationPath}, method 2`);
    let error = false;
    await new Promise((resolve) => {
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
    const destinationSize = await getSizeBytes(destinationPath);
    compareOldNew({
        sourceFileSize,
        destinationSize,
        args,
    });
    if (error || destinationSize !== sourceFileSize) {
        return false;
    }
    return true;
};
// Keep in e.g. https://github.com/HaveAGitGat/Tdarr/issues/858
const tyNcp = async ({ sourcePath, destinationPath, sourceFileSize, args, }) => {
    // added in 2.14.01
    if (args.deps.ncp) {
        args.jobLog(`Attempting copy from ${sourcePath} to ${destinationPath} , method 1`);
        let error = false;
        await new Promise((resolve) => {
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
        const destinationSize = await getSizeBytes(destinationPath);
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
};
const tryNormalCopy = async ({ sourcePath, destinationPath, sourceFileSize, args, }) => {
    args.jobLog(`Attempting copy from ${sourcePath} to ${destinationPath} , method 2`);
    let error = false;
    try {
        await fs_1.promises.copyFile(sourcePath, destinationPath);
    }
    catch (err) {
        error = true;
        args.jobLog(`File copy error: ${JSON.stringify(err)}`);
    }
    const destinationSize = await getSizeBytes(destinationPath);
    compareOldNew({
        sourceFileSize,
        destinationSize,
        args,
    });
    if (error || destinationSize !== sourceFileSize) {
        return false;
    }
    return true;
};
const cleanSourceFile = async ({ args, sourcePath, }) => {
    try {
        args.jobLog(`Deleting source file ${sourcePath}`);
        await fs_1.promises.unlink(sourcePath);
    }
    catch (err) {
        args.jobLog(`Failed to delete source file ${sourcePath}: ${JSON.stringify(err)}`);
    }
};
const fileMoveOrCopy = async ({ operation, sourcePath, destinationPath, args, }) => {
    args.jobLog('Calculating cache file size in bytes');
    const sourceFileSize = await getSizeBytes(sourcePath);
    args.jobLog(`${sourceFileSize}`);
    if (operation === 'move') {
        const moved = await tryMove({
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
    const ncpd = await tyNcp({
        sourcePath,
        destinationPath,
        args,
        sourceFileSize,
    });
    if (ncpd) {
        if (operation === 'move') {
            await cleanSourceFile({
                args,
                sourcePath,
            });
        }
        return true;
    }
    const copied = await tryNormalCopy({
        sourcePath,
        destinationPath,
        args,
        sourceFileSize,
    });
    if (copied) {
        if (operation === 'move') {
            await cleanSourceFile({
                args,
                sourcePath,
            });
        }
        return true;
    }
    throw new Error(`Failed to ${operation} file`);
};
exports.default = fileMoveOrCopy;
