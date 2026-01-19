import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import WechatMsgSignUtils from '../../../help/utils/WechatMsgSignUtils';
import xmlConvert from 'xml-js';

export default {
	name: '消息加密',
	value: 'sign:encrypt',
	options: [
		{
			displayName: '消息加密，根据配置加密，最后请使用 response节点进行响应',
			name: 'notice',
			type: 'notice',
			default: '',
		},
		{
			displayName: '响应数据格式',
			name: 'dataFormat',
			type: 'options',
			options: [
				{
					name: 'XML',
					value: 'xml',
				},
				{
					name: 'JSON',
					value: 'json',
				},
			],
			default: 'xml',
		},
		{
			displayName: '响应数据',
			name: 'content',
			type: 'string',
			default: '',
			typeOptions: { rows: 5 },
			required: true,
			displayOptions: {
				show: {
					dataFormat: ['xml'],
				},
			},
		},
		{
			displayName: '响应数据',
			name: 'content',
			type: 'json',
			default: '',
			typeOptions: { rows: 5 },
			displayOptions: {
				show: {
					dataFormat: ['json'],
				},
			},
			required: true,
		},
		{
			displayName: '令牌(Token)',
			name: 'token',
			// eslint-disable-next-line n8n-nodes-base/node-param-type-options-password-missing
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: '消息加解密密钥 (EncodingAESKey)',
			name: 'aesKey',
			type: 'string',
			default: '',
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const token = this.getNodeParameter('token', index) as string;
		const aesKey = this.getNodeParameter('aesKey', index) as string;
		const content = this.getNodeParameter('content', index) as string;
		const dataFormat = this.getNodeParameter('dataFormat', index, 'xml') as string;

		const credentials = await this.getCredentials('wechatOfficialAccountCredentialsApi');
		const appId = credentials.appid as string;

		let body: any;

		body = WechatMsgSignUtils.encryptResponse(content, aesKey, token, appId);

		if (dataFormat === 'xml') {
			body = xmlConvert.js2xml(
				{
					xml: body,
				},
				{
					indentCdata: true,
					compact: true,
					ignoreComment: true,
					spaces: 4,
					textFn: (value: any, currentElementName: string, currentElementObj: any) => {
						if (typeof currentElementObj !== 'string') return value;
						return `<![CDATA[${value}]]>`;
					},
				},
			);
		}

		return {
			body,
		};
	},
} as ResourceOperations;
