# AI Conversation Navigator

## 项目简介

这是一个面向 ChatGPT 的浏览器扩展，用于在长对话中快速定位用户发送过的 prompt。当前只支持 `https://chatgpt.com/*`，DeepSeek support 暂缓。

## 当前功能

- ChatGPT prompt timeline
- Prompt 编号和前 50 个字符预览
- 默认显示 Voyager-like compact timeline
- 点击 compact 圆点平滑跳转到对应用户消息
- hover compact 圆点显示 prompt preview tooltip
- 新 prompt 自动更新
- 搜索框和手动刷新按钮
- Pin / 星标重要 prompt
- Pinned prompt 本地保存到 `chrome.storage.local`
- 当前 active prompt 高亮
- ChatGPT 浅色 / 深色主题自动适配
- 本地运行，不上传数据，不使用外部依赖

## V2C Compact Timeline Mode UI

打开 ChatGPT 页面后，右侧默认只显示一条窄 compact timeline。它固定在浏览器视口右侧，顶部和底部保留空间，不会随着 prompt 数量无限变高，也不会遮挡 ChatGPT 输入框。旧的 expanded mode 不再默认打开，搜索和完整列表改为弹出面板。

使用方式：

1. 点击 timeline 上的圆点，跳转到对应 prompt。
2. hover 圆点，查看 `Prompt n` 和 prompt 前 50 个字符预览。
3. pinned prompt 的圆点有外圈标记。
4. 当前 active prompt 的圆点会高亮。
5. prompt 很多时，timeline 内部可以滚动，整体不会超出屏幕。

## V2D Compact Timeline Polish

V2D 继续收紧 compact timeline 的右侧导航体验：

1. compact timeline 默认固定在浏览器最右侧，宽度为 32px，高度尽量贴合 `100vh`，顶部和底部不再保留明显空白。
2. 圆点不再使用纵向 flex 列表，而是按 prompt 顺序做百分比绝对定位：首尾圆点靠近轨道上下端，中间圆点按比例均匀分布。普通数量下不显示内部滚动条，极端数量下会自动缩小圆点。
3. 搜索 / prompt list 仍通过顶部小按钮打开浮动面板，默认不显示大侧边栏。
4. hover tooltip 以 prompt 内容预览为主，编号弱化为小号 `#n` 元信息，不再显示醒目的大号 `Prompt N` 标题。
5. 点击 compact 圆点时使用精确滚动目标，目标 prompt 会尽量落在 viewport 顶部下方约 100px 到 140px 的位置，便于同时看到该 prompt 和后续回答。
6. pinned prompt 圆点保留特殊外圈样式，active prompt 圆点保留明显高亮。

## 搜索 / Prompt List 面板

compact timeline 顶部有一个小按钮，用于打开搜索和完整 prompt list 面板。

面板行为：

- 面板浮在 timeline 左侧，不常驻占据页面右侧。
- 面板内包含搜索框、手动刷新按钮、Pinned 区域和 prompt 列表。
- 搜索只过滤普通 prompt 列表，并保留原始编号。
- 刷新按钮会重新扫描当前页面 DOM，不会重复添加同一条 prompt。
- 点击 prompt 或 pinned prompt 仍然会跳转到对应用户消息。
- 点击面板外部或关闭按钮可以关闭面板。

## Pin / 星标 Prompt

在 prompt list 面板中，每条 prompt 右侧都有 pin 按钮：

1. 点击 pin 后，该 prompt 会出现在 Pinned 区域。
2. 再次点击可取消 pinned。
3. pinned 状态按当前 ChatGPT conversation URL 保存到本地 `chrome.storage.local`。
4. pinned prompt 在 compact timeline 上有特殊外圈标记。

## DeepSeek support 暂缓

DeepSeek 页面存在懒加载 / 虚拟滚动问题，历史 prompt 不一定全部存在于当前 DOM 中。因此当前扩展不会在 DeepSeek 页面运行，也不会启用 DeepSeek adapter。

## Roadmap

- 当前稳定版本：V2G Direct scroll without reverse jump。
- 当前稳定分支：`v2g-direct-scroll-navigation`。
- V3 规划：`Topic-based Conversation Collections`，用于把同一主题下的多个 ChatGPT conversation / thread 加入用户自定义 collection，并从 collection 快速打开原始对话。
- V3 不规划 prompt-level favorites、单条 assistant answer 收藏或 Prompt Vault。

