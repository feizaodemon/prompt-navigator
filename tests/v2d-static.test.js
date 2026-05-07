const assert = require("assert");
const fs = require("fs");

const content = fs.readFileSync("content.js", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");
const readme = fs.readFileSync("README.md", "utf8");
const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));

assert.deepStrictEqual(manifest.content_scripts[0].matches, ["https://chatgpt.com/*"]);
assert(!JSON.stringify(manifest).includes("chat.deepseek.com"), "manifest.json 不应重新启用 DeepSeek");

assert(content.includes("calculateCompactDotPosition"), "content.js 应按百分比计算 compact 圆点位置");
assert(content.includes("dot.style.top = `${calculateCompactDotPosition(index, messages.length)}%`"), "compact 圆点应使用 top 百分比绝对定位");
assert(content.includes('scrollToMessage(message.element, promptKey, "compact")'), "compact 圆点点击应使用 compact 精准跳转");
assert(content.includes("COMPACT_SCROLL_OFFSET_PX"), "content.js 应定义 compact 跳转顶部偏移");
assert(content.includes("element.style.scrollMarginTop = `${COMPACT_SCROLL_OFFSET_PX}px`"), "compact 跳转应设置顶部偏移");
assert(content.includes('block: "start"'), "compact 跳转应把 prompt 定位到视口上方偏下位置");
assert(content.includes("numberLine.textContent = `#${promptNumber}`"), "tooltip 不应再突出显示大号 Prompt 编号");

assert(styles.includes("height: 100vh"), "compact timeline 外层应尽量贴合完整浏览器高度");
assert(styles.includes("top: 0"), "compact timeline 外层顶部不应保留明显空白");
assert(styles.includes("bottom: 0"), "compact timeline 外层底部不应保留明显空白");
assert(styles.includes("width: 32px"), "compact rail 宽度应控制在 28px 到 36px");
assert(styles.includes("position: absolute"), "compact 圆点应支持百分比绝对定位");
assert(styles.includes("overflow-y: visible"), "普通 prompt 数量下 compact rail 不应显示内部滚动条");
assert(styles.includes(".acn-dot-tooltip-number"), "tooltip 编号仍应可用但弱化");
assert(styles.includes("font-size: 10px"), "tooltip 编号应弱化为小号元信息");

assert(readme.includes("V2D Compact Timeline Polish"), "README.md 应记录 V2D compact timeline polish");
assert(readme.includes("百分比绝对定位"), "README.md 应说明圆点分布策略");
assert(readme.includes("100px 到 140px"), "README.md 应说明 compact 点击后的目标偏移");

assert(!content.includes("fetch("), "content.js 不应上传数据或请求外部服务");
assert(!content.includes("XMLHttpRequest"), "content.js 不应使用 XMLHttpRequest");

console.log("V2D 静态检查通过");
