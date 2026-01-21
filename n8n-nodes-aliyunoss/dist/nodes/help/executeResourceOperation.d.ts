import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
type ResourceBuilderLike = {
    getCall: (resourceName: string, operateName: string) => Function | null;
};
export declare function executeResourceOperation(this: IExecuteFunctions, resourceBuilder: ResourceBuilderLike, options?: {
    isAggregateOperation?: (operation: string) => boolean;
}): Promise<INodeExecutionData[][]>;
export {};
