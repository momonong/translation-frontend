chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "translate-selection",
    title: "翻譯所選文字",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "translate-selection" && tab.id && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      type: "SHOW_TRANSLATE_FLOAT",
      text: info.selectionText
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "OPEN_GRAPH_TAB" && message.text) {
    chrome.tabs.create({
      url: chrome.runtime.getURL(`index.html?text=${encodeURIComponent(message.text)}`)
    });
  }
});
