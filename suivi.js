/* Prépa X-ENS : module Suivi (focus, sommeil, sport, échecs, bilan) */
(function(){
"use strict";
if(window.__SUIVI__)return;window.__SUIVI__=true;

var KEY="xens-suivi-v1";
var MATS=[["maths","Maths","var(--c-maths)"],["pc","Physique-chimie","var(--c-phy)"],["si","SI","var(--c-psi)"],["info","Info","var(--c-info)"],["fr","Français","var(--c-fr)"],["en","Anglais","var(--c-lv)"],["autre","Autre","var(--c-ens)"]];
var MATI={};MATS.forEach(function(m){MATI[m[0]]=m;});
var SPORTS=["Musculation","Course","Natation","Plongée","Vélo","Autre"];
var PRESETS=[[25,5],[50,10],[90,15]];
var CAD={rapid:"Rapide",blitz:"Blitz",bullet:"Bullet"};

function dflt(){return {v:1,tab:"focus",focus:[],sleep:{},sport:[],chess:{site:"chesscom",user:"",cad:"rapid",goal:1500,hist:[],last:0,cur:null},notes:{},cfg:{preset:0,mat:"maths",sc:false,scName:"Prépa Focus",sleepGoal:7},T:null};}
var D=(function(){var d=dflt();try{var r=JSON.parse(localStorage.getItem(KEY)||"null");if(r&&r.v===1){for(var k in d)if(!(k in r))r[k]=d[k];for(var c in d.cfg)if(!(c in r.cfg))r.cfg[c]=d.cfg[c];for(var h in d.chess)if(!(h in r.chess))r.chess[h]=d.chess[h];return r;}}catch(e){}return d;})();
function save(){try{localStorage.setItem(KEY,JSON.stringify(D));}catch(e){}}

/* ---------- Dates ---------- */
function pad(n){return (n<10?"0":"")+n;}
function ymd(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());}
function today(){return ymd(new Date());}
function addDays(s,n){var p=s.split("-"),d=new Date(+p[0],+p[1]-1,+p[2]+n);return ymd(d);}
function monday(s){var p=s.split("-"),d=new Date(+p[0],+p[1]-1,+p[2]),w=(d.getDay()+6)%7;return addDays(s,-w);}
var FD=new Intl.DateTimeFormat("fr-FR",{weekday:"short",day:"numeric"});
var FDM=new Intl.DateTimeFormat("fr-FR",{day:"numeric",month:"short"});
function dObj(s){var p=s.split("-");return new Date(+p[0],+p[1]-1,+p[2]);}
function hm(min){min=Math.round(min);var h=Math.floor(min/60),m=min%60;return h?(h+" h"+(m?" "+pad(m):"")):(m+" min");}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}

/* ---------- Styles ---------- */
var css=`
#svfab{position:fixed;left:16px;bottom:calc(64px + env(safe-area-inset-bottom));z-index:25;height:44px;padding:0 15px 0 12px;border:0;border-radius:22px;background:var(--cell);color:var(--label);font:600 15px/1 -apple-system,system-ui,sans-serif;display:flex;align-items:center;gap:7px;box-shadow:0 6px 18px rgba(0,0,0,.18),0 0 0 .5px var(--sep);cursor:pointer;font-variant-numeric:tabular-nums}
#svfab svg{width:18px;height:18px;color:var(--ink)}
#svfab.run{background:var(--ink);color:var(--on-ink)}
#svfab.run svg{color:var(--on-ink)}
#svfab:active{transform:scale(.97)}
body.chatmode #svfab,body.focusmode #svfab,body.svopen #svfab{display:none}
html.svlock,html.svlock body{overflow:hidden}
#svov{position:fixed;inset:0;z-index:200;background:var(--bg);overflow-y:auto;-webkit-overflow-scrolling:touch;padding:env(safe-area-inset-top) 0 calc(28px + env(safe-area-inset-bottom));color:var(--label);font:17px/1.35 -apple-system,BlinkMacSystemFont,system-ui,sans-serif}
#svov[hidden]{display:none}
.sv-in{max-width:680px;margin:0 auto}
.sv-top{display:flex;align-items:center;justify-content:space-between;height:44px;padding:0 8px 0 16px}
.sv-top h1{font-size:30px;line-height:36px;font-weight:700;margin:12px 0 0}
.sv-x{border:0;background:var(--fill);color:var(--label2);width:32px;height:32px;border-radius:50%;font-size:19px;line-height:1;cursor:pointer;margin-top:12px}
.sv-tabs{display:flex;margin:22px 16px 20px;background:var(--fill);border-radius:9px;padding:2px}
.sv-tabs button{flex:1;border:0;background:none;font:500 13px/1 -apple-system,system-ui,sans-serif;min-height:32px;border-radius:7px;cursor:pointer;color:var(--label);padding:0 2px}
.sv-tabs button[aria-pressed="true"]{background:var(--seg-on);box-shadow:0 3px 8px rgba(0,0,0,.12);font-weight:600}
.sv-card{margin:0 16px 22px;background:var(--cell);border-radius:14px;overflow:hidden}
.sv-h{font-size:13px;line-height:18px;color:var(--label2);margin:0 32px 7px}
.sv-f{font-size:13px;line-height:18px;color:var(--label2);margin:-14px 32px 22px}
.sv-row{display:flex;align-items:center;gap:12px;min-height:48px;padding:0 16px;position:relative}
.sv-row+.sv-row::before{content:"";position:absolute;top:0;left:16px;right:0;height:.5px;background:var(--sep)}
.sv-row>span{flex:1;font-size:16px}
.sv-row>span small{display:block;font-size:13px;color:var(--label2)}
.sv-in input,.sv-in select,.sv-in textarea{font:inherit;font-size:16px;color:var(--label);background:var(--fill);border:0;border-radius:8px;padding:7px 10px;-webkit-appearance:none;appearance:none}
.sv-in textarea{width:100%;min-height:90px;resize:vertical;background:none;padding:12px 16px;border-radius:0}
.sv-in input[type=number]{width:84px;text-align:right}
.sv-btns{display:flex;gap:10px;margin:0 16px 22px}
.sv-b{flex:1;height:48px;border:0;border-radius:999px;background:var(--ink-soft);color:var(--ink);font:600 17px/1 -apple-system,system-ui,sans-serif;cursor:pointer}
.sv-b.solid{background:var(--ink);color:var(--on-ink)}
.sv-b.sm{height:36px;font-size:15px;flex:0 0 auto;padding:0 14px}
.sv-b:disabled{opacity:.45}
.sv-b:active{opacity:.6}
.sv-chips{display:flex;gap:8px;overflow-x:auto;padding:0 16px 16px;scrollbar-width:none}
.sv-chips::-webkit-scrollbar{display:none}
.sv-chip{flex-shrink:0;border:0;border-radius:999px;height:34px;padding:0 14px;background:var(--fill);color:var(--label);font:500 15px/1 -apple-system,system-ui,sans-serif;cursor:pointer;display:flex;align-items:center;gap:7px}
.sv-chip i{width:9px;height:9px;border-radius:50%;display:inline-block}
.sv-chip[aria-pressed="true"]{background:var(--label);color:var(--bg);font-weight:600}
.sv-timer{display:grid;place-items:center;margin:4px 16px 18px;position:relative}
.sv-timer svg{width:min(76vw,280px);height:auto;display:block}
.sv-tt{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.sv-tt b{font-size:58px;line-height:64px;font-weight:600;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.sv-tt span{font-size:15px;color:var(--label2)}
.sv-stats{display:flex;margin:0 16px 22px;gap:10px}
.sv-stats div{flex:1;background:var(--cell);border-radius:12px;padding:12px 14px;min-width:0}
.sv-stats b{display:block;font-size:24px;line-height:30px;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap}
.sv-stats span{font-size:13px;color:var(--label2)}
.sv-chart{display:block;width:100%;height:auto;padding:14px 8px 8px;box-sizing:border-box}
.sv-leg{display:flex;flex-wrap:wrap;gap:6px 14px;padding:0 16px 14px;font-size:12px;color:var(--label2)}
.sv-leg span{display:inline-flex;align-items:center;gap:5px}
.sv-leg i{width:8px;height:8px;border-radius:2px;display:inline-block}
.sv-empty{padding:26px 16px 10px;text-align:center;color:var(--label2);font-size:15px}
.sv-del{border:0;background:none;color:var(--label3);font-size:20px;cursor:pointer;padding:6px 8px;margin-right:-8px}
.sv-err{color:var(--marge);font-size:14px;margin:-12px 32px 20px}
.sv-q{display:flex;gap:6px}
.sv-q button{width:34px;height:34px;border-radius:50%;border:0;background:var(--fill);color:var(--label);font:600 15px/1 -apple-system,system-ui,sans-serif;cursor:pointer}
.sv-q button[aria-pressed="true"]{background:var(--ink);color:var(--on-ink)}
`;
var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

