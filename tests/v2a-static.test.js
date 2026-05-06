const assert = require("assert");
const fs = require("fs");

const content = fs.readFileSync("content.js", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");
const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));

assert(content.includes("acn-search"), "content.js 应创建 prompt 搜索框");
assert(content.includes("filterMessagesByQuery"), "content.js 应通过独立函数过滤 prompt");
assert(content.includes("acn-refresh"), "content.js 应创建手动刷新按钮");
assert(content.includes("renderPromptList(false)"), "刷新按钮不应触发主聊天页面滚动");
assert(styles.includes(".acn-search"), "styles.css 应包含搜索框样式");
assert(styles.includes(".acn-refresh"), "styles.css 应包含刷新按钮样式");
assert.deepStrictEqual(manifest.content_scripts[0].matches, ["https://chatgpt.com/*"]);
assert(!content.includes("fetch("), "content.js 不应上传数据或请求外部服务");
assert(!content.includes("XMLHttpRequest"), "content.js 不应使用 XMLHttpRequest");

console.log("V2A 静态检查通过");
