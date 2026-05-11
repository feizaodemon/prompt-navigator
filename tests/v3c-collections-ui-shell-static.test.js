const assert = require("assert");
const fs = require("fs");

const content = fs.readFileSync("content.js", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");
const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));

assert(content.includes("VIEW_PROMPTS"), "content.js should define a prompts view");
assert(content.includes("VIEW_COLLECTIONS"), "content.js should define a collections view");
assert(content.includes("let activePanelView = VIEW_PROMPTS"), "panel should default to prompts view");
assert(content.includes("function createViewTab("), "content.js should create panel view tabs");
assert(content.includes("function setPanelView(view)"), "content.js should switch panel views");
assert(content.includes("function renderCollectionsView()"), "content.js should render the collections view shell");
assert(content.includes("function createCollectionItem("), "content.js should render collection list items");
assert(content.includes("function formatCollectionUpdatedAt("), "content.js should format optional updatedAt metadata");
assert(content.includes('createViewTab("Prompts", VIEW_PROMPTS)'), "Prompts tab should exist");
assert(content.includes('createViewTab("Collections", VIEW_COLLECTIONS)'), "Collections tab should exist");
assert(content.includes('"No collections yet"'), "collections empty state should exist");
assert(content.includes('"Collections will let you group related conversations by topic."'), "collections shell should explain empty state");
assert(content.includes("collectionNameInput"), "collection create input should be wired into the collections shell");
assert(content.includes("createCollectionFromInput"), "collections shell should expose V3D create flow");

assert(content.includes("loadCollectionsState().then"), "collections view should reuse loadCollectionsState()");
assert(content.includes("normalizeCollectionsState(state)"), "collections view should normalize loaded collections state");
assert(content.includes('const COLLECTIONS_STORAGE_KEY = "aiConversationNavigatorCollections"'), "collections storage key should remain unchanged");
assert(!content.includes("aiConversationNavigatorCollectionUi"), "V3C must not add a second collections storage key");
assert(!content.includes("aiConversationNavigatorCollectionDrafts"), "V3C must not add draft storage keys");

assert(!content.includes("createCollectionFromUi"), "collections UI should not add a second create flow");
assert(!content.includes("deleteCollection"), "V3C must not implement delete collection UI writes");

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
  ".acn-view-tabs",
  ".acn-view-tab",
  ".acn-view-tab-active",
  ".acn-collections-view",
  ".acn-collections-empty",
  ".acn-collection-list",
  ".acn-collection-item",
  ".acn-collection-title",
  ".acn-collection-meta"
].forEach((className) => {
  assert(styles.includes(className), `${className} should be styled`);
});

assert(!/^\s*body\s*\{/m.test(styles), "V3C should not add global body styles");
assert(!/^\s*button\s*\{/m.test(styles), "V3C should not add global button styles");
assert(!/^\s*input\s*\{/m.test(styles), "V3C should not add global input styles");

console.log("V3C collections UI shell 静态检查通过");
