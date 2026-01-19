"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const n8n_workflow_1 = require("n8n-workflow");
class NodeUtils {
    static getNodeFixedCollection(data, collectionName) {
        return data[collectionName] || [];
    }
    static getNodeFixedCollectionList(data, collectionName, propertyName) {
        const list = this.getNodeFixedCollection(data, collectionName);
        const result = [];
        for (const item of list) {
            result.push(item[propertyName]);
        }
        return result;
    }
    static async buildUploadFileData(inputDataFieldName, index = 0) {
        const binaryData = this.helpers.assertBinaryData(index, inputDataFieldName);
        if (!binaryData) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), '未找到二进制数据');
        }
        const buffer = await this.helpers.getBinaryDataBuffer(index, inputDataFieldName);
        return {
            value: buffer,
            options: {
                filename: binaryData.fileName,
                filelength: binaryData.fileSize,
                contentType: binaryData.mimeType,
            },
        };
    }
    static getNodeJsonData(data, propertyName, index, failValue) {
        const text = data.getNodeParameter(propertyName, index, failValue);
        if (!text) {
            return failValue;
        }
        try {
            return JSON.parse(text);
        }
        catch (e) {
            throw new n8n_workflow_1.NodeOperationError(data.getNode(), `无法解析字段[${propertyName}] JSON 数据: ${e.message}`);
        }
    }
}
exports.default = NodeUtils;
//# sourceMappingURL=NodeUtils.js.map