"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const UserGetOperate = {
    name: '获取用户信息',
    value: 'user:info',
    description: '获取用户基本信息',
    options: [
        {
            displayName: 'OpenID',
            name: 'openid',
            type: 'string',
            required: true,
            default: '',
            description: '普通用户的标识，对当前公众号唯一',
        },
        {
            displayName: '语言',
            name: 'lang',
            type: 'string',
            default: 'zh_CN',
            description: '返回国家地区语言版本，zh_CN 简体，zh_TW 繁体，en 英语',
        },
    ],
    async call(index) {
        const openid = this.getNodeParameter('openid', index);
        const lang = this.getNodeParameter('lang', index);
        const query = {
            openid,
            lang,
        };
        return RequestUtils_1.default.request.call(this, {
            method: 'GET',
            url: `/cgi-bin/user/info`,
            qs: query,
        });
    }
};
exports.default = UserGetOperate;
//# sourceMappingURL=UserGetOperate.js.map