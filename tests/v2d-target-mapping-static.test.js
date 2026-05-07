const assert = require("assert");
const fs = require("fs");

const content = fs.readFileSync("content.js", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");
const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));

assert.deepStrictEqual(manifest.content_scripts[0].matches, ["https://chatgpt.com/*"]);
assert(!JSON.stringify(manifest).includes("chat.deepseek.com"), "manifest.json 不应重新启用 DeepSeek");

assert(content.includes("const DEBUG_NAVIGATOR = false"), "content.js 应保留默认关闭的 debug 开关");
assert(content.includes("let currentPrompts = []"), "content.js 应维护当前扫描到的统一 prompt 列表");
assert(content.includes("function buildPromptRecord"), "content.js 应把扫描结果标准化为统一 prompt 对象");
assert(content.includes("prompt.index"), "timeline / list / pinned 应使用 prompt 原始编号");
assert(content.includes("prompt.preview"), "tooltip 和列表应使用同一份 prompt preview");
assert(content.includes("function handlePromptClick(promptId"), "所有点击入口应统一到 handlePromptClick(promptId)");
assert(content.includes("findPromptById(promptId)"), "点击时应通过 promptId 从当前列表查找 prompt");
assert(content.includes("refreshPrompts()"), "element 失效时应重新扫描当前 DOM");
assert(content.includes('scrollToPrompt(prompt, source)'), "跳转应接收统一 prompt 对象");
assert(content.includes("dot.dataset.promptId = prompt.id"), "compact dot 应写入稳定 data-prompt-id");
assert(content.includes('dot.addEventListener("click", handleCompactDotClick)'), "compact dot 点击应绑定明确的 dot click handler");
assert(content.includes("function handleCompactDotClick(event)"), "content.js 应提供 compact dot click handler");
assert(content.includes("event.preventDefault()"), "compact dot click 应阻止默认行为");
assert(content.includes("event.stopPropagation()"), "compact dot click 应阻止冒泡干扰");
assert(content.includes('handlePromptClick(promptId, "compact")'), "compact dot click 应调用统一跳转入口");
assert(content.includes('compactTimeline.addEventListener("click", handleCompactTimelineClick)'), "dots 容器应有 click 委托兜底");
assert(content.includes("function handleCompactTimelineClick(event)"), "content.js 应提供 compact timeline click 委托");
assert(content.includes('event.target.closest(".acn-compact-dot")'), "委托点击应从事件目标查找 dot");
assert(content.includes('debugNavigator("dot clicked"'), "DEBUG_NAVIGATOR=true 时 dot click 应输出调试信息");
assert(content.includes('item.addEventListener("click", () => handlePromptClick(promptId))'), "prompt list 点击应统一走 handlePromptClick");
assert(content.includes('item.addEventListener("click", () => handlePromptClick(promptId, "pinned"))'), "pinned 点击应统一走 handlePromptClick");
assert(!content.includes("scrollToMessage(message.element"), "不应绕过统一入口直接用闭包里的 message.element 跳转");

assert(styles.includes("pointer-events: auto"), "compact dot 应显式接收鼠标事件");
assert(styles.includes("z-index: 3"), "compact dot 层级应高于 timeline 背景");
assert(styles.includes("--pn-compact-header-height: 36px"), "compact rail 应定义固定顶部按钮区高度");
assert(styles.includes("height: var(--pn-compact-header-height)"), "顶部按钮区应占据固定高度");
assert(styles.includes("z-index: 20"), "搜索 / prompt list 按钮区层级应高于 dots");
assert(styles.includes("margin-top: var(--pn-compact-header-height)"), "dots 区应从按钮下方开始");
assert(styles.includes("height: calc(100vh - var(--pn-compact-header-height))"), "dots 区高度应排除顶部按钮区");
assert(styles.includes(".acn-compact-dot::after"), "compact dot 应使用较大的 button 命中区和较小的视觉圆点");
assert(styles.includes("width: 24px"), "compact dot button 命中区宽度应大于视觉圆点");
assert(styles.includes("height: 24px"), "compact dot button 命中区高度应大于视觉圆点");

assert(!content.includes("fetch("), "content.js 不应上传数据或请求外部服务");
assert(!content.includes("XMLHttpRequest"), "content.js 不应使用 XMLHttpRequest");

console.log("V2D target mapping 静态检查通过");
