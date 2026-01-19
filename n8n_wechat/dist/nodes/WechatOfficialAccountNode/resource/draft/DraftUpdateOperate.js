"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const NodeUtils_1 = __importDefault(require("../../../help/utils/NodeUtils"));
const DraftUpdateOperate = {
    name: '修改草稿',
    value: 'draft:update',
    options: [
        {
            displayName: '草稿ID',
            name: 'media_id',
            type: 'string',
            required: true,
            default: '',
            description: '要修改的草稿的media_id',
        },
        {
            displayName: '要更新的文章在图文消息中的位置',
            name: 'index',
            type: 'number',
            required: true,
            default: 0,
            description: '要更新的文章在图文消息中的位置（多图文消息时，此字段才有意义），第一篇为0',
        },
        {
            displayName: '草稿对象(Articles)内容',
            name: 'articles',
            type: 'json',
            required: true,
            default: '{}',
            description: '草稿的内容，参考文档：https://developers.weixin.qq.com/doc/offiaccount/Draft_Box/Update_draft.html',
        },
    ],
    async call(index) {
        const media_id = this.getNodeParameter('media_id', index);
        const media_index = this.getNodeParameter('index', index);
        const articles = NodeUtils_1.default.getNodeJsonData(this, 'articles', index);
        const body = {
            media_id,
            index: media_index,
            articles,
        };
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/draft/update`,
            body,
        });
    },
};
exports.default = DraftUpdateOperate;
//# sourceMappingURL=DraftUpdateOperate.js.map