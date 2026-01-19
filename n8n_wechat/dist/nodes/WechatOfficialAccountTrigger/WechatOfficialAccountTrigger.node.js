"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatOfficialAccountTrigger = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const WechatMsgSignUtils_1 = __importDefault(require("../help/utils/WechatMsgSignUtils"));
class WechatOfficialAccountTrigger {
    constructor() {
        this.description = {
            displayName: 'Wechat Official Account Trigger',
            name: 'wechatOfficialAccountTrigger',
            icon: 'file:icon.png',
            group: ['trigger'],
            version: 1,
            description: 'Triggers the workflow when Server-Sent Events occur',
            activationMessage: 'You can now make calls to your SSE URL to trigger executions.',
            defaults: {
                name: 'Wechat Official Account Trigger',
            },
            inputs: [],
            outputs: ['main'],
            credentials: [
                {
                    name: 'wechatOfficialAccountCredentialsApi',
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: 'Token',
                    name: 'token',
                    type: 'string',
                    typeOptions: { password: true },
                    default: '',
                    required: true,
                },
                {
                    displayName: '消息加密方式',
                    name: 'signatureType',
                    type: 'options',
                    options: [
                        {
                            name: '明文模式',
                            value: 'plaintext',
                        },
                        {
                            name: '兼容模式',
                            value: 'compatible',
                        },
                        {
                            name: '安全模式',
                            value: 'aes',
                        },
                    ],
                    default: 'plaintext',
                },
                {
                    displayName: 'EncodingAESKey',
                    name: 'aesKey',
                    type: 'string',
                    typeOptions: { password: true },
                    default: '',
                },
            ],
            webhooks: [
                {
                    name: 'setup',
                    httpMethod: 'GET',
                    path: 'wechat',
                    responseMode: 'responseNode'
                },
                {
                    name: 'default',
                    httpMethod: 'POST',
                    path: 'wechat',
                    responseMode: 'responseNode'
                },
            ],
        };
    }
    async webhook() {
        const query = this.getQueryData();
        const request = this.getRequestObject();
        const body = request.body;
        const token = this.getNodeParameter('token');
        const signatureType = this.getNodeParameter('signatureType');
        if (!query.signature || !query.timestamp || !query.nonce) {
            console.log('Invalid signature empty');
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), {
                message: 'Invalid signature',
                query: query,
            });
        }
        if (!WechatMsgSignUtils_1.default.checkSignature(token, query.signature, query.timestamp, query.nonce)) {
            console.log('Invalid signature false');
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), {
                message: 'Invalid signature',
                query: query,
            });
        }
        if (request.method === 'GET' && query.echostr) {
            const response = this.getResponseObject();
            response.send(query.echostr);
            return {
                noWebhookResponse: true,
            };
        }
        let workflowStaticData = this.getWorkflowStaticData('global');
        const encrypt_type = query.encrypt_type;
        if (encrypt_type && encrypt_type === 'aes') {
            if (!WechatMsgSignUtils_1.default.checkEncryptSignature(token, query.signature, query.timestamp, query.nonce, body.xml.Encrypt)) {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), {
                    message: 'Invalid Encrypt signature',
                    query: query,
                });
            }
            const aesKey = this.getNodeParameter('aesKey');
            if (!aesKey) {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'aesKey is required');
            }
            try {
                const decryptObject = WechatMsgSignUtils_1.default.decrypt(body.xml.encrypt, aesKey);
                body.xml = {
                    ...decryptObject.xml,
                    encrypt: body.xml.encrypt,
                };
                body.appId = decryptObject.appId;
                workflowStaticData.encrypt_type = encrypt_type;
                workflowStaticData.token = token;
                workflowStaticData.aesKey = aesKey;
                workflowStaticData.appId = decryptObject.appId;
            }
            catch (error) {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), {
                    message: 'Decrypt Msg Error',
                    error: error,
                });
            }
        }
        workflowStaticData.signatureType = signatureType;
        const data = {
            query,
            body,
        };
        return {
            workflowData: [this.helpers.returnJsonArray(data)],
        };
    }
}
exports.WechatOfficialAccountTrigger = WechatOfficialAccountTrigger;
//# sourceMappingURL=WechatOfficialAccountTrigger.node.js.map