# Manual Test Checklist

## V4B Sidebar Collections Shortcut

### V4B diagnostic mode

- [ ] Reload extension。
- [ ] Refresh ChatGPT。
- [ ] Console 应看到 `[ACN boot] content script loaded`。
- [ ] Console 应看到 `[ACN boot] initialization start`。
- [ ] Console 应看到 `[ACN boot] before createSidebar`。
- [ ] Console 应看到 `[ACN boot] createSidebar start`。
- [ ] Console 应看到 `[ACN boot] createSidebar appended root`。
- [ ] Console 应看到 `[ACN boot] initialization completed`。
- [ ] Console 不应有来自 `content.js` 的 uncaught error。
- [ ] 执行 `document.querySelector("#ai-conversation-navigator")` 应返回 root element。
- [ ] 右侧 compact rail 应恢复显示。
- [ ] 右侧 panel 应能打开。
- [ ] Collections tab 应能打开。
- [ ] V2 timeline / hover / navigation 应正常。
- [ ] V3 collection CRUD 应正常。
- [ ] 由于 `ENABLE_SIDEBAR_COLLECTIONS_SHORTCUT = false`，左侧 shortcut 暂时不出现是预期行为。
- [ ] 如果某个 boot log 没出现，应根据最后一个出现的 log 判断中断点。

- [ ] 打开 ChatGPT。
- [ ] 确认左侧 sidebar 存在时，可以看到 `Collections` shortcut。
- [ ] 如果左侧 sidebar 加载较慢，等待页面稳定后 shortcut 应出现。
- [ ] shortcut 不应重复出现。
- [ ] 点击 shortcut 后，右侧 Prompt Navigator panel 打开。
- [ ] 点击 shortcut 后，panel 自动切换到 Collections tab。
- [ ] V3 collections list 能正常显示。
- [ ] 找不到 sidebar 或 sidebar collapsed 时，页面不报错，右侧 panel 仍可正常使用。
- [ ] 即使左侧 sidebar shortcut 没出现，右侧 Prompt Navigator compact rail 也必须出现。
- [ ] 即使 ChatGPT sidebar DOM 变化，扩展不能整体消失。
- [ ] 刷新 ChatGPT 后右侧 panel 必须可打开。
- [ ] Console 不应出现来自 `content.js` 的 uncaught error。
- [ ] sidebar shortcut 失败时，V2 prompt timeline / V3 collections 仍正常。
- [ ] 在 conversation A / B 之间切换后，shortcut 仍存在或能恢复。
- [ ] 切换 conversation 后，`Add current` / `Added` 状态仍基于当前 conversation 正确显示。
- [ ] ChatGPT 原生 sidebar conversation item 仍可正常点击。
- [ ] ChatGPT 原生 New chat 仍可正常点击。
- [ ] V2 compact timeline 仍可点击。
- [ ] V2 hover preview 仍正常。
- [ ] V2 long-answer navigation 仍准确。
- [ ] search panel button 仍最高且可点击。
- [ ] V3 create / rename / delete collection 正常。
- [ ] V3 add current / remove saved conversation 正常。
- [ ] V3 open saved conversation URL 正常。

本文用于 V3H 手动回归。当前扩展只支持 `https://chatgpt.com/*`，DeepSeek 仍保持禁用。

## V2 Regression

- [ ] ChatGPT conversation 页面 extension 正常加载。
- [ ] Compact timeline 显示正常。
- [ ] Prompts tab 默认显示 prompt list。
- [ ] Compact dot 点击跳转正常。
- [ ] Expanded prompt item 点击跳转正常。
- [ ] Hover preview 正常。
- [ ] Search panel button 仍可点击。
- [ ] 长回答 prompt navigation 准确。
- [ ] Direct scroll without reverse jump 没有回归。

## V3 Collections Basic

- [ ] Collections tab 可以打开。
- [ ] 没有 collection 时显示 empty state。
- [ ] 可以创建 collection。
- [ ] 空名称不能创建。
- [ ] Collection 出现在 list 中。
- [ ] Collection 显示 conversation count。
- [ ] 可以 Add current。
- [ ] 重复 Add current 不重复添加。
- [ ] 刷新页面后 collection 仍存在。
- [ ] 刷新页面后 membership 仍存在。

## V3 Collection Detail

- [ ] 点击 collection 主体进入 detail。
- [ ] 点击 Add current 不误进入 detail。
- [ ] Detail 显示 collection name。
- [ ] Back 可以回到 collection list。
- [ ] 空 collection 显示 empty state。
- [ ] Saved conversation 显示 title / platform / metadata / snippet / URL。
- [ ] Open 按钮打开原始 conversation URL。
- [ ] Saved conversation item 其他区域不误打开 URL。
- [ ] Invalid URL 不打开。

## V3 Management

- [ ] Rename collection 正常。
- [ ] 空名称不能保存。
- [ ] Cancel 不保存。
- [ ] Rename 不误触发 detail。
- [ ] Delete collection 前有确认。
- [ ] Cancel 不删除。
- [ ] Confirm 删除 collection。
- [ ] 删除 detail 中当前 collection 后安全回到 list。
- [ ] Remove saved conversation 前有确认。
- [ ] Remove 不打开 URL。
- [ ] 多 collection membership 不被误删。
- [ ] 删除 / remove 不删除原始 ChatGPT conversation。

## Page Load Stability

- [ ] 禁用插件后刷新 5 到 10 次，记录是否出现 ChatGPT load failure。
- [ ] 启用插件但不打开 Collections tab，刷新 5 到 10 次。
- [ ] 启用插件进入 Collections tab，刷新 5 到 10 次。
- [ ] 启用插件进入 collection detail，不点击 Open，刷新 5 到 10 次。
- [ ] 点击 Open 打开 saved conversation 后观察新标签页是否稳定。
- [ ] DevTools Console 检查是否有 `content.js` / `chrome.storage` / `URL` / `window.open` error。
- [ ] Network 检查是否为 ChatGPT 自身 401 / 403 / 404 / 429 / 500 / failed to fetch。

## Privacy and Storage

- [ ] Confirm only `chrome.storage.local` is used。
- [ ] Confirm no backend。
- [ ] Confirm no cloud sync。
- [ ] Confirm no full conversation content stored。
- [ ] Confirm no full prompt content stored。
- [ ] Confirm storage key remains `aiConversationNavigatorCollections`。
- [ ] Confirm DeepSeek remains disabled unless future work。
