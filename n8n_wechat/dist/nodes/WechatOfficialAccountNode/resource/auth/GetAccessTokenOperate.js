"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
exports.default = {
    name: '获取AccessToken',
    value: 'auth:getAccessToken',
    options: [],
    async call(index) {
        await RequestUtils_1.default.request.call(this, {
            method: 'GET',
            url: `/cgi-bin/get_api_domain_ip`,
        });
        const credentials = await this.getCredentials('wechatOfficialAccountCredentialsApi');
        return {
            accessToken: credentials.accessToken,
        };
    },
};
//# sourceMappingURL=GetAccessTokenOperate.js.map