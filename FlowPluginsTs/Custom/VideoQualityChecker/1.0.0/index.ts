import {
  IpluginInputArgs,
  IpluginOutputArgs,
  IpluginDetails,
  IffmpegCommandStream,
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
  inputs: [
    {
      name: 'qualityFactor',
      type: 'text',
      tooltip: 'Quality factor (0.5 to 2.0, where 1.0 is standard quality)',
    },
    {
      name: 'fpsThreshold',
      type: 'text',
      tooltip: 'FPS threshold (e.g., 30)',
    },
  ],
});

const calculateBitrateThreshold = (width: number, height: number, fps: number, qualityFactor: number): number => {
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

  // Adjust for frame rate
  const fpsAdjustment = fps / 30;
  
  // Apply quality factor and FPS adjustment
  return Math.round(baseBitrate * qualityFactor * fpsAdjustment);
};

const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const { inputs, jobLog, inputFileObj } = args;

  const qualityFactor = Math.max(0.5, Math.min(2.0, parseFloat(inputs.qualityFactor as string)));
  const fpsThreshold = parseFloat(inputs.fpsThreshold as string);

  const videoStream = args.variables.ffmpegCommand.streams.find((stream: IffmpegCommandStream) => stream.codec_type === 'video');

  if (!videoStream) {
    throw new Error('No video stream found in the input file');
  }

  const bitrate = parseFloat(videoStream.bit_rate || '0');
  const fps = parseFloat(videoStream.r_frame_rate?.split('/')[0] || '0');
  const width = parseInt(videoStream.width || '0');
  const height = parseInt(videoStream.height || '0');

  const bitrateThreshold = calculateBitrateThreshold(width, height, fps, qualityFactor);

  const isHighQuality = bitrate >= bitrateThreshold && fps >= fpsThreshold;

  if (isHighQuality) {
    jobLog(`Video meets high quality criteria (Bitrate: ${bitrate} >= ${bitrateThreshold}, FPS: ${fps} >= ${fpsThreshold})`);
    return {
      outputFileObj: {
        _id: inputFileObj._id,
      },
      outputNumber: 1, // High quality output
      variables: args.variables,
    };
  } else {
    jobLog(`Video does not meet high quality criteria (Bitrate: ${bitrate} < ${bitrateThreshold} or FPS: ${fps} < ${fpsThreshold})`);
    return {
      outputFileObj: {
        _id: inputFileObj._id,
      },
      outputNumber: 2, // Lower quality output
      variables: args.variables,
    };
  }
};

export { details, plugin };
