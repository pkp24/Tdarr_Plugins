/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  IpluginInputArgs,
  IpluginOutputArgs,
  IpluginDetails,
} from '../../../FlowHelpers/1.0.0/interfaces/interfaces';

const details = (): IpluginDetails => ({
  name: 'Check Transcoded Tag',
  description: 'Check if the file has a custom tag "transcoded=true"',
  style: {
    borderColor: 'purple',
  },
  tags: 'tag,check,transcoded',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.00.00',
  inputs: [],
  outputs: [
    {
      number: '1',
      tooltip: 'Has transcoded tag',
    },
    {
      number: '2',
      tooltip: 'Does not have transcoded tag',
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

  // Use metadata from Tdarr's ffProbeData
  const metadata = inputFileObj.ffProbeData || {};
  const hasTranscodedTag = metadata?.format?.tags?.transcoded === 'true';

  if (hasTranscodedTag) {
    response.infoLog += '☑ File has the "transcoded=true" tag\n';
    return {
      outputFileObj: inputFileObj,
      outputNumber: 1, // Has transcoded tag
      variables: args.variables,
    };
  } else {
    response.infoLog += '☒ File does not have the "transcoded=true" tag\n';
    return {
      outputFileObj: inputFileObj,
      outputNumber: 2, // Does not have transcoded tag
      variables: args.variables,
    };
  }
};

export { details, plugin };
