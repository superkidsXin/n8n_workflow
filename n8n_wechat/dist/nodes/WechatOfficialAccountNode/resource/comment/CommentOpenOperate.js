"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const CommentOpenOperate = {
    name: '打开评论',
    value: 'comment:open',
    description: '打开已群发文章的评论',
    options: [
        {
            displayName: '消息数据ID',
            name: 'msg_data_id',
            type: 'string',
            required: true,
            default: '',
            description: '群发返回的 msg_data_id',
        },
        {
            displayName: '图文索引',
            name: 'index',
            type: 'number',
            default: 0,
            description: '多图文时，用来指定第几篇图文，从0开始，不带默认操作该 msg_data_id 的第一篇图文',
        },
    ],
    async call(index) {
        const msgDataId = this.getNodeParameter('msg_data_id', index);
        const articleIndex = this.getNodeParameter('index', index);
        const body = {
            msg_data_id: msgDataId,
            index: articleIndex,
        };
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/comment/open`,
            body,
        });
    },
};
exports.default = CommentOpenOperate;
//# sourceMappingURL=CommentOpenOperate.js.map