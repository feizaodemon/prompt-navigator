const assert = require("assert");
const fs = require("fs");

const content = fs.readFileSync("content.js", "utf8");
const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));

assert.deepStrictEqual(manifest.content_scripts[0].matches, ["https://chatgpt.com/*"]);
assert(!JSON.stringify(manifest).includes("chat.deepseek.com"), "manifest must not enable DeepSeek");

assert(content.includes("originalIndex"), "prompt records should preserve the original prompt index");
assert(content.includes("function handlePromptClick(promptId, source, displayedIndex)"), "click entry should receive source and displayed index for debug tracing");
assert(content.includes('debugNavigator("[PromptNavigator] prompt click"'), "click handler should log source/displayed/original index under debug flag");
assert(content.includes('debugNavigator("[PromptNavigator] scroll target"'), "jump should log resolved target and scroll container under debug flag");
assert(content.includes("function scrollToPromptElement(element, originalIndex)"), "jump should use an explicit prompt scroll helper");
assert(content.includes("function resolvePromptByOriginalIndex(originalIndex)"), "jump should re-resolve the latest target by original index");
assert(!content.includes("scrollIntoView("), "click navigation should not mix scrollIntoView with manual correction");
assert(content.includes("function manualScrollToElement(element, force)"), "click navigation should use one manual scroll calculation path");
assert(content.includes("SCROLL_CORRECTION_THRESHOLD_PX"), "small post-layout drift should be ignored to avoid visible bounce");
assert(content.includes("MAX_SCROLL_CORRECTION_PASSES"), "post-layout correction should be bounded");
assert(content.includes("window.requestAnimationFrame(() =>"), "precise positioning should wait for layout frames");
assert(content.includes('manualScrollToElement(latestElement, false)'), "second positioning pass should only use thresholded manual correction");
assert(content.includes("verifyPromptVisible(latestElement, originalIndex"), "jump should verify and correct first-click positioning");
assert(content.includes("function verifyPromptVisible(element, originalIndex,"), "content.js should provide bounded first-click correction");
assert(content.includes('debugNavigator("[PromptNavigator] click jump start"'), "debug mode should log click jump start");
assert(content.includes('debugNavigator("[PromptNavigator] manual positioning"'), "debug mode should log manual positioning");
assert(content.includes('debugNavigator("[PromptNavigator] precise positioning"'), "debug mode should log precise positioning");
assert(content.includes('debugNavigator("[PromptNavigator] correction check"'), "debug mode should log correction checks");
assert(content.includes("let delayedUpdateAfterProgrammaticScroll = false"), "MutationObserver refresh should be delayed during programmatic scroll");
assert(content.includes("delayedUpdateAfterProgrammaticScroll"), "programmatic scroll should not permanently skip prompt refreshes");
assert(content.includes("getScrollContainer()"), "click jump should use the same scroll container helper as active tracking");
assert(content.includes("isProgrammaticScrolling"), "programmatic scroll should temporarily suppress active tracking updates");
assert(content.includes("PROGRAMMATIC_SCROLL_LOCK_MS"), "programmatic scroll lock should have an explicit timeout");
assert(!content.includes("handlePromptClick(activePromptIndex"), "click navigation must not depend on activePromptIndex");

console.log("V2F navigation accuracy 静态检查通过");
