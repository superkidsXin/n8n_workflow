import requests


headers = {
    "Accept": "application/json;charset=utf-8",
    # "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
    # "Connection": "keep-alive",
    "Content-Type": "application/json;charset=utf-8",
    # "Referer": "https://bugly.qq.com/v2/crash-reporting/advanced-search/673b9cc5e2?pid=1&useSearchTimes=2&start=0",
    "Referer": "https://bugly.qq.com/v2/workbench/apps",
    # "Sec-Fetch-Dest": "empty",
    # "Sec-Fetch-Mode": "cors",
    # "Sec-Fetch-Site": "same-origin",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0",
    "X-token": "1129915480",
    # "sec-ch-ua": '"Not(A:Brand";v="8", "Chromium";v="144", "Microsoft Edge";v="144"',
    # "sec-ch-ua-mobile": "?0",
    # "sec-ch-ua-platform": '"Windows"',
    "x-csrf-token": "undefined",
}
cookies = {
    "RK": "3KuhXvrvTw",
    "ptcz": "7706862bcc7244d5b738d0f3cec3808d4393ab7d373fee1b54b7a1a0d1ed8a59",
    "pgv_pvid": "1174740564",
    "wetest_lang": "zh-cn",
    "_ga_0KGGHBND6H": "GS2.1.s1757586721$o2$g0$t1757586721$j60$l0$h0",
    "pac_uid": "0_7TsT9fjdYA2a1",
    "omgid": "0_7TsT9fjdYA2a1",
    "_qimei_uuid42": "19919092824100a93789bad78d35c8fab6df854eda",
    "_qimei_fingerprint": "e6d48e2c309fce9671370abef6db162b",
    "_qimei_q36": "",
    "_qimei_h38": "d15943223789bad78d35c8fa0200000e919919",
    "qq_domain_video_guid_verify": "93fc44aad3df295b",
    "yyb_muid": "1BB602D6C87364D61D3514DFC973651E",
    "bugly-free-useage": "true",
    "_ga_63JZ3D576T": "GS2.2.s1767858021$o1$g1$t1767858035$j46$l0$h0",
    "_ga": "GA1.1.369473485.1757584241",
    "_gcl_au": "1.1.541219298.1767859984",
    "_ga_S0Y0QJNCMH": "GS2.1.s1767859983$o1$g0$t1767860018$j25$l0$h0",
    "_ga_X6VDKNTNXJ": "GS2.1.s1768801100$o3$g0$t1768801101$j59$l0$h0",
    "bugly-session": "s%3AtSddCNvDFT4i9NI6kGYN1QEGJp8xti2Y.6rbncPTZvVBYkOYLaR24uMGVpR20GRemFE0FDTyfLks",
    "token-skey": "a93dd677-9db0-0846-ae05-6728247b76d3",
    "token-lifeTime": "1768921833",
    "_qpsvr_localtk": "0.9125320486339813",
    "referrer": "eyJpdiI6InRiXC9OSFZtV3IwZHlYK0Q2XC9WUDhxUT09IiwidmFsdWUiOiJIT0xuMXRWbWRVdDZaRTllYkkxSTZPWUZ2dm1pckZuNVRKdmFPcTRRSFhnUXgrYm44QUNYSWh5dVBIV3N0T0pjZjhvNlViUkQrUUN4eFFZZ0Z5ZmdweEo1bW8zSVEwM3RuZCt0SFB5aHFXZXF2b0hMeG8ybitNdjZxV3lBcVpxOUQ5Q2djWTV0WDVueStCbDI1VzBsSHc9PSIsIm1hYyI6IjljYjI4MmVlOWI5YjlhNzI0ZmZiYTY4NDhhMjg0ZjJlODBmODQzNWFlMWE3Y2MzN2MyNTBmMTA5Y2ZkMWE5OTAifQ%3D%3D",
    "bugly_session": "eyJpdiI6IjFrejVyQlwvNGF2citheEFZV2xzOTNBPT0iLCJ2YWx1ZSI6IjkwckFYS0xhbUtwY1wvQ3JSTnZ0UjdFajFIS1R6NmJnZjhUZmNWWnJ2VzE4RVRnYzQyQkdLcjhPMVwvM3FhbWJLOXJlYWpYWThqNHZVcEVXRVcxaXRjQWc9PSIsIm1hYyI6Ijc4ZDE5ZDQ0OTIyMDcxMTI4Y2Y0YWRmM2ZjZmI2ZjQ4Njk3NDc1MDAwZjcyZjkyZTI2NTFmZWZlODE0M2ZhYjAifQ%3D%3D",
}
url = "https://bugly.qq.com/v2/search"
params = {
    "start": "0",
    "userSearchPage": "/v2/workbench/apps",
    "pid": "1",
    "platformId": "1",
    "date": "last_7_day",
    "sortOrder": "desc",
    "useSearchTimes": "2",
    "rows": "50",
    "sortField": "matchCount",
    "appId": "673b9cc5e2",
    "fsn": "97ab197c-6cab-4a6c-ab33-f3e13c428d75",
}
response = requests.get(url, headers=headers, cookies=cookies, params=params)

print(response.text)
print(response)
