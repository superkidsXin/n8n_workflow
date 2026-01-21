import type {IExecuteFunctions} from 'n8n-workflow';
import {NodeOperationError} from 'n8n-workflow';

import {ResourceOperations} from '../../../help/type/IResource';

import {downloadFeishuMedia} from './utils/docx';

export default {
  name: '下载 Docx 媒体文件',
  value: 'docxMarkdown:download',
  order: 90,
  options:
      [
        {
          displayName: 'File Token',
          name: 'fileToken',
          type: 'string',
          required: true,
          default: '',
          description: '从解析结果的 files[].token 获取',
        },
        {
          displayName: 'File Name (Optional)',
          name: 'fileName',
          type: 'string',
          default: '',
          required: true,
          description: '可留空，将使用 fileToken 作为文件名',
        },
        {
          displayName: 'Binary Property Name',
          name: 'binaryProperty',
          type: 'string',
          default: 'file',
          description: '输出的二进制字段名（用于后续 OSS 上传节点）',
        },
      ],
  async call(this: IExecuteFunctions, index: number):
      Promise<any> {
        const fileToken = this.getNodeParameter('fileToken', index) as string;
        const fileName = this.getNodeParameter('fileName', index) as string;
        const binaryProperty =
            this.getNodeParameter('binaryProperty', index, 'file') as string;

        const buf = await downloadFeishuMedia.call(this, fileToken);
        if (!buf || buf.length === 0) {
          throw new NodeOperationError(
              this.getNode(), `下载文件为空: ${fileToken}`, {itemIndex: index});
        }

        const binary: any = {};
        binary[binaryProperty] =
            await this.helpers.prepareBinaryData(buf, fileName);
        // IMPORTANT: return INodeExecutionData-like object so
        // FeishuNode.execute can pass through binary
        return {
          json: {fileToken, fileName},
          binary,
        };
      },
} as ResourceOperations;
