"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const TagGetUserListOperate = {
    name: '获取标签下粉丝列表',
    value: 'tag:getUserList',
    description: '获取标签下的粉丝列表',
    options: [
        {
            displayName: '标签ID',
            name: 'tagid',
            type: 'number',
            required: true,
            default: null,
        },
        {
            displayName: '起始OpenID',
            name: 'next_openid',
            type: 'string',
            default: '',
            description: '第一个拉取的OpenID，不填默认从头开始拉取',
        },
    ],
    async call(index) {
        const tagid = this.getNodeParameter('tagid', index);
        const nextOpenId = this.getNodeParameter('next_openid', index);
        const body = {
            tagid,
            next_openid: nextOpenId,
        };
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/user/tag/get`,
            body,
        });
    }
};
exports.default = TagGetUserListOperate;
//# sourceMappingURL=TagGetUserListOperate.js.map