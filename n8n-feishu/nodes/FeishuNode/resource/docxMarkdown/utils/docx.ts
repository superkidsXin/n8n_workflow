import type {IExecuteFunctions} from 'n8n-workflow';

import type {Block} from '../../../../help/utils/feishu_docx/types';
import RequestUtils from '../../../../help/utils/RequestUtils';

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function sanitizeFileName(name: string, fileType: string) {
  const cleaned = name.replace(/[\\/:*?"<>|]/g, '_').trim();
  if (cleaned.length > 0) {
    return cleaned + '.' + fileType;
  }
  throw new Error('File name is empty');
}

export function extractFileNameFromMarkdown(markdown: string, token: string) {
  const safe = escapeRegExp(token);
  const m = markdown.match(new RegExp(`\\[([^\\]]+)]\\(${safe}\\)`));
  return m?.[1]?.trim() || '';
}

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
