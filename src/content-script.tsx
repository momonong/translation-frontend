/// <reference types="chrome" />

let lastMouseX = 200, lastMouseY = 200;

// 追蹤滑鼠最後座標
document.addEventListener("mouseup", e => {
  lastMouseX = e.pageX;
  lastMouseY = e.pageY;
});

// 接收來自 background 的訊息
chrome.runtime.onMessage.addListener(
  (msg: { type?: string; text?: string }, _sender, _sendResponse) => {
    if (msg.type === "SHOW_TRANSLATE_FLOAT" && msg.text) {
      showTranslateFloat(msg.text);
    }
  }
);

// 顯示浮層 + 點外面自動關閉 + 呼叫翻譯 API
function showTranslateFloat(text: string) {
  document.getElementById("my-translate-float")?.remove();

  const div = document.createElement("div");
  div.id = "my-translate-float";
  div.style.position = "absolute";
  div.style.left = `${lastMouseX}px`;
  div.style.top = `${lastMouseY + 18}px`;
  div.style.zIndex = "2147483647";
  div.style.background = "#fff";
  div.style.padding = "16px 24px";
  div.style.borderRadius = "10px";
  div.style.boxShadow = "0 8px 32px rgba(0,0,0,0.13)";
  div.style.maxWidth = "340px";
  div.style.wordBreak = "break-all";
  div.innerHTML = `
    <div style="font-weight:bold;margin-bottom:6px;">選字：${text}</div>
    <div id="trans-loading" style="margin-bottom:8px;">載入翻譯中...</div>
  `;
  document.body.appendChild(div);

  // 點浮層外自動關閉
  setTimeout(() => {
    const handler = (ev: MouseEvent) => {
      if (!(ev.target instanceof Element && div.contains(ev.target))) {
        div.remove();
        window.removeEventListener("mousedown", handler, true);
      }
    };
    window.addEventListener("mousedown", handler, true);
  }, 10);

  // 串你的翻譯 API
  fetch(`http://localhost:8000/api/translate?text=${encodeURIComponent(text)}&target=zh`)
    .then(res => res.json())
    .then(data => {
      (document.getElementById("trans-loading") as HTMLElement).textContent =
        data.translated || "翻譯失敗";
    })
    .catch(() => {
      (document.getElementById("trans-loading") as HTMLElement).textContent = "翻譯失敗";
    });
}
