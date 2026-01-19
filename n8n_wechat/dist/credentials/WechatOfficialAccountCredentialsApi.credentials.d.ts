import { IAuthenticateGeneric, ICredentialDataDecryptedObject, ICredentialTestRequest, ICredentialType, IHttpRequestHelper, INodeProperties } from 'n8n-workflow';
export declare class WechatOfficialAccountCredentialsApi implements ICredentialType {
    name: string;
    displayName: string;
    properties: INodeProperties[];
    preAuthentication(this: IHttpRequestHelper, credentials: ICredentialDataDecryptedObject): Promise<{
        accessToken: any;
    }>;
    authenticate: IAuthenticateGeneric;
    test: ICredentialTestRequest;
}
