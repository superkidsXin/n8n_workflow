"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const MediaCountMaterialOperate = {
    name: '获取素材总数',
    value: 'media:countMaterial',
    options: [],
    async call(index) {
        return RequestUtils_1.default.request.call(this, {
            method: 'GET',
            url: `/cgi-bin/material/get_materialcount`,
        });
    },
};
exports.default = MediaCountMaterialOperate;
//# sourceMappingURL=MediaCountMaterialOperate.js.map