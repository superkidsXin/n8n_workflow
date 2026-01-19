"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const PublishDeleteOperate = {
    name: '删除发布',
    value: 'publish:delete',
    description: '删除已发布的文章',
    options: [
        {
            displayName: '文章ID',
            name: 'article_id',
            type: 'string',
            required: true,
            default: '',
            description: '成功发布时返回的 article_id',
        },
        {
            displayName: '文章位置',
            name: 'index',
            type: 'number',
            default: 0,
            description: '要删除的文章在图文消息中的位置，第一篇编号为1，该字段不填或填0会删除全部文章',
        },
    ],
    async call(index) {
        const articleId = this.getNodeParameter('article_id', index);
        const articleIndex = this.getNodeParameter('index', index);
        const body = {
            article_id: articleId,
            index: articleIndex,
        };
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/freepublish/delete`,
            body,
        });
    },
};
exports.default = PublishDeleteOperate;
//# sourceMappingURL=PublishDeleteOperate.js.map