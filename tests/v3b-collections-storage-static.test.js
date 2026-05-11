const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const content = fs.readFileSync("content.js", "utf8");
const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));

assert(content.includes('const COLLECTIONS_STORAGE_KEY = "aiConversationNavigatorCollections"'), "collections storage key should be defined");
assert(content.includes('const PINNED_STORAGE_KEY = "aiConversationNavigatorPinnedPrompts"'), "pinned prompt key should remain separate");
assert(!content.includes('const COLLECTIONS_STORAGE_KEY = "aiConversationNavigatorPinnedPrompts"'), "collections must not reuse pinned prompt storage");

assert(content.includes("function getCollectionsStorageKey()"), "storage key helper should exist");
assert(content.includes("schemaVersion: 1"), "default collections schema should use version 1");
assert(content.includes("collectionsById: {}"), "default schema should include collectionsById object");
assert(content.includes("savedConversationsById: {}"), "default schema should include savedConversationsById object");
assert(content.includes("collectionOrder: []"), "default schema should include collectionOrder array");

[
  "normalizeCollectionsState",
  "loadCollectionsState",
  "saveCollectionsState",
  "generateCollectionId",
  "generateSavedConversationId",
  "hashString",
  "getCanonicalConversationUrl",
  "parseChatGPTConversationId",
  "getCurrentConversationMetadata",
  "createCollectionDraft",
  "createSavedConversationDraft",
  "addConversationToCollectionState",
  "removeConversationFromCollectionState"
].forEach((functionName) => {
  assert(content.includes(`function ${functionName}(`), `${functionName} helper should exist`);
});

assert(content.includes('pathname.match(/^\\/c\\/([^/?#]+)/)'), "ChatGPT /c/<id> parser should read conversation id from pathname");
assert(content.includes("url.origin}${url.pathname"), "canonical URL should drop query and hash");
assert(content.includes('`conversation_${platform}_${safeMetadata.conversationId}`'), "saved conversation id should prefer platform and conversationId");
assert(content.includes('`conversation_${platform}_${hashString(safeMetadata.conversationUrl)}`'), "saved conversation id should fall back to stable URL hash");
assert(content.includes("collection.conversationIds.includes(savedConversationId)"), "add helper should avoid duplicate conversation membership");
assert(content.includes("savedConversation.collectionIds.includes(collectionId)"), "add helper should avoid duplicate collection membership");
assert(content.includes("filter((id) => id !== savedConversationId)"), "remove helper should remove conversation from one collection");
assert(content.includes("filter((id) => id !== collectionId)"), "remove helper should preserve other collection memberships");

assert(content.includes("document.title"), "conversation metadata should use document title");
assert(content.includes("Untitled ChatGPT conversation"), "metadata title should have a safe fallback");
assert(content.includes("currentPrompts[0]"), "metadata snippet may use the first extracted prompt");
assert(!content.includes("IndexedDB"), "collections storage must not use IndexedDB");
assert(!content.includes("localStorage."), "collections storage must not use window localStorage");

assert.deepStrictEqual(manifest.content_scripts[0].matches, ["https://chatgpt.com/*"]);
assert(!JSON.stringify(manifest).includes("chat.deepseek.com"), "manifest must not enable DeepSeek");

assert(content.includes("function handlePromptClick(promptId, source, displayedIndex)"), "direct scroll click entry signature must remain unchanged");
assert(content.includes("function scrollToPrompt(prompt, source)"), "scrollToPrompt signature must remain unchanged");
assert(content.includes("function scrollToPromptElement(element, originalIndex)"), "scrollToPromptElement signature must remain unchanged");
assert(content.includes("function manualScrollToElement(element, force)"), "manualScrollToElement signature must remain unchanged");
assert(content.includes("function verifyPromptVisible(element, originalIndex, correctionState)"), "verifyPromptVisible signature must remain unchanged");
assert(content.includes("function renderCompactTimeline(messages, pinnedKeys)"), "compact timeline entry signature must remain unchanged");
assert(content.includes("function createCompactDot({ prompt, pinned })"), "compact dot entry signature must remain unchanged");
assert(content.includes("function showCompactTooltip(dot, prompt)"), "compact tooltip entry signature must remain unchanged");

const helperExport = `
  globalThis.__v3bHelpers = {
    getCollectionsStorageKey,
    getDefaultCollectionsState,
    normalizeCollectionsState,
    generateSavedConversationId,
    hashString,
    getCanonicalConversationUrl,
    parseChatGPTConversationId,
    getCurrentConversationMetadata,
    createCollectionDraft,
    createSavedConversationDraft,
    addConversationToCollectionState,
    removeConversationFromCollectionState,
    __setCurrentPrompts: (prompts) => {
      currentPrompts = prompts;
    }
  };
`;
const testableContent = content.replace("  init();", helperExport);
const sandbox = {
  URL,
  console,
  Math,
  Date,
  location: {
    href: "https://chatgpt.com/c/abc123?x=1#y",
    origin: "https://chatgpt.com",
    pathname: "/c/abc123",
    hostname: "chatgpt.com"
  },
  document: {
    title: "Prompt Navigator - ChatGPT"
  }
};
vm.createContext(sandbox);
vm.runInContext(testableContent, sandbox);

