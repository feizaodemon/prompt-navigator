# Prompt Navigator V2E Polish Plan

## 版本定位

V2E 只作为 V2 阶段的体验增强计划，不改变 PRD.md 中的长期路线。

PRD.md 中 V3 仍然是导出功能，本计划不包含 export 实现。

## 允许规划的 V2E 范围

- 当前 prompt 高亮稳定性优化。
- compact tooltip 文案、宽度和可读性优化。
- 长对话 compact timeline 的密度和滚动体验优化。
- 搜索结果 next / previous 导航。
- prompt index / prompt id mapping 防回归检查。
- 手动测试 checklist 补充。

## 不进入的范围

- export
- prompt vault
- folder management
- sync
- DeepSeek adapter
- account system
- backend service
- V3 / V4 / V5 / V6 功能

## 建议验收清单

1. expanded mode 点击任意 prompt item 都能跳转。
2. compact mode 点击任意 dot 都能跳转。
3. 搜索过滤后 prompt 编号不重新编号。
4. pinned prompt 刷新后尽量保留并能跳转。
5. active prompt 高亮与实际 viewport 位置一致。
6. tooltip 显示内容与点击目标一致。
7. 长对话下搜索按钮始终最高、可见、可点击。
8. 不引入外部依赖，不上传聊天内容。
