(function () {
  "use strict";

  const NAVIGATOR_ID = "ai-conversation-navigator";
  const HIGHLIGHT_CLASS = "ai-conversation-navigator-target";
  const MAX_PREVIEW_LENGTH = 50;
  const UPDATE_DELAY_MS = 300;
  const HIGHLIGHT_DELAY_MS = 1600;

  let activeAdapter = null;
  let root = null;
  let list = null;
  let emptyState = null;
  let observer = null;
  let updateTimer = null;
  let collapsed = false;

  const platformAdapters = {
    chatgpt: {
      name: "ChatGPT",
      match: () => location.hostname === "chatgpt.com" || location.hostname.endsWith(".chatgpt.com"),
      getUserMessages: extractChatGPTPrompts
    },
    deepseek: {
      name: "DeepSeek",
      match: () => location.hostname === "chat.deepseek.com",
      getUserMessages: extractDeepSeekPrompts
    }
  };

  function extractChatGPTPrompts() {
    const elements = uniqueElements([
      ...document.querySelectorAll('[data-message-author-role="user"]'),
      ...document.querySelectorAll('article[data-testid^="conversation-turn"] [data-message-author-role="user"]')
    ]);

    return normalizeMessages(elements, "chatgpt");
  }

  function extractDeepSeekPrompts() {
    const conversationContainers = uniqueElements([
      ...document.querySelectorAll(".dad65929"),
      ...document.querySelectorAll(".ds-virtual-list-visible-items")
    ]).filter(isVisibleElement);

    const candidates = uniqueElements(
      conversationContainers.flatMap((container) => {
        const userRows = [
          ...container.querySelectorAll("._9663006"),
          ...container.querySelectorAll(".ds-message.d29f3d7d"),
          ...container.querySelectorAll(".d29f3d7d")
        ];

        return userRows
          .map((row) => row.querySelector(".fbb737a4") || row)
          .filter((element) => element instanceof HTMLElement);
      })
    );

    console.log("[Prompt Navigator][DeepSeek] candidates:", candidates.length);
    candidates.forEach((el) => {
      const text = getMessageText(el);
      console.log("[Prompt Navigator][DeepSeek] candidate", {
        text,
        tagName: el.tagName,
        className: el.className,
        rect: el.getBoundingClientRect(),
        parentClassName: el.parentElement?.className
      });
    });

    const prompts = normalizeMessages(
      candidates.filter(isDeepSeekUserMessageElement),
      "deepseek"
    );

    console.log("[Prompt Navigator][DeepSeek] final prompts:", prompts);
    return prompts;
  }

  function init() {
    activeAdapter = Object.values(platformAdapters).find((adapter) => adapter.match());
    if (!activeAdapter || document.getElementById(NAVIGATOR_ID)) {
      return;
    }

    createSidebar();
    scheduleUpdate();
    startObserver();
  }

  function createSidebar() {
    root = document.createElement("aside");
    root.id = NAVIGATOR_ID;
    root.setAttribute("aria-label", "Prompt Navigator");

    const header = document.createElement("div");
    header.className = "acn-header";

    const title = document.createElement("div");
    title.className = "acn-title";
    title.textContent = "Prompt Navigator";

    const toggleButton = document.createElement("button");
    toggleButton.className = "acn-toggle";
    toggleButton.type = "button";
    toggleButton.title = "折叠或展开";
    toggleButton.setAttribute("aria-label", "折叠或展开 Prompt Navigator");
    toggleButton.textContent = "<";
    toggleButton.addEventListener("click", () => {
      collapsed = !collapsed;
      root.classList.toggle("is-collapsed", collapsed);
      toggleButton.textContent = collapsed ? ">" : "<";
    });

    const meta = document.createElement("div");
    meta.className = "acn-meta";
    meta.textContent = activeAdapter.name;

    list = document.createElement("div");
    list.className = "acn-list";

    emptyState = document.createElement("div");
    emptyState.className = "acn-empty";
    emptyState.textContent = "暂无可用 prompt";

    header.append(title, toggleButton);
    root.append(header, meta, list, emptyState);
    document.documentElement.appendChild(root);
  }

  function startObserver() {
    observer = new MutationObserver(scheduleUpdate);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  function scheduleUpdate() {
    window.clearTimeout(updateTimer);
    updateTimer = window.setTimeout(renderPromptList, UPDATE_DELAY_MS);
  }

  function renderPromptList() {
    if (!activeAdapter || !list) {
      return;
    }

    const messages = activeAdapter.getUserMessages();
    list.textContent = "";
    emptyState.hidden = messages.length > 0;

    messages.forEach((message, index) => {
      const item = document.createElement("button");
      item.className = "acn-item";
      item.type = "button";
      item.dataset.promptId = message.id;

      const number = document.createElement("span");
      number.className = "acn-item-number";
      number.textContent = `Prompt ${index + 1}`;

      const preview = document.createElement("span");
      preview.className = "acn-item-preview";
      preview.textContent = previewText(message.text);

      item.append(number, preview);
      item.addEventListener("click", () => scrollToMessage(message.element));
      list.appendChild(item);
    });
  }

  function scrollToMessage(element) {
    if (!element || !element.isConnected) {
      scheduleUpdate();
      return;
    }

    element.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    element.classList.add(HIGHLIGHT_CLASS);
    window.setTimeout(() => {
      element.classList.remove(HIGHLIGHT_CLASS);
    }, HIGHLIGHT_DELAY_MS);
  }

  function normalizeMessages(elements, platformKey) {
    const seen = new Set();

    return elements
      .filter(isValidMessageElement)
      .map((element, index) => {
        const text = getMessageText(element);
        const id = getStableElementId(element, platformKey, index, text);
        return { id, text, element };
      })
      .filter((message) => {
        const key = `${message.id}:${message.text}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
  }

  function isValidMessageElement(element) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    if (element.closest(`#${NAVIGATOR_ID}, textarea, input, button, nav, header, footer, form`)) {
      return false;
    }

    const text = getMessageText(element);
    if (!text) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function isDeepSeekUserMessageElement(element) {
    if (!isValidMessageElement(element)) {
      return false;
    }

    if (element.closest("._4f9bf79, ._43c05b5, .e1675d8b, .ds-markdown")) {
      return false;
    }

    const row = element.closest("._9663006, .ds-message.d29f3d7d, .d29f3d7d");
    if (!row) {
      return false;
    }

    if (!row.closest(".dad65929, .ds-virtual-list-visible-items")) {
      return false;
    }

    return !isDeepSeekUiText(getMessageText(element));
  }

  function isVisibleElement(element) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function isDeepSeekUiText(text) {
    const blockedTexts = new Set([
      "快速模式",
      "专家模式",
      "深度思考",
      "智能搜索",
      "内容由 AI 生成，请仔细甄别"
    ]);

    return blockedTexts.has(text) || /^已思考/.test(text) || /^用时/.test(text);
  }

  function getMessageText(element) {
    return (element.innerText || element.textContent || "").replace(/\s+/g, " ").trim();
  }

  function previewText(text) {
    if (text.length <= MAX_PREVIEW_LENGTH) {
      return text;
    }

    return `${text.slice(0, MAX_PREVIEW_LENGTH)}...`;
  }

  function getStableElementId(element, platformKey, index, text) {
    if (!element.dataset.acnPromptId) {
      element.dataset.acnPromptId = `${platformKey}-${index}-${hashText(text)}`;
    }
    return element.dataset.acnPromptId;
  }

  function hashText(text) {
    let hash = 0;
    for (let index = 0; index < text.length; index += 1) {
      hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
    }
    return Math.abs(hash).toString(36);
  }

  function uniqueElements(elements) {
    return Array.from(new Set(elements));
  }

  init();
})();