/* ---------- Structure ---------- */
var IC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 20V11M10 20V5M16 20v-6M22 20H2"/></svg>';
var fab=document.createElement("button");fab.id="svfab";fab.setAttribute("aria-label","Ouvrir le suivi");
var ov=document.createElement("div");ov.id="svov";ov.hidden=true;ov.setAttribute("role","dialog");ov.setAttribute("aria-label","Suivi");
document.body.appendChild(fab);document.body.appendChild(ov);
fab.addEventListener("click",function(){openOv();});
["click","input","change","keydown","submit"].forEach(function(t){ov.addEventListener(t,function(e){e.stopPropagation();});});

var OPEN=false;
function openOv(){OPEN=true;ov.hidden=false;document.documentElement.classList.add("svlock");document.body.classList.add("svopen");render();if(D.tab==="chess")chessAuto();}
function closeOv(){OPEN=false;ov.hidden=true;document.documentElement.classList.remove("svlock");document.body.classList.remove("svopen");paintFab();}

/* ---------- Graphiques ---------- */
function bars(opt){
  // opt: labels[], stacks: [[{v,c}]], goal, fmt
  var W=340,H=160,L=30,B=22,T=10,n=opt.labels.length,cw=(W-L-6)/n,bw=Math.max(4,cw*.62);
  var tot=opt.stacks.map(function(s){return s.reduce(function(a,x){return a+x.v;},0);});
  var mx=Math.max(opt.goal||0,Math.max.apply(null,tot.concat([0])));
  if(mx<=0)mx=1;var top=niceMax(mx),ih=H-B-T;
  var s='<svg class="sv-chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(opt.aria||"Graphique")+'">';
  [0,.5,1].forEach(function(f){var y=T+ih*(1-f);s+='<line x1="'+L+'" x2="'+W+'" y1="'+y+'" y2="'+y+'" style="stroke:var(--sep);stroke-width:.5"/><text x="'+(L-5)+'" y="'+(y+4)+'" text-anchor="end" style="fill:var(--label2);font-size:10px">'+esc(opt.fmt(top*f))+'</text>';});
  opt.stacks.forEach(function(stk,i){var x=L+cw*i+(cw-bw)/2,y0=T+ih;stk.forEach(function(p){if(p.v<=0)return;var h=ih*p.v/top;y0-=h;s+='<rect x="'+x.toFixed(1)+'" y="'+y0.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+Math.max(1,h).toFixed(1)+'" rx="2" style="fill:'+p.c+'"/>';});
    if(opt.labels[i])s+='<text x="'+(x+bw/2).toFixed(1)+'" y="'+(H-6)+'" text-anchor="middle" style="fill:var(--label2);font-size:10px">'+esc(opt.labels[i])+'</text>';});
  if(opt.goal){var gy=T+ih*(1-opt.goal/top);s+='<line x1="'+L+'" x2="'+W+'" y1="'+gy+'" y2="'+gy+'" style="stroke:var(--marge);stroke-width:1.2;stroke-dasharray:4 3"/>';}
  return s+'</svg>';
}
function niceMax(v){var e=Math.pow(10,Math.floor(Math.log10(v))),f=v/e;return (f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*e;}
function line(pts,goal){
  if(pts.length<2)return '<div class="sv-empty">La courbe apparaîtra après quelques parties.</div>';
  var W=340,H=170,L=38,B=22,T=12,ih=H-B-T,iw=W-L-10;
  var vs=pts.map(function(p){return p.v;}).concat(goal?[goal]:[]),lo=Math.min.apply(null,vs),hi=Math.max.apply(null,vs);
  lo=Math.floor((lo-20)/50)*50;hi=Math.ceil((hi+20)/50)*50;if(hi===lo)hi=lo+50;
  var t0=pts[0].t,t1=pts[pts.length-1].t,span=Math.max(1,t1-t0);
  function X(t){return L+iw*(t-t0)/span;}function Y(v){return T+ih*(1-(v-lo)/(hi-lo));}
  var s='<svg class="sv-chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Courbe du classement">';
  [lo,(lo+hi)/2,hi].forEach(function(v){var y=Y(v);s+='<line x1="'+L+'" x2="'+W+'" y1="'+y+'" y2="'+y+'" style="stroke:var(--sep);stroke-width:.5"/><text x="'+(L-5)+'" y="'+(y+4)+'" text-anchor="end" style="fill:var(--label2);font-size:10px">'+Math.round(v)+'</text>';});
  if(goal&&goal<=hi){var gy=Y(goal);s+='<line x1="'+L+'" x2="'+W+'" y1="'+gy+'" y2="'+gy+'" style="stroke:var(--marge);stroke-width:1.2;stroke-dasharray:4 3"/><text x="'+(W-2)+'" y="'+(gy-4)+'" text-anchor="end" style="fill:var(--marge);font-size:10px">objectif '+goal+'</text>';}
  var d=pts.map(function(p,i){return (i?"L":"M")+X(p.t).toFixed(1)+" "+Y(p.v).toFixed(1);}).join(" ");
  s+='<path d="'+d+'" fill="none" style="stroke:var(--ink);stroke-width:2;stroke-linejoin:round"/>';
  var lp=pts[pts.length-1];s+='<circle cx="'+X(lp.t).toFixed(1)+'" cy="'+Y(lp.v).toFixed(1)+'" r="3.5" style="fill:var(--ink)"/>';
  s+='<text x="'+L+'" y="'+(H-6)+'" style="fill:var(--label2);font-size:10px">'+esc(FDM.format(new Date(t0)))+'</text><text x="'+W+'" y="'+(H-6)+'" text-anchor="end" style="fill:var(--label2);font-size:10px">'+esc(FDM.format(new Date(t1)))+'</text>';
  return s+'</svg>';
}

/* ---------- Focus (Pomodoro) ---------- */
var AC=null;
function beep(){try{if(!AC)return;var t=AC.currentTime;[0,.35,.7].forEach(function(o){var g=AC.createGain(),os=AC.createOscillator();os.frequency.value=880;g.gain.setValueAtTime(.0001,t+o);g.gain.exponentialRampToValueAtTime(.25,t+o+.02);g.gain.exponentialRampToValueAtTime(.0001,t+o+.25);os.connect(g);g.connect(AC.destination);os.start(t+o);os.stop(t+o+.3);});}catch(e){}}
var WL=null;function wake(on){try{if(on&&navigator.wakeLock&&!WL)navigator.wakeLock.request("screen").then(function(w){WL=w;w.addEventListener("release",function(){WL=null;});}).catch(function(){});else if(!on&&WL){WL.release();WL=null;}}catch(e){}}
function tLeft(){var T=D.T;if(!T)return 0;if(T.paused!=null)return T.paused;return Math.max(0,T.dur-(Date.now()-T.start)/1000);}
function logFocus(min,mat,date){min=Math.round(min);if(min<1)return;D.focus.push({d:date||today(),m:mat,min:min});}
function catchUp(){
  var T=D.T,changed=false;
  while(T&&T.paused==null&&Date.now()>=T.start+T.dur*1000){
    var end=T.start+T.dur*1000;changed=true;
    if(T.mode==="work"){logFocus(T.dur/60,T.mat,ymd(new Date(end)));D.cycles=(D.cycles||0)+1;var p=PRESETS[T.p]||PRESETS[0];T={mode:"break",start:end,dur:p[1]*60,mat:T.mat,p:T.p,paused:null};}
    else{T=null;}
    D.T=T;
  }
  if(changed){save();if(Date.now()-lastTick<5000)beep();if(!D.T)wake(false);}
  return changed;
}
function startWork(){
  try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();else if(AC.state==="suspended")AC.resume();}catch(e){}
  var p=PRESETS[D.cfg.preset]||PRESETS[0];
  D.T={mode:"work",start:Date.now(),dur:p[0]*60,mat:D.cfg.mat,p:D.cfg.preset,paused:null};save();wake(true);render();
  if(D.cfg.sc&&D.cfg.scName){setTimeout(function(){location.href="shortcuts://run-shortcut?name="+encodeURIComponent(D.cfg.scName)+"&input=text&text="+p[0];},300);}
}
function pauseT(){var T=D.T;if(!T)return;if(T.paused==null){T.paused=tLeft();}else{T.start=Date.now()-(T.dur-T.paused)*1000;T.paused=null;}save();render();}
function stopT(){var T=D.T;if(!T)return;if(T.mode==="work"){var done=(T.dur-tLeft())/60;if(done>=5)logFocus(done,T.mat);}D.T=null;save();wake(false);render();}
function skipBreak(){D.T=null;save();wake(false);render();}
function ring(frac,col){var r=120,c=2*Math.PI*r;return '<svg viewBox="0 0 280 280" aria-hidden="true"><circle cx="140" cy="140" r="'+r+'" fill="none" style="stroke:var(--fill);stroke-width:14"/><circle id="svring" cx="140" cy="140" r="'+r+'" fill="none" transform="rotate(-90 140 140)" stroke-linecap="round" style="stroke:'+col+';stroke-width:14;stroke-dasharray:'+c.toFixed(1)+';stroke-dashoffset:'+(c*(1-frac)).toFixed(1)+';transition:stroke-dashoffset 1s linear"/></svg>';}
function mmss(s){s=Math.ceil(s);return pad(Math.floor(s/60))+":"+pad(s%60);}
function focusDays(n){var t=today(),out=[];for(var i=n-1;i>=0;i--)out.push(addDays(t,-i));return out;}
function vFocus(){
  var T=D.T,h="";
  var p=PRESETS[D.cfg.preset]||PRESETS[0];
  var dur=T?T.dur:p[0]*60,left=T?tLeft():dur,frac=T?left/dur:1;
  var col=T&&T.mode==="break"?"var(--c-info)":(MATI[T?T.mat:D.cfg.mat]||MATS[0])[2];
  var sub=!T?"Prêt":T.mode==="break"?"Pause":(T.paused!=null?"En pause, ":"")+(MATI[T.mat]||MATS[6])[1];
  if(!T){
    h+='<div class="sv-chips" role="group" aria-label="Matière">'+MATS.map(function(m){return '<button class="sv-chip" data-sv="mat" data-v="'+m[0]+'" aria-pressed="'+(D.cfg.mat===m[0])+'"><i style="background:'+m[2]+'"></i>'+m[1]+'</button>';}).join("")+'</div>';
    h+='<div class="sv-chips" role="group" aria-label="Durée">'+PRESETS.map(function(q,i){return '<button class="sv-chip" data-sv="preset" data-v="'+i+'" aria-pressed="'+(D.cfg.preset===i)+'">'+q[0]+' min, pause '+q[1]+'</button>';}).join("")+'</div>';
  }
  h+='<div class="sv-timer">'+ring(frac,col)+'<div class="sv-tt"><b id="svtime">'+mmss(left)+'</b><span id="svsub">'+esc(sub)+'</span></div></div>';
  if(!T)h+='<div class="sv-btns"><button class="sv-b solid" data-sv="start">Démarrer</button></div>';
  else if(T.mode==="work")h+='<div class="sv-btns"><button class="sv-b" data-sv="pause">'+(T.paused!=null?"Reprendre":"Pause")+'</button><button class="sv-b" data-sv="stop">Terminer</button></div>';
  else h+='<div class="sv-btns"><button class="sv-b" data-sv="skip">Passer la pause</button></div>';
  if(T&&T.mode==="work")h+='<p class="sv-f" style="margin-top:-12px">Si tu termines avant la fin, la séance compte à partir de 5 minutes.</p>';
  // stats
  var t=today(),wk=monday(t),todayMin=0,weekMin=0,byMat={};
  D.focus.forEach(function(f){if(f.d===t)todayMin+=f.min;if(f.d>=wk&&f.d<=t){weekMin+=f.min;byMat[f.m]=(byMat[f.m]||0)+f.min;}});
  h+='<div class="sv-stats"><div><b>'+hm(todayMin)+'</b><span>aujourd\'hui</span></div><div><b>'+hm(weekMin)+'</b><span>cette semaine</span></div></div>';
  var days=focusDays(14),map={};
  D.focus.forEach(function(f){if(!map[f.d])map[f.d]={};map[f.d][f.m]=(map[f.d][f.m]||0)+f.min;});
  var stacks=days.map(function(d){var o=map[d]||{};return MATS.map(function(m){return {v:(o[m[0]]||0)/60,c:m[2]};});});
  var any=D.focus.some(function(f){return f.d>=days[0];});
  h+='<h2 class="sv-h">Travail concentré, 14 derniers jours</h2><div class="sv-card">'+(any?bars({labels:days.map(function(d,i){return i%2?"":String(+d.slice(8));}),stacks:stacks,fmt:function(v){return v?(Math.round(v*10)/10)+" h":"0";},aria:"Heures de travail par jour"}):'<div class="sv-empty">Lance un premier chrono : tes heures s\'afficheront ici, par matière.</div>');
  var used=MATS.filter(function(m){return byMat[m[0]];});
  if(used.length)h+='<div class="sv-leg">'+used.map(function(m){return '<span><i style="background:'+m[2]+'"></i>'+m[1]+' '+hm(byMat[m[0]])+'</span>';}).join("")+'</div>';
  h+='</div><p class="sv-f">Sous le graphe : ton total de la semaine par matière.</p>';
  // saisie manuelle
  h+='<h2 class="sv-h">Ajouter une séance sans le chrono</h2><div class="sv-card"><div class="sv-row"><span>Matière</span><select data-svm="mat">'+MATS.map(function(m){return '<option value="'+m[0]+'"'+(m[0]===D.cfg.mat?" selected":"")+'>'+m[1]+'</option>';}).join("")+'</select></div><div class="sv-row"><span>Durée en minutes</span><input type="number" inputmode="numeric" min="1" max="600" data-svm="min" placeholder="45"></div><div class="sv-row"><span></span><button class="sv-b sm" data-sv="addfocus">Ajouter</button></div></div>';
  // concentration iOS
  h+='<h2 class="sv-h">Mode Concentration de l\'iPhone</h2><div class="sv-card"><div class="sv-row"><span>Lancer mon raccourci au démarrage<small>Active ton mode Concentration et un minuteur</small></span><input type="checkbox" data-svc="sc"'+(D.cfg.sc?" checked":"")+' style="width:22px;height:22px;-webkit-appearance:checkbox;appearance:auto"></div><div class="sv-row"><span>Nom du raccourci</span><input data-svc="scName" value="'+esc(D.cfg.scName)+'" style="width:150px"></div></div><p class="sv-f">Le raccourci reçoit la durée en minutes. Crée-le d\'abord dans l\'app Raccourcis.</p>';
  return h;
}

