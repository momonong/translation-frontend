chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "extract_keywords",
      title: "🧠 Analyze with Semantic Helper",
      contexts: ["selection"]
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "extract_keywords") {
      const selectedText = info.selectionText;
      const encoded = encodeURIComponent(selectedText);
  
      chrome.windows.create({
        url: `chrome-extension://${chrome.runtime.id}/index.html?text=${encoded}`,
        type: "popup",
        width: 1024,
        height: 700
      });
    }
  });
  