const helpers = sandbox.__v3bHelpers;
const plain = (value) => JSON.parse(JSON.stringify(value));
assert.strictEqual(helpers.getCollectionsStorageKey(), "aiConversationNavigatorCollections");

const defaultState = plain(helpers.getDefaultCollectionsState());
assert.strictEqual(defaultState.schemaVersion, 1);
assert.deepStrictEqual(defaultState.collectionsById, {});
assert.deepStrictEqual(defaultState.savedConversationsById, {});
assert.deepStrictEqual(defaultState.collectionOrder, []);
assert.deepStrictEqual(plain(helpers.normalizeCollectionsState(null)), defaultState);
assert.doesNotThrow(() => helpers.normalizeCollectionsState({ collectionsById: [], savedConversationsById: "bad" }));

const partialState = plain(helpers.normalizeCollectionsState({
  collectionsById: {
    collection_a: {
      name: "A",
      conversationIds: ["conversation_chatgpt_abc123", "missing"]
    }
  },
  savedConversationsById: {
    conversation_chatgpt_abc123: {
      platform: "chatgpt",
      conversationUrl: "https://chatgpt.com/c/abc123",
      conversationId: "abc123",
      title: "Conversation",
      collectionIds: ["collection_a", "missing"]
    }
  }
}));
assert.deepStrictEqual(partialState.collectionOrder, ["collection_a"]);
assert.deepStrictEqual(partialState.collectionsById.collection_a.conversationIds, ["conversation_chatgpt_abc123"]);
assert.deepStrictEqual(partialState.savedConversationsById.conversation_chatgpt_abc123.collectionIds, ["collection_a"]);

assert.strictEqual(helpers.parseChatGPTConversationId("/c/abc123"), "abc123");
assert.strictEqual(helpers.parseChatGPTConversationId("/"), "");
assert.strictEqual(helpers.getCanonicalConversationUrl("https://chatgpt.com/c/abc?x=1#y"), "https://chatgpt.com/c/abc");

const metadata = {
  platform: "chatgpt",
  conversationUrl: "https://chatgpt.com/c/abc123",
  conversationId: "abc123",
  title: "Conversation",
  sourceTitle: "Conversation",
  snippet: "short prompt"
};
assert.strictEqual(helpers.generateSavedConversationId(metadata), "conversation_chatgpt_abc123");
const fallbackMetadata = { ...metadata, conversationId: "", conversationUrl: "https://chatgpt.com/g/g-test" };
assert.strictEqual(
  helpers.generateSavedConversationId(fallbackMetadata),
  helpers.generateSavedConversationId(fallbackMetadata),
  "fallback saved conversation id should be stable"
);
assert(helpers.generateSavedConversationId(fallbackMetadata).startsWith("conversation_chatgpt_"));

const collection = { ...helpers.createCollectionDraft("Prompt Navigator"), id: "collection_a" };
let state = helpers.normalizeCollectionsState({
  collectionsById: {
    collection_a: collection,
    collection_b: { ...helpers.createCollectionDraft("COLMAG Seminar"), id: "collection_b" }
  },
  savedConversationsById: {},
  collectionOrder: ["collection_a", "collection_b"]
});
state = helpers.addConversationToCollectionState(state, "collection_a", metadata);
state = helpers.addConversationToCollectionState(state, "collection_a", metadata);
state = helpers.addConversationToCollectionState(state, "collection_b", metadata);
assert.deepStrictEqual(plain(state.collectionsById.collection_a.conversationIds), ["conversation_chatgpt_abc123"]);
assert.deepStrictEqual(plain(state.collectionsById.collection_b.conversationIds), ["conversation_chatgpt_abc123"]);
assert.deepStrictEqual(plain(state.savedConversationsById.conversation_chatgpt_abc123.collectionIds).sort(), ["collection_a", "collection_b"]);

state = helpers.removeConversationFromCollectionState(state, "collection_a", "conversation_chatgpt_abc123");
assert.deepStrictEqual(plain(state.collectionsById.collection_a.conversationIds), []);
assert.deepStrictEqual(plain(state.collectionsById.collection_b.conversationIds), ["conversation_chatgpt_abc123"]);
assert.deepStrictEqual(plain(state.savedConversationsById.conversation_chatgpt_abc123.collectionIds), ["collection_b"]);

helpers.__setCurrentPrompts([{ text: "first prompt snippet should be short enough to store safely" }]);
const currentMetadata = helpers.getCurrentConversationMetadata();
assert.strictEqual(currentMetadata.platform, "chatgpt");
assert.strictEqual(currentMetadata.conversationUrl, "https://chatgpt.com/c/abc123");
assert.strictEqual(currentMetadata.conversationId, "abc123");
assert.strictEqual(currentMetadata.sourceTitle, "Prompt Navigator");
assert.strictEqual(currentMetadata.title, "Prompt Navigator");
assert(currentMetadata.snippet.length <= 120);

console.log("V3B collections storage 静态检查通过");
