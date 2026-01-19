"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const MenuQueryOperate = {
    name: '查询',
    value: 'menu:query',
    description: '查询自定义菜单的结构',
    options: [],
    async call(index) {
        return RequestUtils_1.default.request.call(this, {
            method: 'GET',
            url: `/cgi-bin/menu/get`,
        });
    },
};
exports.default = MenuQueryOperate;
//# sourceMappingURL=MenuQueryOperate.js.map