/* ---------- Sommeil ---------- */
function sleepDur(a,b){var pa=a.split(":"),pb=b.split(":"),m=(+pb[0]*60+ +pb[1])-(+pa[0]*60+ +pa[1]);if(m<=0)m+=1440;return m;}
function bedMin(a){var p=a.split(":"),m=+p[0]*60+ +p[1];return m<720?m+1440:m;}
var SQ=3;
function vSleep(){
  var t=today(),e=D.sleep[t],h="";
  var bed=e?e.bed:"22:00",wake=e?e.wake:"05:00";SQ=e?e.q:SQ;
  h+='<h2 class="sv-h">Nuit dernière</h2><div class="sv-card"><div class="sv-row"><span>Coucher</span><input type="time" data-svs="bed" value="'+bed+'"></div><div class="sv-row"><span>Lever</span><input type="time" data-svs="wake" value="'+wake+'"></div><div class="sv-row"><span>Qualité</span><div class="sv-q" role="group" aria-label="Qualité du sommeil">'+[1,2,3,4,5].map(function(q){return '<button data-sv="sq" data-v="'+q+'" aria-pressed="'+(SQ===q)+'">'+q+'</button>';}).join("")+'</div></div></div>';
  h+='<div class="sv-btns"><button class="sv-b solid" data-sv="savesleep">'+(e?"Mettre à jour":"Enregistrer")+'</button></div>';
  var days=focusDays(14),goal=D.cfg.sleepGoal,list=days.map(function(d){return D.sleep[d];});
  var last7=focusDays(7).map(function(d){return D.sleep[d];}).filter(Boolean);
  var avg=last7.length?last7.reduce(function(a,x){return a+sleepDur(x.bed,x.wake);},0)/last7.length:0;
  var reg="–";if(last7.length>=3){var bm=last7.map(function(x){return bedMin(x.bed);}),mu=bm.reduce(function(a,b){return a+b;},0)/bm.length;reg="± "+Math.round(Math.sqrt(bm.reduce(function(a,b){return a+(b-mu)*(b-mu);},0)/bm.length))+" min";}
  h+='<div class="sv-stats"><div><b>'+(avg?hm(avg):"–")+'</b><span>moyenne sur 7 jours</span></div><div><b>'+reg+'</b><span>écart de l\'heure de coucher</span></div></div>';
  var any=list.some(Boolean);
  h+='<h2 class="sv-h">Durée de sommeil, 14 dernières nuits</h2><div class="sv-card">'+(any?bars({labels:days.map(function(d,i){return i%2?"":String(+d.slice(8));}),stacks:list.map(function(x){return [{v:x?sleepDur(x.bed,x.wake)/60:0,c:x&&sleepDur(x.bed,x.wake)/60>=goal?"var(--c-info)":"var(--c-phy)"}];}),goal:goal,fmt:function(v){return Math.round(v)+" h";},aria:"Heures de sommeil par nuit"}):'<div class="sv-empty">Note ta nuit chaque matin : ta courbe se construit en une semaine.</div>')+'</div>';
  h+='<p class="sv-f">En vert, les nuits qui atteignent ton objectif (trait rouge). Un coucher régulier compte autant que la durée.</p>';
  h+='<h2 class="sv-h">Objectif</h2><div class="sv-card"><div class="sv-row"><span>Heures par nuit</span><input type="number" inputmode="decimal" step="0.5" min="5" max="10" data-svc="sleepGoal" value="'+goal+'"></div></div>';
  var rec=Object.keys(D.sleep).sort().reverse().slice(0,7);
  if(rec.length)h+='<h2 class="sv-h">Dernières nuits</h2><div class="sv-card">'+rec.map(function(d){var x=D.sleep[d];return '<div class="sv-row"><span>'+esc(cap(FD.format(dObj(d))))+'<small>'+x.bed+' à '+x.wake+', qualité '+x.q+'/5</small></span><b style="font-variant-numeric:tabular-nums">'+hm(sleepDur(x.bed,x.wake))+'</b><button class="sv-del" data-sv="delsleep" data-v="'+d+'" aria-label="Supprimer">×</button></div>';}).join("")+'</div>';
  return h;
}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1);}

