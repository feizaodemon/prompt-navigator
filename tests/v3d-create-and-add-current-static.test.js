const assert = require("assert");
const fs = require("fs");

const content = fs.readFileSync("content.js", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");
const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));

assert(content.includes("function createCollectionFromInput("), "Collections view should create collections from the input");
assert(content.includes(".trim()"), "collection name should be trimmed before creation");
assert(content.includes("if (!collectionName)"), "empty collection name should not create a collection");
assert(content.includes("createCollectionDraft(collectionName)"), "create flow should reuse createCollectionDraft()");
assert(content.includes("collectionOrder: [...state.collectionOrder, collection.id]"), "create flow should append to collectionOrder");
assert(content.includes("saveCollectionsState(nextState)"), "create flow should save through saveCollectionsState()");
assert(content.includes("collectionNameInput.value = \"\""), "create flow should clear the input after saving");
assert(content.includes("renderCollectionsView()"), "create flow should refresh the collections view");
assert(content.includes("keydown"), "create input should support Enter");
assert(content.includes("event.key === \"Enter\""), "create input should create on Enter");

assert(content.includes("function addCurrentConversationToCollection("), "collection item should expose add current conversation logic");
assert(content.includes("getCurrentConversationMetadata()"), "add flow should read current ChatGPT conversation metadata");
assert(content.includes("addConversationToCollectionState(state, collectionId, conversationMetadata)"), "add flow should reuse addConversationToCollectionState()");
assert(content.includes("saveCollectionsState(nextState)"), "add flow should save through saveCollectionsState()");
assert(content.includes("createCollectionItem(collection, normalizedState)"), "collection item rendering should receive normalized state");
assert(content.includes("conversationIds.includes(currentConversationId)"), "collection item should detect already-added current conversation");
assert(content.includes("Add current"), "collection item should show an Add current action");
assert(content.includes("Added"), "collection item should expose added feedback");

assert(content.includes("collection.conversationIds.includes(savedConversationId)"), "add helper should avoid duplicate conversation ids in a collection");
assert(content.includes("savedConversation.collectionIds.includes(collectionId)"), "add helper should avoid duplicate collection ids in saved conversation");
assert(content.includes("savedConversation.lastVisitedAt = new Date().toISOString()"), "repeat add may refresh lastVisitedAt");
assert(content.includes("savedConversation.updatedAt = new Date().toISOString()"), "repeat add may refresh saved conversation updatedAt");

assert(content.includes('const COLLECTIONS_STORAGE_KEY = "aiConversationNavigatorCollections"'), "collections storage key should remain unchanged");
assert(content.includes('const PINNED_STORAGE_KEY = "aiConversationNavigatorPinnedPrompts"'), "pinned prompt storage key should remain unchanged");
assert(!content.includes("aiConversationNavigatorCollectionUi"), "V3D must not add a collections UI storage key");
assert(!content.includes("aiConversationNavigatorCollectionDrafts"), "V3D must not add collection draft storage keys");
assert(!content.includes("aiConversationNavigatorSavedConversation"), "V3D must not add saved conversation storage keys");

assert(!content.includes("renameCollection"), "V3D must not implement rename collection");
assert(!content.includes("deleteCollection"), "V3D must not implement delete collection");
assert(!content.includes("openSavedConversation"), "V3D must not implement saved conversation URL opening");
assert(!content.includes("collectionDetail"), "V3D must not implement collection detail view");
assert.deepStrictEqual(manifest.content_scripts[0].matches, ["https://chatgpt.com/*"]);
assert(!JSON.stringify(manifest).includes("chat.deepseek.com"), "manifest must not enable DeepSeek");

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

[
  ".acn-collection-create",
  ".acn-collection-input",
  ".acn-collection-create-button",
  ".acn-collection-action",
  ".acn-collection-status",
  ".acn-collection-count",
  ".acn-collection-updated"
].forEach((className) => {
  assert(styles.includes(className), `${className} should be styled`);
});

assert(!/^\s*body\s*\{/m.test(styles), "V3D should not add global body styles");
assert(!/^\s*button\s*\{/m.test(styles), "V3D should not add global button styles");
assert(!/^\s*input\s*\{/m.test(styles), "V3D should not add global input styles");

console.log("V3D create collection and add current conversation 静态检查通过");
