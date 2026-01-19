"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const MenuDeleteOperate = {
    name: '删除',
    value: 'menu:delete',
    description: '删除当前使用的自定义菜单',
    options: [],
    async call(index) {
        return RequestUtils_1.default.request.call(this, {
            method: 'GET',
            url: `/cgi-bin/menu/delete`,
        });
    },
};
exports.default = MenuDeleteOperate;
//# sourceMappingURL=MenuDeleteOperate.js.map