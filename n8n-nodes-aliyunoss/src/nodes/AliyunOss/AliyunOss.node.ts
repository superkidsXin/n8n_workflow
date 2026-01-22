import type {IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription} from 'n8n-workflow';

import ResourceFactory from '../help/builder/ResourceFactory';
import {executeResourceOperation} from '../help/executeResourceOperation';

const resourceBuilder = ResourceFactory.build(__dirname);
export class AliyunOss implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Aliyun OSS',
    name: 'aliyunOss',
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    icon: 'file:icon.svg',
    group: ['transform'],
    version: 1,
    description: 'Aliyun OSS Node',
    defaults: {
      name: 'Aliyun OSS Node',
    },
    // @ts-ignore
    inputs: ['main'],
    // @ts-ignore
    outputs: ['main'],
    properties:
        [
          ...resourceBuilder.build(),
        ],
    credentials:
        [
          {
            name: 'aliyunOssApi',
            displayName: 'Aliyun OSS API',
            required: true,
          },
        ],
  };
  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    return await executeResourceOperation.call(this, resourceBuilder);
  }
}