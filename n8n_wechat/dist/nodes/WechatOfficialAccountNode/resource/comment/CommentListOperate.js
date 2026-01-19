"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const CommentListOperate = {
    name: '查看评论',
    value: 'comment:list',
    description: '查看指定文章的评论数据',
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
            description: '多图文时，用来指定第几篇图文，从0开始，不带默认返回该 msg_data_id 的第一篇图文',
        },
        {
            displayName: '起始位置',
            name: 'begin',
            type: 'number',
            required: true,
            default: 0,
        },
        {
            displayName: '获取数目',
            name: 'count',
            type: 'number',
            required: true,
            default: 50,
            description: '获取数目（>=50会被拒绝）',
        },
        {
            displayName: '评论类型',
            name: 'type',
            type: 'options',
            required: true,
            default: 0,
            options: [
                {
                    name: '普通评论&精选评论',
                    value: 0,
                },
                {
                    name: '普通评论',
                    value: 1,
                },
                {
                    name: '精选评论',
                    value: 2,
                },
            ],
        },
    ],
    async call(index) {
        const msgDataId = this.getNodeParameter('msg_data_id', index);
        const articleIndex = this.getNodeParameter('index', index);
        const begin = this.getNodeParameter('begin', index);
        const count = this.getNodeParameter('count', index);
        const type = this.getNodeParameter('type', index);
        const body = {
            msg_data_id: msgDataId,
            index: articleIndex,
            begin,
            count,
            type,
        };
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/comment/list`,
            body,
        });
    },
};
exports.default = CommentListOperate;
//# sourceMappingURL=CommentListOperate.js.map