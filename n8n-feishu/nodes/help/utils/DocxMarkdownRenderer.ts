import { IDataObject } from 'n8n-workflow';

type BlockType = number;

type TextElementStyle = {
	bold?: boolean;
	italic?: boolean;
	strikethrough?: boolean;
	underline?: boolean;
	inline_code?: boolean;
	link?: { url: string };
};

type TextRun = {
	content?: string;
	text_element_style?: TextElementStyle;
};

type TextElement = {
	text_run?: TextRun;
	equation?: { content: string };
	mention_doc?: { token: string; title: string };
};

type TextBlock = {
	elements?: TextElement[];
};

type Block = {
	block_id: string;
	parent_id?: string;
	children?: string[];
	block_type: BlockType;
	page?: TextBlock;
	text?: TextBlock;
	heading1?: TextBlock;
	heading2?: TextBlock;
	heading3?: TextBlock;
	heading4?: TextBlock;
	heading5?: TextBlock;
	heading6?: TextBlock;
	bullet?: TextBlock;
	ordered?: TextBlock;
	code?: TextBlock & { style?: { language?: number } };
	quote?: TextBlock;
	todo?: TextBlock & { style?: { done?: boolean } };
	divider?: unknown;
	image?: { token?: string };
	table?: {
		cells?: string[];
		property?: { row_size?: number; column_size?: number; header_row?: boolean };
	};
};

const BLOCK = {
	Page: 1,
	Text: 2,
	Heading1: 3,
	Heading2: 4,
	Heading3: 5,
	Heading4: 6,
	Heading5: 7,
	Heading6: 8,
	Bullet: 12,
	Ordered: 13,
	Code: 14,
	Quote: 15,
	TodoList: 17,
	Divider: 22,
	File: 23,
	Grid: 24,
	Image: 27,
	Table: 31,
	TableCell: 32,
};

function escapeHtmlTags(text: string) {
	return text.replace(/<|>/g, (m) => (m === '<' ? '&lt;' : '&gt;'));
}

function safeLink(url: string) {
	try {
		return decodeURIComponent(url);
	} catch {
		return url;
	}
}

function renderTextElement(el: TextElement): string {
	if (el.text_run) {
		const style = el.text_run.text_element_style;
		let text = el.text_run.content ?? '';
		text = escapeHtmlTags(text);
		if (!style) return text;

		if (style.link?.url) {
			return `[${text.trim()}](${safeLink(style.link.url)})`;
		}
		if (style.inline_code) {
			return `\`${text.trim()}\``;
		}
		if (style.bold) {
			return `**${text.trim()}**`;
		}
		if (style.italic) {
			return `_${text.trim()}_`;
		}
		if (style.strikethrough) {
			return `~~${text.trim()}~~`;
		}
		if (style.underline) {
			return `<u>${text.trim()}</u>`;
		}
		return text;
	}

	if (el.equation?.content) {
		return `$${el.equation.content.trim()}$`;
	}

	if (el.mention_doc?.token) {
		return `[${el.mention_doc.title}](${decodeURIComponent(el.mention_doc.token)})`;
	}

	return '';
}

function renderTextBlock(block?: TextBlock): string {
	if (!block?.elements?.length) return '';
	return block.elements.map(renderTextElement).join('');
}

function buildBlockMap(blocks: Block[]): Record<string, Block> {
	const map: Record<string, Block> = {};
	for (const b of blocks) {
		if (b?.block_id) map[b.block_id] = b;
	}
	return map;
}

function getEntryBlockId(documentId: string, blocks: Block[]): string {
	if (documentId && blocks.some((b) => b.block_id === documentId)) return documentId;
	const page = blocks.find((b) => b.block_type === BLOCK.Page);
	return page?.block_id || blocks[0]?.block_id;
}

