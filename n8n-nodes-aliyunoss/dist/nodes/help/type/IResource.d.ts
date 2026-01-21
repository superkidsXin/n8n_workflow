import { INodePropertyOptions } from 'n8n-workflow';
import { IDataObject, type IExecuteFunctions, INodeProperties } from 'n8n-workflow';
export type ResourceOperations = INodePropertyOptions & {
    options: INodeProperties[];
    call?: (this: IExecuteFunctions, index: number) => Promise<IDataObject>;
    order?: number;
};
export type ResourceOptions = INodePropertyOptions & {
    order?: number;
};
export interface IResource extends INodePropertyOptions {
    operations: ResourceOperations[];
}
