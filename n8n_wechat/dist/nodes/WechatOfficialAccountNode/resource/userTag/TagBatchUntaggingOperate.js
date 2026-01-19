"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const NodeUtils_1 = __importDefault(require("../../../help/utils/NodeUtils"));
const TagBatchUntaggingOperate = {
    name: '批量为用户取消标签',
    value: 'tag:batchUntagging',
    options: [
        {
            displayName: 'OpenID列表',
            name: 'openid_list',
            required: true,
            description: '粉丝列表，多个OpenID用逗号分隔',
            type: 'fixedCollection',
            default: [],
            typeOptions: {
                multipleValues: true,
            },
            options: [
                {
                    name: 'values',
                    displayName: '列表',
                    values: [
                        {
                            displayName: 'Openid',
                            name: 'id',
                            type: 'string',
                            default: '',
                            required: true,
                        },
                    ],
                },
            ],
        },
        {
            displayName: '标签ID',
            name: 'tagid',
            type: 'number',
            required: true,
            default: null,
        },
    ],
    async call(index) {
        const openid_list = NodeUtils_1.default.getNodeFixedCollectionList(this.getNodeParameter('openid_list', index), 'values', 'id');
        const tagid = this.getNodeParameter('tagid', index);
        const body = {
            openid_list,
            tagid,
        };
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/tags/members/batchuntagging`,
            body,
        });
    }
};
exports.default = TagBatchUntaggingOperate;
//# sourceMappingURL=TagBatchUntaggingOperate.js.map