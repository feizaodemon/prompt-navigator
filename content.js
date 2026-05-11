(function () {
  "use strict";

  const NAVIGATOR_ID = "ai-conversation-navigator";
  const HIGHLIGHT_CLASS = "ai-conversation-navigator-target";
  const PINNED_STORAGE_KEY = "aiConversationNavigatorPinnedPrompts";
  const MODE_STORAGE_KEY = "aiConversationNavigatorMode";
  const COLLECTIONS_STORAGE_KEY = "aiConversationNavigatorCollections";
  const MODE_EXPANDED = "expanded";
  const MODE_COMPACT = "compact";
  const VIEW_PROMPTS = "prompts";
  const VIEW_COLLECTIONS = "collections";
  const MAX_PREVIEW_LENGTH = 50;
  const UPDATE_DELAY_MS = 300;
  const HIGHLIGHT_DELAY_MS = 1600;
  const PROMPT_LIST_BOTTOM_THRESHOLD_PX = 120;
  const COMPACT_SCROLL_OFFSET_PX = 120;
  const COMPACT_DOT_EDGE_OFFSET_PERCENT = 2;
  const ACTIVE_PROMPT_VIEWPORT_RATIO = 0.35;
  const COMPACT_TOOLTIP_MAX_TEXT_LENGTH = 280;
  const PROGRAMMATIC_SCROLL_LOCK_MS = 600;
  const CORRECTION_CHECK_DELAY_MS = 250;
  const FINAL_CORRECTION_CHECK_DELAY_MS = 600;
  const SCROLL_CORRECTION_THRESHOLD_PX = 12;
  const MAX_SCROLL_CORRECTION_PASSES = 2;
  const DEBUG_NAVIGATOR = false;

  let activeAdapter = null;
  let root = null;
  let panel = null;
  let list = null;
  let compactTimeline = null;
  let pinnedSection = null;
  let pinnedList = null;
  let emptyState = null;
  let searchWrap = null;
  let searchInput = null;
  let modeToggleButton = null;
  let promptTab = null;
  let collectionsTab = null;
  let collectionsView = null;
  let collectionsHeader = null;
  let collectionNameInput = null;
  let collectionStatus = null;
  let collectionList = null;
  let collectionsEmpty = null;
  let collectionDetail = null;
  let selectedCollectionId = "";
  let activePanelView = VIEW_PROMPTS;
  let collectionsRenderToken = 0;
  let compactTooltip = null;
  let compactTooltipFrame = null;
  let activePromptFrame = null;
  let activeScrollContainer = null;
  let themeObserver = null;
  let themeUpdateFrame = null;
  let currentTheme = null;
  let observer = null;
  let updateTimer = null;
  let lastRenderedPromptCount = null;
  let pinnedStore = {};
  let activePromptKey = null;
  let activePromptIndex = -1;
  let isProgrammaticScrolling = false;
  let programmaticScrollTimer = null;
  let delayedUpdateAfterProgrammaticScroll = false;
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
      startActivePromptTracking();
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

    const viewTabs = document.createElement("div");
    viewTabs.className = "acn-view-tabs";
    viewTabs.setAttribute("role", "tablist");

    promptTab = createViewTab("Prompts", VIEW_PROMPTS);
    collectionsTab = createViewTab("Collections", VIEW_COLLECTIONS);
    viewTabs.append(promptTab, collectionsTab);

    searchWrap = document.createElement("div");
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

    collectionsView = document.createElement("section");
    collectionsView.className = "acn-collections-view";
    collectionsView.hidden = true;

    collectionsHeader = document.createElement("div");
    collectionsHeader.className = "acn-collections-header";

    const collectionsTitle = document.createElement("div");
    collectionsTitle.className = "acn-section-title";
    collectionsTitle.textContent = "Collections";

    const createWrap = document.createElement("div");
    createWrap.className = "acn-collection-create";

    collectionNameInput = document.createElement("input");
    collectionNameInput.className = "acn-collection-input";
    collectionNameInput.type = "text";
    collectionNameInput.placeholder = "Collection name";
    collectionNameInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        createCollectionFromInput();
      }
    });

    const createCollectionButton = document.createElement("button");
    createCollectionButton.className = "acn-collection-create-button";
    createCollectionButton.type = "button";
    createCollectionButton.textContent = "Create";
    createCollectionButton.addEventListener("click", createCollectionFromInput);

    createWrap.append(collectionNameInput, createCollectionButton);

    collectionsHeader.append(collectionsTitle, createWrap);

    collectionStatus = document.createElement("div");
    collectionStatus.className = "acn-collection-status";
    collectionStatus.hidden = true;

    collectionsEmpty = document.createElement("div");
    collectionsEmpty.className = "acn-collections-empty";
    collectionsEmpty.hidden = true;

    const collectionsEmptyTitle = document.createElement("div");
    collectionsEmptyTitle.className = "acn-collections-empty-title";
    collectionsEmptyTitle.textContent = "No collections yet";

    const collectionsEmptyText = document.createElement("div");
    collectionsEmptyText.className = "acn-collections-empty-text";
    collectionsEmptyText.textContent = "Collections will let you group related conversations by topic.";

    collectionsEmpty.append(collectionsEmptyTitle, collectionsEmptyText);

    collectionList = document.createElement("div");
    collectionList.className = "acn-collection-list";

    collectionDetail = document.createElement("div");
    collectionDetail.className = "acn-collection-detail";
    collectionDetail.hidden = true;

    collectionsView.append(collectionsHeader, collectionStatus, collectionsEmpty, collectionList, collectionDetail);

    compactHeader.append(modeToggleButton);
    panel.append(panelHeader, meta, viewTabs, searchWrap, pinnedSection, list, emptyState, collectionsView);
    root.append(compactHeader, compactTimeline, panel);
    document.documentElement.appendChild(root);
    document.addEventListener("click", handleOutsidePanelClick);
    setPanelView(VIEW_PROMPTS);
  }

  function createViewTab(label, view) {
    const tab = document.createElement("button");
    tab.className = "acn-view-tab";
    tab.type = "button";
    tab.setAttribute("role", "tab");
    tab.dataset.view = view;
    tab.textContent = label;
    tab.addEventListener("click", () => setPanelView(view));
    return tab;
  }

  function setPanelView(view) {
    activePanelView = view === VIEW_COLLECTIONS ? VIEW_COLLECTIONS : VIEW_PROMPTS;
    const showingCollections = activePanelView === VIEW_COLLECTIONS;

    if (promptTab) {
      promptTab.classList.toggle("acn-view-tab-active", !showingCollections);
      promptTab.setAttribute("aria-selected", showingCollections ? "false" : "true");
    }

    if (collectionsTab) {
      collectionsTab.classList.toggle("acn-view-tab-active", showingCollections);
      collectionsTab.setAttribute("aria-selected", showingCollections ? "true" : "false");
    }

    if (searchWrap) {
      searchWrap.hidden = showingCollections;
    }

    if (pinnedSection) {
      pinnedSection.hidden = showingCollections || !pinnedList || pinnedList.children.length === 0;
    }

    if (list) {
      list.hidden = showingCollections;
    }

    if (emptyState) {
      emptyState.hidden = showingCollections || emptyState.hidden;
    }

    if (collectionsView) {
      collectionsView.hidden = !showingCollections;
    }

    if (showingCollections) {
      renderCollectionsView();
    } else {
      renderPromptList(false);
    }
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

  function startActivePromptTracking() {
    attachActivePromptScrollListener();
    window.addEventListener("resize", scheduleActivePromptUpdate);
    scheduleActivePromptUpdate();
  }

  function attachActivePromptScrollListener() {
    const nextScrollContainer = findScrollContainer();
    if (!nextScrollContainer || nextScrollContainer === activeScrollContainer) {
      return;
    }

    if (activeScrollContainer) {
      activeScrollContainer.removeEventListener("scroll", handleActivePromptScroll);
    }

    activeScrollContainer = nextScrollContainer;
    activeScrollContainer.addEventListener("scroll", handleActivePromptScroll, { passive: true });
    debugNavigator("[PromptNavigator] scroll container", activeScrollContainer);
  }

  function handleActivePromptScroll() {
    debugNavigator("[PromptNavigator] scroll event fired", {
      scrollContainer: activeScrollContainer
    });

    if (isProgrammaticScrolling) {
      return;
    }

    scheduleActivePromptUpdate();
  }

  function getScrollContainer() {
    return activeScrollContainer || findScrollContainer();
  }

  function findScrollContainer() {
    const promptScrollContainer = findPromptScrollContainer();
    if (promptScrollContainer) {
      return promptScrollContainer;
    }

    const candidates = uniqueElements([
      document.scrollingElement,
      document.documentElement,
      document.body,
      ...document.querySelectorAll("main, [role='main'], .overflow-y-auto, .overflow-auto")
    ]);

    return candidates.find(isScrollableContainer) || window;
  }

  function findPromptScrollContainer() {
    const prompt = currentPrompts.find((entry) => entry.element && entry.element.isConnected);
    let element = prompt ? prompt.element.parentElement : null;

    while (element && element !== document.body && element !== document.documentElement) {
      if (isScrollableContainer(element)) {
        return element;
      }

      element = element.parentElement;
    }

    return null;
  }

  function isScrollableContainer(element) {
    if (!element || !(element instanceof HTMLElement)) {
      return false;
    }

    const style = getComputedStyle(element);
    const overflowY = style.overflowY;
    const canScroll = element.scrollHeight > element.clientHeight + 1;
    const allowsScroll =
      overflowY === "auto" ||
      overflowY === "scroll" ||
      overflowY === "overlay" ||
      element === document.scrollingElement;

    return canScroll && allowsScroll;
  }

  function scheduleUpdate() {
    if (isProgrammaticScrolling) {
      delayedUpdateAfterProgrammaticScroll = true;
      return;
    }

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

  function resolvePromptByOriginalIndex(originalIndex) {
    return currentPrompts.find((prompt) => prompt.originalIndex === originalIndex) || null;
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

    if (activePanelView === VIEW_COLLECTIONS) {
      searchWrap.hidden = true;
      pinnedSection.hidden = true;
      list.hidden = true;
      emptyState.hidden = true;
    }

    lastRenderedPromptCount = messages.length;
    attachActivePromptScrollListener();
    scheduleActivePromptUpdate();
  }

  function renderCollectionsView() {
    if (!collectionsView || !collectionList || !collectionsEmpty || !collectionDetail) {
      return;
    }

    const renderToken = collectionsRenderToken + 1;
    collectionsRenderToken = renderToken;
    collectionList.textContent = "";
    collectionList.hidden = false;
    collectionDetail.textContent = "";
    collectionDetail.hidden = true;
    collectionsEmpty.hidden = false;
    if (collectionsHeader) {
      collectionsHeader.hidden = false;
    }

    loadCollectionsState().then((state) => {
      if (renderToken !== collectionsRenderToken) {
        return;
      }

      const normalizedState = normalizeCollectionsState(state);
      const collections = normalizedState.collectionOrder
        .map((collectionId) => normalizedState.collectionsById[collectionId])
        .filter(Boolean);

      collectionList.textContent = "";
      collectionDetail.textContent = "";

      if (selectedCollectionId) {
        const selectedCollection = normalizedState.collectionsById[selectedCollectionId];
        if (selectedCollection) {
          renderCollectionDetailView(selectedCollection, normalizedState);
          return;
        }

        selectedCollectionId = "";
      }

      if (collectionsHeader) {
        collectionsHeader.hidden = false;
      }
      collectionList.hidden = false;
      collectionDetail.hidden = true;
      collectionsEmpty.hidden = collections.length > 0;

      collections.forEach((collection) => {
        collectionList.appendChild(createCollectionItem(collection, normalizedState));
      });
    }).catch((error) => {
      debugNavigator("[PromptNavigator] collections view render failed", error);
      if (renderToken !== collectionsRenderToken) {
        return;
      }

      collectionList.textContent = "";
      collectionList.hidden = false;
      collectionDetail.textContent = "";
      collectionDetail.hidden = true;
      collectionsEmpty.hidden = false;
      if (collectionsHeader) {
        collectionsHeader.hidden = false;
      }
    });
  }

  function createCollectionFromInput() {
    if (!collectionNameInput) {
      return;
    }

    const collectionName = collectionNameInput.value.trim();
    if (!collectionName) {
      setCollectionStatus("Enter a collection name");
      return;
    }

    loadCollectionsState().then((state) => {
      const collection = createCollectionDraft(collectionName);
      const nextState = normalizeCollectionsState({
        ...state,
        collectionsById: {
          ...state.collectionsById,
          [collection.id]: collection
        },
        collectionOrder: [...state.collectionOrder, collection.id]
      });

      return saveCollectionsState(nextState).then((saved) => {
        if (!saved) {
          setCollectionStatus("Could not save collection");
          return;
        }

        collectionNameInput.value = "";
        setCollectionStatus("Created");
        renderCollectionsView();
      });
    }).catch((error) => {
      debugNavigator("[PromptNavigator] collection create failed", error);
      setCollectionStatus("Could not save collection");
    });
  }

  function createCollectionItem(collection, state) {
    const item = document.createElement("div");
    item.className = "acn-collection-item";

    const body = document.createElement("div");
    body.className = "acn-collection-body";
    body.tabIndex = 0;
    body.setAttribute("role", "button");
    body.setAttribute("aria-label", `View ${collection.name || "Untitled collection"}`);
    body.addEventListener("click", () => showCollectionDetail(collection.id));
    body.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showCollectionDetail(collection.id);
      }
    });

    const title = document.createElement("div");
    title.className = "acn-collection-title";
    title.textContent = collection.name || "Untitled collection";

    const meta = document.createElement("div");
    meta.className = "acn-collection-meta";
    const conversationCount = collection.conversationIds.length;
    const countText = `${conversationCount} ${conversationCount === 1 ? "conversation" : "conversations"}`;
    const updatedAt = formatCollectionUpdatedAt(collection.updatedAt);
    meta.textContent = "";
    const count = document.createElement("span");
    count.className = "acn-collection-count";
    count.textContent = countText;
    meta.appendChild(count);
    if (updatedAt) {
      const updated = document.createElement("span");
      updated.className = "acn-collection-updated";
      updated.textContent = `Updated ${updatedAt}`;
      meta.append(" · ", updated);
    }

    body.append(title, meta);

    const action = document.createElement("button");
    action.className = "acn-collection-action";
    action.type = "button";
    action.textContent = "Add current";
    action.addEventListener("click", (event) => {
      event.stopPropagation();
      addCurrentConversationToCollection(collection.id, action);
    });

    const conversationMetadata = getCurrentConversationMetadata();
    const currentConversationId = generateSavedConversationId(conversationMetadata);
    const conversationIds = Array.isArray(collection.conversationIds) ? collection.conversationIds : [];
    if (conversationIds.includes(currentConversationId)) {
      action.textContent = "Added";
      action.disabled = true;
    }

    item.append(body, action);
    return item;
  }

  function showCollectionDetail(collectionId) {
    selectedCollectionId = collectionId || "";
    renderCollectionsView();
  }

  function showCollectionList() {
    selectedCollectionId = "";
    renderCollectionsView();
  }

  function renderCollectionDetailView(collection, state) {
    if (!collectionDetail || !collectionList || !collectionsEmpty) {
      return;
    }

    if (collectionsHeader) {
      collectionsHeader.hidden = true;
    }
    collectionList.hidden = true;
    collectionsEmpty.hidden = true;
    collectionDetail.hidden = false;
    collectionDetail.textContent = "";

    const header = document.createElement("div");
    header.className = "acn-collection-detail-header";

    const backButton = document.createElement("button");
    backButton.className = "acn-collection-back-button";
    backButton.type = "button";
    backButton.textContent = "Back";
    backButton.addEventListener("click", showCollectionList);

    const titleWrap = document.createElement("div");
    titleWrap.className = "acn-collection-detail-title-wrap";

    const title = document.createElement("div");
    title.className = "acn-collection-detail-title";
    title.textContent = collection.name || "Untitled collection";

    const conversationIds = Array.isArray(collection.conversationIds) ? collection.conversationIds : [];
    const savedConversations = conversationIds
      .map((conversationId) => state.savedConversationsById[conversationId])
      .filter(Boolean);
    const count = document.createElement("div");
    count.className = "acn-collection-detail-count";
    count.textContent = `${savedConversations.length} ${savedConversations.length === 1 ? "conversation" : "conversations"}`;

    titleWrap.append(title, count);
    header.append(backButton, titleWrap);

    const savedConversationList = document.createElement("div");
    savedConversationList.className = "acn-saved-conversation-list";

    if (savedConversations.length === 0) {
      const empty = document.createElement("div");
      empty.className = "acn-collection-detail-empty";
      const emptyTitle = document.createElement("div");
      emptyTitle.className = "acn-collection-detail-empty-title";
      emptyTitle.textContent = "No conversations in this collection yet";
      const emptyText = document.createElement("div");
      emptyText.className = "acn-collection-detail-empty-text";
      emptyText.textContent = "Back to Collections and use Add current to save this conversation.";
      empty.append(emptyTitle, emptyText);
      collectionDetail.append(header, empty);
      return;
    }

    savedConversations.forEach((savedConversation) => {
      savedConversationList.appendChild(createSavedConversationItem(savedConversation));
    });

    collectionDetail.append(header, savedConversationList);
  }

  function createSavedConversationItem(savedConversation) {
    const item = document.createElement("div");
    item.className = "acn-saved-conversation-item";

    const userEditedTitle = savedConversation.userEditedTitle && savedConversation.userEditedTitle.trim();
    const titleText = userEditedTitle || savedConversation.sourceTitle || savedConversation.title || "Untitled conversation";
    const title = document.createElement("div");
    title.className = "acn-saved-conversation-title";
    title.textContent = titleText;

    const meta = document.createElement("div");
    meta.className = "acn-saved-conversation-meta";
    const metadataText = formatSavedConversationMetadata(savedConversation);
    meta.textContent = metadataText
      ? `${formatSavedConversationPlatform(savedConversation.platform)} · ${metadataText}`
      : formatSavedConversationPlatform(savedConversation.platform);

    item.append(title, meta);

    if (savedConversation.snippet) {
      const snippet = document.createElement("div");
      snippet.className = "acn-saved-conversation-snippet";
      snippet.textContent = savedConversation.snippet;
      item.appendChild(snippet);
    }

    if (savedConversation.conversationUrl) {
      const url = document.createElement("div");
      url.className = "acn-saved-conversation-url";
      url.title = savedConversation.conversationUrl;
      url.textContent = shortenConversationUrl(savedConversation.conversationUrl);
      item.appendChild(url);
    }

    const actions = document.createElement("div");
    actions.className = "acn-saved-conversation-actions";
    const openButton = document.createElement("button");
    openButton.className = "acn-saved-conversation-open";
    openButton.type = "button";
    openButton.textContent = "Open";

    if (isSafeConversationUrl(savedConversation.conversationUrl)) {
      openButton.addEventListener("click", (event) => {
        event.stopPropagation();
        openSavedConversationUrl(savedConversation);
      });
    } else {
      openButton.disabled = true;
      openButton.classList.add("acn-saved-conversation-open-disabled");
      openButton.title = "Conversation URL unavailable";
    }

    actions.appendChild(openButton);
    item.appendChild(actions);

    return item;
  }

  function addCurrentConversationToCollection(collectionId, actionButton) {
    if (!collectionId) {
      return;
    }

    if (actionButton) {
      actionButton.disabled = true;
    }

    loadCollectionsState().then((state) => {
      const conversationMetadata = getCurrentConversationMetadata();
      const nextState = addConversationToCollectionState(state, collectionId, conversationMetadata);
      return saveCollectionsState(nextState).then((saved) => {
        if (!saved) {
          setCollectionStatus("Could not save conversation");
          if (actionButton) {
            actionButton.disabled = false;
          }
          return;
        }

        setCollectionStatus("Added");
        renderCollectionsView();
      });
    }).catch((error) => {
      debugNavigator("[PromptNavigator] add current conversation failed", error);
      setCollectionStatus("Could not save conversation");
      if (actionButton) {
        actionButton.disabled = false;
      }
    });
  }

  function setCollectionStatus(message) {
    if (!collectionStatus) {
      return;
    }

    collectionStatus.textContent = message;
    collectionStatus.hidden = !message;
  }

  function formatCollectionUpdatedAt(updatedAt) {
    if (!updatedAt) {
      return "";
    }

    const date = new Date(updatedAt);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString();
  }

  function formatSavedConversationPlatform(platform) {
    return platform === "chatgpt" ? "ChatGPT" : "ChatGPT";
  }

  function formatSavedConversationMetadata(savedConversation) {
    const visited = formatSavedConversationDate(savedConversation.lastVisitedAt);
    if (visited) {
      return `Visited ${visited}`;
    }

    const updated = formatSavedConversationDate(savedConversation.updatedAt);
    if (updated) {
      return `Updated ${updated}`;
    }

    const added = formatSavedConversationDate(savedConversation.addedAt);
    return added ? `Added ${added}` : "";
  }

  function formatSavedConversationDate(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString();
  }

  function shortenConversationUrl(url) {
    try {
      const parsedUrl = new URL(url);
      return `${parsedUrl.hostname}${parsedUrl.pathname}`;
    } catch (error) {
      return truncateText(url, 72);
    }
  }

  function isSafeConversationUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== "string") {
      return false;
    }

    try {
      const url = new URL(rawUrl);
      return (
        url.protocol === "https:" &&
        url.hostname === "chatgpt.com" &&
        url.pathname.startsWith("/")
      );
    } catch (error) {
      return false;
    }
  }

  function openSavedConversationUrl(savedConversation) {
    const safeUrl = savedConversation && isSafeConversationUrl(savedConversation.conversationUrl)
      ? savedConversation.conversationUrl
      : "";
    if (!safeUrl) {
      return false;
    }

    window.open(safeUrl, "_blank", "noopener,noreferrer");
    return true;
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
    item.dataset.promptIndex = String(promptNumber);
    item.setAttribute("role", "button");
    item.tabIndex = 0;
    item.classList.toggle("is-pinned", pinned);
    item.classList.toggle("is-active", isPromptActive(promptKey, promptNumber));

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
      item.addEventListener("click", () => handlePromptClick(promptId, "pinned", promptNumber));
    } else {
      item.addEventListener("click", () => handlePromptClick(promptId, "expanded", promptNumber));
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
    dot.classList.toggle("is-active", isPromptActive(prompt.id, prompt.index));
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
    handlePromptClick(promptId, "compact", Number(dot.dataset.promptNumber));
  }

  function handleCompactTimelineClick(event) {
    const dot = event.target.closest(".acn-compact-dot");
    if (!dot || !compactTimeline || !compactTimeline.contains(dot)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    handlePromptClick(dot.dataset.promptId, "compact", Number(dot.dataset.promptNumber));
  }

  function showCompactTooltip(dot, prompt) {
    if (!dot || !prompt) {
      return;
    }

    const promptNumber = dot.dataset.promptNumber;
    const promptPreview = getCompactTooltipPreview(prompt);
    const promptIndex = Number(promptNumber);
    debugNavigator("[Prompt Navigator][Compact Tooltip] show", {
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
    compactTooltip.style.width = "";

    const numberLine = document.createElement("div");
    numberLine.className = "acn-dot-tooltip-number";
    numberLine.textContent = `#${promptNumber}`;

    const previewLine = document.createElement("div");
    previewLine.className = "acn-dot-tooltip-preview";
    const fullPromptPreview = promptPreview;
    previewLine.textContent = fullPromptPreview;

    compactTooltip.append(numberLine, previewLine);
    compactTooltipFrame = window.requestAnimationFrame(() => {
      compactTooltipFrame = null;
      layoutCompactTooltip(dot, promptIndex, fullPromptPreview);
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
    debugNavigator("[Prompt Navigator][Compact Tooltip] layout", {
      dotRect,
      tooltipRect,
      top,
      left,
      promptIndex,
      preview
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

  function getCompactTooltipPreview(prompt) {
    const text = prompt && prompt.text ? prompt.text : "";
    if (text.length <= COMPACT_TOOLTIP_MAX_TEXT_LENGTH) {
      return text;
    }

    return `${text.slice(0, COMPACT_TOOLTIP_MAX_TEXT_LENGTH)}...`;
  }

  function handlePromptClick(promptId, source, displayedIndex) {
    let prompt = findPromptById(promptId);
    const originalIndex = prompt ? prompt.originalIndex : null;

    refreshPrompts();
    prompt =
      originalIndex === null
        ? findPromptById(promptId)
        : resolvePromptByOriginalIndex(originalIndex) || findPromptById(promptId);

    debugNavigator("[PromptNavigator] prompt click", {
      source: source || "expanded",
      displayedIndex,
      originalIndex: prompt ? prompt.originalIndex : null,
      promptId,
      textPreview: prompt && prompt.text ? prompt.text.slice(0, 80) : ""
    });
    debugNavigator("[PromptNavigator] click jump start", {
      source: source || "expanded",
      displayedIndex,
      originalIndex: prompt ? prompt.originalIndex : originalIndex,
      promptId: prompt ? prompt.id : promptId,
      textPreview: prompt && prompt.text ? prompt.text.slice(0, 80) : ""
    });

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
    const scrollContainer = getScrollContainer();
    setActivePrompt(prompt.id, prompt.index);
    debugPromptClick(prompt, source, true);
    beginProgrammaticScrolling();

    debugNavigator("[PromptNavigator] scroll target", {
      originalIndex: prompt.originalIndex,
      promptId: prompt.id,
      targetExists: !!element,
      targetText: element.innerText ? element.innerText.slice(0, 80) : "",
      scrollContainer
    });
    scrollToPromptElement(element, prompt.originalIndex);

    element.classList.add(HIGHLIGHT_CLASS);
    window.setTimeout(() => {
      element.classList.remove(HIGHLIGHT_CLASS);
    }, HIGHLIGHT_DELAY_MS);
  }

  function beginProgrammaticScrolling() {
    isProgrammaticScrolling = true;
    window.clearTimeout(programmaticScrollTimer);
    window.clearTimeout(updateTimer);
    if (activePromptFrame !== null) {
      window.cancelAnimationFrame(activePromptFrame);
      activePromptFrame = null;
    }
    delayedUpdateAfterProgrammaticScroll = true;
    programmaticScrollTimer = window.setTimeout(() => {
      isProgrammaticScrolling = false;
      if (delayedUpdateAfterProgrammaticScroll) {
        delayedUpdateAfterProgrammaticScroll = false;
        scheduleUpdate();
      }
      scheduleActivePromptUpdate();
    }, PROGRAMMATIC_SCROLL_LOCK_MS);
  }

  function scrollToPromptElement(element, originalIndex) {
    if (!element) {
      return;
    }

    const correctionState = {
      passes: 0
    };
    manualScrollToElement(element, true);
    debugNavigator("[PromptNavigator] manual positioning", {
      originalIndex,
      rectTop: element.getBoundingClientRect().top
    });

    const correctLatestPrompt = (reason) => {
      if (correctionState.passes >= MAX_SCROLL_CORRECTION_PASSES) {
        return;
      }

      const latestPrompt = resolvePromptByOriginalIndex(originalIndex);
      const latestElement = latestPrompt && latestPrompt.element ? latestPrompt.element : element;
      const corrected = manualScrollToElement(latestElement, false);

      if (corrected) {
        correctionState.passes += 1;
      }

      debugNavigator("[PromptNavigator] precise positioning", {
        originalIndex,
        reason,
        rectTop: latestElement.getBoundingClientRect().top,
        corrected,
        correctionPasses: correctionState.passes
      });

      return latestElement;
    };

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const latestElement = correctLatestPrompt("layout") || element;

        window.setTimeout(
          () => verifyPromptVisible(latestElement, originalIndex, correctionState),
          CORRECTION_CHECK_DELAY_MS
        );
        window.setTimeout(
          () => verifyPromptVisible(latestElement, originalIndex, correctionState),
          FINAL_CORRECTION_CHECK_DELAY_MS
        );
      });
    });
  }

  function manualScrollToElement(element, force) {
    if (!element || !element.isConnected) {
      return false;
    }

    const scrollContainer = getScrollContainer();
    const offset = COMPACT_SCROLL_OFFSET_PX;
    const rect = element.getBoundingClientRect();
    let currentTop = 0;
    let targetTop = 0;

    if (isWindowScrollContainer(scrollContainer)) {
      currentTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      targetTop = Math.max(rect.top + currentTop - offset, 0);
      if (!force && Math.abs(targetTop - currentTop) < SCROLL_CORRECTION_THRESHOLD_PX) {
        return false;
      }

      window.scrollTo({
        top: targetTop,
        behavior: "auto"
      });
      return true;
    }

    const containerRect = scrollContainer.getBoundingClientRect();
    currentTop = scrollContainer.scrollTop;
    targetTop = Math.max(currentTop + rect.top - containerRect.top - offset, 0);
    if (!force && Math.abs(targetTop - currentTop) < SCROLL_CORRECTION_THRESHOLD_PX) {
      return false;
    }

    scrollContainer.scrollTo({
      top: targetTop,
      behavior: "auto"
    });
    return true;
  }

  function verifyPromptVisible(element, originalIndex, correctionState) {
    if (!isProgrammaticScrolling || !element || !element.isConnected) {
      return;
    }

    const latestPrompt = resolvePromptByOriginalIndex(originalIndex);
    const latestElement = latestPrompt && latestPrompt.element ? latestPrompt.element : element;
    const rect = latestElement.getBoundingClientRect();
    const targetBandTop = window.innerHeight * 0.15;
    const targetBandBottom = window.innerHeight * 0.55;
    const corrected = rect.top < targetBandTop || rect.top > targetBandBottom;

    debugNavigator("[PromptNavigator] correction check", {
      originalIndex,
      rectTop: rect.top,
      targetBandTop,
      targetBandBottom,
      corrected,
      correctionPasses: correctionState.passes
    });

    if (corrected && correctionState.passes < MAX_SCROLL_CORRECTION_PASSES) {
      const didCorrect = manualScrollToElement(latestElement, false);
      if (didCorrect) {
        correctionState.passes += 1;
      }
    }
  }

  function isWindowScrollContainer(scrollContainer) {
    return (
      scrollContainer === window ||
      scrollContainer === document.scrollingElement ||
      scrollContainer === document.documentElement ||
      scrollContainer === document.body
    );
  }

  function debugPromptClick(prompt, source, targetFound) {
    debugNavigator("jump requested", {
      source: source || "list",
      index: prompt.index,
      promptId: prompt.id,
      promptText: prompt.preview,
      targetFound,
      targetElement: prompt.element,
      activePromptId: activePromptKey,
      activePromptIndex
    });
  }

  function debugNavigator(message, details) {
    if (!DEBUG_NAVIGATOR) {
      return;
    }

    console.debug("[PromptNavigator]", message, details);
  }

  function setActivePrompt(promptKey, promptIndex) {
    if (activePromptKey === promptKey && activePromptIndex === promptIndex) {
      return;
    }

    activePromptKey = promptKey;
    activePromptIndex = promptIndex;

    if (!root) {
      return;
    }

    root.querySelectorAll(".acn-item").forEach((item) => {
      item.classList.toggle("is-active", isPromptActive(item.dataset.promptKey, Number(item.dataset.promptIndex)));
    });

    root.querySelectorAll(".acn-compact-dot").forEach((dot) => {
      dot.classList.toggle("is-active", isPromptActive(dot.dataset.promptKey, Number(dot.dataset.promptNumber)));
    });
  }

  function isPromptActive(promptKey, promptIndex) {
    return promptKey === activePromptKey && promptIndex === activePromptIndex;
  }

  function scheduleActivePromptUpdate() {
    if (isProgrammaticScrolling) {
      return;
    }

    if (activePromptFrame !== null) {
      return;
    }

    activePromptFrame = window.requestAnimationFrame(() => {
      activePromptFrame = null;
      updateActivePromptFromViewport();
    });
  }

  function updateActivePromptFromViewport() {
    if (!currentPrompts.length) {
      setActivePrompt(null, -1);
      debugNavigator("[PromptNavigator] active update", {
        activePromptIndex,
        promptCount: 0,
        reason: "empty"
      });
      return;
    }

    let bestPrompt = null;
    let previousPrompt = null;
    let firstPrompt = null;
    let bestScore = Infinity;
    let reason = "visible";
    const viewportMiddle = window.innerHeight * ACTIVE_PROMPT_VIEWPORT_RATIO;

    currentPrompts.forEach((prompt) => {
      if (!prompt.element || !prompt.element.isConnected) {
        return;
      }

      if (!firstPrompt) {
        firstPrompt = prompt;
      }

      const rect = prompt.element.getBoundingClientRect();
      if (rect.top <= viewportMiddle) {
        previousPrompt = prompt;
      }

      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        return;
      }

      const score = getPromptViewportScore(prompt.element);
      if (score < bestScore) {
        bestScore = score;
        bestPrompt = prompt;
      }
    });

    if (!bestPrompt) {
      bestPrompt = previousPrompt || firstPrompt;
      reason = previousPrompt ? "previous" : "first";
    }

    if (bestPrompt) {
      setActivePrompt(bestPrompt.id, bestPrompt.index);
    }

    debugNavigator("[PromptNavigator] active update", {
      activePromptIndex,
      promptCount: currentPrompts.length,
      reason
    });
  }

  function getPromptViewportScore(element) {
    const rect = element.getBoundingClientRect();
    const viewportTarget = window.innerHeight * ACTIVE_PROMPT_VIEWPORT_RATIO;
    const promptCenter = rect.top + rect.height / 2;

    return Math.abs(promptCenter - viewportTarget);
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

  function getCollectionsStorageKey() {
    return COLLECTIONS_STORAGE_KEY;
  }

  function getDefaultCollectionsState() {
    return {
      schemaVersion: 1,
      collectionsById: {},
      savedConversationsById: {},
      collectionOrder: []
    };
  }

  function normalizeCollectionsState(rawState) {
    const defaultState = getDefaultCollectionsState();
    if (!rawState || typeof rawState !== "object") {
      return defaultState;
    }

    const collectionsById = normalizeCollectionsById(rawState.collectionsById);
    const savedConversationsById = normalizeSavedConversationsById(rawState.savedConversationsById);
    const normalizedCollectionOrder = Array.isArray(rawState.collectionOrder)
      ? rawState.collectionOrder.filter((id) => typeof id === "string" && collectionsById[id])
      : Object.keys(collectionsById);
    const collectionOrder = uniqueStrings([...normalizedCollectionOrder, ...Object.keys(collectionsById)]);

    Object.values(collectionsById).forEach((collection) => {
      collection.conversationIds = collection.conversationIds.filter((id) => savedConversationsById[id]);
    });

    Object.values(savedConversationsById).forEach((conversation) => {
      conversation.collectionIds = conversation.collectionIds.filter((id) => collectionsById[id]);
    });

    return {
      schemaVersion: 1,
      collectionsById,
      savedConversationsById,
      collectionOrder
    };
  }

  function normalizeCollectionsById(collectionsById) {
    if (!collectionsById || typeof collectionsById !== "object" || Array.isArray(collectionsById)) {
      return {};
    }

    return Object.entries(collectionsById).reduce((normalized, [id, collection]) => {
      if (!id || !collection || typeof collection !== "object" || Array.isArray(collection)) {
        return normalized;
      }

      normalized[id] = {
        id,
        name: typeof collection.name === "string" && collection.name.trim() ? collection.name.trim() : "Untitled collection",
        description: typeof collection.description === "string" ? collection.description : "",
        createdAt: typeof collection.createdAt === "string" ? collection.createdAt : new Date().toISOString(),
        updatedAt: typeof collection.updatedAt === "string" ? collection.updatedAt : new Date().toISOString(),
        conversationIds: Array.isArray(collection.conversationIds)
          ? uniqueStrings(collection.conversationIds)
          : []
      };

      return normalized;
    }, {});
  }

  function normalizeSavedConversationsById(savedConversationsById) {
    if (!savedConversationsById || typeof savedConversationsById !== "object" || Array.isArray(savedConversationsById)) {
      return {};
    }

    return Object.entries(savedConversationsById).reduce((normalized, [id, conversation]) => {
      if (!id || !conversation || typeof conversation !== "object" || Array.isArray(conversation)) {
        return normalized;
      }

      normalized[id] = {
        id,
        platform: conversation.platform === "chatgpt" ? "chatgpt" : "chatgpt",
        conversationUrl: typeof conversation.conversationUrl === "string" ? conversation.conversationUrl : "",
        conversationId: typeof conversation.conversationId === "string" ? conversation.conversationId : "",
        title: typeof conversation.title === "string" && conversation.title.trim()
          ? conversation.title.trim()
          : "Untitled ChatGPT conversation",
        sourceTitle: typeof conversation.sourceTitle === "string" ? conversation.sourceTitle : "",
        userEditedTitle: typeof conversation.userEditedTitle === "string" ? conversation.userEditedTitle : "",
        snippet: typeof conversation.snippet === "string" ? truncateText(conversation.snippet, 120) : "",
        addedAt: typeof conversation.addedAt === "string" ? conversation.addedAt : new Date().toISOString(),
        updatedAt: typeof conversation.updatedAt === "string" ? conversation.updatedAt : new Date().toISOString(),
        lastVisitedAt: typeof conversation.lastVisitedAt === "string" ? conversation.lastVisitedAt : "",
        collectionIds: Array.isArray(conversation.collectionIds)
          ? uniqueStrings(conversation.collectionIds)
          : []
      };

      return normalized;
    }, {});
  }

  function loadCollectionsState() {
    return new Promise((resolve) => {
      const storage = getLocalStorageApi();
      if (!storage) {
        resolve(getDefaultCollectionsState());
        return;
      }

      try {
        storage.get([COLLECTIONS_STORAGE_KEY], (result) => {
          resolve(normalizeCollectionsState(result && result[COLLECTIONS_STORAGE_KEY]));
        });
      } catch (error) {
        debugNavigator("[PromptNavigator] collections load failed", error);
        resolve(getDefaultCollectionsState());
      }
    });
  }

  function saveCollectionsState(state) {
    const storage = getLocalStorageApi();
    if (!storage) {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      try {
        storage.set(
          {
            [COLLECTIONS_STORAGE_KEY]: normalizeCollectionsState(state)
          },
          () => resolve(true)
        );
      } catch (error) {
        debugNavigator("[PromptNavigator] collections save failed", error);
        resolve(false);
      }
    });
  }

  function generateCollectionId() {
    return `collection_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function generateSavedConversationId(metadata) {
    const safeMetadata = metadata || {};
    const platform = safeMetadata.platform || "chatgpt";
    if (safeMetadata.conversationId) {
      return `conversation_${platform}_${safeMetadata.conversationId}`;
    }

    return `conversation_${platform}_${hashString(safeMetadata.conversationUrl)}`;
  }

  function hashString(input) {
    const text = String(input || "");
    let hash = 0;

    for (let index = 0; index < text.length; index += 1) {
      hash = (hash << 5) - hash + text.charCodeAt(index);
      hash |= 0;
    }

    return Math.abs(hash).toString(36);
  }

  function getCanonicalConversationUrl(urlOrLocation) {
    try {
      const source = urlOrLocation || location.href;
      const url = typeof source === "string" ? new URL(source, location.origin) : new URL(source.href);
      return `${url.origin}${url.pathname}`;
    } catch (error) {
      return getConversationKey();
    }
  }

  function parseChatGPTConversationId(urlOrPathname) {
    try {
      const pathname = String(urlOrPathname || location.pathname).startsWith("/")
        ? String(urlOrPathname || location.pathname)
        : new URL(String(urlOrPathname), location.origin).pathname;
      const match = pathname.match(/^\/c\/([^/?#]+)/);
      return match ? decodeURIComponent(match[1]) : "";
    } catch (error) {
      return "";
    }
  }

  function getCurrentConversationMetadata() {
    const conversationUrl = getCanonicalConversationUrl();
    const sourceTitle = getCleanDocumentTitle();
    const firstPrompt = currentPrompts[0];

    return {
      platform: "chatgpt",
      conversationUrl,
      conversationId: parseChatGPTConversationId(conversationUrl),
      title: sourceTitle || "Untitled ChatGPT conversation",
      sourceTitle,
      snippet: firstPrompt && firstPrompt.text ? truncateText(firstPrompt.text, 120) : ""
    };
  }

  function createCollectionDraft(name) {
    const now = new Date().toISOString();
    return {
      id: generateCollectionId(),
      name: typeof name === "string" && name.trim() ? name.trim() : "Untitled collection",
      description: "",
      createdAt: now,
      updatedAt: now,
      conversationIds: []
    };
  }

  function createSavedConversationDraft(metadata) {
    const safeMetadata = metadata || {};
    const now = new Date().toISOString();
    const draft = {
      id: "",
      platform: safeMetadata.platform === "chatgpt" ? "chatgpt" : "chatgpt",
      conversationUrl: safeMetadata.conversationUrl || getCanonicalConversationUrl(),
      conversationId: safeMetadata.conversationId || "",
      title: safeMetadata.title || "Untitled ChatGPT conversation",
      sourceTitle: safeMetadata.sourceTitle || "",
      userEditedTitle: "",
      snippet: safeMetadata.snippet ? truncateText(safeMetadata.snippet, 120) : "",
      addedAt: now,
      updatedAt: now,
      lastVisitedAt: now,
      collectionIds: []
    };
    draft.id = generateSavedConversationId(draft);

    return draft;
  }

  function addConversationToCollectionState(state, collectionId, conversationMetadata) {
    const nextState = normalizeCollectionsState(state);
    const collection = nextState.collectionsById[collectionId];
    if (!collection) {
      return nextState;
    }

    const draft = createSavedConversationDraft(conversationMetadata);
    const existingConversation = nextState.savedConversationsById[draft.id];
    const savedConversation = existingConversation
      ? { ...existingConversation, ...draft, addedAt: existingConversation.addedAt, collectionIds: existingConversation.collectionIds }
      : draft;
    const savedConversationId = savedConversation.id;

    if (!collection.conversationIds.includes(savedConversationId)) {
      collection.conversationIds.push(savedConversationId);
      collection.updatedAt = new Date().toISOString();
    }

    if (!savedConversation.collectionIds.includes(collectionId)) {
      savedConversation.collectionIds = [...savedConversation.collectionIds, collectionId];
    }

    savedConversation.updatedAt = new Date().toISOString();
    savedConversation.lastVisitedAt = new Date().toISOString();
    nextState.savedConversationsById[savedConversationId] = savedConversation;

    return nextState;
  }

  function removeConversationFromCollectionState(state, collectionId, savedConversationId) {
    const nextState = normalizeCollectionsState(state);
    const collection = nextState.collectionsById[collectionId];
    const savedConversation = nextState.savedConversationsById[savedConversationId];

    if (collection) {
      collection.conversationIds = collection.conversationIds.filter((id) => id !== savedConversationId);
      collection.updatedAt = new Date().toISOString();
    }

    if (savedConversation) {
      savedConversation.collectionIds = savedConversation.collectionIds.filter((id) => id !== collectionId);
      savedConversation.updatedAt = new Date().toISOString();
    }

    return nextState;
  }

  function getCleanDocumentTitle() {
    if (typeof document === "undefined" || !document.title) {
      return "";
    }

    return document.title
      .replace(/\s*[-|]\s*ChatGPT\s*$/i, "")
      .replace(/^\s*ChatGPT\s*[-|]\s*/i, "")
      .trim();
  }

  function uniqueStrings(values) {
    return [...new Set(values.filter((value) => typeof value === "string" && value))];
  }

  function truncateText(text, maxLength) {
    const normalizedText = String(text || "").replace(/\s+/g, " ").trim();
    if (normalizedText.length <= maxLength) {
      return normalizedText;
    }

    return normalizedText.slice(0, maxLength - 1).trimEnd();
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
      originalIndex: index - 1,
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