/* ---------- Sport ---------- */
var SPT={type:"Musculation"};
function vSport(){
  var h="",t=today(),wk=monday(t);
  h+='<div class="sv-chips" role="group" aria-label="Activité">'+SPORTS.map(function(s){return '<button class="sv-chip" data-sv="stype" data-v="'+s+'" aria-pressed="'+(SPT.type===s)+'">'+s+'</button>';}).join("")+'</div>';
  h+='<div class="sv-card"><div class="sv-row"><span>Date</span><input type="date" data-svp="d" value="'+t+'"></div><div class="sv-row"><span>Durée en minutes</span><input type="number" inputmode="numeric" min="5" max="400" data-svp="min" placeholder="45"></div></div>';
  h+='<div class="sv-btns"><button class="sv-b solid" data-sv="addsport">Ajouter la séance</button></div>';
  var ws=D.sport.filter(function(s){return s.d>=wk&&s.d<=t;}),wmin=ws.reduce(function(a,s){return a+s.min;},0);
  h+='<div class="sv-stats"><div><b>'+ws.length+'</b><span>séance'+(ws.length>1?"s":"")+' cette semaine</span></div><div><b>'+hm(wmin)+'</b><span>de sport cette semaine</span></div></div>';
  var weeks=[];for(var i=7;i>=0;i--)weeks.push(addDays(wk,-7*i));
  var vals=weeks.map(function(w){var e=addDays(w,6);return D.sport.filter(function(s){return s.d>=w&&s.d<=e;}).reduce(function(a,s){return a+s.min;},0)/60;});
  var any=vals.some(function(v){return v>0;});
  h+='<h2 class="sv-h">Heures de sport par semaine</h2><div class="sv-card">'+(any?bars({labels:weeks.map(function(w){return FDM.format(dObj(w)).replace(".","");}).map(function(l,i){return i%2?"":l;}),stacks:vals.map(function(v){return [{v:v,c:"var(--c-psi)"}];}),fmt:function(v){return (Math.round(v*10)/10)+" h";},aria:"Heures de sport par semaine"}):'<div class="sv-empty">Ajoute ta première séance pour voir tes semaines.</div>')+'</div>';
  var rec=D.sport.slice().sort(function(a,b){return a.d<b.d?1:-1;}).slice(0,8);
  if(rec.length)h+='<h2 class="sv-h">Dernières séances</h2><div class="sv-card">'+rec.map(function(s){return '<div class="sv-row"><span>'+esc(s.type)+'<small>'+esc(cap(FD.format(dObj(s.d))))+'</small></span><b style="font-variant-numeric:tabular-nums">'+hm(s.min)+'</b><button class="sv-del" data-sv="delsport" data-v="'+esc(s.id)+'" aria-label="Supprimer">×</button></div>';}).join("")+'</div>';
  return h;
}

