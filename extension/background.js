// extension/background.js

// 監聽擴充功能安裝或更新事件，用來設定右鍵選單
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "translate-selection",
      title: "翻譯選取文字", // 優化標題
      contexts: ["selection"]
    });
    chrome.contextMenus.create({
      id: "ocr-area",
      title: "OCR 翻譯 (框選區域)", // 優化標題
      contexts: ["page", "frame", "image"]
    });
    chrome.contextMenus.create({
      id: "open-pdf-ocr-tool",
      title: "開啟 PDF OCR 工具",
      contexts: ["page", "frame"]
    });
  });
});

// 監聽右鍵選單的點擊事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // 確保 tab.id 存在
  if (!tab || !tab.id) return;

  if (info.menuItemId === "translate-selection" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      type: "SHOW_TRANSLATE_FLOAT",
      text: info.selectionText
    });
  }
  if (info.menuItemId === "ocr-area") {
    chrome.tabs.sendMessage(tab.id, {
      type: "START_OCR_AREA_SELECTION"
    });
  }
  if (info.menuItemId === "open-pdf-ocr-tool") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("pdf.html") // 確保您有 pdf.html
    });
  }
});

// 監聽來自 content script 的訊息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "OPEN_GRAPH_TAB" && message.text) {
    const url = chrome.runtime.getURL(`index.html?text=${encodeURIComponent(message.text)}`);
    chrome.tabs.create({ url });
  }
});
