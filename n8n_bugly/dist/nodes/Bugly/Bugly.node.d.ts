import type { IExecuteFunctions, ILoadOptionsFunctions, INodeExecutionData, INodePropertyOptions, INodeType, INodeTypeDescription } from 'n8n-workflow';
export declare class Bugly implements INodeType {
    methods: {
        loadOptions: {
            getBuglyAppList(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
        };
    };
    description: INodeTypeDescription;
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
