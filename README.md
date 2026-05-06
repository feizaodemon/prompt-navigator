# AI Conversation Navigator

## 项目简介

这是一个面向 ChatGPT 的浏览器扩展，用于在长 AI 对话中快速定位用户 prompt。

当前主线目标是先完成稳定的 ChatGPT 版本 Prompt Navigator。DeepSeek support 暂缓，等 ChatGPT 版本稳定后，再单独开发 DeepSeek adapter。

## 当前功能

- Prompt 时间轴
- Prompt 编号
- 每条 prompt 前 50 个字符预览
- 点击 prompt 平滑跳转
- 新 prompt 自动更新
- 用户接近侧边栏列表底部时，新 prompt 出现后自动滚动到最新 prompt
- 用户查看较早 prompt 时，不强制滚动侧边栏列表
- Prompt 搜索框，支持中文、英文和中英文混合搜索
- 手动刷新按钮，用于重新扫描当前 ChatGPT 页面中的用户 prompt
- 可折叠右侧侧边栏
- 稳定支持 ChatGPT
- 本地运行，不上传数据

## DeepSeek support 暂缓

DeepSeek 页面存在懒加载 / 虚拟滚动问题：历史 prompt 不一定全部存在于当前 DOM 中，只有用户滚动到对应位置后，部分历史消息才会被加载出来。

因此当前扩展暂时不在 DeepSeek 页面运行，也不把 DeepSeek 作为当前主线验收范围。后续计划是在 ChatGPT 版本稳定后，单独新开 DeepSeek adapter 进行适配和验证。

## 文件说明

- `manifest.json`：浏览器扩展配置，使用 Manifest V3，并限制扩展只在 ChatGPT 页面运行。
- `content.js`：内容脚本，负责识别 ChatGPT 用户 prompt、渲染侧边栏、搜索过滤、手动刷新、点击跳转、监听页面变化和维护侧边栏内部滚动。
- `styles.css`：侧边栏、搜索框、刷新按钮和跳转高亮样式。
- `PRD.md`：产品需求文档，记录长期产品方向和阶段规划。
- `tests/v2a-static.test.js`：V2A 基础静态检查，确认搜索、刷新、匹配范围和隐私约束没有被破坏。

## 安装方式

### Chrome

1. 打开 Chrome。
2. 在地址栏进入 `chrome://extensions/`。
3. 开启右上角“开发者模式”。
4. 点击“加载已解压的扩展”。
5. 选择本项目文件夹。

### Microsoft Edge

1. 打开 Edge。
2. 在地址栏进入 `edge://extensions/`。
3. 开启“开发人员模式”。
4. 点击“加载解压缩的扩展”。
5. 选择本项目文件夹。

## 重新加载扩展

修改代码后：

1. 打开 `chrome://extensions/` 或 `edge://extensions/`。
2. 找到 `AI Conversation Navigator`。
3. 点击扩展卡片上的刷新按钮。
4. 回到 `https://chatgpt.com/` 页面并刷新网页。

## 测试方式

### ChatGPT 基本功能

1. 打开 `https://chatgpt.com/`。
2. 进入一个已有对话，或发送几条新 prompt。
3. 检查右侧是否出现 `Prompt Navigator`。
4. 检查列表是否只包含用户发送的 prompt，而不是 AI 回复。
5. 检查 prompt 编号是否按页面顺序显示为 `Prompt 1`、`Prompt 2`、`Prompt 3`。
6. 点击任意 prompt，检查主聊天页面是否平滑滚动到对应用户消息。
7. 点击侧边栏右上角按钮，检查是否可以折叠和展开。

### Prompt 搜索

1. 在 ChatGPT 对话中准备多条不同内容的用户 prompt。
2. 在右侧 `Prompt Navigator` 顶部搜索框输入中文、英文或中英文混合关键词。
3. 检查列表是否实时只显示匹配的 prompt。
4. 检查匹配范围是否包含预览文本和完整 prompt 文本。
5. 检查搜索结果保留原始编号，例如只匹配第二条时仍显示 `Prompt 2`。
6. 清空搜索框，检查全部 prompt 是否恢复显示。
7. 点击搜索结果中的 prompt，检查跳转功能是否仍然正常。

### 手动刷新按钮

1. 打开 ChatGPT 对话并确认右侧已有 prompt 列表。
2. 在搜索框中输入一个关键词。
3. 点击侧边栏顶部的“刷新”按钮。
4. 检查侧边栏重新扫描当前页面后仍保留搜索关键词。
5. 检查没有重复添加同一条 prompt。
6. 检查 prompt 编号仍然按原始页面顺序显示。
7. 检查点击刷新不会滚动主聊天页面。

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

可以通过以下方式确认：

1. 打开 `manifest.json`。
2. 确认 `content_scripts[0].matches` 只有 `https://chatgpt.com/*`。
3. 打开 `https://chat.deepseek.com/`。
4. 确认页面右侧不会出现 `Prompt Navigator`。

## 本地检查

在项目根目录运行：

```bash
node tests/v2a-static.test.js
node --check content.js
```

检查目标：

- `manifest.json` 能正常解析。
- `content.js` 没有语法错误。
- 扩展只匹配 `https://chatgpt.com/*`。
- 没有引入外部依赖。
- 没有 `fetch`、`XMLHttpRequest` 或其他上传聊天内容的逻辑。
- DeepSeek support 没有被重新启用。

## 隐私说明

本扩展只读取当前 ChatGPT 网页中可见的用户 prompt，用于生成本地导航栏。

本扩展不会上传聊天内容，不会请求外部服务器，不会使用外部依赖，不会使用第三方分析工具，也不会保存完整聊天内容。

## 当前限制

- 当前稳定支持范围只包括 `https://chatgpt.com/*`。
- ChatGPT 页面 DOM 变化可能导致 prompt 识别失效。
- 手动刷新只能重新扫描当前页面 DOM 中已经存在的用户 prompt。
- 搜索只影响右侧 Prompt Navigator 的显示，不影响原始 ChatGPT 页面内容。
- DeepSeek support 暂缓，原因是 DeepSeek 页面存在懒加载 / 虚拟滚动问题，历史 prompt 不一定全部存在于 DOM 中。
- 当前版本不支持 pin、当前 prompt 滚动高亮、导出、Prompt Vault、文件夹管理、跨设备同步、账号系统或后端服务。
