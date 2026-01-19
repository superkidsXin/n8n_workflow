"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const NodeUtils_1 = __importDefault(require("../../../help/utils/NodeUtils"));
exports.default = {
    name: '新增其他类型永久素材',
    value: 'media:uploadOther',
    description: "图片（image）: 10M，支持bmp/png/jpeg/jpg/gif格式\n" +
        "语音（voice）：2M，播放长度不超过60s，mp3/wma/wav/amr格式\n" +
        "视频（video）：10MB，支持MP4格式\n" +
        "缩略图（thumb）：64KB，支持JPG格式",
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
            displayName: '文件Binary字段名',
            name: 'inputDataFieldName',
            type: 'string',
            placeholder: 'e.g. data',
            default: 'data',
            hint: '包含用于更新文件的二进制文件数据的输入字段的名称',
            description: '在左侧输入面板的二进制选项卡中，找到包含二进制数据的输入字段的名称，以更新文件',
            required: true,
        },
        {
            displayName: '视频素材的标题',
            name: 'videoTitle',
            type: 'string',
            default: '',
            description: '视频素材的标题，不超过30个字',
            required: true,
            displayOptions: {
                show: {
                    type: [
                        'video',
                    ],
                },
            }
        },
        {
            displayName: '视频素材的介绍',
            name: 'videoIntroduction',
            type: 'string',
            default: '',
            displayOptions: {
                show: {
                    type: [
                        'video',
                    ],
                },
            }
        },
    ],
    async call(index) {
        const type = this.getNodeParameter('type', index);
        const inputDataFieldName = this.getNodeParameter('inputDataFieldName', index);
        const formData = {
            media: await NodeUtils_1.default.buildUploadFileData.call(this, inputDataFieldName, index),
        };
        if (type === 'video') {
            const videoTitle = this.getNodeParameter('videoTitle', index);
            const videoIntroduction = this.getNodeParameter('videoIntroduction', index);
            formData.description = JSON.stringify({
                title: videoTitle,
                introduction: videoIntroduction
            });
        }
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/material/add_material`,
            json: false,
            qs: {
                type
            },
            formData: formData,
        });
    },
};
//# sourceMappingURL=MediaUploadOtherOperate.js.map