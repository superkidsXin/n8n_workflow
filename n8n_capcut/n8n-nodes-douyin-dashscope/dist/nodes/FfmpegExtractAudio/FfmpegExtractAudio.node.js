"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FfmpegExtractAudio = void 0;
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
function runCommand(command, args) {
    return new Promise((resolve, reject) => {
        const child = (0, child_process_1.spawn)(command, args, { windowsHide: true });
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', (d) => (stdout += d.toString()));
        child.stderr.on('data', (d) => (stderr += d.toString()));
        child.on('error', reject);
        child.on('close', (code) => {
            resolve({ stdout, stderr, exitCode: code ?? -1 });
        });
    });
}
function defaultOutputPath(inputPath, ext) {
    const dir = path.dirname(inputPath);
    const base = path.basename(inputPath, path.extname(inputPath));
    return path.join(dir, `${base}${ext}`);
}
class FfmpegExtractAudio {
    constructor() {
        this.description = {
            displayName: 'FFmpeg Extract Audio',
            name: 'ffmpegExtractAudio',
            icon: 'file:ffmpeg.svg',
            group: ['transform'],
            version: 1,
            description: 'Extract audio from a local video file using ffmpeg',
            defaults: {
                name: 'FFmpeg Extract Audio',
            },
            inputs: ['main'],
            outputs: ['main'],
            properties: [
                {
                    displayName: 'Input Video Path',
                    name: 'inputPath',
                    type: 'string',
                    default: '',
                    required: true,
                    description: 'Local file path to the video (e.g. D:\\tmp\\video.mp4)',
                },
                {
                    displayName: 'Output Audio Path',
                    name: 'outputPath',
                    type: 'string',
                    default: '',
                    description: 'Local file path to write audio. Leave empty to write <input>.mp3',
                },
                {
                    displayName: 'Format',
                    name: 'format',
                    type: 'options',
                    default: 'mp3',
                    options: [
                        { name: 'MP3', value: 'mp3' },
                    ],
                },
                {
                    displayName: 'Overwrite Output',
                    name: 'overwrite',
                    type: 'boolean',
                    default: true,
                },
                {
                    displayName: 'MP3 Quality (q:a)',
                    name: 'mp3Quality',
                    type: 'number',
                    default: 2,
                    typeOptions: { minValue: 0, maxValue: 9 },
                    description: 'ffmpeg -q:a value, lower is better quality (0-9)',
                    displayOptions: {
                        show: {
                            format: ['mp3'],
                        },
                    },
                },
                {
                    displayName: 'FFmpeg Binary',
                    name: 'ffmpegPath',
                    type: 'string',
                    default: 'ffmpeg',
                    description: 'ffmpeg executable name or full path',
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            const inputPath = this.getNodeParameter('inputPath', itemIndex);
            const outputPathParam = this.getNodeParameter('outputPath', itemIndex);
            const format = this.getNodeParameter('format', itemIndex);
            const overwrite = this.getNodeParameter('overwrite', itemIndex);
            const ffmpegPath = this.getNodeParameter('ffmpegPath', itemIndex);
            let outputPath = outputPathParam;
            if (!outputPath) {
                outputPath = defaultOutputPath(inputPath, format === 'mp3' ? '.mp3' : '.audio');
            }
            const args = [];
            args.push(overwrite ? '-y' : '-n');
            args.push('-i', inputPath);
            args.push('-vn');
            if (format === 'mp3') {
                const mp3Quality = this.getNodeParameter('mp3Quality', itemIndex);
                args.push('-acodec', 'libmp3lame');
                args.push('-q:a', String(mp3Quality));
            }
            args.push(outputPath);
            const res = await runCommand(ffmpegPath, args);
            if (res.exitCode !== 0) {
                throw new Error(`ffmpeg failed (exitCode=${res.exitCode}): ${res.stderr || res.stdout}`);
            }
            returnData.push({
                json: {
                    inputPath,
                    outputPath,
                    format,
                },
            });
        }
        return [returnData];
    }
}
exports.FfmpegExtractAudio = FfmpegExtractAudio;
