1. 分析url:
https://bugly.qq.com/v2/crash-reporting/crashes/673b9cc5e2/196149?pid=1

673b9cc5e2:appid
196149:issueid
pid=1

2. 获取issue对应的闪退列表(curl信息如下)
curl 'https://bugly.qq.com/v4/api/old/get-last-crash?appId=673b9cc5e2&pid=1&issueId=196149&crashDataType=undefined&fsn=e9e02721-5eb3-4805-b7b1-4b2b2a5ab643' \
  -H 'Accept: application/json;charset=utf-8' \
  -H 'Accept-Language: zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json;charset=utf-8' \
  -b 'RK=3KuhXvrvTw; ptcz=7706862bcc7244d5b738d0f3cec3808d4393ab7d373fee1b54b7a1a0d1ed8a59; pgv_pvid=1174740564; wetest_lang=zh-cn; _ga_0KGGHBND6H=GS2.1.s1757586721$o2$g0$t1757586721$j60$l0$h0; pac_uid=0_7TsT9fjdYA2a1; omgid=0_7TsT9fjdYA2a1; _qimei_uuid42=19919092824100a93789bad78d35c8fab6df854eda; _qimei_fingerprint=e6d48e2c309fce9671370abef6db162b; _qimei_q36=; _qimei_h38=d15943223789bad78d35c8fa0200000e919919; qq_domain_video_guid_verify=93fc44aad3df295b; yyb_muid=1BB602D6C87364D61D3514DFC973651E; bugly-free-useage=true; _ga_X6VDKNTNXJ=GS2.1.s1764638608$o2$g0$t1764638608$j60$l0$h0; _ga_63JZ3D576T=GS2.2.s1767858021$o1$g1$t1767858035$j46$l0$h0; _ga=GA1.1.369473485.1757584241; _gcl_au=1.1.541219298.1767859984; _ga_S0Y0QJNCMH=GS2.1.s1767859983$o1$g0$t1767860018$j25$l0$h0; bugly-session=s%3ArdRX5PgEWzezOFzlqkg80w7oGe7ItmKz.Lwt4tqqmRV77CbarSrMma1xFVwkYUlmFk4qgJyS2WNM; token-skey=42e1573a-b928-13e2-83a7-ca4dcb90443a; token-lifeTime=1768306796; bugly_session=eyJpdiI6Imh4WFVCVEZNdGVIWVJSRUFBZXJnNlE9PSIsInZhbHVlIjoia3gyTG81OUpacDdoZEtDSWc1TWdrQXVJUmNFQ1Z4TndzWDQ0SWg0YUtPbmxpZHZtalN5c05DSjdOS3A3dm55SFdlSGpTQlNORlwvcUxERXg2Y2s3VkNnPT0iLCJtYWMiOiIwMzgyYTZiZDcwNzE4ZGQ2ZThlNWRkOTJlZWM5ZTUxNDNlMmQ5ZjIxNDlhZmViMDcwNzk0ZDE0YTMxZGZjM2I2In0%3D; referrer=eyJpdiI6IkcrS0xubE1ZMFBZTmxkZ3NpREREU1E9PSIsInZhbHVlIjoiRDZwRXRxNXB3VXE4Snl6cXpaZ1BCZ09CWDlPeXREbkdqdGlnRHlvZ29Bb0xLbkg5aEpIQlIyNkFHVzB3R1dDNmhiRWgzMU5hT1wvZXR1OGE1dVNabnJpRFVJUFhGeXg4OVE0VWd1QktsKzJmdVYrOEtjVm4rN201TERsMUcyTmI3TjBSU0tZYm1Ea1wvMStvZUdDZWhMaTlFanpcL1wvd3dhQUZEQUxYU2U1djVTaVF5Y0NiMW0rSmd3akU2blpTVTlqZiIsIm1hYyI6IjUwMTZiY2NhNGMzYTI4ZGM3MmZjMjI0NzU0ZTU0ODk4MGMyY2M4ZTVkOGQxOGMwM2Y0MmMxOWY0NTJmZjRmYjMifQ%3D%3D' \
  -H 'Referer: https://bugly.qq.com/v2/crash-reporting/crashes/673b9cc5e2/196149?pid=1' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0' \
  -H 'X-token: 304293246' \
  -H 'sec-ch-ua: "Microsoft Edge";v="143", "Chromium";v="143", "Not A(Brand";v="24"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Windows"' \
  -H 'x-csrf-token: undefined'

其中fsn是通过bugly_fn.js中的p函数获取p()；
cookies只可以通过playwright打开浏览器，让用户登录后，自动保存cookie

