import ModuleLoadUtils from "../nodes/help/utils/ModuleLoadUtils";
import ResourceBuilder from "../nodes/help/builder/ResourceBuilder";
import {ResourceOperations} from "../nodes/help/type/IResource";

const resourceBuilder = new ResourceBuilder();

ModuleLoadUtils.loadModules(__dirname + "/../dist/nodes/WechatOfficialAccountNode", 'resource/*.js').forEach((resource) => {
	resourceBuilder.addResource(resource);
	ModuleLoadUtils.loadModules(__dirname + "/../dist/nodes/WechatOfficialAccountNode", `resource/${resource.value}/*.js`).forEach((operate: ResourceOperations) => {
		resourceBuilder.addOperateT(resource.value, operate);
	})
});

let txt = '';
for (let resource of resourceBuilder.resources) {
	txt = txt + '## ' +  resource.name + '\n';
	for (const operate of resource.operations) {
		txt = txt + '- '  + operate.name + '\n';
	}
}

console.log(txt);
