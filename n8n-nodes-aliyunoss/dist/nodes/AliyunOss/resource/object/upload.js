"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const n8n_workflow_1 = require("n8n-workflow");
const oss_1 = require("../../utils/oss");
const options = [
    {
        displayName: 'Binary Property',
        name: 'binaryProperty',
        type: 'string',
        default: 'file',
        required: true,
        description: 'Name of the binary property to upload (e.g. file, data)',
    },
    {
        displayName: 'Object Key Prefix',
        name: 'prefix',
        type: 'string',
        default: '',
        description: 'Optional prefix folder in OSS (e.g. feishu-docx/2026-01)',
    },
    {
        displayName: 'Object Key',
        name: 'objectKey',
        type: 'string',
        default: '',
        description: 'Optional full object key. If empty, uses prefix + original file name.',
    },
    {
        displayName: 'Overwrite If Exists',
        name: 'overwrite',
        type: 'boolean',
        default: true,
    },
    {
        displayName: 'Return Signed URL',
        name: 'signedUrl',
        type: 'boolean',
        default: false,
        description: 'If enabled, returns a signed URL (for private buckets)',
    },
    {
        displayName: 'Signed URL Expire Seconds',
        name: 'signedUrlExpires',
        type: 'number',
        default: 3600,
        displayOptions: { show: { signedUrl: [true] } },
    },
];
async function call(itemIndex) {
    var _a;
    const cred = await this.getCredentials('aliyunOssApi');
    const client = (0, oss_1.createOssClient)(cred);
    const binaryProperty = this.getNodeParameter('binaryProperty', itemIndex);
    const prefix = this.getNodeParameter('prefix', itemIndex);
    const objectKeyParam = this.getNodeParameter('objectKey', itemIndex);
    const overwrite = this.getNodeParameter('overwrite', itemIndex);
    const signedUrl = this.getNodeParameter('signedUrl', itemIndex);
    const signedUrlExpires = this.getNodeParameter('signedUrlExpires', itemIndex);
    const item = this.getInputData()[itemIndex];
    const bin = (_a = item.binary) === null || _a === void 0 ? void 0 : _a[binaryProperty];
    if (!bin) {
        throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Binary property "${binaryProperty}" is missing`, { itemIndex });
    }
    const buf = await this.helpers.getBinaryDataBuffer(itemIndex, binaryProperty);
    const fileName = (0, oss_1.sanitizeFileName)(String(bin.fileName || 'file'));
    const key = (0, oss_1.sanitizeObjectKey)((objectKeyParam === null || objectKeyParam === void 0 ? void 0 : objectKeyParam.trim())
        ? objectKeyParam.trim()
        : (prefix ? `${prefix.replace(/\/+$/, '')}/` : '') + fileName);
    if (!overwrite) {
        const ex = await (0, oss_1.objectExists)(client, key);
        if (!ex.exists)
            await client.put(key, buf);
    }
    else {
        await client.put(key, buf);
    }
    const url = signedUrl
        ? client.signatureUrl(key, { expires: Math.max(1, Number(signedUrlExpires) || 3600) })
        : client.generateObjectUrl(key);
    const json = { key, url, fileName };
    if (item.json && typeof item.json === 'object') {
        const j = item.json;
        if (j.fileToken)
            json.fileToken = j.fileToken;
        if (j.document_id)
            json.document_id = j.document_id;
    }
    return json;
}
const op = {
    name: 'Upload',
    value: 'upload',
    description: 'Upload a binary file to Aliyun OSS and return a URL',
    options,
    call,
    order: 100,
};
exports.default = op;
//# sourceMappingURL=upload.js.map