const assert = require("assert");
const fs = require("fs");

const content = fs.readFileSync("content.js", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");
const readme = fs.readFileSync("README.md", "utf8");
const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));

assert.deepStrictEqual(manifest.content_scripts[0].matches, ["https://chatgpt.com/*"]);
assert(manifest.permissions.includes("storage"), "manifest should keep storage permission");

assert(content.includes("MODE_STORAGE_KEY"), "content.js should define compact/expanded mode storage key");
assert(content.includes("navigatorMode"), "content.js should maintain current display mode");
assert(content.includes("let navigatorMode = MODE_COMPACT"), "V2C should default to compact timeline");
assert(content.includes("loadNavigatorMode"), "content.js should load previous display mode");
assert(content.includes("saveNavigatorMode"), "content.js should save selected display mode");
assert(content.includes("acn-panel"), "content.js should create floating search / prompt list panel");
assert(content.includes("togglePromptPanel"), "content.js should provide panel toggle logic");
assert(content.includes("handleOutsidePanelClick"), "content.js should close panel on outside click");
assert(content.includes("is-panel-open"), "content.js should control floating panel with state class");
assert(content.includes("detectChatGPTTheme"), "content.js should detect ChatGPT theme");
assert(content.includes("applyPromptNavigatorTheme"), "content.js should apply theme to Prompt Navigator");
assert(content.includes("observeChatGPTThemeChanges"), "content.js should observe ChatGPT theme changes");
assert(content.includes('matchMedia("(prefers-color-scheme: dark)")'), "matchMedia should only be theme fallback");
assert(content.includes("acn-mode-toggle"), "content.js should create mode toggle button");
assert(content.includes("acn-compact-timeline"), "content.js should create compact timeline container");
assert(content.includes("createCompactDot"), "content.js should render compact prompt dots");
assert(content.includes("acn-dot-tooltip"), "content.js should create hover preview tooltip");
assert(content.includes("showCompactTooltip"), "content.js should show compact tooltip on hover");
assert(content.includes("hideCompactTooltip"), "content.js should hide compact tooltip");
assert(content.includes("compactTooltipFrame"), "content.js should track pending tooltip animation frame");
assert(content.includes("window.requestAnimationFrame"), "compact tooltip should wait for layout before measuring");
assert(content.includes("window.cancelAnimationFrame"), "mouseleave should cancel pending tooltip frame");
assert(content.includes("layoutCompactTooltip"), "content.js should calculate tooltip position independently");
assert(content.includes('addEventListener("mouseenter"'), "compact dot should bind mouseenter");
assert(content.includes('addEventListener("mouseleave"'), "compact dot should bind mouseleave");
assert(content.includes("document.body.appendChild(compactTooltip)"), "compact tooltip should append to document.body");
assert(content.includes("getBoundingClientRect()"), "compact tooltip should calculate position from dot rect");
assert(content.includes("[Prompt Navigator][Compact Tooltip] show"), "hover should emit compact tooltip show debug log");
assert(content.includes("[Prompt Navigator][Compact Tooltip] layout"), "layout should emit compact tooltip layout debug log");
assert(content.includes("window.innerWidth - tooltipRect.width - viewportPadding"), "tooltip left should stay inside viewport");
assert(content.includes("window.innerHeight - tooltipRect.height - viewportPadding"), "tooltip top should stay inside viewport");
assert(content.includes("Prompt ${promptNumber}"), "tooltip should include prompt number");
assert(content.includes('handlePromptClick(promptId, "compact", Number(dot.dataset.promptNumber))'), "compact dot click should use unified prompt click entry");
assert(content.includes("is-pinned"), "compact dot should mark pinned state");
assert(content.includes("is-active"), "compact dot should mark active state");

assert(styles.includes("#ai-conversation-navigator.is-compact"), "styles.css should include compact container styles");
assert(styles.includes(".acn-panel"), "styles.css should include floating panel styles");
assert(styles.includes("right: calc(100% + 10px)"), "floating panel should appear on the left side of timeline");
assert(styles.includes("#ai-conversation-navigator.is-panel-open .acn-panel"), "panel should display only when open");
assert(styles.includes(".acn-compact-timeline"), "styles.css should include compact timeline styles");
assert(styles.includes(".acn-compact-dot"), "styles.css should include compact dot styles");
assert(styles.includes(".acn-dot-tooltip"), "styles.css should include tooltip styles");
assert(styles.includes("position: fixed"), "tooltip should use fixed positioning");
assert(styles.includes("pointer-events: none"), "tooltip should not block dot hover or clicks");
assert(styles.includes(".acn-compact-dot.is-active"), "styles.css should include compact active highlight");
assert(styles.includes(".acn-compact-dot.is-pinned"), "styles.css should include compact pinned marker");

assert(readme.includes("Compact Timeline Mode"), "README should document compact timeline mode");
assert(readme.includes("expanded mode"), "README should document switching to expanded mode");
assert(readme.includes("prompt preview"), "README should document hover prompt preview");

assert(!content.includes("fetch("), "content.js must not upload data or call external services");
assert(!content.includes("XMLHttpRequest"), "content.js must not use XMLHttpRequest");
assert(!JSON.stringify(manifest).includes("chat.deepseek.com"), "manifest must not enable DeepSeek");

console.log("V2C static check passed");
