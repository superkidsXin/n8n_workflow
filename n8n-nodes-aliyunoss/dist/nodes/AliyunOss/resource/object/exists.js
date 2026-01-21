"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const n8n_workflow_1 = require("n8n-workflow");
const oss_1 = require("../../utils/oss");
const options = [
    {
        displayName: 'Object Key',
        name: 'objectKey',
        type: 'string',
        default: '',
        required: true,
        description: 'Object key to check (e.g. feishu-docx/xxx.png)',
    },
    {
        displayName: 'Include Metadata',
        name: 'includeMeta',
        type: 'boolean',
        default: false,
    },
];
async function call(itemIndex) {
    const cred = await this.getCredentials('aliyunOssApi');
    const client = (0, oss_1.createOssClient)(cred);
    const keyRaw = this.getNodeParameter('objectKey', itemIndex);
    const includeMeta = this.getNodeParameter('includeMeta', itemIndex);
    const key = (0, oss_1.sanitizeObjectKey)(String(keyRaw || '').trim());
    if (!key)
        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Object Key is empty', { itemIndex });
    const res = await (0, oss_1.objectExists)(client, key);
    const json = { key, exists: res.exists };
    if (includeMeta && res.exists)
        json.meta = res.meta;
    return json;
}
const op = {
    name: 'Exists',
    value: 'exists',
    description: 'Check whether an object exists in Aliyun OSS',
    options,
    call,
    order: 90,
};
exports.default = op;
//# sourceMappingURL=exists.js.map