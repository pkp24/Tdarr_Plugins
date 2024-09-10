import {
  IpluginInputArgs,
  IpluginOutputArgs,
  IpluginDetails,
  IffmpegCommandStream,
} from '../FlowHelpers/1.0.0/interfaces/interfaces';

const details = (): IpluginDetails => ({
  name: 'CPU/GPU Encoding Options',
  description: 'Choose between NVIDIA GPU or CPU encoding with appropriate settings',
  style: {
    borderColor: 'green',
  },
  tags: 'video,encoder,gpu,cpu',
  isStartPlugin: false,
  pType: '',
  inputs: [
    {
      name: 'encodingType',
      type: 'dropdown',
      options: ['nvidia', 'cpu'],
      tooltip: 'Choose between NVIDIA GPU or CPU encoding',
    },
  ],
});

const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const { inputs, jobLog, inputFileObj } = args;

  const encodingType = inputs.encodingType as string;
  const videoStream = args.variables.ffmpegCommand.streams.find((stream: IffmpegCommandStream) => stream.codec_type === 'video');

  if (!videoStream) {
    throw new Error('No video stream found in the input file');
  }

  if (encodingType === 'nvidia') {
    jobLog('Using NVIDIA GPU encoding');
    videoStream.codec = 'hevc_nvenc';
    videoStream.codecArgs = ['-cq', '25', '-preset', 'p7'];
  } else if (encodingType === 'cpu') {
    jobLog('Using CPU encoding');
    videoStream.codec = 'libx265';
    videoStream.codecArgs = ['-crf', '23', '-preset', 'medium'];
  } else {
    throw new Error('Invalid encoding type selected');
  }

  // Set all other streams to copy
  args.variables.ffmpegCommand.streams.forEach((stream: IffmpegCommandStream) => {
    if (stream.codec_type !== 'video') {
      stream.codec = 'copy';
    }
  });

  // Determine output container
  const inputContainer = inputFileObj.container.toLowerCase();
  let outputContainer = inputContainer;
  if (inputContainer !== 'mp4' && inputContainer !== 'mkv') {
    outputContainer = 'mp4';
  }
  args.variables.ffmpegCommand.container = outputContainer;

  return {
    outputFileObj: {
      _id: inputFileObj._id,
    },
    outputNumber: 1,
    variables: args.variables,
  };
};

export { details, plugin };
