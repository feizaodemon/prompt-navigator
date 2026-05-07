(function () {
  "use strict";

  const NAVIGATOR_ID = "ai-conversation-navigator";
  const HIGHLIGHT_CLASS = "ai-conversation-navigator-target";
  const PINNED_STORAGE_KEY = "aiConversationNavigatorPinnedPrompts";
  const MODE_STORAGE_KEY = "aiConversationNavigatorMode";
  const MODE_EXPANDED = "expanded";
  const MODE_COMPACT = "compact";
  const MAX_PREVIEW_LENGTH = 50;
  const UPDATE_DELAY_MS = 300;
  const HIGHLIGHT_DELAY_MS = 1600;
  const PROMPT_LIST_BOTTOM_THRESHOLD_PX = 120;
  const COMPACT_SCROLL_OFFSET_PX = 120;
  const COMPACT_DOT_EDGE_OFFSET_PERCENT = 2;
  const DEBUG_NAVIGATOR = false;

  let activeAdapter = null;
  let root = null;
  let panel = null;
  let list = null;
  let compactTimeline = null;
  let pinnedSection = null;
  let pinnedList = null;
  let emptyState = null;
  let searchInput = null;
  let modeToggleButton = null;
  let compactTooltip = null;
  let compactTooltipFrame = null;
  let themeObserver = null;
  let themeUpdateFrame = null;
  let currentTheme = null;
  let observer = null;
  let updateTimer = null;
  let lastRenderedPromptCount = null;
  let pinnedStore = {};
  let activePromptKey = null;
  let currentPrompts = [];
  let navigatorMode = MODE_COMPACT;
  let panelOpen = false;
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
    applyPromptNavigatorTheme(detectChatGPTTheme());
    observeChatGPTThemeChanges();
    Promise.all([loadPinnedPrompts(), loadNavigatorMode()]).then(() => {
      applyNavigatorMode();
      scheduleUpdate();
      startObserver();
    });
  }

  function createSidebar() {
    root = document.createElement("aside");
    root.id = NAVIGATOR_ID;
    root.setAttribute("aria-label", "Prompt Navigator");

    const compactHeader = document.createElement("div");
    compactHeader.className = "acn-compact-header";

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

    modeToggleButton = document.createElement("button");
    modeToggleButton.className = "acn-mode-toggle";
    modeToggleButton.type = "button";
    modeToggleButton.title = "打开 prompt list 面板";
    modeToggleButton.setAttribute("aria-label", "打开 Prompt Navigator list panel");
    modeToggleButton.textContent = "List";
    modeToggleButton.addEventListener("click", (event) => {
      event.stopPropagation();
      togglePromptPanel();
    });

    const closeButton = document.createElement("button");
    closeButton.className = "acn-panel-close";
    closeButton.type = "button";
    closeButton.title = "关闭 prompt list 面板";
    closeButton.setAttribute("aria-label", "关闭 Prompt Navigator list panel");
    closeButton.textContent = "×";
    closeButton.addEventListener("click", () => closePromptPanel());
    closeButton.textContent = "x";

    panel = document.createElement("div");
    panel.className = "acn-panel";
    panel.addEventListener("click", (event) => event.stopPropagation());

    const panelHeader = document.createElement("div");
    panelHeader.className = "acn-panel-header";

    const panelActions = document.createElement("div");
    panelActions.className = "acn-panel-actions";

    panelActions.append(refreshButton, closeButton);
    panelHeader.append(title, panelActions);

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

    compactTimeline = document.createElement("div");
    compactTimeline.className = "acn-compact-timeline";
    compactTimeline.setAttribute("aria-label", "Compact prompt timeline");
    compactTimeline.addEventListener("click", handleCompactTimelineClick);

    emptyState = document.createElement("div");
    emptyState.className = "acn-empty";
    emptyState.textContent = "暂无可用 prompt";

    compactHeader.append(modeToggleButton);
    panel.append(panelHeader, meta, searchWrap, pinnedSection, list, emptyState);
    root.append(compactHeader, compactTimeline, panel);
    document.documentElement.appendChild(root);
    document.addEventListener("click", handleOutsidePanelClick);
  }

  function togglePromptPanel() {
    setPromptPanelOpen(!panelOpen);
  }

  function closePromptPanel() {
    setPromptPanelOpen(false);
  }

  function setPromptPanelOpen(open) {
    panelOpen = open;
    if (!root || !modeToggleButton) {
      return;
    }

    root.classList.toggle("is-panel-open", panelOpen);
    modeToggleButton.setAttribute("aria-expanded", panelOpen ? "true" : "false");
    modeToggleButton.textContent = panelOpen ? "Close" : "List";
  }

  function handleOutsidePanelClick(event) {
    if (!panelOpen || !root || root.contains(event.target)) {
      return;
    }

    closePromptPanel();
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

  function refreshPrompts() {
    currentPrompts = activeAdapter ? activeAdapter.getUserMessages() : [];
    return currentPrompts;
  }

  function findPromptById(promptId) {
    return currentPrompts.find((prompt) => prompt.id === promptId) || null;
  }

  function renderPromptList(allowAutoScroll) {
    if (!activeAdapter || !list) {
      return;
    }

    const messages = refreshPrompts();
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
    compactTimeline.textContent = "";
    renderPinnedPrompts(pinnedRecords, messagesByKey);
    renderCompactTimeline(messages, pinnedKeys);
    emptyState.hidden = filteredMessages.length > 0;
    emptyState.textContent = messages.length > 0 ? "没有匹配的 prompt" : "暂无可用 prompt";

    filteredMessages.forEach((prompt) => {
      const promptKey = prompt.id;
      const item = createPromptItem({
        prompt,
        promptKey,
        promptNumber: prompt.index,
        pinned: pinnedKeys.has(promptKey),
        showPinButton: true,
        source: "list"
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
        prompt: matchedMessage ? matchedMessage.message : null,
        promptKey: record.promptKey,
        promptNumber: record.promptNumber,
        preview: record.promptPreview,
        pinned: true,
        showPinButton: true,
        source: "pinned"
      });
      pinnedList.appendChild(item);
    });
  }

  function renderCompactTimeline(messages, pinnedKeys) {
    if (!compactTimeline) {
      return;
    }

    compactTimeline.dataset.density = getCompactTimelineDensity(messages.length);

    messages.forEach((prompt, index) => {
      const promptKey = prompt.id;
      const dot = createCompactDot({
        prompt,
        pinned: pinnedKeys.has(promptKey)
      });

      dot.style.top = `${calculateCompactDotPosition(index, messages.length)}%`;
      compactTimeline.appendChild(dot);
    });
  }

  function calculateCompactDotPosition(index, total) {
    if (total <= 1) {
      return 50;
    }

    const availableRange = 100 - COMPACT_DOT_EDGE_OFFSET_PERCENT * 2;
    const position = COMPACT_DOT_EDGE_OFFSET_PERCENT + (index / (total - 1)) * availableRange;
    return Math.round(position * 100) / 100;
  }

  function getCompactTimelineDensity(total) {
    if (total >= 120) {
      return "very-dense";
    }

    if (total >= 64) {
      return "dense";
    }

    return "normal";
  }

  function createPromptItem({ prompt, promptKey, promptNumber, preview, pinned, showPinButton, source }) {
    const item = document.createElement("div");
    item.className = "acn-item";
    const promptId = promptKey;
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
    previewNode.textContent = preview || (prompt ? prompt.preview : "");

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
        togglePinnedPrompt(prompt, promptKey, promptNumber, previewNode.textContent);
      });
      item.append(pinButton);
    }

    if (source === "pinned") {
      item.addEventListener("click", () => handlePromptClick(promptId, "pinned"));
    } else {
      item.addEventListener("click", () => handlePromptClick(promptId));
    }

    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        item.click();
      }
    });

    return item;
  }

  function createCompactDot({ prompt, pinned }) {
    const dot = document.createElement("button");
    dot.className = "acn-compact-dot";
    dot.type = "button";
    dot.dataset.promptKey = prompt.id;
    dot.dataset.promptId = prompt.id;
    dot.dataset.promptNumber = String(prompt.index);
    dot.dataset.promptPreview = prompt.preview;
    dot.classList.toggle("is-pinned", pinned);
    dot.classList.toggle("is-active", activePromptKey === prompt.id);
    dot.setAttribute("aria-label", `Prompt ${prompt.index}: ${prompt.preview}`);
    dot.addEventListener("mouseenter", () => showCompactTooltip(dot, prompt));
    dot.addEventListener("mouseleave", hideCompactTooltip);
    dot.addEventListener("focus", () => showCompactTooltip(dot, prompt));
    dot.addEventListener("blur", hideCompactTooltip);
    dot.addEventListener("click", handleCompactDotClick);

    return dot;
  }

  function handleCompactDotClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const dot = event.currentTarget;
    const promptId = dot.dataset.promptId;
    debugNavigator("compact dot clicked", {
      promptId,
      index: Number(dot.dataset.promptNumber),
      promptText: dot.dataset.promptPreview
    });
    handlePromptClick(promptId);
  }

  function handleCompactTimelineClick(event) {
    const dot = event.target.closest(".acn-compact-dot");
    if (!dot || !compactTimeline || !compactTimeline.contains(dot)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    handlePromptClick(dot.dataset.promptId);
  }

  function showCompactTooltip(dot, prompt) {
    if (!dot || !prompt) {
      return;
    }

    const promptNumber = dot.dataset.promptNumber;
    const promptPreview = dot.dataset.promptPreview || prompt.preview;
    const promptIndex = Number(promptNumber);

    console.log("[Prompt Navigator][Compact Tooltip] show", {
      promptIndex,
      textLength: prompt.text.length,
      preview: promptPreview
    });

    if (!compactTooltip) {
      compactTooltip = document.createElement("div");
      compactTooltip.className = "acn-dot-tooltip";
      applyPromptNavigatorTheme(currentTheme || detectChatGPTTheme());
      document.body.appendChild(compactTooltip);
    }

    cancelCompactTooltipFrame();
    compactTooltip.textContent = "";
    compactTooltip.classList.remove("is-visible");
    compactTooltip.style.top = "0";
    compactTooltip.style.left = "0";

    const numberLine = document.createElement("div");
    numberLine.className = "acn-dot-tooltip-number";
    numberLine.textContent = `#${promptNumber}`;

    const previewLine = document.createElement("div");
    previewLine.className = "acn-dot-tooltip-preview";
    previewLine.textContent = promptPreview;

    compactTooltip.append(numberLine, previewLine);
    compactTooltipFrame = window.requestAnimationFrame(() => {
      compactTooltipFrame = null;
      layoutCompactTooltip(dot, promptIndex, promptPreview);
    });
  }

  function layoutCompactTooltip(dot, promptIndex, preview) {
    if (!compactTooltip || !dot.isConnected) {
      return;
    }

    const dotRect = dot.getBoundingClientRect();
    const tooltipRect = compactTooltip.getBoundingClientRect();
    const gap = 10;
    const viewportPadding = 8;
    const preferredLeft = dotRect.left - tooltipRect.width - gap;
    const left = Math.min(
      Math.max(viewportPadding, preferredLeft),
      window.innerWidth - tooltipRect.width - viewportPadding
    );
    const preferredTop = dotRect.top + dotRect.height / 2 - tooltipRect.height / 2;
    const top = Math.min(
      Math.max(viewportPadding, preferredTop),
      window.innerHeight - tooltipRect.height - viewportPadding
    );

    compactTooltip.style.left = `${left}px`;
    compactTooltip.style.top = `${top}px`;
    compactTooltip.classList.add("is-visible");

    console.log("[Prompt Navigator][Compact Tooltip] layout", {
      dotRect,
      tooltipRect,
      top,
      left,
      promptIndex,
      preview,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
  }

  function hideCompactTooltip() {
    cancelCompactTooltipFrame();

    if (!compactTooltip) {
      return;
    }

    compactTooltip.classList.remove("is-visible");
  }

  function cancelCompactTooltipFrame() {
    if (compactTooltipFrame === null) {
      return;
    }

    window.cancelAnimationFrame(compactTooltipFrame);
    compactTooltipFrame = null;
  }

  function handlePromptClick(promptId, source) {
    let prompt = findPromptById(promptId);
    if (!prompt || !prompt.element || !prompt.element.isConnected) {
      refreshPrompts();
      prompt = findPromptById(promptId);
    }

    if (!prompt || !prompt.element || !prompt.element.isConnected) {
      debugNavigator("jump requested", {
        index: null,
        promptId,
        targetFound: false,
        targetElement: null
      });
      debugNavigator("prompt target missing", {
        clickedPromptId: promptId,
        activePromptId: activePromptKey
      });
      return;
    }

    scrollToPrompt(prompt, source);
  }

  function scrollToPrompt(prompt, source) {
    const element = prompt.element;
    setActivePrompt(prompt.id);
    debugPromptClick(prompt, source, true);

    element.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    element.classList.add(HIGHLIGHT_CLASS);
    window.setTimeout(() => {
      element.classList.remove(HIGHLIGHT_CLASS);
    }, HIGHLIGHT_DELAY_MS);
  }

  function debugPromptClick(prompt, source, targetFound) {
    debugNavigator("jump requested", {
      source: source || "list",
      index: prompt.index,
      promptId: prompt.id,
      promptText: prompt.preview,
      targetFound,
      targetElement: prompt.element,
      activePromptId: activePromptKey
    });
  }

  function debugNavigator(message, details) {
    if (!DEBUG_NAVIGATOR) {
      return;
    }

    console.debug("[PromptNavigator]", message, details);
  }

  function setActivePrompt(promptKey) {
    activePromptKey = promptKey;

    if (!root) {
      return;
    }

    root.querySelectorAll(".acn-item").forEach((item) => {
      item.classList.toggle("is-active", item.dataset.promptKey === promptKey);
    });

    root.querySelectorAll(".acn-compact-dot").forEach((dot) => {
      dot.classList.toggle("is-active", dot.dataset.promptKey === promptKey);
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

  function loadNavigatorMode() {
    return new Promise((resolve) => {
      const storage = getLocalStorageApi();
      if (!storage) {
        navigatorMode = MODE_COMPACT;
        resolve();
        return;
      }

      storage.get([MODE_STORAGE_KEY], (result) => {
        navigatorMode = result && result[MODE_STORAGE_KEY] === MODE_EXPANDED ? MODE_COMPACT : MODE_COMPACT;
        resolve();
      });
    });
  }

  function saveNavigatorMode() {
    const storage = getLocalStorageApi();
    if (!storage) {
      return;
    }

    storage.set({
      [MODE_STORAGE_KEY]: navigatorMode
    });
  }

  function applyNavigatorMode() {
    if (!root || !modeToggleButton) {
      return;
    }

    root.classList.add("is-compact");
    root.classList.remove("is-collapsed");
    modeToggleButton.setAttribute("aria-pressed", panelOpen ? "true" : "false");
    setPromptPanelOpen(panelOpen);
  }

  function detectChatGPTTheme() {
    const bodyBackground = getComputedStyle(document.body).backgroundColor;
    const htmlBackground = getComputedStyle(document.documentElement).backgroundColor;
    const bodyColorScheme = getComputedStyle(document.body).colorScheme;
    const htmlColorScheme = getComputedStyle(document.documentElement).colorScheme;
    const classText = `${document.documentElement.className} ${document.body.className}`;

    console.log("[Prompt Navigator][Theme] body background:", bodyBackground);

    const backgroundTheme = getColorTheme(bodyBackground) || getColorTheme(htmlBackground);
    if (backgroundTheme) {
      console.log("[Prompt Navigator][Theme] detected:", backgroundTheme);
      return backgroundTheme;
    }

    if (/(^|\s)(dark|theme-dark|dark-mode)(\s|$)/i.test(classText)) {
      console.log("[Prompt Navigator][Theme] detected:", "dark");
      return "dark";
    }

    if (/(^|\s)(light|theme-light|light-mode)(\s|$)/i.test(classText)) {
      console.log("[Prompt Navigator][Theme] detected:", "light");
      return "light";
    }

    if (`${bodyColorScheme} ${htmlColorScheme}`.includes("dark")) {
      console.log("[Prompt Navigator][Theme] detected:", "dark");
      return "dark";
    }

    const fallbackTheme =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    console.log("[Prompt Navigator][Theme] detected:", fallbackTheme);
    return fallbackTheme;
  }

  function applyPromptNavigatorTheme(theme) {
    const nextTheme = theme === "dark" ? "dark" : "light";
    const previousTheme = currentTheme;
    currentTheme = nextTheme;

    if (root) {
      root.classList.toggle("is-theme-dark", nextTheme === "dark");
      root.classList.toggle("is-theme-light", nextTheme !== "dark");
    }

    if (compactTooltip) {
      compactTooltip.classList.toggle("is-theme-dark", nextTheme === "dark");
      compactTooltip.classList.toggle("is-theme-light", nextTheme !== "dark");
    }

    if (previousTheme && previousTheme !== nextTheme) {
      console.log("[Prompt Navigator][Theme] changed:", nextTheme);
    }
  }

  function observeChatGPTThemeChanges() {
    if (themeObserver) {
      return;
    }

    const scheduleThemeUpdate = () => {
      if (themeUpdateFrame !== null) {
        return;
      }

      themeUpdateFrame = window.requestAnimationFrame(() => {
        themeUpdateFrame = null;
        applyPromptNavigatorTheme(detectChatGPTTheme());
      });
    };

    themeObserver = new MutationObserver(scheduleThemeUpdate);
    [document.documentElement, document.body].filter(Boolean).forEach((target) => {
      themeObserver.observe(target, {
        attributes: true,
        attributeFilter: ["class", "style"]
      });
    });

    if (window.matchMedia) {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      if (typeof media.addEventListener === "function") {
        media.addEventListener("change", scheduleThemeUpdate);
      } else if (typeof media.addListener === "function") {
        media.addListener(scheduleThemeUpdate);
      }
    }
  }

  function getColorTheme(color) {
    const rgb = parseRgbColor(color);
    if (!rgb || rgb.alpha === 0) {
      return null;
    }

    const luminance = 0.2126 * rgb.red + 0.7152 * rgb.green + 0.0722 * rgb.blue;
    if (luminance >= 180) {
      return "light";
    }

    if (luminance <= 145) {
      return "dark";
    }

    return null;
  }

  function parseRgbColor(color) {
    if (!color || color === "transparent") {
      return null;
    }

    const match = color.match(/rgba?\(([^)]+)\)/i);
    if (!match) {
      return null;
    }

    const parts = match[1].split(",").map((part) => part.trim());
    const red = Number(parts[0]);
    const green = Number(parts[1]);
    const blue = Number(parts[2]);
    const alpha = parts.length > 3 ? Number(parts[3]) : 1;

    if ([red, green, blue, alpha].some((value) => Number.isNaN(value))) {
      return null;
    }

    return { red, green, blue, alpha };
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
    messages.forEach((message) => {
      map.set(message.id, { message, index: message.index - 1 });
    });
    return map;
  }

  function getPromptKey(message, index) {
    if (message.id) {
      return message.id;
    }

    return `${getConversationKey()}::${index + 1}::${hashText(message.text)}`;
  }

  function getConversationKey() {
    return `${location.origin}${location.pathname}`;
  }

  function normalizeMessages(elements, platformKey) {
    const seen = new Set();
    const prompts = [];

    elements.filter(isValidMessageElement).forEach((element) => {
        const text = getMessageText(element);
        const elementId = getStableElementId(element, platformKey, prompts.length, text);
        const key = `${elementId}:${text}`;
        if (seen.has(key)) {
          return;
        }
        seen.add(key);
        prompts.push(
          buildPromptRecord({
            element,
            index: prompts.length + 1,
            text
          })
        );
      });

    return prompts;
  }

  function buildPromptRecord({ element, index, text }) {
    const prompt = {
      id: getPromptKey({ text }, index - 1),
      index,
      text,
      preview: previewText(text),
      element
    };

    element.dataset.acnPromptKey = prompt.id;
    return prompt;
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
      return messages;
    }

    return messages.filter((message) => {
        const text = message.text.toLocaleLowerCase();
        const preview = message.preview.toLocaleLowerCase();
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
