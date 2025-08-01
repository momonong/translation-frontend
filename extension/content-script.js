import { API_BASE_URL } from './config.js';

// ==================================================================
// ==                    載入防衛 (Load Guard)                     ==
// ==================================================================
// 確保此腳本在每個頁面中只會被執行一次，避免重複綁定事件。
if (typeof window.contentScriptLoaded === 'undefined') {
  window.contentScriptLoaded = true;

  // ==================================================================
  // ==                      設定與輔助函式                         ==
  // ==================================================================

  // 將後端 API 的基礎 URL 集中在此處，方便管理

  /**
   * 取得選取文字所在的完整句子作為上下文。
   * @returns {string} 偵測到的句子，若無則返回空字串。
   */
  function getSentenceContext() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return "";
    }
    const range = selection.getRangeAt(0);

    // 從選取的起始點向上尋找最近的元素節點
    let node = range.startContainer;
    while (node && node.nodeType !== Node.ELEMENT_NODE) {
      node = node.parentNode;
    }

    // 取得該元素的純文字內容，並標準化空白
    if (!node || typeof node.innerText !== 'string') {
        return "";
    }
    const fullText = (node.innerText || node.textContent).replace(/\s+/g, ' ');

    const selectedText = selection.toString().trim();
    if (!selectedText) {
        return "";
    }
    
    // 使用正則表達式來分割句子
    const sentences = fullText.match(/[^.!?。！？]+[.!?。！？]?/g) || [fullText];
    const context = sentences.find(s => s.includes(selectedText)) || selectedText;
    
    return context.trim();
  }


  // ==================================================================
  // ==                        浮窗處理邏輯                         ==
  // ==================================================================

  /**
   * 移除頁面上的翻譯浮窗。
   */
  function removeFloat() {
    const oldFloat = document.getElementById('mini-translate-float');
    if (oldFloat) {
      oldFloat.remove();
    }
    // 移除事件監聽器以避免內存洩漏
    document.removeEventListener('mousedown', handleOutsideClick, true);
  }
  
  /**
   * 監聽點擊事件，如果點擊位置在浮窗外，則關閉浮窗。
   * @param {MouseEvent} e - 滑鼠事件對象
   */
  function handleOutsideClick(e) {
    const float = document.getElementById('mini-translate-float');
    if (float && !float.contains(e.target)) {
      removeFloat();
    }
  }

  /**
   * 建立並顯示翻譯結果的浮窗。
   * @param {string} selected - 被選取的文字
   * @param {number} left - 浮窗的左側位置
   * @param {number} top - 浮窗的頂部位置
   * @param {string} context - 文字所在的句子上下文
   */
  function showTranslateFloat(selected, left, top, context) {
    removeFloat(); // 先移除舊的浮窗

    const div = document.createElement('div');
    div.id = 'mini-translate-float';
    // 使用 style.cssText 一次性設定多個樣式
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

    // 初始內容，顯示正在查詢
    div.innerHTML = `
      <b>選字：</b>${selected}<br>
      <b>所在句：</b><span style="color:#1e7efb">${context}</span><br>
      <span style="color: #999;">查詢中...</span>
    `;
    document.body.appendChild(div);

    // 延遲綁定點擊外部關閉的事件，避免觸發建立浮窗的同一次點擊
    setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick, true);
    }, 10);

    // 呼叫後端 API 取得翻譯結果
    fetch(`${API_BASE_URL}/translate`, {
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

      // 更新浮窗內容為 API 回傳的結果
      div.innerHTML = `
        <b>選字：</b>${selected}<br>
        <b>所在句：</b><span style="color:#1e7efb">${context}</span><br>
        <div style="margin: 8px 0 0 0; font-size: 15px; line-height: 1.6; white-space:normal;">${content}</div>
        <div style="display: flex; justify-content: flex-end; align-items: center; margin-top: 8px;">
          <button id="show-kg-btn" style="font-size: 15px; background: linear-gradient(90deg, #257cff 40%, #0dcaf0 100%); color: #fff; border-radius: 6px; border: none; padding: 6px 16px; cursor: pointer; font-weight: 600; box-shadow: 0 1px 8px #257cff22; transition: background 0.2s;">查語意圖譜</button>
          <a href="#" id="close-mini-translate" style="color: #888; margin-left:10px; font-size:15px; text-decoration: none;">關閉</a>
        </div>
      `;

      // 因為 innerHTML 被重寫，需要重新綁定事件
      div.querySelector("#close-mini-translate").onclick = e => {
        e.preventDefault();
        removeFloat();
      };
      
      const btn = div.querySelector("#show-kg-btn");
      if(btn) {
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


  // ==================================================================
  // ==                        事件監聽器                           ==
  // ==================================================================

  /**
   * 監聽整個文件的右鍵選單事件，用於觸發自訂的翻譯浮窗。
   */
  document.addEventListener("contextmenu", (e) => {
    const selection = window.getSelection();
    if (!selection) return;

    const selectedText = selection.toString().trim();

    // 如果有選取文字，才顯示我們的自訂浮窗
    if (selectedText) {
      removeFloat(); // 先移除可能存在的舊浮窗
      e.preventDefault(); // 阻止瀏覽器預設的右鍵選單

      let rect = selection.getRangeAt(0).getBoundingClientRect();
      let top = rect.bottom + window.scrollY;
      let left = rect.left + window.scrollX;
      
      const context = getSentenceContext();
      showTranslateFloat(selectedText, left, top, context);
    }
  }, true); // 使用捕獲階段以確保能先於頁面本身的事件處理

  /**
   * 監聽來自 background.js 的訊息，
   * 用於處理從瀏覽器官方右鍵選單觸發的翻譯請求。
   */
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    // 確保只處理我們定義的訊息類型
    if (msg.type === "SHOW_TRANSLATE_FLOAT" && msg.text) {
      let rect = null;
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        rect = sel.getRangeAt(0).getBoundingClientRect();
      }
      
      // 計算浮窗的顯示位置
      let top = rect ? (rect.bottom + window.scrollY) : (window.innerHeight / 2);
      let left = rect ? (rect.left + window.scrollX) : (window.innerWidth / 2);
      
      const context = getSentenceContext();
      showTranslateFloat(msg.text, left, top, context);

      // 回應 background.js，表示已成功處理
      sendResponse({status: "ok"}); 
    }
    
    // 處理來自 OCR 功能的請求
    else if (msg.type === "START_OCR_AREA_SELECTION") {
      console.log("收到來自背景的指令：開始 OCR 區域選擇！");
      
      // TODO: 在這裡實作讓使用者框選畫面的程式碼
      // 這通常會包含：
      // 1. 建立一個覆蓋整個頁面的半透明蒙版 (overlay)。
      // 2. 監聽 mousedown, mousemove, mouseup 事件來繪製選取框。
      // 3. 使用者選取完畢後，將選取範圍的座標傳給 background.js，
      //    或者直接在 content script 中處理截圖（如果權限足夠）。

      alert("請準備開始框選 OCR 區域！(此為暫時提示)"); // 您可以先用一個 alert 來確認訊息已收到

      sendResponse({ status: "ocr_started" }); // 回應 background.js 表示已開始處理
    }
    
    return true; // 為了非同步的 sendResponse，保持通道開啟
});

  

} // 載入防衛的結尾