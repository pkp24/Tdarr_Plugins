"use strict";
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
const getId = async (args, arrApp, fileName) => {
    const imdbId = /\b(tt|nm|co|ev|ch|ni)\d{7,10}?\b/i.exec(fileName)?.at(0) ?? '';
    let id = (imdbId !== '')
        ? Number((await args.deps.axios({
            method: 'get',
            url: `${arrApp.host}/api/v3/${arrApp.name === 'radarr' ? 'movie' : 'series'}/lookup?term=imdb:${imdbId}`,
            headers: arrApp.headers,
        })).data?.at(0)?.id ?? -1)
        : -1;
    args.jobLog(`${arrApp.content} ${id !== -1 ? `'${id}' found` : 'not found'} for imdb '${imdbId}'`);
    if (id === -1) {
        id = arrApp.delegates.getIdFromParseResponse((await args.deps.axios({
            method: 'get',
            url: `${arrApp.host}/api/v3/parse?title=${encodeURIComponent((0, fileUtils_1.getFileName)(fileName))}`,
            headers: arrApp.headers,
        })));
        args.jobLog(`${arrApp.content} ${id !== -1 ? `'${id}' found` : 'not found'} for '${(0, fileUtils_1.getFileName)(fileName)}'`);
    }
    return id;
};
const plugin = async (args) => {
    const lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    // Variables initialization
    let refreshed = false;
    const arr = String(args.inputs.arr);
    const arr_host = String(args.inputs.arr_host).trim();
    const arrHost = arr_host.endsWith('/') ? arr_host.slice(0, -1) : arr_host;
    const originalFileName = args.originalLibraryFile?._id ?? '';
    const currentFileName = args.inputFileObj?._id ?? '';
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
                getIdFromParseResponse: (parseResponse) => Number(parseResponse?.data?.movie?.id ?? -1),
                buildRefreshResquestData: (id) => JSON.stringify({ name: 'RefreshMovie', movieIds: [id] }),
            },
        }
        : {
            name: arr,
            host: arrHost,
            headers,
            content: 'Serie',
            delegates: {
                getIdFromParseResponse: (parseResponse) => Number(parseResponse?.data?.series?.id ?? -1),
                buildRefreshResquestData: (id) => JSON.stringify({ name: 'RefreshSeries', seriesId: id }),
            },
        };
    args.jobLog('Going to force scan');
    args.jobLog(`Refreshing ${arrApp.name}...`);
    let id = await getId(args, arrApp, originalFileName);
    // Useful in some edge cases
    if (id === -1 && currentFileName !== originalFileName) {
        id = await getId(args, arrApp, currentFileName);
    }
    // Checking that the file has been found
    if (id !== -1) {
        // Using command endpoint to queue a refresh task
        await args.deps.axios({
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
};
exports.plugin = plugin;
