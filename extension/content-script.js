const API_BASE_URL = window.API_BASE_URL || "http://localhost:8000";

// 保證只執行一次
if (typeof window.contentScriptLoaded === 'undefined') {
  window.contentScriptLoaded = true;

  // 取得選字所在句子
  function getSentenceContext() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return "";
    const range = selection.getRangeAt(0);
    let node = range.startContainer;
    while (node && node.nodeType !== Node.ELEMENT_NODE) node = node.parentNode;
    if (!node || typeof node.innerText !== 'string') return "";
    const fullText = (node.innerText || node.textContent).replace(/\s+/g, ' ');
    const selectedText = selection.toString().trim();
    if (!selectedText) return "";
    const sentences = fullText.match(/[^.!?。！？]+[.!?。！？]?/g) || [fullText];
    const context = sentences.find(s => s.includes(selectedText)) || selectedText;
    return context.trim();
  }

  // 浮窗相關
  function removeFloat() {
    const oldFloat = document.getElementById('mini-translate-float');
    if (oldFloat) oldFloat.remove();
    document.removeEventListener('mousedown', handleOutsideClick, true);
  }
  function handleOutsideClick(e) {
    const float = document.getElementById('mini-translate-float');
    if (float && !float.contains(e.target)) removeFloat();
  }
  function showTranslateFloat(selected, left, top, context) {
    removeFloat();
    const div = document.createElement('div');
    div.id = 'mini-translate-float';
    div.style.cssText = `
      position: absolute;
      z-index: 2147483647;
      top: ${top + 6}px;
      left: ${left}px;
      background: #fff;
      border: 1.5px solid #d7d7d7;
      border-radius: 10px;
      box-shadow: 0 2px 12px 1px #0001;
      padding: 14px 18px;
      min-width: 210px;
      max-width: 340px;
      font-size: 15px;
      line-height: 1.5;
      transition: box-shadow 0.1s;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    `;
    div.innerHTML = `
      <b>選字：</b>${selected}<br>
      <b>所在句：</b><span style="color:#1e7efb">${context}</span><br>
      <span style="color: #999;">查詢中...</span>
    `;
    document.body.appendChild(div);
    setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick, true);
    }, 10);

    // fetch API
    fetch(`${API_BASE_URL}/api/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: selected,
        context: context
      })
    })
      .then(r => r.json())
      .then(data => {
        let content = "";
        if (typeof data === "string") content = data;
        else if (data.result) content = data.result;
        else if (data.text) content = data.text;
        else if (data.translated) content = data.translated;
        else content = "<span style='color:red'>查無翻譯</span>";

        div.innerHTML = `
          <b>選字：</b>${selected}<br>
          <b>所在句：</b><span style="color:#1e7efb">${context}</span><br>
          <div style="margin: 8px 0 0 0; font-size: 15px; line-height: 1.6; white-space:normal;">${content}</div>
          <div style="display: flex; justify-content: flex-end; align-items: center; margin-top: 8px;">
            <button id="show-kg-btn" style="font-size: 15px; background: linear-gradient(90deg, #257cff 40%, #0dcaf0 100%); color: #fff; border-radius: 6px; border: none; padding: 6px 16px; cursor: pointer; font-weight: 600; box-shadow: 0 1px 8px #257cff22; transition: background 0.2s;">查語意圖譜</button>
            <a href="#" id="close-mini-translate" style="color: #888; margin-left:10px; font-size:15px; text-decoration: none;">關閉</a>
          </div>
        `;
        div.querySelector("#close-mini-translate").onclick = e => {
          e.preventDefault();
          removeFloat();
        };
        const btn = div.querySelector("#show-kg-btn");
        if (btn) {
          btn.onmouseover = () => btn.style.background = "linear-gradient(90deg, #1e60c9 40%, #0da5c0 100%)";
          btn.onmouseout = () => btn.style.background = "linear-gradient(90deg, #257cff 40%, #0dcaf0 100%)";
          btn.onclick = () => {
            chrome.runtime.sendMessage({ type: "OPEN_GRAPH_TAB", text: context });
            removeFloat();
          };
        }
      })
      .catch((error) => {
        console.error("翻譯 API 請求失敗:", error);
        div.innerHTML += `<div style="color:red; margin-top: 8px;">❌ 取得翻譯失敗</div>`;
      });
  }

  // ========== 【1】雙擊觸發查詞浮窗 ==========
  document.addEventListener("dblclick", function (e) {
    const selection = window.getSelection();
    const selected = selection?.toString().trim();
    if (selected) {
      let rect = null;
      if (selection.rangeCount > 0) {
        rect = selection.getRangeAt(0).getBoundingClientRect();
      }
      let top = rect ? rect.bottom + window.scrollY : e.clientY;
      let left = rect ? rect.left + window.scrollX : e.clientX;
      const context = getSentenceContext();
      showTranslateFloat(selected, left, top, context);
    }
  });

  // ========== 【2】右鍵只顯示選單，不彈出浮窗 ==========
  // **不覆蓋 contextmenu 預設行為**

  // ========== 【3】支援 background.js 的訊息觸發浮窗 ==========
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "SHOW_TRANSLATE_FLOAT" && msg.text) {
      let rect = null;
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        rect = sel.getRangeAt(0).getBoundingClientRect();
      }
      let top = rect ? (rect.bottom + window.scrollY) : (window.innerHeight / 2);
      let left = rect ? (rect.left + window.scrollX) : (window.innerWidth / 2);
      const context = getSentenceContext();
      showTranslateFloat(msg.text, left, top, context);
      sendResponse({ status: "ok" });
    }
    // OCR 留著佔位
    return true;
  });
}
