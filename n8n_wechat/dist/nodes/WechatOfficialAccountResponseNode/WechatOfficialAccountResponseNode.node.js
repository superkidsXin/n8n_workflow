"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatOfficialAccountResponseNode = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const WechatMsgSignUtils_1 = __importDefault(require("../help/utils/WechatMsgSignUtils"));
const xml_js_1 = __importDefault(require("xml-js"));
class WechatOfficialAccountResponseNode {
    constructor() {
        this.description = {
            displayName: 'Wechat Official Account Response',
            name: 'wechatOfficialAccountResponseNode',
            icon: 'file:icon.png',
            description: 'Wechat Official Account Response',
            group: ['transform'],
            version: 1,
            defaults: {
                name: 'Wechat Official Account Response',
            },
            hints: [{ message: '用于处理微信公众号的响应数据，请最后使用response节点进行响应' }],
            inputs: ['main'],
            outputs: ['main'],
            properties: [
                {
                    displayName: '响应数据格式',
                    name: 'dataFormat',
                    type: 'options',
                    options: [
                        {
                            name: 'XML',
                            value: 'xml',
                        },
                        {
                            name: 'JSON',
                            value: 'json',
                        },
                    ],
                    default: 'xml',
                },
                {
                    displayName: '响应数据',
                    name: 'content',
                    type: 'string',
                    default: '',
                    typeOptions: { rows: 5 },
                    required: true,
                    displayOptions: {
                        show: {
                            dataFormat: ['xml'],
                        },
                    },
                },
                {
                    displayName: '响应数据',
                    name: 'content',
                    type: 'string',
                    default: '',
                    typeOptions: { rows: 5 },
                    displayOptions: {
                        show: {
                            dataFormat: ['json'],
                        },
                    },
                    required: true,
                },
            ],
        };
    }
    async execute() {
        const parentNodes = this.getParentNodes(this.getNode().name);
        const trigger = parentNodes.find((node) => node.type.includes('wechatOfficialAccountTrigger'));
        if (!trigger) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'No connected Wechat Official Account Trigger node found');
        }
        const content = this.getNodeParameter('content', 0);
        const dataFormat = this.getNodeParameter('dataFormat', 0, 'xml');
        const workflowData = this.getWorkflowStaticData('global');
        if (!workflowData) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'No workflow data found');
        }
        const signatureType = workflowData === null || workflowData === void 0 ? void 0 : workflowData.signatureType;
        let body;
        if (signatureType === 'aes') {
            const token = workflowData.token;
            const aesKey = workflowData.aesKey;
            const appId = workflowData.appId;
            body = WechatMsgSignUtils_1.default.encryptResponse(content, aesKey, token, appId);
            if (dataFormat === 'xml') {
                body = xml_js_1.default.js2xml({
                    xml: body,
                }, {
                    indentCdata: true,
                    compact: true,
                    ignoreComment: true,
                    spaces: 4,
                    textFn: (value, currentElementName, currentElementObj) => {
                        if (typeof currentElementObj !== 'string')
                            return value;
                        return `<![CDATA[${value}]]>`;
                    },
                });
            }
        }
        else {
            body = content;
        }
        let headers = {};
        if (dataFormat === 'xml') {
            headers['Content-Type'] = 'application/xml';
        }
        this.sendResponse({
            headers: headers,
            statusCode: 200,
            body: body,
        });
        return [this.helpers.returnJsonArray({
                body: body
            })];
    }
}
exports.WechatOfficialAccountResponseNode = WechatOfficialAccountResponseNode;
//# sourceMappingURL=WechatOfficialAccountResponseNode.node.js.map