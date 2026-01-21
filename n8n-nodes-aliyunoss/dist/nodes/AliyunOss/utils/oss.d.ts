import OSS from 'ali-oss';
export declare function sanitizeObjectKey(key: string): string;
export declare function sanitizeFileName(name: string): string;
export declare function createOssClient(cred: any): OSS;
export declare function objectExists(client: any, key: string): Promise<{
    exists: boolean;
    meta?: any;
}>;
