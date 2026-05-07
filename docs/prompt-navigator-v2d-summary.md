# Prompt Navigator V2D 稳定状态总结

## 版本定位

当前稳定状态归类为 V2D / V2 polish，不归类为 V3。

PRD.md 中的长期路线保持不变：

- V1：Prompt Timeline Navigator
- V2：搜索与固定
- V3：导出功能
- V4：Prompt Library / Prompt Vault
- V5：文件夹与对话管理
- V6：备份与可选同步

## 当前稳定状态

- expanded mode 中点击 prompt item 可以正确跳转到对应 prompt / answer。
- compact mode 中点击右侧小圆点可以正确跳转到对应 prompt。
- compact dot 的点击链路和 expanded prompt item 统一到同一个 `handlePromptClick(promptId)` 入口。
- 搜索 / prompt list 按钮不会被 compact timeline 圆点覆盖。
- 长对话下 compact timeline 的 UI 层级、按钮可见性和可点击性保持正常。
- pinned prompt 点击跳转仍然走统一入口。
- tooltip、active、高亮和 prompt id 映射保持同一份 prompt 数据。

## 本阶段结论

当前版本可以作为 V2D 稳定版本。

本阶段没有实现 PRD.md 中的 V3 导出功能，也没有引入 export、prompt vault、folder management、sync、account system、backend service 或 DeepSeek adapter。

## 建议手动回归

1. 打开 ChatGPT 长对话，确认 Prompt Navigator 默认显示 compact timeline。
2. 在 expanded mode 点击 prompt 1、一个中间 prompt、最后一个 prompt，确认跳转正确。
3. 在 compact mode 点击第 1 个圆点、中间圆点、最后一个圆点，确认跳转正确。
4. 打开搜索 / prompt list 面板，确认搜索按钮始终可见且可点击。
5. 点击搜索结果和 pinned prompt，确认仍然跳转到对应 prompt。
6. 长对话下确认圆点不会覆盖顶部搜索 / prompt list 按钮。
