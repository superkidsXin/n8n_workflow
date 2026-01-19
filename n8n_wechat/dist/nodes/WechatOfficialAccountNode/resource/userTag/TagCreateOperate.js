"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const TagCreateOperate = {
    name: '创建标签',
    value: 'tag:create',
    description: '创建一个新的标签',
    options: [
        {
            displayName: '标签名',
            name: 'name',
            type: 'string',
            required: true,
            default: '',
            description: '标签名（30个字符以内）',
        },
    ],
    async call(index) {
        const name = this.getNodeParameter('name', index);
        const body = {
            tag: { name },
        };
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/tags/create`,
            body,
        });
    }
};
exports.default = TagCreateOperate;
//# sourceMappingURL=TagCreateOperate.js.map