import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

type ResourceBuilderLike = {
	getCall: (resourceName: string, operateName: string) => Function | null;
};

export async function executeResourceOperation(
	this: IExecuteFunctions,
	resourceBuilder: ResourceBuilderLike,
	options?: {
		/**
		 * Decide whether an operation should be executed once (aggregate) vs per item.
		 * Default: operation name includes 'aggregate'.
		 */
		isAggregateOperation?: (operation: string) => boolean;
	},
): Promise<INodeExecutionData[][]> {
	const items = this.getInputData();
	const returnData: INodeExecutionData[] = [];

	const resource = this.getNodeParameter('resource', 0) as string;
	const operation = this.getNodeParameter('operation', 0) as string;
	const callFunc = resourceBuilder.getCall(resource, operation);

	if (!callFunc) {
		throw new NodeOperationError(this.getNode(), `未实现方法: ${resource}.${operation}`);
	}

	const isAggregateOperation = options?.isAggregateOperation ?? ((op: string) => op.includes('aggregate'));

	if (isAggregateOperation(operation)) {
		const responseData = (await callFunc.call(this, 0)) as IDataObject;
		const executionData = this.helpers.constructExecutionMetaData(
			this.helpers.returnJsonArray(responseData as IDataObject),
			{ itemData: { item: 0 } },
		);
		returnData.push(...executionData);
		return [returnData];
	}

	for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
		let responseData: IDataObject;
		try {
			this.logger.debug('call function', { resource, operation, itemIndex });
			responseData = (await callFunc.call(this, itemIndex)) as IDataObject;
		} catch (error: any) {
			this.logger.error('call function error', {
				resource,
				operation,
				itemIndex,
				errorMessage: error?.message,
				stack: error?.stack,
			});
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: error?.message ?? String(error) },
					pairedItem: itemIndex as any,
				});
				continue;
			}
			throw new NodeOperationError(this.getNode(), error, {
				message: error?.message,
				itemIndex,
			});
		}

		const executionData = this.helpers.constructExecutionMetaData(
			this.helpers.returnJsonArray(responseData as IDataObject),
			{ itemData: { item: itemIndex } },
		);
		returnData.push(...executionData);
	}

	return [returnData];
}

