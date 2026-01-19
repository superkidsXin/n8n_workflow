"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatOfficialAccountNode = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const ResourceBuilder_1 = __importDefault(require("../help/builder/ResourceBuilder"));
const ModuleLoadUtils_1 = __importDefault(require("../help/utils/ModuleLoadUtils"));
const resourceBuilder = new ResourceBuilder_1.default();
ModuleLoadUtils_1.default.loadModules(__dirname, 'resource/*.js').forEach((resource) => {
    resourceBuilder.addResource(resource);
    ModuleLoadUtils_1.default.loadModules(__dirname, `resource/${resource.value}/*.js`).forEach((operate) => {
        resourceBuilder.addOperate(resource.value, operate);
    });
});
class WechatOfficialAccountNode {
    constructor() {
        this.description = {
            displayName: 'Wechat Official Account Node',
            name: 'wechatOfficialAccountNode',
            icon: 'file:icon.png',
            group: ['transform'],
            version: 1,
            description: 'Wechat Official Account Node',
            defaults: {
                name: 'Wechat Official Account Node',
            },
            usableAsTool: true,
            inputs: ['main'],
            outputs: ['main'],
            credentials: [
                {
                    name: 'wechatOfficialAccountCredentialsApi',
                    required: true,
                },
            ],
            properties: resourceBuilder.build(),
        };
    }
    async execute() {
        const items = this.getInputData();
        let responseData = {};
        let returnData = [];
        const resource = this.getNodeParameter('resource', 0);
        const operation = this.getNodeParameter('operation', 0);
        const callFunc = resourceBuilder.getCall(resource, operation);
        if (!callFunc) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), '未实现方法: ' + resource + '.' + operation);
        }
        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            try {
                this.logger.debug('call function', {
                    resource,
                    operation,
                    itemIndex,
                });
                responseData = await callFunc.call(this, itemIndex);
            }
            catch (error) {
                this.logger.error('call function error', {
                    resource,
                    operation,
                    itemIndex,
                    errorMessage: error.message,
                    stack: error.stack,
                });
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            error: error.message
                        },
                        pairedItem: itemIndex,
                    });
                    continue;
                }
                else {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), error, {
                        message: error.message,
                        itemIndex,
                    });
                }
            }
            const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(responseData), { itemData: { item: itemIndex } });
            returnData.push(...executionData);
        }
        return [returnData];
    }
}
exports.WechatOfficialAccountNode = WechatOfficialAccountNode;
//# sourceMappingURL=WechatOfficialAccountNode.node.js.map