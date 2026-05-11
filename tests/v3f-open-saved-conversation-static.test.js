const assert = require("assert");
const fs = require("fs");

const content = fs.readFileSync("content.js", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");
const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));

const savedConversationItemMatch = content.match(/function createSavedConversationItem\(savedConversation\) \{[\s\S]*?\n  \}/);
assert(savedConversationItemMatch, "content.js should render saved conversation items");
const savedConversationItem = savedConversationItemMatch[0];

assert(content.includes("function isSafeConversationUrl("), "V3F should include a saved conversation URL safety helper");
assert(content.includes("function openSavedConversationUrl("), "V3F should include an explicit saved conversation open helper");
assert(savedConversationItem.includes("acn-saved-conversation-actions"), "saved conversation item should include an explicit actions area");
assert(savedConversationItem.includes("acn-saved-conversation-open"), "saved conversation item should include an explicit Open action");
assert(savedConversationItem.includes("conversationUrl"), "Open action should be based on saved conversation conversationUrl");
assert(!savedConversationItem.includes('item.addEventListener("click"'), "saved conversation item body must not become implicitly clickable");
assert(!savedConversationItem.includes("showCollectionDetail("), "saved conversation item should not reuse collection detail navigation");
assert(!savedConversationItem.includes("handlePromptClick("), "saved conversation item should not reuse prompt navigation");

assert(content.includes('url.protocol === "https:"'), "URL safety should require https");
assert(content.includes('url.hostname === "chatgpt.com"'), "URL safety should require chatgpt.com hostname");
assert(content.includes('url.pathname.startsWith("/")'), "URL safety should validate the parsed path");
assert(!/javascript:\s*['"`]/i.test(content), "content.js should not introduce javascript URLs");
assert(!/http:\/\/chatgpt\.com/i.test(content), "content.js should not allow non-https ChatGPT URLs");
assert(!/chat\.deepseek\.com/i.test(content), "content.js should not add DeepSeek URL handling");

assert(content.includes('window.open(safeUrl, "_blank", "noopener,noreferrer")'), "Open behavior should use a new tab with noopener,noreferrer");
assert(content.includes("if (!safeUrl)"), "Open helper should not open when URL is missing or invalid");
assert(savedConversationItem.includes("openButton.disabled = true"), "invalid or missing conversationUrl should disable the Open action");
assert(savedConversationItem.includes("acn-saved-conversation-open-disabled"), "invalid Open action should have a disabled class");
assert(savedConversationItem.includes('openButton.type = "button"'), "Open action should be an explicit button");

assert(content.includes('const COLLECTIONS_STORAGE_KEY = "aiConversationNavigatorCollections"'), "collections storage key should remain unchanged");
assert(content.includes('const PINNED_STORAGE_KEY = "aiConversationNavigatorPinnedPrompts"'), "pinned prompt storage key should remain unchanged");
assert(!content.includes("aiConversationNavigatorCollectionOpen"), "V3F must not add an open action storage key");
assert(!content.includes("aiConversationNavigatorSavedConversationOpen"), "V3F must not add saved conversation open storage keys");
assert(!content.includes("aiConversationNavigatorCollectionUi"), "V3F must not add collections UI storage keys");
assert(!content.includes("saveCollectionsState(normalizedState)"), "detail render should remain read-only");
assert(!content.includes("renameCollection"), "V3F must not implement rename collection");
assert(!content.includes("deleteCollection"), "V3F must not implement delete collection");
assert(!content.includes("removeConversationFromCollection("), "V3F UI must not implement remove conversation action");

assert(content.includes("function handlePromptClick(promptId, source, displayedIndex)"), "prompt click entry should remain");
assert(content.includes("function scrollToPrompt(prompt, source)"), "scrollToPrompt should remain");
assert(content.includes("function scrollToPromptElement(element, originalIndex)"), "scrollToPromptElement should remain");
assert(content.includes("function manualScrollToElement(element, force)"), "manualScrollToElement should remain");
assert(content.includes("function verifyPromptVisible(element, originalIndex, correctionState)"), "verifyPromptVisible should remain");
assert(content.includes("function renderCompactTimeline(messages, pinnedKeys)"), "compact timeline render should remain");
assert(content.includes("function createCompactDot({ prompt, pinned })"), "compact dot creation should remain");
assert(content.includes("function showCompactTooltip(dot, prompt)"), "compact tooltip should remain");
assert(content.includes("acn-search"), "search panel core class should remain");
assert(content.includes("acn-compact-timeline"), "compact timeline class should remain");
assert.deepStrictEqual(manifest.content_scripts[0].matches, ["https://chatgpt.com/*"]);
assert(!JSON.stringify(manifest).includes("chat.deepseek.com"), "manifest must not enable DeepSeek");

[
  ".acn-saved-conversation-actions",
  ".acn-saved-conversation-open",
  ".acn-saved-conversation-open-disabled"
].forEach((className) => {
  assert(styles.includes(className), `${className} should be styled with acn prefix`);
});

assert(!/^\s*body\s*\{/m.test(styles), "V3F should not add global body styles");
assert(!/^\s*button\s*\{/m.test(styles), "V3F should not add global button styles");
assert(!/^\s*input\s*\{/m.test(styles), "V3F should not add global input styles");

console.log("V3F open saved conversation 静态检查通过");
