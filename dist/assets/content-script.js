import{A as u}from"./config.js";if(typeof window.contentScriptLoaded>"u"){let d=function(){const e=window.getSelection();if(!e||e.rangeCount===0)return"";let o=e.getRangeAt(0).startContainer;for(;o&&o.nodeType!==Node.ELEMENT_NODE;)o=o.parentNode;if(!o||typeof o.innerText!="string")return"";const i=(o.innerText||o.textContent).replace(/\s+/g," "),t=e.toString().trim();return t?((i.match(/[^.!?。！？]+[.!?。！？]?/g)||[i]).find(l=>l.includes(t))||t).trim():""},c=function(){const e=document.getElementById("mini-translate-float");e&&e.remove(),document.removeEventListener("mousedown",a,!0)},a=function(e){const s=document.getElementById("mini-translate-float");s&&!s.contains(e.target)&&c()},f=function(e,s,o,i){c();const t=document.createElement("div");t.id="mini-translate-float",t.style.cssText=`
      position: absolute;
      z-index: 2147483647;
      top: ${o+6}px;
      left: ${s}px;
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
    `,t.innerHTML=`
      <b>選字：</b>${e}<br>
      <b>所在句：</b><span style="color:#1e7efb">${i}</span><br>
      <span style="color: #999;">查詢中...</span>
    `,document.body.appendChild(t),setTimeout(()=>{document.addEventListener("mousedown",a,!0)},10),fetch(`${u}/translate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:e,context:i})}).then(n=>n.json()).then(n=>{let r="";typeof n=="string"?r=n:n.result?r=n.result:n.text?r=n.text:n.translated?r=n.translated:r="<span style='color:red'>查無翻譯</span>",t.innerHTML=`
        <b>選字：</b>${e}<br>
        <b>所在句：</b><span style="color:#1e7efb">${i}</span><br>
        <div style="margin: 8px 0 0 0; font-size: 15px; line-height: 1.6; white-space:normal;">${r}</div>
        <div style="display: flex; justify-content: flex-end; align-items: center; margin-top: 8px;">
          <button id="show-kg-btn" style="font-size: 15px; background: linear-gradient(90deg, #257cff 40%, #0dcaf0 100%); color: #fff; border-radius: 6px; border: none; padding: 6px 16px; cursor: pointer; font-weight: 600; box-shadow: 0 1px 8px #257cff22; transition: background 0.2s;">查語意圖譜</button>
          <a href="#" id="close-mini-translate" style="color: #888; margin-left:10px; font-size:15px; text-decoration: none;">關閉</a>
        </div>
      `,t.querySelector("#close-mini-translate").onclick=p=>{p.preventDefault(),c()};const l=t.querySelector("#show-kg-btn");l&&(l.onmouseover=()=>l.style.background="linear-gradient(90deg, #1e60c9 40%, #0da5c0 100%)",l.onmouseout=()=>l.style.background="linear-gradient(90deg, #257cff 40%, #0dcaf0 100%)",l.onclick=()=>{chrome.runtime.sendMessage({type:"OPEN_GRAPH_TAB",text:i}),c()})}).catch(n=>{console.error("翻譯 API 請求失敗:",n),t.innerHTML+='<div style="color:red; margin-top: 8px;">❌ 取得翻譯失敗</div>'})};window.contentScriptLoaded=!0,document.addEventListener("contextmenu",e=>{const s=window.getSelection();if(!s)return;const o=s.toString().trim();if(o){c(),e.preventDefault();let i=s.getRangeAt(0).getBoundingClientRect(),t=i.bottom+window.scrollY,n=i.left+window.scrollX;const r=d();f(o,n,t,r)}},!0),chrome.runtime.onMessage.addListener((e,s,o)=>{if(e.type==="SHOW_TRANSLATE_FLOAT"&&e.text){let i=null;const t=window.getSelection();t&&t.rangeCount>0&&(i=t.getRangeAt(0).getBoundingClientRect());let n=i?i.bottom+window.scrollY:window.innerHeight/2,r=i?i.left+window.scrollX:window.innerWidth/2;const l=d();f(e.text,r,n,l),o({status:"ok"})}else e.type==="START_OCR_AREA_SELECTION"&&(console.log("收到來自背景的指令：開始 OCR 區域選擇！"),alert("請準備開始框選 OCR 區域！(此為暫時提示)"),o({status:"ocr_started"}));return!0})}
