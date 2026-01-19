"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const NodeUtils_1 = __importDefault(require("../../../help/utils/NodeUtils"));
const MenuCreateOperate = {
    name: '创建',
    value: 'menu:create',
    description: '创建自定义菜单',
    options: [
        {
            displayName: '*菜单格式',
            name: 'data',
            description: '参考：https://developers.weixin.qq.com/doc/offiaccount/Custom_Menus/Creating_Custom-Defined_Menu.html',
            required: true,
            type: 'json',
            default: '{}',
        },
    ],
    async call(index) {
        const data = NodeUtils_1.default.getNodeJsonData(this, 'data', index);
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/menu/create`,
            body: data,
        });
    },
};
exports.default = MenuCreateOperate;
//# sourceMappingURL=MenuCreateOperate.js.map