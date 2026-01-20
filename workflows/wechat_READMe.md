# 公众号工作流
## 目标
从飞书文档（个人博客）同步文章到飞书多维表格A（可查、可去重），点击表格里的“发布公众号”按钮触发n8n发布到微信公众号，并把发布状态与结果回写到表格；后续可扩展到小红书/知乎等无API平台。
## 总体实现方案（两条主工作流）
### 工作流A：飞书文档 → 多维表格A（入库/去重/生成素材）
1. 触发：定时同步（cron）或飞书事件（若可用）。
2. 拉取：读取“个人博客”目录/空间内的文章列表，拿到每篇的唯一标识（note id）与更新时间。
3. 取文档内容：调用飞书接口获取文档结构化内容，并转换为Markdown（必要时在`n8n_feishu`里封装自定义节点/工具函数）。
4. 去重与幂等：用note id在多维表格A查询记录；存在则更新（按更新时间/内容hash判断是否需要更新），不存在则新建。
5. AI优化与封面提示词：调用`https://grsai.com/`的Gemini API，把Markdown输入，产出“优化后的Markdown + cover prompt”，分别存入表格字段。
6. 生成封面：用nano-banana-fast根据cover prompt生成封面图；把封面与正文图片统一上传OSS（阿里云），记录OSS地址。
7. 写入表格A：保存标题/作者/时间/封面/Markdown/状态等字段，初始状态为draft（未发布）。

### 工作流B：按钮触发 → 发布公众号 → 状态回写
1. 触发：多维表格A的“发布公众号”按钮调用n8n Webhook（推荐）。
2. 读取记录：根据record_id/note id读取文章数据与OSS素材地址；回写状态为publishing并加锁（防重复点击/并发发布）。
3. Markdown转公众号格式：通过`https://github.com/doocs/md`做格式转换（可以从源码@md中抽出置换的代码，封装成一个node,方便使用）。
4. 素材处理：封面/正文图片按公众号要求上传素材库，替换文内图片引用为公众号可用的链接/素材引用。
5. 发布：调用公众号接口创建草稿/发布（按你的发布策略）；拿到文章ID/链接等结果。
6. 回写：成功则`status=success`并写入文章链接/ID；失败则`status=failed`写入错误信息，支持重试（指数退避）。

## 多维表格A字段建议（最小可用）
1. note_id（唯一键，用于去重/幂等）
2. title、author、publish_time
3. md_raw（原始Markdown）、md_optimized（优化后Markdown）
4. cover_prompt、cover_image_url（或oss_cover_url）
5. 推荐拆表：多维表格A只放“文章基础信息”；新增“发布记录表B”（一条记录=一篇文章+一个平台），这样扩展平台不需要加一堆字段
6. 表A（文章表）字段：note_id、title、author、publish_time、md_raw、md_optimized、cover_prompt、cover_image_url、last_sync_at
7. 表B（发布记录表）字段：note_id（关联表A）、platform（wechat/xhs/zhihu/...）、publish_button（按钮）、status（draft/publishing/success/failed）、article_id、article_url、error_message、last_run_at、retry_count

## 关键技术点与落地说明
1. 飞书文档转Markdown：优先用稳定的转换实现（自研封装到`n8n_feishu`），保证图片、标题层级、代码块不丢。
2. OSS统一存储：所有封面/正文图片先落OSS，表格里只存可访问URL，发布时再按需上传到目标平台素材库。
3. 幂等与防重复：以note id + status锁定；发布前检查是否已有wechat_article_id/url，避免重复发布。
4. 可观测性：每次运行更新last_run_at；失败写error_message；必要时增加飞书通知/告警。
## 后期扩展（小红书/知乎等无API平台）
抽象“发布适配层”：有API的平台走HTTP调用，无API的平台用`https://github.com/toema/n8n-playwright`自动化发布；统一把状态与结果URL回写到多维表格A。