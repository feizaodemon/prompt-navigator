# Roadmap

本文记录当前 V2G 稳定导航能力、V3 conversation collections 稳定功能层，以及 V4 sidebar integration 后续方向。当前阶段仍只支持 `https://chatgpt.com/*`；DeepSeek support 暂缓，不进入 V4 初期范围。

## 当前稳定状态

- 当前推荐稳定分支：`v3-conversation-collections`
- V3 Topic-based Conversation Collections 已完成并作为当前稳定功能层保留。
- V3H Patch 已完成：切换 ChatGPT conversation 后，`Add current` / `Added` 状态会基于当前 conversation 重新计算，不需要刷新页面，不会在 route change 时自动写 storage，也不会自动 add current。
- V2F long-answer navigation、V2G direct scroll without reverse jump、search panel layering fixes 仍是后续版本不能破坏的回归基线。
- 历史工作分支：`v2d-fix-timeline-target-mapping`

V2E 到 V2G 曾经连续开发在历史分支 `v2d-fix-timeline-target-mapping` 上，分支名和实际版本内容不完全匹配。当前通过 roadmap / changelog 记录真实演进，不重写 Git 历史。

## 已完成版本

- V1: Initial prompt timeline
- V1.1: Baseline polish
- V2A: Timeline baseline UI
- V2B: Compact timeline prototype
- V2C: Hover preview and dot navigation
- V2D: Theme adaptive compact UI
- V2E: Search panel layering fixes
- V2F: Long-answer navigation accuracy
- V2G: Direct scroll without reverse jump
- V3B: Collection storage schema
- V3C: Collections UI shell
- V3D: Create collection and add current conversation
- V3E: Collection detail read-only view
- V3F: Open saved conversation URL
- V3G: Manage collections and saved conversations
- V3H: Polish, regression checklist, and documentation
- V3H Patch: Refresh collection membership state after conversation switch
- V3 compatibility patch: 适配 ChatGPT virtualized / lazy-mounted DOM 下的 prompt extraction

完整版本说明见 `docs/change_log.md`。

## V3 compatibility patch: ChatGPT virtualized DOM

这是 V3 conversation collections 线上的兼容性补丁，不是 V4 sidebar shortcut 方向的延续。

- 保持 Prompt Navigator 现有右侧 V3 timeline 和 collections UI。
- 只缓存当前 tab 会话中已经出现在页面 DOM 里的 prompts。
- 不读取 ChatGPT 私有内部 data store。
- 不持久化完整 prompt 内容，也不改变 V3 collections storage schema。
- 接受当前限制：从未挂载到 DOM 的历史 prompts 不能自动恢复。

## V2H: Stabilization, documentation, and regression safety

V2H 不应该大改核心导航逻辑。它的目标是稳定当前 V2G 成果，为 V3 topic-based conversation collections 做准备。

### V2H 建议范围

- Add manual test checklist.
- Add regression test notes for:
  - compact dot click navigation
  - expanded prompt item navigation
  - long-answer first-click accuracy
  - search panel layering
  - direct scroll without reverse jump
- Improve README usage instructions.
- Clean up version naming in docs.
- Document known limitations.
- Prepare extension architecture notes before adding conversation collections.

### V2H 不包含

- Major UI redesign.
- Major scroll strategy rewrite.
- Prompt indexing rewrite.
- Conversation collections implementation.
- DeepSeek adapter expansion, unless only documented as future work.

## V3: Topic-based Conversation Collections

V3 的目标不是收藏单个 prompt，也不是收藏某一条 assistant answer。V3 focuses on grouping related conversations into user-defined collections, so the user can revisit project-specific or topic-specific ChatGPT threads quickly.

用户可以创建一个 collection / folder / favorites group，例如：

- Prompt Navigator
- COLMAG Seminar
- gp_torque_compensation
- RoboDK Drawing
- TUM / RWTH Documents

然后把同一主题下的多个 ChatGPT conversation / thread 加入这个 collection。之后用户可以打开 collection，快速查看该主题下所有相关 conversations，并跳转回原始对话。

### V3 target features

