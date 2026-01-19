"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const NodeUtils_1 = __importDefault(require("../../../help/utils/NodeUtils"));
const TemplateSendOperate = {
    name: '发送模板消息',
    value: 'template:send',
    options: [
        {
            displayName: '接收者Openid',
            name: 'touser',
            type: 'string',
            required: true,
            default: '',
        },
        {
            displayName: '模板ID',
            name: 'template_id',
            type: 'string',
            required: true,
            default: '',
        },
        {
            displayName: '模板跳转链接',
            name: 'url',
            type: 'string',
            default: '',
            description: '模板跳转链接（海外账号没有跳转能力）',
        },
        {
            displayName: '小程序',
            name: 'miniprogram',
            type: 'collection',
            default: {
                appid: '',
                pagepath: '',
            },
            description: '跳小程序所需数据，不需跳小程序可不用传该数据',
            options: [
                {
                    displayName: '小程序Appid',
                    name: 'appid',
                    type: 'string',
                    default: '',
                    description: '所需跳转到的小程序appid',
                },
                {
                    displayName: '小程序页面路径',
                    name: 'pagepath',
                    type: 'string',
                    default: '',
                    description: '所需跳转到小程序的具体页面路径，支持带参数,（示例index?foo=bar），要求该小程序已发布，暂不支持小游戏',
                },
            ],
        },
        {
            displayName: '模板数据',
            name: 'data',
            type: 'json',
            required: true,
            default: '{}',
            description: '参考 https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Template_Message_Interface.html#发送模板消息',
        },
        {
            displayName: '防重入ID',
            name: 'client_msg_id',
            type: 'string',
            default: '',
        },
    ],
    async call(index) {
        const touser = this.getNodeParameter('touser', index);
        const template_id = this.getNodeParameter('template_id', index);
        const data = NodeUtils_1.default.getNodeJsonData(this, 'data', index);
        const body = {
            touser,
            template_id,
            data,
        };
        const url = this.getNodeParameter('url', index);
        if (url) {
            body.url = url;
        }
        const miniprogram = this.getNodeParameter('miniprogram', index);
        if (miniprogram && miniprogram.appid) {
            body.miniprogram = miniprogram;
        }
        const client_msg_id = this.getNodeParameter('client_msg_id', index);
        if (client_msg_id) {
            body.client_msg_id = client_msg_id;
        }
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/message/template/send`,
            body,
        });
    },
};
exports.default = TemplateSendOperate;
//# sourceMappingURL=TemplateSendOperate.js.map