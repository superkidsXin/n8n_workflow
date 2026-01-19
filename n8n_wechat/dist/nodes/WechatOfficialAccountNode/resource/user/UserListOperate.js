"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const UserListOperate = {
    name: '获取用户列表',
    value: 'user:getList',
    description: '获取账号的关注者列表',
    options: [
        {
            displayName: '下一批OpenID',
            name: 'next_openid',
            type: 'string',
            default: '',
            description: '上一批列表的最后一个OPENID，不填默认从头开始拉取',
        },
    ],
    async call(index) {
        const next_openid = this.getNodeParameter('next_openid', index);
        const data = {};
        if (next_openid) {
            data.next_openid = next_openid;
        }
        return RequestUtils_1.default.request.call(this, {
            method: 'GET',
            url: `/cgi-bin/user/get`,
            qs: data,
        });
    }
};
exports.default = UserListOperate;
//# sourceMappingURL=UserListOperate.js.map