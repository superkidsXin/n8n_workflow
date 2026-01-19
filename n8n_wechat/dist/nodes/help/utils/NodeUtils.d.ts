import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
declare class NodeUtils {
    static getNodeFixedCollection(data: IDataObject, collectionName: string): IDataObject[];
    static getNodeFixedCollectionList(data: IDataObject, collectionName: string, propertyName: string): any[];
    static buildUploadFileData(this: IExecuteFunctions, inputDataFieldName: string, index?: number): Promise<any>;
    static getNodeJsonData(data: IExecuteFunctions, propertyName: string, index: number, failValue?: any): any;
}
export default NodeUtils;
