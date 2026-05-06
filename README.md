# AI Conversation Navigator

## 项目简介

这是一个面向 ChatGPT 的浏览器扩展，用于在长 AI 对话中快速定位用户发送过的 prompt。

当前开发主线是先完成稳定的 ChatGPT Prompt Navigator。DeepSeek support 暂缓，后续会在 ChatGPT 版本稳定后单独开发 DeepSeek adapter。

## 当前功能

- ChatGPT prompt 时间轴
- Prompt 编号
- 每条 prompt 前 50 个字符预览
- 点击 prompt 平滑跳转到对应用户消息
- 跳转后短暂高亮对应 ChatGPT 用户消息
- 点击后在侧边栏中高亮当前 prompt
- 新 prompt 自动更新
- 用户接近侧边栏列表底部时，新 prompt 出现后自动滚动到最新 prompt
- 用户查看较早 prompt 时，不强制滚动侧边栏列表
- Prompt 搜索框，支持中文、英文和中英混合搜索
- 手动刷新按钮，用于重新扫描当前 ChatGPT 页面中的用户 prompt
- Pin 重要 prompt，并在 Pinned 区域显示
- Pinned 状态按当前 ChatGPT conversation URL 保存到本地浏览器存储
- 可折叠右侧侧边栏
- 稳定支持 ChatGPT
- 本地运行，不上传数据，不使用外部依赖

## DeepSeek support 暂缓

DeepSeek 页面存在懒加载 / 虚拟滚动问题：历史 prompt 不一定全部存在于当前 DOM 中，只有用户滚动到对应位置后，部分历史消息才会被加载出来。

因此当前扩展不会在 DeepSeek 页面运行，也不把 DeepSeek 作为当前主线验收范围。后续计划是在 ChatGPT 版本稳定后，单独新开 DeepSeek adapter 进行适配和验证。

## 文件说明

- `manifest.json`：浏览器扩展配置，使用 Manifest V3，只匹配 `https://chatgpt.com/*`。当前包含 `storage` 权限，用于把 pinned prompt 状态保存在本地浏览器。
- `content.js`：内容脚本，负责识别 ChatGPT 用户 prompt、渲染侧边栏、搜索过滤、手动刷新、pin / unpin、本地 pinned 状态读写、点击跳转、active 高亮和页面变化监听。
- `styles.css`：侧边栏、搜索框、刷新按钮、Pinned 区域、pin 按钮、active 状态和跳转高亮样式。
- `PRD.md`：产品需求文档，记录长期产品方向和阶段规划。
- `tests/v2a-static.test.js`：V2A 静态检查，确认搜索、刷新、匹配范围和隐私约束没有被破坏。
- `tests/v2b-static.test.js`：V2B 静态检查，确认 pin、本地存储、active 高亮、匹配范围和隐私约束没有被破坏。

## 安装方式

### Chrome

1. 打开 Chrome。
2. 在地址栏进入 `chrome://extensions/`。
3. 开启右上角“开发者模式”。
4. 点击“加载已解压的扩展程序”。
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
7. 检查被点击的侧边栏 item 是否进入 active 高亮状态。
8. 检查目标 ChatGPT 用户消息是否短暂高亮。
9. 点击侧边栏右上角按钮，检查是否可以折叠和展开。

### Prompt 搜索

1. 在 ChatGPT 对话中准备多条不同内容的用户 prompt。
2. 在右侧 `Prompt Navigator` 顶部搜索框输入中文、英文或中英混合关键词。
3. 检查普通 prompt 列表是否实时只显示匹配的 prompt。
4. 检查搜索结果是否保留原始编号，例如只匹配第二条时仍显示 `Prompt 2`。
5. 清空搜索框，检查全部 prompt 是否恢复显示。
6. 点击搜索结果中的 prompt，检查跳转功能是否仍然正常。

### 手动刷新按钮

1. 打开 ChatGPT 对话并确认右侧已有 prompt 列表。
2. 在搜索框中输入一个关键词。
3. 点击侧边栏顶部的“刷新”按钮。
4. 检查侧边栏重新扫描当前页面后仍保留搜索关键词。
5. 检查没有重复添加同一条 prompt。
6. 检查 prompt 编号仍然按原始页面顺序显示。
7. 检查点击刷新不会滚动主聊天页面。

### Pin 重要 prompt

1. 在普通 prompt 列表中点击某条 prompt 右侧的 pin 按钮。
2. 检查搜索框下方是否出现 `Pinned` 区域。
3. 检查被固定的 prompt 是否显示在 `Pinned` 区域，且编号保留原编号，例如 `Prompt 3`。
4. 检查原始 prompt 列表中仍然保留这条 prompt。
5. 点击 `Pinned` 区域中的 prompt，检查是否能跳转到对应用户消息。
6. 再次点击 pin 按钮，检查该 prompt 是否从 `Pinned` 区域移除。
7. 在搜索框中输入关键词，检查 `Pinned` 区域不受搜索影响，普通 prompt 列表继续受搜索影响。

### Pinned 状态刷新保留

1. 在 ChatGPT 某个对话 URL 中固定一条或多条 prompt。
2. 刷新 ChatGPT 页面。
3. 等待右侧 `Prompt Navigator` 重新出现。
4. 检查之前固定的 prompt 是否仍显示在 `Pinned` 区域。
5. 打开另一个 ChatGPT conversation URL，检查 pinned 状态是否按不同对话 URL 分开保存。

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
node tests/v2b-static.test.js
node --check content.js
```

检查目标：

- `manifest.json` 能正常解析。
- `content.js` 没有语法错误。
- 如果使用 `chrome.storage.local`，`manifest.json` 中有 `storage` 权限。
- 扩展只匹配 `https://chatgpt.com/*`。
- 没有引入外部依赖。
- 没有 `fetch`、`XMLHttpRequest` 或其他上传聊天内容的逻辑。
- 没有实现 export、prompt vault、folder management、sync、账号系统或后端服务。
- DeepSeek support 没有被重新启用。

## 隐私说明

本扩展只读取当前 ChatGPT 网页中可见的用户 prompt，用于生成本地导航栏。

Pin 功能只把实现固定所需的最小信息保存到本地浏览器 `chrome.storage.local`，包括当前 conversation URL、prompt hash、prompt preview 和原始编号。扩展不会上传聊天内容，不会请求外部服务器，不会使用远程同步，不会使用第三方分析工具，也不会保存完整聊天记录。

## 当前限制

- 当前稳定支持范围只包括 `https://chatgpt.com/*`。
- ChatGPT 页面 DOM 变化可能导致 prompt 识别失效。
- 手动刷新只能重新扫描当前页面 DOM 中已经存在的用户 prompt。
- Pinned 状态依赖当前 conversation URL、prompt 文本 hash 和原始编号；如果 ChatGPT 页面结构或历史消息加载方式发生明显变化，少数 pinned prompt 可能只能显示本地预览，无法跳转到 DOM 中不存在的消息。
- 当前 prompt 高亮优先保证点击后的 active 状态；暂未实现基于滚动位置自动切换 active prompt。
- DeepSeek support 暂缓，原因是 DeepSeek 页面存在懒加载 / 虚拟滚动问题，历史 prompt 不一定全部存在于 DOM 中。
- 当前版本不支持 export、Prompt Vault、文件夹管理、跨设备同步、账号系统或后端服务。
