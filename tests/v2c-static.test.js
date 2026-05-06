const assert = require("assert");
const fs = require("fs");

const content = fs.readFileSync("content.js", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");
const readme = fs.readFileSync("README.md", "utf8");
const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));

assert.deepStrictEqual(manifest.content_scripts[0].matches, ["https://chatgpt.com/*"]);
assert(manifest.permissions.includes("storage"), "manifest.json 应保留 storage 权限");

assert(content.includes("MODE_STORAGE_KEY"), "content.js 应定义 compact/expanded 模式存储 key");
assert(content.includes("navigatorMode"), "content.js 应维护当前显示模式");
assert(content.includes("let navigatorMode = MODE_COMPACT"), "V2C 默认应显示 compact timeline");
assert(content.includes("loadNavigatorMode"), "content.js 应读取上次选择的显示模式");
assert(content.includes("saveNavigatorMode"), "content.js 应保存上次选择的显示模式");
assert(content.includes("acn-panel"), "content.js 应创建搜索 / prompt list 浮动面板");
assert(content.includes("togglePromptPanel"), "content.js 应提供打开 / 关闭 prompt list 面板的按钮逻辑");
assert(content.includes("handleOutsidePanelClick"), "content.js 应支持点击面板外部关闭");
assert(content.includes("is-panel-open"), "content.js 应通过状态 class 控制浮动面板显示");
assert(content.includes("detectChatGPTTheme"), "content.js 应检测 ChatGPT 当前主题");
assert(content.includes("applyPromptNavigatorTheme"), "content.js 应把主题应用到 Prompt Navigator");
assert(content.includes("observeChatGPTThemeChanges"), "content.js 应监听 ChatGPT 主题变化");
assert(content.includes("parseRgbColor"), "content.js 应能解析页面背景色");
assert(content.includes("getColorTheme"), "content.js 应通过背景亮度判断 light/dark");
assert(content.includes('matchMedia("(prefers-color-scheme: dark)")'), "matchMedia 只能作为主题检测兜底");
assert(content.includes("[Prompt Navigator][Theme] detected:"), "主题检测应输出 detected 调试日志");
assert(content.includes("[Prompt Navigator][Theme] body background:"), "主题检测应输出 body background 调试日志");
assert(content.includes("[Prompt Navigator][Theme] changed:"), "主题变化时应输出 changed 调试日志");
assert(content.includes("acn-mode-toggle"), "content.js 应创建模式切换按钮");
assert(content.includes("acn-compact-timeline"), "content.js 应创建 compact timeline 容器");
assert(content.includes("createCompactDot"), "content.js 应用圆点渲染 compact prompt");
assert(content.includes("acn-dot-tooltip"), "content.js 应为圆点创建 hover preview tooltip");
assert(content.includes("showCompactTooltip"), "content.js 应通过 mouseenter 显示 body 级 compact tooltip");
assert(content.includes("hideCompactTooltip"), "content.js 应通过 mouseleave 隐藏 compact tooltip");
assert(content.includes("compactTooltipFrame"), "content.js 应记录并取消 pending requestAnimationFrame");
assert(content.includes("window.requestAnimationFrame"), "compact tooltip 应等待下一帧再测量真实尺寸");
assert(content.includes("window.cancelAnimationFrame"), "mouseleave 时应取消 pending tooltip 布局");
assert(content.includes("layoutCompactTooltip"), "content.js 应通过独立函数计算 tooltip 位置");
assert(content.includes('addEventListener("mouseenter"'), "compact 圆点应绑定 mouseenter");
assert(content.includes('addEventListener("mouseleave"'), "compact 圆点应绑定 mouseleave");
assert(content.includes("document.body.appendChild(compactTooltip)"), "compact tooltip 应 append 到 document.body");
assert(content.includes("getBoundingClientRect()"), "compact tooltip 应根据 dot 位置计算 fixed 坐标");
assert(content.includes("[Prompt Navigator][Compact Tooltip] show"), "hover 时应输出 compact tooltip show 调试日志");
assert(content.includes("[Prompt Navigator][Compact Tooltip] layout"), "定位时应输出 compact tooltip layout 调试日志");
assert(content.includes("window.innerWidth - tooltipRect.width - viewportPadding"), "tooltip left 应限制在视口内");
assert(content.includes("window.innerHeight - tooltipRect.height - viewportPadding"), "tooltip top 应限制在视口内");
assert(content.includes("Prompt ${promptNumber}"), "tooltip 应显示 prompt 编号");
assert(content.includes("scrollToMessage(message.element, promptKey)"), "compact 圆点点击后应跳转到对应 prompt");
assert(content.includes("is-pinned"), "compact 圆点应能标记 pinned 状态");
assert(content.includes("is-active"), "compact 圆点应能标记 active 状态");

