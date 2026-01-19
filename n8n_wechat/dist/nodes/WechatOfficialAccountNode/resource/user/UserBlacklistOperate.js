"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const UserBlacklistOperate = {
    name: '获取黑名单列表',
    value: 'user:getBlacklist',
    description: '获取账号的黑名单列表',
    options: [],
    async call(index) {
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/tags/members/getblacklist`,
            body: {},
        });
    }
};
exports.default = UserBlacklistOperate;
//# sourceMappingURL=UserBlacklistOperate.js.map