function renderBlock(block: Block, map: Record<string, Block>, indentLevel: number): string {
	const indent = '  '.repeat(Math.max(indentLevel, 0));
	const children = block.children ?? [];

	switch (block.block_type) {
		case BLOCK.Page: {
			return children
				.map((id) => map[id])
				.filter(Boolean)
				.map((child) => renderBlock(child, map, 0))
				.filter((s) => s.trim().length > 0)
				.join('\n');
		}
		case BLOCK.Text: {
			const text = renderTextBlock(block.text);
			return text.trim().length ? `${indent}${text}\n` : '';
		}
		case BLOCK.Heading1:
			return `${indent}# ${renderTextBlock(block.heading1).trim()}\n`;
		case BLOCK.Heading2:
			return `${indent}## ${renderTextBlock(block.heading2).trim()}\n`;
		case BLOCK.Heading3:
			return `${indent}### ${renderTextBlock(block.heading3).trim()}\n`;
		case BLOCK.Heading4:
			return `${indent}#### ${renderTextBlock(block.heading4).trim()}\n`;
		case BLOCK.Heading5:
			return `${indent}##### ${renderTextBlock(block.heading5).trim()}\n`;
		case BLOCK.Heading6:
			return `${indent}###### ${renderTextBlock(block.heading6).trim()}\n`;
		case BLOCK.Bullet: {
			const text = renderTextBlock(block.bullet).trim();
			let out = `${indent}- ${text}\n`;
			if (children.length) {
				out += children
					.map((id) => map[id])
					.filter(Boolean)
					.map((child) => renderBlock(child, map, indentLevel + 1))
					.join('');
			}
			return out;
		}
		case BLOCK.Ordered: {
			const text = renderTextBlock(block.ordered).trim();
			let out = `${indent}1. ${text}\n`;
			if (children.length) {
				out += children
					.map((id) => map[id])
					.filter(Boolean)
					.map((child) => renderBlock(child, map, indentLevel + 1))
					.join('');
			}
			return out;
		}
		case BLOCK.Quote: {
			const text = renderTextBlock(block.quote).trim();
			return `${indent}> ${text}\n`;
		}
		case BLOCK.TodoList: {
			const done = (block.todo as any)?.style?.done ? 'x' : ' ';
			const text = renderTextBlock(block.todo).trim();
			return `${indent}- [${done}] ${text}\n`;
		}
		case BLOCK.Divider:
			return `${indent}---\n`;
		case BLOCK.Code: {
			const code = renderTextBlock(block.code).trimEnd();
			return `${indent}\`\`\`\n${code}\n\`\`\`\n`;
		}
		case BLOCK.Image: {
			const token = block.image?.token;
			if (!token) return '';
			return `${indent}![](${token})\n`;
		}
		case BLOCK.Table: {
			const rowSize = block.table?.property?.row_size ?? 0;
			const colSize = block.table?.property?.column_size ?? 0;
			if (!rowSize || !colSize || !block.table?.cells?.length) return '';

			const cells = block.table.cells
				.map((id) => map[id])
				.filter(Boolean)
				.map((cellBlock) => {
					const cellChildren = cellBlock.children ?? [];
					return cellChildren
						.map((cid) => map[cid])
						.filter(Boolean)
						.map((cb) => renderBlock(cb, map, 0).replace(/\n+/g, ' ').trim())
						.join(' ')
						.trim();
				});

			const rows: string[][] = [];
			for (let r = 0; r < rowSize; r++) {
				rows.push(cells.slice(r * colSize, (r + 1) * colSize));
			}

			const header = rows[0] ?? [];
			const body = rows.slice(1);

			let out = `|${header.map((c) => c || ' ').join('|')}|\n`;
			out += `|${new Array(colSize).fill('---').join('|')}|\n`;
			for (const row of body) {
				out += `|${row.map((c) => c || ' ').join('|')}|\n`;
			}
			return out;
		}
		default:
			return '';
	}
}

export function docxBlocksToMarkdown(input: { document: { document_id: string }; blocks: Block[] }): {
	markdown: string;
	fileTokens: string[];
	meta: IDataObject;
} {
	const documentId = input?.document?.document_id;
	const blocks = input?.blocks ?? [];
	const map = buildBlockMap(blocks);
	const entryId = getEntryBlockId(documentId, blocks);
	const entry = map[entryId];
	if (!entry) {
		return { markdown: '', fileTokens: [], meta: {} };
	}
	const markdown = renderBlock(entry, map, 0).trim() + '\n';

	const fileTokens: string[] = [];
	for (const b of blocks) {
		const token = b?.image?.token;
		if (token) fileTokens.push(token);
	}

	return { markdown, fileTokens: Array.from(new Set(fileTokens)), meta: {} };
}