1. Create and manage collections

用户可以创建、重命名、删除 collection。Collection 是 conversation 级别的组织单位，不是 prompt 级别的收藏。

2. Add current conversation to a collection

用户可以把当前 ChatGPT conversation 加入一个已有 collection，或在创建 collection 后立即加入。

建议保存的 conversation 信息：

- conversation URL / conversation id
- conversation title if available
- saved timestamp
- platform: ChatGPT / DeepSeek
- optional snippet or local display label

3. Collections list

增加 collections 列表，用于查看用户创建的所有主题集合。

可能入口：

- timeline panel 顶部的 collections button。
- search panel 附近的 collections tab。
- compact / expanded 模式都能进入 collections list。

4. Collection detail and open conversation

用户打开某个 collection 后，可以查看其中保存的 conversations，并点击某条 conversation 打开原始 ChatGPT conversation URL。

要求：

- conversation collection 不应该重写 V2G 的 prompt timeline navigation。
- 打开 conversation URL 后，当前页面内的 prompt timeline 仍继续复用 V2G 逻辑。
- V3 不需要实现 prompt-level jump from collection。

5. Local persistence

Collections 优先采用本地存储，不上传用户数据。

建议：

- Use browser local storage / extension storage.
- No backend required in V3 baseline.
- Collections remain local to the browser profile.
- Later versions may consider export/import.

6. Remove conversation from collection

用户需要能从 collection 中移除某条已保存 conversation，但不影响原始 ChatGPT conversation。

7. Platform scope

V3 baseline 优先支持 ChatGPT conversation collections。DeepSeek 支持可以作为后续扩展方向，不强制放进 V3 MVP，除非现有架构已经足够稳定。

### V3 MVP scope

V3 MVP 明确限定为：

- Create collection.
- Rename collection.
- Delete collection.
- Add current conversation to a collection.
- Remove conversation from a collection.
- Show collections list.
- Show conversations inside selected collection.
- Click saved conversation to open original conversation URL.
- Local persistence only.

V3 MVP 不包含：

- 收藏单个 prompt。
- 收藏单条 assistant answer。
- Prompt vault。
- Cloud sync.
- Backend database.
- User account system.
- Cross-device sync.
- AI auto-classification.
- Tags.
- Nested folders.
- Export / import.
- Major timeline navigation rewrite.
- Major compact timeline redesign.
- DeepSeek full support, unless current architecture already supports it safely.

### V3 version split and current status

- V3A: Conversation collections architecture
- V3B: Collection storage schema 已完成
- V3C: Collections UI shell 已完成
- V3D: Create collection and add current conversation 已完成
- V3E: Collection detail read-only view 已完成
- V3F: Open saved conversation URL 已完成
- V3G: Manage collections and saved conversations 已完成
- V3H: Polish, regression checklist, and documentation，用于 V3 MVP 收尾，不新增大功能
- V3H Patch: Fix `Add current` / `Added` state after conversation switch 已完成

V3H 的范围只包括 UI 文案 polish、empty state/status text polish、README / roadmap / changelog 更新、manual regression checklist、release notes style summary 和静态测试护栏。

V3B 到 V3G 的功能闭环已经完成，V3H polish / docs / regression checklist 已完成。V3 当前作为稳定功能层保留，后续 V4 应在 V3 collections 之上增加入口层，而不是重写 V3。

## V4: ChatGPT Sidebar Collections Integration

V4 方向是 ChatGPT sidebar integration / Voyager-style sidebar collections。V4 不是重写 V3，而是在 V3 collections 功能层之上增加 ChatGPT 左侧 sidebar 入口层。

兼容旧 roadmap 表述：V4 future direction 包含 ChatGPT sidebar collections integration 和 Gemini Voyager-like sidebar folder UI，但必须分阶段推进。

V3 右侧 panel 继续保留，作为完整 collection management 界面。V4 左侧 sidebar 初期只做更直观的入口和快速浏览，不应该一开始就在 sidebar 内实现完整 collection management，也不应该一开始就做复杂 folder-style UI。