/* ---------- Échecs ---------- */
var CH={busy:false,err:""};
function chessAuto(){var c=D.chess;if(c.user&&Date.now()-c.last>3600000&&!CH.busy)chessFetch();}
function jget(u){return fetch(u,{headers:{"Accept":"application/json"}}).then(function(r){if(r.status===404)throw {code:404};if(!r.ok)throw {code:r.status};return r.json();});}
function chessFetch(){
  var c=D.chess,u=c.user.trim();if(!u||CH.busy)return;
  CH.busy=true;CH.err="";render();
  var p=c.site==="lichess"?fetchLichess(u,c.cad):fetchChesscom(u.toLowerCase(),c.cad);
  p.then(function(r){c.cur=r.cur;if(r.hist&&r.hist.length)c.hist=r.hist;else if(r.cur){var d=today();c.hist=(c.hist||[]).filter(function(x){return x.d!==d;});c.hist.push({d:d,t:Date.now(),v:r.cur});}c.last=Date.now();c.fetchedFor=c.site+"|"+u.toLowerCase()+"|"+c.cad;save();},
    function(e){CH.err=e&&e.code===404?"Pseudo introuvable sur ce site : vérifie l'orthographe.":e&&e.code===429?"Trop de demandes au site d'échecs : réessaie dans une minute.":"Impossible de joindre le site d'échecs. Vérifie ta connexion.";})
   .then(function(){CH.busy=false;if(OPEN&&D.tab==="chess")render();});
}
function fetchLichess(u,cad){
  var nm={rapid:"Rapid",blitz:"Blitz",bullet:"Bullet"}[cad];
  return jget("https://lichess.org/api/user/"+encodeURIComponent(u)+"/rating-history").then(function(a){
    var g=(a||[]).filter(function(x){return x.name===nm;})[0],pts=g?g.points:[];
    var hist=pts.map(function(p){var d=new Date(p[0],p[1],p[2]);return {d:ymd(d),t:d.getTime(),v:p[3]};});
    var cut=Date.now()-365*864e5;hist=hist.filter(function(x){return x.t>=cut;});
    return {cur:hist.length?hist[hist.length-1].v:null,hist:hist};
  });
}
function fetchChesscom(u,cad){
  var base="https://api.chess.com/pub/player/"+encodeURIComponent(u);
  return jget(base+"/stats").then(function(s){
    var k=s&&s["chess_"+cad],cur=k&&k.last?k.last.rating:null;
    return jget(base+"/games/archives").then(function(a){
      var arc=(a&&a.archives||[]).slice(-4);
      return arc.reduce(function(pr,url){return pr.then(function(acc){return jget(url).then(function(m){return acc.concat(m.games||[]);},function(){return acc;});});},Promise.resolve([])).then(function(games){
        var byDay={};
        games.forEach(function(g){if(g.time_class!==cad||!g.end_time)return;var me=(g.white&&String(g.white.username).toLowerCase()===u)?g.white:(g.black&&String(g.black.username).toLowerCase()===u)?g.black:null;if(!me||!me.rating)return;var dt=new Date(g.end_time*1000),d=ymd(dt);if(!byDay[d]||byDay[d].t<dt.getTime())byDay[d]={d:d,t:dt.getTime(),v:me.rating};});
        var hist=Object.keys(byDay).sort().map(function(d){return byDay[d];});
        return {cur:cur!=null?cur:(hist.length?hist[hist.length-1].v:null),hist:hist};
      });
    },function(){return {cur:cur,hist:[]};});
  });
}
function vChess(){
  var c=D.chess,h="";
  h+='<div class="sv-card"><div class="sv-row"><span>Site</span><select data-svh="site"><option value="chesscom"'+(c.site==="chesscom"?" selected":"")+'>Chess.com</option><option value="lichess"'+(c.site==="lichess"?" selected":"")+'>Lichess</option></select></div><div class="sv-row"><span>Pseudo</span><input data-svh="user" value="'+esc(c.user)+'" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="ton pseudo" style="width:160px"></div><div class="sv-row"><span>Cadence</span><select data-svh="cad">'+Object.keys(CAD).map(function(k){return '<option value="'+k+'"'+(c.cad===k?" selected":"")+'>'+CAD[k]+'</option>';}).join("")+'</select></div><div class="sv-row"><span>Objectif</span><input type="number" inputmode="numeric" data-svh="goal" value="'+c.goal+'"></div></div>';
  h+='<div class="sv-btns"><button class="sv-b solid" data-sv="chessgo"'+(CH.busy||!c.user?" disabled":"")+'>'+(CH.busy?"Chargement…":"Actualiser mon classement")+'</button></div>';
  if(CH.err)h+='<p class="sv-err">'+esc(CH.err)+'</p>';
  if(!c.user)return h+'<p class="sv-f" style="margin-top:0">Entre ton pseudo : l\'app récupère ton classement et ses progrès toute seule.</p>';
  var pts=(c.hist||[]).map(function(x){return {t:x.t,v:x.v};});
  var cur=c.cur,m30=null;
  if(pts.length){var cut=Date.now()-30*864e5,old=pts.filter(function(p){return p.t<=cut;}).pop()||pts[0];if(cur!=null)m30=cur-old.v;}
  h+='<div class="sv-stats"><div><b>'+(cur!=null?cur:"–")+'</b><span>'+CAD[c.cad].toLowerCase()+' actuel</span></div><div><b>'+(m30==null?"–":(m30>0?"+":"")+m30)+'</b><span>sur 30 jours</span></div><div><b>'+(cur!=null?Math.max(0,c.goal-cur):"–")+'</b><span>avant '+c.goal+'</span></div></div>';
  h+='<h2 class="sv-h">Progression</h2><div class="sv-card">'+line(pts,c.goal)+'</div>';
  if(c.last)h+='<p class="sv-f">Mis à jour '+esc(new Intl.DateTimeFormat("fr-FR",{weekday:"long",hour:"2-digit",minute:"2-digit"}).format(new Date(c.last)))+'.</p>';
  return h;
}

