import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
  IffmpegCommand,
  IffmpegCommandStream,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';

const details = (): IpluginDetails => ({
  name: 'Advanced Video Converter',
  description: 'Convert video with various options including NVIDIA acceleration, container selection, subtitle embedding, and audio stream handling.',
  style: {
    borderColor: 'blue',
  },
  tags: 'video,conversion,ffmpeg',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: 'faVideo',
  inputs: [
    {
      label: 'NVIDIA Acceleration',
      name: 'useNvidia',
      type: 'boolean',
      defaultValue: 'false',
      inputUI: {
        type: 'dropdown',
        options: ['true', 'false'],
      },
      tooltip: 'Use NVIDIA acceleration for encoding',
    },
    {
      label: 'Output Container',
      name: 'outputContainer',
      type: 'string',
      defaultValue: 'mp4',
      inputUI: {
        type: 'dropdown',
        options: ['mp4', 'mkv'],
      },
      tooltip: 'Select output container format',
    },
    {
      label: 'CPU Encoding Speed',
      name: 'cpuEncodingSpeed',
      type: 'string',
      defaultValue: 'medium',
      inputUI: {
        type: 'dropdown',
        options: ['ultrafast', 'superfast', 'veryfast', 'faster', 'fast', 'medium', 'slow', 'slower', 'veryslow'],
      },
      tooltip: 'Select CPU encoding speed preset',
    },
    {
      label: 'GPU Encoding Speed',
      name: 'gpuEncodingSpeed',
      type: 'string',
      defaultValue: 'p7',
      inputUI: {
        type: 'dropdown',
        options: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'],
      },
      tooltip: 'Select GPU encoding speed preset (p1 fastest, p7 slowest)',
    },
    {
      label: 'Use B-Frames',
      name: 'useBFrames',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip: 'Enable or disable B-frames',
    },
	{
	  label: 'B-Frames Count',
	  name: 'bFramesCount',
	  type: 'number',
	  defaultValue: '3',
	  inputUI: {
		type: 'dropdown',
		options: Array.from({length: 21}, (_, i) => i.toString()),
	  },
	  tooltip: 'Select the number of B-frames (0-20)',
	  conditions: {
		useBFrames: true,
	  },
	},
    {
      label: 'Video Bitrate (kbps)',
      name: 'videoBitrate',
      type: 'number',
      defaultValue: '5000',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Specify the video bitrate in kbps',
    },
    {
      label: 'Use HEVC (H.265)',
      name: 'useHEVC',
      type: 'boolean',
      defaultValue: 'false',
      inputUI: {
        type: 'dropdown',
        options: ['true', 'false'],
      },
      tooltip: 'Use HEVC (H.265) encoding instead of H.264',
    },
  ],
  outputs: [
    {
      number: 1,
      tooltip: 'Success',
    },
    {
      number: 2,
      tooltip: 'Error',
    },
  ],
});

