"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const TagGetOperate = {
    name: '获取标签列表',
    value: 'tag:get',
    description: '获取公众号已创建的标签',
    options: [],
    async call(index) {
        return RequestUtils_1.default.request.call(this, {
            method: 'GET',
            url: `/cgi-bin/tags/get`,
        });
    }
};
exports.default = TagGetOperate;
//# sourceMappingURL=TagGetOperate.js.map