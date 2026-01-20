import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import RequestUtils from '../help/utils/RequestUtils';

type WikiNode = {
	node_token: string;
	parent_node_token?: string;
	has_child?: boolean;
	obj_type?: string;
	obj_token?: string;
	title?: string;
	obj_edit_time?: string;
	obj_create_time?: string;
};

async function listWikiNodesPage(
	this: IExecuteFunctions,
	params: {
		spaceId: string;
		parentNodeToken?: string;
		pageSize: number;
		pageToken?: string;
	},
): Promise<{ items: WikiNode[]; hasMore: boolean; pageToken?: string }> {
	const qs: IDataObject = {
		page_size: params.pageSize,
	};
	if (params.parentNodeToken) qs.parent_node_token = params.parentNodeToken;
	if (params.pageToken) qs.page_token = params.pageToken;

	const res = (await RequestUtils.request.call(this, {
		method: 'GET',
		url: `/open-apis/wiki/v2/spaces/${params.spaceId}/nodes`,
		qs,
	})) as any;

	const data = res?.data || {};
	return {
		items: data.items || [],
		hasMore: !!data.has_more,
		pageToken: data.page_token,
	};
}

async function listWikiNodesAll(
	this: IExecuteFunctions,
	params: {
		spaceId: string;
		parentNodeToken?: string;
		pageSize: number;
	},
): Promise<WikiNode[]> {
	let pageToken: string | undefined;
	let hasMore = true;
	const out: WikiNode[] = [];

	while (hasMore) {
		const page = await listWikiNodesPage.call(this, {
			spaceId: params.spaceId,
			parentNodeToken: params.parentNodeToken,
			pageSize: params.pageSize,
			pageToken,
		});
		out.push(...page.items);
		hasMore = page.hasMore;
		pageToken = page.pageToken;
	}

	return out;
}

async function getDocxInfo(this: IExecuteFunctions, documentId: string): Promise<IDataObject> {
	const res = (await RequestUtils.request.call(this, {
		method: 'GET',
		url: `/open-apis/docx/v1/documents/${documentId}`,
	})) as any;
	return res?.data?.document || res?.data || res || {};
}

export class WikiSpaceDocuments implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Feishu Wiki Space Documents',
		name: 'feishuWikiSpaceDocuments',
		icon: 'file:../FeishuNode/icon.png',
		group: ['transform'],
		version: 1,
		description: 'List documents in Feishu Wiki Space by space_id',
		defaults: {
			name: 'Feishu Wiki Space Documents',
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
				displayName: '知识空间 ID',
				name: 'space_id',
				type: 'string',
				required: true,
				default: '',
			},
			{
				displayName: '父节点 Token',
				name: 'parent_node_token',
				type: 'string',
				default: '',
				typeOptions: { password: true },
			},
			{
				displayName: '递归子节点',
				name: 'recursive',
				type: 'boolean',
				default: true,
			},
			{
				displayName: '仅输出文档(doc/docx)',
				name: 'only_docs',
				type: 'boolean',
				default: true,
			},
			{
				displayName: '补充 Docx 文档详情',
				name: 'include_docx_info',
				type: 'boolean',
				default: true,
			},
			{
				displayName: '每页大小',
				name: 'page_size',
				type: 'number',
				default: 50,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const spaceId = this.getNodeParameter('space_id', i) as string;
			const parentNodeToken = (this.getNodeParameter('parent_node_token', i, '') as string) || undefined;
			const recursive = this.getNodeParameter('recursive', i) as boolean;
			const onlyDocs = this.getNodeParameter('only_docs', i) as boolean;
			const includeDocxInfo = this.getNodeParameter('include_docx_info', i) as boolean;
			const pageSize = this.getNodeParameter('page_size', i) as number;

			const out: WikiNode[] = [];

			const walk = async (pToken?: string) => {
				const nodes = await listWikiNodesAll.call(this, {
					spaceId,
					parentNodeToken: pToken,
					pageSize,
				});

				for (const n of nodes) {
					const isDoc = n.obj_type === 'doc' || n.obj_type === 'docx';
					if (!onlyDocs || isDoc) out.push(n);

					if (recursive && n.has_child && n.node_token) {
						await walk(n.node_token);
					}
				}
			};

			await walk(parentNodeToken);

			for (const node of out) {
				const json: IDataObject = {
					...node,
					space_id: spaceId,
				};

				if (includeDocxInfo && node.obj_type === 'docx' && node.obj_token) {
					json.docx = await getDocxInfo.call(this, node.obj_token);
				}

				returnData.push({ json });
			}
		}

		return [returnData];
	}
}
