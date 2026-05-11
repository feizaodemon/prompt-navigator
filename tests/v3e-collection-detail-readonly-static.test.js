const assert = require("assert");
const fs = require("fs");

const content = fs.readFileSync("content.js", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");
const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));

assert(content.includes("selectedCollectionId"), "detail view should track the selected collection id");
assert(content.includes("function renderCollectionDetailView("), "content.js should render collection detail view");
assert(content.includes("function showCollectionDetail("), "content.js should switch from collection list to detail");
assert(content.includes("function showCollectionList("), "content.js should provide Back behavior");
assert(content.includes("acn-collection-detail"), "content.js should create the collection detail container");
assert(content.includes("acn-collection-back-button"), "detail view should include a Back button");
assert(content.includes("acn-saved-conversation-list"), "detail view should render a saved conversation list");

assert(!content.includes("openSavedConversation"), "V3E must not implement saved conversation URL opening");
assert(!content.includes("window.open("), "V3E must not open saved conversation URLs");
assert(!content.includes("location.href = savedConversation"), "V3E must not navigate to saved conversation URLs");
assert(!content.includes("renameCollection"), "V3E must not implement rename collection");
assert(!content.includes("deleteCollection"), "V3E must not implement delete collection");
assert(!content.includes("removeConversationFromCollection("), "V3E UI must not implement remove conversation action");
assert(!content.includes("saveCollectionsState(normalizedState)"), "read-only detail render should not write normalized state");

assert(content.includes("userEditedTitle || savedConversation.sourceTitle || savedConversation.title || \"Untitled conversation\""), "saved conversation title should use requested fallback priority");
assert(content.includes("formatSavedConversationPlatform(savedConversation.platform)"), "saved conversation should display platform");
assert(content.includes("savedConversation.snippet"), "saved conversation should display optional snippet");
assert(content.includes("formatSavedConversationMetadata(savedConversation)"), "saved conversation should display metadata");
assert(content.includes("filter(Boolean)"), "detail view should skip missing saved conversation records safely");
assert(content.includes("\"No conversations in this collection yet\""), "detail view should include empty state for empty collections");

assert(content.includes("event.stopPropagation()"), "Add current click should not bubble into detail navigation");
assert(content.includes("showCollectionDetail(collection.id)"), "collection item body should navigate to detail");
assert(content.includes("addCurrentConversationToCollection(collection.id, action)"), "Add current should keep its add behavior");

assert(content.includes('const COLLECTIONS_STORAGE_KEY = "aiConversationNavigatorCollections"'), "collections storage key should remain unchanged");
assert(content.includes('const PINNED_STORAGE_KEY = "aiConversationNavigatorPinnedPrompts"'), "pinned prompt storage key should remain unchanged");
assert(!content.includes("aiConversationNavigatorCollectionUi"), "V3E must not add a collections UI storage key");
assert(!content.includes("aiConversationNavigatorCollectionDetail"), "V3E must not add a detail storage key");
assert(!content.includes("aiConversationNavigatorSavedConversationDetail"), "V3E must not add saved conversation detail storage keys");

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
  ".acn-collection-detail",
  ".acn-collection-detail-header",
  ".acn-collection-back-button",
  ".acn-collection-detail-title",
  ".acn-saved-conversation-list",
  ".acn-saved-conversation-item",
  ".acn-saved-conversation-title",
  ".acn-saved-conversation-meta",
  ".acn-saved-conversation-snippet",
  ".acn-saved-conversation-url",
  ".acn-collection-detail-empty"
].forEach((className) => {
  assert(styles.includes(className), `${className} should be styled with acn prefix`);
});

assert(!/^\s*body\s*\{/m.test(styles), "V3E should not add global body styles");
assert(!/^\s*button\s*\{/m.test(styles), "V3E should not add global button styles");
assert(!/^\s*input\s*\{/m.test(styles), "V3E should not add global input styles");

console.log("V3E collection detail read-only 静态检查通过");
