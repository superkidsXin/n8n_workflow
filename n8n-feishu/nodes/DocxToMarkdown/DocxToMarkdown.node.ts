import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import RequestUtils from '../help/utils/RequestUtils';
import { docxBlocksToMarkdown } from '../help/utils/DocxMarkdownRenderer';

type DocxBlock = IDataObject & {
	block_id?: string;
	children?: string[];
	block_type?: number;
};

async function getAllBlocks(this: IExecuteFunctions, documentId: string): Promise<DocxBlock[]> {
	const all: DocxBlock[] = [];
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
		const items: DocxBlock[] = data.items || [];
		all.push(...items);
		hasMore = !!data.has_more;
		pageToken = data.page_token || '';
		if (!pageToken && hasMore) {
			// fail-safe to avoid infinite loop
			hasMore = false;
		}
	}

	return all;
}

async function getDocInfo(this: IExecuteFunctions, documentId: string): Promise<IDataObject> {
	const res = (await RequestUtils.request.call(this, {
		method: 'GET',
		url: `/open-apis/docx/v1/documents/${documentId}`,
	})) as any;
	return res?.data?.document || res?.data || res || {};
}

export class DocxToMarkdown implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Feishu Docx To Markdown',
		name: 'feishuDocxToMarkdown',
		icon: 'file:../FeishuNode/icon.png',
		group: ['transform'],
		version: 1,
		description: 'Convert Feishu docx document to Markdown',
		defaults: {
			name: 'Feishu Docx To Markdown',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
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
		properties: [
			{
				displayName: '凭证类型',
				name: 'authentication',
				type: 'options',
				options: [
					{ name: '用户级别凭证', value: 'feishuOauth2Api' },
					{ name: '应用级别凭证', value: 'feishuCredentialsApi' },
				],
				default: 'feishuCredentialsApi',
			},
			{
				displayName: '文档 ID',
				name: 'document_id',
				type: 'string',
				required: true,
				default: '',
				description: 'docx 文档的 document_id（通常等于 wiki node 的 obj_token）',
			},
			{
				displayName: '包含文档详情',
				name: 'include_doc_info',
				type: 'boolean',
				default: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const documentId = this.getNodeParameter('document_id', i) as string;
			const includeDocInfo = this.getNodeParameter('include_doc_info', i) as boolean;

			const blocks = await getAllBlocks.call(this, documentId);
			const renderInput = {
				document: { document_id: documentId },
				blocks,
			};

			const rendered = docxBlocksToMarkdown(renderInput as any);

			const json: IDataObject = {
				document_id: documentId,
				markdown: rendered.markdown,
				file_tokens: rendered.fileTokens,
			};

			if (includeDocInfo) {
				json.document = await getDocInfo.call(this, documentId);
			}

			returnData.push({ json });
		}

		return [returnData];
	}
}
