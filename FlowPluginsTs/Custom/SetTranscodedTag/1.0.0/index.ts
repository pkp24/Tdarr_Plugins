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
  outputs: [
    {
      number: '1',
      tooltip: 'Transcoded tag set',
    },
  ],
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const { inputFileObj } = args;

  let response = {
    processFile: false,
    preset: '',
    handBrakeMode: false,
    FFmpegMode: true,
    reQueueAfter: false,
    infoLog: '',
  };

  // Ensure metadata and tags exist
  inputFileObj.meta = inputFileObj.meta || {};
  inputFileObj.meta.Tags = inputFileObj.meta.Tags || {};

  // Set the transcoded tag
  inputFileObj.meta.Tags.transcoded = 'true';

  response.infoLog += '☑ Set "transcoded=true" tag on the file\n';

  return {
    outputFileObj: args.inputFileObj,
    outputNumber: 1,
    variables: args.variables,
  };
};

export { details, plugin };
