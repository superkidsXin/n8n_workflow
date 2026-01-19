"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ResourceBuilder {
    constructor() {
        this.resources = [];
    }
    toOption(option) {
        const { name, value, action, description, routing, outputConnectionType, inputSchema, displayOptions } = option;
        return {
            name,
            value,
            action,
            description,
            routing,
            outputConnectionType,
            inputSchema,
            displayOptions,
        };
    }
    addResource(resource) {
        this.resources.push({
            ...this.toOption(resource),
            operations: [],
        });
    }
    addOperate(resourceName, operate) {
        const resource = this.resources.find((resource) => resource.value === resourceName);
        if (resource) {
            resource.operations.push(operate);
        }
    }
    build() {
        var _a;
        let list = [];
        list.push({
            displayName: 'Resource',
            name: 'resource',
            type: 'options',
            noDataExpression: true,
            options: this.resources.map((item) => this.toOption(item)),
            default: '',
        });
        for (const resource of this.resources) {
            if (resource.operations.length === 0)
                continue;
            list.push({
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: [resource.value],
                    },
                },
                options: resource.operations.map((item) => this.toOption(item)),
                default: '',
            });
            for (const operation of resource.operations) {
                for (let option of operation.options) {
                    list.push({
                        ...option,
                        displayOptions: {
                            ...(option.displayOptions || {}),
                            show: {
                                ...(((_a = option.displayOptions) === null || _a === void 0 ? void 0 : _a.show) || {}),
                                resource: [resource.value],
                                operation: [operation.value],
                            },
                        },
                    });
                }
            }
        }
        return list;
    }
    getCall(resourceName, operateName) {
        const resource = this.resources.find((item) => item.value === resourceName);
        if (!resource) {
            return null;
        }
        const operate = resource.operations.find((item) => item.value === operateName);
        return operate === null || operate === void 0 ? void 0 : operate.call;
    }
}
exports.default = ResourceBuilder;
//# sourceMappingURL=ResourceBuilder.js.map