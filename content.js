(function () {
  "use strict";

  const NAVIGATOR_ID = "ai-conversation-navigator";
  const HIGHLIGHT_CLASS = "ai-conversation-navigator-target";
  const PINNED_STORAGE_KEY = "aiConversationNavigatorPinnedPrompts";
  const MAX_PREVIEW_LENGTH = 50;
  const UPDATE_DELAY_MS = 300;
  const HIGHLIGHT_DELAY_MS = 1600;
  const PROMPT_LIST_BOTTOM_THRESHOLD_PX = 120;

  let activeAdapter = null;
  let root = null;
  let list = null;
  let pinnedSection = null;
  let pinnedList = null;
  let emptyState = null;
  let searchInput = null;
  let observer = null;
  let updateTimer = null;
  let lastRenderedPromptCount = null;
  let pinnedStore = {};
  let activePromptKey = null;
  let collapsed = false;

  const platformAdapters = {
    chatgpt: {
      name: "ChatGPT",
      match: () => location.hostname === "chatgpt.com" || location.hostname.endsWith(".chatgpt.com"),
      getUserMessages: extractChatGPTPrompts
    }
  };

  function extractChatGPTPrompts() {
    const elements = uniqueElements([
      ...document.querySelectorAll('[data-message-author-role="user"]'),
      ...document.querySelectorAll('article[data-testid^="conversation-turn"] [data-message-author-role="user"]')
    ]);

    return normalizeMessages(elements, "chatgpt");
  }

  function init() {
    activeAdapter = Object.values(platformAdapters).find((adapter) => adapter.match());
    if (!activeAdapter || document.getElementById(NAVIGATOR_ID)) {
      return;
    }

    createSidebar();
    loadPinnedPrompts().then(() => {
      scheduleUpdate();
      startObserver();
    });
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

    const refreshButton = document.createElement("button");
    refreshButton.className = "acn-refresh";
    refreshButton.type = "button";
    refreshButton.title = "手动刷新 prompt";
    refreshButton.setAttribute("aria-label", "手动刷新 Prompt Navigator");
    refreshButton.textContent = "刷新";
    refreshButton.addEventListener("click", () => renderPromptList(false));

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

    const searchWrap = document.createElement("div");
    searchWrap.className = "acn-search";

    searchInput = document.createElement("input");
    searchInput.className = "acn-search-input";
    searchInput.type = "search";
    searchInput.placeholder = "搜索 prompt";
    searchInput.setAttribute("aria-label", "搜索 prompt");
    searchInput.addEventListener("input", () => renderPromptList(false));

    searchWrap.append(searchInput);

    pinnedSection = document.createElement("section");
    pinnedSection.className = "acn-pinned-section";
    pinnedSection.hidden = true;

    const pinnedTitle = document.createElement("div");
    pinnedTitle.className = "acn-section-title";
    pinnedTitle.textContent = "Pinned";

    pinnedList = document.createElement("div");
    pinnedList.className = "acn-pinned-list";

    pinnedSection.append(pinnedTitle, pinnedList);

    list = document.createElement("div");
    list.className = "acn-list";

    emptyState = document.createElement("div");
    emptyState.className = "acn-empty";
    emptyState.textContent = "暂无可用 prompt";

    header.append(title, refreshButton, toggleButton);
    root.append(header, meta, searchWrap, pinnedSection, list, emptyState);
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
    updateTimer = window.setTimeout(() => renderPromptList(true), UPDATE_DELAY_MS);
  }

  function renderPromptList(allowAutoScroll) {
    if (!activeAdapter || !list) {
      return;
    }

    const messages = activeAdapter.getUserMessages();
    const query = searchInput ? searchInput.value : "";
    const filteredMessages = filterMessagesByQuery(messages, query);
    const pinnedRecords = getCurrentPinnedRecords();
    const pinnedKeys = new Set(pinnedRecords.map((record) => record.promptKey));
    const messagesByKey = mapMessagesByPromptKey(messages);
    const previousScrollTop = list.scrollTop;
    const shouldScrollToLatest =
      allowAutoScroll &&
      lastRenderedPromptCount !== null &&
      messages.length > lastRenderedPromptCount &&
      isPromptListNearBottom(list);

    list.textContent = "";
    renderPinnedPrompts(pinnedRecords, messagesByKey);
    emptyState.hidden = filteredMessages.length > 0;
    emptyState.textContent = messages.length > 0 ? "没有匹配的 prompt" : "暂无可用 prompt";

    filteredMessages.forEach(({ message, index }) => {
      const promptKey = getPromptKey(message, index);
      const item = createPromptItem({
        message,
        promptKey,
        promptNumber: index + 1,
        pinned: pinnedKeys.has(promptKey),
        showPinButton: true
      });
      list.appendChild(item);
    });

    if (shouldScrollToLatest) {
      list.scrollTop = list.scrollHeight;
    } else {
      list.scrollTop = previousScrollTop;
    }

    lastRenderedPromptCount = messages.length;
  }

  function renderPinnedPrompts(pinnedRecords, messagesByKey) {
    if (!pinnedSection || !pinnedList) {
      return;
    }

    pinnedList.textContent = "";
    pinnedSection.hidden = pinnedRecords.length === 0;

    pinnedRecords.forEach((record) => {
      const matchedMessage = messagesByKey.get(record.promptKey);
      const item = createPromptItem({
        message: matchedMessage ? matchedMessage.message : null,
        promptKey: record.promptKey,
        promptNumber: record.promptNumber,
        preview: record.promptPreview,
        pinned: true,
        showPinButton: true
      });
      pinnedList.appendChild(item);
    });
  }

  function createPromptItem({ message, promptKey, promptNumber, preview, pinned, showPinButton }) {
    const item = document.createElement("div");
    item.className = "acn-item";
    item.dataset.promptKey = promptKey;
    item.setAttribute("role", "button");
    item.tabIndex = 0;
    item.classList.toggle("is-pinned", pinned);
    item.classList.toggle("is-active", activePromptKey === promptKey);

    const content = document.createElement("div");
    content.className = "acn-item-content";

    const number = document.createElement("span");
    number.className = "acn-item-number";
    number.textContent = `Prompt ${promptNumber}`;

    const previewNode = document.createElement("span");
    previewNode.className = "acn-item-preview";
    previewNode.textContent = preview || previewText(message ? message.text : "");

    content.append(number, previewNode);
    item.append(content);

    if (showPinButton) {
      const pinButton = document.createElement("button");
      pinButton.className = "acn-pin-button";
      pinButton.type = "button";
      pinButton.title = pinned ? "取消固定 prompt" : "固定 prompt";
      pinButton.setAttribute("aria-label", pinned ? `取消固定 Prompt ${promptNumber}` : `固定 Prompt ${promptNumber}`);
      pinButton.setAttribute("aria-pressed", pinned ? "true" : "false");
      pinButton.textContent = pinned ? "★" : "☆";
      pinButton.addEventListener("click", (event) => {
        event.stopPropagation();
        togglePinnedPrompt(message, promptKey, promptNumber, previewNode.textContent);
      });
      item.append(pinButton);
    }

    item.addEventListener("click", () => {
      if (message) {
        scrollToMessage(message.element, promptKey);
      } else {
        setActivePrompt(promptKey);
        scheduleUpdate();
      }
    });

    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        item.click();
      }
    });

    return item;
  }

  function scrollToMessage(element, promptKey) {
    if (!element || !element.isConnected) {
      scheduleUpdate();
      return;
    }

    setActivePrompt(promptKey);

    element.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    element.classList.add(HIGHLIGHT_CLASS);
    window.setTimeout(() => {
      element.classList.remove(HIGHLIGHT_CLASS);
    }, HIGHLIGHT_DELAY_MS);
  }

  function setActivePrompt(promptKey) {
    activePromptKey = promptKey;

    if (!root) {
      return;
    }

    root.querySelectorAll(".acn-item").forEach((item) => {
      item.classList.toggle("is-active", item.dataset.promptKey === promptKey);
    });
  }

  function togglePinnedPrompt(message, promptKey, promptNumber, promptPreview) {
    const conversationKey = getConversationKey();
    const records = getCurrentPinnedRecords();
    const nextRecords = records.filter((record) => record.promptKey !== promptKey);

    if (nextRecords.length === records.length) {
      const text = message ? message.text : promptPreview;
      nextRecords.push({
        conversationUrl: conversationKey,
        promptKey,
        promptHash: hashText(text),
        promptPreview: previewText(text),
        promptNumber
      });
    }

    pinnedStore[conversationKey] = nextRecords;
    savePinnedPrompts();
    renderPromptList(false);
  }

  function loadPinnedPrompts() {
    return new Promise((resolve) => {
      const storage = getLocalStorageApi();
      if (!storage) {
        pinnedStore = {};
        resolve();
        return;
      }

      storage.get([PINNED_STORAGE_KEY], (result) => {
        pinnedStore = result && result[PINNED_STORAGE_KEY] ? result[PINNED_STORAGE_KEY] : {};
        resolve();
      });
    });
  }

  function savePinnedPrompts() {
    const storage = getLocalStorageApi();
    if (!storage) {
      return;
    }

    storage.set({
      [PINNED_STORAGE_KEY]: pinnedStore
    });
  }

  function getLocalStorageApi() {
    if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) {
      return null;
    }

    return chrome.storage.local;
  }

  function getCurrentPinnedRecords() {
    const records = pinnedStore[getConversationKey()];
    return Array.isArray(records) ? records : [];
  }

  function mapMessagesByPromptKey(messages) {
    const map = new Map();
    messages.forEach((message, index) => {
      map.set(getPromptKey(message, index), { message, index });
    });
    return map;
  }

  function getPromptKey(message, index) {
    return `${getConversationKey()}::${index + 1}::${hashText(message.text)}`;
  }

  function getConversationKey() {
    return `${location.origin}${location.pathname}`;
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

  function getMessageText(element) {
    return (element.innerText || element.textContent || "").replace(/\s+/g, " ").trim();
  }

  function previewText(text) {
    if (text.length <= MAX_PREVIEW_LENGTH) {
      return text;
    }

    return `${text.slice(0, MAX_PREVIEW_LENGTH)}...`;
  }

  function filterMessagesByQuery(messages, query) {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) {
      return messages.map((message, index) => ({ message, index }));
    }

    return messages
      .map((message, index) => ({ message, index }))
      .filter(({ message }) => {
        const text = message.text.toLocaleLowerCase();
        const preview = previewText(message.text).toLocaleLowerCase();
        return text.includes(normalizedQuery) || preview.includes(normalizedQuery);
      });
  }

  function isPromptListNearBottom(element) {
    const distanceToBottom = element.scrollHeight - element.clientHeight - element.scrollTop;
    return distanceToBottom <= PROMPT_LIST_BOTTOM_THRESHOLD_PX;
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
