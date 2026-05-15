# Change Log

本文记录 Prompt Timeline Navigator 从 V1 到当前 V3 Conversation Collections MVP 的功能演进。当前 V3 工作分支为 `v3-conversation-collections`。

## 分支说明

- 当前推荐稳定分支：`v2g-direct-scroll-navigation`
- 当前 V3 工作分支：`v3-conversation-collections`
- 历史工作分支：`v2d-fix-timeline-target-mapping`

V2E 到 V2G 曾经连续开发在 `v2d-fix-timeline-target-mapping` 历史分支上，分支名和实际版本内容不完全匹配。当前不需要重写 Git 历史，也不需要强行拆分旧分支；以本文档记录真实功能演进。

## Roadmap clarification

V3 的规划定义为 `V3: Topic-based Conversation Collections`，不是 prompt-level favorites，也不是 saved prompts。V3 目标是把多个相关 ChatGPT conversation / thread 归入用户自定义 collection，方便之后按项目或主题重新打开原始对话。

## V1: Initial prompt timeline

- Initial prompt timeline sidebar.
- Supports collecting prompts from ChatGPT conversations.
- Supports basic prompt list display and click navigation.

## V1.1: Baseline polish

- Polish baseline UI and basic interaction.
- Improve stability before entering V2 compact timeline work.

## V2A: Timeline baseline UI

- Establish V2 timeline structure.
- Prepare for compact mode, hover preview, and improved navigation.

## V2B: Compact timeline prototype

- Introduce compact timeline mode.
- Use compact dots to represent prompts.
- Reduce sidebar visual footprint.

## V2C: Hover preview and dot navigation

- Add hover preview for compact dots.
- Improve compact dot click navigation.
- Address early preview rendering and prompt adaptation issues.

## V2D: Theme adaptive compact UI

- Adapt compact timeline UI to ChatGPT light/dark themes.
- Improve colors, background matching, and scrollbar appearance.
- Reduce visual mismatch with ChatGPT Plus UI.

## V2E: Search panel layering fixes

- Ensure search panel button remains above timeline dots.
- Fix z-index / layering problems.
- Keep search panel reachable and clickable even when many prompts exist.

## V2F: Long-answer navigation accuracy

- Fix incorrect prompt navigation in long-answer conversations.
- Resolve cases where clicking one prompt jumps to a previous prompt or its answer.
- Improve target mapping using stable prompt identity / originalIndex logic.
- Improve first-click accuracy.

## V2G: Direct scroll without reverse jump

- Fix visual behavior where clicking a prompt first scrolls upward and then corrects to the target.
- Make prompt navigation feel more direct.
- Avoid mixed scroll strategies such as visible `scrollIntoView()` plus manual correction.
- Preserve V2F long-answer first-click accuracy.

## V3 MVP summary

V3: Topic-based Conversation Collections 已完成 MVP 功能闭环。V3 collections 是 conversation 级别的主题分组，不是 prompt-level favorites，不是收藏单个 prompt，也不是收藏单条 assistant answer。

- V3B: Add collection storage schema
  - Added local `chrome.storage.local` collections state.
  - Kept storage key as `aiConversationNavigatorCollections`.
  - Kept collections `schemaVersion` at `1`.
- V3C: Add collections UI shell
  - Added `Collections` tab inside the existing navigator panel.
  - Added collection list shell and empty state.
- V3D: Add collection creation and current conversation save
  - Added create collection flow.
  - Added `Add current` action for the current ChatGPT conversation.
  - Avoided duplicate conversation membership.
- V3E: Add read-only collection detail view
  - Added collection detail view with saved conversation list.
  - Added back navigation to the collection list.
- V3F: Add saved conversation open action
  - Added explicit `Open conversation` action.
  - Open action uses the saved ChatGPT conversation URL and validates invalid URLs.
- V3G: Add collection management actions
  - Added rename and delete collection.
  - Added remove saved conversation from a collection.
  - Confirmations clarify that local records are removed, not original ChatGPT conversations.
- V3H: Polish collections MVP docs and regression checklist
  - Polished empty states, status text, confirmation text, and invalid URL wording.
  - Updated README, roadmap, changelog, manual test checklist, and V3H static regression guard.

## V3 compatibility patch: virtualized prompt extraction

- 已适配 ChatGPT virtualized / lazy-mounted DOM 下的 prompt extraction。
- 新增仅存在于 content script 内存中的 seen prompt cache，作用域为当前 tab 和当前 conversation route。
- ChatGPT 卸载已经见过的 prompt DOM 后，timeline 中的已见 prompt 不会消失。
- 用户手动滚动时，重新进入 DOM 的 prompt 会被合并进 timeline；新输入的 prompt 也会加入 timeline。
- 不把完整 prompt 内容持久化到 `chrome.storage.local`。
- 不改变 V3 collections storage schema，`schemaVersion` 仍为 `1`。
- 限制：prompt 必须至少在当前页面 DOM 中出现过一次，Prompt Navigator 才能缓存它。

V3H does not add tags, nested folders, export/import, search inside collections, AI auto-classification, cloud sync, backend, account system, DeepSeek support, prompt-level favorites, ChatGPT sidebar integration, or a major timeline/navigation redesign.
