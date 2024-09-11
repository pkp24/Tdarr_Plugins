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

  const hasTranscodedTag = inputFileObj.meta?.Tags?.transcoded === 'true';

  if (hasTranscodedTag) {
    response.infoLog += '☑ File has the "transcoded=true" tag\n';
    return {
      outputFileObj: {
        _id: inputFileObj._id,
      },
      outputNumber: 1, // Has transcoded tag
      variables: {
        ...args.variables,
        ffmpegCommand: response,
      },
    };
  } else {
    response.infoLog += '☒ File does not have the "transcoded=true" tag\n';
    return {
      outputFileObj: {
        _id: inputFileObj._id,
      },
      outputNumber: 2, // Does not have transcoded tag
      variables: {
        ...args.variables,
        ffmpegCommand: response,
      },
    };
  }
};

export { details, plugin };
