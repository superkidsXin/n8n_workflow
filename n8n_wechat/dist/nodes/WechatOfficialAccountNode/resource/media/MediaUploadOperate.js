"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const NodeUtils_1 = __importDefault(require("../../../help/utils/NodeUtils"));
const MediaUploadOperate = {
    name: '上传临时素材',
    value: 'media:upload',
    description: '上传临时素材，media_id仅三天内有效',
    options: [
        {
            displayName: '媒体文件类型',
            name: 'type',
            type: 'options',
            options: [
                { name: '图片', value: 'image' },
                { name: '语音', value: 'voice' },
                { name: '视频', value: 'video' },
                { name: '缩略图', value: 'thumb' },
            ],
            default: 'image',
            required: true,
        },
        {
            displayName: '文件',
            name: 'inputDataFieldName',
            type: 'string',
            placeholder: 'e.g. data',
            default: 'data',
            hint: '包含用于更新文件的二进制文件数据的输入字段的名称',
            description: '在左侧输入面板的二进制选项卡中，找到包含二进制数据的输入字段的名称，以更新文件',
            required: true,
        },
    ],
    async call(index) {
        const type = this.getNodeParameter('type', index);
        const inputDataFieldName = this.getNodeParameter('inputDataFieldName', index);
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/media/upload`,
            qs: {
                type: type,
            },
            json: false,
            formData: {
                media: await NodeUtils_1.default.buildUploadFileData.call(this, inputDataFieldName, index),
            },
        });
    },
};
exports.default = MediaUploadOperate;
//# sourceMappingURL=MediaUploadOperate.js.map