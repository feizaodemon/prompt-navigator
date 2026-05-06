const assert = require("assert");
const fs = require("fs");

const content = fs.readFileSync("content.js", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");
const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));

assert(Array.isArray(manifest.permissions), "manifest.json 应包含 permissions 数组");
assert(manifest.permissions.includes("storage"), "manifest.json 应声明 storage 权限用于本地保存 pinned prompt");
assert.deepStrictEqual(manifest.content_scripts[0].matches, ["https://chatgpt.com/*"]);

assert(content.includes("chrome.storage.local"), "content.js 应使用 chrome.storage.local 保存 pinned 状态");
assert(content.includes("PINNED_STORAGE_KEY"), "content.js 应定义 pinned prompt 的本地存储 key");
assert(content.includes("acn-pinned-section"), "content.js 应创建 Pinned 区域");
assert(content.includes("acn-pin-button"), "content.js 应为 prompt item 创建 pin 按钮");
assert(content.includes("activePromptKey"), "content.js 应维护当前 active prompt 状态");
assert(content.includes("setActivePrompt"), "content.js 应通过独立函数更新 active 状态");
assert(content.includes("getPromptKey"), "content.js 应使用稳定 prompt key 恢复 pinned 状态");

assert(styles.includes(".acn-pinned-section"), "styles.css 应包含 Pinned 区域样式");
assert(styles.includes(".acn-pin-button"), "styles.css 应包含 pin 按钮样式");
assert(styles.includes(".acn-item.is-active"), "styles.css 应包含 active prompt 样式");

assert(!content.includes("fetch("), "content.js 不应上传数据或请求外部服务");
assert(!content.includes("XMLHttpRequest"), "content.js 不应使用 XMLHttpRequest");
assert(!JSON.stringify(manifest).includes("chat.deepseek.com"), "manifest.json 不应重新启用 DeepSeek");

console.log("V2B 静态检查通过");
