# Change Log

本文记录 Prompt Timeline Navigator 从 V1 到当前 V2G 的功能演进。当前推荐稳定分支为 `v2g-direct-scroll-navigation`。

## 分支说明

- 当前推荐稳定分支：`v2g-direct-scroll-navigation`
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
