const S=window.API_BASE_URL||"http://localhost:8000",T=!1;function v(e){const i=document.createElement("template");i.innerHTML=e;const r=new Set(["B","BR","UL","LI"]),o=document.createTreeWalker(i.content,NodeFilter.SHOW_ELEMENT),n=[];for(;o.nextNode();){const t=o.currentNode;r.has(t.tagName)||n.push(t),t.tagName==="B"&&t.setAttribute("style","font-weight:bold");for(const s of[...t.attributes])t.tagName==="B"&&s.name==="style"||t.removeAttribute(s.name)}return n.forEach(t=>{const s=document.createElement("span");s.textContent=t.textContent||"",t.replaceWith(s)}),i.innerHTML}function p(e=""){return String(e).replace(/[&<>"']/g,i=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[i])}function g(){const e=window.getSelection();if(!e||e.rangeCount===0)return"";let r=e.getRangeAt(0).startContainer;for(;r&&r.nodeType!==Node.ELEMENT_NODE;)r=r.parentNode;if(!r||typeof r.innerText!="string")return"";const o=(r.innerText||r.textContent).replace(/\s+/g," "),n=e.toString().trim();return n?((o.match(/[^.!?。！？]+[.!?。！？]?/g)||[o]).find(l=>l.includes(n))||n).trim():""}function d(){const e=document.getElementById("mini-translate-float");e&&e.remove(),document.removeEventListener("mousedown",x,!0)}function x(e){const i=document.getElementById("mini-translate-float");i&&!i.contains(e.target)&&d()}function E(e,i,r,o){d();const n=document.createElement("div");n.id="mini-translate-float",n.style.cssText=`
    position: absolute;
    z-index: 2147483647;
    top: ${r+6}px;
    left: ${i}px;
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
  `;const t="";return n.innerHTML=`
    <b>選字：</b><span style="color:#1e7efb">${p(e)}</span><br>
    ${t}
    <span style="color: #999;">查詢中...</span>
  `,document.body.appendChild(n),setTimeout(()=>document.addEventListener("mousedown",x,!0),10),n}function k(e,i={},r=1e4){const o=new AbortController,n=setTimeout(()=>o.abort("timeout"),r);return fetch(e,{...i,signal:o.signal}).finally(()=>clearTimeout(n))}async function w(e,i,r,o){const n=E(e,i,r);try{const t=await k(`${S}/api/translate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:e,context:o})}).then(m=>m.json()),s=(t==null?void 0:t.normalized_target)||e,l=(t==null?void 0:t.normalized_pos)||"unknown",f={noun:"名詞",verb:"動詞",adj:"形容詞",adv:"副詞",det:"限定詞",pron:"代名詞",num:"數詞",phrase:"片語",unknown:""}[l]||"",b=f?`（${f}）`:"";let a="";typeof t=="string"?a=t:t.result?a=t.result:t.text?a=t.text:t.translated?a=t.translated:a="<span style='color:red'>查無翻譯</span>";const h=v(String(a||"")),y=T?`<b>所在句：</b><span style="color:#1e7efb">${p(o)}</span><br>`:"";n.innerHTML=`
      <b>選字：</b><span style="color:#1e7efb">${p(s)}</span>${b}<br>
      ${y}
      <div style="margin: 8px 0 0 0; font-size: 15px; line-height: 1.6; white-space:normal;">${h}</div>
      <div style="display: flex; justify-content: flex-end; align-items: center; margin-top: 8px;">
        <button id="show-kg-btn" style="font-size: 15px; background: linear-gradient(90deg, #257cff 40%, #0dcaf0 100%); color: #fff; border-radius: 6px; border: none; padding: 6px 16px; cursor: pointer; font-weight: 600; box-shadow: 0 1px 8px #257cff22; transition: background 0.2s;">查語意圖譜</button>
        <a href="#" id="close-mini-translate" style="color: #888; margin-left:10px; font-size:15px; text-decoration: none;">關閉</a>
      </div>
    `,n.querySelector("#close-mini-translate").onclick=m=>{m.preventDefault(),d()};const c=n.querySelector("#show-kg-btn");c&&(c.onmouseover=()=>c.style.background="linear-gradient(90deg, #1e60c9 40%, #0da5c0 100%)",c.onmouseout=()=>c.style.background="linear-gradient(90deg, #257cff 40%, #0dcaf0 100%)",c.onclick=()=>{chrome.runtime.sendMessage({type:"OPEN_GRAPH_TAB",text:o}),d()})}catch(t){console.error("翻譯 API 請求失敗:",t);const s=String(t).includes("timeout")?"⏱️ 逾時，請重試或重新整理頁面並再次選字":"❌ 取得翻譯失敗",l="";n.innerHTML=`
      <b>選字：</b><span style="color:#1e7efb">${p(e)}</span><br>
      ${l}
      <div style="color:red; margin-top: 8px;">${s}</div>
      <div style="display:flex; justify-content:flex-end; margin-top: 8px;">
        <a href="#" id="close-mini-translate" style="color: #888; font-size:15px; text-decoration: none;">關閉</a>
      </div>
    `;const u=n.querySelector("#close-mini-translate");u&&(u.onclick=f=>{f.preventDefault(),d()})}}typeof window.contentScriptLoaded>"u"&&(window.contentScriptLoaded=!0,document.addEventListener("dblclick",function(e){const i=window.getSelection(),r=i==null?void 0:i.toString().trim();if(r){let o=null;i.rangeCount>0&&(o=i.getRangeAt(0).getBoundingClientRect());const n=o?o.bottom+window.scrollY:e.clientY+window.scrollY,t=o?o.left+window.scrollX:e.clientX+window.scrollX,s=g();w(r,t,n,s)}}),chrome.runtime.onMessage.addListener((e,i,r)=>{if(e.type==="SHOW_TRANSLATE_FLOAT"&&e.text){const o=window.getSelection();let n=null;o&&o.rangeCount>0&&(n=o.getRangeAt(0).getBoundingClientRect());const t=n?n.bottom+window.scrollY:window.innerHeight/2+window.scrollY,s=n?n.left+window.scrollX:window.innerWidth/2+window.scrollX,l=g();w(e.text,s,t,l),r({status:"ok"})}return!0}));
