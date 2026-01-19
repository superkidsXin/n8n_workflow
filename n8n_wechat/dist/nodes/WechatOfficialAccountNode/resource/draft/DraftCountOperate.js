"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const DraftCountOperate = {
    name: '获取草稿总数',
    value: 'draft:count',
    description: '获取草稿的总数',
    options: [],
    async call(index) {
        return RequestUtils_1.default.request.call(this, {
            method: 'GET',
            url: `/cgi-bin/draft/count`,
        });
    },
};
exports.default = DraftCountOperate;
//# sourceMappingURL=DraftCountOperate.js.map