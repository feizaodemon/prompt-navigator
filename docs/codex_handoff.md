# Codex Handoff

## 1. Project Identity

- Project name: `AI Conversation Navigator` / `Prompt Navigator`
- Repo path: `C:\Users\dummd\Desktop\Voyager for me`
- Main purpose: Manifest V3 浏览器扩展，在 `https://chatgpt.com/*` 页面生成右侧 prompt timeline，支持 compact timeline、prompt list、hover preview、prompt navigation、pinned prompts 和 V3 conversation collections。
- Fixed Codex agent environment:
  - Windows native
- Reason for this environment choice:
  - 当前 repo 位于 Windows 路径。
  - 项目是 Chrome / Edge extension，不依赖 Linux-only 工具链。
  - 扩展安装、reload extension、ChatGPT 页面手动验证更适合 Windows 原生浏览器环境。

## 2. Current Git State

- Current branch: `v3-virtualized-prompt-extraction`
- Latest commits:
  - `98369a7 Adapt prompt extraction to virtualized ChatGPT DOM`
  - `eedf660 Update roadmap for V4 sidebar integration`
  - `bba33ed Fix collection added state after conversation switch`
  - `53ffcec Polish collections MVP docs and regression checklist`
  - `bf14ca0 Add collection management actions`
- Working tree status:
  - 写入本文档前：`git status --short` 无输出，工作区 clean。
  - 写入本文档后：`docs/codex_handoff.md` 是新增未提交文件，除非后续已 commit。
- Remote status if known:
  - `origin` = `https://github.com/feizaodemon/prompt-navigator.git`
  - `git status -sb` 显示当前分支没有 upstream 信息。
  - 上一轮曾创建本地 commit `98369a7`，但 `git push -u origin v3-virtualized-prompt-extraction` 被安全审查拒绝；是否已由其他方式推送不确定。

## 3. Current Task Context

- Current task:
  - 创建 `docs/codex_handoff.md`，为以后新 Codex thread、Windows 原生 / WSL agent 切换或换电脑时恢复上下文。
- Why this task matters:
  - 项目上下文分散在 `README.md`、`PRD.md`、`docs/change_log.md`、`docs/roadmap.md`、`content.js` 和测试中。
  - 当前分支包含 V3 virtualized DOM 兼容性补丁，后续 agent 需要快速知道它不是 V4 sidebar 方向。
- What has already been completed:
  - V1 / V2 prompt timeline、compact timeline、hover preview、prompt navigation、active highlight 已存在。
  - V3 conversation collections MVP 已存在，collections 是 conversation 级别，不是 prompt-level favorites。
  - 当前分支已提交 `98369a7`：新增 in-memory seen prompt cache，适配 ChatGPT virtualized / lazy-mounted DOM。
  - 新增静态测试 `tests/v3-virtualized-prompt-cache-static.test.js`。
- What is still unfinished:
  - `v3-virtualized-prompt-extraction` 分支尚未确认成功 push 到 remote。
  - ChatGPT 真实页面仍需要人工手动验证 virtualized DOM 下的累积 prompt 行为。
  - unmounted cached prompt 暂时不能可靠跳转，只能避免错误跳转。

## 4. Important Files and Roles

| File | Role | Notes |
|---|---|---|
| `AGENTS.md` | 项目级 Codex 指令 | 要求中文回复；当前只支持 ChatGPT；不要启用 DeepSeek；不要新增 backend / sync / export / prompt vault。 |
| `manifest.json` | Manifest V3 配置 | 只匹配 `https://chatgpt.com/*`；无 `background.js`；使用 `content.js` 和 `styles.css`。 |
| `content.js` | 核心 content script | 包含 ChatGPT adapter、prompt extraction、prompt cache、compact timeline、prompt list、click navigation、collections storage。 |
| `styles.css` | 扩展 UI 样式 | compact rail、panel、tooltip、collections、theme 样式。当前任务不应修改。 |
| `README.md` | 使用说明 | 说明安装、reload extension、测试方式、隐私限制。 |
| `PRD.md` | 产品需求文档 | 中文需求；当前阶段保持 ChatGPT prompt timeline 范围，DeepSeek 暂缓。 |
| `docs/change_log.md` | 版本演进记录 | 已记录 V3 virtualized prompt extraction compatibility patch。 |
| `docs/roadmap.md` | Roadmap | 已说明 virtualized DOM patch 属于 V3 compatibility patch，不是 V4 sidebar continuation。 |
| `docs/manual_test_checklist.md` | 手动回归清单 | 包含 V3 virtualized prompt extraction 测试项。 |
| `tests/*.js` | 静态回归测试 | Node 脚本风格，无外部依赖。 |

## 5. How to Run

当前项目没有 `package.json`，没有 build step。

Chrome:

