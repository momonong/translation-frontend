// ========== 輔助函式：取得選字所在句子 ==========
function getSentenceContext() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return "";
  const range = selection.getRangeAt(0);

  // 找到最近的元素節點（例如 <p> 或 <div>）
  let node = range.startContainer;
  while (node && node.nodeType !== 1) node = node.parentNode;

  // 取得所在元素全部文字
  let fullText = node ? (node.innerText || node.textContent || "") : "";
  fullText = fullText.replace(/\s+/g, " "); // 移除多餘空白

  // 在全文找到被選取文字的索引
  const selected = selection.toString().trim();
  let idx = fullText.indexOf(selected);

  // 找出選字所在句子：用中英文標點分句
  // 分句會包含標點
  const re = /[^。！？!?\.]*[。！？!?\.]+|[^。！？!?\.]+$/g;
  const sentences = fullText.match(re) || [fullText];

  let matchedSentence = selected; // 預設找不到就回傳選字本身
  let charCount = 0;
  for (let sent of sentences) {
    let nextCharCount = charCount + sent.length;
    if (idx >= charCount && idx < nextCharCount) {
      matchedSentence = sent.trim();
      break;
    }
    charCount = nextCharCount;
  }
  return matchedSentence;
}

// ========== 浮窗處理邏輯 ==========
function removeFloat() {
  const old = document.getElementById('mini-translate-float');
  if (old) old.remove();
  document.removeEventListener('mousedown', handleOutsideClick, true);
}
function handleOutsideClick(e) {
  const float = document.getElementById('mini-translate-float');
  if (float && !float.contains(e.target)) removeFloat();
}

// 顯示翻譯浮窗（已改 context-aware 查詢）
function showTranslateFloat(selected, left, top, context) {
  removeFloat();
  const div = document.createElement('div');
  div.id = 'mini-translate-float';
  div.style.position = 'absolute';
  div.style.zIndex = 2147483647;
  div.style.top = `${top + 6}px`;
  div.style.left = `${left}px`;
  div.style.background = '#fff';
  div.style.border = '1.5px solid #d7d7d7';
  div.style.borderRadius = '10px';
  div.style.boxShadow = '0 2px 12px 1px #0001';
  div.style.padding = '14px 18px';
  div.style.minWidth = '210px';
  div.style.maxWidth = '340px';
  div.style.fontSize = '15px';
  div.style.lineHeight = '1.5';
  div.style.transition = 'box-shadow 0.1s';

  div.innerHTML = `
    <b>選字：</b>${selected}<br>
    <b>所在句：</b><span style="color:#1e7efb">${context}</span><br>
    <span style="color: #999;">查詢中...</span>
    <div style="margin-top: 8px; text-align: right;">
      <a href="#" id="close-mini-translate" style="color: #888;">關閉</a>
    </div>
  `;
  document.body.appendChild(div);

  div.querySelector("#close-mini-translate").onclick = e => {
    e.preventDefault(); removeFloat();
  };
  setTimeout(() => {
    document.addEventListener('mousedown', handleOutsideClick, true);
  }, 10);

  // 呼叫 context-aware API
  fetch('http://127.0.0.1:8000/api/translate-context', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: selected,
      context: context
    })
  })
    .then(r => r.json())
    .then(data => {
      div.innerHTML = `
        <b>選字：</b>${selected}<br>
        <b>所在句：</b><span style="color:#1e7efb">${context}</span><br>
        <b>翻譯：</b>${data.translated || '<span style="color:red">查無翻譯</span>'}<br>
        <ul style="margin:8px 0 0 16px;padding:0;">${
          Array.isArray(data.alternatives) && data.alternatives.length > 0
            ? data.alternatives.map(x => `<li>${x}</li>`).join('')
            : ''
        }</ul>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
          <button id="show-kg-btn" style="
            font-size: 15px;
            background: linear-gradient(90deg, #257cff 40%, #0dcaf0 100%);
            color: #fff;
            border-radius: 6px;
            border: none;
            padding: 6px 16px;
            cursor: pointer;
            font-weight: 600;
            box-shadow: 0 1px 8px #257cff22;
            transition: background 0.2s;
          ">查語意圖譜</button>
          <a href="#" id="close-mini-translate" style="color: #888; margin-left:10px; font-size:15px;">關閉</a>
        </div>
      `;
      div.querySelector("#close-mini-translate").onclick = e => {
        e.preventDefault(); removeFloat();
      };
      const btn = div.querySelector("#show-kg-btn");
      btn.onmouseover = () => btn.style.background = "linear-gradient(90deg, #1e60c9 40%, #0da5c0 100%)";
      btn.onmouseout = () => btn.style.background = "linear-gradient(90deg, #257cff 40%, #0dcaf0 100%)";
      btn.onclick = () => {
        chrome.runtime.sendMessage({
          type: "OPEN_GRAPH_TAB",
          text: selected
        });
        removeFloat();
      };
    })
    .catch(() => {
      div.innerHTML += `<div style="color:red">❌ 取得翻譯失敗</div>`;
    });
}

// ========== 右鍵選字監聽 ===========
document.addEventListener("contextmenu", function (e) {
  removeFloat();
  const selection = window.getSelection();
  const selected = selection?.toString().trim();
  if (selected) {
    e.preventDefault();
    let rect = null;
    if (selection.rangeCount > 0) {
      rect = selection.getRangeAt(0).getBoundingClientRect();
    }
    let top = rect ? rect.bottom + window.scrollY : e.clientY;
    let left = rect ? rect.left + window.scrollX : e.clientX;
    // 抓 context（所在句）
    const context = getSentenceContext();
    showTranslateFloat(selected, left, top, context);
  }
}, true);

// ========== 支援 context menu 呼叫 ==========
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SHOW_TRANSLATE_FLOAT" && msg.text) {
    let rect = null;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      rect = sel.getRangeAt(0).getBoundingClientRect();
    }
    let top = rect ? rect.bottom + window.scrollY : window.innerHeight / 2;
    let left = rect ? rect.left + window.scrollX : window.innerWidth / 2;
    // 支援 context menu 手動查詞時也抓句子
    const context = getSentenceContext();
    showTranslateFloat(msg.text, left, top, context);
  }
});
