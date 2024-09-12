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
const fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
const details = () => ({
    name: 'Notify Radarr or Sonarr',
    description: 'Notify Radarr or Sonarr to refresh after file change',
    style: {
        borderColor: 'green',
    },
    tags: '',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faBell',
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
const getId = (args, arrApp, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const imdbId = (_b = (_a = /\b(tt|nm|co|ev|ch|ni)\d{7,10}?\b/i.exec(fileName)) === null || _a === void 0 ? void 0 : _a.at(0)) !== null && _b !== void 0 ? _b : '';
    let id = (imdbId !== '')
        ? Number((_e = (_d = (_c = (yield args.deps.axios({
            method: 'get',
            url: `${arrApp.host}/api/v3/${arrApp.name === 'radarr' ? 'movie' : 'series'}/lookup?term=imdb:${imdbId}`,
            headers: arrApp.headers,
        })).data) === null || _c === void 0 ? void 0 : _c.at(0)) === null || _d === void 0 ? void 0 : _d.id) !== null && _e !== void 0 ? _e : -1)
        : -1;
    args.jobLog(`${arrApp.content} ${id !== -1 ? `'${id}' found` : 'not found'} for imdb '${imdbId}'`);
    if (id === -1) {
        id = arrApp.delegates.getIdFromParseResponse((yield args.deps.axios({
            method: 'get',
            url: `${arrApp.host}/api/v3/parse?title=${encodeURIComponent((0, fileUtils_1.getFileName)(fileName))}`,
            headers: arrApp.headers,
        })));
        args.jobLog(`${arrApp.content} ${id !== -1 ? `'${id}' found` : 'not found'} for '${(0, fileUtils_1.getFileName)(fileName)}'`);
    }
    return id;
});
const plugin = (args) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    // Variables initialization
    let refreshed = false;
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
                getIdFromParseResponse: (parseResponse) => { var _a, _b, _c; return Number((_c = (_b = (_a = parseResponse === null || parseResponse === void 0 ? void 0 : parseResponse.data) === null || _a === void 0 ? void 0 : _a.movie) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : -1); },
                buildRefreshResquestData: (id) => JSON.stringify({ name: 'RefreshMovie', movieIds: [id] }),
            },
        }
        : {
            name: arr,
            host: arrHost,
            headers,
            content: 'Serie',
            delegates: {
                getIdFromParseResponse: (parseResponse) => { var _a, _b, _c; return Number((_c = (_b = (_a = parseResponse === null || parseResponse === void 0 ? void 0 : parseResponse.data) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : -1); },
                buildRefreshResquestData: (id) => JSON.stringify({ name: 'RefreshSeries', seriesId: id }),
            },
        };
    args.jobLog('Going to force scan');
    args.jobLog(`Refreshing ${arrApp.name}...`);
    let id = yield getId(args, arrApp, originalFileName);
    // Useful in some edge cases
    if (id === -1 && currentFileName !== originalFileName) {
        id = yield getId(args, arrApp, currentFileName);
    }
    // Checking that the file has been found
    if (id !== -1) {
        // Using command endpoint to queue a refresh task
        yield args.deps.axios({
            method: 'post',
            url: `${arrApp.host}/api/v3/command`,
            headers,
            data: arrApp.delegates.buildRefreshResquestData(id),
        });
        refreshed = true;
        args.jobLog(`✔ ${arrApp.content} '${id}' refreshed in ${arrApp.name}.`);
    }
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: refreshed ? 1 : 2,
        variables: args.variables,
    };
});
exports.plugin = plugin;
