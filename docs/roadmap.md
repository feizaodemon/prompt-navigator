# Roadmap

本文记录当前 V2G 稳定状态、V2H 稳定化计划，以及 V3 conversation collections 功能规划。当前阶段仍只支持 `https://chatgpt.com/*`；DeepSeek support 暂缓，不进入 V3 MVP 强制范围。

## 当前稳定状态

- 当前推荐稳定分支：`v2g-direct-scroll-navigation`
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

完整版本说明见 `docs/change_log.md`。

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

### V3 version split

- V3A: Conversation collections architecture
- V3B: Collection storage schema
- V3C: Collections UI shell
- V3D: Add current conversation to collection
- V3E: Collection detail and open conversation
- V3F: Manage collections and saved conversations
- V3G: Polish and regression tests

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
