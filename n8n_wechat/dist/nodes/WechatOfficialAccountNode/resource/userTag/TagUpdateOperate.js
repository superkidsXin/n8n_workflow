"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const TagUpdateOperate = {
    name: '编辑标签',
    value: 'tag:update',
    description: '编辑一个标签',
    options: [
        {
            displayName: '标签ID',
            name: 'id',
            type: 'number',
            required: true,
            default: null,
        },
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
        const id = this.getNodeParameter('id', index);
        const name = this.getNodeParameter('name', index);
        const body = {
            tag: { id, name },
        };
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/tags/update`,
            body,
        });
    }
};
exports.default = TagUpdateOperate;
//# sourceMappingURL=TagUpdateOperate.js.map