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
const getPromptCacheKey = getFunctionBlock("getPromptCacheKey");
const resetPromptCacheForRoute = getFunctionBlock("resetPromptCacheForRoute");
const handleConversationRouteChange = getFunctionBlock("handleConversationRouteChange");
const renderPromptList = getFunctionBlock("renderPromptList");
const handlePromptClick = getFunctionBlock("handlePromptClick");

assert(content.includes("let activePromptCacheRouteKey = currentRouteKey"), "prompt cache should track the active route");
assert(content.includes("let accumulatedPrompts = []"), "prompt cache should keep accumulated prompts in memory");
assert(content.includes("let accumulatedPromptKeys = new Set()"), "prompt cache should keep in-memory seen keys");

assert(refreshPrompts.includes("const scannedPrompts = activeAdapter ? activeAdapter.getUserMessages() : []"), "refresh should keep the raw DOM scan separate");
assert(refreshPrompts.includes("mergeSeenPromptsForCurrentRoute(scannedPrompts)"), "refresh should merge DOM scans into the route cache");
assert(renderPromptList.includes("const messages = refreshPrompts()"), "render should use refreshed accumulated prompts");
assert(renderPromptList.includes("renderCompactTimeline(messages, pinnedKeys)"), "compact timeline should render accumulated prompts");

assert(mergeSeenPromptsForCurrentRoute.includes("getCurrentRouteKey()"), "merge should be scoped to the current route");
assert(mergeSeenPromptsForCurrentRoute.includes("resetPromptCacheForRoute(routeKey)"), "route mismatch should reset cache before merge");
assert(mergeSeenPromptsForCurrentRoute.includes("prompt.isMounted = true"), "currently scanned prompts should be marked mounted");
assert(mergeSeenPromptsForCurrentRoute.includes("cachedPrompt.isMounted = false"), "missing cached prompts should be marked unmounted");
assert(mergeSeenPromptsForCurrentRoute.includes("accumulatedPromptKeys.add(cacheKey)"), "new prompt keys should be remembered");
assert(mergeSeenPromptsForCurrentRoute.includes("return accumulatedPrompts"), "merge should return accumulated prompts");

assert(getPromptCacheKey.includes("data-message-id"), "stable key should prefer ChatGPT message ids");
assert(getPromptCacheKey.includes("hashText(prompt.text)"), "stable key should fall back to text hash");
assert(getPromptCacheKey.includes("routeKey"), "stable key should be route-scoped");
assert(resetPromptCacheForRoute.includes("accumulatedPrompts = []"), "route reset should clear accumulated prompts");
assert(resetPromptCacheForRoute.includes("accumulatedPromptKeys = new Set()"), "route reset should clear seen keys");
assert(handleConversationRouteChange.includes("resetPromptCacheForRoute(nextRouteKey)"), "conversation route changes should reset prompt cache");

assert(handlePromptClick.includes("!prompt.isMounted"), "unmounted cached prompts should not be navigated");
assert(handlePromptClick.includes("prompt target unavailable"), "unmounted prompt click should be handled without a wrong jump");
assert(!mergeSeenPromptsForCurrentRoute.includes("chrome.storage.local"), "prompt cache must not use chrome.storage.local");
assert(!mergeSeenPromptsForCurrentRoute.includes("saveCollectionsState"), "prompt cache must not write collections storage");

assert(content.includes("schemaVersion: 1"), "schemaVersion should remain 1");
assert(!content.includes("schemaVersion: 2"), "virtualized prompt cache must not migrate schemaVersion");
assert(!content.includes("ENABLE_SIDEBAR_COLLECTIONS_SHORTCUT"), "V4 sidebar shortcut flag must not return");
assert(!content.includes("findChatGPTSidebarMount"), "V4 sidebar mount code must not return");

[
  "function handlePromptClick(promptId, source, displayedIndex)",
  "function scrollToPromptElement(element, originalIndex)",
  "function manualScrollToElement(element, force)",
  "MutationObserver",
  "function renderCompactTimeline(messages, pinnedKeys)",
  "function createCompactDot({ prompt, pinned })",
  "function showCompactTooltip(dot, prompt)"
].forEach((needle) => {
  assert(content.includes(needle), `${needle} should remain`);
});

const documentClickListeners = content.match(/document\.addEventListener\("click"/g) || [];
assert(documentClickListeners.length === 1, "patch must not add another document click listener");
assert(!/window\.addEventListener\("click"/.test(content), "patch must not add a window click listener");
assert(!/document\.body\.addEventListener\("click"/.test(content), "patch must not add a body click listener");
assert.deepStrictEqual(manifest.content_scripts[0].matches, ["https://chatgpt.com/*"]);
assert(!JSON.stringify(manifest).includes("chat.deepseek.com"), "manifest must not enable DeepSeek");

console.log("V3 virtualized prompt cache 静态检查通过");