/* ---------- Bilan de la semaine ---------- */
function weekStats(w){
  var e=addDays(w,6),f=0,byMat={},sl=[],sp=0,spm=0;
  D.focus.forEach(function(x){if(x.d>=w&&x.d<=e){f+=x.min;byMat[x.m]=(byMat[x.m]||0)+x.min;}});
  Object.keys(D.sleep).forEach(function(d){if(d>=w&&d<=e){var x=D.sleep[d];sl.push(sleepDur(x.bed,x.wake));}});
  D.sport.forEach(function(x){if(x.d>=w&&x.d<=e){sp++;spm+=x.min;}});
  return {f:f,byMat:byMat,sl:sl.length?sl.reduce(function(a,b){return a+b;},0)/sl.length:0,nsl:sl.length,sp:sp,spm:spm};
}
function vBilan(){
  var t=today(),w=monday(t),pw=addDays(w,-7),a=weekStats(w),b=weekStats(pw),h="";
  function diff(x,y,f){if(!y)return "";var d=x-y;return ' <span style="font-size:13px;font-weight:500;color:var(--label2)">('+(d>=0?"+":"−")+f(Math.abs(d))+')</span>';}
  h+='<h2 class="sv-h">Semaine du '+esc(FDM.format(dObj(w)))+', comparée à la précédente</h2><div class="sv-card">';
  h+='<div class="sv-row"><span>Travail concentré</span><b>'+hm(a.f)+diff(a.f,b.f,hm)+'</b></div>';
  h+='<div class="sv-row"><span>Sommeil moyen<small>'+a.nsl+' nuit'+(a.nsl>1?"s":"")+' notée'+(a.nsl>1?"s":"")+'</small></span><b>'+(a.sl?hm(a.sl):"–")+(a.sl&&b.sl?diff(a.sl,b.sl,hm):"")+'</b></div>';
  h+='<div class="sv-row"><span>Sport</span><b>'+a.sp+' séance'+(a.sp>1?"s":"")+'</b></div>';
  var c=D.chess;if(c.cur!=null){var old=(c.hist||[]).filter(function(x){return x.d<w;}).pop();h+='<div class="sv-row"><span>Échecs, '+CAD[c.cad].toLowerCase()+'</span><b>'+c.cur+(old?' <span style="font-size:13px;font-weight:500;color:var(--label2)">('+(c.cur-old.v>=0?"+":"−")+Math.abs(c.cur-old.v)+')</span>':"")+'</b></div>';}
  h+='</div>';
  var used=MATS.filter(function(m){return a.byMat[m[0]];});
  if(used.length)h+='<h2 class="sv-h">Répartition du travail cette semaine</h2><div class="sv-card">'+used.map(function(m){var pc=Math.round(100*a.byMat[m[0]]/a.f);return '<div class="sv-row"><span><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:'+m[2]+';margin-right:8px"></i>'+m[1]+'</span><b style="font-variant-numeric:tabular-nums">'+hm(a.byMat[m[0]])+' <span style="font-size:13px;font-weight:500;color:var(--label2)">'+pc+' %</span></b></div>';}).join("")+'</div>';
  h+='<h2 class="sv-h">Ce que je change la semaine prochaine</h2><div class="sv-card"><textarea data-svn="'+w+'" placeholder="Une ou deux décisions concrètes, par exemple : couché à 22 h même la veille des DS.">'+esc(D.notes[w]||"")+'</textarea></div><p class="sv-f">Enregistré automatiquement. Quinze minutes le dimanche suffisent.</p>';
  h+='<h2 class="sv-h">Sauvegarde du suivi</h2><div class="sv-card"><div class="sv-row"><span>Copie tout ton suivi pour le garder dans Notes</span><button class="sv-b sm" data-sv="export">Copier</button></div><div class="sv-row"><span>Restaurer une sauvegarde</span><button class="sv-b sm" data-sv="import">Coller</button></div></div>';
  if(EXP.msg)h+='<p class="sv-f" style="margin-top:-14px">'+esc(EXP.msg)+'</p>';
  return h;
}
var EXP={msg:""};

