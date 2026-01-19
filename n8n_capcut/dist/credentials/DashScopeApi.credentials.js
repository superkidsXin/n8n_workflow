"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashScopeApi = void 0;
class DashScopeApi {
    constructor() {
        this.name = 'dashScopeApi';
        this.displayName = 'DashScope API';
        this.documentationUrl = 'https://help.aliyun.com/zh/model-studio/';
        this.properties = [
            {
                displayName: 'API Key',
                name: 'apiKey',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                default: '',
            },
        ];
    }
}
exports.DashScopeApi = DashScopeApi;
