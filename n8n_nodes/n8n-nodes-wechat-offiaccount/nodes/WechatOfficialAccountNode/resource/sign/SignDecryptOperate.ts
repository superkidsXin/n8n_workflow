import { IDataObject, IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import WechatMsgSignUtils from '../../../help/utils/WechatMsgSignUtils';

export default {
	name: '消息解密',
	value: 'sign:decrypt',
	options: [
		{
			displayName: 'Signature',
			description: 'Webhook query 传的参数',
			name: 'signature',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Timestamp',
			description: 'Webhook query 传的参数',
			name: 'timestamp',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Nonce',
			description: 'Webhook query 传的参数',
			name: 'nonce',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'EncryptType',
			description: 'Webhook query 传的参数',
			name: 'encrypt_type',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: '加密数据',
			description: 'Webhook body 传的参数',
			name: 'encrypt_str',
			type: 'string',
			default: '',
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
		const signature = this.getNodeParameter('signature', index) as string;
		const timestamp = this.getNodeParameter('timestamp', index) as string;
		const nonce = this.getNodeParameter('nonce', index) as string;
		const encryptType = this.getNodeParameter('encrypt_type', index) as string;
		const encryptStr = this.getNodeParameter('encrypt_str', index) as string;
		const token = this.getNodeParameter('token', index) as string;
		const aesKey = this.getNodeParameter('aesKey', index, '') as string;

		if (!signature || !timestamp || !nonce) {
			throw new NodeOperationError(this.getNode(), {
				message: 'Invalid signature',
				query: {
					signature,
					timestamp,
					nonce,
				},
			});
		}

		if (!WechatMsgSignUtils.checkSignature(token, signature, timestamp, nonce)) {
			throw new NodeOperationError(this.getNode(), {
				message: 'Invalid signature',
				query: {
					signature,
					timestamp,
					nonce,
				},
			});
		}

		if (encryptType && encryptType === 'aes') {

			try {

				const decryptObject = WechatMsgSignUtils.decrypt(encryptStr, aesKey);

				return decryptObject.xml;
			} catch (error) {
				throw new NodeOperationError(this.getNode(), {
					message: 'Decrypt Msg Error',
					error: error,
				});
			}
		}

		return {};
	},
} as ResourceOperations;
