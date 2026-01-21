import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class AliyunOssApi implements ICredentialType {
	name = 'aliyunOssApi';
	displayName = 'Aliyun OSS API';

	// @ts-ignore
	icon = 'file:icon.svg';

	properties: INodeProperties[] = [
		{
			displayName: 'Region',
			name: 'region',
			type: 'options',
			options: [
				{ name: 'oss-cn-hangzhou', value: 'oss-cn-hangzhou' },
				{ name: 'oss-cn-beijing', value: 'oss-cn-beijing' },
				{ name: 'oss-cn-shanghai', value: 'oss-cn-shanghai' },
				{ name: 'oss-cn-guangzhou', value: 'oss-cn-guangzhou' },
				{ name: 'oss-cn-chengdu', value: 'oss-cn-chengdu' },
			],
			default: 'oss-cn-guangzhou',
			required: true,
		},
		{
			displayName: 'Bucket',
			name: 'bucket',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'AccessKeyId',
			name: 'accessKeyId',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'AccessKeySecret',
			name: 'accessKeySecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
		{
			displayName: 'Use CNAME',
			name: 'cname',
			type: 'boolean',
			default: false,
			description: 'If enabled, Endpoint is treated as your custom domain name',
		},
		{
			displayName: 'Endpoint (Optional)',
			name: 'endpoint',
			type: 'string',
			default: '',
			description: 'Custom endpoint or custom domain when Use CNAME is enabled',
		},
		{
			displayName: 'Secure (HTTPS)',
			name: 'secure',
			type: 'boolean',
			default: true,
		},
	];
}
