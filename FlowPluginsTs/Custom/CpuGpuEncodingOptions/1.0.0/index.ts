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
      defaultValue: 'nvidia',
      inputUI: {
        type: 'dropdown',
        options: ['nvidia', 'cpu'],
      },
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { inputs, inputFileObj, otherArguments } = args;

  let response = {
    processFile: false,
    preset: '',
    handBrakeMode: false,
    FFmpegMode: true,
    reQueueAfter: false,
    infoLog: '',
  };

  const encodingType = inputs.encodingType as string;

  // Apply encoding settings based on selected type
  if (encodingType === 'nvidia') {
    response.infoLog += '☑ Using NVIDIA GPU encoding\n';
    response.preset = '-c:v hevc_nvenc -cq 25 -preset p7';
  } else if (encodingType === 'cpu') {
    response.infoLog += '☑ Using CPU encoding\n';
    response.preset = '-c:v libx265 -crf 23 -preset medium';
  } else {
    throw new Error('Invalid encoding type selected');
  }

  // Preserve audio and subtitle streams
  response.preset += ' -c:a copy -c:s copy';

  // Determine the output container dynamically
  const inputContainer = inputFileObj.container.toLowerCase();
  if (inputContainer === 'mp4' || inputContainer === 'mkv') {
    response.container = `.${inputContainer}`;
    response.infoLog += `☑ Using input container: ${inputContainer}\n`;
  } else {
    response.container = '.mkv'; // Fallback to a widely supported container
    response.infoLog += '☑ Unsupported container, falling back to .mkv\n';
  }

  return {
    outputFileObj: args.inputFileObj,
    outputNumber: 1,
    variables: args.variables,
  };
};

export { details, plugin };