返回信息如下 ：
{
    "msg": "ok",
    "code": 200,
    "data": {
        "processName": "com.arkgames.msxycnhy",
        "threadName": "NativeThread(17553)",
        "crashId": "9796",
        "crashHash": "E5:69:BE:C9:0B:27:F9:3D:2F:55:6D:50:98:4A:E4:54",
        "crashTime": "2026-01-11 14:30:32",
        "uploadTime": "2026-01-11 14:30:44",
        "bundleId": "com.arkgames.msxycnhy",
        "productVersion": "1.107.26010606",
        "startTime": "1768113024444",
        "appInBack": "false",
        "hardware": "fail",
        "modelOriginalName": "fail",
        "osVersion": "Android 14,level 34",
        "rom": "vivo%2FFUNTOUCH%2FOriginOS+5",
        "cpuType": "arm64-v8a",
        "type": "101",
        "callStack": "#00    pc 00000000000067f0    /system/lib64/libaaudio.so [arm64-v8a::64db3501bef15855fdd847d42ced0749]\n#01    pc 000000000028b04c    /data/app/~~kxSZNtM2hiJ7eyJfr31vew==/com.arkgames.msxycnhy-zBbxvSuU2_BPYv4ztovs7w==/lib/arm64/libAkSoundEngine.so (_ZN13CAkSinkAAudio35InitMembersBasedOnBackendPropertiesEv+68) [arm64-v8a::9e55498e685cb8bd77c0f6ac9782fb52]\n#02    pc 000000000028b04c    /data/app/~~kxSZNtM2hiJ7eyJfr31vew==/com.arkgames.msxycnhy-zBbxvSuU2_BPYv4ztovs7w==/lib/arm64/libAkSoundEngine.so (_ZN13CAkSinkAAudio35InitMembersBasedOnBackendPropertiesEv+68) [arm64-v8a::9e55498e685cb8bd77c0f6ac9782fb52]\n#03    pc 000000000028aa44    /data/app/~~kxSZNtM2hiJ7eyJfr31vew==/com.arkgames.msxycnhy-zBbxvSuU2_BPYv4ztovs7w==/lib/arm64/libAkSoundEngine.so (_ZN13CAkSinkAAudio4InitEPN2AK17IAkPluginMemAllocEPNS0_20IAkSinkPluginContextEPNS0_14IAkPluginParamER13AkAudioFormat+796) [arm64-v8a::9e55498e685cb8bd77c0f6ac9782fb52]\n#04    pc 000000000020e470    /data/app/~~kxSZNtM2hiJ7eyJfr31vew==/com.arkgames.msxycnhy-zBbxvSuU2_BPYv4ztovs7w==/lib/arm64/libAkSoundEngine.so (_ZN8AkDevice10CreateSinkEv+856) [arm64-v8a::9e55498e685cb8bd77c0f6ac9782fb52]\n#05    pc 000000000020f27c    /data/app/~~kxSZNtM2hiJ7eyJfr31vew==/com.arkgames.msxycnhy-zBbxvSuU2_BPYv4ztovs7w==/lib/arm64/libAkSoundEngine.so (_ZN12CAkOutputMgr8InitSinkERP8AkDevice+72) [arm64-v8a::9e55498e685cb8bd77c0f6ac9782fb52]\n#06    pc 0000000000210074    /data/app/~~kxSZNtM2hiJ7eyJfr31vew==/com.arkgames.msxycnhy-zBbxvSuU2_BPYv4ztovs7w==/lib/arm64/libAkSoundEngine.so (_ZN12CAkOutputMgr16_AddOutputDeviceEmR16AkOutputSettingsR5AkSetIm17AkHybridAllocatorILj8ELh16EL7AkMemID4EE27AkGrowByPolicy_Proportional22AkAssignmentMovePolicyImE25AkDefaultSortedKeyCompareImEEbb+556) [arm64-v8a::9e55498e685cb8bd77c0f6ac9782fb52]\n#07    pc 0000000000210940    /data/app/~~kxSZNtM2hiJ7eyJfr31vew==/com.arkgames.msxycnhy-zBbxvSuU2_BPYv4ztovs7w==/lib/arm64/libAkSoundEngine.so (_ZN12CAkOutputMgr14InitMainDeviceERK16AkOutputSettings+252) [arm64-v8a::9e55498e685cb8bd77c0f6ac9782fb52]\n#08    pc 00000000001b810c    /data/app/~~kxSZNtM2hiJ7eyJfr31vew==/com.arkgames.msxycnhy-zBbxvSuU2_BPYv4ztovs7w==/lib/arm64/libAkSoundEngine.so (_ZN11CAkAudioMgr15ProcessMsgQueueEbRb+560) [arm64-v8a::9e55498e685cb8bd77c0f6ac9782fb52]\n#09    pc 00000000001bfcec    /data/app/~~kxSZNtM2hiJ7eyJfr31vew==/com.arkgames.msxycnhy-zBbxvSuU2_BPYv4ztovs7w==/lib/arm64/libAkSoundEngine.so (_ZN2AK6JobMgr8Internal7JobBodyIZNKS0_3Job18ThenWithGlobalLockIZN11CAkAudioMgr31DoUpdateAndRenderIterationAsyncEvE3$_5PKcEES3_OT_T0_EUlvE_S3_E7ExecuteEv+64) [arm64-v8a::9e55498e685cb8bd77c0f6ac9782fb52]\n#10    pc 00000000001f4b38    /data/app/~~kxSZNtM2hiJ7eyJfr31vew==/com.arkgames.msxycnhy-zBbxvSuU2_BPYv4ztovs7w==/lib/arm64/libAkSoundEngine.so (_ZN2AK6JobMgr8Internal33JobManager_internalWorkerFunctionERNS1_11WorkerStateEj+412) [arm64-v8a::9e55498e685cb8bd77c0f6ac9782fb52]\n#11    pc 00000000001f6698    /data/app/~~kxSZNtM2hiJ7eyJfr31vew==/com.arkgames.msxycnhy-zBbxvSuU2_BPYv4ztovs7w==/lib/arm64/libAkSoundEngine.so (_ZN2AK6JobMgr13WorkUntilDoneEONS0_3JobE+356) [arm64-v8a::9e55498e685cb8bd77c0f6ac9782fb52]\n#12    pc 00000000001b7eac    /data/app/~~kxSZNtM2hiJ7eyJfr31vew==/com.arkgames.msxycnhy-zBbxvSuU2_BPYv4ztovs7w==/lib/arm64/libAkSoundEngine.so (_ZN11CAkAudioMgr7PerformEb+440) [arm64-v8a::9e55498e685cb8bd77c0f6ac9782fb52]\n#13    pc 000000000025a074    /data/app/~~kxSZNtM2hiJ7eyJfr31vew==/com.arkgames.msxycnhy-zBbxvSuU2_BPYv4ztovs7w==/lib/arm64/libAkSoundEngine.so (_ZN14CAkAudioThread18EventMgrThreadFuncEPv+76) [arm64-v8a::9e55498e685cb8bd77c0f6ac9782fb52]\n#14    pc 000000000010cff8    /apex/com.android.runtime/lib64/bionic/libc.so (_ZL15__pthread_startPv+228) [arm64-v8a::7160dc53bba2b53de567ba8461a299b1]\n#15    pc 00000000000a6768    /apex/com.android.runtime/lib64/bionic/libc.so (__start_thread+68) [arm64-v8a::7160dc53bba2b53de567ba8461a299b1]\njava:\n[Failed to get Java stack]\n",
        "retraceCrashDetail": "#00    pc 00000000000067f0    /system/lib64/libaaudio.so [arm64-v8a::64db3501bef15855fdd847d42ced0749]\n#01    pc 000000000028b04c    /data/app/~~kxSZNtM2hiJ7eyJfr31vew==/com.arkgames.msxycnhy-zBbxvSuU2_BPYv4ztovs7w==/lib/arm64/libAkSoundEngine.so (CAkSinkAAudio::InitMembersBasedOnBackendProperties()+68) [arm64-v8a::9e55498e685cb8bd77c0f6ac9782fb52]\n#02    pc 000000000028b04c    /data/app/~~kxSZNtM2hiJ7eyJfr31vew==/com.arkgames.msxycnhy-zBbxvSuU2_BPYv4ztovs7w==/lib/arm64/libAkSoundEngine.so (CAkSinkAAudio::InitMembersBasedOnBackendProperties()+68) [arm64-v8a::9e55498e685cb8bd77c0f6ac9782fb52]\n#03    pc 000000000028aa44    /data/app/~~kxSZNtM2hiJ7eyJfr31vew==/com.arkgames.msxycnhy-zBbxvSuU2_BPYv4ztovs7w==/lib/arm64/libAkSoundEngine.so (CAkSinkAAudio::Init(AK::IAkPluginMemAlloc*, AK::IAkSinkPluginContext*, AK::IAkPluginParam*, AkAudioFormat&)+796) [arm64-v8a::9e55498e685cb8bd77c0f6ac9782fb52]\n#04    pc 000000000020e470    /data/app/~~kxSZNtM2hiJ7eyJfr31vew==/com.arkgames.msxycnhy-zBbxvSuU2_BPYv4ztovs7w==/lib/arm64/libAkSoundEngine.so (AkDevice::CreateSink()+856) [arm64-v8a::9e55498e685cb8bd77c0f6ac9782fb52]\n#05    pc 000000000020f27c    /data/app/~~kxSZNtM2hiJ7eyJfr31vew==/com.arkgames.msxycnhy-zBbxvSuU2_BPYv4ztovs7w==/lib/arm64/libAkSoundEngine.so (CAkOutputMgr::InitSink(AkDevice*&)+72) [arm64-v8a::9e55498e685cb8bd77c0f6ac9782fb52]\n#06    pc 0000000000210074    /data/app/~~kxSZNtM2hiJ7eyJfr31vew==/com.arkgames.msxycnhy-zBbxvSuU2_BPYv4ztovs7w==/lib/arm64/libAkSoundEngine.so (CAkOutputMgr::_AddOutputDevice(unsigned long, AkOutputSettings&, AkSet<unsigned long, AkHybridAllocator<8u, (unsigned char)16, (AkMemID)4>, AkGrowByPolicy_Proportional, AkAssignmentMovePolicy<unsigned long>, AkDefaultSortedKeyCompare<unsigned long> >&, bool, bool)+556) [arm64-v8a::9e55498e685cb8bd77c0f6ac9782fb52]\n#07    pc 0000000000210940    /data/app/~~kxSZNtM2hiJ7eyJfr31vew==/com.arkgames.msxycnhy-zBbxvSuU2_BPYv4ztovs7w==/lib/arm64/libAkSoundEngine.so (CAkOutputMgr::InitMainDevice(AkOutputSettings const&)+252) [arm64-v8a::9e55498e685cb8bd77c0f6ac9782fb52]\n#08    pc 00000000001b810c    /data/app/~~kxSZNtM2hiJ7eyJfr31vew==/com.arkgames.msxycnhy-zBbxvSuU2_BPYv4ztovs7w==/lib/arm64/libAkSoundEngine.so (CAkAudioMgr::ProcessMsgQueue(bool, bool&)+560) [arm64-v8a::9e55498e685cb8bd77c0f6ac9782fb52]\n#09    pc 00000000001bfcec    /data/app/~~kxSZNtM2hiJ7eyJfr31vew==/com.arkgames.msxycnhy-zBbxvSuU2_BPYv4ztovs7w==/lib/arm64/libAkSoundEngine.so (_ZN2AK6JobMgr8Internal7JobBodyIZNKS0_3Job18ThenWithGlobalLockIZN11CAkAudioMgr31DoUpdateAndRenderIterationAsyncEvE3$_5PKcEES3_OT_T0_EUlvE_S3_E7ExecuteEv+64) [arm64-v8a::9e55498e685cb8bd77c0f6ac9782fb52]\n#10    pc 00000000001f4b38    /data/app/~~kxSZNtM2hiJ7eyJfr31vew==/com.arkgames.msxycnhy-zBbxvSuU2_BPYv4ztovs7w==/lib/arm64/libAkSoundEngine.so (AK::JobMgr::Internal::JobManager_internalWorkerFunction(AK::JobMgr::Internal::WorkerState&, unsigned int)+412) [arm64-v8a::9e55498e685cb8bd77c0f6ac9782fb52]\n#11    pc 00000000001f6698    /data/app/~~kxSZNtM2hiJ7eyJfr31vew==/com.arkgames.msxycnhy-zBbxvSuU2_BPYv4ztovs7w==/lib/arm64/libAkSoundEngine.so (AK::JobMgr::WorkUntilDone(AK::JobMgr::Job&&)+356) [arm64-v8a::9e55498e685cb8bd77c0f6ac9782fb52]\n#12    pc 00000000001b7eac    /data/app/~~kxSZNtM2hiJ7eyJfr31vew==/com.arkgames.msxycnhy-zBbxvSuU2_BPYv4ztovs7w==/lib/arm64/libAkSoundEngine.so (CAkAudioMgr::Perform(bool)+440) [arm64-v8a::9e55498e685cb8bd77c0f6ac9782fb52]\n#13    pc 000000000025a074    /data/app/~~kxSZNtM2hiJ7eyJfr31vew==/com.arkgames.msxycnhy-zBbxvSuU2_BPYv4ztovs7w==/lib/arm64/libAkSoundEngine.so (CAkAudioThread::EventMgrThreadFunc(void*)+76) [arm64-v8a::9e55498e685cb8bd77c0f6ac9782fb52]\n#14    pc 000000000010cff8    /apex/com.android.runtime/lib64/bionic/libc.so (__pthread_start(void*)+228) [arm64-v8a::7160dc53bba2b53de567ba8461a299b1]\n#15    pc 00000000000a6768    /apex/com.android.runtime/lib64/bionic/libc.so (__start_thread+68) [arm64-v8a::7160dc53bba2b53de567ba8461a299b1]\njava:\n[Failed to get Java stack]\n",
        "reponseCode": 0,
        "reponseDesc": "success",
        "launchTime": "8"
    },
    "traceId": "e9e02721-5eb3-4805-b7b1-4b2b2a5ab643",
    "timestamp": "2026-01-13 16:31:04.746"
}


获取其中的callStack信息即可。