const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  args.jobLog('Input arguments:');
  args.jobLog(JSON.stringify(args.inputs, null, 2));

  // Initialize ffmpegCommand if it doesn't exist
  if (!args.variables.ffmpegCommand) {
    args.variables.ffmpegCommand = {
      inputFiles: [args.inputFileObj._id],
      streams: [],
      container: args.inputs.outputContainer as string,
      hardwareDecoding: false,
      shouldProcess: true,
      overallInputArguments: [],
      overallOuputArguments: [],
    } as IffmpegCommand;
  }

  const ffmpegCommand = args.variables.ffmpegCommand;
  args.jobLog('Initial ffmpegCommand:');
  args.jobLog(JSON.stringify(ffmpegCommand, null, 2));

  // Check for DTS audio and default to MKV if present
  const hasDTSAudio = ffmpegCommand.streams.some(stream => 
    stream.codec_type === 'audio' && stream.codec_name === 'dts'
  );

  if (hasDTSAudio && ffmpegCommand.container === 'mp4') {
    ffmpegCommand.container = 'mkv';
    args.jobLog('DTS audio detected. Defaulting to MKV container.');
  } else {
    ffmpegCommand.container = args.inputs.outputContainer as string;
    args.jobLog(`Set output container to: ${ffmpegCommand.container}`);
  }

  // NVIDIA acceleration and encoding settings
  const useNvidia = Boolean(args.inputs.useNvidia);
  const useHEVC = Boolean(args.inputs.useHEVC);
	args.jobLog(`encoder settings: useNvidia = ${useNvidia} and useHEVC = ${useHEVC}`);
  
  if (useNvidia) {
    ffmpegCommand.hardwareDecoding = true;
    ffmpegCommand.overallInputArguments.push('-hwaccel', 'cuda');
    const encoder = useHEVC ? 'hevc_nvenc' : 'h264_nvenc';
    ffmpegCommand.overallOuputArguments.push('-c:v', encoder, '-preset', args.inputs.gpuEncodingSpeed as string);
    args.jobLog(`Enabled NVIDIA acceleration with ${encoder} and preset ${args.inputs.gpuEncodingSpeed}`);
  } else {
    const encoder = useHEVC ? 'libx265' : 'libx264';
    ffmpegCommand.overallOuputArguments.push('-c:v', encoder, '-preset', args.inputs.cpuEncodingSpeed as string);
    args.jobLog(`Using ${encoder} for CPU encoding with preset ${args.inputs.cpuEncodingSpeed}`);
  }

	// B-frames
	if (args.inputs.useBFrames === true) {
	  const bFramesCount = parseInt(args.inputs.bFramesCount as string) || 3;
	  ffmpegCommand.overallOuputArguments.push('-bf', bFramesCount.toString());
	  args.jobLog(`Enabled B-frames with count: ${bFramesCount}`);
	} else {
	  ffmpegCommand.overallOuputArguments.push('-bf', '0');
	  args.jobLog('Disabled B-frames');
	}

  // Video bitrate
  if (isNaN(Number(args.inputs.videoBitrate))) {
	  args.jobLog('Invalid video bitrate detected');
	}

  const videoBitrate = isNaN(Number(args.inputs.videoBitrate)) ? '0' : args.inputs.videoBitrate;
  ffmpegCommand.overallOuputArguments.push('-b:v', `${videoBitrate}k`);
  args.jobLog(`Set video bitrate to: ${videoBitrate}k`);


  // Handle streams
  ffmpegCommand.streams.forEach((stream: IffmpegCommandStream, index: number) => {
    args.jobLog(`Processing stream ${index}: ${stream.codec_type} - ${stream.codec_name}`);

    switch (stream.codec_type) {
      case 'video':
        // Auto-detect 10-bit
        if (stream.bits_per_raw_sample === 10) {
          ffmpegCommand.overallOuputArguments.push('-pix_fmt', 'yuv420p10le');
          ffmpegCommand.overallOuputArguments.push('-profile', 'main10');
          args.jobLog('Detected 10-bit video, set pixel format to yuv420p10le');
        }
        break;

      case 'audio':
        if (stream.codec_name === 'dts') {
          if (ffmpegCommand.container === 'mkv') {
            stream.outputArgs.push('-c:a', 'copy');
            args.jobLog(`Set DTS stream ${index} to copy`);
          } else {
            stream.outputArgs.push('-c:a', 'ac3', '-b:a', '640k');
            args.jobLog(`Transcoding DTS stream ${index} to AC3 for MP4 compatibility`);
          }
        } else if (stream.codec_name === 'ac3') {
          stream.outputArgs.push('-c:a', 'copy');
          args.jobLog(`Set AC3 stream ${index} to copy`);
        } else {
          stream.outputArgs.push('-c:a', 'aac', '-b:a', '192k');
          args.jobLog(`Transcoding audio stream ${index} to AAC`);
        }
        break;

      case 'subtitle':
        if (ffmpegCommand.container === 'mkv') {
          stream.outputArgs.push('-c:s', 'copy');
          args.jobLog(`Set subtitle stream ${index} to copy`);
        } else {
          // For MP4, we need to handle subtitles differently
          if (stream.codec_name === 'mov_text') {
            stream.outputArgs.push('-c:s', 'mov_text');
            args.jobLog(`Set subtitle stream ${index} to mov_text for MP4`);
          } else {
		  try{
			// Convert incompatible subtitle formats to mov_text for MP4
			stream.outputArgs.push('-c:s', 'mov_text');
			args.jobLog(`Converted subtitle stream ${index} to mov_text for MP4`);
		  }
		  catch (error){
            stream.removed = true;
            args.jobLog(`Removed incompatible subtitle stream ${index} for MP4 Error: ${error}`);
			}
          }
        }
        break;

      default:
        args.jobLog(`Unknown stream type ${stream.codec_type} for stream ${index}, skipping`);
    }
  });

  args.jobLog('Final ffmpegCommand:');
  args.jobLog(JSON.stringify(ffmpegCommand, null, 2));

  args.jobLog('FFmpeg command prepared successfully');

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