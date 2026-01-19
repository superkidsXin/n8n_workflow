"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const n8n_workflow_1 = require("n8n-workflow");
class RequestUtils {
    static async originRequest(options, clearAccessToken = false) {
        const credentials = await this.getCredentials('wechatOfficialAccountCredentialsApi');
        options.baseURL = `https://${credentials.baseUrl}`;
        return this.helpers.requestWithAuthentication.call(this, 'wechatOfficialAccountCredentialsApi', options, {
            credentialsDecrypted: {
                data: {
                    ...credentials,
                    accessToken: clearAccessToken ? '' : credentials.accessToken,
                },
            },
        });
    }
    static async request(options) {
        return RequestUtils.originRequest.call(this, options).then((text) => {
            const data = JSON.parse(text);
            if (data.errcode && data.errcode === 42001) {
                return RequestUtils.originRequest.call(this, options, true)
                    .then((text) => {
                    const data = JSON.parse(text);
                    if (data.errcode && data.errcode !== 0) {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Request Error: ${data.errcode}, ${data.errmsg}`);
                    }
                    return data;
                });
            }
            if (data.errcode && data.errcode !== 0) {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Request Error: ${data.errcode}, ${data.errmsg}`);
            }
            return data;
        });
    }
}
exports.default = RequestUtils;
//# sourceMappingURL=RequestUtils.js.map