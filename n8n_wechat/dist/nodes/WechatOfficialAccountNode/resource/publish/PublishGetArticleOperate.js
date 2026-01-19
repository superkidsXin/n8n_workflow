"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const PublishGetArticleOperate = {
    name: '获取已发布文章',
    value: 'publish:getArticle',
    description: '通过 article_id 获取已发布的图文信息',
    options: [
        {
            displayName: '文章ID',
            name: 'article_id',
            type: 'string',
            required: true,
            default: '',
            description: '要获取的草稿的 article_id',
        },
    ],
    async call(index) {
        const articleId = this.getNodeParameter('article_id', index);
        const body = {
            article_id: articleId,
        };
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/freepublish/getarticle`,
            body,
        });
    },
};
exports.default = PublishGetArticleOperate;
//# sourceMappingURL=PublishGetArticleOperate.js.map