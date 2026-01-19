import { debug } from 'console';
import { randomBytes } from 'crypto';
import type { ICredentialDataDecryptedObject, IExecuteFunctions, IHttpRequestHelper, ILoadOptionsFunctions, INodeCredentialsDetails, INodeExecutionData, INodePropertyOptions, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

function uuidV4(): string {
  const b = randomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const hex: string[] = [];
  for (let i = 0; i < 256; i++) hex.push((i + 256).toString(16).slice(1));
  return `${hex[b[0]]}${hex[b[1]]}${hex[b[2]]}${hex[b[3]]}-${hex[b[4]]}${hex[b[5]]}-${hex[b[6]]}${hex[b[7]]}-${hex[b[8]]}${hex[b[9]]}-${hex[b[10]]}${hex[b[11]]}${hex[b[12]]}${hex[b[13]]}${hex[b[14]]}${hex[b[15]]}`;
}

function parseBuglyCrashUrl(crashUrl: string): { appId: string; issueId: string; pid: string } {
  const u = new URL(crashUrl.trim());
  const m =
    u.pathname.match(/\/v2\/crash-reporting\/crashes\/([^/]+)\/([^/]+)/);
  if (!m) throw new Error(`Invalid Bugly crash url path: ${u.pathname}`);
  const appId = m[1];
  const issueId = m[2];
  const pid = u.searchParams.get('pid') || '1';
  return { appId, issueId, pid };
}

async function requestAny({ helpers, Referer, url, method, json }: {
  helpers: IExecuteFunctions, Referer: string, url: string, method: string,
  json?: boolean
}) {
  const debug = helpers.getNodeParameter('debug', 0) as boolean;
  const credentials = await helpers.getCredentials('buglyApi') as ICredentialDataDecryptedObject;
  if (debug) console.log('requestAny', url);
  const cookie = String(credentials.cookie || '').trim();
  const xToken = String(credentials.xToken || '').trim();
  const userAgent = String(credentials.userAgent || '').trim();
  const options = {
    method,
    url,
    headers: {
      Accept: 'application/json;charset=utf-8',
      'Content-Type': 'application/json;charset=utf-8',
      Referer: Referer,
      Cookie: cookie,
      'X-token': xToken,
      'x-csrf-token': 'undefined',
      ...(userAgent ? { 'User-Agent': userAgent } : {}),
    },
    json: json !== false,
  };
  try {
    const resp = await helpers.helpers.httpRequest(options as any);
    const data = resp?.data ?? resp;
    return {
      data: data, error: null
    }
  } catch (error) {
    console.error(error);
    return {
      data: null, error: error
    }
  }
}


//2026-01-19
function DateToString(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  return `${y}-${m}-${day}`;
}

function exceptionTypeListFromCrashType(crashType: string): string {
  const v = String(crashType || '').toLowerCase();
  if (v === 'all') return '';
  if (v === 'native') return 'Native';
  if (v === 'java') return 'Crash';
  if (v === 'anr') return 'ANR';
  return '';
}

function getStatusFromProcessStatus(processStatus: string): string {
  const v = String(processStatus || '').toLowerCase();
  if (v === 'all') return "";
  if (v === 'unprocessed') return "0";
  if (v === 'processed') return "1";
  if (v === 'ignored') return "2";
  return "";
}

async function getCrashDetailByCrashUrl(
  { helpers, i, crashUrl }: { helpers: IExecuteFunctions; i: number; crashUrl: string }) {
  const baseUrl = 'https://bugly.qq.com';
  const { appId, issueId, pid } = parseBuglyCrashUrl(crashUrl);
  let fsn = uuidV4();
  let qs = new URLSearchParams(
    { appId, pid, issueId, crashDataType: 'undefined', fsn })
    .toString();
  let url = `${baseUrl.replace(/\/+$/, '')}/v4/api/old/get-last-crash?${qs}`;
  const last_res = await requestAny(
    { helpers, Referer: crashUrl, url, method: 'GET' });
  if (last_res.error) throw last_res.error;
  const crashHash = last_res.data?.crashHash;
  if (!crashHash) throw new Error('Crash hash is empty');
  fsn = uuidV4();
  qs = new URLSearchParams(
    { appId, pid, issueId, crashDataType: 'undefined', fsn, crashHash })
    .toString();
  url = `${baseUrl.replace(/\/+$/, '')}/v4/api/old/get-crash-detail?${qs}`;
  const detail_res = await requestAny({ helpers, Referer: crashUrl, url, method: 'GET' });
  if (detail_res.error) throw detail_res.error;
  const data = detail_res.data;
  return { appId, issueId, pid, data, crashUrl };
}

let useSearchTimes = 2;
async function getIssueListByManualSearch({ helpers, i }: { helpers: IExecuteFunctions; i: number; }) {
  const baseUrl = 'https://bugly.qq.com';
  const appId = helpers.getNodeParameter('appId', i) as string;
  const pid = helpers.getNodeParameter('pid', i) as string;
  const packageName = helpers.getNodeParameter('packageName', i) as string;
  const packageVersion = helpers.getNodeParameter('packageVersion', i) as string;
  const keyword = helpers.getNodeParameter('keyword', i) as string;
  const crashType = helpers.getNodeParameter('crashType', i) as string;
  const processStatus = helpers.getNodeParameter('processStatus', i) as string;
  const timeType = helpers.getNodeParameter('timeType', i) as string;
  const debug = helpers.getNodeParameter('debug', 0) as boolean;
  let startData = new Date();
  let endData = new Date();
  if (timeType === 'last_1_day') {
    startData = new Date(new Date().getTime());
    endData = new Date(new Date().getTime());
  } else if (timeType === 'last_7_days') {
    startData = new Date(new Date().getTime() - 6 * 24 * 60 * 60 * 1000);
    endData = new Date(new Date().getTime());
  } else if (timeType === 'custom') {
    const startTime = helpers.getNodeParameter('startTime', i) as string;
    const endTime = helpers.getNodeParameter('endTime', i) as string;
    startData = new Date(startTime);
    endData = new Date(endTime);
  }
  const startDataTIme = DateToString(startData);
  const endDataTIme = DateToString(endData);
  if (debug) {
    console.log('startDataTIme', startDataTIme);
    console.log('endDataTIme', endDataTIme);
  }
  const platformId = '1';
  const appIdClean = String(appId || '').trim();
  const pidClean = String(pid || '').trim() || '1';
  const processStatusClean = getStatusFromProcessStatus(processStatus);
  if (!appIdClean) throw new Error('appId 为空');
  const rows = 50;
  let start = 0;
  const allIssues: any[] = [];
  for (let guard = 0; guard < 200; guard++) {
    const fsn = uuidV4();
    const params: Record<string, string> = {
      startDateStr: startDataTIme || '',
      start: String(start),
      userSearchPage: '/v2/workbench/apps',
      endDateStr: endDataTIme || '',
      pid: pidClean,
      platformId,
      date: timeType,
      sortOrder: 'desc',
      detail: keyword || "",
      useSearchTimes: String(useSearchTimes++),
      version: String(packageVersion || '').trim() || '',
      rows: String(rows),
      sortField: 'matchCount',
      status: processStatusClean,
      bundleId: String(packageName || '').trim(),
      appId: appIdClean,
      fsn,
    };
    const exceptionTypeList = exceptionTypeListFromCrashType(crashType);
    if (exceptionTypeList) params.exceptionTypeList = exceptionTypeList;
    const kw = String(keyword || '').trim();
    if (kw) params.keyword = kw;
    Object.keys(params).forEach((k) => {
      if (!params[k]) delete params[k];
    });
    const qs = new URLSearchParams(params).toString();
    const url = `${baseUrl.replace(/\/+$/, '')}/v2/search?${qs}`;
    const resp = await requestAny({
      helpers,
      Referer: `${baseUrl.replace(/\/+$/, '')}/v2/workbench/apps`,
      url,
      method: 'GET'
    });
    if (resp.error) throw resp.error;
    if (debug) {
      console.log('geturl', url);
      console.log('resp', resp.data);
    }
    const issueList = resp.data?.ret?.issueList ?? [];
    const numFound = resp.data?.ret?.numFound ?? 0;
    if (debug) {
      console.log('issueList length', issueList.length);
      console.log('numFound', numFound);
    }
    if (!Array.isArray(issueList)) throw new Error('search 返回 issueList 不是数组');
    for (const issue of issueList) {
      const crashUrl = `${baseUrl.replace(/\/+$/, '')}/v2/crash-reporting/crashes/${appIdClean}/${issue.issueId}?pid=${pidClean}`;
      if (debug) console.log('crashUrl', crashUrl);
      const detail = await getCrashDetailByCrashUrl({ helpers, i, crashUrl });
      allIssues.push(detail);
    }
    start += rows;
    if (allIssues.length >= numFound) break;
    if (issueList.length === 0) break;
  }
  return {
    issueList: allIssues
  };
}

//https://bugly.qq.com/v4/api/old/info
async function getuserId({ helpers, baseUrl }: {
  helpers: IExecuteFunctions;
  baseUrl: string;
}): Promise<string> {
  try {
    const debug = helpers.getNodeParameter('debug', 0) as boolean;
    const url = `${baseUrl.replace(/\/+$/, '')}/v4/api/old/info`;
    if (debug) console.log('getuserId', url);
    const resp = await requestAny({ helpers, Referer: url, url, method: 'GET' });
    if (resp.error) throw resp.error;
    return resp.data?.userId ?? '';
  } catch (error) {
    console.error(error);
    return '';
  }
}


//get app list
async function getAppList({ helpers, baseUrl, userId }: {
  helpers: IExecuteFunctions;
  baseUrl: string;
  userId: string;
}): Promise<any[]> {
  try {
    const url = `${baseUrl.replace(/\/+$/, '')}/v4/api/old/app-list?userId=${encodeURIComponent(userId)}&fsn=${uuidV4()}`;
    const resp = await requestAny({ helpers, Referer: url, url, method: 'GET' });
    if (resp.error) throw resp.error;
    return resp.data;
  }
  catch (error) {
    console.error(error);
    return [];
  }
}

export class Bugly implements INodeType {
  methods = {
    loadOptions: {
      async getBuglyAppList(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const baseUrl = 'https://bugly.qq.com';
        const userId = await getuserId({ helpers: this as any, baseUrl });
        if (!userId) throw new Error('无法从 /v4/api/old/info 获取 userId');
        const list = await getAppList({ helpers: this as any, baseUrl, userId });
        return list.map((a: any) => {
          const appId = String(a?.appId ?? a?.id ?? '').trim();
          const name = String(a?.appName ?? a?.name ?? a?.productName ?? a?.bundleId ?? a?.packageName ?? appId).trim();
          return { name: appId ? `${name} (${appId})` : name, value: appId || name };
        }).filter((o: any) => String(o.value || '').trim().length > 0);
      },
    },
  };
  description: INodeTypeDescription = {
    displayName: 'Bugly',
    name: 'bugly',
    group: ['transform'],
    version: 1,
    description: 'Fetch Bugly crash details and call stack',
    defaults: { name: 'Bugly' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [{ name: 'buglyApi', required: true }],
    properties:
      [
        {
          displayName: 'debug',
          name: 'debug',
          type: 'boolean',
          default: false,
        },
        {
          displayName: '获取方式',
          name: 'mode',
          type: 'options',
          default: 'url',
          options:
            [
              { name: '通过URL', value: 'url' },
              { name: '手动搜索', value: 'manual' },
            ],
        },
        {
          displayName: 'Crash URL',
          name: 'crashUrl',
          type: 'string',
          default: '',
          placeholder:
            'https://bugly.qq.com/v2/crash-reporting/crashes/{appId}/{issueId}?pid=1',
          required: true,
          displayOptions: { show: { mode: ['url'] } },
          typeOptions: {
            rows: 10,
          },
        },
        {
          displayName: "appid",
          name: 'appId',
          type: 'options',
          default: '',
          required: true,
          typeOptions: { loadOptionsMethod: 'getBuglyAppList' },
          displayOptions: { show: { mode: ['manual'] } },
        },
        {
          displayName: "pid",
          name: 'pid',
          type: 'options',
          default: '1',
          options: [
            { name: 'android', value: '1' },
            { name: 'ios', value: '2' },
          ],
          required: true,
          displayOptions: { show: { mode: ['manual'] } },
        },
        {
          displayName: '包名',
          name: 'packageName',
          type: 'string',
          default: '',
          displayOptions: { show: { mode: ['manual'] } },
        },
        {
          displayName: '包版本',
          name: 'packageVersion',
          type: 'string',
          default: '',
          displayOptions: { show: { mode: ['manual'] } },
        },
        {
          displayName: '时间类型',
          name: 'timeType',
          type: 'options',
          default: 'custom',
          options: [
            { name: '自定义', value: 'custom' },
            { name: '最近1天', value: 'last_1_day' },
            { name: '最近7天', value: 'last_7_days' },
          ],
          displayOptions: { show: { mode: ['manual'] } },
        },
        {
          displayName: '开始时间',
          name: 'startTime',
          type: 'dateTime',
          default: '',
          displayOptions: { show: { mode: ['manual'], timeType: ['custom'] } },
        },
        {
          displayName: '结束时间',
          name: 'endTime',
          type: 'dateTime',
          default: '',
          displayOptions: { show: { mode: ['manual'], timeType: ['custom'] } },
        },
        {
          displayName: '搜索关键字',
          name: 'keyword',
          type: 'string',
          default: '',
          displayOptions: { show: { mode: ['manual'] } },
        },
        {
          displayName: '闪退类型',
          name: 'crashType',
          type: 'options',
          default: 'all',
          options:
            [
              { name: '全部', value: 'all' },
              { name: 'Java Crash', value: 'java' },
              { name: 'Native Crash', value: 'native' },
              { name: 'ANR', value: 'anr' },
            ],
          displayOptions: { show: { mode: ['manual'] } },
        },
        {
          displayName: '处理状态',
          name: 'processStatus',
          type: 'options',
          default: 'unprocessed',
          options:
            [
              { name: '全部', value: 'all' },
              { name: '未处理', value: 'unprocessed' },
              { name: '已处理', value: 'processed' },
              { name: '已忽略', value: 'ignored' },
            ],
          displayOptions: { show: { mode: ['manual'] } },
        },
      ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const out: INodeExecutionData[] = [];
    for (let i = 0; i < items.length; i++) {
      if (this.getNodeParameter('mode', i) === 'manual') {
        try {
          const res = await getIssueListByManualSearch({ helpers: this, i });
          for (const issue of res.issueList) out.push({ json: issue });
        } catch (e: any) {
          throw new NodeApiError(
            this.getNode(), e as any,
            { itemIndex: i, message: `手动搜索失败:${e.message}:${e.stack}` });
        }
      } else {
        const crashUrlRaw = this.getNodeParameter('crashUrl', i) as string;
        const crashUrls = String(crashUrlRaw || '')
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        if (crashUrls.length === 0) {
          throw new NodeApiError(
            this.getNode(), { message: 'Crash URL is empty' } as any,
            { itemIndex: i });
        }
        for (const crashUrl of crashUrls) {
          try {
            const detail = await getCrashDetailByCrashUrl({ helpers: this, i: i, crashUrl });
            out.push({ json: detail });
          } catch (e) {
            throw new NodeApiError(
              this.getNode(), e as any,
              { itemIndex: i, message: '通过URL获取crash详情失败' });
          }
        }
      }
    }
    return [out];
  }
}
