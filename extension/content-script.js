const API_BASE_URL = 'http://127.0.0.1:8000';
const TARGET_LANGUAGE = 'zh';
const ALTERNATIVES_COUNT = 5;

let popover;
let currentText = '';

function createPopover() {
  popover = document.createElement('div');
  popover.style.position = 'absolute';
  popover.style.zIndex = '2147483647';
  popover.style.background = '#fff';
  popover.style.border = '1px solid #ccc';
  popover.style.borderRadius = '4px';
  popover.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
  popover.style.padding = '8px';
  popover.style.fontSize = '14px';
  popover.style.maxWidth = '300px';
  popover.style.lineHeight = '1.4';
  popover.style.fontFamily = 'sans-serif';
  popover.style.display = 'none';

  const loading = document.createElement('div');
  loading.id = 'translation-loading';
  loading.textContent = 'Loading...';
  popover.appendChild(loading);

  const result = document.createElement('div');
  result.id = 'translation-result';
  result.style.display = 'none';
  popover.appendChild(result);

  const btn = document.createElement('button');
  btn.textContent = '📈 展開';
  btn.style.marginTop = '4px';
  btn.addEventListener('click', () => {
    if (currentText) {
      chrome.runtime.sendMessage({ type: 'open_popup', text: currentText });
      hidePopover();
    }
  });
  popover.appendChild(btn);

  document.body.appendChild(popover);
}

function showPopover(text, rect) {
  if (!popover) createPopover();
  currentText = text;
  popover.style.top = `${rect.bottom + window.scrollY}px`;
  popover.style.left = `${rect.left + window.scrollX}px`;
  popover.querySelector('#translation-loading').style.display = 'block';
  popover.querySelector('#translation-result').style.display = 'none';
  popover.style.display = 'block';

  fetch(`${API_BASE_URL}/api/translate?text=${encodeURIComponent(text)}&target=${TARGET_LANGUAGE}&alternatives=${ALTERNATIVES_COUNT}`)
    .then((r) => r.json())
    .then((data) => {
      const loadEl = popover.querySelector('#translation-loading');
      loadEl.style.display = 'none';
      const resultEl = popover.querySelector('#translation-result');
      resultEl.innerHTML = '';
      const tDiv = document.createElement('div');
      tDiv.textContent = data.translated;
      resultEl.appendChild(tDiv);
      if (data.alternatives && data.alternatives.length) {
        const ul = document.createElement('ul');
        ul.style.paddingLeft = '16px';
        data.alternatives.slice(0, ALTERNATIVES_COUNT).forEach((alt) => {
          const li = document.createElement('li');
          li.textContent = alt;
          ul.appendChild(li);
        });
        resultEl.appendChild(ul);
      }
      resultEl.style.display = 'block';
    })
    .catch(() => {
      const loadEl = popover.querySelector('#translation-loading');
      loadEl.textContent = '❌ 翻譯失敗';
    });
}

function hidePopover() {
  if (popover) popover.style.display = 'none';
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'show_popover') {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === '' || !selection.rangeCount) {
      return;
    }
    const rect = selection.getRangeAt(0).getBoundingClientRect();
    showPopover(msg.text, rect);
  }
});

document.addEventListener('mousedown', (e) => {
  if (popover && !popover.contains(e.target)) {
    hidePopover();
  }
});
