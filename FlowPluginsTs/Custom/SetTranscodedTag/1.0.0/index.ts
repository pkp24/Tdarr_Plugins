/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  IpluginInputArgs,
  IpluginOutputArgs,
  IpluginDetails,
} from '../../../FlowHelpers/1.0.0/interfaces/interfaces';

const details = (): IpluginDetails => ({
  name: 'Set Transcoded Tag',
  description: 'Set the custom tag "transcoded=true" on the file',
  style: {
    borderColor: 'orange',
  },
  tags: 'tag,set,transcoded',
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

  // Set the transcoded tag
  if (!inputFileObj.meta) {
    inputFileObj.meta = {};
  }
  if (!inputFileObj.meta.Tags) {
    inputFileObj.meta.Tags = {};
  }
  inputFileObj.meta.Tags.transcoded = 'true';

  response.infoLog += '☑ Set "transcoded=true" tag on the file\n';

  return {
    outputFileObj: inputFileObj,
    outputNumber: 1,
    variables: args.variables,
    ffmpegCommand: response,
  };
};

export { details, plugin };
