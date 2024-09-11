import { IpluginDetails, IpluginInputArgs, IpluginOutputArgs } from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import { getFileAbosluteDir } from '../../../../FlowHelpers/1.0.0/fileUtils';

const details = (): IpluginDetails => ({
  name: 'Check Hardlinks',
  description: 'Check if the input file has hardlinks',
  style: {
    borderColor: 'blue',
  },
  tags: 'file,hardlinks',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: 'faLink',
  inputs: [],
  outputs: [
    {
      number: 1,
      tooltip: 'File has hardlinks',
    },
    {
      number: 2,
      tooltip: 'File does not have hardlinks',
    },
  ],
});

const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const fs = args.deps.gracefulfs;
  const path = args.deps.upath;

  const filePath = args.inputFileObj._id;
  const directory = getFileAbosluteDir(filePath);

  try {
    const stats = await fs.promises.stat(filePath);
    const hasHardlinks = stats.nlink > 1;

    if (hasHardlinks) {
      args.jobLog(`File has hardlinks: ${filePath}`);
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
      };
    } else {
      args.jobLog(`File does not have hardlinks: ${filePath}`);
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2,
        variables: args.variables,
      };
    }
  } catch (error) {
    args.jobLog(`Error checking hardlinks: ${error.message}`);
    return {
      outputFileObj: args.inputFileObj,
      outputNumber: 2,
      variables: args.variables,
    };
  }
};

export {
  details,
  plugin,
};