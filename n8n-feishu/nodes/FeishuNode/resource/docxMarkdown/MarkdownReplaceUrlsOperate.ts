import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';

function escapeRegExp(str: string) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

type UrlMapping = { from: string; to: string } | { sourceUrl: string; url: string };

function normalizeMappings(raw: unknown): Array<{ from: string; to: string }> {
	if (!raw) return [];
	if (!Array.isArray(raw)) return [];
	return raw
		.map((m: any) => {
			const from = String(m?.from ?? m?.sourceUrl ?? '').trim();
			const to = String(m?.to ?? m?.url ?? '').trim();
			return { from, to };
		})
		.filter((m) => m.from.length > 0 && m.to.length > 0);
}

export default {
	name: '替换 Markdown URLs',
	value: 'markdown:replaceUrls',
	order: 100,
	options: [
		{
			displayName: 'Markdown',
			name: 'markdown',
			type: 'string',
			default: '',
			typeOptions: { rows: 12 },
			required: true,
		},
		{
			displayName: 'Mappings (JSON Array)',
			name: 'mappingsJson',
			type: 'string',
			default: '[]',
			typeOptions: { rows: 8 },
			required: true,
			description: 'Example: [{\"from\":\"old\",\"to\":\"new\"}] (also supports {sourceUrl,url})',
		},
		{
			displayName: 'Replace Mode',
			name: 'mode',
			type: 'options',
			default: 'exact',
			options: [
				{ name: 'Exact String', value: 'exact' },
				{ name: 'Regex (from treated as regex)', value: 'regex' },
			],
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const markdown = this.getNodeParameter('markdown', index) as string;
		const mappingsJson = this.getNodeParameter('mappingsJson', index) as string;
		const mode = this.getNodeParameter('mode', index) as 'exact' | 'regex';

		let parsed: UrlMapping[] = [];
		try {
			parsed = JSON.parse(mappingsJson || '[]');
		} catch {
			parsed = [];
		}

		const mappings = normalizeMappings(parsed).sort((a, b) => b.from.length - a.from.length);

		let replaced = markdown ?? '';
		for (const m of mappings) {
			if (mode === 'regex') replaced = replaced.replace(new RegExp(m.from, 'g'), m.to);
			else replaced = replaced.replace(new RegExp(escapeRegExp(m.from), 'g'), m.to);
		}

		return { markdown: replaced, mappingsApplied: mappings.length };
	},
} as ResourceOperations;