/* ---------- Rendu ---------- */
var TABS=[["focus","Focus"],["sleep","Sommeil"],["sport","Sport"],["chess","Échecs"],["bilan","Bilan"]];
var RENDERING=false;
function render(){
  if(!OPEN)return;
  if(RENDERING){setTimeout(render,0);return;}
  RENDERING=true;try{renderNow();}finally{RENDERING=false;}
}
function renderNow(){
  catchUp();
  var y=ov.scrollTop;
  var body=D.tab==="sleep"?vSleep():D.tab==="sport"?vSport():D.tab==="chess"?vChess():D.tab==="bilan"?vBilan():vFocus();
  ov.innerHTML='<div class="sv-in"><div class="sv-top"><h1>Suivi</h1><button class="sv-x" data-sv="close" aria-label="Fermer">×</button></div><div class="sv-tabs" role="group" aria-label="Rubriques">'+TABS.map(function(t){return '<button data-sv="tab" data-v="'+t[0]+'" aria-pressed="'+(D.tab===t[0])+'">'+t[1]+'</button>';}).join("")+'</div>'+body+'</div>';
  ov.scrollTop=y;
}
function paintFab(){
  var T=D.T;
  if(T){fab.className="run";fab.innerHTML=IC+'<span>'+(T.mode==="break"?"Pause ":"")+mmss(tLeft())+(T.paused!=null?" ⏸":"")+'</span>';}
  else{fab.className="";fab.innerHTML=IC+'<span>Suivi</span>';}
}
var lastTick=Date.now();
function tick(){
  var ch=catchUp();lastTick=Date.now();
  if(OPEN&&D.tab==="focus"){
    if(ch){render();}
    else if(D.T){var el=document.getElementById("svtime"),r=document.getElementById("svring");if(el)el.textContent=mmss(tLeft());if(r){var c=2*Math.PI*120;r.style.strokeDashoffset=(c*(1-tLeft()/D.T.dur)).toFixed(1);}}
  }
  paintFab();
}
setInterval(tick,1000);
document.addEventListener("visibilitychange",function(){if(!document.hidden){lastTick=0;tick();lastTick=Date.now();if(D.T&&D.T.paused==null)wake(true);}});

