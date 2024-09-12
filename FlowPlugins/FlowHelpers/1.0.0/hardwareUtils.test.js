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
const hardwareUtils_1 = require("./hardwareUtils");
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const encoderProperties = yield (0, hardwareUtils_1.getEncoder)({
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
});
void run();
