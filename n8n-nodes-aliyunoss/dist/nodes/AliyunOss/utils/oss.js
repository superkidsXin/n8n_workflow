"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeObjectKey = sanitizeObjectKey;
exports.sanitizeFileName = sanitizeFileName;
exports.createOssClient = createOssClient;
exports.objectExists = objectExists;
const ali_oss_1 = __importDefault(require("ali-oss"));
function sanitizeObjectKey(key) {
    return key.replace(/^[\\/]+/, '').replace(/[\\]+/g, '/');
}
function sanitizeFileName(name) {
    const cleaned = name.replace(/[\\/:*?"<>|]/g, '_').trim();
    return cleaned.length > 0 ? cleaned : 'file';
}
function createOssClient(cred) {
    return new ali_oss_1.default({
        region: cred.region,
        bucket: cred.bucket,
        accessKeyId: cred.accessKeyId,
        accessKeySecret: cred.accessKeySecret,
        endpoint: cred.endpoint || undefined,
        cname: !!cred.cname,
        secure: cred.secure !== false,
    });
}
async function objectExists(client, key) {
    try {
        const meta = await client.head(key);
        return { exists: true, meta };
    }
    catch (e) {
        const code = String((e === null || e === void 0 ? void 0 : e.code) || (e === null || e === void 0 ? void 0 : e.name) || '').toLowerCase();
        const status = Number((e === null || e === void 0 ? void 0 : e.status) || (e === null || e === void 0 ? void 0 : e.statusCode) || 0);
        if (status === 404 || code.includes('nosuchkey') || code.includes('nosuchobject') || code.includes('notfound')) {
            return { exists: false };
        }
        throw e;
    }
}
//# sourceMappingURL=oss.js.map