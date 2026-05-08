const assert = require("assert");
const fs = require("fs");

const content = fs.readFileSync("content.js", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");
const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));

assert.deepStrictEqual(manifest.content_scripts[0].matches, ["https://chatgpt.com/*"]);
assert(!JSON.stringify(manifest).includes("chat.deepseek.com"), "manifest must not enable DeepSeek");

assert(content.includes("let activePromptFrame = null"), "active prompt tracking should be throttled by requestAnimationFrame");
assert(content.includes("let activeScrollContainer = null"), "active tracking should remember the real scroll container");
assert(content.includes("function startActivePromptTracking()"), "content.js should start viewport-based active prompt tracking");
assert(content.includes("function attachActivePromptScrollListener()"), "content.js should attach scroll listener to the detected scroll container");
assert(content.includes("function findScrollContainer()"), "content.js should find ChatGPT's real scroll container");
assert(content.includes("findPromptScrollContainer()"), "scroll container detection should prefer the prompt ancestor");
assert(content.includes("activeScrollContainer.addEventListener(\"scroll\", handleActivePromptScroll"), "detected scroll container should update active prompt");
assert(!content.includes('window.addEventListener("scroll", scheduleActivePromptUpdate'), "active tracking must not rely only on window scroll");
assert(content.includes('window.addEventListener("resize", scheduleActivePromptUpdate'), "resize listener should update active prompt");
assert(content.includes('[PromptNavigator] scroll container'), "debug mode should log the detected scroll container");
assert(content.includes('[PromptNavigator] scroll event fired'), "debug mode should log scroll events");
assert(content.includes('[PromptNavigator] active update'), "debug mode should log active updates");
assert(content.includes("function updateActivePromptFromViewport()"), "content.js should calculate active prompt from viewport");
assert(content.includes("let previousPrompt = null"), "active prompt should fall back to the previous prompt in long answers");
assert(content.includes("const viewportMiddle = window.innerHeight * ACTIVE_PROMPT_VIEWPORT_RATIO"), "active prompt should use the same viewport target");
assert(content.includes("setActivePrompt(bestPrompt.id, bestPrompt.index"), "active prompt tracking should use original prompt id and index");
assert(content.includes("prompt.index"), "active/highlight UI should preserve original prompt index");
assert(content.includes("renderCompactTimeline(messages, pinnedKeys)"), "compact timeline should still use unfiltered messages");
assert(content.includes("item.classList.toggle(\"is-active\", isPromptActive(promptKey, promptNumber))"), "expanded items should render active state");
assert(content.includes("dot.classList.toggle(\"is-active\", isPromptActive(prompt.id, prompt.index))"), "compact dots should render active state");
assert(content.includes("function isPromptActive(promptKey, promptIndex)"), "expanded and compact modes should share one active state helper");
assert(content.includes("handlePromptClick(promptId)"), "V2D unified click entry should remain in use");

assert(content.includes("const COMPACT_TOOLTIP_MAX_TEXT_LENGTH"), "tooltip should have an explicit long text cap");
assert(content.includes("fullPromptPreview"), "tooltip should use a stable long preview separate from compact dot dataset");
assert(content.includes("compactTooltip.style.width = \"\""), "tooltip layout should reset width before measuring");
assert(!content.includes('console.log("[Prompt Navigator][Compact Tooltip]'), "tooltip debug logs should not run by default");

assert(styles.includes("width: max-content"), "tooltip should size immediately from content before viewport clamping");
assert(styles.includes("max-width: min(360px, calc(100vw - 24px))"), "tooltip should keep a readable max width");
assert(styles.includes("overflow-wrap: anywhere"), "tooltip should wrap long prompts");
assert(styles.includes("word-break: break-word"), "tooltip should not overflow on long tokens");
assert(styles.includes(".acn-dot-tooltip.is-theme-dark"), "tooltip should keep dark theme styles");
assert(styles.includes(".acn-dot-tooltip.is-theme-light"), "tooltip should keep light theme styles");

assert(!content.includes("fetch("), "content.js must not upload data or call external services");
assert(!content.includes("XMLHttpRequest"), "content.js must not use XMLHttpRequest");

console.log("V2E 静态检查通过");
