const assert = require("assert");
const fs = require("fs");

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

const findChatGPTSidebarMount = getFunctionBlock("findChatGPTSidebarMount");
const ensureSidebarCollectionsShortcut = getFunctionBlock("ensureSidebarCollectionsShortcut");
const openCollectionsPanelFromSidebar = getFunctionBlock("openCollectionsPanelFromSidebar");
const scheduleSidebarMountRefresh = getFunctionBlock("scheduleSidebarMountRefresh");
const scheduleUpdate = getFunctionBlock("scheduleUpdate");

assert(findChatGPTSidebarMount.includes("querySelectorAll(\"aside, nav"), "mount lookup should prefer stable sidebar containers");
assert(findChatGPTSidebarMount.includes('a[href^="/c/"], a[href*="/c/"]'), "mount lookup should use conversation links as a fallback signal");
assert(findChatGPTSidebarMount.includes("return null"), "mount lookup should safely return null");
assert(!findChatGPTSidebarMount.includes(".group") && !findChatGPTSidebarMount.includes(".flex"), "mount lookup should not depend on Tailwind utility classes");

assert(ensureSidebarCollectionsShortcut.includes("findChatGPTSidebarMount()"), "shortcut injection should use the mount lookup helper");
assert(ensureSidebarCollectionsShortcut.includes("if (!mount)"), "shortcut injection should return when no mount exists");
assert(ensureSidebarCollectionsShortcut.includes('querySelector(".acn-sidebar-shortcut")'), "shortcut injection should be idempotent");
assert(ensureSidebarCollectionsShortcut.includes('className = "acn-sidebar-shortcut"'), "shortcut wrapper should use acn-prefixed class");
assert(ensureSidebarCollectionsShortcut.includes('className = "acn-sidebar-shortcut-button"'), "shortcut button should use acn-prefixed class");
assert(ensureSidebarCollectionsShortcut.includes('textContent = "Collections"'), "shortcut label should be Collections");
assert(ensureSidebarCollectionsShortcut.includes('button.addEventListener("click"'), "shortcut should use a local click listener");
assert(ensureSidebarCollectionsShortcut.includes("event.preventDefault()"), "shortcut click should prevent native sidebar navigation");
assert(ensureSidebarCollectionsShortcut.includes("event.stopPropagation()"), "shortcut click should not bubble into ChatGPT sidebar handlers");
assert(ensureSidebarCollectionsShortcut.includes("openCollectionsPanelFromSidebar()"), "shortcut click should open the existing Collections panel");

assert(openCollectionsPanelFromSidebar.includes("showCollectionList()"), "sidebar open should default to the collection list");
assert(openCollectionsPanelFromSidebar.includes("setPromptPanelOpen(true)"), "sidebar open should open the right panel");
assert(openCollectionsPanelFromSidebar.includes("setPanelView(VIEW_COLLECTIONS)"), "sidebar open should switch to Collections tab");
assert(!openCollectionsPanelFromSidebar.includes("saveCollectionsState"), "sidebar open must not write storage");
assert(!openCollectionsPanelFromSidebar.includes("addCurrentConversationToCollection"), "sidebar open must not auto-add current conversation");

assert(scheduleSidebarMountRefresh.includes("requestAnimationFrame"), "sidebar refresh should be lightweight and deferred");
assert(scheduleSidebarMountRefresh.includes("ensureSidebarCollectionsShortcut()"), "sidebar refresh should ensure shortcut mount");
assert(scheduleUpdate.includes("scheduleSidebarMountRefresh()"), "existing mutation refresh cycle should schedule sidebar refresh");

assert(styles.includes(".acn-sidebar-shortcut"), "shortcut wrapper should have minimal scoped styles");
assert(styles.includes(".acn-sidebar-shortcut-button"), "shortcut button should have minimal scoped styles");
assert(!/^\s*body\s*\{/m.test(styles), "V4B should not add global body styles");
assert(!/^\s*button\s*\{/m.test(styles), "V4B should not add global button styles");
assert(!/^\s*nav\s*\{/m.test(styles), "V4B should not add global nav styles");
assert(!/^\s*aside\s*\{/m.test(styles), "V4B should not add global aside styles");

const documentClickListeners = content.match(/document\.addEventListener\("click"/g) || [];
assert.strictEqual(documentClickListeners.length, 1, "V4B should not add another document-level click listener");
assert(content.includes('document.addEventListener("click", handleOutsidePanelClick)'), "existing outside-panel click listener should remain");
assert(!content.includes('window.addEventListener("click"'), "V4B should not add a window-level click listener");
assert(!content.includes('document.body.addEventListener("click"'), "V4B should not add a body-level click listener");
assert(!content.includes("setInterval("), "V4B should not poll for sidebar state");

assert(content.includes('const COLLECTIONS_STORAGE_KEY = "aiConversationNavigatorCollections"'), "collections storage key should remain unchanged");
assert(content.includes('const PINNED_STORAGE_KEY = "aiConversationNavigatorPinnedPrompts"'), "pinned prompt storage key should remain unchanged");
assert(content.includes('const MODE_STORAGE_KEY = "aiConversationNavigatorMode"'), "navigator mode storage key should remain unchanged");
assert(!content.includes("aiConversationNavigatorSidebar"), "V4B must not add a sidebar storage key");
assert(content.includes("schemaVersion: 1"), "schemaVersion should remain 1");
assert(!content.includes("schemaVersion: 2"), "V4B must not migrate schemaVersion");

[
  "function handlePromptClick(promptId, source, displayedIndex)",
  "function scrollToPromptElement(element, originalIndex)",
  "function manualScrollToElement(element, force)",
  "function renderCollectionsView()",
  "function addCurrentConversationToCollection(collectionId, actionButton)",
  "function openSavedConversationUrl(savedConversation)"
].forEach((signature) => {
  assert(content.includes(signature), `${signature} should remain`);
});

assert.deepStrictEqual(manifest.content_scripts[0].matches, ["https://chatgpt.com/*"]);
assert(!JSON.stringify(manifest).includes("chat.deepseek.com"), "manifest must not enable DeepSeek");

console.log("V4B sidebar shortcut 静态检查通过");
