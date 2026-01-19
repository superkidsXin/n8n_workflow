"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const TagGetIdListOperate = {
    name: '获取用户身上的标签列表',
    value: 'tag:getIdList',
    options: [
        {
            displayName: 'OpenID',
            name: 'openid',
            type: 'string',
            required: true,
            default: '',
            description: '用户的OpenID',
        },
    ],
    async call(index) {
        const openid = this.getNodeParameter('openid', index);
        const body = {
            openid,
        };
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/tags/getidlist`,
            body,
        });
    }
};
exports.default = TagGetIdListOperate;
//# sourceMappingURL=TagGetIdListOperate.js.map