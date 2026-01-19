"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const TemplateDeleteOperate = {
    name: '删除模板',
    value: 'template:delete',
    description: '删除某账号下的模板',
    options: [
        {
            displayName: '模板ID',
            name: 'template_id',
            type: 'string',
            required: true,
            default: '',
            description: '公众账号下模板消息ID, 包括类目模板ID',
        },
    ],
    async call(index) {
        const templateId = this.getNodeParameter('template_id', index);
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/template/del_private_template`,
            body: {
                template_id: templateId,
            },
        });
    },
};
exports.default = TemplateDeleteOperate;
//# sourceMappingURL=TemplateDeleteOperate.js.map