"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const NodeUtils_1 = __importDefault(require("../../../help/utils/NodeUtils"));
const MediaUploadImageOperate = {
    name: '上传图文消息内的图片',
    value: 'media:uploadImage',
    description: "本接口所上传的图片不占用公众号的素材库中图片数量的100000个的限制。图片仅支持jpg/png格式，大小必须在1MB以下。",
    options: [
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
        const inputDataFieldName = this.getNodeParameter('inputDataFieldName', index);
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/media/uploadimg`,
            json: false,
            formData: {
                media: await NodeUtils_1.default.buildUploadFileData.call(this, inputDataFieldName, index),
            },
        });
    },
};
exports.default = MediaUploadImageOperate;
//# sourceMappingURL=MediaUploadImageOperate.js.map