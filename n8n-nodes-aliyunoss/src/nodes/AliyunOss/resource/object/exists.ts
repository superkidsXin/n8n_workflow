import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { ResourceOperations } from '../../../help/type/IResource';
import { createOssClient, objectExists, sanitizeObjectKey } from '../../utils/oss';

const options: INodeProperties[] = [
	{
		displayName: 'Object Key',
		name: 'objectKey',
		type: 'string',
		default: '',
		required: true,
		description: 'Object key to check (e.g. feishu-docx/xxx.png)',
	},
	{
		displayName: 'Include Metadata',
		name: 'includeMeta',
		type: 'boolean',
		default: false,
	},
];

async function call(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const cred = await this.getCredentials('aliyunOssApi');
	const client = createOssClient(cred);

	const keyRaw = this.getNodeParameter('objectKey', itemIndex) as string;
	const includeMeta = this.getNodeParameter('includeMeta', itemIndex) as boolean;

	const key = sanitizeObjectKey(String(keyRaw || '').trim());
	if (!key) throw new NodeOperationError(this.getNode(), 'Object Key is empty', { itemIndex });

	const res = await objectExists(client, key);
	const json: IDataObject = { key, exists: res.exists };
	if (includeMeta && res.exists) json.meta = res.meta;
	return json;
}

const op: ResourceOperations = {
	name: 'Exists',
	value: 'exists',
	description: 'Check whether an object exists in Aliyun OSS',
	options,
	call,
	order: 90,
};

export default op;

