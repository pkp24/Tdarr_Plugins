/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  IpluginInputArgs,
  IpluginOutputArgs,
  IpluginDetails,
} from '../../../FlowHelpers/1.0.0/interfaces/interfaces';

const details = (): IpluginDetails => ({
  name: 'CPU/GPU Encoding Options',
  description: 'Choose between NVIDIA GPU or CPU encoding with appropriate settings',
  style: {
    borderColor: 'green',
  },
  tags: 'video,encoder,gpu,cpu',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.00.00',
  inputs: [
    {
      name: 'encodingType',
      type: 'dropdown',
      options: ['nvidia', 'cpu'],
      tooltip: 'Choose between NVIDIA GPU or CPU encoding',
    },
  ],
  outputs: [
    {
      number: '1',
      tooltip: 'Encoding applied',
    },
  ],
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { inputs, inputFileObj, otherArguments } = args;

  let response = {
    processFile: false,
    preset: '',
    container: '.mp4',
    handBrakeMode: false,
    FFmpegMode: true,
    reQueueAfter: false,
    infoLog: '',
  };

  const encodingType = inputs.encodingType as string;

  if (encodingType === 'nvidia') {
    response.infoLog += '☑ Using NVIDIA GPU encoding\n';
    response.preset = '-c:v hevc_nvenc -cq 25 -preset p7';
  } else if (encodingType === 'cpu') {
    response.infoLog += '☑ Using CPU encoding\n';
    response.preset = '-c:v libx265 -crf 23 -preset medium';
  } else {
    throw new Error('Invalid encoding type selected');
  }

  response.preset += ' -c:a copy -c:s copy';

  // Determine output container
  const inputContainer = inputFileObj.container.toLowerCase();
  if (inputContainer === 'mp4' || inputContainer === 'mkv') {
    response.container = `.${inputContainer}`;
  }

  return {
    outputFileObj: args.inputFileObj,
    outputNumber: 1,
    variables: args.variables,
  };
};

export { details, plugin };