1. 打开 `chrome://extensions/`。
2. 开启 Developer mode。
3. 选择 Load unpacked。
4. 选择 repo 根目录：`C:\Users\dummd\Desktop\Voyager for me`。
5. 打开或刷新 `https://chatgpt.com/`。

Edge:

1. 打开 `edge://extensions/`。
2. 开启 Developer mode。
3. 选择 Load unpacked。
4. 选择 repo 根目录。

修改 `content.js` 或 `styles.css` 后，需要在 extensions 页面 reload extension，然后刷新 ChatGPT 页面。

## 6. How to Test

自动静态测试：

```powershell
Get-ChildItem tests/*.js | ForEach-Object { node $_.FullName; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }
node --check content.js
```

手动测试重点：

- Reload extension 后刷新 ChatGPT。
- 打开长 conversation，执行 `document.querySelectorAll('[data-message-author-role="user"]').length`，记录当前 DOM mounted user message 数。
- 打开 Prompt Navigator，确认初始 timeline 可能只显示 mounted prompts。
- 上下滚动 conversation，更多 prompts 进入 DOM 后 timeline 应累积增加。
- 已经见过的 prompts 不应因为 DOM 卸载而从 timeline 消失。
- 新输入 prompt 后 timeline 应加入新 prompt。
- mounted prompt 点击应正常跳转。
- unmounted cached prompt 不应错误跳到其他 prompt。
- hover preview、compact dots、expanded prompt list、search panel clickability 应正常。
- Collections tab、`Add current` / `Added`、create / rename / delete collection、open saved conversation URL 应正常。

失败现象：

- compact dots 数量和 expanded prompt list 数量不一致。
- 已经滚动见过的 prompt 从 timeline 消失。
- 点击 unmounted cached prompt 跳到错误 prompt。
- search panel button 被遮挡或不可点击。
- Collections storage schema 从 `schemaVersion: 1` 变化。
- `manifest.json` 重新启用了 DeepSeek scope。

## 7. Known Issues / Risks

- ChatGPT 当前可能使用 virtualized / lazy-mounted DOM；从未挂载到当前 DOM 的历史 prompt 无法凭空恢复。
- in-memory prompt cache 只存在于 content script 当前 tab 会话，不写入 `chrome.storage.local`。
- cached prompt navigation 只有在对应 DOM element 当前 mounted 时可靠；unmounted cached prompt 目前只能安全地不跳转。
- fallback stable key 使用 route + text hash；缺少稳定 message id 时，完全相同文本的重复 prompt 可能 collision。
- 当前分支本地 commit 可能尚未 push，需要人工确认 remote 状态。
- Chrome extension 修改后必须手动 reload extension 并刷新 ChatGPT 页面。
- 不要启用 DeepSeek，不要读取 ChatGPT 私有内部 data store，不要新增 backend / cloud sync / export/import。
- Windows PowerShell 中原始 Unix `find . -maxdepth ...` 命令不可直接使用；可用 `Get-ChildItem -Recurse -Depth 3 -File` 等价替代。

## 8. Next Steps

1. 确认是否允许 push 当前分支到 `origin/v3-virtualized-prompt-extraction`。
2. 在真实 ChatGPT 长 conversation 中执行 V3 virtualized prompt extraction 手动测试。
3. 重点验证滚动后 accumulated prompt count 增加、已见 prompts 不消失、新 prompt 加入 timeline。
4. 验证 mounted prompt click 正常，unmounted cached prompt 不错误跳转。
5. 回归 V3 collections：`Add current` / `Added`、CRUD、open saved conversation URL。
6. 如手动验证通过，考虑把 `v3-virtualized-prompt-extraction` 合并回稳定 V3 分支。
7. 后续如果要支持 unmounted prompt navigation，需要单独设计，不应读取 ChatGPT 私有 data store。

## 9. Suggested Prompt for Next Codex Thread

请在当前 repo `C:\Users\dummd\Desktop\Voyager for me` 中继续工作。当前分支应为 `v3-virtualized-prompt-extraction`。请先读取 `docs/codex_handoff.md`、`AGENTS.md`、`docs/change_log.md`、`docs/manual_test_checklist.md`，再分析当前状态，不要立即修改代码。当前任务上下文是 Prompt Navigator 的 V3 virtualized / lazy-mounted DOM 兼容性补丁：保持 V3 conversation collections，不恢复 V4 sidebar shortcut，不启用 DeepSeek，不读取 ChatGPT 私有 data store，不持久化完整 prompt 内容。请用中文回答，命令、文件名、函数名、branch 名、commit hash、路径等技术标识保持英文。

## 10. Last Updated

- Date: 2026-05-18
- Updated by: Codex
- Notes:
  - 新建交接文档。
  - 当前项目为 Manifest V3 browser extension。
  - 当前分支为 `v3-virtualized-prompt-extraction`。
  - 本文档写入前工作区 clean；写入后需要 commit `docs/codex_handoff.md`。
