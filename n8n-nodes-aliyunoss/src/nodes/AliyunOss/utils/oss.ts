import OSS from 'ali-oss';

export function sanitizeObjectKey(key: string) {
	return key.replace(/^[\\/]+/, '').replace(/[\\]+/g, '/');
}

export function sanitizeFileName(name: string) {
	const cleaned = name.replace(/[\\/:*?"<>|]/g, '_').trim();
	return cleaned.length > 0 ? cleaned : 'file';
}

export function createOssClient(cred: any) {
	return new OSS({
		region: cred.region as string,
		bucket: cred.bucket as string,
		accessKeyId: cred.accessKeyId as string,
		accessKeySecret: cred.accessKeySecret as string,
		endpoint: (cred.endpoint as string) || undefined,
		cname: !!cred.cname,
		secure: cred.secure !== false,
	} as any);
}

export async function objectExists(client: any, key: string): Promise<{ exists: boolean; meta?: any }> {
	try {
		const meta = await client.head(key);
		return { exists: true, meta };
	} catch (e: any) {
		const code = String(e?.code || e?.name || '').toLowerCase();
		const status = Number(e?.status || e?.statusCode || 0);
		if (status === 404 || code.includes('nosuchkey') || code.includes('nosuchobject') || code.includes('notfound')) {
			return { exists: false };
		}
		throw e;
	}
}

