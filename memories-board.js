/* My Memories board. © 2026 Anath AI (Jordan Martin). All rights reserved. Not to be copied, reused or shared
   without written permission. Design only: no memories, words, names, dates or videos are in this file. They are read
   at run time from the owner's own laptop (/api/memories) and never leave it. */
(function () {
"use strict";
var API = (window.MM && window.MM.api) || "";
var STAR = "M0-1L.22-.22 1 0 .22.22 0 1-.22.22-1 0-.22-.22Z";
var STARS = [[30,40,9,.62],[150,22,5.5,.5],[210,118,11,.5],[96,150,7,.56],[24,205,5,.45],[172,200,8,.55],[118,72,4,.45],[68,100,3,.4]]
  .map(function (s) { return "<path transform='translate(" + s[0] + " " + s[1] + ") scale(" + s[2] + ")' opacity='" + s[3] + "' d='" + STAR + "'/>"; }).join("");
var DOTS = [[132,112,2,.5],[60,176,1.6,.45],[226,56,1.8,.45],[128,228,1.7,.42],[200,160,1.3,.4]]
  .map(function (c) { return "<circle cx='" + c[0] + "' cy='" + c[1] + "' r='" + c[2] + "' opacity='" + c[3] + "'/>"; }).join("");
var TILE = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><g fill='%23E0A033'>" + STARS + DOTS + "</g></svg>\")";

var CSS = [
":root{--ivory:#F5F1E8;--ink:#1c1a16;--muted:#7a7366;--gold:#E8A33A;--gold2:#B97A1B;--goldl:#F3D79A}",
"*{box-sizing:border-box}html{background:#0a1d14}",
"body{margin:0;min-height:100vh;color:var(--ink);background:radial-gradient(1100px 520px at 50% -8%,#fffaf1,var(--ivory) 70%);font:15px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}",
"[hidden]{display:none!important}",
".head{position:relative;overflow:hidden;background:linear-gradient(120deg,#060907 0%,#0b2017 55%,#13503a 100%);color:#fff;padding:24px 20px 38px;border-bottom:1px solid rgba(232,163,58,.4)}",
".head .in{position:relative;z-index:1;max-width:980px;margin:0 auto;display:flex;flex-direction:column;align-items:center;text-align:center;gap:2px}",
".spark{position:absolute;border-radius:50%;background:#FFE7A8;box-shadow:0 0 6px 2px rgba(255,214,120,.75);opacity:0;animation:tw 3s ease-in-out infinite;pointer-events:none;will-change:transform,opacity}",
"@keyframes tw{0%,100%{opacity:0;transform:scale(.4)}50%{opacity:1;transform:scale(1)}}",
"h1.mmt{margin:0;font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:50px;letter-spacing:.8px;line-height:1.1;padding:0 4px}",
".foil{background:linear-gradient(100deg,#b8862b 0%,#f7e3a1 20%,#d9a441 38%,#fff6d0 50%,#d9a441 62%,#f7e3a1 80%,#b8862b 100%);background-size:220% auto;-webkit-background-clip:text;background-clip:text;color:transparent}",
".shine{animation:shine 7s linear infinite}@keyframes shine{to{background-position:220% center}}",
".mark{display:inline-block;color:#F6C45A;font-size:13px;animation:tw2 2.4s ease-in-out infinite;text-shadow:0 0 10px rgba(246,196,90,.85)}.mark.r{animation-delay:1.2s}",
"@keyframes tw2{0%,100%{transform:scale(1) rotate(0)}50%{transform:scale(1.25) rotate(20deg)}}",
".eyebrow{display:flex;align-items:center;gap:12px;color:#F3D79A;font-size:12px;font-weight:600;letter-spacing:5px;text-transform:uppercase;margin-bottom:4px}",
".eyebrow::before,.eyebrow::after{content:'';width:64px;height:1px;background:linear-gradient(90deg,rgba(232,163,58,0),#E8A33A)}.eyebrow::after{background:linear-gradient(90deg,#E8A33A,rgba(232,163,58,0))}",
".eyebrow .yr{padding-left:5px}",
".rule{width:120px;height:1px;margin:10px 0 8px;background:linear-gradient(90deg,rgba(232,163,58,0),#E8A33A 50%,rgba(232,163,58,0))}",
".sub{color:var(--goldl);font-size:11.5px;letter-spacing:3px;text-transform:uppercase}",
".playwrap{position:relative;padding:6px;margin-top:12px}",
".playwrap::before{content:'';position:absolute;left:50%;top:50%;width:120px;height:120px;margin:-60px 0 0 -60px;border-radius:50%;background:radial-gradient(circle,rgba(246,190,80,.6) 0%,rgba(246,190,80,0) 68%);animation:halo 2.6s ease-in-out infinite;pointer-events:none;will-change:transform,opacity}",
"@keyframes halo{0%,100%{opacity:.35;transform:scale(.9)}50%{opacity:.95;transform:scale(1.1)}}",
".playbtn{position:relative;z-index:1;overflow:hidden;width:72px;height:72px;padding:0;border:0;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;background:linear-gradient(180deg,#FBD27A 0%,#F0B04A 45%,#D88E22 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.6),inset 0 0 0 1px rgba(255,255,255,.25),0 6px 26px rgba(232,163,58,.55);transition:transform .15s}",
".playbtn:hover{transform:scale(1.07)}.playbtn svg{width:30px;height:30px;fill:#2a1700;margin-left:5px;position:relative;z-index:1}",
".playbtn::after{content:'';position:absolute;top:0;left:0;width:40%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.8),transparent);transform:translateX(-160%) skewX(-20deg);animation:sweep 3.2s ease-in-out infinite;will-change:transform}",
"@keyframes sweep{0%{transform:translateX(-160%) skewX(-20deg)}55%,100%{transform:translateX(330%) skewX(-20deg)}}",
".bs{position:absolute;color:#FFE7A8;text-shadow:0 0 8px rgba(255,214,120,.95);animation:tw 2.6s ease-in-out infinite;pointer-events:none;line-height:1}",
".wall{max-width:980px;margin:-20px auto 0;padding:0 14px 26px;position:relative}",
".card{position:relative;overflow:hidden;border-radius:18px;box-shadow:0 12px 40px rgba(40,30,10,.10),0 1px 0 rgba(0,0,0,.04);padding:22px 18px 10px;min-height:200px;background-color:#fff;background-image:" + TILE + ",linear-gradient(115deg,rgba(19,80,58,0) 6%,rgba(19,80,58,.17) 20%,rgba(19,80,58,0) 34%,rgba(19,80,58,0) 50%,rgba(19,80,58,.14) 64%,rgba(19,80,58,0) 78%,rgba(19,80,58,0) 86%,rgba(232,163,58,.12) 93%,rgba(232,163,58,0) 100%),radial-gradient(560px 360px at 0% 10%,rgba(19,80,58,.22),rgba(19,80,58,0) 70%),radial-gradient(560px 360px at 100% 55%,rgba(19,80,58,.2),rgba(19,80,58,0) 70%),radial-gradient(500px 320px at 25% 90%,rgba(232,163,58,.17),rgba(232,163,58,0) 70%)}",
".row4{position:relative;z-index:1;display:grid;grid-template-columns:repeat(4,minmax(0,112px));justify-content:center;gap:16px;margin-bottom:10px}",
".row4:not(.live) .lab .w{animation:none}",
".csk{position:absolute;inset:0;z-index:0;pointer-events:none}",
".cs{position:absolute;color:#E9A93A;text-shadow:0 0 6px rgba(255,200,90,.95),0 0 16px rgba(232,163,58,.75);opacity:.45;line-height:1;animation:cst 3.2s ease-in-out infinite;will-change:transform,opacity}",
"@keyframes cst{0%,100%{opacity:.2;transform:scale(.55) rotate(0)}50%{opacity:1;transform:scale(1.2) rotate(25deg)}}",
"body.scrolling .lab .w,body.scrolling .shine,body.scrolling .spark,body.scrolling .bs,body.scrolling .mark,body.scrolling .playwrap::before,body.scrolling .playbtn::after,body.scrolling .cs,body.scrolling .sq.now{animation:none}",
"body.scrolling .spark{opacity:.55}body.scrolling .cs{opacity:.45}body.scrolling .playwrap::before{opacity:.6}body.scrolling .sq{transition:none}",
".cell{margin:0}",
".sq{position:relative;aspect-ratio:1;border-radius:10px;overflow:hidden;background:#e9e3d6;box-shadow:0 0 0 3px #fff,0 4px 14px rgba(0,0,0,.16);cursor:pointer;transition:transform .15s,box-shadow .15s}",
".sq.f:hover{transform:translateY(-2px);box-shadow:0 0 0 3px var(--gold),0 10px 22px rgba(0,0,0,.2)}",
".sq video{width:100%;height:100%;object-fit:cover;display:block;position:relative}",
".pst{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}",
".sq.e{background:rgba(255,255,255,.55);box-shadow:none;border:1.5px dashed #d9cfbb;display:flex;align-items:center;justify-content:center;color:#d2c6ad;font-size:22px}",
".sq.e:hover{border-color:var(--gold);color:var(--gold2)}",
".sq.fut,.sq.pre{background:rgba(241,236,225,.85);box-shadow:0 0 0 1px rgba(217,207,187,.6);cursor:default}",
".sq.now{background:#fffaf0;display:flex;align-items:center;justify-content:center;flex-direction:column;color:var(--gold2);font-size:30px;line-height:1;box-shadow:0 0 0 2px #E8A33A;animation:nowp 2.4s ease-in-out infinite}",
"@keyframes nowp{0%,100%{box-shadow:0 0 0 2px #E8A33A,0 0 0 0 rgba(232,163,58,0)}50%{box-shadow:0 0 0 3px #E8A33A,0 0 24px 4px rgba(232,163,58,.5)}}",
".sq.now span{font-size:11px;margin-top:5px;letter-spacing:.3px}",
".lab{height:40px;margin-top:8px;text-align:center;line-height:1.2;overflow:hidden;background:radial-gradient(ellipse 62% 74% at 50% 50%,rgba(255,255,255,.96) 45%,rgba(255,255,255,0) 100%);border-radius:10px}",
".lab .w{display:block;font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:700;font-size:14.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 2px;background:linear-gradient(100deg,#8a560c 0%,#c4841f 30%,#f2bd55 50%,#c4841f 70%,#8a560c 100%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:wshine 3.6s linear infinite}",
"@keyframes wshine{from{background-position:0 center}to{background-position:-200% center}}",
".lab .w.s1{font-size:12.5px;padding-top:2px}",
".lab .d{display:block;font-family:'Playfair Display',Georgia,serif;font-style:italic;font-size:12px;color:#a8843f}",
".lab .w+.d{font-size:11.5px;color:#b39a6b}",
".first .lab .d{font-weight:700;font-style:normal}.first .lab .d::before{content:'✦ ';color:#E8A33A}",
".sq.e+.lab .d,.sq.fut+.lab .d,.sq.pre+.lab .d{color:#c9bfa9}",
".sq.e+.lab,.sq.fut+.lab,.sq.pre+.lab,.sq.now+.lab{background:none}",
".note{position:relative;z-index:1;text-align:center;color:#8a7a5a;font-size:13px;margin:4px 0 14px}",
".note b{color:var(--gold2)}",
"#bgfx{display:none;position:fixed;inset:0;z-index:-1;background:linear-gradient(160deg,#050806 0%,#0a1d14 45%,#12503a 100%);overflow:hidden;pointer-events:none}",
"body.theme-green{background:transparent;color:#f3ead6}body.theme-green #bgfx{display:block}",
"body.theme-green .head{background:transparent;border-bottom:0;padding:30px 20px 14px;overflow:visible}body.theme-green .head>.spark{display:none}",
"body.theme-green .wall{margin-top:0}body.theme-green .card{background:transparent;box-shadow:none;padding-top:12px}body.theme-green .lab{background:none}",
"body.theme-green .sq{background:#0f2a1e;box-shadow:0 0 0 2px rgba(243,215,154,.85),0 8px 20px rgba(0,0,0,.45)}",
"body.theme-green .sq.f:hover{box-shadow:0 0 0 3px #F6C45A,0 10px 26px rgba(0,0,0,.55)}",
"body.theme-green .lab .w{background-image:linear-gradient(100deg,#c98a22 0%,#f0c35a 30%,#fff3cc 50%,#f0c35a 70%,#c98a22 100%)}",
"body.theme-green .lab .d{color:#cdb37c}body.theme-green .first .lab .d::before{color:#F6C45A}",
"body.theme-green .sq.e{background:transparent;border-color:rgba(243,215,154,.35);color:rgba(243,215,154,.5)}",
"body.theme-green .sq.fut,body.theme-green .sq.pre{background:rgba(255,255,255,.05);box-shadow:none}",
"body.theme-green .sq.now{background:rgba(255,255,255,.06);color:#F6C45A}",
"body.theme-green .sq.e+.lab .d,body.theme-green .sq.fut+.lab .d,body.theme-green .sq.pre+.lab .d{color:rgba(205,179,124,.5)}",
"body.theme-green .foot,body.theme-green .toggle button,body.theme-green .note{color:#bfae86}body.theme-green .toggle button.on{color:#F6C45A}",
"body.scrolling #bgfx .spark{animation:none;opacity:.55}",
".foot{max-width:980px;margin:0 auto;padding:0 18px 30px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:12px;color:var(--muted)}",
".toggle button{background:none;border:0;color:var(--muted);font-size:12px;cursor:pointer;padding:2px 4px}",
".toggle button.on{color:var(--gold2);font-weight:700;text-decoration:underline;text-underline-offset:3px}",
".ov{position:fixed;inset:0;background:rgba(6,8,7,.86);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:none;align-items:center;justify-content:center;flex-direction:column;z-index:10;padding:20px}",
".ov.show{display:flex}",
".frame{position:relative;aspect-ratio:1;border-radius:16px;overflow:hidden;background:#000;box-shadow:0 0 0 4px #fff,0 24px 70px rgba(0,0,0,.55)}",
".one .frame{width:min(74vw,62vh)}.all .frame{width:min(86vw,68vh)}",
".frame video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:opacity .18s}",
".pop{position:absolute;left:4%;right:4%;bottom:11%;text-align:center;font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:700;font-size:clamp(30px,7vw,58px);line-height:1.1;pointer-events:none;opacity:0;filter:drop-shadow(0 2px 10px rgba(0,0,0,.65));z-index:2}",
".pop.go{animation:popin 1.7s ease-out forwards}",
"@keyframes popin{0%{opacity:0;transform:translateY(16px) scale(.85);letter-spacing:8px}22%{opacity:1;transform:translateY(0) scale(1.05);letter-spacing:1px}72%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.03)}}",
".psk{position:absolute;color:#FFE7A8;text-shadow:0 0 10px rgba(255,214,120,1);pointer-events:none;z-index:3;opacity:0;animation:pk 1.3s ease-out forwards}",
"@keyframes pk{0%{opacity:0;transform:scale(.3) rotate(0)}35%{opacity:1;transform:scale(1.1) rotate(25deg)}100%{opacity:0;transform:scale(.6) rotate(60deg)}}",
".cap{color:#fff;margin-top:16px;text-align:center}",
".capw{font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:700;font-size:26px;line-height:1.15}",
".capd{font-family:'Playfair Display',Georgia,serif;font-size:17px;color:#efe4cc;margin-top:2px}",
".capd small{font-family:-apple-system,sans-serif;color:var(--goldl);font-size:11px;letter-spacing:1.4px;text-transform:uppercase;margin-left:8px}",
".ctrls{display:flex;gap:10px;margin-top:14px;align-items:center}",
".ghost{background:rgba(255,255,255,.10);color:#fff;border:1px solid rgba(255,255,255,.28);border-radius:999px;height:38px;min-width:38px;padding:0 16px;cursor:pointer;font-size:14px}",
".ghost:hover{background:rgba(255,255,255,.18)}.x{position:absolute;top:16px;right:18px}",
".bar{display:flex;gap:2px;margin-top:14px}.bar i{flex:1;height:4px;border-radius:2px;background:rgba(255,255,255,.18)}.bar i.done{background:var(--gold)}",
"#mm-pick{background:rgba(4,7,16,.8)}",
".ed{width:100%;max-width:560px;max-height:calc(100vh - 32px);overflow:auto;background:linear-gradient(180deg,#0b1224,#080C18);color:#E6ECF7;border:1px solid rgba(127,182,255,.3);border-radius:18px;padding:16px 20px 20px;box-shadow:0 24px 70px rgba(0,0,0,.6),0 0 44px rgba(46,124,246,.22)}",
".edtop{display:flex;align-items:center;gap:10px;margin-bottom:10px}",
".edlogo{width:30px;height:30px;border-radius:9px;background:linear-gradient(180deg,#4b92ff,#1b4fb0);display:flex;align-items:center;justify-content:center;box-shadow:0 0 14px rgba(46,124,246,.6)}.edlogo svg{width:16px;height:16px;fill:#fff}",
".edname{font-weight:700;letter-spacing:.3px}.edstep{margin-left:auto;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#7FB6FF}",
".edx{background:rgba(255,255,255,.06);border:1px solid rgba(127,182,255,.3);color:#c6d1e4;border-radius:999px;width:32px;height:32px;cursor:pointer}",
".dots{display:flex;gap:6px;margin:0 0 16px}.dots i{flex:1;height:4px;border-radius:2px;background:rgba(127,182,255,.18)}.dots i.on{background:linear-gradient(90deg,#2E7CF6,#7FB6FF);box-shadow:0 0 8px rgba(46,124,246,.6)}",
".edh{font-size:22px;margin:0 0 2px;font-weight:700;color:#fff}.edh .it{font-family:Baskerville,'Baskerville Old Face',Georgia,serif;font-style:italic;color:#7FB6FF;font-weight:600}",
".eds{color:#9aa7bd;font-size:14px;margin:0 0 14px}",
".drop{display:block;border:1.5px dashed #7FB6FF;border-radius:14px;padding:24px 16px;text-align:center;cursor:pointer;background:rgba(46,124,246,.07);transition:background .15s,border-color .15s}",
".drop:hover,.drop.over{background:rgba(46,124,246,.18);border-color:#fff}",
".dropic{width:46px;height:46px;margin:0 auto 8px;border-radius:50%;background:rgba(46,124,246,.22);border:1px solid #7FB6FF;display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px rgba(46,124,246,.45)}.dropic svg{width:20px;height:20px;fill:#7FB6FF}",
".drop b{display:block;font-size:16px;color:#fff}.drop span{font-size:13px;color:#9aa7bd}",
".or{display:flex;align-items:center;gap:10px;color:#9aa7bd;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;margin:14px 0}.or::before,.or::after{content:'';flex:1;height:1px;background:rgba(127,182,255,.22)}",
".chatway{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;border:1px solid rgba(127,182,255,.3);border-radius:12px;background:rgba(255,255,255,.04);font-size:14px;color:#c6d1e4}",
".chatway svg{flex:0 0 22px;width:22px;height:22px;fill:#7FB6FF;margin-top:1px}.chatway b{color:#fff}",
".ederr{color:#ff9b9b;font-size:13px;min-height:18px;margin-top:8px;text-align:center}.ederr.ok{color:#7FB6FF}",
".spin{display:inline-block;width:14px;height:14px;border-radius:50%;border:2px solid rgba(127,182,255,.25);border-top-color:#7FB6FF;border-right-color:#7FB6FF;animation:spin 1s linear infinite;vertical-align:-2px;margin-right:6px}@keyframes spin{to{transform:rotate(360deg)}}",
".edprev{position:relative;width:min(100%,280px);aspect-ratio:1;margin:0 auto 14px;border-radius:14px;overflow:hidden;background:#000;box-shadow:0 0 0 1px rgba(127,182,255,.45),0 0 30px rgba(46,124,246,.35)}",
".edprev video{width:100%;height:100%;object-fit:cover;display:block}",
".edtag{position:absolute;left:8px;top:8px;background:rgba(8,12,24,.75);color:#7FB6FF;font-size:10.5px;letter-spacing:1.2px;text-transform:uppercase;padding:3px 8px;border-radius:6px}",
".strip2{position:relative;height:58px;border-radius:10px;overflow:hidden;background:#0a1026;touch-action:none;cursor:grab;user-select:none;-webkit-user-select:none;box-shadow:0 0 0 1px rgba(127,182,255,.25)}",
".strip2 canvas{width:100%;height:100%;display:block}.shade{position:absolute;top:0;height:100%;background:rgba(5,8,20,.6);pointer-events:none}",
".bbox{position:absolute;top:0;height:100%;border:3px solid #2E7CF6;border-radius:10px;box-shadow:0 0 0 2px rgba(127,182,255,.4),0 0 20px rgba(46,124,246,.9);pointer-events:none}",
".bbox::before,.bbox::after{content:'';position:absolute;top:50%;width:4px;height:22px;margin-top:-11px;border-radius:2px;background:#7FB6FF}.bbox::before{left:3px}.bbox::after{right:3px}",
".tl{display:flex;justify-content:space-between;font-size:11px;color:#9aa7bd;margin:5px 2px 0}",
".ed input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:6px;margin:16px 0 4px;border-radius:3px;outline:none;background:linear-gradient(90deg,#2E7CF6 0%,#7FB6FF var(--p,0%),rgba(127,182,255,.18) var(--p,0%))}",
".ed input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:22px;height:22px;border-radius:50%;background:#7FB6FF;border:3px solid #2E7CF6;box-shadow:0 0 0 4px rgba(46,124,246,.25),0 0 14px rgba(46,124,246,.9);cursor:pointer}",
".lens{display:flex;align-items:center;gap:8px;margin:12px 0;flex-wrap:wrap;font-size:13px;color:#9aa7bd}",
".len2,.q2{height:34px;padding:0 14px;border-radius:999px;border:1px solid rgba(127,182,255,.38);background:rgba(255,255,255,.04);color:#E6ECF7;font-size:14px;cursor:pointer}",
".q2:hover,.len2:hover{border-color:#7FB6FF}.len2.sel{background:#2E7CF6;border-color:#7FB6FF;color:#fff;box-shadow:0 0 14px rgba(46,124,246,.65)}.len2:disabled{opacity:.3;cursor:not-allowed}",
".edfoot{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-top:6px}.edfoot b{color:#fff}",
".edbtn{height:44px;padding:0 20px;border-radius:999px;border:0;background:linear-gradient(180deg,#4b92ff,#2E7CF6);color:#fff;font-weight:700;font-size:15px;cursor:pointer;box-shadow:inset 0 0 0 1px rgba(255,255,255,.18),0 6px 22px rgba(46,124,246,.55)}",
".edbtn:hover{filter:brightness(1.08)}.edbtn:disabled{opacity:.45;cursor:wait}.edbtn.plain{background:rgba(255,255,255,.06);box-shadow:none;border:1px solid rgba(127,182,255,.38);color:#E6ECF7}",
".e3prev{display:flex;gap:14px;align-items:center;margin:0 0 14px}",
".e3prev video{flex:0 0 84px;width:84px;height:84px;border-radius:12px;object-fit:cover;background:#000;box-shadow:0 0 0 1px rgba(127,182,255,.45),0 0 16px rgba(46,124,246,.35)}",
".wordb{width:100%;height:54px;border-radius:12px;border:1.5px solid rgba(127,182,255,.38);padding:0 16px;font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:700;font-size:22px;color:#fff;outline:none;background:rgba(255,255,255,.05)}",
".wordb::placeholder{color:#5b6b8a}.wordb:focus{border-color:#7FB6FF;box-shadow:0 0 0 4px rgba(46,124,246,.25)}",
".wmeta2{display:flex;justify-content:space-between;font-size:12px;color:#9aa7bd;margin-top:6px}"
].join("\n");

var PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 5.2v13.6L18.6 12z"/></svg>';
var HTML = '<div id="bgfx"></div>' +
'<header class="head" id="mm-head"><div class="in">' +
'<div class="eyebrow"><span class="mark">✦</span><span class="yr" id="mm-yr"></span><span class="mark r">✦</span></div>' +
'<h1 class="mmt"><span class="foil shine">My Memories</span></h1><div class="rule"></div><div class="sub" id="mm-sub"></div>' +
'<div class="playwrap"><span class="bs" style="top:-2px;left:-8px;font-size:14px;animation-delay:.2s">✦</span><span class="bs" style="top:4px;right:-12px;font-size:10px;animation-delay:1.1s">✦</span><span class="bs" style="bottom:-4px;right:-6px;font-size:13px;animation-delay:1.8s">✦</span><span class="bs" style="bottom:8px;left:-14px;font-size:9px;animation-delay:.7s">✦</span>' +
'<button class="playbtn" id="mm-play" aria-label="Play my memories" title="Play my memories">' + PLAY + '</button></div>' +
'</div></header>' +
'<main class="wall"><div class="card" id="mm-cal"></div></main>' +
'<div class="foot"><span>🔒 Private. Your memories and words stay on this laptop.</span>' +
'<span class="toggle">Look: <button id="mm-t-ivory" class="on">Ivory</button>·<button id="mm-t-green">Christmas green</button></span></div>' +
'<div class="ov" id="mm-ov"><button class="ghost x" id="mm-close" aria-label="Close">✕</button>' +
'<div class="frame" id="mm-frame"><video id="mm-va" playsinline muted></video><video id="mm-vb" playsinline muted style="opacity:0"></video><div class="pop foil" id="mm-pop"></div></div>' +
'<div class="cap" id="mm-cap"></div><div class="bar" id="mm-bar"></div><div class="ctrls" id="mm-ctrls"></div></div>' +
'<div class="ov" id="mm-pick"><div class="ed" role="dialog" aria-label="Add a memory">' +
'<div class="edtop"><span class="edlogo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h10a2 2 0 0 1 2 2v2.4l4.2-2.6a.5.5 0 0 1 .8.4v9.6a.5.5 0 0 1-.8.4L16 14.6V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/></svg></span>' +
'<span class="edname">Video editor</span><span class="edstep" id="mm-edstep">Step 1 of 3</span><button class="edx" id="mm-pcancel" aria-label="Close">✕</button></div>' +
'<div class="dots"><i id="mm-d1" class="on"></i><i id="mm-d2"></i><i id="mm-d3"></i></div>' +
'<div id="mm-e1"><h2 class="edh" id="mm-e1h">Add this week\'s <span class="it">memory</span></h2>' +
'<p class="eds">Film it on your phone, any length. Then bring it in, one of two ways.</p>' +
'<label class="drop" id="mm-drop"><input type="file" id="mm-file" accept="video/*,.mov,.mp4,.m4v" hidden>' +
'<div class="dropic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l5 5h-3.2v6h-3.6V8H7l5-5zM5 16.5h14V20H5z"/></svg></div>' +
'<b>Choose a video from your files</b><span>or drag it onto this box</span></label>' +
'<div class="or">or</div><div class="chatway"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>' +
'<div><b>Drop it into the chat</b> beside this page and say <i>"my memory"</i>. It opens straight here, ready to pick your seconds.</div></div>' +
'<div class="ederr" id="mm-e1err"></div></div>' +
'<div id="mm-e2" hidden><h2 class="edh">Pick your <span class="it">seconds</span></h2>' +
'<p class="eds">Slide the blue box along your video to your moment. 3 seconds max, 1 second min.</p>' +
'<div class="edprev"><video id="mm-pv" muted playsinline></video><span class="edtag">Your memory</span></div>' +
'<div class="strip2" id="mm-strip"><canvas id="mm-thumbs" width="1000" height="116"></canvas><div class="shade" id="mm-shL"></div><div class="shade" id="mm-shR"></div><div class="bbox" id="mm-bbox"></div></div>' +
'<div class="tl"><span>0:00</span><span id="mm-tlEnd"></span></div>' +
'<input type="range" id="mm-pos" min="0" max="10" step="0.1" value="0" aria-label="Move the blue box">' +
'<div class="lens">Length <button class="len2" data-l="1">1 sec</button><button class="len2" data-l="2">2 sec</button><button class="len2 sel" data-l="3">3 sec</button></div>' +
'<div class="edfoot"><span>Your memory: <b id="mm-rd"></b></span><button class="edbtn" id="mm-enext">✓ This is my memory</button></div></div>' +
'<div id="mm-e3" hidden><div class="e3prev"><video id="mm-pv3" muted playsinline></video><div><h2 class="edh" style="margin:0">One word for this <span class="it">memory</span>?</h2>' +
'<p class="eds" style="margin:2px 0 0">1 to 3 words, up to 16 letters, like <i>Road trip</i> or <i>Best day ever</i>.</p></div></div>' +
'<input class="wordb" id="mm-word" maxlength="16" placeholder="Birthday" autocomplete="off" aria-label="One word for this memory">' +
'<div class="wmeta2"><span>Quick picks, or type your own</span><span id="mm-wc">0 / 16</span></div>' +
'<div class="lens"><button class="q2">Birthday</button><button class="q2">Road trip</button><button class="q2">Family</button><button class="q2">Best day ever</button></div>' +
'<div class="ederr" id="mm-werr"></div>' +
'<div class="edfoot"><button class="edbtn plain" id="mm-eback">← Back</button><span style="display:flex;gap:8px;flex-wrap:wrap"><button class="edbtn plain" id="mm-wskip">Skip, no word</button><button class="edbtn" id="mm-wsave">✓ Add to my wall</button></span></div></div>' +
'</div></div>';

var styleEl = document.createElement("style"); styleEl.textContent = CSS; document.head.appendChild(styleEl);
var mount = document.getElementById("mm") || document.body; mount.innerHTML = HTML;
function $(id) { return document.getElementById("mm-" + id); }

var MN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
var LONG = ["January","February","March","April","May","June","July","August","September","October","November","December"];
function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function iso(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
function sundayOf(d) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + (6 - ((x.getDay() + 6) % 7))); return x; }
var today = new Date(); today.setHours(0, 0, 0, 0);
var THIS = iso(sundayOf(today));
var qs = new URLSearchParams(location.search);
var YEAR = +qs.get("year") || sundayOf(today).getFullYear();
var MEM = {}, wk = [], firstRow = 0, loadErr = false;

(function () { var hd = $("head"); for (var i = 0; i < 18; i++) { var s = document.createElement("span"); s.className = "spark"; var z = 2 + Math.random() * 3; s.style.width = s.style.height = z + "px"; s.style.left = (Math.random() * 100) + "%"; s.style.top = (Math.random() * 100) + "%"; s.style.animationDelay = (Math.random() * 3) + "s"; s.style.animationDuration = (2 + Math.random() * 2.5) + "s"; hd.appendChild(s); } })();
(function () { var bg = document.getElementById("bgfx"); for (var i = 0; i < 34; i++) { var s = document.createElement("span"); s.className = "spark"; var z = 1.5 + Math.random() * 3.5; s.style.width = s.style.height = z + "px"; s.style.left = (Math.random() * 100) + "%"; s.style.top = (Math.random() * 100) + "%"; s.style.animationDelay = (Math.random() * 4) + "s"; s.style.animationDuration = (2.2 + Math.random() * 3) + "s"; bg.appendChild(s); } })();

function load() {
  return fetch(API + "/api/memories?t=" + Date.now(), { cache: "no-store" })
    .then(function (r) { return r.json(); })
    .then(function (d) { MEM = {}; (d.memories || []).forEach(function (m) { MEM[m.date] = m; }); loadErr = false; })
    .catch(function () { loadErr = true; });
}
function build() {
  wk = []; var fs = sundayOf(new Date(YEAR, 0, 1)), start = null;
  Object.keys(MEM).forEach(function (k) { if (+k.slice(0, 4) === YEAR && (!start || k < start)) start = k; });
  if (+THIS.slice(0, 4) === YEAR && (!start || THIS < start)) start = THIS;
  for (var i = 0; i < 54; i++) {
    var t = new Date(fs.getFullYear(), fs.getMonth(), fs.getDate() + 7 * i); if (t.getFullYear() !== YEAR) break;
    var k = iso(t), m = MEM[k], s;
    if (m) s = "f"; else if (k === THIS) s = "now"; else if (k > THIS) s = "fut"; else if (start && k > start) s = "e"; else s = "pre";
    wk.push({ t: t, iso: k, n: i + 1, st: s, word: m ? (m.word || "") : "", m: m || null });
  }
  firstRow = 0;
  if (start) { for (var j = 0; j < wk.length; j++) { if (wk[j].iso >= start) { firstRow = Math.floor(j / 4); break; } } }
}
function dshort(w) { return w.t.getDate() + " " + MN[w.t.getMonth()]; }
function filled() { var a = []; wk.forEach(function (w, j) { if (w.st === "f") a.push(j); }); return a; }
function thisIndex() { for (var j = 0; j < wk.length; j++) if (wk[j].iso === THIS) return j; return -1; }

/* ---- playing: only rows on screen get videos, made once per memory and reattached, never while scrolling ---- */
var paused = false, scrolling = false, visibleRows = new Set(), vcache = {}, addTimer = null;
function vidFor(w) { var key = w.m.wall, v = vcache[key]; if (v) return v; v = document.createElement("video"); v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute("muted", ""); v.setAttribute("loop", ""); v.setAttribute("playsinline", ""); v.preload = "auto"; v.src = API + w.m.wall; vcache[key] = v; return v; }
function addOne(sq) { var v = vidFor(wk[+sq.dataset.j]); sq.appendChild(v); sq.classList.add("hasv"); v.play().catch(function () {}); }
function releaseIn(scope) { scope.querySelectorAll(".sq.hasv").forEach(function (sq) { var v = sq.querySelector("video"); if (v) { v.pause(); v.remove(); } sq.classList.remove("hasv"); }); }
function addNext() { if (scrolling || paused) return; var rows = Array.from(visibleRows).sort(function (a, b) { return a.getBoundingClientRect().top - b.getBoundingClientRect().top; }); for (var i = 0; i < rows.length; i++) { var sq = rows[i].querySelector(".sq.f:not(.hasv)"); if (sq) { addOne(sq); addTimer = setTimeout(addNext, 45); return; } } }
function queueAdd(d) { clearTimeout(addTimer); addTimer = setTimeout(addNext, d || 0); }
var io = new IntersectionObserver(function (es) { es.forEach(function (e) { var row = e.target; if (e.isIntersecting) { visibleRows.add(row); row.classList.add("live"); if (!scrolling) queueAdd(30); } else { visibleRows.delete(row); row.classList.remove("live"); releaseIn(row); } }); }, { rootMargin: "40px 0px" });
function pauseAll() { clearTimeout(addTimer); releaseIn($("cal")); }
function pauseWall() { paused = true; pauseAll(); }
function resumeWall() { paused = false; if (!scrolling) queueAdd(150); }
document.addEventListener("visibilitychange", function () { if (document.hidden) pauseAll(); else if (!paused && !scrolling) queueAdd(200); });
var scrollTimer = null;
window.addEventListener("scroll", function () {
  if (!scrolling) { scrolling = true; document.body.classList.add("scrolling"); pauseAll(); }
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(function () { scrolling = false; document.body.classList.remove("scrolling"); if (!paused) queueAdd(220); }, 150);
}, { passive: true });
var SPARKS = (function () { var h = '<div class="csk" aria-hidden="true">'; for (var i = 0; i < 30; i++) { h += '<span class="cs" style="left:' + (2 + Math.random() * 96).toFixed(1) + '%;top:' + (1 + Math.random() * 98).toFixed(1) + '%;font-size:' + (13 + Math.random() * 13).toFixed(0) + 'px;animation-delay:' + (Math.random() * 3).toFixed(2) + 's;animation-duration:' + (2.4 + Math.random() * 1.8).toFixed(2) + 's">✦</span>'; } return h + "</div>"; })();

function draw() {
  io.disconnect(); visibleRows.clear(); clearTimeout(addTimer); releaseIn($("cal"));
  $("yr").textContent = YEAR;
  var h = SPARKS, seen = {}, f = filled().length;
  if (loadErr) h += '<p class="note">Your memories didn\'t load. Say <b>"open my memories"</b> in the chat and they\'ll start.</p>';
  else if (!f && thisIndex() >= 0) h += '<p class="note">✦ Your wall starts here. Tap the <b>gold square</b> to add this week\'s memory.</p>';
  for (var j0 = 0; j0 < firstRow * 4; j0++) seen[wk[j0].t.getMonth()] = 1;
  for (var r = firstRow; r < Math.ceil(wk.length / 4); r++) {
    h += '<div class="row4">';
    for (var c = 0; c < 4; c++) {
      var j = r * 4 + c, w = wk[j]; if (!w) break;
      var mo = w.t.getMonth(), first = !seen[mo]; seen[mo] = 1; var D = dshort(w), inner = "";
      if (w.st === "f") inner = '<img class="pst" src="' + esc(API + w.m.still) + '" alt="" decoding="async">';
      else if (w.st === "now") inner = '+<span>This week</span>';
      else if (w.st === "e") inner = '+';
      var lab = (w.word ? '<span class="w' + (w.word.length > 12 ? " s1" : "") + '" style="animation-delay:-' + ((j % 13) * 0.28).toFixed(2) + 's">' + esc(w.word) + '</span>' : "") + '<span class="d">' + D + '</span>';
      var tip = w.st === "e" ? "No memory this week. Tap to add one." : (w.word ? w.word + " · " : "") + "Week " + w.n + " · " + D;
      h += '<figure class="cell' + (first ? " first" : "") + '"><div class="sq ' + w.st + '" data-j="' + j + '" title="' + esc(tip) + '">' + inner + '</div><figcaption class="lab">' + lab + '</figcaption></figure>';
    }
    h += "</div>";
  }
  var cal = $("cal"); cal.innerHTML = h;
  cal.querySelectorAll(".row4").forEach(function (row) { io.observe(row); });
  var secs = 0; wk.forEach(function (w) { if (w.m) secs += +w.m.len || 3; }); secs = Math.round(secs);
  $("sub").textContent = f ? (f + (f === 1 ? " memory · " : " memories · ") + (secs >= 60 ? Math.floor(secs / 60) + " min " + (secs % 60) + " sec" : secs + " sec")) : "Your first memory starts this week";
}

/* ---- tap a square: it loops big; ▶ plays them all, again and again ---- */
var ov = $("ov"), va = $("va"), vb = $("vb"), cap = $("cap"), bar = $("bar"), ctrls = $("ctrls"), pop = $("pop"), frame = $("frame");
var curMem = null, list = [], idx = 0, front = va, back = vb, view = "";
function caption(j) { var w = wk[j]; cap.innerHTML = (w.word ? '<div class="capw foil shine">' + esc(w.word) + "</div>" : "") + '<div class="capd">' + w.t.getDate() + " " + LONG[w.t.getMonth()] + " " + w.t.getFullYear() + "<small>Week " + w.n + "</small></div>"; }
function popWord(word) {
  frame.querySelectorAll(".psk").forEach(function (s) { s.remove(); });
  pop.classList.remove("go"); pop.textContent = word || ""; if (!word) return;
  void pop.offsetWidth; pop.classList.add("go");
  for (var i = 0; i < 12; i++) { var s = document.createElement("span"); s.className = "psk"; s.textContent = "✦"; s.style.left = (12 + Math.random() * 76) + "%"; s.style.top = (58 + Math.random() * 30) + "%"; s.style.fontSize = (9 + Math.random() * 14) + "px"; s.style.animationDelay = (Math.random() * 0.6) + "s"; frame.appendChild(s); }
}
function full(j) { return API + wk[j].m.full; }
function setSrc(v, src) { if (v._src !== src) { v.src = src; v._src = src; } else { try { v.currentTime = 0; } catch (e) {} } }
function openOv(kind) { view = kind; ov.className = "ov show " + kind; pauseWall(); }
function closeOv() { if (!view) return; ov.className = "ov"; view = ""; [va, vb].forEach(function (v) { v.onended = null; v.pause(); v.removeAttribute("src"); v._src = null; v.load(); }); popWord(""); resumeWall(); }
$("close").onclick = closeOv;
ov.addEventListener("click", function (e) { if (e.target === ov) closeOv(); });
function openOne(j) {
  if (!wk[j] || !wk[j].m) return;
  openOv("one"); curMem = j; bar.innerHTML = ""; vb.pause(); vb.onended = null; vb.style.opacity = 0; va.style.opacity = 1; front = va; back = vb;
  va.loop = true; va.onended = null; setSrc(va, full(j)); va.play().catch(function () {});
  caption(j); popWord(wk[j].word);
  ctrls.innerHTML = '<button class="ghost" id="mm-prev" aria-label="Previous memory">‹</button><button class="ghost" id="mm-next" aria-label="Next memory">›</button>';
  $("prev").onclick = function () { stepMem(-1); }; $("next").onclick = function () { stepMem(1); };
}
function stepMem(d) { var f = filled(), k = f.indexOf(curMem); if (k < 0) return; openOne(f[(k + d + f.length) % f.length]); }
function playAll() {
  list = filled();
  if (!list.length) { var n = document.querySelector(".sq.now"); if (n) n.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
  idx = 0; openOv("all");
  bar.style.width = getComputedStyle(frame).width;
  bar.innerHTML = list.map(function () { return "<i></i>"; }).join(""); ctrls.innerHTML = "";
  [va, vb].forEach(function (v) { v.pause(); v.loop = false; v.onended = next; }); va.style.opacity = 1; vb.style.opacity = 0; front = va; back = vb;
  if (list.length === 1) { va.loop = true; va.onended = null; }
  setSrc(front, full(list[0])); front.play().catch(function () {});
  if (list.length > 1) { setSrc(back, full(list[1])); back.load(); }
  mark();
}
function mark() { var j = list[idx]; caption(j); popWord(wk[j].word); var t = bar.children; for (var i = 0; i < t.length; i++) t[i].className = i <= idx ? "done" : ""; }
function next() {
  if (view !== "all") return;
  idx = (idx + 1) % list.length;
  var old = front; front = back; back = old; back.pause();
  setSrc(front, full(list[idx])); front.play().catch(function () {});
  front.style.opacity = 1; back.style.opacity = 0;
  setTimeout(function () { if (view === "all") { setSrc(back, full(list[(idx + 1) % list.length])); back.load(); } }, 250);
  mark();
}
$("play").onclick = playAll;

/* ---- the video editor: add a memory in 3 steps ---- */
var pick = $("pick"), fileIn = $("file"), drop = $("drop"), e1err = $("e1err");
var pv = $("pv"), pv3 = $("pv3"), strip = $("strip"), cnv = $("thumbs");
var bbox = $("bbox"), shL = $("shL"), shR = $("shR"), pos2 = $("pos"), rd2 = $("rd"), tlEnd = $("tlEnd");
var wordIn = $("word"), werr = $("werr"), wc = $("wc");
var ed = { target: -1, file: null, src: "", name: "", url: "", dur: 0, start: 0, len: 3 };
function startAt(v, t) { if (v.readyState >= 1) { try { v.currentTime = t; } catch (e) {} } else { v.addEventListener("loadedmetadata", function () { try { v.currentTime = t; } catch (e) {} }, { once: true }); } }
function unbind(v) { v._seg = null; if (v._rv) { if (v.cancelVideoFrameCallback) { try { v.cancelVideoFrameCallback(v._rv); } catch (e) {} } clearTimeout(v._rv); v._rv = null; } }
function loopSeg(v) {
  unbind(v); var s = { a: ed.start, b: ed.start + ed.len }; v._seg = s; v.loop = false;
  var arm = function () { v._rv = v.requestVideoFrameCallback ? v.requestVideoFrameCallback(tick) : setTimeout(tick, 40); };
  var tick = function () { if (v._seg !== s) return; var t = v.currentTime; if (t < s.a - 0.25 || t >= s.b - 0.04) { try { v.currentTime = s.a; } catch (e) {} } arm(); };
  arm(); v.onended = function () { if (v._seg !== s) return; try { v.currentTime = s.a; } catch (e) {} v.play().catch(function () {}); };
}
function edGo(n) { ["e1", "e2", "e3"].forEach(function (id, k) { $(id).hidden = (k + 1) !== n; }); $("edstep").textContent = "Step " + n + " of 3"; for (var k = 1; k <= 3; k++) $("d" + k).className = k <= n ? "on" : ""; if (n !== 2) { unbind(pv); pv.pause(); } if (n !== 3) { unbind(pv3); pv3.pause(); } }
function openPick(j) {
  if (j < 0 || !wk[j]) return;
  closeOv(); ed.target = j; ed.file = null; ed.src = "";
  $("e1h").innerHTML = wk[j].iso === THIS ? 'Add this week\'s <span class="it">memory</span>' : 'A memory for the week of <span class="it">' + dshort(wk[j]) + '</span>';
  pick.className = "ov show"; pauseWall(); edGo(1); e1err.className = "ederr"; e1err.textContent = "";
  [$("wsave"), $("wskip"), $("eback")].forEach(function (b) { b.disabled = false; });
}
function closePick() { if (!pick.classList.contains("show")) return; pick.className = "ov"; unbind(pv); pv.pause(); unbind(pv3); pv3.pause(); resumeWall(); }
$("pcancel").onclick = closePick;
pick.addEventListener("click", function (e) { if (e.target === pick) closePick(); });
function fmt(s) { var m = Math.floor(s / 60), r = s - m * 60; return m + ":" + (r < 10 ? "0" : "") + r.toFixed(1); }
function isVideo(f) { return f && ((f.type || "").indexOf("video/") === 0 || /\.(mov|mp4|m4v|webm)$/i.test(f.name || "")); }
function takeFile(f) { if (!isVideo(f)) { e1err.className = "ederr"; e1err.textContent = "That's not a video. Pick an MP4 or MOV from your phone."; return; } ed.file = f; ed.src = ""; ed.name = f.name || "video.mov"; loadVideo(URL.createObjectURL(f)); }
fileIn.onchange = function () { if (fileIn.files[0]) takeFile(fileIn.files[0]); fileIn.value = ""; };
["dragenter", "dragover"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add("over"); }); });
["dragleave", "drop"].forEach(function (t) { drop.addEventListener(t, function () { drop.classList.remove("over"); }); });
window.addEventListener("dragover", function (e) { e.preventDefault(); });
window.addEventListener("drop", function (e) { e.preventDefault(); var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (!f) return; if (!pick.classList.contains("show")) openPick(thisIndex()); if (pick.classList.contains("show")) takeFile(f); });
function loadVideo(url) {
  e1err.className = "ederr ok"; e1err.innerHTML = '<span class="spin"></span>Opening your video…';
  ed.url = url; unbind(pv);
  pv.onloadedmetadata = function () {
    ed.dur = pv.duration;
    if (!isFinite(ed.dur) || ed.dur <= 0) { e1err.className = "ederr"; e1err.textContent = "That video didn't open. Try another one."; return; }
    e1err.textContent = ""; ed.len = Math.min(3, ed.dur); ed.start = Math.max(0, Math.min(ed.dur - ed.len, ed.dur * 0.3));
    setLens(); edGo(2); layout(); drawThumbs(url); previewSeg();
  };
  pv.onerror = function () { e1err.className = "ederr"; e1err.textContent = "That video didn't open. Try a different one (MP4 or MOV)."; };
  pv.src = url;
}
function setLens() { document.querySelectorAll(".len2").forEach(function (b) { var l = +b.dataset.l; b.disabled = l > ed.dur + 0.01; b.classList.toggle("sel", Math.abs(l - ed.len) < 0.01); }); }
function layout() {
  var d = ed.dur || 1, span = Math.max(0.01, d - ed.len);
  pos2.max = Math.max(0, d - ed.len).toFixed(1); pos2.value = ed.start; pos2.style.setProperty("--p", Math.min(100, ed.start / span * 100) + "%");
  var L = ed.start / d * 100, W = ed.len / d * 100;
  bbox.style.left = L + "%"; bbox.style.width = W + "%"; shL.style.left = "0"; shL.style.width = L + "%"; shR.style.left = (L + W) + "%"; shR.style.width = (100 - L - W) + "%";
  var n = ed.len % 1 === 0 ? ed.len : ed.len.toFixed(1);
  rd2.textContent = fmt(ed.start) + " to " + fmt(ed.start + ed.len) + " (" + n + " sec)"; tlEnd.textContent = fmt(d);
}
function previewSeg() { loopSeg(pv); try { pv.currentTime = ed.start; } catch (e) {} pv.play().catch(function () {}); }
var rafPending = false;
function setStart(s) { ed.start = Math.max(0, Math.min(ed.dur - ed.len, s)); layout(); if (!rafPending) { rafPending = true; requestAnimationFrame(function () { rafPending = false; previewSeg(); }); } }
pos2.oninput = function () { setStart(+pos2.value); };
var dragging = false;
function fromPointer(e) { var r = strip.getBoundingClientRect(); setStart((e.clientX - r.left) / r.width * ed.dur - ed.len / 2); }
strip.addEventListener("pointerdown", function (e) { dragging = true; strip.setPointerCapture(e.pointerId); strip.style.cursor = "grabbing"; fromPointer(e); });
strip.addEventListener("pointermove", function (e) { if (dragging) fromPointer(e); });
strip.addEventListener("pointerup", function () { dragging = false; strip.style.cursor = ""; });
document.querySelectorAll(".len2").forEach(function (b) { b.onclick = function () { if (b.disabled) return; ed.len = Math.min(+b.dataset.l, ed.dur); setLens(); setStart(ed.start); }; });
function drawThumbs(url) {
  var ctx = cnv.getContext("2d"), W = cnv.width, H = cnv.height, n = 8, k = 0, tw = W / n;
  ctx.fillStyle = "#0a1026"; ctx.fillRect(0, 0, W, H);
  var tv = document.createElement("video"); tv.muted = true; tv.preload = "auto";
  var go = function () { if (k >= n) { tv.removeAttribute("src"); tv.load(); return; } try { tv.currentTime = Math.min(tv.duration - 0.05, (k + 0.5) * tv.duration / n); } catch (e) {} };
  tv.onloadedmetadata = go;
  tv.onseeked = function () { var vw = tv.videoWidth, vh = tv.videoHeight; if (vw && vh) { var ta = tw / H, sa = vw / vh, sw, sh, sx, sy; if (sa > ta) { sh = vh; sw = vh * ta; sx = (vw - sw) / 2; sy = 0; } else { sw = vw; sh = vw / ta; sx = 0; sy = (vh - sh) / 2; } try { ctx.drawImage(tv, sx, sy, sw, sh, k * tw, 0, tw + 1, H); } catch (e) {} ctx.fillStyle = "rgba(5,8,20,.65)"; ctx.fillRect(k * tw, 0, 1.5, H); } k++; go(); };
  tv.src = url;
}
$("enext").onclick = function () {
  edGo(3); if (pv3._src !== ed.url) { pv3.src = ed.url; pv3._src = ed.url; }
  loopSeg(pv3); startAt(pv3, ed.start); pv3.play().catch(function () {});
  wordIn.value = ""; wcount(); wordIn.focus();
};
$("eback").onclick = function () { edGo(2); previewSeg(); };
function wcount() { var n = wordIn.value.length; wc.textContent = n + " / 16"; werr.className = "ederr"; werr.textContent = n >= 16 ? "16 letters is the most, so it fits under your memory." : ""; }
wordIn.oninput = wcount;
document.querySelectorAll(".q2").forEach(function (b) { b.onclick = function () { wordIn.value = b.textContent; wcount(); wordIn.focus(); }; });
function save(word) {
  var btns = [$("wsave"), $("wskip"), $("eback")]; btns.forEach(function (b) { b.disabled = true; });
  var n = ed.len % 1 === 0 ? ed.len : ed.len.toFixed(1);
  werr.className = "ederr ok"; werr.innerHTML = '<span class="spin"></span>Cutting your ' + n + ' seconds and saving them to your wall…';
  var q = "date=" + wk[ed.target].iso + "&start=" + ed.start.toFixed(2) + "&len=" + ed.len.toFixed(2) + "&word=" + encodeURIComponent(word);
  var req = ed.src
    ? fetch(API + "/api/add?" + q + "&src=" + encodeURIComponent(ed.src), { method: "POST" })
    : fetch(API + "/api/add?" + q + "&name=" + encodeURIComponent(ed.name || "video.mov"), { method: "POST", headers: { "Content-Type": "application/octet-stream" }, body: ed.file });
  req.then(function (r) { return r.json(); }).then(function (res) {
    if (!res.ok) throw new Error(res.error || "It didn't save.");
    var j = ed.target;
    if (qs.get("add")) history.replaceState(null, "", location.pathname);
    return load().then(function () {
      closePick(); build(); draw();
      setTimeout(function () { var el = document.querySelector('.sq[data-j="' + j + '"]'); if (el) el.scrollIntoView({ block: "center" }); setTimeout(function () { openOne(j); }, 350); }, 60);
    });
  }).catch(function (err) {
    werr.className = "ederr"; werr.textContent = "It didn't save: " + (err && err.message ? err.message : "the memories server isn't answering.") + " Nothing was lost, try again.";
    btns.forEach(function (b) { b.disabled = false; });
  });
}
$("wsave").onclick = function () {
  var v = wordIn.value.trim().replace(/\s+/g, " ");
  if (!v) { werr.className = "ederr"; werr.textContent = "Type a word, or press Skip."; wordIn.focus(); return; }
  if (v.split(" ").length > 3) { werr.className = "ederr"; werr.textContent = "Three words max, like Best day ever."; wordIn.focus(); return; }
  save(v);
};
wordIn.addEventListener("keydown", function (e) { if (e.key === "Enter") $("wsave").click(); });
$("wskip").onclick = function () { save(""); };

