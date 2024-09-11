import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';

const details = (): IpluginDetails => ({
  name: 'Calculate Bitrate',
  description: 'Calculate bitrate based on codec, frame rate, and resolution',
  style: {
    borderColor: 'blue',
  },
  tags: 'video,bitrate',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: 'faCog',
  inputs: [
    {
      label: 'Codec',
      name: 'codec',
      type: 'string',
      defaultValue: 'h264',
      inputUI: {
        type: 'dropdown',
        options: ['h264', 'h265'],
      },
      tooltip: 'Select the codec (h264 or h265)',
    },
    {
      label: 'Variable Name',
      name: 'variableName',
      type: 'string',
      defaultValue: 'calculatedBitrate',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Name of the variable to store the calculated bitrate',
    },
  ],
  outputs: [
    {
      number: 1,
      tooltip: 'Continue',
    },
  ],
});

const plugin = (args: IpluginInputArgs): IpluginOutputArgs => {
  const lib = require('../../../../../methods/lib')();
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  const codec = String(args.inputs.codec);
  args.jobLog(`Selected codec: ${codec}`);

  const variableName = String(args.inputs.variableName);
  args.jobLog(`Variable name to store bitrate: ${variableName}`);

  const fps = args.inputFileObj.ffProbeData.streams[0].avg_frame_rate;
  args.jobLog(`Frame rate: ${fps}`);

  const width = args.inputFileObj.ffProbeData.streams[0].width;
  const height = args.inputFileObj.ffProbeData.streams[0].height;
  args.jobLog(`Resolution: ${width}x${height}`);

  let baseBitrate: number;

  if (width === 1280 && height === 720) {
    baseBitrate = codec === 'h265' ? 4300 : 7200;
  } else if (width === 1920 && height === 1080) {
    baseBitrate = codec === 'h265' ? 9400 : 16000;
  } else if (width === 3840 && height === 2160) {
    baseBitrate = codec === 'h265' ? 37400 : 64800;
  } else {
    args.jobLog('Unsupported resolution. Using default bitrate.');
    baseBitrate = 5000;
  }
  args.jobLog(`Base bitrate: ${baseBitrate} kbps`);

  const [fpsNumerator, fpsDenominator] = fps.split('/').map(Number);
  const fpsValue = fpsNumerator / fpsDenominator;
  args.jobLog(`Calculated FPS: ${fpsValue}`);

  const fpsRatio = fpsValue / 60;
  args.jobLog(`FPS ratio: ${fpsRatio}`);

  let calculatedBitrate = Math.round(baseBitrate * fpsRatio);
  args.jobLog(`Initial calculated bitrate: ${calculatedBitrate} kbps`);

  // Ensure the bitrate is an integer
  calculatedBitrate = Math.ceil(calculatedBitrate);
  args.jobLog(`Final calculated bitrate: ${calculatedBitrate} kbps`);

  // Set the calculated bitrate as a flow variable
  if (!args.variables.user) {
    args.variables.user = {};
  }
  args.variables.user[variableName] = calculatedBitrate.toString();
  args.jobLog(`Set flow variable '${variableName}' to: ${args.variables.user[variableName]}`);

  return {
    outputFileObj: args.inputFileObj,
    outputNumber: 1,
    variables: args.variables,
  };
};

export {
  details,
  plugin,
};