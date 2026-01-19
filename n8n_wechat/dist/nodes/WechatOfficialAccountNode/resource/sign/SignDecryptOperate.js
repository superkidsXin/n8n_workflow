"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const n8n_workflow_1 = require("n8n-workflow");
const WechatMsgSignUtils_1 = __importDefault(require("../../../help/utils/WechatMsgSignUtils"));
exports.default = {
    name: '消息解密',
    value: 'sign:decrypt',
    options: [
        {
            displayName: 'Signature',
            description: 'Webhook query 传的参数',
            name: 'signature',
            type: 'string',
            default: '',
            required: true,
        },
        {
            displayName: 'Timestamp',
            description: 'Webhook query 传的参数',
            name: 'timestamp',
            type: 'string',
            default: '',
            required: true,
        },
        {
            displayName: 'Nonce',
            description: 'Webhook query 传的参数',
            name: 'nonce',
            type: 'string',
            default: '',
            required: true,
        },
        {
            displayName: 'EncryptType',
            description: 'Webhook query 传的参数',
            name: 'encrypt_type',
            type: 'string',
            default: '',
            required: true,
        },
        {
            displayName: '加密数据',
            description: 'Webhook body 传的参数',
            name: 'encrypt_str',
            type: 'string',
            default: '',
        },
        {
            displayName: '令牌(Token)',
            name: 'token',
            type: 'string',
            default: '',
            required: true,
        },
        {
            displayName: '消息加解密密钥 (EncodingAESKey)',
            name: 'aesKey',
            type: 'string',
            default: '',
        },
    ],
    async call(index) {
        const signature = this.getNodeParameter('signature', index);
        const timestamp = this.getNodeParameter('timestamp', index);
        const nonce = this.getNodeParameter('nonce', index);
        const encryptType = this.getNodeParameter('encrypt_type', index);
        const encryptStr = this.getNodeParameter('encrypt_str', index);
        const token = this.getNodeParameter('token', index);
        const aesKey = this.getNodeParameter('aesKey', index, '');
        if (!signature || !timestamp || !nonce) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), {
                message: 'Invalid signature',
                query: {
                    signature,
                    timestamp,
                    nonce,
                },
            });
        }
        if (!WechatMsgSignUtils_1.default.checkSignature(token, signature, timestamp, nonce)) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), {
                message: 'Invalid signature',
                query: {
                    signature,
                    timestamp,
                    nonce,
                },
            });
        }
        if (encryptType && encryptType === 'aes') {
            try {
                const decryptObject = WechatMsgSignUtils_1.default.decrypt(encryptStr, aesKey);
                return decryptObject.xml;
            }
            catch (error) {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), {
                    message: 'Decrypt Msg Error',
                    error: error,
                });
            }
        }
        return {};
    },
};
//# sourceMappingURL=SignDecryptOperate.js.map