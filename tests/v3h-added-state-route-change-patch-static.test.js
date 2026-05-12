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
const handleConversationRouteChange = getFunctionBlock("handleConversationRouteChange");
const refreshCurrentPanelForRouteChange = getFunctionBlock("refreshCurrentPanelForRouteChange");
const getCurrentRouteKey = getFunctionBlock("getCurrentRouteKey");
const renderCollectionsView = getFunctionBlock("renderCollectionsView");
const createCollectionItem = getFunctionBlock("createCollectionItem");
const addCurrentConversationToCollection = getFunctionBlock("addCurrentConversationToCollection");

assert(content.includes("let currentRouteKey = getCurrentRouteKey()"), "route key should be tracked from current location");
assert(getCurrentRouteKey.includes("getCanonicalConversationUrl()"), "route key should use canonical conversation URL");
assert(getCurrentRouteKey.includes("location.pathname"), "route key should include pathname as a route fallback");
assert(scheduleUpdate.includes("handleConversationRouteChange()"), "mutation refresh cycle should check route changes");
assert(handleConversationRouteChange.includes("const nextRouteKey = getCurrentRouteKey()"), "route handler should compute the latest route key");
assert(handleConversationRouteChange.includes("if (nextRouteKey === currentRouteKey)"), "route handler should ignore unchanged routes");
assert(handleConversationRouteChange.includes("currentRouteKey = nextRouteKey"), "route handler should update the tracked key after route changes");
assert(handleConversationRouteChange.includes("refreshCurrentPanelForRouteChange()"), "route changes should refresh route-dependent UI");
assert(refreshCurrentPanelForRouteChange.includes("activePanelView === VIEW_COLLECTIONS"), "active Collections tab should refresh on route change");
assert(refreshCurrentPanelForRouteChange.includes("renderCollectionsView()"), "Collections list should be re-rendered on route change");
assert(!handleConversationRouteChange.includes("saveCollectionsState"), "route changes must not write collections storage");
assert(!handleConversationRouteChange.includes("addCurrentConversationToCollection"), "route changes must not auto-add current conversation");

const unconditionalStorageReadOnMutation = /function scheduleUpdate\(\) \{[\s\S]*?loadCollectionsState\(/.test(scheduleUpdate);
assert(!unconditionalStorageReadOnMutation, "mutation callback should not unconditionally read collections storage");
assert(!content.includes("setInterval("), "patch should not add a high-frequency interval");

assert(createCollectionItem.includes("const conversationMetadata = getCurrentConversationMetadata()"), "collection item render should read fresh current metadata");
assert(createCollectionItem.includes("const currentConversationId = generateSavedConversationId(conversationMetadata)"), "Added state should use current metadata-derived id");
assert(createCollectionItem.includes("conversationIds.includes(currentConversationId)"), "Added state should be calculated against current conversation id");
assert(renderCollectionsView.includes("createCollectionItem(collection, normalizedState)"), "Collections render should rebuild items and add-state");
assert(addCurrentConversationToCollection.includes("const conversationMetadata = getCurrentConversationMetadata()"), "Add current should still save the current route metadata at click time");

[
  "function createCollectionFromInput()",
  "function addCurrentConversationToCollection(collectionId, actionButton)",
  "function renameCollectionFromInput(",
  "function deleteCollection(",
  "function removeSavedConversationFromCollection(",
  "function openSavedConversationUrl(savedConversation)",
  "function scrollToPrompt(prompt, source)",
  "function scrollToPromptElement(element, originalIndex)",
  "function manualScrollToElement(element, force)",
  "function verifyPromptVisible(element, originalIndex, correctionState)",
  "function renderCompactTimeline(messages, pinnedKeys)",
  "function createCompactDot({ prompt, pinned })",
  "function showCompactTooltip(dot, prompt)"
].forEach((signature) => {
  assert(content.includes(signature), `${signature} should remain`);
});

[
  "acn-search",
  "acn-compact-timeline",
  "acn-collection-action",
  "Add current",
  "Added"
].forEach((needle) => {
  assert(content.includes(needle), `${needle} should remain`);
});

assert(content.includes('const COLLECTIONS_STORAGE_KEY = "aiConversationNavigatorCollections"'), "collections storage key should remain unchanged");
assert(content.includes('const PINNED_STORAGE_KEY = "aiConversationNavigatorPinnedPrompts"'), "pinned prompt storage key should remain unchanged");
assert(content.includes('const MODE_STORAGE_KEY = "aiConversationNavigatorMode"'), "navigator mode storage key should remain unchanged");
assert(content.includes("schemaVersion: 1"), "schemaVersion should remain 1");
assert(!content.includes("schemaVersion: 2"), "patch must not migrate schemaVersion");
["aiConversationNavigatorCollectionUi", "cloudSync", "backend", "leftSidebar", "sidebarIntegration"].forEach((forbidden) => {
  assert(!content.includes(forbidden), `patch must not implement ${forbidden}`);
});
assert.deepStrictEqual(manifest.content_scripts[0].matches, ["https://chatgpt.com/*"]);
assert(!JSON.stringify(manifest).includes("chat.deepseek.com"), "manifest must not enable DeepSeek");

console.log("V3H added-state route-change patch 静态检查通过");
