import {IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription,} from 'n8n-workflow';

import ResourceFactory from '../help/builder/ResourceFactory';
import {executeResourceOperation} from '../help/executeResourceOperation';

const resourceBuilder = ResourceFactory.build(__dirname);

export class FeishuNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Feishu Node',
    name: 'feishuNode',
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    // eslint-disable-next-line
    // n8n-nodes-base/node-class-description-icon-not-svg
    icon: 'file:icon.png',
    group: ['transform'],
    version: 1,
    description: 'Feishu Node',
    defaults: {
      name: 'Feishu Node',
    },
    usableAsTool: true,
    // @ts-ignore
    inputs: ['main'],
    // @ts-ignore
    outputs: ['main'],
    credentials:
        [
          {
            name: 'feishuCredentialsApi',
            displayName: '应用级别凭证',
            required: true,
            displayOptions: {
              show: {
                authentication: ['feishuCredentialsApi'],
              },
            },
          },
          {
            name: 'feishuOauth2Api',
            displayName: '用户级别凭证',
            required: true,
            displayOptions: {
              show: {
                authentication: ['feishuOauth2Api'],
              },
            },
          },
        ],
    properties:
        [
          {
            displayName: '凭证类型',
            name: 'authentication',
            type: 'options',
            options:
                [
                  {
                    name: '用户级别凭证',
                    value: 'feishuOauth2Api',
                  },
                  {
                    name: '应用级别凭证',
                    value: 'feishuCredentialsApi',
                  },
                ],
            default: 'feishuCredentialsApi',
          },
          ...resourceBuilder.build()
        ],
  };

  methods = {
    loadOptions: {},
  };

  // The function below is responsible for actually doing whatever this node
  // is supposed to do. In this case, we're just appending the `myString`
  // property with whatever the user has entered. You can make async calls and
  // use `await`.
  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    return await executeResourceOperation.call(this, resourceBuilder);
  }
}
