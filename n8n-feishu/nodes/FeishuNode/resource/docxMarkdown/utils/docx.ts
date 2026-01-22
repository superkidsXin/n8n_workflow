import type {IExecuteFunctions} from 'n8n-workflow';

import type {Block, CommonBlock, FileBlock} from '../../../../help/utils/feishu_docx/types';
import RequestUtils from '../../../../help/utils/RequestUtils';


export async function downloadFeishuMedia(
    this: IExecuteFunctions, fileToken: string): Promise<Buffer> {
  const res = (await RequestUtils.originRequest.call(this, {
                method: 'GET',
                url: `/open-apis/drive/v1/medias/${fileToken}/download`,
                json: false,
                encoding: null as any,
              } as any)) as any;

  if (Buffer.isBuffer(res)) return res;
  if (typeof res === 'string') return Buffer.from(res, 'binary');
  return Buffer.from(res || '');
}

export function getFileNameFromBlock(block: CommonBlock): string {
  if (block.type === 'image') {
    return `${block.block.token}.png`;
  }
  if (block.type === 'file') {
    const fileblock = block.block as FileBlock;
    return `${block.block.token}_${fileblock.name}`;
  }
  return '';
}


export async function GetDocumentInfo(
    this: IExecuteFunctions, documentId: string): Promise<IDataObject> {
  const res = (await RequestUtils.request.call(this, {
                method: 'GET',
                url: `/open-apis/docx/v1/documents/${documentId}`,
              })) as any;
  return res?.data || {};
}

export async function getAllBlocks(
    this: IExecuteFunctions, documentId: string): Promise<Block[]> {
  const all: Block[] = [];
  let pageToken = '';
  let hasMore = true;

  while (hasMore) {
    const res = (await RequestUtils.request.call(this, {
                  method: 'GET',
                  url: `/open-apis/docx/v1/documents/${documentId}/blocks`,
                  qs: {
                    page_size: 500,
                    page_token: pageToken,
                    document_revision_id: -1,
                    user_id_type: 'open_id',
                  },
                })) as any;

    const data = res?.data || {};
    const items: Block[] = data.items || [];
    all.push(...items);
    hasMore = !!data.has_more;
    pageToken = data.page_token || '';
    if (!pageToken && hasMore) hasMore = false;
  }

  return all;
}
