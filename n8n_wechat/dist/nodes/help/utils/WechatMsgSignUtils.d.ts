declare class WechatMsgSignUtils {
    static checkSignature(token: string, signature: string, timestamp: string, nonce: string): boolean;
    static checkEncryptSignature(token: string, signature: string, timestamp: string, nonce: string, encrypt: string): boolean;
    static buildEncryptSignature(token: string, timestamp: string, nonce: string, encrypt: string): string;
    static decrypt(text: string, encodingAESKey: string): {
        xml: any;
        appId: string;
    };
    static encrypt(text: string, encodingAESKey: string, appId: string): string;
    static encryptResponse(text: string, encodingAESKey: string, token: string, appId: string): object;
}
export default WechatMsgSignUtils;
