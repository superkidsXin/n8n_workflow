"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeResourceOperation = executeResourceOperation;
const n8n_workflow_1 = require("n8n-workflow");
async function executeResourceOperation(resourceBuilder, options) {
    var _a, _b;
    const items = this.getInputData();
    const returnData = [];
    const resource = this.getNodeParameter('resource', 0);
    const operation = this.getNodeParameter('operation', 0);
    const callFunc = resourceBuilder.getCall(resource, operation);
    if (!callFunc) {
        throw new n8n_workflow_1.NodeOperationError(this.getNode(), `未实现方法: ${resource}.${operation}`);
    }
    const isAggregateOperation = (_a = options === null || options === void 0 ? void 0 : options.isAggregateOperation) !== null && _a !== void 0 ? _a : ((op) => op.includes('aggregate'));
    if (isAggregateOperation(operation)) {
        const responseData = (await callFunc.call(this, 0));
        const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(responseData), { itemData: { item: 0 } });
        returnData.push(...executionData);
        return [returnData];
    }
    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
        let responseData;
        try {
            this.logger.debug('call function', { resource, operation, itemIndex });
            responseData = (await callFunc.call(this, itemIndex));
        }
        catch (error) {
            this.logger.error('call function error', {
                resource,
                operation,
                itemIndex,
                errorMessage: error === null || error === void 0 ? void 0 : error.message,
                stack: error === null || error === void 0 ? void 0 : error.stack,
            });
            if (this.continueOnFail()) {
                returnData.push({
                    json: { error: (_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : String(error) },
                    pairedItem: itemIndex,
                });
                continue;
            }
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), error, {
                message: error === null || error === void 0 ? void 0 : error.message,
                itemIndex,
            });
        }
        const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(responseData), { itemData: { item: itemIndex } });
        returnData.push(...executionData);
    }
    return [returnData];
}
//# sourceMappingURL=executeResourceOperation.js.map