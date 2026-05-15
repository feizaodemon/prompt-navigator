const assert = require("assert");
const fs = require("fs");

const content = fs.readFileSync("content.js", "utf8");
const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));

function getFunctionBlock(name) {
  const start = content.indexOf(`function ${name}(`);
  assert(start >= 0, `${name} should exist`);
  let depth = 0;
  let inBlock = false;
  for (let index = start; index < content.length; index += 1) {
    const char = content[index];
    if (char === "{") {
      depth += 1;
      inBlock = true;
    } else if (char === "}") {
      depth -= 1;
      if (inBlock && depth === 0) {
        return content.slice(start, index + 1);
      }
    }
  }
  throw new Error(`${name} block should close`);
}

const scheduleUpdate = getFunctionBlock("scheduleUpdate");
const startObserver = getFunctionBlock("startObserver");
const handleActivePromptScroll = getFunctionBlock("handleActivePromptScroll");
const refreshPrompts = getFunctionBlock("refreshPrompts");
const extractChatGPTPrompts = getFunctionBlock("extractChatGPTPrompts");
const renderPromptList = getFunctionBlock("renderPromptList");

assert(content.includes("const ENABLE_SIDEBAR_COLLECTIONS_SHORTCUT = false"), "sidebar shortcut must remain disabled");
assert(scheduleUpdate.includes("handleConversationRouteChange()"), "scheduleUpdate should keep route refresh first");
assert(scheduleUpdate.includes("window.clearTimeout(updateTimer)"), "scheduleUpdate should keep V3 update debounce");
assert(scheduleUpdate.includes("updateTimer = window.setTimeout(() => renderPromptList(true), UPDATE_DELAY_MS)"), "scheduleUpdate should still schedule prompt rendering");
assert(scheduleUpdate.indexOf("updateTimer = window.setTimeout") < scheduleUpdate.indexOf("ENABLE_SIDEBAR_COLLECTIONS_SHORTCUT"), "sidebar guard should stay after core prompt update scheduling");
assert(!/if\s*\(\s*ENABLE_SIDEBAR_COLLECTIONS_SHORTCUT\s*\)\s*\{[\s\S]*?renderPromptList/.test(scheduleUpdate), "sidebar flag must not wrap prompt rendering");
assert(!/if\s*\(\s*!ENABLE_SIDEBAR_COLLECTIONS_SHORTCUT\s*\)[\s\S]*?return/.test(scheduleUpdate), "disabled sidebar must not return from scheduleUpdate");

assert(startObserver.includes("new MutationObserver(scheduleUpdate)"), "MutationObserver should still use scheduleUpdate");
assert(startObserver.includes("observer.observe(document.body"), "MutationObserver should still observe document.body");
assert(startObserver.includes("subtree: true"), "MutationObserver should still observe subtree changes");

assert(handleActivePromptScroll.includes("scheduleActivePromptUpdate()"), "scroll should still update active prompt");
assert(handleActivePromptScroll.includes("scheduleUpdate()"), "scroll should rescan prompts after lazy DOM changes");
assert(refreshPrompts.includes("activeAdapter ? activeAdapter.getUserMessages() : []"), "refreshPrompts should still use adapter extraction");
assert(refreshPrompts.includes("prompt count changed"), "prompt count changes should be logged at low frequency");
assert(extractChatGPTPrompts.includes('[data-message-author-role="user"]'), "ChatGPT prompt selector should remain");
assert(extractChatGPTPrompts.includes('article[data-testid^="conversation-turn"] [data-message-author-role="user"]'), "ChatGPT article prompt selector should remain");
assert(renderPromptList.includes("const messages = refreshPrompts()"), "renderPromptList should refresh prompts before rendering");
assert(renderPromptList.includes("renderCompactTimeline(messages, pinnedKeys)"), "compact timeline should render from refreshed messages");

[
  "function handlePromptClick(promptId, source, displayedIndex)",
  "function scrollToPromptElement(element, originalIndex)",
  "function manualScrollToElement(element, force)",
  "function renderCompactTimeline(messages, pinnedKeys)",
  "function createCompactDot({ prompt, pinned })",
  "function renderCollectionsView()"
].forEach((signature) => {
  assert(content.includes(signature), `${signature} should remain`);
});

const documentClickListeners = content.match(/document\.addEventListener\("click"/g) || [];
assert.strictEqual(documentClickListeners.length, 1, "V4B prompt regression fix should not add another document-level click listener");
assert(!content.includes('window.addEventListener("click"'), "V4B prompt regression fix should not add a window-level click listener");
assert(!content.includes('document.body.addEventListener("click"'), "V4B prompt regression fix should not add a body-level click listener");
assert(content.includes("schemaVersion: 1"), "schemaVersion should remain 1");
assert(!content.includes("schemaVersion: 2"), "schemaVersion must not be migrated");
assert.deepStrictEqual(manifest.content_scripts[0].matches, ["https://chatgpt.com/*"]);
assert(!JSON.stringify(manifest).includes("chat.deepseek.com"), "manifest must not enable DeepSeek");

console.log("V4B prompt update regression 静态检查通过");
