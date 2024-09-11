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
  requiredTdarrVersion: '2.24.05',
  inputs: [],
});

const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const { jobLog, inputFileObj } = args;

  // Set the transcoded tag
  if (!inputFileObj.meta) {
    inputFileObj.meta = {};
  }
  if (!inputFileObj.meta.Tags) {
    inputFileObj.meta.Tags = {};
  }
  inputFileObj.meta.Tags.transcoded = 'true';

  jobLog('Set "transcoded=true" tag on the file');

  return {
    outputFileObj: {
      _id: inputFileObj._id,
      meta: inputFileObj.meta,
    },
    outputNumber: 1,
    variables: args.variables,
  };
};

export { details, plugin };