assert(styles.includes("#ai-conversation-navigator.is-compact"), "styles.css 应包含 compact 容器样式");
assert(styles.includes("max-height: calc(100vh - 160px)"), "compact timeline 高度应基于浏览器视口");
assert(styles.includes(".acn-panel"), "styles.css 应包含搜索 / prompt list 浮动面板样式");
assert(styles.includes("right: calc(100% + 10px)"), "浮动面板应显示在 timeline 左侧");
assert(styles.includes("max-height: calc(100vh - 120px)"), "浮动面板高度不应超过浏览器视口");
assert(styles.includes("#ai-conversation-navigator.is-panel-open .acn-panel"), "面板应只在打开状态显示");
[
  "--pn-bg",
  "--pn-bg-elevated",
  "--pn-border",
  "--pn-text",
  "--pn-text-muted",
  "--pn-dot",
  "--pn-dot-active",
  "--pn-dot-pinned",
  "--pn-scrollbar-track",
  "--pn-scrollbar-thumb",
  "--pn-scrollbar-thumb-hover",
  "--pn-tooltip-bg",
  "--pn-tooltip-text",
  "--pn-tooltip-border",
  "--pn-shadow"
].forEach((variableName) => {
  assert(styles.includes(variableName), `styles.css 应定义并使用 ${variableName}`);
});
assert(styles.includes(".is-theme-light"), "styles.css 应包含 light theme 变量");
assert(styles.includes(".is-theme-dark"), "styles.css 应包含 dark theme 变量");
assert(styles.includes("scrollbar-width: thin"), "滚动区域应使用细滚动条");
assert(styles.includes("scrollbar-color: var(--pn-scrollbar-thumb) var(--pn-scrollbar-track)"), "滚动条颜色应跟随主题变量");
assert(styles.includes("::-webkit-scrollbar"), "应适配 WebKit 滚动条");
assert(styles.includes("::-webkit-scrollbar-track"), "应适配 WebKit 滚动条 track");
assert(styles.includes("::-webkit-scrollbar-thumb"), "应适配 WebKit 滚动条 thumb");
assert(styles.includes("width: 36px"), "compact 宽度应控制在 28px 到 44px 左右");
assert(styles.includes(".acn-compact-timeline"), "styles.css 应包含 compact timeline 样式");
assert(styles.includes(".acn-compact-dot"), "styles.css 应包含 compact 圆点样式");
assert(styles.includes(".acn-dot-tooltip"), "styles.css 应包含 tooltip 样式");
assert(styles.includes("position: fixed"), "tooltip 应使用 fixed 定位避免被 compact sidebar 裁剪");
assert(styles.includes("z-index: 1000000"), "tooltip z-index 应高于 sidebar 和 ChatGPT 页面");
assert(styles.includes("max-width: 280px"), "tooltip 应限制最大宽度");
assert(styles.includes("min-width: 180px"), "tooltip 应设置稳定最小宽度");
assert(styles.includes("box-sizing: border-box"), "tooltip 尺寸应包含 padding 和 border");
assert(styles.includes("white-space: normal"), "tooltip 应允许正常换行");
assert(styles.includes("word-break: break-word"), "tooltip 应处理长英文、URL 或代码串");
assert(styles.includes("pointer-events: none"), "tooltip 不应遮挡圆点 hover 或点击");
assert(styles.includes(".acn-compact-dot.is-active"), "styles.css 应包含 compact active 高亮样式");
assert(styles.includes(".acn-compact-dot.is-pinned"), "styles.css 应包含 compact pinned 标记样式");

assert(readme.includes("Compact Timeline Mode"), "README.md 应说明 compact timeline mode");
assert(readme.includes("expanded mode"), "README.md 应说明如何切回 expanded mode");
assert(readme.includes("prompt preview"), "README.md 应说明 hover 查看 prompt preview");

assert(!content.includes("fetch("), "content.js 不应上传数据或请求外部服务");
assert(!content.includes("XMLHttpRequest"), "content.js 不应使用 XMLHttpRequest");
assert(!JSON.stringify(manifest).includes("chat.deepseek.com"), "manifest.json 不应重新启用 DeepSeek");

console.log("V2C 静态检查通过");
