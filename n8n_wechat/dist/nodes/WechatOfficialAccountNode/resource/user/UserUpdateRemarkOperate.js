"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const UserUpdateRemarkOperate = {
    name: '设置用户备注名',
    value: 'user:updateRemark',
    options: [
        {
            displayName: 'OpenID',
            name: 'openid',
            type: 'string',
            required: true,
            default: '',
            description: '用户标识',
        },
        {
            displayName: '备注名',
            name: 'remark',
            type: 'string',
            required: true,
            default: '',
            description: '新的备注名，长度必须小于30字节',
        },
    ],
    async call(index) {
        const openid = this.getNodeParameter('openid', index);
        const remark = this.getNodeParameter('remark', index);
        const body = {
            openid,
            remark,
        };
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/user/info/updateremark`,
            body,
        });
    }
};
exports.default = UserUpdateRemarkOperate;
//# sourceMappingURL=UserUpdateRemarkOperate.js.map