"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AliyunOss = void 0;
const ResourceFactory_1 = __importDefault(require("../help/builder/ResourceFactory"));
const executeResourceOperation_1 = require("../help/executeResourceOperation");
const resourceBuilder = ResourceFactory_1.default.build(__dirname);
class AliyunOss {
    constructor() {
        this.description = {
            displayName: 'Aliyun OSS',
            name: 'aliyunOss',
            subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
            icon: 'file:icon.svg',
            group: ['transform'],
            version: 1,
            description: 'Aliyun OSS Node',
            defaults: {
                name: 'Aliyun OSS Node',
            },
            inputs: ['main'],
            outputs: ['main'],
            properties: [
                ...resourceBuilder.build(),
            ],
            credentials: [
                {
                    name: 'aliyunOssApi',
                    displayName: 'Aliyun OSS API',
                    required: true,
                },
            ],
        };
    }
    async execute() {
        return await executeResourceOperation_1.executeResourceOperation.call(this, resourceBuilder);
    }
}
exports.AliyunOss = AliyunOss;
//# sourceMappingURL=AliyunOss.node.js.map