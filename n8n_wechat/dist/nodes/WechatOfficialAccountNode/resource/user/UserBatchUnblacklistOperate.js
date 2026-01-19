"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestUtils_1 = __importDefault(require("../../../help/utils/RequestUtils"));
const NodeUtils_1 = __importDefault(require("../../../help/utils/NodeUtils"));
const UserBatchUnblacklistOperate = {
    name: '取消拉黑用户',
    value: 'user:batchUnblacklist',
    description: '取消拉黑一批用户',
    options: [
        {
            displayName: 'OpenID列表',
            name: 'openid_list',
            required: true,
            description: '需要取消拉入黑名单的用户的openid，一次取消拉黑最多允许20个',
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
    ],
    async call(index) {
        const openid_list = NodeUtils_1.default.getNodeFixedCollectionList(this.getNodeParameter('openid_list', index), 'values', 'id');
        const body = {
            openid_list: openid_list,
        };
        return RequestUtils_1.default.request.call(this, {
            method: 'POST',
            url: `/cgi-bin/tags/members/batchunblacklist`,
            body,
        });
    }
};
exports.default = UserBatchUnblacklistOperate;
//# sourceMappingURL=UserBatchUnblacklistOperate.js.map