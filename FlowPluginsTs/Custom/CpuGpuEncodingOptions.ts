import {
  IpluginInputArgs,
  IpluginOutputArgs,
  IpluginDetails,
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
  const { inputs, jobLog } = args;

  const encodingType = inputs.encodingType as string;

  if (encodingType === 'nvidia') {
    jobLog('Using NVIDIA GPU encoding');
    args.variables.ffmpegCommand.streams[0].codec = 'hevc_nvenc';
    args.variables.ffmpegCommand.streams[0].codecArgs = ['-cq', '25', '-preset', 'p7'];
  } else if (encodingType === 'cpu') {
    jobLog('Using CPU encoding');
    args.variables.ffmpegCommand.streams[0].codec = 'libx265';
    args.variables.ffmpegCommand.streams[0].codecArgs = ['-crf', '23', '-preset', 'medium'];
  } else {
    throw new Error('Invalid encoding type selected');
  }

  return {
    outputFileObj: {
      _id: args.inputFileObj._id,
    },
    outputNumber: 1,
    variables: args.variables,
  };
};

export { details, plugin };
