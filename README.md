# AI Conversation Navigator

## 项目简介

这是一个面向 ChatGPT 的浏览器扩展，用于在长 AI 对话中快速定位用户 prompt。DeepSeek 平台入口已保留，但当前暂未适配 prompt 提取。

当前版本只实现 V1：Multi-platform Prompt Timeline Navigator。它会在支持的聊天页面右侧生成一个本地 prompt 时间轴，点击条目后跳转到对应用户消息。

## 当前功能

- Prompt 时间轴
- Prompt 编号
- 每条 prompt 前 50 个字符预览
- 点击 prompt 平滑跳转
- 新 prompt 自动更新
- 可折叠右侧侧边栏
- 支持 ChatGPT
- 保留 DeepSeek 平台入口，当前显示“暂未适配”
- 本地运行，不上传数据

## 文件说明

- `manifest.json`：浏览器扩展配置，使用 Manifest V3，并限制扩展只在 ChatGPT 和 DeepSeek 页面运行。
- `content.js`：内容脚本，负责识别 ChatGPT 用户 prompt、渲染侧边栏、点击跳转和监听页面变化；DeepSeek 提取函数已预留但暂时返回空列表。
- `styles.css`：侧边栏和跳转高亮样式。
- `PRD.md`：产品需求文档。

## 安装方式

### Chrome

1. 打开 Chrome。
2. 地址栏进入 `chrome://extensions/`。
3. 开启右上角“开发者模式”。
4. 点击“加载已解压的扩展”。
5. 选择本项目文件夹。

### Microsoft Edge

1. 打开 Edge。
2. 地址栏进入 `edge://extensions/`。
3. 开启“开发人员模式”。
4. 点击“加载解压缩的扩展”。
5. 选择本项目文件夹。

## 测试方式

### ChatGPT

1. 打开 `https://chatgpt.com/`。
2. 进入一个已有对话，或发送几条新 prompt。
3. 检查右侧是否出现 `Prompt Navigator`。
4. 检查列表是否只包含用户发送的 prompt，而不是 AI 回答。
5. 点击任意 prompt，检查页面是否平滑滚动到对应用户消息。
6. 继续发送一条新 prompt，检查列表是否自动更新。
7. 点击侧边栏右上角按钮，检查是否可以折叠和展开。

### DeepSeek 当前状态

1. 打开 `https://chat.deepseek.com/`。
2. 检查右侧是否出现 `Prompt Navigator`。
3. 当前应显示“暂未适配”，不应提取首页 UI 文本、AI 回复或工具按钮文字。

## 隐私说明

本扩展只读取当前网页中可见的用户 prompt，用于生成本地导航栏。

本扩展不会上传、保存或分析用户聊天内容，也不会请求外部服务器或使用第三方分析工具。

## 当前限制

- 页面 DOM 变化可能导致 prompt 识别失效。
- 当前稳定目标是 ChatGPT V1。
- DeepSeek 入口已保留，但 prompt 提取暂未适配。
- V1 不支持搜索、pin、导出、Prompt Vault、文件夹管理、跨设备同步。
