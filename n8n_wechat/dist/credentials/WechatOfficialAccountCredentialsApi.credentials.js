"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatOfficialAccountCredentialsApi = void 0;
class WechatOfficialAccountCredentialsApi {
    constructor() {
        this.name = 'wechatOfficialAccountCredentialsApi';
        this.displayName = 'Wechat Official Account Credentials API';
        this.properties = [
            {
                displayName: 'Base URL',
                name: 'baseUrl',
                type: 'string',
                default: 'api.weixin.qq.com',
                required: true,
            },
            {
                displayName: 'Appid',
                description: '第三方用户唯一凭证，AppID和AppSecret可在“微信公众平台-设置与开发--基本配置”页中获得',
                name: 'appid',
                type: 'string',
                default: '',
                required: true,
            },
            {
                displayName: 'AppSecret',
                name: 'appsecret',
                description: '第三方用户唯一凭证密钥',
                type: 'string',
                default: '',
                required: true,
            },
            {
                displayName: 'AccessToken',
                name: 'accessToken',
                type: 'hidden',
                default: '',
                typeOptions: {
                    expirable: true,
                },
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {
                qs: {
                    access_token: '={{$credentials.accessToken}}',
                },
            },
        };
        this.test = {
            request: {
                baseURL: '=https://{{$credentials.baseUrl}}',
                url: '/cgi-bin/get_api_domain_ip',
            },
            rules: [
                {
                    type: 'responseSuccessBody',
                    properties: {
                        key: 'errcode',
                        value: 0,
                        message: '凭证验证失败',
                    },
                },
            ],
        };
    }
    async preAuthentication(credentials) {
        console.log('preAuthentication credentials', credentials);
        const res = (await this.helpers.httpRequest({
            method: 'GET',
            url: `https://${credentials.baseUrl}/cgi-bin/token?grant_type=client_credential&appid=${credentials.appid}&secret=${credentials.appsecret}`,
        }));
        console.log('preAuthentication', res);
        if (res.errcode && res.errcode !== 0) {
            throw new Error('授权失败：' + res.errcode + ', ' + res.errmsg);
        }
        return { accessToken: res.access_token };
    }
}
exports.WechatOfficialAccountCredentialsApi = WechatOfficialAccountCredentialsApi;
//# sourceMappingURL=WechatOfficialAccountCredentialsApi.credentials.js.map