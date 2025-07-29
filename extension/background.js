chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "translate-selection",
      title: "Translate",
      contexts: ["selection"]
    });
    chrome.contextMenus.create({
      id: "ocr-area",
      title: "OCR translate",
      contexts: ["page", "frame", "image"]
    });
    chrome.contextMenus.create({
      id: "open-pdf-ocr-tool",
      title: "開啟 PDF OCR 工具",
      contexts: ["page", "frame"]
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "translate-selection" && tab.id && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      type: "SHOW_TRANSLATE_FLOAT",
      text: info.selectionText
    });
  }
  if (info.menuItemId === "ocr-area" && tab.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: "START_OCR_AREA_SELECTION"
    });
  }
  if (info.menuItemId === "open-pdf-ocr-tool") {
    chrome.tabs.create({
      // ✅ 修正：移除了 'dist/' 前綴
      url: chrome.runtime.getURL("pdf.html")
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "OPEN_GRAPH_TAB" && message.text) {
    chrome.tabs.create({
      // ✅ 修正：移除了 'dist/' 前綴
      url: chrome.runtime.getURL(`index.html?text=${encodeURIComponent(message.text)}`)
    });
  }
});