"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const WechatMsgSignUtils_1 = __importDefault(require("../../../help/utils/WechatMsgSignUtils"));
const xml_js_1 = __importDefault(require("xml-js"));
exports.default = {
    name: '消息加密',
    value: 'sign:encrypt',
    options: [
        {
            displayName: '消息加密，根据配置加密，最后请使用 response节点进行响应',
            name: 'notice',
            type: 'notice',
            default: '',
        },
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
            type: 'json',
            default: '',
            typeOptions: { rows: 5 },
            displayOptions: {
                show: {
                    dataFormat: ['json'],
                },
            },
            required: true,
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
        const token = this.getNodeParameter('token', index);
        const aesKey = this.getNodeParameter('aesKey', index);
        const content = this.getNodeParameter('content', index);
        const dataFormat = this.getNodeParameter('dataFormat', index, 'xml');
        const credentials = await this.getCredentials('wechatOfficialAccountCredentialsApi');
        const appId = credentials.appid;
        let body;
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
        return {
            body,
        };
    },
};
//# sourceMappingURL=SignEncryptOperate.js.map