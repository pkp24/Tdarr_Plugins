import {
  IpluginInputArgs,
  IpluginOutputArgs,
  IpluginDetails,
} from '../FlowHelpers/1.0.0/interfaces/interfaces';

const details = (): IpluginDetails => ({
  name: 'Check Transcoded Tag',
  description: 'Check if the file has a custom tag "transcoded=true"',
  style: {
    borderColor: 'purple',
  },
  tags: 'tag,check,transcoded',
  isStartPlugin: false,
  pType: '',
  inputs: [],
});

const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const { jobLog, inputFileObj } = args;

  const hasTranscodedTag = inputFileObj.meta?.Tags?.transcoded === 'true';

  if (hasTranscodedTag) {
    jobLog('File has the "transcoded=true" tag');
    return {
      outputFileObj: {
        _id: inputFileObj._id,
      },
      outputNumber: 1, // Has transcoded tag
      variables: args.variables,
    };
  } else {
    jobLog('File does not have the "transcoded=true" tag');
    return {
      outputFileObj: {
        _id: inputFileObj._id,
      },
      outputNumber: 2, // Does not have transcoded tag
      variables: args.variables,
    };
  }
};

export { details, plugin };
