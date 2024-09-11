/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  IpluginInputArgs,
  IpluginOutputArgs,
  IpluginDetails,
} from '../../../FlowHelpers/1.0.0/interfaces/interfaces';

const details = (): IpluginDetails => ({
  name: 'Video Quality Checker',
  description: 'Check video quality based on bitrate, FPS, and frame size',
  style: {
    borderColor: 'blue',
  },
  tags: 'video,quality,bitrate,fps',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.00.00',
  inputs: [
    {
      name: 'qualityFactor',
      type: 'text',
      tooltip: 'Quality factor (0.5 to 2.0, where 1.0 is standard quality)',
    }
  ],
  outputs: [
    {
      number: '1',
      tooltip: 'High quality',
    },
    {
      number: '2',
      tooltip: 'Lower quality',
    },
  ],
});

const calculateBitrateThreshold = (width: number, height: number, fps: number, qualityFactor: number, codec: string): number => {
  const pixelCount = width * height;
  let baseBitrate: number;

  if (pixelCount <= 921600) { // 1280x720 or lower
    baseBitrate = 5000000; // 5 Mbps
  } else if (pixelCount <= 2073600) { // 1920x1080
    baseBitrate = 8000000; // 8 Mbps
  } else if (pixelCount <= 8294400) { // 3840x2160 (4K)
    baseBitrate = 20000000; // 20 Mbps
  } else {
    baseBitrate = 30000000; // 30 Mbps for anything higher
  }

  // Adjust for codec efficiency: H.265 needs ~50% less bitrate than H.264 for the same quality
  const codecAdjustment = codec === 'hevc' || codec === 'h265' ? 0.5 : 1.0;

  // Adjust for frame rate
  const fpsAdjustment = fps / 30;

  // Apply quality factor, FPS adjustment, and codec adjustment
  return Math.round(baseBitrate * qualityFactor * fpsAdjustment * codecAdjustment);
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { inputs, inputFileObj } = args;

  let response = {
    processFile: false,
    preset: '',
    handBrakeMode: false,
    FFmpegMode: true,
    reQueueAfter: false,
    infoLog: '',
  };

  const qualityFactor = Math.max(0.5, Math.min(2.0, parseFloat(inputs.qualityFactor as string)));

  const videoStream = inputFileObj.ffProbeData.streams.find((stream: any) => stream.codec_type === 'video');

  if (!videoStream) {
    throw new Error('No video stream found in the input file');
  }

  const bitrate = parseFloat(videoStream.bit_rate || '0');
  const fps = parseFloat(videoStream.r_frame_rate?.split('/')[0] || '0');
  const width = parseInt(videoStream.width || '0');
  const height = parseInt(videoStream.height || '0');
  const codec = videoStream.codec_name?.toLowerCase() || 'h264'; // Default to H.264 if codec is unknown

  const bitrateThreshold = calculateBitrateThreshold(width, height, fps, qualityFactor, codec);

  const isHighQuality = bitrate >= bitrateThreshold;

  if (isHighQuality) {
    response.infoLog += `☑ Video meets high quality criteria (Bitrate: ${bitrate} >= ${bitrateThreshold}, FPS: ${fps}, Codec: ${codec})\n`;
    return {
      outputFileObj: args.inputFileObj,
      outputNumber: 1, // High quality output
      variables: args.variables,
    };
  } else {
    response.infoLog += `☒ Video does not meet high quality criteria (Bitrate: ${bitrate} < ${bitrateThreshold}, Codec: ${codec})\n`;
    return {
      outputFileObj: args.inputFileObj,
      outputNumber: 2, // Lower quality output
      variables: args.variables,
    };
  }
};

export { details, plugin };
