import { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { IResource, ResourceOperations } from '../type/IResource';

class ResourceBuilder {
	resources: IResource[] = [];

	private toOption(option: INodePropertyOptions): INodePropertyOptions {
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

	addResource(resource: INodePropertyOptions) {
		this.resources.push({
			...this.toOption(resource),
			operations: [],
		});
	}

	addOperate(resourceName: string, operate: ResourceOperations) {
		const resource = this.resources.find((resource) => resource.value === resourceName);
		if (resource) {
			resource.operations.push(operate);
		}
	}

	build(): INodeProperties[] {
		// 构建 Operations
		let list: INodeProperties[] = [];

		list.push({
			displayName: 'Resource',
			name: 'resource',
			type: 'options',
			noDataExpression: true,
			options: this.resources.map((item) => this.toOption(item)),
			default: '',
		});

		for (const resource of this.resources) {
			if (resource.operations.length === 0) continue;
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
					// @ts-ignore
					list.push({
						...option,
						displayOptions: {
							...(option.displayOptions || {}),
							show: {
								...(option.displayOptions?.show || {}),
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

	getCall(resourceName: string, operateName: string): Function | null {
		const resource = this.resources.find((item) => item.value === resourceName);
		if (!resource) {
			// @ts-ignore
			return null;
		}
		const operate = resource.operations.find((item) => item.value === operateName);
		// @ts-ignore
		return operate?.call;
	}
}

export default ResourceBuilder;
