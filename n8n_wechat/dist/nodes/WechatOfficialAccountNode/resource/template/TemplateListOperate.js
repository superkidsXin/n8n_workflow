"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const TemplateListOperate = {
    name: '获取模板列表',
    value: 'template:list',
    description: '获取已添加至账号下所有模板列表',
    options: [],
    async call(index) {
        return RequestUtils_1.default.request.call(this, {
            method: 'GET',
            url: `/cgi-bin/template/get_all_private_template`,
        });
    },
};
exports.default = TemplateListOperate;
//# sourceMappingURL=TemplateListOperate.js.map