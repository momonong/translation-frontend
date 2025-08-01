const u=window.API_BASE_URL||"http://localhost:8000";if(typeof window.contentScriptLoaded>"u"){let d=function(){const e=window.getSelection();if(!e||e.rangeCount===0)return"";let i=e.getRangeAt(0).startContainer;for(;i&&i.nodeType!==Node.ELEMENT_NODE;)i=i.parentNode;if(!i||typeof i.innerText!="string")return"";const t=(i.innerText||i.textContent).replace(/\s+/g," "),n=e.toString().trim();return n?((t.match(/[^.!?。！？]+[.!?。！？]?/g)||[t]).find(l=>l.includes(n))||n).trim():""},c=function(){const e=document.getElementById("mini-translate-float");e&&e.remove(),document.removeEventListener("mousedown",a,!0)},a=function(e){const r=document.getElementById("mini-translate-float");r&&!r.contains(e.target)&&c()},f=function(e,r,i,t){c();const n=document.createElement("div");n.id="mini-translate-float",n.style.cssText=`
      position: absolute;
      z-index: 2147483647;
      top: ${i+6}px;
      left: ${r}px;
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
    `,n.innerHTML=`
      <b>選字：</b>${e}<br>
      <b>所在句：</b><span style="color:#1e7efb">${t}</span><br>
      <span style="color: #999;">查詢中...</span>
    `,document.body.appendChild(n),setTimeout(()=>{document.addEventListener("mousedown",a,!0)},10),fetch(`${u}/api/translate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:e,context:t})}).then(o=>o.json()).then(o=>{let s="";typeof o=="string"?s=o:o.result?s=o.result:o.text?s=o.text:o.translated?s=o.translated:s="<span style='color:red'>查無翻譯</span>",n.innerHTML=`
          <b>選字：</b>${e}<br>
          <b>所在句：</b><span style="color:#1e7efb">${t}</span><br>
          <div style="margin: 8px 0 0 0; font-size: 15px; line-height: 1.6; white-space:normal;">${s}</div>
          <div style="display: flex; justify-content: flex-end; align-items: center; margin-top: 8px;">
            <button id="show-kg-btn" style="font-size: 15px; background: linear-gradient(90deg, #257cff 40%, #0dcaf0 100%); color: #fff; border-radius: 6px; border: none; padding: 6px 16px; cursor: pointer; font-weight: 600; box-shadow: 0 1px 8px #257cff22; transition: background 0.2s;">查語意圖譜</button>
            <a href="#" id="close-mini-translate" style="color: #888; margin-left:10px; font-size:15px; text-decoration: none;">關閉</a>
          </div>
        `,n.querySelector("#close-mini-translate").onclick=p=>{p.preventDefault(),c()};const l=n.querySelector("#show-kg-btn");l&&(l.onmouseover=()=>l.style.background="linear-gradient(90deg, #1e60c9 40%, #0da5c0 100%)",l.onmouseout=()=>l.style.background="linear-gradient(90deg, #257cff 40%, #0dcaf0 100%)",l.onclick=()=>{chrome.runtime.sendMessage({type:"OPEN_GRAPH_TAB",text:t}),c()})}).catch(o=>{console.error("翻譯 API 請求失敗:",o),n.innerHTML+='<div style="color:red; margin-top: 8px;">❌ 取得翻譯失敗</div>'})};var g=d,x=c,m=a,b=f;window.contentScriptLoaded=!0,document.addEventListener("dblclick",function(e){const r=window.getSelection(),i=r==null?void 0:r.toString().trim();if(i){let t=null;r.rangeCount>0&&(t=r.getRangeAt(0).getBoundingClientRect());let n=t?t.bottom+window.scrollY:e.clientY,o=t?t.left+window.scrollX:e.clientX;const s=d();f(i,o,n,s)}}),chrome.runtime.onMessage.addListener((e,r,i)=>{if(e.type==="SHOW_TRANSLATE_FLOAT"&&e.text){let t=null;const n=window.getSelection();n&&n.rangeCount>0&&(t=n.getRangeAt(0).getBoundingClientRect());let o=t?t.bottom+window.scrollY:window.innerHeight/2,s=t?t.left+window.scrollX:window.innerWidth/2;const l=d();f(e.text,s,o,l),i({status:"ok"})}return!0})}
