测试方式 1（推荐）：用 n8n 的 custom 目录加载本地节点
1) 先在本仓库编译出 dist/
你已经能 npm run build 通过了（如果要重来一次）：
cd E:\opensource\ai\n8n_buglynpm installnpm run build

2) 把整个工程放到 n8n 的自定义节点目录
Windows 默认目录一般是：
%USERPROFILE%\.n8n\custom\
把本项目复制到例如：
%USERPROFILE%\.n8n\custom\n8n-nodes-bugly\
并确保里面有 package.json 和 dist/。
3) 在该目录安装依赖（让 n8n 能 require 到 dist 依赖）
cd $env:USERPROFILE\.n8n\custom\n8n-nodes-buglynpm install --omit=dev
4) 重启 n8n
重启后在节点列表里搜索 Bugly，能看到就说明加载成功。
5) 在 n8n 里跑一次
新建 workflow → 添加 Bugly 节点
创建/选择 Credentials：Bugly API（填 Cookie + X-token）
Crash URL 填一条你 input.txt 的链接
点击 Execute Node
输出里看 callStack（或打开 Only Output callStack 只返回 callStack）
> 如果报 401/403/跳登录，基本就是 Cookie/X-token 过期，去浏览器 Network 重新复制一份即可。
测试方式 2：Docker 版 n8n（如果你用 Docker 跑）
把本项目挂载到容器的 /home/node/.n8n/custom/n8n-nodes-bugly，然后在容器里对该目录跑一次 npm i --omit=dev，重启容器后同上在 UI 里搜 Bugly 测试。
你现在的 n8n 是 桌面版、npm 安装运行 还是 Docker？我可以按你具体运行方式把路径/命令写成一条能直接复制执行的。