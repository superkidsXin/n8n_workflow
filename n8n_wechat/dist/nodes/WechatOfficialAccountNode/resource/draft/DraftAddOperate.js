"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const NodeUtils_1 = __importDefault(require("../../../help/utils/NodeUtils"));
const DraftAddOperate = {
    name: '新建草稿',
    value: 'draft:add',
    description: '新增草稿',
    options: [
        {
            displayName: '草稿文章对象内容(Articles)',
            name: 'articles',
            type: 'json',
            required: true,
            default: '[]',
            description: '参考文档：https://developers.weixin.qq.com/doc/offiaccount/Draft_Box/Add_draft.html',
        },
    ],
    async call(index) {
        const articles = NodeUtils_1.default.getNodeJsonData(this, 'articles', index);
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/draft/add`,
            body: {
                articles,
            },
        });
    },
};
exports.default = DraftAddOperate;
//# sourceMappingURL=DraftAddOperate.js.map