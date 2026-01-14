import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

type DashScopeSubmitResponse = {
	output?: {
		task_id?: string;
	};
};

export class DashScopeAsr implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DashScope ASR (Paraformer)',
		name: 'dashScopeAsr',
		icon: 'file:dashscope.svg',
		group: ['transform'],
		version: 1,
		description: 'Transcribe an audio/video URL via DashScope Paraformer recorded speech recognition',
		defaults: {
			name: 'DashScope ASR',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{ name: 'dashScopeApi', required: true }],
		properties: [
			{
				displayName: 'File URL',
				name: 'fileUrl',
				type: 'string',
				default: '',
				required: true,
				description: 'Publicly accessible URL to audio/video file',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				default: 'paraformer-v2',
			},
			{
				displayName: 'Language Hints',
				name: 'languageHints',
				type: 'string',
				default: 'zh,en',
				description: 'Comma-separated, e.g. zh,en',
			},
			{
				displayName: 'Poll Interval (Seconds)',
				name: 'pollIntervalSec',
				type: 'number',
				default: 2,
				minValue: 1,
			},
			{
				displayName: 'Max Wait (Seconds)',
				name: 'maxWaitSec',
				type: 'number',
				default: 120,
				minValue: 10,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const creds = await this.getCredentials('dashScopeApi');
		const apiKey = creds.apiKey as string;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
			const model = this.getNodeParameter('model', itemIndex) as string;
			const languageHintsStr = this.getNodeParameter('languageHints', itemIndex) as string;
			const pollIntervalSec = this.getNodeParameter('pollIntervalSec', itemIndex) as number;
			const maxWaitSec = this.getNodeParameter('maxWaitSec', itemIndex) as number;

			const languageHints = languageHintsStr
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean);

			const submitResp = (await this.helpers.httpRequest({
				method: 'POST',
				url: 'https://dashscope.aliyuncs.com/api/v1/services/audio/asr/transcription',
				headers: {
					Authorization: `Bearer ${apiKey}`,
					'Content-Type': 'application/json',
					'X-DashScope-Async': 'enable',
				},
				body: {
					model,
					input: { file_urls: [fileUrl] },
					parameters: {
						language_hints: languageHints.length ? languageHints : undefined,
					},
				},
				json: true,
			})) as DashScopeSubmitResponse;

			const taskId = submitResp?.output?.task_id;
			if (!taskId) throw new Error('DashScope did not return task_id');

			const start = Date.now();
			let taskResp: any;
			while (true) {
				taskResp = await this.helpers.httpRequest({
					method: 'POST',
					url: `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
					headers: {
						Authorization: `Bearer ${apiKey}`,
					},
					json: true,
				});

				const status = taskResp?.output?.task_status;
				if (status === 'SUCCEEDED' || status === 'FAILED' || status === 'CANCELED') break;

				if ((Date.now() - start) / 1000 > maxWaitSec) {
					throw new Error(`DashScope task timeout after ${maxWaitSec}s, task_id=${taskId}`);
				}
				await sleep(pollIntervalSec * 1000);
			}

			const status = taskResp?.output?.task_status;
			if (status !== 'SUCCEEDED') {
				throw new Error(`DashScope task failed: status=${status}, message=${taskResp?.output?.message || ''}`);
			}

			// Fetch transcription result
			const results = taskResp?.output?.results || [];
			let text = '';
			for (const r of results) {
				const url = r?.transcription_url;
				if (!url) continue;
				const trans = (await this.helpers.httpRequest({
					method: 'GET',
					url,
					json: true,
				})) as any;
				const t = trans?.transcripts?.[0]?.text;
				if (t) text = t;
			}

			returnData.push({
				json: {
					taskId,
					status,
					text,
					fileUrl,
					model,
				},
			});
		}

		return [returnData];
	}
}
