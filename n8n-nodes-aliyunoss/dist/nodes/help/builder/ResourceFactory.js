"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ResourceBuilder_1 = __importDefault(require("./ResourceBuilder"));
const ModuleLoadUtils_1 = __importDefault(require("../utils/ModuleLoadUtils"));
class ResourceFactory {
    static build(basedir) {
        const resourceBuilder = new ResourceBuilder_1.default();
        const resources = ModuleLoadUtils_1.default.loadModules(basedir, 'resource/*.js');
        resources.sort((a, b) => {
            if (!a.order)
                a.order = 0;
            if (!b.order)
                b.order = 0;
            return b.order - a.order;
        });
        resources.forEach((resource) => {
            resourceBuilder.addResource(resource);
            const operates = ModuleLoadUtils_1.default.loadModules(basedir, `resource/${resource.value}/*.js`);
            operates.sort((a, b) => {
                if (!a.order)
                    a.order = 0;
                if (!b.order)
                    b.order = 0;
                return b.order - a.order;
            });
            operates.forEach((operate) => {
                resourceBuilder.addOperate(resource.value, operate);
            });
        });
        return resourceBuilder;
    }
}
exports.default = ResourceFactory;
//# sourceMappingURL=ResourceFactory.js.map