详细 roadmap 见 `docs/roadmap.md`，版本历史见 `docs/change_log.md`。

## 文件说明

- `manifest.json`：Manifest V3 扩展配置，只匹配 `https://chatgpt.com/*`，包含 `storage` 权限。
- `content.js`：识别 ChatGPT 用户 prompt、渲染 compact timeline、弹出 prompt list 面板、搜索、刷新、pin、本地状态读写、点击跳转、active 高亮和主题检测。
- `styles.css`：compact timeline、浮动面板、圆点、tooltip、pinned、active、滚动条和主题变量样式。
- `tests/v2a-static.test.js`：V2A 静态检查。
- `tests/v2b-static.test.js`：V2B 静态检查。
- `tests/v2c-static.test.js`：V2C compact timeline / panel 静态检查。

## 安装方式

### Chrome

1. 打开 Chrome。
2. 进入 `chrome://extensions/`。
3. 开启右上角“开发者模式”。
4. 点击“加载已解压的扩展程序”。
5. 选择本项目文件夹。

### Microsoft Edge

1. 打开 Edge。
2. 进入 `edge://extensions/`。
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

### Compact Timeline

1. 打开 `https://chatgpt.com/` 的任意对话。
2. 确认右侧默认显示窄 compact timeline，而不是大面板。
3. 准备很多条 prompt，确认 timeline 高度适配浏览器视口，不会超出屏幕。
4. 在 timeline 内滚动，确认圆点仍可点击和 hover。
5. 点击圆点，确认页面平滑跳转到对应用户消息。
6. hover 圆点，确认 tooltip 在左侧显示 prompt preview。
7. 确认右侧 rail 贴合完整浏览器高度，圆点按上下百分比分布而不是挤成滚动列表。
8. 点击圆点后，确认目标 prompt 停在页面顶部下方约 100px 到 140px，并且后续回答仍可见。

### 搜索 / Prompt List 面板

1. 点击 compact timeline 顶部按钮。
2. 确认 prompt list 面板在 timeline 左侧弹出。
3. 输入关键词，确认搜索过滤正常且编号不重排。
4. 点击刷新按钮，确认不会重复添加 prompt。
5. 点击面板外部或关闭按钮，确认面板关闭。

### Pin / 星标

1. 打开 prompt list 面板。
2. 点击某条 prompt 的 pin 按钮。
3. 确认它出现在 Pinned 区域。
4. 确认 compact timeline 上对应圆点有 pinned 标记。
5. 刷新 ChatGPT 页面，确认 pinned 状态尽量保留。
6. 点击 pinned prompt，确认能跳转。

### DeepSeek 当前状态

1. 打开 `manifest.json`。
2. 确认 `content_scripts[0].matches` 只有 `https://chatgpt.com/*`。
3. 打开 `https://chat.deepseek.com/`。
4. 确认页面不会注入 Prompt Navigator。

## 本地检查

```bash
node tests/v2a-static.test.js
node tests/v2b-static.test.js
node tests/v2c-static.test.js
node tests/v2d-static.test.js
node --check content.js
```

检查目标：

- `manifest.json` 能正常解析。
- `content.js` 没有语法错误。
- 扩展只匹配 `https://chatgpt.com/*`。
- 没有引入外部依赖。
- 没有 `fetch`、`XMLHttpRequest` 或上传聊天内容的逻辑。
- 没有实现 export、prompt vault、folder management、sync、账号系统或后端服务。
- DeepSeek support 没有被重新启用。

## 隐私说明

本扩展只读取当前 ChatGPT 页面中可见的用户 prompt，用于生成本地导航。Pin 功能只保存固定状态所需的最小信息到本地浏览器 `chrome.storage.local`。扩展不会上传聊天内容，不会请求外部服务器，不会使用远程同步，也不会保存完整聊天记录。

## 当前限制

- 当前稳定支持范围只包括 `https://chatgpt.com/*`。
- ChatGPT 页面 DOM 变化可能导致 prompt 识别失效。
- 手动刷新只能重新扫描当前页面 DOM 中已经存在的用户 prompt。
- 历史消息未加载到 DOM 时，对应 prompt 不会显示在 timeline 中。
- 当前 active 高亮优先保证点击后的状态；暂未实现基于滚动位置自动切换 active prompt。
- DeepSeek support 暂缓。
- 当前版本不支持 export、Prompt Vault、文件夹管理、跨设备同步、账号系统或后端服务。
