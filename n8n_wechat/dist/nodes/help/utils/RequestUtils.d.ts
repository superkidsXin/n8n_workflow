import { IExecuteFunctions, IRequestOptions } from 'n8n-workflow';
declare class RequestUtils {
    static originRequest(this: IExecuteFunctions, options: IRequestOptions, clearAccessToken?: boolean): Promise<any>;
    static request(this: IExecuteFunctions, options: IRequestOptions): Promise<any>;
}
export default RequestUtils;
