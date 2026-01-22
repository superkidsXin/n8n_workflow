import type {IDataObject, IExecuteFunctions} from 'n8n-workflow';

import {ResourceOperations} from '../../../help/type/IResource';


export function replaceLinks(
    content: string, node_token: string, newLink?: string): string {
  if (!newLink) {
    return content;
  }
  /*
    match all links in src="" or href=""

    1 - src=" or href=" or src=' or href='
    2 - https://ywh1bkansf.feishu.cn/wiki/aabbdd
    3 - node_token
    4 - ' | "
  */
  const htmlRe = new RegExp(
      `((src|href)=["|'])(http[s]?:\\\/\\\/[\\w]+\\.(feishu\\.cn|larksuite\.com)\\\/.*)?(${
          node_token}[^"']*)("|')`,
      'gm');
  content = content.replace(htmlRe, `$1${newLink}$6`);
  /*
    match all links in markdown links, images

    1 - ](
    2 - https://ywh1bkansf.feishu.cn/wiki/aabbdd
    3 - node_token
    4 - )
   */
  const mdRe = new RegExp(
      `(\\]\\()(http[s]?:\\\/\\\/[\\w]+\\.(feishu\\.cn|larksuite\.com)\\\/.*)?(${
          node_token}[^\\)]*)(\\))`,
      'gm');
  content = content.replace(mdRe, `$1${newLink}$5`);

  return content;
}

type UrlMapping =|{
  token: string;
  url: string
}
|{
  from: string;
  to: string
}
|{
  sourceUrl: string;
  url: string
};

function normalizeMappings(raw: unknown): Array<{from: string; to: string}> {
  if (!raw) return [];
  if (!Array.isArray(raw)) return [];
  return raw
      .map((m: any) => {
        const from = String(m?.token ?? m?.from ?? m?.sourceUrl ?? '').trim();
        const to = String(m?.url ?? m?.to ?? '').trim();
        return {from, to};
      })
      .filter((m) => m.from.length > 0 && m.to.length > 0);
}

export default {
  name: '替换 Markdown URLs',
  value: 'markdown:replaceUrls',
  order: 100,
  options:
      [
        {
          displayName: 'Markdown',
          name: 'markdown',
          type: 'string',
          default: '',
          typeOptions: {rows: 12},
          required: true,
        },
        {
          displayName: 'Token → URL Mappings (JSON Array)',
          name: 'mappingsJson',
          type: 'string',
          default: '[]',
          typeOptions: {rows: 8},
          required: true,
          description:
              'Example: [{\"token\":\"<fileToken>\",\"url\":\"https://...\"}] (compatible with legacy {from,to} / {sourceUrl,url})',
        },
      ],
  async call(this: IExecuteFunctions, index: number):
      Promise<IDataObject> {
        const markdown = this.getNodeParameter('markdown', index) as string;
        const mappingsJson =
            this.getNodeParameter('mappingsJson', index) as string;

        let parsed: UrlMapping[] = [];
        try {
          parsed = JSON.parse(mappingsJson || '[]');
        } catch {
          parsed = [];
        }

        const mappings = normalizeMappings(parsed).sort(
            (a, b) => b.from.length - a.from.length);
        let replaced = markdown ?? '';
        for (const m of mappings) {
          replaced = replaceLinks(replaced, m.from, m.to);
        }
        return {markdown: replaced, mappingsApplied: mappings.length};
      },
} as ResourceOperations;
