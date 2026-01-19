import type { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import { execFile } from 'child_process';
import { basename, isAbsolute, join, normalize } from 'path';
import { promises as fs } from 'fs';

let debug_flag = false;

function execFileText(file: string, args: string[]): Promise<string> {
    if (debug_flag) console.log(`execFile ${file} ${args.join(' ')}`);
    return new Promise((resolve, reject) => {
        execFile(file, args, { windowsHide: true, maxBuffer: 20 * 1024 * 1024 }, (err, stdout, stderr) => {
            if (err) {
                (err as any).stdout = stdout;
                (err as any).stderr = stderr;
                console.error(`exec failed: ${err}`);
                reject(err);
                return;
            }
            resolve(String(stdout ?? ''));
        });
    });
}

function normalizeCallStack(raw: string): string {
    const s = String(raw ?? '');
    if (s.includes('\n') && !s.includes('\n#') && !s.includes('\r\n')) {
        return s;
    }
    if (!s.includes('\n') && s.includes('\\n')) {
        return s.replace(/\\n/g, '\n');
    }
    return s;
}

type Frame = {
    index: number;
    pc: string;
    soName: string;
    arch?: string;
    logBuildId?: string;
    originalLine: string;
};

function parseBuglyCallStack(callStack: string): Frame[] {
    const normalized = normalizeCallStack(callStack);
    const lines = String(normalized || '')
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
    const frames: Frame[] = [];
    for (const line of lines) {
        const m = line.match(/^#(\d+)\s+pc\s+([0-9a-fA-F]+)\s+(.+?)(?:\s*\[([^\]:]+)::([^\]]+)\])?\s*$/);
        if (!m) continue;
        const index = Number.parseInt(m[1], 10);
        const pc = `0x${m[2]}`;
        const soPath = m[3].trim();
        const soName = basename(soPath);
        const arch = m[4]?.trim();
        const logBuildId = m[5]?.trim()?.toLowerCase();
        frames.push({ index, pc, soName, arch, logBuildId, originalLine: line });
    }

    return frames;
}

function buildIdFromReadelfOutput(text: string): string {
    const m = String(text || '').match(/Build ID:\s*([0-9a-fA-F]+)/);
    return m?.[1]?.toLowerCase() ?? '';
}

function normalizeArchFolder(arch: string): string {
    const v = String(arch || '').toLowerCase();
    if (v === 'arm64' || v === 'arm64-v8a') return 'arm64-v8a';
    if (v === 'arm32' || v === 'armeabi-v7a') return 'armeabi-v7a';
    return v;
}

function cpuKeyFromArchFolder(archFolder: string): 'arm64' | 'arm32' {
    const v = String(archFolder || '').toLowerCase();
    if (v.includes('64')) return 'arm64';
    return 'arm32';
}

type SoNameMap = Record<string, { arm32?: string; arm64?: string }>;
function pickSoNameMapByVersion(text: string, appversion: string): SoNameMap {
    const raw = String(text || '').trim();
    if (!raw) return {};
    const parsed = JSON.parse(raw) as any;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('so_name_map must be a JSON object');
    const v = String(appversion || '').trim();
    if (!v) {
        if (parsed.default && typeof parsed.default === 'object') return parsed.default as SoNameMap;
        if (parsed.latest && typeof parsed.latest === 'object') return parsed.latest as SoNameMap;
        return parsed as SoNameMap;
    }
    if (parsed[v] && typeof parsed[v] === 'object') return parsed[v] as SoNameMap;
    if (parsed.default && typeof parsed.default === 'object') return parsed.default as SoNameMap;
    if (parsed.latest && typeof parsed.latest === 'object') return parsed.latest as SoNameMap;
    return parsed as SoNameMap;
}

function resolveSymbolPath(symbolsRoot: string, p: string): string {
    const raw = String(p || '').trim();
    if (!raw) return '';
    if (isAbsolute(raw)) return raw;

    const root = normalize(String(symbolsRoot || '').trim() || '');
    const cand = normalize(raw);
    if (root && (cand === root || cand.startsWith(root + '\\') || cand.startsWith(root + '/'))) {
        return raw;
    }
    if (!root) return raw;
    return join(root, raw);
}

export class CrashParse implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Crash Parse',
        name: 'crashParse',
        group: ['transform'],
        version: 1,
        description: 'Parse native call stack using symbols + addr2line',
        defaults: { name: 'Crash Parse' },
        inputs: ['main'],
        outputs: ['main'],
        properties: [
            {
                displayName: 'Call Stack',
                name: 'callStack',
                type: 'string',
                default: '={{$json.callStack}}',
                required: true,
                typeOptions: {
                    rows: 6,
                },
            },
            {
                displayName: 'Debug',
                name: 'debug',
                type: 'boolean',
                default: false,
            },
            {
                displayName: 'Symbols Root Directory',
                name: 'symbolsRoot',
                type: 'string',
                default: 'symbols',
                required: true,
                description: '符号表根目录。若 so_name_map 里的路径不是绝对路径且不是以 symbolsRoot 开头，会自动拼成 symbolsRoot/<path>',
            },
            {
                displayName: 'App Version',
                name: 'appversion',
                type: 'string',
                default: '={{$json.appVersion || $json.productVersion || ""}}',
                required: false,
                description: '用于选择 so_name_map 的 version 一级（如 1.108.26011302）。为空时优先取 so_name_map.default / so_name_map.latest',
            },
            {
                displayName: 'so_name_map (JSON)',
                name: 'soNameMap',
                type: 'string',
                default:
                    '{\n  "default": {\n    "libunity.so": {\n      "arm32": "armeabi-v7a/libunity.so",\n      "arm64": "arm64-v8a/libunity.so"\n    },\n    "libil2cpp.so": {\n      "arm32": "armeabi-v7a/libil2cpp.so",\n      "arm64": "arm64-v8a/libil2cpp.so"\n    }\n  }\n}',
                required: true,
                typeOptions: {
                    rows: 8,
                },
                description: '支持 version 一级：{ "1.108.26011302": { "libil2cpp.so": { "arm64": "..." } }, "default": { ... } }。value 是符号表相对路径（相对 symbolsRoot）或绝对路径。key 必须是 so 文件名（如 libil2cpp.so）。',
            },
            {
                displayName: 'addr2line Path',
                name: 'addr2linePath',
                type: 'string',
                default: 'addr2line.exe',
                required: true,
                description: '本机 addr2line 可执行文件路径（可放入 PATH）',
            },
            {
                displayName: 'readelf Path',
                name: 'readelfPath',
                type: 'string',
                default: 'readelf.exe',
                required: true,
                description: '本机 readelf 可执行文件路径（可放入 PATH），用于读取本地符号表 build-id 并与堆栈中的 build-id 做匹配校验',
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const out: INodeExecutionData[] = [];

        for (let i = 0; i < items.length; i++) {
            try {
                const callStack = this.getNodeParameter('callStack', i) as string;
                const symbolsRoot = this.getNodeParameter('symbolsRoot', i) as string;
                const appversion = this.getNodeParameter('appversion', i) as string;
                const soNameMapText = this.getNodeParameter('soNameMap', i) as string;
                const addr2linePath = this.getNodeParameter('addr2linePath', i) as string;
                const readelfPath = this.getNodeParameter('readelfPath', i) as string;
                debug_flag = this.getNodeParameter('debug', i) as boolean;
                const soNameMap = pickSoNameMapByVersion(soNameMapText, appversion);
                const frames = parseBuglyCallStack(callStack);
                const archFolder = normalizeArchFolder(frames.find((f) => f.arch)?.arch || '');

                const buildIdLocalCacheByPath: Record<string, string> = {};

                const parsedFrames: Array<string> = [];

                for (const f of frames) {
                    if (!f.logBuildId) {
                        // throw new Error(`Missing build-id in call stack line: ${f.originalLine}`);
                        parsedFrames.push("解析失败:" + f.originalLine);
                        continue;
                    }

                    const frameArchFolder = normalizeArchFolder(f.arch || archFolder);
                    if (!frameArchFolder) {
                        throw new Error(`Missing arch in call stack line: ${f.originalLine}`);
                    }

                    const mapEntry = soNameMap[f.soName];
                    if (!mapEntry) {
                        parsedFrames.push(f.originalLine);
                        continue;
                    }

                    const cpuKey = cpuKeyFromArchFolder(frameArchFolder);
                    const mappedPath = mapEntry[cpuKey];
                    if (!mappedPath) {
                        throw new Error(`so_name_map missing path for ${f.soName} cpu=${cpuKey}`);
                    }

                    const symbolPathFromMap = resolveSymbolPath(symbolsRoot, mappedPath);
                    if (!symbolPathFromMap) {
                        throw new Error(`Invalid mapped symbol path for ${f.soName} cpu=${cpuKey}`);
                    }

                    try {
                        await fs.access(symbolPathFromMap);
                    } catch {
                        throw new Error(`Symbol file not found for ${f.soName} cpu=${cpuKey}: ${symbolPathFromMap}`);
                    }

                    const symbolPath = symbolPathFromMap;
                    const selectedBy: 'map' = 'map';
                    let buildIdOk: boolean | null = null;
                    let localBuildId = '';
                    if (buildIdLocalCacheByPath[symbolPath] === undefined) {
                        try {
                            const text = await execFileText(readelfPath, ['-n', symbolPath]);
                            if (debug_flag) console.log(`readelf ${symbolPath}: ${text}`);
                            buildIdLocalCacheByPath[symbolPath] = buildIdFromReadelfOutput(text);
                        } catch (err) {
                            throw new Error(`Failed to read build-id from ${symbolPath}: ${err}`);
                        }
                    }

                    localBuildId = buildIdLocalCacheByPath[symbolPath] || '';
                    if (localBuildId && (localBuildId.includes(f.logBuildId) || f.logBuildId.includes(localBuildId))) {
                        buildIdOk = true;
                    }

                    if (buildIdOk !== true) {
                        throw new Error(`Build-id mismatch for ${f.soName}. log=${f.logBuildId} local=${localBuildId} path=${symbolPath}`);
                    }

                    let addr2lineText = '';
                    let func = '';
                    let fileLine = '';

                    try {
                        addr2lineText = await execFileText(addr2linePath, ['-f', '-C', '-e', symbolPath, f.pc]);
                        if (debug_flag) console.log(`addr2line ${symbolPath} ${f.pc}: ${addr2lineText}`);
                        const lines = addr2lineText
                            .split(/\r?\n/)
                            .map((l) => l.trim())
                            .filter((l) => l.length > 0);
                        func = lines[0] ?? '';
                        fileLine = lines[1] ?? '';
                    } catch (e) {
                        throw new Error(`Failed to run addr2line for ${symbolPath}: ${e}`);
                    }
                    //#00 format index to 00
                    const index = f.index.toString().padStart(2, '0');
                    const res_line = `#${index}:  ${func} ${fileLine}`;
                    parsedFrames.push(res_line);
                }

                out.push({
                    json: {
                        crash: {
                            frames: parsedFrames.join('\n'),
                        },
                    },
                });
            } catch (error) {
                throw new NodeApiError(this.getNode(), error as any, { itemIndex: i });
            }
        }

        return [out];
    }
}
