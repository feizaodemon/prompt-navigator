# Manual Test Checklist

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