/* ---------- Événements ---------- */
ov.addEventListener("click",function(e){
  var b=e.target.closest("[data-sv]");if(!b)return;
  var a=b.getAttribute("data-sv"),v=b.getAttribute("data-v");
  if(a==="close")return closeOv();
  if(a==="tab"){D.tab=v;save();EXP.msg="";ov.scrollTop=0;render();if(v==="chess")chessAuto();return;}
  if(a==="mat"){D.cfg.mat=v;save();render();return;}
  if(a==="preset"){D.cfg.preset=+v;save();render();return;}
  if(a==="start")return startWork();
  if(a==="pause")return pauseT();
  if(a==="stop")return stopT();
  if(a==="skip")return skipBreak();
  if(a==="addfocus"){var mi=+(ov.querySelector('[data-svm="min"]').value||0),mt=ov.querySelector('[data-svm="mat"]').value;if(mi>0&&mi<=600){logFocus(mi,mt);save();render();}return;}
  if(a==="sq"){SQ=+v;ov.querySelectorAll('[data-sv="sq"]').forEach(function(x){x.setAttribute("aria-pressed",String(x.getAttribute("data-v")===v));});return;}
  if(a==="savesleep"){var bd=ov.querySelector('[data-svs="bed"]').value,wk=ov.querySelector('[data-svs="wake"]').value;if(bd&&wk){D.sleep[today()]={bed:bd,wake:wk,q:SQ};save();render();}return;}
  if(a==="delsleep"){delete D.sleep[v];save();render();return;}
  if(a==="stype"){SPT.type=v;render();return;}
  if(a==="addsport"){var sd=ov.querySelector('[data-svp="d"]').value||today(),sm=+(ov.querySelector('[data-svp="min"]').value||0);if(sm>0){D.sport.push({id:String(Date.now()),d:sd,type:SPT.type,min:sm});save();render();}return;}
  if(a==="delsport"){D.sport=D.sport.filter(function(s){return s.id!==v;});save();render();return;}
  if(a==="chessgo"){D.chess.last=0;return chessFetch();}
  if(a==="export"){var txt=JSON.stringify({app:"prepa-suivi",data:D});(navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(txt):Promise.reject()).then(function(){EXP.msg="Copié. Colle-le dans une note pour le garder.";},function(){EXP.msg="Copie impossible ici.";}).then(render);return;}
  if(a==="import"){(navigator.clipboard&&navigator.clipboard.readText?navigator.clipboard.readText():Promise.reject()).then(function(t){var o=JSON.parse(t);if(!o||o.app!=="prepa-suivi"||!o.data||o.data.v!==1)throw 0;var keep=D.T;D=o.data;D.T=keep;save();EXP.msg="Sauvegarde restaurée.";},function(){EXP.msg="Copie d'abord une sauvegarde du suivi, puis touche Coller.";}).catch(function(){EXP.msg="Ce texte n'est pas une sauvegarde du suivi.";}).then(render);return;}
});
ov.addEventListener("change",function(e){
  var t=e.target,d=t.dataset;
  if(d.svc){if(d.svc==="sc")D.cfg.sc=t.checked;else if(d.svc==="sleepGoal"){var g=parseFloat(String(t.value).replace(",","."));if(g>=4&&g<=11)D.cfg.sleepGoal=g;}else D.cfg[d.svc]=t.value;save();if(d.svc==="sleepGoal")setTimeout(render,0);return;}
  if(d.svh){var c=D.chess;if(d.svh==="goal"){var n=parseInt(t.value,10);if(n>100&&n<4000)c.goal=n;}else{c[d.svh]=t.value.trim();}var key=c.site+"|"+c.user.toLowerCase()+"|"+c.cad;if(d.svh!=="goal"&&c.fetchedFor!==key){c.hist=[];c.cur=null;c.last=0;}save();setTimeout(function(){render();if(d.svh!=="goal"&&c.user)chessFetch();},0);return;}
});
ov.addEventListener("input",function(e){var t=e.target;if(t.dataset.svn){var w=t.dataset.svn;if(t.value.trim())D.notes[w]=t.value;else delete D.notes[w];save();}});

catchUp();paintFab();
})();