V4A 开始前只需要完成 roadmap 更新。V4A 本身应该新开 Codex thread，并且只做 feasibility analysis，不做代码修改。

### V4A: Sidebar integration feasibility analysis

Status: planned

性质：只读分析，不改代码。

目标：

- 分析 ChatGPT 左侧 sidebar 是否有稳定挂载点。
- 判断能否安全插入 collections shortcut / collections list。
- 分析 ChatGPT sidebar DOM 是否会因 SPA route / resize / collapse / navigation 被重建。
- 分析如何避免影响 ChatGPT 原生 conversation list。
- 分析 fallback：如果找不到 sidebar mount point，则继续使用 V3 右侧 panel。

### V4B: Sidebar collections shortcut

Status: planned after V4A

目标：

- 在 ChatGPT 左侧 sidebar 增加一个小的 `Collections` 入口。
- 点击后打开现有 V3 右侧 Collections panel。
- 不在左侧直接渲染完整 collections list。
- 复用 V3G / V3H 已有功能。
- 低风险验证 sidebar mount point。

### V4C: Sidebar collection list

Status: future

目标：

- 在 ChatGPT 左侧 sidebar 显示 collection list。
- 点击 collection 后打开现有右侧 detail panel。
- 左侧只作为快速入口 / 快速浏览。
- 完整管理仍在右侧 panel。

### V4D: Sidebar folder-style conversation list

Status: future

目标：

- 左侧 sidebar 可以展开 collection。
- collection 下显示 saved conversations。
- 点击 saved conversation 打开原始 URL。
- 仍复用 V3 storage。
- 不重写 schema。

### V4E: Sidebar polish and fallback behavior

Status: future

目标：

- ChatGPT sidebar collapse / expand 兼容。
- route change 兼容。
- fallback behavior。
- V2 / V3 regression。
- docs / tests / manual checklist。

### V4 strict constraints

V4 初期不要：

- 不要重写 V3 storage schema。
- 不要新增 storage key，除非有明确 migration plan。
- 不要重写 collections state helper。
- 不要重写 prompt navigation。
- 不要替换现有右侧 panel。
- 不要改 compact timeline。
- 不要改 V2G direct scroll。
- 不要改 V2F long-answer navigation。
- 不要改 search panel z-index。
- 不要做 DeepSeek。
- 不要做 cloud sync。
- 不要做 export / import。
- 不要保存完整 conversation / prompt 内容。
- 不要依赖过深或脆弱的 ChatGPT class name。
- 不要影响 ChatGPT 原生 conversation list 点击。
- 不要注入全局 CSS。
- 不要新增 document / window / body 级别 click listener，除非明确必要且安全。

V4 fallback principle：如果 ChatGPT sidebar 没有稳定、安全的挂载点，继续使用 V3 右侧 panel，不为了 sidebar integration 牺牲 V2/V3 稳定能力。

### V3 risks

1. Conversation identity stability

- Conversation URL / conversation id must remain reliable enough for local collection links.
- ChatGPT title extraction may be delayed or unavailable, so the schema needs fallback labels.

2. Storage schema

- Need a simple and migration-friendly collections data structure.

3. UI clutter

- Collections entry should not make the compact timeline visually noisy.

4. Navigation dependency

- Opening a saved conversation should be URL-based.
- Prompt-level navigation inside the conversation should continue using stable V2G behavior.

5. Privacy

- Conversation titles and optional snippets may contain sensitive content, so storage must be local by default.

## Suggested future branches

- `v2h-docs-regression-safety`
- `v3-conversation-collections`
- `v3-topic-collections-mvp`

V3 MVP 可以先从一个分支开始：`v3-topic-collections-mvp` 或 `v3-conversation-collections`。不要使用 `v3-favorites-mvp`，因为这个名字容易被误解为 prompt-level favorites。

## Explicit non-goals for V3

以下方向不属于 V3 规划：

- favorite / unfavorite single prompt
- saved prompts as prompt-level items
- prompt vault
- favorite prompt item
- click favorite item to jump back to original prompt
- star button for individual prompt
- prompt-level favorites
