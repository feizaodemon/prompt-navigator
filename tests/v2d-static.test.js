const assert = require("assert");
const fs = require("fs");

const content = fs.readFileSync("content.js", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");
const readme = fs.readFileSync("README.md", "utf8");
const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));

assert.deepStrictEqual(manifest.content_scripts[0].matches, ["https://chatgpt.com/*"]);
assert(!JSON.stringify(manifest).includes("chat.deepseek.com"), "manifest must not enable DeepSeek");

assert(content.includes("calculateCompactDotPosition"), "compact dots should keep percentage positioning");
assert(content.includes("dot.style.top = `${calculateCompactDotPosition(index, messages.length)}%`"), "compact dots should keep absolute percentage top");
assert(content.includes('handlePromptClick(promptId, "compact", Number(dot.dataset.promptNumber))'), "compact dot click should use the same unified click entry as expanded prompt item");
assert(content.includes("COMPACT_SCROLL_OFFSET_PX"), "V2D offset constant should remain documented in code");
assert(content.includes("scrollToPromptElement(element, prompt.originalIndex)"), "compact dot jump should use the same scroll logic as expanded prompt item");
assert(content.includes('debugNavigator("jump requested"'), "jump should emit debug log when DEBUG_NAVIGATOR=true");
assert(content.includes("numberLine.textContent = `#${promptNumber}`"), "tooltip should keep weak prompt number display");

assert(styles.includes("height: 100vh"), "compact timeline container should fit viewport height");
assert(styles.includes("top: 0"), "compact timeline top should not leave large blank space");
assert(styles.includes("bottom: 0"), "compact timeline bottom should not leave large blank space");
assert(styles.includes("width: 32px"), "compact rail width should stay within 28px to 36px");
assert(styles.includes("position: absolute"), "compact dots should support absolute percentage positioning");
assert(styles.includes("overflow-y: visible"), "compact rail should avoid internal scrollbar for normal prompt counts");
assert(styles.includes(".acn-dot-tooltip-number"), "tooltip number should remain available but weak");
assert(styles.includes("font-size: 10px"), "tooltip number should be visually weak");

assert(readme.includes("V2D Compact Timeline Polish"), "README should document V2D compact timeline polish");
assert(readme.includes("百分比绝对定位"), "README should explain dot distribution strategy");
assert(readme.includes("100px 到 140px"), "README should keep the V2D offset note");

assert(!content.includes("fetch("), "content.js must not upload data or call external services");
assert(!content.includes("XMLHttpRequest"), "content.js must not use XMLHttpRequest");

console.log("V2D 静态检查通过");
