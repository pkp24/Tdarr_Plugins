"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardwareUtils_1 = require("./hardwareUtils");
const run = async () => {
    const encoderProperties = await (0, hardwareUtils_1.getEncoder)({
        targetCodec: 'h264',
        hardwareEncoding: true,
        hardwareType: 'auto',
        // @ts-expect-error type
        args: {
            workerType: 'transcodegpu',
            ffmpegPath: 'ffmpeg',
            jobLog: (t) => {
                // eslint-disable-next-line no-console
                console.log(t);
            },
        },
    });
    // eslint-disable-next-line no-console
    console.log({
        encoderProperties,
    });
};
void run();
