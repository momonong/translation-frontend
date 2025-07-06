chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "extract_keywords",
    title: "🧠 Analyze with Semantic Helper",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "extract_keywords" && tab?.id !== undefined) {
    chrome.tabs.sendMessage(tab.id, {
      type: "show_popover",
      text: info.selectionText,
    });
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "open_popup") {
    const encoded = encodeURIComponent(msg.text);
    chrome.windows.create({
      url: chrome.runtime.getURL(`index.html?text=${encoded}`),
      type: "popup",
      width: 1024,
      height: 700,
    });
  }
});
  