function removeFloat() {
  const old = document.getElementById('mini-translate-float');
  if (old) old.remove();
  document.removeEventListener('mousedown', handleOutsideClick, true);
}

function handleOutsideClick(e) {
  const float = document.getElementById('mini-translate-float');
  if (float && !float.contains(e.target)) {
    removeFloat();
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SHOW_TRANSLATE_FLOAT" && msg.text) {
    removeFloat();

    let rect = null;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      rect = sel.getRangeAt(0).getBoundingClientRect();
    }
    let top = rect ? rect.bottom + window.scrollY : window.innerHeight / 2;
    let left = rect ? rect.left + window.scrollX : window.innerWidth / 2;

    const div = document.createElement('div');
    div.id = 'mini-translate-float';
    div.style.position = 'absolute';
    div.style.zIndex = 99999;
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

    div.innerHTML = `<b>選字：</b>${msg.text}<br><span style="color: #999;">查詢中...</span>
      <div style="margin-top: 8px; text-align: right;"><a href="#" id="close-mini-translate" style="color: #888;">關閉</a></div>`;

    document.body.appendChild(div);

    div.querySelector("#close-mini-translate").onclick = e => {
      e.preventDefault();
      removeFloat();
    };

    setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick, true);
    }, 10);

    // 呼叫後端 API
    fetch(`http://127.0.0.1:8000/api/translate?text=${encodeURIComponent(msg.text)}&target=zh&alternatives=5`)
      .then(r => r.json())
      .then(data => {
        div.innerHTML = `
          <b>選字：</b>${msg.text}<br>
          <b>翻譯：</b>${data.translated}<br>
          <ul style="margin:8px 0 0 16px;padding:0;">${
            (data.alternatives || []).map(x => `<li>${x}</li>`).join('')
          }</ul>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
            <button id="show-kg-btn" style="font-size: 14px; background:#e0e9f6; border-radius:4px; border:none; padding:4px 10px; cursor:pointer;">查語意圖譜</button>
            <a href="#" id="close-mini-translate" style="color: #888; margin-left:10px;">關閉</a>
          </div>
        `;
        div.querySelector("#close-mini-translate").onclick = e => {
          e.preventDefault();
          removeFloat();
        };
        div.querySelector("#show-kg-btn").onclick = () => {
          // 發訊息給 background 開新分頁（推薦）
          chrome.runtime.sendMessage({
            type: "OPEN_GRAPH_TAB",
            text: msg.text
          });
          removeFloat();
        };
      })
      .catch(() => {
        div.innerHTML += `<div style="color:red">❌ 取得翻譯失敗</div>`;
      });
  }
});
