# n8n-bugly
用 n8n 实现一个自动化工作流：输入 Bugly Crash 链接，自动拉取闪退堆栈并结合符号表还原到源码行号，最后写入飞书多维表格。
## 工作流目标
- 输入：`input.txt`（每行一个 Bugly crash 地址）
- 输出：结构化堆栈信息（函数名/文件/行号/模块/偏移等），落库到飞书多维表格
## 流程概览
1. 用户提供 `input.txt` 这类 Bugly crash 地址列表
2. 通过 `bugly_node` 拉取地址对应的闪退详细信息（含堆栈、版本、BuildId/So 信息等）
3. 使用 `symbols/` 下的符号表校验与堆栈是否匹配（调用 `readelf.exe` 等工具）
4. 使用 `addr2line.exe` 结合符号表将堆栈地址解析为源码定位（文件/行号/函数）
5. 将解析后的堆栈信息写入飞书多维表格
6. 流程结束
## 需要的自定义节点（待开发）
- `bugly_node`：根据 Bugly crash 地址获取闪退详细信息（本仓库已实现：`Bugly` 节点）
- `crash_parse_node`：根据符号表与堆栈解析出可读的源码定位信息
## 依赖/目录约定（建议）
- `symbols/`：按 App 版本或 BuildId 组织符号表文件
- `tools/`：放置 `readelf.exe`、`addr2line.exe`（或配置为环境变量）
## 飞书节点
- 使用现成飞书节点：`https://www.npmjs.com/package/n8n-nodes-feishu-lite`
## Bugly 节点使用说明（bugly_node）
### 功能
- 输入：Bugly crash URL（形如 `https://bugly.qq.com/v2/crash-reporting/crashes/{appId}/{issueId}?pid=1`）
- 输出：`callStack`（以及可选的 `raw/data` 原始响应数据）
### 为什么需要登录态
Bugly 的 `get-last-crash` 接口依赖登录态 Cookie 与请求头 `X-token`，所以本节点通过 Credentials 注入这两项。
### 配置步骤
1. 浏览器登录 Bugly 后，打开任意 crash 详情页
2. 在开发者工具 Network 中找到 `get-last-crash` 请求
3. 复制请求头里的 `X-token`，以及整串 `Cookie`
4. 在 n8n 中创建 Credentials：`Bugly API`，填入 `Cookie` 与 `X-Token`
### 安装/构建（本地开发）
```bash
npm install
npm run build
```