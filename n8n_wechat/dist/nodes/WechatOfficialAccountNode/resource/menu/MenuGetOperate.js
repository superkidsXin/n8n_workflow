"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const MenuGetOperate = {
    name: '获取当前菜单配置',
    value: 'menu:getCurrent',
    description: '获取公众号当前使用的自定义菜单的配置',
    options: [],
    async call(index) {
        return RequestUtils_1.default.request.call(this, {
            method: 'GET',
            url: `/cgi-bin/get_current_selfmenu_info`,
        });
    },
};
exports.default = MenuGetOperate;
//# sourceMappingURL=MenuGetOperate.js.map