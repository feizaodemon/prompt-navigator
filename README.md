# AI Conversation Navigator

## 项目简介

这是一个面向 ChatGPT 的浏览器扩展，用于在长 AI 对话中快速定位用户 prompt。

当前主线目标是先完成稳定的 ChatGPT 版本 Prompt Navigator。DeepSeek support 暂缓，等 ChatGPT 完整版稳定后，再单独开发 DeepSeek adapter。

## 当前功能

- Prompt 时间轴
- Prompt 编号
- 每条 prompt 前 50 个字符预览
- 点击 prompt 平滑跳转
- 新 prompt 自动更新
- 用户接近侧边栏列表底部时，新 prompt 出现后自动滚动到最新 prompt
- 用户查看较早 prompt 时，不强制滚动侧边栏列表
- 可折叠右侧侧边栏
- 稳定支持 ChatGPT
- 本地运行，不上传数据

## DeepSeek support 暂缓

DeepSeek 页面存在懒加载 / 虚拟滚动问题：历史 prompt 不一定全部存在于当前 DOM 中，只有用户滚动到对应位置后，部分历史消息才会被加载出来。

因此当前扩展暂时不在 DeepSeek 页面运行，也不把 DeepSeek 作为 V1 主线验收范围。后续计划是在 ChatGPT 版本稳定后，单独新开 DeepSeek adapter 进行适配和验证。

## 文件说明

- `manifest.json`：浏览器扩展配置，使用 Manifest V3，并限制扩展只在 ChatGPT 页面运行。
- `content.js`：内容脚本，负责识别 ChatGPT 用户 prompt、渲染侧边栏、点击跳转、监听页面变化和维护侧边栏内部滚动。
- `styles.css`：侧边栏和跳转高亮样式。
- `PRD.md`：产品需求文档，记录长期产品方向和 V1 初始规划。

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

### ChatGPT 基本功能

1. 打开 `https://chatgpt.com/`。
2. 进入一个已有对话，或发送几条新 prompt。
3. 检查右侧是否出现 `Prompt Navigator`。
4. 检查列表是否只包含用户发送的 prompt，而不是 AI 回答。
5. 检查 prompt 编号是否按页面顺序显示为 `Prompt 1`、`Prompt 2`、`Prompt 3`。
6. 点击任意 prompt，检查主聊天页面是否平滑滚动到对应用户消息。
7. 点击侧边栏右上角按钮，检查是否可以折叠和展开。

### 新 prompt 自动滚动

1. 在 ChatGPT 中连续发送多条 prompt，直到右侧 Prompt Navigator 列表出现滚动条。
2. 将右侧 Prompt Navigator 列表滚动到接近底部。
3. 继续发送一条新 prompt。
4. 检查右侧列表是否自动滚动到最新 prompt。
5. 再将右侧列表滚动到较早的 prompt，例如 `Prompt 1` 或 `Prompt 2`。
6. 继续发送一条新 prompt。
7. 检查右侧列表是否保持在当前查看位置，不要强制滚动到底部。
8. 确认这个过程只滚动右侧 Prompt Navigator 内部列表，不滚动主聊天页面。

### DeepSeek 当前状态

当前扩展不匹配 `https://chat.deepseek.com/*`，因此 DeepSeek 页面不应注入 `Prompt Navigator`。

## 隐私说明

本扩展只读取当前 ChatGPT 网页中可见的用户 prompt，用于生成本地导航栏。

本扩展不会上传聊天内容，不会请求外部服务器，不会使用外部依赖，不会使用第三方分析工具，也不会保存完整聊天内容。

## 当前限制

- 当前稳定支持范围只包括 `https://chatgpt.com/*`。
- ChatGPT 页面 DOM 变化可能导致 prompt 识别失效。
- DeepSeek support 暂缓，原因是 DeepSeek 页面存在懒加载 / 虚拟滚动问题，历史 prompt 不一定全部存在于 DOM 中。
- V1 不支持搜索、pin、导出、Prompt Vault、文件夹管理、跨设备同步。
