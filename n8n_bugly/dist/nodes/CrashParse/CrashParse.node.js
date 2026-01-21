"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrashParse = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const child_process_1 = require("child_process");
const path_1 = require("path");
const fs_1 = require("fs");
let debug_flag = false;
function execFileText(file, args) {
    if (debug_flag)
        console.log(`execFile ${file} ${args.join(' ')}`);
    return new Promise((resolve, reject) => {
        (0, child_process_1.execFile)(file, args, { windowsHide: true, maxBuffer: 20 * 1024 * 1024 }, (err, stdout, stderr) => {
            if (err) {
                err.stdout = stdout;
                err.stderr = stderr;
                console.error(`exec failed: ${err}`);
                reject(err);
                return;
            }
            resolve(String(stdout ?? ''));
        });
    });
}
function normalizeCallStack(raw) {
    const s = String(raw ?? '');
    if (s.includes('\n') && !s.includes('\n#') && !s.includes('\r\n')) {
        return s;
    }
    if (!s.includes('\n') && s.includes('\\n')) {
        return s.replace(/\\n/g, '\n');
    }
    return s;
}
function parseBuglyCallStack(callStack) {
    const normalized = normalizeCallStack(callStack);
    const lines = String(normalized || '')
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
    const frames = [];
    for (const line of lines) {
        const m = line.match(/^#(\d+)\s+pc\s+([0-9a-fA-F]+)\s+(.+?)(?:\s*\[([^\]:]+)::([^\]]+)\])?\s*$/);
        if (!m)
            continue;
        const index = Number.parseInt(m[1], 10);
        const pc = `0x${m[2]}`;
        const soPath = m[3].trim();
        const soName = (0, path_1.basename)(soPath);
        const arch = m[4]?.trim();
        const logBuildId = m[5]?.trim()?.toLowerCase();
        frames.push({ index, pc, soName, arch, logBuildId, originalLine: line });
    }
    return frames;
}
function buildIdFromReadelfOutput(text) {
    const m = String(text || '').match(/Build ID:\s*([0-9a-fA-F]+)/);
    return m?.[1]?.toLowerCase() ?? '';
}
function normalizeArchFolder(arch) {
    const v = String(arch || '').toLowerCase();
    if (v === 'arm64' || v === 'arm64-v8a')
        return 'arm64-v8a';
    if (v === 'arm32' || v === 'armeabi-v7a')
        return 'armeabi-v7a';
    return v;
}
function cpuKeyFromArchFolder(archFolder) {
    const v = String(archFolder || '').toLowerCase();
    if (v.includes('64'))
        return 'arm64';
    return 'arm32';
}
function buildSoNameMapJsonFromEntries(entries) {
    const root = {};
    for (const row of entries || []) {
        const pkg = String(row?.packageName || '').trim();
        const ver = String(row?.version || '').trim() || 'default';
        const soName = String(row?.soName || '').trim();
        const arm32 = String(row?.arm32Path || '').trim();
        const arm64 = String(row?.arm64Path || '').trim();
        if (!pkg || !soName)
            continue;
        if (!root[pkg])
            root[pkg] = {};
        if (!root[pkg][ver])
            root[pkg][ver] = {};
        root[pkg][ver][soName] = {};
        if (arm32)
            root[pkg][ver][soName].arm32 = arm32;
        if (arm64)
            root[pkg][ver][soName].arm64 = arm64;
    }
    return JSON.stringify(root);
}
function pickSoNameMapByPackageAndVersion(text, packageName, appversion) {
    const raw = String(text || '').trim();
    if (!raw)
        throw new Error('so_name_map is empty');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
        throw new Error('so_name_map must be a JSON object');
    const pkg = String(packageName || '').trim();
    const container = pkg ? parsed[pkg] : parsed;
    if (pkg) {
        if (!container || typeof container !== 'object' || Array.isArray(container))
            throw new Error(`so_name_map missing packageName: ${pkg}`);
    }
    const ver = String(appversion || '').trim();
    const selected = ver ? container?.[ver] : (container?.default ?? container?.latest ?? container);
    if (ver) {
        if (!selected || typeof selected !== 'object' || Array.isArray(selected))
            throw new Error(`so_name_map missing version: ${ver}${pkg ? ` packageName: ${pkg}` : ''}`);
    }
    return selected;
}
function resolveSymbolPath(symbolsRoot, p) {
    const raw = String(p || '').trim();
    if (!raw)
        return '';
    if ((0, path_1.isAbsolute)(raw))
        return raw;
    const root = (0, path_1.normalize)(String(symbolsRoot || '').trim() || '');
    const cand = (0, path_1.normalize)(raw);
    if (root && (cand === root || cand.startsWith(root + '\\') || cand.startsWith(root + '/'))) {
        return raw;
    }
    if (!root)
        return raw;
    return (0, path_1.join)(root, raw);
}
class CrashParse {
    constructor() {
        this.description = {
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
                    displayName: "pakageName",
                    name: 'pakageName',
                    type: 'string',
                    default: '={{$json.bundleId|| ""}}',
                    required: false,
                    description: '包名',
                },
                {
                    displayName: '符号表映射',
                    name: 'soNameMapForm',
                    type: 'fixedCollection',
                    default: {},
                    required: false,
                    typeOptions: { multipleValues: true },
                    options: [
                        {
                            name: 'rows',
                            displayName: 'Mappings',
                            values: [
                                { displayName: 'Package Name', name: 'packageName', type: 'string', default: '' },
                                { displayName: 'Version', name: 'version', type: 'string', default: 'default' },
                                {
                                    displayName: 'so Name', name: 'soName', type: 'options', default: '', options: [
                                        { displayName: 'libunity.so', name: 'libunity.so', value: 'libunity.so' },
                                        { displayName: 'libil2cpp.so', name: 'libil2cpp.so', value: 'libil2cpp.so' },
                                    ]
                                },
                                { displayName: 'arm64 Path', name: 'arm64Path', type: 'string', default: '' },
                            ],
                        },
                    ],
                    description: '用表单配置 packageName/version/soName/arm32/arm64，执行时会自动组装成映射。Version 为空时按 default 处理。',
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
    }
    async execute() {
        const items = this.getInputData();
        const out = [];
        for (let i = 0; i < items.length; i++) {
            try {
                const callStack = this.getNodeParameter('callStack', i);
                const symbolsRoot = this.getNodeParameter('symbolsRoot', i);
                const appversion = this.getNodeParameter('appversion', i);
                const pakageName = this.getNodeParameter('pakageName', i);
                const soNameMapText = buildSoNameMapJsonFromEntries(this.getNodeParameter('soNameMapForm', i)?.rows || []);
                const addr2linePath = this.getNodeParameter('addr2linePath', i);
                const readelfPath = this.getNodeParameter('readelfPath', i);
                debug_flag = this.getNodeParameter('debug', i);
                const soNameMap = pickSoNameMapByPackageAndVersion(soNameMapText, pakageName, appversion);
                const frames = parseBuglyCallStack(callStack);
                const archFolder = normalizeArchFolder(frames.find((f) => f.arch)?.arch || '');
                const buildIdLocalCacheByPath = {};
                const parsedFrames = [];
                for (const f of frames) {
                    if (!f.logBuildId) {
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
                        await fs_1.promises.access(symbolPathFromMap);
                    }
                    catch {
                        throw new Error(`Symbol file not found for ${f.soName} cpu=${cpuKey}: ${symbolPathFromMap}`);
                    }
                    const symbolPath = symbolPathFromMap;
                    let buildIdOk = null;
                    let localBuildId = '';
                    if (buildIdLocalCacheByPath[symbolPath] === undefined) {
                        try {
                            const text = await execFileText(readelfPath, ['-n', symbolPath]);
                            if (debug_flag)
                                console.log(`readelf ${symbolPath}: ${text}`);
                            buildIdLocalCacheByPath[symbolPath] = buildIdFromReadelfOutput(text);
                        }
                        catch (err) {
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
                        if (debug_flag)
                            console.log(`addr2line ${symbolPath} ${f.pc}: ${addr2lineText}`);
                        const lines = addr2lineText
                            .split(/\r?\n/)
                            .map((l) => l.trim())
                            .filter((l) => l.length > 0);
                        func = lines[0] ?? '';
                        fileLine = lines[1] ?? '';
                    }
                    catch (e) {
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
            }
            catch (error) {
                throw new n8n_workflow_1.NodeApiError(this.getNode(), error, { itemIndex: i });
            }
        }
        return [out];
    }
}
exports.CrashParse = CrashParse;
