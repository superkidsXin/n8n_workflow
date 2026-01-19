import {IDataObject, IExecuteFunctions, NodeOperationError} from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import nodeUtils from "../../../help/utils/NodeUtils";

const SpreadsheetValuesWriteOperate: ResourceOperations = {
	name: '自动写入数据',
	value: 'spreadsheet:valuesAutoWrite',
	order: 70,
	options: [
		{
			displayName: '电子表格 Token',
			name: 'spreadsheetToke',
			type: 'string',
			required: true,
			default: '',
			description: '电子表格的 token。',
		},
		{
			displayName: '工作表 ID',
			name: 'sheetId',
			type: 'string',
			required: true,
			default: "",
		},
		{
			displayName: '数据',
			name: 'values',
			type: 'json',
			required: true,
			default: '[["第一行1","第一行2"]，["第二行1","第二行2"]]',
		},
		{
			displayName: '开始行数',
			name: 'startLine',
			type: 'number',
			required: true,
			default: 1,
		}
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const spreadsheetToken = this.getNodeParameter('spreadsheetToke', index) as string;
		const sheetId = this.getNodeParameter('sheetId', index) as string;
		const startLine = this.getNodeParameter('startLine', index) as number;
		const values = nodeUtils.getNodeJsonData(this, 'values', index) as IDataObject[];

		if (!Array.isArray(values) || values.length === 0) {
			throw new NodeOperationError(this.getNode(), '数据不能为空');
		}

		function getColumnHeader(index: number): string {
			let column = '';
			index++; // Adjust index to 1-based (A=1, B=2, ...)

			while (index > 0) {
				const remainder = (index - 1) % 26;
				column = String.fromCharCode(65 + remainder) + column;
				index = Math.floor((index - 1) / 26);
			}
			return column;
		}

		const headers = Object.values(values[0]);
		// 使用headers 获取长度 A-Z AA-ZZ AAA-ZZZ
		const maxColumnHeader = getColumnHeader(headers.length);

		const range = `${sheetId}!A${startLine}:${maxColumnHeader}${startLine - 1 + values.length }`;

		const body: IDataObject = {
			valueRange: {
				range,
				values: values,
			},
		};

		const response = await RequestUtils.request.call(this, {
			method: 'PUT',
			url: `/open-apis/sheets/v2/spreadsheets/${spreadsheetToken}/values`,
			body,
		});

		return response;
	},
};

export default SpreadsheetValuesWriteOperate;
