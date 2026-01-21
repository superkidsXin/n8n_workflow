import {MarkdownRenderer} from './feishu_docx';
import {Block, DocMetaInfo, CommonBlock} from './feishu_docx/types';

export function docxBlocksToMarkdown(
    input: {document: {document_id: string}; blocks: Block[]}): {
  markdown: string; fileTokens: Record<string, CommonBlock>; meta: DocMetaInfo;
} {
  const render = new MarkdownRenderer(input)
  let content = render.parse()
  return {markdown: content, fileTokens: render.fileTokens, meta: render.meta};
}
