const assert = require("assert");
const fs = require("fs");

const content = fs.readFileSync("content.js", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");
const readme = fs.readFileSync("README.md", "utf8");
const roadmap = fs.readFileSync("docs/roadmap.md", "utf8");
const changeLog = fs.readFileSync("docs/change_log.md", "utf8");
const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));

assert(readme.includes("Conversation Collections"), "README should describe V3 Conversation Collections");
assert(readme.includes("Local persistence only"), "README should document local-only collections persistence");
assert(readme.includes("no full conversation content stored"), "README should document that full conversation content is not stored");
assert(!/V3\s*[:=]\s*prompt-level favorites/i.test(readme), "README must not describe V3 as prompt-level favorites");

["V3B", "V3C", "V3D", "V3E", "V3F", "V3G", "V3H"].forEach((phase) => {
  assert(roadmap.includes(phase), `roadmap should include ${phase}`);
});
assert(roadmap.includes("ChatGPT sidebar collections integration"), "roadmap should place sidebar collections integration in future V4");
assert(roadmap.includes("Gemini Voyager-like sidebar folder UI"), "roadmap should place Voyager-like folder UI in future V4");

assert(changeLog.includes("V3 MVP summary"), "change log should include a V3 MVP summary");
["V3B", "V3C", "V3D", "V3E", "V3F", "V3G", "V3H"].forEach((phase) => {
  assert(changeLog.includes(phase), `change log should include ${phase}`);
});

assert(fs.existsSync("docs/manual_test_checklist.md"), "manual test checklist should exist");
const manualChecklist = fs.readFileSync("docs/manual_test_checklist.md", "utf8");
[
  "V2 Regression",
  "V3 Collections Basic",
  "V3 Collection Detail",
  "V3 Management",
  "Page Load Stability",
  "Privacy and Storage"
].forEach((section) => {
  assert(manualChecklist.includes(section), `manual checklist should include ${section}`);
});

assert.deepStrictEqual(manifest.content_scripts[0].matches, ["https://chatgpt.com/*"]);
assert(!JSON.stringify(manifest).includes("chat.deepseek.com"), "manifest must not enable DeepSeek");
assert(content.includes('const COLLECTIONS_STORAGE_KEY = "aiConversationNavigatorCollections"'), "collections storage key should remain unchanged");
assert(content.includes("schemaVersion: 1"), "schemaVersion should remain 1");
assert(!content.includes("schemaVersion: 2"), "V3H must not introduce a new schemaVersion");

[
  "function handlePromptClick(promptId, source, displayedIndex)",
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

assert(!/^\s*body\s*\{/m.test(styles), "V3H should not add global body styles");
assert(!/^\s*button\s*\{/m.test(styles), "V3H should not add global button styles");
assert(!/^\s*input\s*\{/m.test(styles), "V3H should not add global input styles");
assert(!/^\s*a\s*\{/m.test(styles), "V3H should not add global anchor styles");

console.log("V3H docs and polish 静态检查通过");
