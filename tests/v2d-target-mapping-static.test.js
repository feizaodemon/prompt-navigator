const assert = require("assert");
const fs = require("fs");

const content = fs.readFileSync("content.js", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");
const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));

assert.deepStrictEqual(manifest.content_scripts[0].matches, ["https://chatgpt.com/*"]);
assert(!JSON.stringify(manifest).includes("chat.deepseek.com"), "manifest must not enable DeepSeek");

assert(content.includes("const DEBUG_NAVIGATOR = false"), "debug flag should stay off by default");
assert(content.includes("let currentPrompts = []"), "content.js should maintain one current prompt list");
assert(content.includes("function buildPromptRecord"), "scan results should be normalized to prompt records");
assert(content.includes("prompt.index"), "timeline / list / pinned should use original prompt index");
assert(content.includes("prompt.preview"), "tooltip and list should use prompt preview from the same record");
assert(content.includes("function handlePromptClick(promptId"), "all click entries should use handlePromptClick(promptId)");
assert(content.includes("findPromptById(promptId)"), "click should resolve prompt by id from current prompts");
assert(content.includes("refreshPrompts()"), "click should rescan DOM if element is stale");
assert(content.includes("scrollToPrompt(prompt, source)"), "jump should receive one resolved prompt object");
assert(content.includes("dot.dataset.promptId = prompt.id"), "compact dot should store stable data-prompt-id");
assert(content.includes('dot.addEventListener("click", handleCompactDotClick)'), "compact dot should bind explicit click handler");
assert(content.includes("function handleCompactDotClick(event)"), "content.js should provide compact dot click handler");
assert(content.includes("event.preventDefault()"), "compact dot click should prevent default behavior");
assert(content.includes("event.stopPropagation()"), "compact dot click should stop bubbling interference");
assert(content.includes("handlePromptClick(promptId)"), "compact dot click should call the same unified jump entry as prompt list");
assert(content.includes('compactTimeline.addEventListener("click", handleCompactTimelineClick)'), "dots container should keep click delegation fallback");
assert(content.includes("function handleCompactTimelineClick(event)"), "content.js should provide compact timeline delegated click handler");
assert(content.includes('event.target.closest(".acn-compact-dot")'), "delegated click should find the concrete dot target");
assert(content.includes('debugNavigator("compact dot clicked"'), "DEBUG_NAVIGATOR=true should log compact dot clicks");
assert(content.includes('debugNavigator("jump requested"'), "DEBUG_NAVIGATOR=true should log jump requests");
assert(content.includes('item.addEventListener("click", () => handlePromptClick(promptId))'), "prompt list click should use handlePromptClick");
assert(content.includes('item.addEventListener("click", () => handlePromptClick(promptId, "pinned"))'), "pinned click should use handlePromptClick");
assert(!content.includes("scrollToMessage(message.element"), "code should not bypass unified jump entry");

assert(styles.includes("pointer-events: auto"), "compact dot should explicitly receive pointer events");
assert(styles.includes("z-index: 3"), "compact dot should stay above timeline background");
assert(styles.includes("--pn-compact-header-height: 36px"), "compact rail should define fixed top button area");
assert(styles.includes("height: var(--pn-compact-header-height)"), "top button area should keep fixed height");
assert(styles.includes("z-index: 20"), "search / prompt list button area should stay above dots");
assert(styles.includes("margin-top: var(--pn-compact-header-height)"), "dots area should start below button area");
assert(styles.includes("height: calc(100vh - var(--pn-compact-header-height))"), "dots area height should exclude button area");
assert(styles.includes(".acn-compact-dot::after"), "compact dot should use larger button hit area and smaller visual dot");
assert(styles.includes("width: 24px"), "compact dot hit area width should exceed visual dot");
assert(styles.includes("height: 24px"), "compact dot hit area height should exceed visual dot");

assert(!content.includes("fetch("), "content.js must not upload data or call external services");
assert(!content.includes("XMLHttpRequest"), "content.js must not use XMLHttpRequest");

console.log("V2D target mapping 静态检查通过");
