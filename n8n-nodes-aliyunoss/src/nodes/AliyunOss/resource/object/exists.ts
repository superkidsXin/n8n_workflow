import type {IDataObject, IExecuteFunctions, INodeProperties} from 'n8n-workflow';
import {NodeOperationError} from 'n8n-workflow';

import type {ResourceOperations} from '../../../help/type/IResource';
import {createOssClient, objectExists, sanitizeObjectKey} from '../../utils/oss';

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
    displayOptions: {show: {signedUrl: [true]}},
  },
];

async function call(
    this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
  const cred = await this.getCredentials('aliyunOssApi');
  const client = createOssClient(cred);
  const keyRaw = this.getNodeParameter('objectKey', itemIndex) as string;
  const signedUrl = this.getNodeParameter('signedUrl', itemIndex) as boolean;
  let signedUrlExpires = 3600;
  if (signedUrl) {
    signedUrlExpires =
        this.getNodeParameter('signedUrlExpires', itemIndex) as number;
  }
  const key = sanitizeObjectKey(String(keyRaw || '').trim());
  if (!key)
    throw new NodeOperationError(
        this.getNode(), 'Object Key is empty', {itemIndex});

  const res = await objectExists(client, key);
  const json: IDataObject = {key, exists: res.exists};
  if (res.exists) {
    // const acl = await client.getACL(key);
    if (signedUrl) {
      json.url = client.signatureUrl(
          key, {expires: Math.max(1, Number(signedUrlExpires) || 3600)});
    } else {
      json.url = client.generateObjectUrl(key);
    }
  }

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
