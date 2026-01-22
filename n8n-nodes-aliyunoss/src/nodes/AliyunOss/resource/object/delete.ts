import {IDataObject, IExecuteFunctions, INodeProperties} from 'n8n-workflow';

import {ResourceOperations} from '../../../help/type/IResource';
import {createOssClient} from '../../utils/oss';

const options: INodeProperties[] = [
  {
    displayName: 'Object Key',
    name: 'objectKey',
    type: 'string',
    default: '',
    required: true,
    description: 'Object key to delete (e.g. feishu-docx/xxx.png)',
  },
];

async function call(
    this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
  const cred = await this.getCredentials('aliyunOssApi');
  const client = createOssClient(cred);
  const objectKey = this.getNodeParameter('objectKey', itemIndex) as string;
  await client.delete(objectKey);
  return {success: true};
}

const op: ResourceOperations = {
  name: 'Delete',
  value: 'Delete',
  description: 'delte a file from aliyun oss',
  options,
  call,
  order: 101,
};
export default op;