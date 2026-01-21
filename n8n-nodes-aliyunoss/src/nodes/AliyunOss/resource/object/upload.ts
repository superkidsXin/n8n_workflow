import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { ResourceOperations } from '../../../help/type/IResource';
import { createOssClient, objectExists, sanitizeFileName, sanitizeObjectKey } from '../../utils/oss';

const options: INodeProperties[] = [
	{
		displayName: 'Binary Property',
		name: 'binaryProperty',
		type: 'string',
		default: 'file',
		required: true,
		description: 'Name of the binary property to upload (e.g. file, data)',
	},
	{
		displayName: 'Object Key Prefix',
		name: 'prefix',
		type: 'string',
		default: '',
		description: 'Optional prefix folder in OSS (e.g. feishu-docx/2026-01)',
	},
	{
		displayName: 'Object Key',
		name: 'objectKey',
		type: 'string',
		default: '',
		description: 'Optional full object key. If empty, uses prefix + original file name.',
	},
	{
		displayName: 'Overwrite If Exists',
		name: 'overwrite',
		type: 'boolean',
		default: true,
	},
	{
		displayName: 'ACL',
		name: 'acl',
		type: 'options',
		default: 'default',
		description: 'Object access control (permission) applied when uploading',
		// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
		options: [
			{ name: 'Default (Bucket Default)', value: 'default' },
			{ name: 'Private', value: 'private' },
			{ name: 'Public Read', value: 'public-read' },
			{ name: 'Public Read Write', value: 'public-read-write' },
		],
	},
	{
		displayName: 'Return Signed URL',
		name: 'signedUrl',
		type: 'boolean',
		default: false,
		description: 'If enabled, returns a signed URL (for private buckets)',
	},
	{
		displayName: 'Signed URL Expire Seconds',
		name: 'signedUrlExpires',
		type: 'number',
		default: 3600,
		displayOptions: { show: { signedUrl: [true] } },
	},
];

async function call(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const cred = await this.getCredentials('aliyunOssApi');
	const client = createOssClient(cred);

	const binaryProperty = this.getNodeParameter('binaryProperty', itemIndex) as string;
	const prefix = this.getNodeParameter('prefix', itemIndex) as string;
	const objectKeyParam = this.getNodeParameter('objectKey', itemIndex) as string;
	const overwrite = this.getNodeParameter('overwrite', itemIndex) as boolean;
	const acl = this.getNodeParameter('acl', itemIndex, 'default') as string;
	const signedUrl = this.getNodeParameter('signedUrl', itemIndex) as boolean;
	const signedUrlExpires = this.getNodeParameter('signedUrlExpires', itemIndex) as number;

	const item = this.getInputData()[itemIndex];
	const bin = item.binary?.[binaryProperty];
	if (!bin) {
		throw new NodeOperationError(this.getNode(), `Binary property "${binaryProperty}" is missing`, { itemIndex });
	}

	const buf = await this.helpers.getBinaryDataBuffer(itemIndex, binaryProperty);
	const fileName = sanitizeFileName(String(bin.fileName || 'file'));

	const key = sanitizeObjectKey(
		objectKeyParam?.trim()
			? objectKeyParam.trim()
			: (prefix ? `${prefix.replace(/\/+$/, '')}/` : '') + fileName,
	);

	const putOptions: any = {};
	if (acl && acl !== 'default') {
		putOptions.headers = { 'x-oss-object-acl': acl };
	}

	if (!overwrite) {
		const ex = await objectExists(client, key);
		if (!ex.exists) await client.put(key, buf, putOptions);
	} else {
		await client.put(key, buf, putOptions);
	}

	const url = signedUrl
		? client.signatureUrl(key, { expires: Math.max(1, Number(signedUrlExpires) || 3600) })
		: client.generateObjectUrl(key);

	const json: IDataObject = { key, url, fileName };
	if (item.json && typeof item.json === 'object') {
		const j: any = item.json;
		if (j.fileToken) json.fileToken = j.fileToken;
		if (j.document_id) json.document_id = j.document_id;
	}
	return json;
}

const op: ResourceOperations = {
	name: 'Upload',
	value: 'upload',
	description: 'Upload a binary file to Aliyun OSS and return a URL',
	options,
	call,
	order: 100,
};

export default op;

