import {
  IpluginInputArgs,
  IpluginOutputArgs,
  IpluginDetails,
  IffmpegCommandStream,
} from '../FlowHelpers/1.0.0/interfaces/interfaces';

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
      name: 'bitrateThreshold',
      type: 'text',
      tooltip: 'Bitrate threshold in Mbps (e.g., 5 for 5 Mbps)',
    },
    {
      name: 'fpsThreshold',
      type: 'text',
      tooltip: 'FPS threshold (e.g., 30)',
    },
    {
      name: 'maxWidth',
      type: 'text',
      tooltip: 'Maximum width for high quality (e.g., 1920)',
    },
    {
      name: 'maxHeight',
      type: 'text',
      tooltip: 'Maximum height for high quality (e.g., 1080)',
    },
  ],
});

const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const { inputs, jobLog, inputFileObj } = args;

  const bitrateThreshold = parseFloat(inputs.bitrateThreshold as string) * 1000000; // Convert Mbps to bps
  const fpsThreshold = parseFloat(inputs.fpsThreshold as string);
  const maxWidth = parseInt(inputs.maxWidth as string);
  const maxHeight = parseInt(inputs.maxHeight as string);

  const videoStream = args.variables.ffmpegCommand.streams.find((stream: IffmpegCommandStream) => stream.codec_type === 'video');

  if (!videoStream) {
    throw new Error('No video stream found in the input file');
  }

  const bitrate = parseFloat(videoStream.bit_rate || '0');
  const fps = parseFloat(videoStream.r_frame_rate?.split('/')[0] || '0');
  const width = parseInt(videoStream.width || '0');
  const height = parseInt(videoStream.height || '0');

  const isHighQuality = 
    bitrate >= bitrateThreshold &&
    fps >= fpsThreshold &&
    width <= maxWidth &&
    height <= maxHeight;

  if (isHighQuality) {
    jobLog('Video meets high quality criteria');
    return {
      outputFileObj: {
        _id: inputFileObj._id,
      },
      outputNumber: 1, // High quality output
      variables: args.variables,
    };
  } else {
    jobLog('Video does not meet high quality criteria');
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
