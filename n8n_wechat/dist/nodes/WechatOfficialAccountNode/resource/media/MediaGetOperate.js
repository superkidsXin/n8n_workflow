"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const MediaGetOperate = {
    name: '获取临时素材',
    value: 'media:get',
    options: [
        {
            displayName: '媒体文件ID',
            name: 'media_id',
            type: 'string',
            required: true,
            default: '',
        },
    ],
    async call(index) {
        const mediaId = this.getNodeParameter('media_id', index);
        return RequestUtils_1.default.request.call(this, {
            method: 'GET',
            url: `/cgi-bin/media/get`,
            qs: {
                media_id: mediaId,
            },
        });
    },
};
exports.default = MediaGetOperate;
//# sourceMappingURL=MediaGetOperate.js.map