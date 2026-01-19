"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const DraftListOperate = {
    name: '获取草稿列表',
    value: 'draft:list',
    options: [
        {
            displayName: '偏移位置',
            name: 'offset',
            type: 'number',
            required: true,
            default: 0,
            description: '从全部素材的该偏移位置开始返回，0表示从第一个素材返回',
        },
        {
            displayName: '返回数量',
            name: 'count',
            type: 'number',
            required: true,
            default: 1,
            description: '返回素材的数量，取值在1到20之间',
        },
        {
            displayName: '是否返回内容',
            name: 'no_content',
            type: 'boolean',
            default: false,
        },
    ],
    async call(index) {
        const offset = this.getNodeParameter('offset', index);
        const count = this.getNodeParameter('count', index);
        const no_content = this.getNodeParameter('no_content', index);
        const body = {
            offset,
            count,
            no_content: no_content ? 1 : 0,
        };
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/draft/batchget`,
            body,
        });
    },
};
exports.default = DraftListOperate;
//# sourceMappingURL=DraftListOperate.js.map