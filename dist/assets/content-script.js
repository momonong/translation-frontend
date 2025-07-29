function u(){const n=window.getSelection();if(!n.rangeCount)return"";let i=n.getRangeAt(0).startContainer;for(;i&&i.nodeType!==1;)i=i.parentNode;let t=i&&(i.innerText||i.textContent)||"";t=t.replace(/\s+/g," ");const e=n.toString().trim();let o=t.indexOf(e);const r=/[^。！？!?\.]*[。！？!?\.]+|[^。！？!?\.]+$/g,s=t.match(r)||[t];let a=e,c=0;for(let f of s){let p=c+f.length;if(o>=c&&o<p){a=f.trim();break}c=p}return a}function d(){const n=document.getElementById("mini-translate-float");n&&n.remove(),document.removeEventListener("mousedown",g,!0)}function g(n){const l=document.getElementById("mini-translate-float");l&&!l.contains(n.target)&&d()}function x(n,l,i,t){d();const e=document.createElement("div");e.id="mini-translate-float",e.style.position="absolute",e.style.zIndex=2147483647,e.style.top=`${i+6}px`,e.style.left=`${l}px`,e.style.background="#fff",e.style.border="1.5px solid #d7d7d7",e.style.borderRadius="10px",e.style.boxShadow="0 2px 12px 1px #0001",e.style.padding="14px 18px",e.style.minWidth="210px",e.style.maxWidth="340px",e.style.fontSize="15px",e.style.lineHeight="1.5",e.style.transition="box-shadow 0.1s",e.innerHTML=`
    <b>選字：</b>${n}<br>
    <b>所在句：</b><span style="color:#1e7efb">${t}</span><br>
    <span style="color: #999;">查詢中...</span>
    <div style="margin-top: 8px; text-align: right;">
      <a href="#" id="close-mini-translate" style="color: #888;">關閉</a>
    </div>
  `,document.body.appendChild(e),e.querySelector("#close-mini-translate").onclick=o=>{o.preventDefault(),d()},setTimeout(()=>{document.addEventListener("mousedown",g,!0)},10),fetch(`${window.API_BASE_URL}/translate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:n,context:t})}).then(o=>o.json()).then(o=>{let r="";typeof o=="string"?r=o:o.result?r=o.result:o.text?r=o.text:o.translated?r=o.translated:r="<span style='color:red'>查無翻譯</span>",e.innerHTML=`
        <b>選字：</b>${n}<br>
        <b>所在句：</b><span style="color:#1e7efb">${t}</span><br>
        <div style="margin: 8px 0 0 0; font-size: 15px; line-height: 1.6; white-space:normal;">${r}</div>
        <div style="display: flex; justify-content: flex-end; align-items: center; margin-top: 8px;">
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
      `,e.querySelector("#close-mini-translate").onclick=a=>{a.preventDefault(),d()};const s=e.querySelector("#show-kg-btn");s.onmouseover=()=>s.style.background="linear-gradient(90deg, #1e60c9 40%, #0da5c0 100%)",s.onmouseout=()=>s.style.background="linear-gradient(90deg, #257cff 40%, #0dcaf0 100%)",s.onclick=()=>{chrome.runtime.sendMessage({type:"OPEN_GRAPH_TAB",text:t}),d()}}).catch(()=>{e.innerHTML+='<div style="color:red">❌ 取得翻譯失敗</div>'})}document.addEventListener("contextmenu",function(n){d();const l=window.getSelection(),i=l==null?void 0:l.toString().trim();if(i){n.preventDefault();let t=null;l.rangeCount>0&&(t=l.getRangeAt(0).getBoundingClientRect());let e=t?t.bottom+window.scrollY:n.clientY,o=t?t.left+window.scrollX:n.clientX;const r=u();x(i,o,e,r)}},!0);chrome.runtime.onMessage.addListener((n,l,i)=>{if(n.type==="SHOW_TRANSLATE_FLOAT"&&n.text){let t=null;const e=window.getSelection();e&&e.rangeCount>0&&(t=e.getRangeAt(0).getBoundingClientRect());let o=t?t.bottom+window.scrollY:window.innerHeight/2,r=t?t.left+window.scrollX:window.innerWidth/2;const s=u();x(n.text,r,o,s)}});