$("cal").addEventListener("click", function (e) {
  var el = e.target.closest(".sq"); if (!el || el.dataset.j === undefined) return; var j = +el.dataset.j;
  if (wk[j].st === "f") openOne(j); else if (wk[j].st === "now" || wk[j].st === "e") openPick(j);
});
document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeOv(); closePick(); } if (view === "one") { if (e.key === "ArrowRight") stepMem(1); if (e.key === "ArrowLeft") stepMem(-1); } });
function setTheme(t) { document.body.classList.toggle("theme-green", t === "green"); $("t-green").className = t === "green" ? "on" : ""; $("t-ivory").className = t === "ivory" ? "on" : ""; try { localStorage.setItem("mm-look", t); } catch (e) {} }
$("t-green").onclick = function () { setTheme("green"); };
$("t-ivory").onclick = function () { setTheme("ivory"); };
try { if (localStorage.getItem("mm-look") === "green") setTheme("green"); } catch (e) {}

load().then(function () {
  build(); draw();
  var add = qs.get("add");
  if (add && /^inbox\/[^\/]+$/.test(add)) {
    var wkq = qs.get("week"), j = thisIndex();
    if (wkq) { for (var i = 0; i < wk.length; i++) if (wk[i].iso === wkq) j = i; }
    openPick(j); ed.src = add; ed.file = null; ed.name = add.slice(6);
    loadVideo(API + "/" + add.split("/").map(encodeURIComponent).join("/"));
  }
});
})();
