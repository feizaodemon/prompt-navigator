const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const content = fs.readFileSync("content.js", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");
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

const createCollectionItem = getFunctionBlock("createCollectionItem");
const renderCollectionDetailView = getFunctionBlock("renderCollectionDetailView");
const createSavedConversationItem = getFunctionBlock("createSavedConversationItem");
const renameCollectionFromInput = getFunctionBlock("renameCollectionFromInput");
const deleteCollection = getFunctionBlock("deleteCollection");
const removeSavedConversationFromCollection = getFunctionBlock("removeSavedConversationFromCollection");
const renameCollectionInState = getFunctionBlock("renameCollectionInState");
const deleteCollectionFromState = getFunctionBlock("deleteCollectionFromState");
const removeConversationFromCollectionState = getFunctionBlock("removeConversationFromCollectionState");

assert(content.includes("function renameCollectionInState(state, collectionId, nextName)"), "rename state helper should exist");
assert(renameCollectionInState.includes("nextName.trim()"), "rename helper should trim the next name");
assert(renameCollectionInState.includes("if (!trimmedName)"), "rename helper should reject empty names");
assert(renameCollectionInState.includes("collection.name = trimmedName"), "rename helper should update collection.name");
assert(renameCollectionInState.includes("collection.updatedAt = new Date().toISOString()"), "rename helper should update collection.updatedAt");
assert(renameCollectionFromInput.includes("saveCollectionsState(nextState)"), "rename UI should save through saveCollectionsState");
assert(createCollectionItem.includes("Rename"), "collection items should expose Rename action");
assert(renderCollectionDetailView.includes("Rename"), "detail header should expose Rename action");
assert(createCollectionItem.includes("event.stopPropagation()"), "collection item actions should not open detail");
assert(createCollectionItem.includes("event.preventDefault()"), "collection item actions should prevent default action");

assert(content.includes("function deleteCollectionFromState(state, collectionId)"), "delete state helper should exist");
assert(deleteCollectionFromState.includes("delete nextState.collectionsById[collectionId]"), "delete helper should remove collection record");
assert(deleteCollectionFromState.includes("collectionOrder.filter((id) => id !== collectionId)"), "delete helper should remove collection id from order");
assert(deleteCollectionFromState.includes("savedConversation.collectionIds.filter((id) => id !== collectionId)"), "delete helper should remove membership from saved conversations");
assert(deleteCollectionFromState.includes("delete nextState.savedConversationsById[savedConversation.id]"), "delete helper should clean orphan saved conversations");
assert(deleteCollection.includes("window.confirm"), "delete action should ask for confirmation");
assert(deleteCollection.includes("selectedCollectionId = \"\""), "deleting the active detail collection should return to list");
assert(deleteCollection.includes("saveCollectionsState(nextState)"), "delete UI should save through saveCollectionsState");

assert(createSavedConversationItem.includes("Remove"), "saved conversation items should expose Remove action");
assert(removeSavedConversationFromCollection.includes("window.confirm"), "remove action should ask for confirmation");
assert(removeSavedConversationFromCollection.includes("removeConversationFromCollectionState(state, collectionId, savedConversationId)"), "remove UI should reuse the V3B remove helper");
assert(removeSavedConversationFromCollection.includes("saveCollectionsState(nextState)"), "remove UI should save through saveCollectionsState");
assert(removeConversationFromCollectionState.includes("collection.conversationIds = collection.conversationIds.filter((id) => id !== savedConversationId)"), "remove helper should update collection membership");
assert(removeConversationFromCollectionState.includes("savedConversation.collectionIds = savedConversation.collectionIds.filter((id) => id !== collectionId)"), "remove helper should update saved conversation membership");
assert(removeConversationFromCollectionState.includes("delete nextState.savedConversationsById[savedConversationId]"), "remove helper should clean orphan saved conversations");
assert(createSavedConversationItem.includes("event.stopPropagation()"), "saved conversation actions should stop propagation");
assert(createSavedConversationItem.includes("event.preventDefault()"), "saved conversation actions should prevent default action");
assert(createSavedConversationItem.includes("openSavedConversationUrl(savedConversation)"), "Remove action should not replace Open action");

assert(content.includes('const COLLECTIONS_STORAGE_KEY = "aiConversationNavigatorCollections"'), "collections storage key should remain unchanged");
assert(content.includes('const PINNED_STORAGE_KEY = "aiConversationNavigatorPinnedPrompts"'), "pinned prompt storage key should remain unchanged");
assert(content.includes('const MODE_STORAGE_KEY = "aiConversationNavigatorMode"'), "navigator mode storage key should remain unchanged");
assert(!content.includes("aiConversationNavigatorCollectionUi"), "V3G must not add collection UI storage keys");
assert(!content.includes("aiConversationNavigatorCollectionManage"), "V3G must not add management storage keys");
assert(!content.includes("aiConversationNavigatorSavedConversationRemove"), "V3G must not add remove action storage keys");
assert(content.includes("schemaVersion: 1"), "schemaVersion must remain 1");
assert(!content.includes("schemaVersion: 2"), "V3G must not migrate schemaVersion");

["tags", "exportCollections", "importCollections", "cloudSync", "backend", "promptFavorite"].forEach((forbidden) => {
  assert(!content.includes(forbidden), `V3G must not implement ${forbidden}`);
});
assert.deepStrictEqual(manifest.content_scripts[0].matches, ["https://chatgpt.com/*"]);
assert(!JSON.stringify(manifest).includes("chat.deepseek.com"), "manifest must not enable DeepSeek");

const documentClickListeners = content.match(/document\.addEventListener\("click"/g) || [];
assert.strictEqual(documentClickListeners.length, 1, "V3G should not add another document-level click listener");
assert(content.includes('document.addEventListener("click", handleOutsidePanelClick)'), "existing outside-panel click listener should remain the only document click listener");
assert(!content.includes('window.addEventListener("click"'), "V3G should not add a window-level click listener");
assert(!content.includes('document.body.addEventListener("click"'), "V3G should not add a body-level click listener");

[
  "function handlePromptClick(promptId, source, displayedIndex)",
  "function scrollToPrompt(prompt, source)",
  "function scrollToPromptElement(element, originalIndex)",
  "function manualScrollToElement(element, force)",
  "function verifyPromptVisible(element, originalIndex, correctionState)",
  "function renderCompactTimeline(messages, pinnedKeys)",
  "function createCompactDot({ prompt, pinned })",
  "function showCompactTooltip(dot, prompt)",
  "function openSavedConversationUrl(savedConversation)"
].forEach((signature) => {
  assert(content.includes(signature), `${signature} should remain`);
});
assert(content.includes("acn-search"), "search panel core class should remain");
assert(content.includes("acn-compact-timeline"), "compact timeline class should remain");

[
  ".acn-collection-manage-actions",
  ".acn-collection-rename",
  ".acn-collection-delete",
  ".acn-collection-edit",
  ".acn-collection-edit-input",
  ".acn-collection-edit-actions",
  ".acn-collection-save",
  ".acn-collection-cancel",
  ".acn-saved-conversation-remove",
  ".acn-danger-action",
  ".acn-inline-status"
].forEach((className) => {
  assert(styles.includes(className), `${className} should be styled with acn prefix`);
});
assert(!/^\s*body\s*\{/m.test(styles), "V3G should not add global body styles");
assert(!/^\s*button\s*\{/m.test(styles), "V3G should not add global button styles");
assert(!/^\s*input\s*\{/m.test(styles), "V3G should not add global input styles");
assert(!/^\s*a\s*\{/m.test(styles), "V3G should not add global anchor styles");

const helperExport = `
  globalThis.__v3gHelpers = {
    getDefaultCollectionsState,
    normalizeCollectionsState,
    renameCollectionInState,
    deleteCollectionFromState,
    removeConversationFromCollectionState
  };
`;
const sandbox = {
  URL,
  console,
  Math,
  Date,
  location: {
    href: "https://chatgpt.com/c/abc123",
    origin: "https://chatgpt.com",
    pathname: "/c/abc123",
    hostname: "chatgpt.com"
  },
  document: {
    title: "ChatGPT"
  }
};
vm.createContext(sandbox);
vm.runInContext(content.replace("  init();", helperExport), sandbox);

const helpers = sandbox.__v3gHelpers;
const plain = (value) => JSON.parse(JSON.stringify(value));
const originalState = helpers.normalizeCollectionsState({
  collectionsById: {
    collection_a: {
      id: "collection_a",
      name: "Old",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      conversationIds: ["conversation_chatgpt_abc123"]
    },
    collection_b: {
      id: "collection_b",
      name: "Other",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      conversationIds: ["conversation_chatgpt_abc123"]
    }
  },
  savedConversationsById: {
    conversation_chatgpt_abc123: {
      id: "conversation_chatgpt_abc123",
      platform: "chatgpt",
      conversationUrl: "https://chatgpt.com/c/abc123",
      conversationId: "abc123",
      title: "Conversation",
      collectionIds: ["collection_a", "collection_b"]
    }
  },
  collectionOrder: ["collection_a", "collection_b"]
});

const renamed = helpers.renameCollectionInState(originalState, "collection_a", "  New name  ");
assert.strictEqual(renamed.collectionsById.collection_a.name, "New name");
assert.notStrictEqual(renamed.collectionsById.collection_a.updatedAt, originalState.collectionsById.collection_a.updatedAt);
const emptyRename = helpers.renameCollectionInState(originalState, "collection_a", "   ");
assert.strictEqual(emptyRename.collectionsById.collection_a.name, "Old");

let removed = helpers.removeConversationFromCollectionState(originalState, "collection_a", "conversation_chatgpt_abc123");
assert.deepStrictEqual(plain(removed.collectionsById.collection_a.conversationIds), []);
assert.deepStrictEqual(plain(removed.collectionsById.collection_b.conversationIds), ["conversation_chatgpt_abc123"]);
assert.deepStrictEqual(plain(removed.savedConversationsById.conversation_chatgpt_abc123.collectionIds), ["collection_b"]);
removed = helpers.removeConversationFromCollectionState(removed, "collection_b", "conversation_chatgpt_abc123");
assert.strictEqual(removed.savedConversationsById.conversation_chatgpt_abc123, undefined);

const deleted = helpers.deleteCollectionFromState(originalState, "collection_a");
assert.strictEqual(deleted.collectionsById.collection_a, undefined);
assert.deepStrictEqual(plain(deleted.collectionOrder), ["collection_b"]);
assert.deepStrictEqual(plain(deleted.savedConversationsById.conversation_chatgpt_abc123.collectionIds), ["collection_b"]);

console.log("V3G collection management 静态检查通过");
