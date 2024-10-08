"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runClassicPlugin = void 0;
const fs_1 = require("fs");
const fileUtils_1 = require("./fileUtils");
const runClassicPlugin = async (args, type) => {
    const path = require('path');
    const pluginSourceId = String(args.inputs.pluginSourceId);
    const parts = pluginSourceId.split(':');
    const pluginSource = parts[0];
    const pluginId = parts[1];
    const relativePluginPath = `../../../${pluginSource}/${pluginId}.js`;
    const absolutePath = path.resolve(__dirname, relativePluginPath);
    let classicPlugin;
    let pluginSrcStr = '';
    if (pluginSource === 'Community') {
        classicPlugin = args.deps.importFresh(relativePluginPath);
        pluginSrcStr = await fs_1.promises.readFile(absolutePath, 'utf8');
    }
    else {
        // eslint-disable-next-line no-await-in-loop
        const res = await args.deps.axiosMiddleware('api/v2/read-plugin', {
            plugin: {
                id: pluginId,
                source: pluginSource,
            },
        });
        classicPlugin = args.deps.requireFromString(res.pluginRaw, absolutePath);
        pluginSrcStr = res.pluginRaw;
    }
    if (type === 'filter' && classicPlugin.details().Operation !== 'Filter') {
        throw new Error(`${'This plugin is meant for classic plugins that have '
            + 'Operation: Filter. This classic plugin has Operation: '}${classicPlugin.details().Operation}`
            + '. Please use the Run Classic Transcode Flow Plugin plugin instead.');
    }
    if (type !== 'filter' && classicPlugin.details().Operation === 'Filter') {
        throw new Error(`${'This plugin is meant for classic plugins that have '
            + 'Operation: Transcode. This classic plugin has Operation: '}${classicPlugin.details().Operation}`
            + 'Please use the Run Classic Filter Flow Plugin plugin instead.');
    }
    if (Array.isArray(classicPlugin.dependencies)) {
        if (args.installClassicPluginDeps) {
            args.jobLog(`Installing dependencies for ${pluginSourceId}`);
            await args.installClassicPluginDeps(classicPlugin.dependencies);
        }
        else {
            args.jobLog(`Not installing dependencies for ${pluginSourceId}, please update Tdarr`);
        }
    }
    else {
        args.jobLog(`No depedencies to install for ${pluginSourceId}`);
    }
    const container = (0, fileUtils_1.getContainer)(args.inputFileObj._id);
    const cacheFilePath = `${(0, fileUtils_1.getPluginWorkDir)(args)}/${(0, fileUtils_1.getFileName)(args.inputFileObj._id)}.${container}`;
    const scanTypes = (0, fileUtils_1.getScanTypes)([pluginSrcStr]);
    let pluginInputFileObj;
    let originalLibraryFile;
    const inputFileScanArgs = {
        _id: args.inputFileObj._id,
        file: args.inputFileObj.file,
        DB: args.inputFileObj.DB,
        footprintId: args.inputFileObj.footprintId,
    };
    const originalLibraryFileScanArgs = {
        _id: args.originalLibraryFile._id,
        file: args.originalLibraryFile.file,
        DB: args.originalLibraryFile.DB,
        footprintId: args.originalLibraryFile.footprintId,
    };
    // added in 2.19.01
    if (typeof args.scanIndividualFile !== 'undefined') {
        args.jobLog('Scanning files using Node');
        pluginInputFileObj = await args.scanIndividualFile(inputFileScanArgs, scanTypes);
        originalLibraryFile = await args.scanIndividualFile(originalLibraryFileScanArgs, scanTypes);
    }
    else {
        args.jobLog('Scanning files using Server API');
        pluginInputFileObj = await args.deps.axiosMiddleware('api/v2/scan-individual-file', {
            file: inputFileScanArgs,
            scanTypes,
        });
        originalLibraryFile = await args.deps.axiosMiddleware('api/v2/scan-individual-file', {
            file: originalLibraryFileScanArgs,
            scanTypes,
        });
    }
    const otherArguments = {
        handbrakePath: args.handbrakePath,
        ffmpegPath: args.ffmpegPath,
        mkvpropeditPath: args.mkvpropeditPath,
        originalLibraryFile,
        nodeHardwareType: args.nodeHardwareType,
        pluginCycle: 0,
        workerType: args.workerType,
        version: args.config.version,
        platform_arch_isdocker: args.platform_arch_isdocker,
        cacheFilePath,
        job: args.job,
    };
    const result = await classicPlugin.plugin(pluginInputFileObj, args.librarySettings, args.inputs, otherArguments);
    if (result?.file?._id && args.inputFileObj._id !== result.file._id) {
        args.jobLog(`File ID changed from ${args.inputFileObj._id} to ${result.file._id}`);
        // eslint-disable-next-line no-param-reassign
        args.inputFileObj._id = result.file._id;
        // eslint-disable-next-line no-param-reassign
        args.inputFileObj.file = result.file.file;
    }
    return {
        result,
        cacheFilePath,
        absolutePath,
    };
};
exports.runClassicPlugin = runClassicPlugin;
