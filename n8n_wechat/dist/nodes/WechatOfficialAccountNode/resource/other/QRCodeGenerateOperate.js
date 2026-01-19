"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const QRCodeGenerateOperate = {
    name: '生成带参数的二维码',
    value: 'other:qrcode:generate',
    options: [
        {
            displayName: '二维码类型',
            name: 'action_name',
            type: 'options',
            options: [
                { name: '临时二维码', value: 'QR_STR_SCENE' },
                { name: '永久二维码', value: 'QR_LIMIT_STR_SCENE' },
            ],
            required: true,
            default: 'QR_STR_SCENE',
        },
        {
            displayName: '有效时间（秒）',
            name: 'expire_seconds',
            type: 'number',
            default: 60,
            description: '二维码有效时间，以秒为单位。最大不超过2592000（即30天）。',
            displayOptions: {
                show: {
                    action_name: ['QR_STR_SCENE'],
                },
            },
        },
        {
            displayName: '场景值ID',
            name: 'scene_str',
            type: 'string',
            default: '',
            description: '场景值ID（字符串形式的ID），字符串类型，长度限制为1到64',
        },
    ],
    async call(index) {
        const actionName = this.getNodeParameter('action_name', index);
        const expireSeconds = this.getNodeParameter('expire_seconds', index, null);
        const sceneStr = this.getNodeParameter('scene_str', index);
        const body = {
            action_name: actionName,
            action_info: {
                scene: {
                    scene_str: sceneStr,
                },
            },
        };
        if (expireSeconds) {
            body.expire_seconds = expireSeconds;
        }
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/qrcode/create`,
            body,
        });
    },
};
exports.default = QRCodeGenerateOperate;
//# sourceMappingURL=QRCodeGenerateOperate.js.map