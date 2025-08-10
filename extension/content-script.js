const API_BASE_URL = window.API_BASE_URL || "http://localhost:8000";

// 正式版建議 false；要除錯時改成 true 會顯示「所在句」
const DEBUG_SHOW_SENTENCE = false;

// 只允許的 HTML 標籤（強制 <b style="font-weight:bold">）
function sanitizeHtml(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  const allowed = new Set(["B","BR","UL","LI"]);
  const walker = document.createTreeWalker(tpl.content, NodeFilter.SHOW_ELEMENT);
  const toRemove = [];
  while (walker.nextNode()) {
    const el = walker.currentNode;
    if (!allowed.has(el.tagName)) toRemove.push(el);
    if (el.tagName === "B") el.setAttribute("style", "font-weight:bold");
    for (const attr of [...el.attributes]) {
      if (el.tagName === "B" && attr.name === "style") continue;
      el.removeAttribute(attr.name);
    }
  }
  toRemove.forEach(el => {
    const span = document.createElement('span');
    span.textContent = el.textContent || '';
    el.replaceWith(span);
  });
  return tpl.innerHTML;
}

// 簡單 escape，避免選字/所在句含特殊字元造成插入問題
function escapeHtml(s = "") {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

// 取得選字所在句子（沿用你的邏輯）
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

// 浮窗
function removeFloat() {
  const oldFloat = document.getElementById('mini-translate-float');
  if (oldFloat) oldFloat.remove();
  document.removeEventListener('mousedown', handleOutsideClick, true);
}
function handleOutsideClick(e) {
  const float = document.getElementById('mini-translate-float');
  if (float && !float.contains(e.target)) removeFloat();
}
function showFloatSkeleton(selected, left, top, context) {
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
    max-width: 360px;
    font-size: 15px;
    line-height: 1.5;
    transition: box-shadow 0.1s;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    word-break: break-word;
  `;
  const sentenceRow = DEBUG_SHOW_SENTENCE
    ? `<b>所在句：</b><span style="color:#1e7efb">${escapeHtml(context)}</span><br>`
    : "";
  div.innerHTML = `
    <b>選字：</b><span style="color:#1e7efb">${escapeHtml(selected)}</span><br>
    ${sentenceRow}
    <span style="color: #999;">查詢中...</span>
  `;
  document.body.appendChild(div);
  setTimeout(() => document.addEventListener('mousedown', handleOutsideClick, true), 10);
  return div;
}

// fetch with timeout（避免一直「查詢中」）
function fetchWithTimeout(url, opts = {}, ms = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort("timeout"), ms);
  return fetch(url, { ...opts, signal: controller.signal })
    .finally(() => clearTimeout(id));
}

// 主流程：直接打一個 /api/translate（後端已包含 normalize + translate）
async function showTranslateFloat(selected, left, top, context) {
  const div = showFloatSkeleton(selected, left, top, context);
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: selected,
        context: context
      })
    }).then(r => r.json());

    // 後端新 schema：取 normalized_* 顯示 header
    const target = res?.normalized_target || selected;
    const posEn  = res?.normalized_pos || "unknown";
    const posZhMap = {
      noun:"名詞", verb:"動詞", adj:"形容詞", adv:"副詞",
      det:"限定詞", pron:"代名詞", num:"數詞",
      phrase:"片語", unknown:""
    };
    const posZh = posZhMap[posEn] || "";
    const posSuffix = posZh ? `（${posZh}）` : "";

    // 內容 HTML（後端轉好的），再做白名單清洗
    let content = "";
    if (typeof res === "string") content = res;
    else if (res.result) content = res.result;
    else if (res.text) content = res.text;
    else if (res.translated) content = res.translated;
    else content = "<span style='color:red'>查無翻譯</span>";
    const safe = sanitizeHtml(String(content || ""));

    const sentenceRow = DEBUG_SHOW_SENTENCE
      ? `<b>所在句：</b><span style="color:#1e7efb">${escapeHtml(context)}</span><br>`
      : "";
    div.innerHTML = `
      <b>選字：</b><span style="color:#1e7efb">${escapeHtml(target)}</span>${posSuffix}<br>
      ${sentenceRow}
      <div style="margin: 8px 0 0 0; font-size: 15px; line-height: 1.6; white-space:normal;">${safe}</div>
      <div style="display: flex; justify-content: flex-end; align-items: center; margin-top: 8px;">
        <button id="show-kg-btn" style="font-size: 15px; background: linear-gradient(90deg, #257cff 40%, #0dcaf0 100%); color: #fff; border-radius: 6px; border: none; padding: 6px 16px; cursor: pointer; font-weight: 600; box-shadow: 0 1px 8px #257cff22; transition: background 0.2s;">查語意圖譜</button>
        <a href="#" id="close-mini-translate" style="color: #888; margin-left:10px; font-size:15px; text-decoration: none;">關閉</a>
      </div>
    `;
    div.querySelector("#close-mini-translate").onclick = e => { e.preventDefault(); removeFloat(); };
    const btn = div.querySelector("#show-kg-btn");
    if (btn) {
      btn.onmouseover = () => btn.style.background = "linear-gradient(90deg, #1e60c9 40%, #0da5c0 100%)";
      btn.onmouseout = () => btn.style.background = "linear-gradient(90deg, #257cff 40%, #0dcaf0 100%)";
      btn.onclick = () => {
        chrome.runtime.sendMessage({ type: "OPEN_GRAPH_TAB", text: context });
        removeFloat();
      };
    }
  } catch (error) {
    console.error("翻譯 API 請求失敗:", error);
    const msg = String(error).includes("timeout") ? "⏱️ 逾時，請重試或重新整理頁面並再次選字" : "❌ 取得翻譯失敗";
    const sentenceRow = DEBUG_SHOW_SENTENCE
      ? `<b>所在句：</b><span style="color:#1e7efb">${escapeHtml(context)}</span><br>`
      : "";
    div.innerHTML = `
      <b>選字：</b><span style="color:#1e7efb">${escapeHtml(selected)}</span><br>
      ${sentenceRow}
      <div style="color:red; margin-top: 8px;">${msg}</div>
      <div style="display:flex; justify-content:flex-end; margin-top: 8px;">
        <a href="#" id="close-mini-translate" style="color: #888; font-size:15px; text-decoration: none;">關閉</a>
      </div>
    `;
    const close = div.querySelector("#close-mini-translate");
    if (close) close.onclick = (e)=>{ e.preventDefault(); removeFloat(); };
  }
}

// ========== 事件掛載 ==========
if (typeof window.contentScriptLoaded === 'undefined') {
  window.contentScriptLoaded = true;

  // 雙擊觸發
  document.addEventListener("dblclick", function (e) {
    const selection = window.getSelection();
    const selected = selection?.toString().trim();
    if (selected) {
      let rect = null;
      if (selection.rangeCount > 0) rect = selection.getRangeAt(0).getBoundingClientRect();
      // 加上 scrollY / scrollX，避免滾動後浮窗定位錯位
      const top  = rect ? rect.bottom + window.scrollY : e.clientY + window.scrollY;
      const left = rect ? rect.left   + window.scrollX : e.clientX  + window.scrollX;
      const context = getSentenceContext();
      showTranslateFloat(selected, left, top, context);
    }
  });

  // 由 background 觸發顯示
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "SHOW_TRANSLATE_FLOAT" && msg.text) {
      const sel = window.getSelection();
      let rect = null;
      if (sel && sel.rangeCount > 0) rect = sel.getRangeAt(0).getBoundingClientRect();
      const top  = rect ? (rect.bottom + window.scrollY) : (window.innerHeight / 2 + window.scrollY);
      const left = rect ? (rect.left   + window.scrollX) : (window.innerWidth  / 2 + window.scrollX);
      const context = getSentenceContext();
      showTranslateFloat(msg.text, left, top, context);
      sendResponse({ status: "ok" });
    }
    return true;
  });
}
