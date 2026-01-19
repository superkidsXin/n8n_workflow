"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const glob_1 = require("glob");
const path_1 = __importDefault(require("path"));
class ModuleLoadUtils {
    static loadModules(dirPath, expression) {
        const files = (0, glob_1.globSync)(expression, {
            cwd: dirPath,
        });
        const modules = [];
        for (const file of files) {
            const fullpath = path_1.default.resolve(dirPath, file);
            const filepath = path_1.default.relative(__dirname, fullpath);
            const module = require(filepath);
            modules.push(module.default);
        }
        return modules;
    }
}
exports.default = ModuleLoadUtils;
//# sourceMappingURL=ModuleLoadUtils.js.map