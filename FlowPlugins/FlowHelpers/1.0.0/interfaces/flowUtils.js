"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFfmpegCommandInit = void 0;
// eslint-disable-next-line import/prefer-default-export
const checkFfmpegCommandInit = (args) => {
    if (!args?.variables?.ffmpegCommand?.init) {
        throw new Error('FFmpeg command plugins not used correctly.'
            + ' Please use the "Begin Command" plugin before using this plugin.'
            + ' Afterwards, use the "Execute" plugin to execute the built FFmpeg command.'
            + ' Once the "Execute" plugin has been used, you need to use a new "Begin Command"'
            + ' plugin to start a new FFmpeg command.');
    }
};
exports.checkFfmpegCommandInit = checkFfmpegCommandInit;
