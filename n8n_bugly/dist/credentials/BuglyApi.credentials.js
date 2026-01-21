"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuglyApi = void 0;
class BuglyApi {
    constructor() {
        this.name = 'buglyApi';
        this.displayName = 'Bugly API';
        this.properties = [
            {
                displayName: 'Cookie',
                name: 'cookie',
                type: 'string',
                default: '',
                typeOptions: { password: true },
                description: '从浏览器复制 Bugly 的 Cookie（整串，形如 RK=...; bugly_session=...; token-skey=...）',
                required: true,
            },
            {
                displayName: 'X-Token',
                name: 'xToken',
                type: 'string',
                default: '',
                typeOptions: { password: true },
                description: '请求头 X-token 的值（从浏览器 Network 里复制）',
                required: true,
            },
            {
                displayName: 'User-Agent',
                name: 'userAgent',
                type: 'string',
                default: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                description: '可选：请求头 User-Agent',
                required: false,
            },
        ];
    }
}
exports.BuglyApi = BuglyApi;
