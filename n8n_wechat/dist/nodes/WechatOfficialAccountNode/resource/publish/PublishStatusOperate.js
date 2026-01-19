"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const PublishStatusOperate = {
    name: '发布状态轮询',
    value: 'publish:status',
    options: [
        {
            displayName: '发布任务ID',
            name: 'publish_id',
            type: 'string',
            required: true,
            default: '',
        },
    ],
    async call(index) {
        const publishId = this.getNodeParameter('publish_id', index);
        const body = {
            publish_id: publishId,
        };
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/freepublish/get`,
            body,
        });
    },
};
exports.default = PublishStatusOperate;
//# sourceMappingURL=PublishStatusOperate.js.map