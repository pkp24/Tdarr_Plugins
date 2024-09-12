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
const details = () => ({
    name: 'Apply Radarr or Sonarr naming policy',
    description: 'Apply Radarr or Sonarr naming policy to a file. This plugin should be called after the original file has been '
        + 'replaced and Radarr or Sonarr has been notified. Radarr or Sonarr should also be notified after this plugin.',
    style: {
        borderColor: 'green',
    },
    tags: '',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faPenToSquare',
    inputs: [
        {
            label: 'Arr',
            name: 'arr',
            type: 'string',
            defaultValue: 'radarr',
            inputUI: {
                type: 'dropdown',
                options: ['radarr', 'sonarr'],
            },
            tooltip: 'Specify which arr to use',
        },
        {
            label: 'Arr API Key',
            name: 'arr_api_key',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Input your arr api key here',
        },
        {
            label: 'Arr Host',
            name: 'arr_host',
            type: 'string',
            defaultValue: 'http://192.168.1.1:7878',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Input your arr host here.'
                + '\\nExample:\\n'
                + 'http://192.168.1.1:7878\\n'
                + 'http://192.168.1.1:8989\\n'
                + 'https://radarr.domain.com\\n'
                + 'https://sonarr.domain.com\\n',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Radarr or Sonarr notified',
        },
        {
            number: 2,
            tooltip: 'Radarr or Sonarr do not know this file',
        },
    ],
});
exports.details = details;
const getFileInfoFromLookup = (args, arrApp, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let fInfo = { id: '-1' };
    const imdbId = (_b = (_a = /\b(tt|nm|co|ev|ch|ni)\d{7,10}?\b/i.exec(fileName)) === null || _a === void 0 ? void 0 : _a.at(0)) !== null && _b !== void 0 ? _b : '';
    if (imdbId !== '') {
        const lookupResponse = yield args.deps.axios({
            method: 'get',
            url: `${arrApp.host}/api/v3/${arrApp.name === 'radarr' ? 'movie' : 'series'}/lookup?term=imdb:${imdbId}`,
            headers: arrApp.headers,
        });
        fInfo = arrApp.delegates.getFileInfoFromLookupResponse(lookupResponse, fileName);
        args.jobLog(`${arrApp.content} ${fInfo.id !== '-1' ? `'${fInfo.id}' found` : 'not found'}`
            + ` for imdb '${imdbId}'`);
    }
    return fInfo;
});
const getFileInfoFromParse = (args, arrApp, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    let fInfo = { id: '-1' };
    const parseResponse = yield args.deps.axios({
        method: 'get',
        url: `${arrApp.host}/api/v3/parse?title=${encodeURIComponent((0, fileUtils_1.getFileName)(fileName))}`,
        headers: arrApp.headers,
    });
    fInfo = arrApp.delegates.getFileInfoFromParseResponse(parseResponse);
    args.jobLog(`${arrApp.content} ${fInfo.id !== '-1' ? `'${fInfo.id}' found` : 'not found'}`
        + ` for '${(0, fileUtils_1.getFileName)(fileName)}'`);
    return fInfo;
});
const getFileInfo = (args, arrApp, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    const fInfo = yield getFileInfoFromLookup(args, arrApp, fileName);
    return (fInfo.id === '-1' || (arrApp.name === 'sonarr' && (fInfo.seasonNumber === -1 || fInfo.episodeNumber === -1)))
        ? getFileInfoFromParse(args, arrApp, fileName)
        : fInfo;
});
const plugin = (args) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    let newPath = '';
    let isSuccessful = false;
    const arr = String(args.inputs.arr);
    const arr_host = String(args.inputs.arr_host).trim();
    const arrHost = arr_host.endsWith('/') ? arr_host.slice(0, -1) : arr_host;
    const originalFileName = (_b = (_a = args.originalLibraryFile) === null || _a === void 0 ? void 0 : _a._id) !== null && _b !== void 0 ? _b : '';
    const currentFileName = (_d = (_c = args.inputFileObj) === null || _c === void 0 ? void 0 : _c._id) !== null && _d !== void 0 ? _d : '';
    const headers = {
        'Content-Type': 'application/json',
        'X-Api-Key': String(args.inputs.arr_api_key),
        Accept: 'application/json',
    };
    const arrApp = arr === 'radarr'
        ? {
            name: arr,
            host: arrHost,
            headers,
            content: 'Movie',
            delegates: {
                getFileInfoFromLookupResponse: (lookupResponse) => { var _a, _b, _c; return ({ id: String((_c = (_b = (_a = lookupResponse === null || lookupResponse === void 0 ? void 0 : lookupResponse.data) === null || _a === void 0 ? void 0 : _a.at(0)) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : -1) }); },
                getFileInfoFromParseResponse: (parseResponse) => { var _a, _b, _c; return ({ id: String((_c = (_b = (_a = parseResponse === null || parseResponse === void 0 ? void 0 : parseResponse.data) === null || _a === void 0 ? void 0 : _a.movie) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : -1) }); },
                buildPreviewRenameResquestUrl: (fInfo) => `${arrHost}/api/v3/rename?movieId=${fInfo.id}`,
                getFileToRenameFromPreviewRenameResponse: (previewRenameResponse) => { var _a; return (_a = previewRenameResponse.data) === null || _a === void 0 ? void 0 : _a.at(0); },
            },
        }
        : {
            name: arr,
            host: arrHost,
            headers,
            content: 'Serie',
            delegates: {
                getFileInfoFromLookupResponse: (lookupResponse, fileName) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                    const fInfo = { id: String((_c = (_b = (_a = lookupResponse === null || lookupResponse === void 0 ? void 0 : lookupResponse.data) === null || _a === void 0 ? void 0 : _a.at(0)) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : -1) };
                    if (fInfo.id !== '-1') {
                        const seasonEpisodenumber = (_e = (_d = /\bS\d{1,3}E\d{1,4}\b/i.exec(fileName)) === null || _d === void 0 ? void 0 : _d.at(0)) !== null && _e !== void 0 ? _e : '';
                        const episodeNumber = (_g = (_f = /\d{1,4}$/i.exec(seasonEpisodenumber)) === null || _f === void 0 ? void 0 : _f.at(0)) !== null && _g !== void 0 ? _g : '';
                        fInfo.seasonNumber = Number((_j = (_h = /\d{1,3}/i
                            .exec(seasonEpisodenumber.slice(0, -episodeNumber.length))) === null || _h === void 0 ? void 0 : _h.at(0)) !== null && _j !== void 0 ? _j : '-1');
                        fInfo.episodeNumber = Number(episodeNumber !== '' ? episodeNumber : -1);
                    }
                    return fInfo;
                },
                getFileInfoFromParseResponse: (parseResponse) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                    return ({
                        id: String((_c = (_b = (_a = parseResponse === null || parseResponse === void 0 ? void 0 : parseResponse.data) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : -1),
                        seasonNumber: (_f = (_e = (_d = parseResponse === null || parseResponse === void 0 ? void 0 : parseResponse.data) === null || _d === void 0 ? void 0 : _d.parsedEpisodeInfo) === null || _e === void 0 ? void 0 : _e.seasonNumber) !== null && _f !== void 0 ? _f : 1,
                        episodeNumber: (_k = (_j = (_h = (_g = parseResponse === null || parseResponse === void 0 ? void 0 : parseResponse.data) === null || _g === void 0 ? void 0 : _g.parsedEpisodeInfo) === null || _h === void 0 ? void 0 : _h.episodeNumbers) === null || _j === void 0 ? void 0 : _j.at(0)) !== null && _k !== void 0 ? _k : 1,
                    });
                },
                buildPreviewRenameResquestUrl: (fInfo) => `${arrHost}/api/v3/rename?seriesId=${fInfo.id}&seasonNumber=${fInfo.seasonNumber}`,
                getFileToRenameFromPreviewRenameResponse: (previewRenameResponse, fInfo) => {
                    var _a;
                    return (_a = previewRenameResponse.data) === null || _a === void 0 ? void 0 : _a.find((episodeFile) => { var _a; return ((_a = episodeFile.episodeNumbers) === null || _a === void 0 ? void 0 : _a.at(0)) === fInfo.episodeNumber; });
                },
            },
        };
    args.jobLog('Going to apply new name');
    args.jobLog(`Renaming ${arrApp.name}...`);
    // Retrieving movie or serie id, plus season and episode number for serie
    let fInfo = yield getFileInfo(args, arrApp, originalFileName);
    // Useful in some edge cases
    if (fInfo.id === '-1' && currentFileName !== originalFileName) {
        fInfo = yield getFileInfo(args, arrApp, currentFileName);
    }
    // Checking that the file has been found
    if (fInfo.id !== '-1') {
        // Using rename endpoint to get ids of all the files that need renaming
        const previewRenameRequestResult = yield args.deps.axios({
            method: 'get',
            url: arrApp.delegates.buildPreviewRenameResquestUrl(fInfo),
            headers,
        });
        const fileToRename = arrApp.delegates
            .getFileToRenameFromPreviewRenameResponse(previewRenameRequestResult, fInfo);
        // Only if there is a rename to execute
        if (fileToRename !== undefined) {
            newPath = `${(0, fileUtils_1.getFileAbosluteDir)(currentFileName)}/${(0, fileUtils_1.getFileName)(fileToRename.newPath)}.${(0, fileUtils_1.getContainer)(fileToRename.newPath)}`;
            isSuccessful = yield (0, fileMoveOrCopy_1.default)({
                operation: 'move',
                sourcePath: currentFileName,
                destinationPath: newPath,
                args,
            });
        }
        else {
            isSuccessful = true;
            args.jobLog('✔ No rename necessary.');
        }
    }
    return {
        outputFileObj: isSuccessful && newPath !== ''
            ? Object.assign(Object.assign({}, args.inputFileObj), { _id: newPath }) : args.inputFileObj,
        outputNumber: isSuccessful ? 1 : 2,
        variables: args.variables,
    };
});
exports.plugin = plugin;
