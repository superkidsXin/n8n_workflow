"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const ShortenGenOperate = {
    name: '生成短Key',
    value: 'other:shorten:gen',
    description: '将长信息转换为短key',
    options: [
        {
            displayName: '长信息',
            name: 'long_data',
            type: 'string',
            required: true,
            default: '',
            description: '需要转换的长信息，不超过4KB',
        },
        {
            displayName: '过期秒数',
            name: 'expire_seconds',
            type: 'number',
            default: 2592000,
            description: '过期秒数，最大值为2592000（即30天），默认为2592000',
        },
    ],
    async call(index) {
        const longData = this.getNodeParameter('long_data', index);
        const expireSeconds = this.getNodeParameter('expire_seconds', index);
        const body = {
            long_data: longData,
            expire_seconds: expireSeconds,
        };
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/shorten/gen`,
            body,
        });
    },
};
exports.default = ShortenGenOperate;
//# sourceMappingURL=ShortenGenOperate.js.map