/* Anath AI Academy · student menu (the look only). © 2026 Anath AI (Jordan Martin). All rights reserved. Not to be copied, reused or shared without written permission.
   No personal data: the employee's name, the cards, the tips and the colour all come from the student's own chat (window.M). */
(function(){
const M=window.M||{};
const C={green:['--bg-success','--text-success','--border-success'],blue:['--bg-accent','--text-accent','--border-accent'],amber:['--bg-warning','--text-warning','--border-warning'],red:['--bg-danger','--text-danger','--border-danger'],purple:['--bg-info','--text-info','--border-info']};
const k=C[M.color]||C.green,v=i=>'var('+k[i]+', var('+C.blue[i]+'))';
const st=document.createElement("style");
st.textContent=".am{display:flex;flex-direction:column;gap:10px}.am .bar{display:flex;align-items:center;gap:12px;padding:12px 18px;border-radius:12px;font-size:15px;cursor:pointer;background:"+v(0)+";color:"+v(1)+";border:1px solid "+v(2)+"}.am h3{font-size:17px;font-weight:500;margin:6px 0 2px}.am .cd{display:flex;gap:12px;align-items:flex-start;text-align:left;width:100%;padding:12px 16px;border-radius:12px;border:0.5px solid var(--border-strong);background:var(--surface-1);color:var(--text-primary);font:inherit;cursor:pointer}.am .cd:hover{border-color:"+v(2)+"}.am .cd.r{border-color:var(--border-danger)}.am .ic{flex:none;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;background:"+v(0)+"}.am .tt{font-size:15px;font-weight:500}.am .sb{font-size:13px;color:var(--text-secondary);margin-top:2px}.am .ex{font-size:13px;color:var(--text-secondary);margin-top:4px;line-height:1.6}.am .ok{font-size:13px;color:"+v(1)+";margin-top:4px}.am .ft{font-size:13px;color:var(--text-muted)}.am .tp{margin-top:8px;padding:14px 16px;border-radius:12px;background:var(--surface-1);font-size:14px;line-height:1.55}.am .tp h4{font-size:14px;font-weight:500;color:"+v(1)+";margin:10px 0 2px}.am .tp .ls{font-size:12px;color:var(--text-muted);font-weight:400}";
document.head.appendChild(st);
const E=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const R=document.getElementById("mn"),W=E('div','am');R.append(W);
if(M.bar){const b=E('div','bar');b.append(E('span','','📈'),E('span','',M.bar));b.addEventListener('click',()=>sendPrompt(M.barSay||'my numbers'));W.append(b)}
if(M.heading)W.append(E('h3','',M.heading));
(M.cards||[]).forEach(c=>{const b=E('button','cd'+(c.red?' r':''));b.type='button';const i=E('span','ic',c.e||'•'),w=E('div');w.append(E('div','tt',c.t||''));if(c.s)w.append(E('div','sb',c.s));if(c.x&&c.x.length){const x=E('div','ex');c.x.forEach(l=>x.append(E('div','','· '+l)));w.append(x)}b.append(i,w);let h=null;b.addEventListener('click',()=>{if(b.dataset.s)return;b.dataset.s=1;sendPrompt(c.say||c.t);if(!h){h=E('div','ok','✓ On its way');w.append(h)}setTimeout(()=>{delete b.dataset.s;if(h){h.remove();h=null}},3000)});W.append(b)});
if(M.foot)W.append(E('div','ft',M.foot));
const T=M.tips;if(T){const p=E('div','tp');if(T.start)p.append(E('div','',T.start));(T.items||[]).forEach(t=>{const h=E('h4','',t.h||'');if(t.l)h.append(E('span','ls','  ('+t.l+')'));p.append(h,E('div','',t.b||''))});if(T.end){const e=E('div','',T.end);e.style.marginTop='10px';p.append(e)}W.append(p)}
window.__mnOK=1;
})();
