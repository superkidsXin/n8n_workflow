"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const ShortenFetchOperate = {
    name: '获取长信息',
    value: 'other:shorten:fetch',
    description: '通过短key获取长信息',
    options: [
        {
            displayName: '短Key',
            name: 'short_key',
            type: 'string',
            required: true,
            default: '',
        },
    ],
    async call(index) {
        const shortKey = this.getNodeParameter('short_key', index);
        const body = {
            short_key: shortKey,
        };
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/shorten/fetch`,
            body,
        });
    },
};
exports.default = ShortenFetchOperate;
//# sourceMappingURL=ShortenFetchOperate.js.map