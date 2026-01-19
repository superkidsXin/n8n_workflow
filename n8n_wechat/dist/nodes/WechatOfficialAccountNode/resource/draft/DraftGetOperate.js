"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const DraftGetOperate = {
    name: '获取草稿',
    value: 'draft:get',
    options: [
        {
            displayName: '草稿ID',
            name: 'media_id',
            type: 'string',
            required: true,
            default: '',
            description: '要获取的草稿的media_id',
        },
    ],
    async call(index) {
        const mediaId = this.getNodeParameter('media_id', index);
        const body = {
            media_id: mediaId,
        };
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/draft/get`,
            body,
        });
    },
};
exports.default = DraftGetOperate;
//# sourceMappingURL=DraftGetOperate.js.map