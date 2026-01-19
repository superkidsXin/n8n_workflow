"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const TagDeleteOperate = {
    name: '删除标签',
    value: 'tag:delete',
    description: '删除一个标签',
    options: [
        {
            displayName: '标签ID',
            name: 'id',
            type: 'number',
            required: true,
            default: null,
        },
    ],
    async call(index) {
        const id = this.getNodeParameter('id', index);
        const body = {
            tag: { id },
        };
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/tags/delete`,
            body,
        });
    }
};
exports.default = TagDeleteOperate;
//# sourceMappingURL=TagDeleteOperate.js.map