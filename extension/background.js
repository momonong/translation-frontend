chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "popup-translate",
    title: "翻譯所選文字",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "popup-translate" && info.selectionText) {
    chrome.windows.create({
      url: chrome.runtime.getURL("popup.html?text=" + encodeURIComponent(info.selectionText)),
      type: "popup",
      width: 340,
      height: 260
    });
  }
});
