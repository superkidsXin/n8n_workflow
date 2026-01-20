import {IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription} from 'n8n-workflow';
import fs from 'node:fs';
import path from 'node:path';

function readCssFromRepo(cssRelPathFromRepoRoot: string): string {
  const packageRoot = path.resolve(__dirname, '..', '..', '..');
  const repoRoot = path.resolve(packageRoot, '..');
  const filePath = path.resolve(repoRoot, cssRelPathFromRepoRoot);
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}
function escapeHtml(text: string): string {
  return text.replace(/&/g, `&amp;`)
      .replace(/</g, `&lt;`)
      .replace(/>/g, `&gt;`)
      .replace(/"/g, `&quot;`)
      .replace(/'/g, `&#39;`)
      .replace(/`/g, `&#96;`);
}
function formatHighlightedCode(html: string, preserveNewlines = false): string {
  let formatted = html;
  formatted = formatted.replace(
      /(<span[^>]*>[^<]*<\/span>)(\s+)(<span[^>]*>[^<]*<\/span>)/g,
      (_: string, span1: string, spaces: string, span2: string) =>
          span1 + span2.replace(/^(<span[^>]*>)/, `$1${spaces}`));
  formatted = formatted.replace(
      /(\s+)(<span[^>]*>)/g,
      (_: string, spaces: string, span: string) =>
          span.replace(/^(<span[^>]*>)/, `$1${spaces}`));
  formatted = formatted.replace(/\t/g, `    `);
  if (preserveNewlines) {
    formatted = formatted.replace(/\r\n/g, `<br/>`)
                    .replace(/\n/g, `<br/>`)
                    .replace(
                        /(>[^<]+)|(^[^<]+)/g,
                        (str: string) => str.replace(/\s/g, `&nbsp;`));
  } else {
    formatted = formatted.replace(
        /(>[^<]+)|(^[^<]+)/g, (str: string) => str.replace(/\s/g, `&nbsp;`));
  }
  return formatted;
}
function highlightAndFormatCode(
    text: string, language: string, hljs: any,
    showLineNumber: boolean): string {
  if (showLineNumber) {
    const rawLines = text.replace(/\r\n/g, `\n`).split(`\n`);
    const highlightedLines = rawLines.map((lineRaw) => {
      const lineHtml = hljs.highlight(lineRaw, {language}).value;
      const formatted = formatHighlightedCode(lineHtml, false);
      return formatted === `` ? `&nbsp;` : formatted;
    });
    const lineNumbersHtml =
        highlightedLines
            .map(
                (_, idx) =>
                    `<section style="padding:0 10px 0 0;line-height:1.75">${
                        idx + 1}</section>`)
            .join(``);
    const codeInnerHtml = highlightedLines.join(`<br/>`);
    const codeLinesHtml =
        `<div style="white-space:pre;min-width:max-content;line-height:1.75">${
            codeInnerHtml}</div>`;
    const lineNumberColumnStyles =
        `text-align:right;padding:8px 0;border-right:1px solid rgba(0,0,0,0.04);user-select:none;background:var(--code-bg,transparent);`;
    return `<section style="display:flex;align-items:flex-start;overflow-x:hidden;overflow-y:auto;width:100%;max-width:100%;padding:0;box-sizing:border-box"><section class="line-numbers" style="${
        lineNumberColumnStyles}">${
        lineNumbersHtml}</section><section class="code-scroll" style="flex:1 1 auto;overflow-x:auto;overflow-y:visible;padding:8px;min-width:0;box-sizing:border-box">${
        codeLinesHtml}</section></section>`;
  }
  const rawHighlighted = hljs.highlight(text, {language}).value;
  return formatHighlightedCode(rawHighlighted, true);
}
async function convertMarkdownToWechatHtml(markdown: string, opts: {
  primaryColor: string; fontSize: string; fontFamily: string;
  includeCss: boolean;
  theme: 'default' | 'grace' | 'simple';
  citeStatus: boolean;
  countStatus: boolean;
  isMacCodeBlock: boolean;
  isShowLineNumber: boolean;
  legend: 'title-alt' | 'alt-title' | 'title' | 'alt' | 'none';
}) {
  const {marked} = await import('marked');
  const frontMatter = (await import('front-matter')).default as any;
  const readingTime = (await import('reading-time')).default as any;
  const DOMPurify = (await import('isomorphic-dompurify')).default as any;
  const hljsMod = await import('highlight.js/lib/core');
  const hljs = (hljsMod as any).default || (hljsMod as any);
  const langMods: Array<[string, string]> = [
    ['bash', 'highlight.js/lib/languages/bash'],
    ['c', 'highlight.js/lib/languages/c'],
    ['cpp', 'highlight.js/lib/languages/cpp'],
    ['csharp', 'highlight.js/lib/languages/csharp'],
    ['css', 'highlight.js/lib/languages/css'],
    ['diff', 'highlight.js/lib/languages/diff'],
    ['go', 'highlight.js/lib/languages/go'],
    ['graphql', 'highlight.js/lib/languages/graphql'],
    ['ini', 'highlight.js/lib/languages/ini'],
    ['java', 'highlight.js/lib/languages/java'],
    ['javascript', 'highlight.js/lib/languages/javascript'],
    ['json', 'highlight.js/lib/languages/json'],
    ['kotlin', 'highlight.js/lib/languages/kotlin'],
    ['less', 'highlight.js/lib/languages/less'],
    ['lua', 'highlight.js/lib/languages/lua'],
    ['makefile', 'highlight.js/lib/languages/makefile'],
    ['markdown', 'highlight.js/lib/languages/markdown'],
    ['objectivec', 'highlight.js/lib/languages/objectivec'],
    ['perl', 'highlight.js/lib/languages/perl'],
    ['php', 'highlight.js/lib/languages/php'],
    ['php-template', 'highlight.js/lib/languages/php-template'],
    ['plaintext', 'highlight.js/lib/languages/plaintext'],
    ['python', 'highlight.js/lib/languages/python'],
    ['python-repl', 'highlight.js/lib/languages/python-repl'],
    ['r', 'highlight.js/lib/languages/r'],
    ['ruby', 'highlight.js/lib/languages/ruby'],
    ['rust', 'highlight.js/lib/languages/rust'],
    ['scss', 'highlight.js/lib/languages/scss'],
    ['shell', 'highlight.js/lib/languages/shell'],
    ['sql', 'highlight.js/lib/languages/sql'],
    ['swift', 'highlight.js/lib/languages/swift'],
    ['typescript', 'highlight.js/lib/languages/typescript'],
    ['vbnet', 'highlight.js/lib/languages/vbnet'],
    ['wasm', 'highlight.js/lib/languages/wasm'],
    ['xml', 'highlight.js/lib/languages/xml'],
    ['yaml', 'highlight.js/lib/languages/yaml'],
  ];
  await Promise.all(langMods.map(async ([name, mod]) => {
    const m = await import(mod);
    hljs.registerLanguage(name, (m as any).default);
  }));
  marked.setOptions({breaks: true});
  function sanitizeHtml(html: string): string {
    const protectedContents: string[] = [];
    html = html.replace(
        /<!--infographic-start-->[\s\S]*?<!--infographic-end-->/g, (match) => {
          protectedContents.push(match);
          return `<span data-md-protected="${
              protectedContents.length - 1}"></span>`;
        });
    html = html.replace(
        /<!--mermaid-start-->[\s\S]*?<!--mermaid-end-->/g, (match) => {
          protectedContents.push(match);
          return `<span data-md-protected="${
              protectedContents.length - 1}"></span>`;
        });
    html = DOMPurify.sanitize(html, {ADD_TAGS: [`mp-common-profile`]});
    html = html.replace(
        /<span data-md-protected="(\d+)"><\/span>/g,
        (_: string, i: string) => protectedContents[Number(i)]);
    return html;
  }
  function parseFrontMatterAndContent(markdownText: string) {
    try {
      const parsed = frontMatter(markdownText);
      const yamlData = parsed.attributes || {};
      const markdownContent = parsed.body || '';
      return {
        yamlData,
        markdownContent,
        readingTime: readingTime(markdownContent)
      };
    } catch {
      return {
        yamlData: {},
        markdownContent: markdownText,
        readingTime: readingTime(markdownText)
      };
    }
  }
  function styledContent(
      styleLabel: string, content: string, tagName?: string): string {
    const tag = tagName ?? styleLabel;
    const className = `${styleLabel.replace(/_/g, `-`)}`;
    const headingAttr = /^h\d$/.test(tag) ? ` data-heading="true"` : ``;
    return `<${tag} class="${className}"${headingAttr}>${content}</${tag}>`;
  }
  const macCodeSvg =
      `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" width="45px" height="13px" viewBox="0 0 450 130"><ellipse cx="50" cy="65" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2" fill="rgb(237,108,96)" /><ellipse cx="225" cy="65" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2" fill="rgb(247,193,81)" /><ellipse cx="400" cy="65" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2" fill="rgb(100,200,86)" /></svg>`;
  const renderer: any = {
    heading({tokens, depth}: any) {
      const text = (this as any).parser.parseInline(tokens);
      return styledContent(`h${depth}`, text);
    },
    paragraph({tokens}: any) {
      const text = (this as any).parser.parseInline(tokens);
      const isFigureImage = text.includes(`<figure`) && text.includes(`<img`);
      const isEmpty = text.trim() === ``;
      if (isFigureImage || isEmpty) return text;
      return styledContent(`p`, text);
    },
    blockquote({tokens}: any) {
      const text = (this as any).parser.parse(tokens);
      return styledContent(`blockquote`, text);
    },
    code({text, lang = ``}: any) {
      const langText = String(lang).split(` `)[0];
      const isLanguageRegistered = hljs.getLanguage(langText);
      const language = isLanguageRegistered ? langText : `plaintext`;
      const highlighted =
          highlightAndFormatCode(text, language, hljs, !!opts.isShowLineNumber);
      const span = `<span class="mac-sign" style="padding: 10px 14px 0;">${
          macCodeSvg}</span>`;
      const code = `<code class="language-${lang}">${highlighted}</code>`;
      return `<pre class="hljs code__pre">${span}${code}</pre>`;
    },
    codespan({text}: any) {
      return styledContent(`codespan`, escapeHtml(text), `code`);
    },
    list({ordered, items, start = 1}: any) {
      const html =
          items
              .map((item: any, idx: number) => {
                const content = (this as any).parser.parseInline(item.tokens);
                const prefix = ordered ? `${Number(start) + idx}. ` : `• `;
                return styledContent(`listitem`, `${prefix}${content}`, `li`);
              })
              .join(``);
      return styledContent(ordered ? `ol` : `ul`, html);
    },
    image({href, title, text}: any) {
      let legendText = ``;
      if (opts.legend !== 'none') {
        const options = opts.legend.split(`-`);
        for (const option of options) {
          if (option === `alt` && text) {
            legendText = text;
            break;
          }
          if (option === `title` && title) {
            legendText = title;
            break;
          }
        }
      }
      const subText = legendText ? styledContent(`figcaption`, legendText) : ``;
      const titleAttr = title ? ` title="${title}"` : ``;
      return `<figure><img src="${href}"${titleAttr} alt="${text}"/>${
          subText}</figure>`;
    },
    link({href, title, text, tokens}: any) {
      const parsedText = (this as any).parser.parseInline(tokens);
      if (/^https?:\/\/mp\.weixin\.qq\.com/.test(href))
        return `<a href="${href}" title="${title || text}">${parsedText}</a>`;
      if (href === text) return parsedText;
      return `<a href="${href}" title="${title || text}">${parsedText}</a>`;
    },
    strong({tokens}: any) {
      return styledContent(`strong`, (this as any).parser.parseInline(tokens));
    },
    em({tokens}: any) {
      return styledContent(`em`, (this as any).parser.parseInline(tokens));
    },
    table({header, rows}: any) {
      const headerRow =
          header
              .map(
                  (cell: any) => styledContent(
                      `th`, (this as any).parser.parseInline(cell.tokens)))
              .join(``);
      const body =
          rows.map(
                  (row: any) => styledContent(
                      `tr`,
                      row.map(
                             (cell: any) => styledContent(
                                 `td`,
                                 (this as any).parser.parseInline(cell.tokens)))
                          .join(``)))
              .join(``);
      return `<section style="max-width: 100%; overflow: auto"><table class="preview-table"><thead>${
          headerRow}</thead><tbody>${body}</tbody></table></section>`;
    },
    hr() {
      return styledContent(`hr`, ``);
    },
  };
  marked.use({renderer});
  const {markdownContent, readingTime: rt} =
      parseFrontMatterAndContent(markdown);
  let html = marked.parse(markdownContent) as string;
  html = sanitizeHtml(html);
  if (opts.countStatus && rt?.words)
    html = `<blockquote class="md-blockquote"><p class="md-blockquote-p">字数 ${
               rt.words}，阅读大约需 ${
               Math.ceil(rt.minutes)} 分钟</p></blockquote>` +
        html;
  html += `<style>.hljs.code__pre > .mac-sign {display: ${
      opts.isMacCodeBlock ?
          `flex` :
          `none`};}</style><style>h2 strong {color: inherit !important;}</style>`;
  html = styledContent(`container`, html, `section`);
  const themeCss = opts.includeCss ? (() => {
    const varsCss =
        `:root{--background:0 0% 100%;--foreground:0 0% 3.9%;--blockquote-background:#f7f7f7;--md-primary-color:${
            opts.primaryColor};--md-font-size:${
            opts.fontSize};--md-font-family:${opts.fontFamily};}`;
    const baseCss =
        readCssFromRepo('md/packages/shared/src/configs/theme-css/base.css');
    const themeFile = opts.theme === 'grace' ? 'grace.css' :
        opts.theme === 'simple'              ? 'simple.css' :
                                               'default.css';
    const themeCssContent = readCssFromRepo(
        `md/packages/shared/src/configs/theme-css/${themeFile}`);
    return `<style>${varsCss}${baseCss}${themeCssContent}</style>`;
  })() :
                                     ``;
  return {html, fullHtml: themeCss + html};
}
export class WechatMarkdownToHtmlNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Wechat Markdown To HTML',
    name: 'wechatMarkdownToHtmlNode',
    description: 'Convert Markdown to Wechat-friendly HTML (doocs/md style)',
    group: ['transform'],
    version: 1,
    defaults: {name: 'Wechat Markdown To HTML'},
    // @ts-ignore
    inputs: ['main'],
    // @ts-ignore
    outputs: ['main'],
    properties:
        [
          {
            displayName: 'Markdown',
            name: 'markdown',
            type: 'string',
            default: '',
            required: true,
            typeOptions: {rows: 12}
          },
          {
            displayName: 'Include Theme CSS',
            name: 'includeCss',
            type: 'boolean',
            default: true
          },
          {
            displayName: 'Theme',
            name: 'theme',
            type: 'options',
            default: 'default',
            options:
                [
                  {name: 'Default', value: 'default'},
                  {name: 'Grace', value: 'grace'},
                  {name: 'Simple', value: 'simple'}
                ],
            displayOptions: {show: {includeCss: [true]}}
          },
          {
            displayName: 'Primary Color',
            name: 'primaryColor',
            type: 'string',
            default: '#0F4C81',
            displayOptions: {show: {includeCss: [true]}}
          },
          {
            displayName: 'Font Size',
            name: 'fontSize',
            type: 'string',
            default: '16px',
            displayOptions: {show: {includeCss: [true]}}
          },
          {
            displayName: 'Font Family',
            name: 'fontFamily',
            type: 'string',
            default:
                '-apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif',
            displayOptions: {show: {includeCss: [true]}}
          },
          {
            displayName: 'Show Reading Stats',
            name: 'countStatus',
            type: 'boolean',
            default: false
          },
          {
            displayName: 'Mac Code Block Style',
            name: 'isMacCodeBlock',
            type: 'boolean',
            default: true
          },
          {
            displayName: 'Show Line Numbers',
            name: 'isShowLineNumber',
            type: 'boolean',
            default: false
          },
          {
            displayName: 'Image Legend',
            name: 'legend',
            type: 'options',
            default: 'alt',
            options:
                [
                  {name: 'Title First', value: 'title-alt'},
                  {name: 'Alt First', value: 'alt-title'},
                  {name: 'Only Title', value: 'title'},
                  {name: 'Only Alt', value: 'alt'},
                  {name: 'None', value: 'none'}
                ]
          },
        ],
  };
  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const out: INodeExecutionData[] = [];
    for (let i = 0; i < items.length; i++) {
      const markdown = this.getNodeParameter('markdown', i) as string;
      const includeCss =
          this.getNodeParameter('includeCss', i, true) as boolean;
      const theme = this.getNodeParameter('theme', i, 'default') as 'default' |
          'grace' | 'simple';
      const primaryColor =
          this.getNodeParameter('primaryColor', i, '#0F4C81') as string;
      const fontSize = this.getNodeParameter('fontSize', i, '16px') as string;
      const fontFamily =
          this.getNodeParameter(
              'fontFamily', i,
              '-apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif') as
          string;
      const countStatus =
          this.getNodeParameter('countStatus', i, false) as boolean;
      const isMacCodeBlock =
          this.getNodeParameter('isMacCodeBlock', i, true) as boolean;
      const isShowLineNumber =
          this.getNodeParameter('isShowLineNumber', i, false) as boolean;
      const legend = this.getNodeParameter('legend', i, 'alt') as any;
      const res = await convertMarkdownToWechatHtml(markdown, {
        primaryColor,
        fontSize,
        fontFamily,
        includeCss,
        theme,
        citeStatus: false,
        countStatus,
        isMacCodeBlock,
        isShowLineNumber,
        legend
      });
      out.push({json: res});
    }
    return [out];
  }
}
