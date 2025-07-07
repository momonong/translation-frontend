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
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.log("[EXT] content-script 未注入，請確定 manifest 路徑跟網頁 reload extension！");
      }      
    });
  }
});

