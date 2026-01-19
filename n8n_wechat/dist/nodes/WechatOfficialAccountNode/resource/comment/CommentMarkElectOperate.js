"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const CommentMarkElectOperate = {
    name: '标记精选',
    value: 'comment:markelect',
    description: '将评论标记精选',
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
        {
            displayName: '用户评论ID',
            name: 'user_comment_id',
            type: 'string',
            required: true,
            default: '',
        },
    ],
    async call(index) {
        const msgDataId = this.getNodeParameter('msg_data_id', index);
        const articleIndex = this.getNodeParameter('index', index);
        const userCommentId = this.getNodeParameter('user_comment_id', index);
        const body = {
            msg_data_id: msgDataId,
            index: articleIndex,
            user_comment_id: userCommentId,
        };
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/comment/markelect`,
            body,
        });
    },
};
exports.default = CommentMarkElectOperate;
//# sourceMappingURL=CommentMarkElectOperate.js.map