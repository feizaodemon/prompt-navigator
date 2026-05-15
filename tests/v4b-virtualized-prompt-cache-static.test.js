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

const refreshPrompts = getFunctionBlock("refreshPrompts");
const mergeSeenPromptsForCurrentRoute = getFunctionBlock("mergeSeenPromptsForCurrentRoute");
const resetSeenPromptCacheForRoute = getFunctionBlock("resetSeenPromptCacheForRoute");
const getSeenPromptStableKey = getFunctionBlock("getSeenPromptStableKey");
const handleConversationRouteChange = getFunctionBlock("handleConversationRouteChange");
const handlePromptClick = getFunctionBlock("handlePromptClick");

assert(content.includes("let activePromptCacheRouteKey = \"\""), "active prompt cache route key should exist");
assert(content.includes("let accumulatedPrompts = []"), "accumulated prompt cache should exist");
assert(content.includes("let accumulatedPromptKeys = new Set()"), "prompt cache dedupe set should exist");
assert(content.includes("function mergeSeenPromptsForCurrentRoute(scannedPrompts)"), "merge helper should exist");
assert(content.includes("function resetSeenPromptCacheForRoute(routeKey)"), "route reset helper should exist");
assert(content.includes("function getSeenPromptStableKey(prompt)"), "stable key helper should exist");

assert(refreshPrompts.includes("const scannedPrompts = activeAdapter ? activeAdapter.getUserMessages() : []"), "refreshPrompts should scan current DOM snapshot");
assert(refreshPrompts.includes("mergeSeenPromptsForCurrentRoute(scannedPrompts)"), "refreshPrompts should render accumulated prompts");
assert(!refreshPrompts.includes("currentPrompts = activeAdapter ? activeAdapter.getUserMessages() : []"), "refreshPrompts should not replace cache with only current DOM snapshot");
assert(mergeSeenPromptsForCurrentRoute.includes("getCurrentRouteKey()"), "merge should use current route key");
assert(mergeSeenPromptsForCurrentRoute.includes("resetSeenPromptCacheForRoute(routeKey)"), "merge should reset when route changes");
assert(mergeSeenPromptsForCurrentRoute.includes("accumulatedPromptKeys.has(stableKey)"), "merge should dedupe seen prompts");
assert(mergeSeenPromptsForCurrentRoute.includes("accumulatedPrompts.push"), "merge should accumulate new prompts");
assert(mergeSeenPromptsForCurrentRoute.includes("prompt-cache"), "merge should log prompt cache diagnostics");
assert(resetSeenPromptCacheForRoute.includes("accumulatedPrompts = []"), "route reset should clear accumulated prompts");
assert(resetSeenPromptCacheForRoute.includes("accumulatedPromptKeys = new Set()"), "route reset should clear dedupe set");
assert(handleConversationRouteChange.includes("resetSeenPromptCacheForRoute(nextRouteKey)"), "route changes should reset prompt cache");
assert(getSeenPromptStableKey.includes("data-message-id"), "stable key should prefer message id attributes");
assert(getSeenPromptStableKey.includes("hashText(prompt.text)"), "stable key should fall back to text hash");

assert(handlePromptClick.includes("prompt.element.isConnected"), "click handler should guard unmounted cached prompts");
assert(handlePromptClick.includes("not currently mounted"), "unmounted cached prompt should not jump to another prompt");
assert(content.includes("const ENABLE_SIDEBAR_COLLECTIONS_SHORTCUT = false"), "sidebar shortcut must remain disabled");

const saveCollectionsStateCalls = (content.match(/saveCollectionsState\(/g) || []).length;
assert(saveCollectionsStateCalls > 0, "existing V3 storage helpers should remain");
assert(!mergeSeenPromptsForCurrentRoute.includes("saveCollectionsState"), "prompt cache must not write collections storage");
assert(!mergeSeenPromptsForCurrentRoute.includes("chrome.storage"), "prompt cache must not write extension storage");
assert(content.includes("schemaVersion: 1"), "schemaVersion should remain 1");
assert(!content.includes("schemaVersion: 2"), "schemaVersion must not change");

[
  "function handlePromptClick(promptId, source, displayedIndex)",
  "function scrollToPromptElement(element, originalIndex)",
  "function manualScrollToElement(element, force)"
].forEach((signature) => {
  assert(content.includes(signature), `${signature} should remain`);
});

const documentClickListeners = content.match(/document\.addEventListener\("click"/g) || [];
assert.strictEqual(documentClickListeners.length, 1, "virtualized prompt cache should not add document-level click listeners");
assert(!content.includes('window.addEventListener("click"'), "virtualized prompt cache should not add a window-level click listener");
assert(!content.includes('document.body.addEventListener("click"'), "virtualized prompt cache should not add a body-level click listener");
assert.deepStrictEqual(manifest.content_scripts[0].matches, ["https://chatgpt.com/*"]);
assert(!JSON.stringify(manifest).includes("chat.deepseek.com"), "manifest must not enable DeepSeek");

console.log("V4B virtualized prompt cache 静态检查通过");
