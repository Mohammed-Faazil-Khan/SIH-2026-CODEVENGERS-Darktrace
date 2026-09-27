/* ================= sound engine ================= */
let audioCtx, muted=false;
function toggleMute(){ muted=!muted; document.getElementById("mute").textContent = muted?"🔇":"🔊"; }
function tone(freq,dur,type,vol){ if(muted) return; try{
  audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)();
  const o=audioCtx.createOscillator(), g=audioCtx.createGain();
  o.type=type; o.frequency.value=freq; g.gain.value=vol; o.connect(g); g.connect(audioCtx.destination);
  o.start(); g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime+dur); o.stop(audioCtx.currentTime+dur+0.02);
}catch(e){} }
function hoverSound(){ tone(1200,0.035,'sine',0.025); }
function clickSound(){ tone(320,0.09,'square',0.035); }
function alertSound(){ tone(180,0.15,'sawtooth',0.03); }

/* ================= theme ================= */
function applyTheme(t){ document.documentElement.setAttribute("data-theme",t); document.getElementById("themeBtn").textContent = t==="light"?"☀️":"🌙"; }
function toggleTheme(){ clickSound(); const cur=document.documentElement.getAttribute("data-theme")==="light"?"dark":"light"; applyTheme(cur);
  try{ localStorage.setItem("darktrace-theme",cur); }catch(e){} }
(function(){ let saved="dark"; try{ saved=localStorage.getItem("darktrace-theme")||"dark"; }catch(e){} applyTheme(saved); })();

/* ================= cursor glow + starfield ================= */
const glow=document.getElementById("glow");
let gx=innerWidth/2,gy=innerHeight/2,tx=gx,ty=gy;
addEventListener("mousemove",e=>{tx=e.clientX;ty=e.clientY;});
(function loop(){gx+=(tx-gx)*.12;gy+=(ty-gy)*.12;glow.style.transform=`translate(${gx}px,${gy}px) translate(-50%,-50%)`;requestAnimationFrame(loop);})();

/* ================= floating interactive avatar ================= */
(function(){
  const pupilL=document.getElementById("faPupilL"), pupilR=document.getElementById("faPupilR");
  function trackEyes(){
    const el=document.getElementById("floatAvatar"); if(!el){requestAnimationFrame(trackEyes);return;}
    const r=el.getBoundingClientRect(); const cx=r.left+26, cy=r.top+30;
    const ang=Math.atan2(ty-cy, tx-cx); const dist=Math.min(2.6, Math.hypot(tx-cx,ty-cy)/40);
    const dx=Math.cos(ang)*dist, dy=Math.sin(ang)*dist;
    if(pupilL){ pupilL.setAttribute("cx",24+dx); pupilL.setAttribute("cy",30+dy); }
    if(pupilR){ pupilR.setAttribute("cx",40+dx); pupilR.setAttribute("cy",30+dy); }
    requestAnimationFrame(trackEyes);
  }
  requestAnimationFrame(trackEyes);
  function blink(){
    ["faLidL","faLidR"].forEach(id=>{ const el=document.getElementById(id); if(!el) return;
      el.style.transition="height .08s"; el.setAttribute("height","9");
      setTimeout(()=>el.setAttribute("height","0"),140);
    });
    setTimeout(blink, 2600+Math.random()*3200);
  }
  setTimeout(blink,1800);
})();
const FA_TIPS=[
  "Tip: hover a graph node to trace its connections.",
  "Tip: the AI Prediction tab mirrors the real backend classifier.",
  "Tip: try comparing two random names in Compare — every pair is deterministic.",
  "Tip: drag any node in the graph to rearrange it.",
  "Fun fact: this dataset has 30 procedurally generated actors.",
  "Tip: toggle light mode with the sun icon up top.",
  "Tip: the Pipelines tab runs real Levenshtein & Jaccard math, live.",
  "Psst — nothing here is real. It's all synthetic demo data.",
];
function pokeFloatAvatar(){
  clickSound();
  const el=document.getElementById("floatAvatar");
  el.classList.remove("poke"); void el.offsetWidth; el.classList.add("poke");
  const mouth=document.getElementById("faMouth");
  if(mouth) mouth.setAttribute("d","M22,45 Q32,36 42,45");
  setTimeout(()=>{ if(mouth) mouth.setAttribute("d","M22,42 Q32,48 42,42"); },900);
  toggleChat();
}
let faOpen=false, faGreeted=false;
function toggleChat(force){
  faOpen = typeof force==="boolean" ? force : !faOpen;
  document.getElementById("faChat").classList.toggle("open", faOpen);
  if(faOpen && !faGreeted){
    faGreeted=true;
    addFaMessage("bot","Hey — I'm the DARKTRACE assistant. Ask me about actors, the graph, risk scores, or how any tab works.");
  }
  if(faOpen) setTimeout(()=>document.getElementById("faInput").focus(),150);
}
function addFaMessage(role,text){
  const wrap=document.getElementById("faMessages");
  const div=document.createElement("div"); div.className="fa-msg "+role; div.textContent=text;
  wrap.appendChild(div); wrap.scrollTop=wrap.scrollHeight;
}
function sendFaMessage(){
  const input=document.getElementById("faInput"); const text=input.value.trim();
  if(!text) return;
  clickSound();
  addFaMessage("user",text); input.value="";
  setTimeout(()=>{ addFaMessage("bot", botReply(text)); tone(650,0.04,'sine',0.02); }, 380+Math.random()*250);
}
function botReply(msg){
  const t=msg.toLowerCase();
  const rand=arr=>arr[Math.floor(Math.random()*arr.length)];
  if(/hi|hello|hey|yo\b/.test(t)) return rand(["Hey there! What do you want to know?","Hi! Ask me about actors, graph, or risk scoring."]);
  if(/thank/.test(t)) return "Anytime. Poke me again if you need anything else.";
  if(/who are you|what are you/.test(t)) return "I'm a small client-side helper baked into this demo — no real backend behind me, just pattern matching.";
  if(/actor/.test(t)) return `There are ${ACTORS.length} tracked actors right now. Check the Actors tab, or search a handle up top — try "${ACTORS[Math.floor(seeded(msg,1)*ACTORS.length)].handles[0]}".`;
  if(/graph|network|map/.test(t)) return "The Map tab shows a live force-directed graph — scroll to zoom, drag the background to pan, and drag any node to reposition it. Crowned nodes are the most connected.";
  if(/risk|score/.test(t)) return "Risk scores come from the classifier — try the AI Prediction tab and paste any text to see it scored live.";
  if(/compare|correlat/.test(t)) return "The Compare tab scores two handles against each other — pick any two actors, or type a custom name for an unresolved one.";
  if(/pipeline|levenshtein|jaccard|entity resolution|stylomet/.test(t)) return "The Pipelines tab runs three real algorithms live in your browser: stylometric similarity, infrastructure fuzzy-matching, and cross-marketplace entity resolution.";
  if(/trend|chart/.test(t)) return "Trends tab has a 14-day risk/flagged-count chart — pick a specific actor or view the aggregate, and toggle each line on or off.";
  if(/theme|dark|light|mode/.test(t)) return "There's a 🌙/☀️ toggle up top in the header — your choice is remembered next time you visit.";
  if(/sound|mute|music/.test(t)) return "Hit the 🔊 icon in the header if the clicks and tones aren't your thing.";
  if(/help|how|what can/.test(t)) return "I can point you toward: Actors, Map, Trends, Pipelines, AI Prediction, or Compare. What are you trying to do?";
  if(/bye|exit|close/.test(t)){ setTimeout(()=>toggleChat(false),900); return "See you around."; }
  return rand([
    "Not sure about that one — try asking about actors, the graph, risk scores, or the pipelines.",
    "I'm a simple demo bot, so I mostly know about this dashboard. Try asking about a specific tab.",
    "Hmm, rephrase that? I know actors, graph, trends, pipelines, compare, and theme/sound settings.",
  ]);
}

const sc=document.getElementById("starfield"), sctx=sc.getContext("2d");
function sizeCanvas(){ sc.width=sc.offsetWidth; sc.height=sc.offsetHeight; }
sizeCanvas(); addEventListener("resize",sizeCanvas);
const STARS=Array.from({length:140},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.4+.2,s:Math.random()*.4+.1}));
function drawStars(t){
  sctx.clearRect(0,0,sc.width,sc.height);
  sctx.fillStyle="#5B9FEE";
  STARS.forEach(s=>{
    const y=(s.y+t*.00002*s.s)%1;
    sctx.globalAlpha=.3+.5*Math.sin(t*.001*s.s+s.x*10);
    sctx.beginPath(); sctx.arc(s.x*sc.width, y*sc.height, s.r, 0, 7); sctx.fill();
  });
  sctx.globalAlpha=1;
  requestAnimationFrame(drawStars);
}
requestAnimationFrame(drawStars);

/* ================= scroll reveal ================= */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}}),{threshold:.12});
function observeReveals(){ document.querySelectorAll(".reveal:not(.in)").forEach(el=>io.observe(el)); }

/* ================= deterministic generator ================= */
function hash(str){ let h=2166136261; for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);} return h>>>0; }
function seeded(str,n){ return (hash(str+"|"+n)%1000)/1000; }
const CATS=["credential-trading","malware-dev","fraud-operations","forum-moderator","infra-reseller","marketplace-vendor","botnet-operator","access-broker"];
const PLATS=["Forum-A","Forum-C","Marketplace-B","Onion-Relay-7","Exchange-D","Board-Nexus"];
const NAMES=["AlphaX","Redwire","NightOwl77","Cobalt_K","GhostProtocol","ZeroCipher","VantaBlack","EchoBreach","SilentVector","CrimsonNode","ObsidianKey","PhantomLedger","NullRouter","ShadowMint","ByteReaper","IronVeil","QuantumHusk","DarkPixel","VoidWalker","CipherWolf","BlackIce_9","RogueSignal","ThornSpire","GlitchFang","HexEater","MidnightProxy","WraithCoin","StaticGhost","NeonAshes","KryptShift"];

function makeActor(name,i){
  const h=hash(name);
  const confidence=25+Math.floor(seeded(name,1)*70);
  const cats=[CATS[h%CATS.length],CATS[(h>>>3)%CATS.length]].filter((v,i,a)=>a.indexOf(v)===i);
  const wallets=seeded(name,4)>0.45?Array.from({length:1+Math.floor(seeded(name,5)*2)},(_,k)=>`WALLET-${(h%900+k*7).toString().padStart(3,'0')}`):[];
  const pgp=seeded(name,6)>0.5?[`PGP-${(h%9999).toString(16).toUpperCase()}`]:[];
  const secondHandle=seeded(name,7)>0.6?name+String.fromCharCode(50+(h%3)):null;
  return {
    id:"ACTOR-"+String(1000+(h%9000)),
    handles:[name,...(secondHandle?[secondHandle]:[])],
    confidence, status: seeded(name,3)>0.78?"dormant":"active",
    categories:cats, platforms:[PLATS[h%PLATS.length]], wallets, pgp
  };
}
const ACTORS = NAMES.map(makeActor);

function makeFlagged(a,i){
  const h=hash(a.id+"flag");
  const cats=["leaked_credentials","malware","fraud","weapons","threat_chatter","benign"];
  const cat=cats[h%cats.length];
  const titles={leaked_credentials:"Fresh credential dump referencing "+a.handles[0],malware:"Custom malware builder linked to "+a.handles[0],
    fraud:"Wire-fraud script attributed to "+a.handles[0],weapons:"Illicit-goods listing tied to "+a.handles[0],
    threat_chatter:"Escalating chatter involving "+a.handles[0],benign:"Routine forum activity from "+a.handles[0]};
  return {title:titles[cat], source:a.platforms[0], category:cat, riskScore: cat==="benign"?8+Math.floor(seeded(a.id,9)*20):40+Math.floor(seeded(a.id,9)*58),
    status:["open","reviewed","dismissed"][h%3], actor:a.id};
}
const FLAGGED = ACTORS.map(makeFlagged);
const ALERTS = ACTORS.filter(a=>a.confidence>55).slice(0,8).map(a=>({
  severity: a.confidence>78?"high":a.confidence>60?"medium":"low",
  title: (a.confidence>78?"Critical attribution update — ":"Activity spike — ")+a.handles[0],
  actor:a.id, confidence:a.confidence
}));

const sevBadge=s=>({high:"b-red",medium:"b-amber",low:"b-blue"}[s]||"b-blue");
const riskBadge=r=>r>=75?"b-red":r>=45?"b-amber":"b-teal";
const statusBadge=s=>({open:"b-amber",reviewed:"b-blue",dismissed:"b-teal"}[s]||"b-blue");

/* ================= pages ================= */
function graphMiniMarkup(){
  if(!GRAPH_CACHE){ GRAPH_CACHE=buildGraphData(); forceLayout(GRAPH_CACHE.nodes,GRAPH_CACHE.edges,900,520,150); }
  const {nodes,edges}=GRAPH_CACHE;
  const hubIds=nodes.filter(n=>n.hub).map(n=>n.id);
  const keepSet=new Set(hubIds);
  edges.forEach(e=>{ if(hubIds.includes(e.a)) keepSet.add(e.b); if(hubIds.includes(e.b)) keepSet.add(e.a); });
  let keep=nodes.filter(n=>keepSet.has(n.id));
  if(keep.length>24) keep=keep.slice(0,24);
  const keepIds=new Set(keep.map(n=>n.id));
  const kEdges=edges.filter(e=>keepIds.has(e.a)&&keepIds.has(e.b));
  const xs=keep.map(n=>n.x), ys=keep.map(n=>n.y);
  const minX=Math.min(...xs)-44, maxX=Math.max(...xs)+44, minY=Math.min(...ys)-44, maxY=Math.max(...ys)+44;
  const edgeSvg=kEdges.map(e=>{ const A=nodes.find(n=>n.id===e.a), B=nodes.find(n=>n.id===e.b); const st=edgeStyle(e);
    return `<path class="gedge" data-a="${e.a}" data-b="${e.b}" data-kind="${e.kind}" data-curve="${e.curve.toFixed(3)}" d="${edgePathD(A,B,e.curve)}" fill="none" stroke="${st.color}" stroke-width="1.6" opacity=".8" ${st.dash?`stroke-dasharray="${st.dash}"`:''} ${st.arrow?'marker-end="url(#gArrowMini)"':''}/>`; }).join("");
  const nodeSvg=keep.map(n=>`<g class="gnode${n.hub?' hub':''}" data-id="${n.id}" data-type="${n.type}" onmouseenter="hoverNode('${n.id}')" onmouseleave="hoverNode(null)" onclick="event.stopPropagation();clickSound();showProfile('${n.id}')" style="cursor:pointer">
    <title>${n.displayName||n.label}</title>${nodeGroupInner(n,false)}</g>`).join("");
  return `<svg viewBox="${minX.toFixed(1)} ${minY.toFixed(1)} ${(maxX-minX).toFixed(1)} ${(maxY-minY).toFixed(1)}" style="width:100%;height:210px;display:block">
    <defs><marker id="gArrowMini" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto-start-reverse"><path d="M0,0 L8,4 L0,8 Z" fill="context-stroke"/></marker></defs>
    ${edgeSvg}${nodeSvg}</svg>`;
}
function overviewPage(){ return `
  <div class="tag reveal">COMMAND CENTER</div><h1 class="reveal">Investigation overview</h1>
  <p class="desc reveal">${ACTORS.length} tracked actors &middot; ${FLAGGED.length} flagged items &middot; ${ALERTS.length} active alerts.</p>
  <div class="grid stats">${[["actors",ACTORS.length],["flagged",FLAGGED.length],["highRisk",FLAGGED.filter(f=>f.riskScore>=75).length],["alerts",ALERTS.length],["wallets",ACTORS.reduce((s,a)=>s+a.wallets.length,0)],["pgpKeys",ACTORS.reduce((s,a)=>s+a.pgp.length,0)]]
    .map(([k,v],i)=>`<div class="stat reveal" style="transition-delay:${i*40}ms"><div class="n" data-count="${v}">0</div><div class="l">${k.replace(/([A-Z])/g,' $1').toUpperCase()}</div></div>`).join("")}</div>
  <div class="panel reveal"><h2>Priority alerts</h2><table><thead><tr><th>Severity</th><th>Alert</th><th>Actor</th><th>Confidence</th></tr></thead><tbody>
    ${ALERTS.map(a=>`<tr onmouseenter="hoverSound()"><td><span class="badge ${sevBadge(a.severity)}">${a.severity.toUpperCase()}</span></td><td>${a.title}</td><td class="mono">${a.actor}</td><td>${a.confidence}%</td></tr>`).join("")}
  </tbody></table></div>
  <div class="panel reveal">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <h2 style="margin:0">Relationship map preview</h2>
      <span class="badge b-blue" style="cursor:pointer" onclick="clickSound();render('graph')">OPEN FULL MAP →</span>
    </div>
    <div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;background:#0a0c14;cursor:pointer" onclick="clickSound();render('graph')">${graphMiniMarkup()}</div>
    <div class="note" style="margin-top:8px">Showing the most-connected (crowned) actors and their direct links. Click any node, or the panel, to open the full map.</div>
  </div>`; }

function flaggedPage(){ return `
  <div class="tag reveal">CONTENT REVIEW</div><h1 class="reveal">Flagged content</h1>
  <p class="desc reveal">Items scored by the risk classifier, highest risk first.</p>
  <div class="panel reveal"><table><thead><tr><th>Title</th><th>Source</th><th>Category</th><th>Risk</th><th>Status</th></tr></thead><tbody>
    ${[...FLAGGED].sort((a,b)=>b.riskScore-a.riskScore).map(f=>`<tr class="flagged-row" onmouseenter="hoverSound()"><td>${f.title}</td><td class="mono">${f.source}</td><td>${f.category.replace('_',' ')}</td><td><span class="badge ${riskBadge(f.riskScore)}">${f.riskScore}</span></td><td><span class="badge ${statusBadge(f.status)}">${f.status.toUpperCase()}</span></td></tr>`).join("")}
  </tbody></table></div>`; }

function actorsPage(){ return `
  <div class="tag reveal">ENTITY REGISTRY</div><h1 class="reveal">Tracked actors (${ACTORS.length})</h1>
  <p class="desc reveal">Click a card to open its generated profile.</p>
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(210px,1fr))">
    ${ACTORS.map((a,i)=>`<div class="card reveal" style="transition-delay:${(i%10)*35}ms" onmouseenter="hoverSound()" onclick="clickSound();showProfile('${a.handles[0]}')">
      <div style="display:flex;gap:10px;align-items:flex-start">
        ${avatarSVG(a,46)}
        <div style="min-width:0">
          <h3 style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.handles[0]}</h3>
          <div style="color:var(--dim);font-size:10.5px;font-family:monospace">${a.id}</div>
        </div>
      </div>
      <div class="tagrow">${a.categories.slice(0,2).map(c=>`<span>${c}</span>`).join("")}</div>
      <div style="display:flex;justify-content:space-between;margin-top:10px;font-size:11px;color:var(--dim)"><span>CONFIDENCE</span><span class="mono">${a.confidence}%</span></div>
      <div class="bar"><i style="width:0" data-w="${a.confidence}"></i></div>
    </div>`).join("")}
  </div>`; }

/* ================= force-directed graph (self-contained, no external libs) ================= */
function buildGraphData(){
  const nodes=[], edges=[];
  const addEdge=(a,b,kind)=>{ edges.push({a,b,kind,curve:(seeded(a+"|"+b+"|"+kind,3)-0.5)*0.85}); };
  ACTORS.forEach(a=>{
    nodes.push({id:a.id,label:a.id,displayName:a.handles[0],type:"actor",status:a.status});
    a.handles.forEach(h=>{ nodes.push({id:h,label:h,displayName:h,type:"handle"}); addEdge(a.id,h,"handle"); });
    a.wallets.forEach(w=>{ nodes.push({id:w,label:w,displayName:w,type:"wallet"}); addEdge(a.id,w,"wallet"); });
    a.pgp.forEach(p=>{ nodes.push({id:p,label:p,displayName:p,type:"pgp"}); addEdge(a.id,p,"pgp"); });
  });
  // sprinkle a few cross-actor infra links for a richer graph
  ACTORS.forEach((a,i)=>{ if(seeded(a.id,20)>0.82){ const b=ACTORS[(i+3+Math.floor(seeded(a.id,21)*5))%ACTORS.length]; addEdge(a.id,b.id,"infra"); } });
  const degree={}; edges.forEach(e=>{ degree[e.a]=(degree[e.a]||0)+1; degree[e.b]=(degree[e.b]||0)+1; });
  const BASE_R={actor:15,handle:9,wallet:8,pgp:8};
  nodes.forEach(n=>{ n.degree=degree[n.id]||0; n.hub = n.type==="actor" && n.degree>=5; n.r = n.hub?23:BASE_R[n.type]; });
  return {nodes,edges};
}
const COLORS={actor:"#E1555F",handle:"#5B9FEE",wallet:"#49D3B8",pgp:"#9B8CF2"};
const EDGE_STYLES={
  handle:{color:"#49D3B8",dash:null,arrow:false},
  wallet:{color:"#F0A868",dash:null,arrow:false},
  pgp:{color:"#9B8CF2",dash:null,arrow:false}
};
const INFRA_PALETTE=[
  {color:"#F0A868",dash:null,arrow:true},
  {color:"#E88CC5",dash:"2 6",arrow:false},
  {color:"#5B9FEE",dash:"1 5",arrow:true},
  {color:"#E8D23D",dash:null,arrow:false},
  {color:"#49D3B8",dash:null,arrow:true}
];
function edgeStyle(e){
  if(EDGE_STYLES[e.kind]) return EDGE_STYLES[e.kind];
  return INFRA_PALETTE[hash(e.a+"|"+e.b)%INFRA_PALETTE.length];
}
function edgePathD(A,B,curve){
  const mx=(A.x+B.x)/2, my=(A.y+B.y)/2, dx=B.x-A.x, dy=B.y-A.y, len=Math.hypot(dx,dy)||1;
  const nx=-dy/len, ny=dx/len, cx=mx+nx*curve*len, cy=my+ny*curve*len;
  return `M ${A.x.toFixed(1)} ${A.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${B.x.toFixed(1)} ${B.y.toFixed(1)}`;
}

function forceLayout(nodes,edges,w,h,iters){
  const idx={}; nodes.forEach((n,i)=>{idx[n.id]=i; n.x=w/2+(seeded(n.id,1)-.5)*w*.9; n.y=h/2+(seeded(n.id,2)-.5)*h*.9; n.vx=0; n.vy=0;});
  const es=edges.map(e=>[idx[e.a],idx[e.b]]).filter(([a,b])=>a!==undefined&&b!==undefined);
  for(let t=0;t<iters;t++){
    for(let i=0;i<nodes.length;i++) for(let j=i+1;j<nodes.length;j++){
      let dx=nodes[i].x-nodes[j].x, dy=nodes[i].y-nodes[j].y; let d2=dx*dx+dy*dy+.01;
      if(d2<24000){ const f=560/d2; const d=Math.sqrt(d2); nodes[i].vx+=f*dx/d; nodes[i].vy+=f*dy/d; nodes[j].vx-=f*dx/d; nodes[j].vy-=f*dy/d; }
    }
    es.forEach(([i,j])=>{ let dx=nodes[j].x-nodes[i].x, dy=nodes[j].y-nodes[i].y; let d=Math.sqrt(dx*dx+dy*dy)+.01;
      const target=58, f=(d-target)*.02; nodes[i].vx+=f*dx/d; nodes[i].vy+=f*dy/d; nodes[j].vx-=f*dx/d; nodes[j].vy-=f*dy/d; });
    nodes.forEach(n=>{ n.vx+=(w/2-n.x)*.0008; n.vy+=(h/2-n.y)*.0008; n.x+=n.vx*.6; n.y+=n.vy*.6; n.vx*=.82; n.vy*=.82;
      n.x=Math.max(34,Math.min(w-34,n.x)); n.y=Math.max(34,Math.min(h-58,n.y)); });
  }
}

function clipId(id){ return "clip_"+id.replace(/[^a-zA-Z0-9_-]/g,"_"); }
function ringGradId(n){ return "rg_"+n.id.replace(/[^a-zA-Z0-9_-]/g,"_"); }
function personIcon(n){
  const cx=n.x, cy=n.y, r=n.r-2.2;
  const headR=r*0.36, headCy=cy-r*0.16, bodyRx=r*0.64, bodyRy=r*0.58, bodyCy=cy+r*0.72;
  return `<clipPath id="${clipId(n.id)}"><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}"/></clipPath>
  <g clip-path="url(#${clipId(n.id)})">
    <circle cx="${cx.toFixed(1)}" cy="${headCy.toFixed(1)}" r="${headR.toFixed(1)}" fill="${COLORS[n.type]}" opacity=".6"/>
    <ellipse cx="${cx.toFixed(1)}" cy="${bodyCy.toFixed(1)}" rx="${bodyRx.toFixed(1)}" ry="${bodyRy.toFixed(1)}" fill="${COLORS[n.type]}" opacity=".6"/>
  </g>`;
}
function crownIcon(n){
  const w=n.r*1.5, h=n.r*0.62, x0=n.x-w/2, y0=n.y-n.r-h*0.62;
  const pts=[[x0,y0+h],[x0,y0+h*0.28],[x0+w*0.25,y0+h*0.72],[x0+w*0.5,y0],[x0+w*0.75,y0+h*0.72],[x0+w,y0+h*0.28],[x0+w,y0+h]]
    .map(p=>p.map(v=>v.toFixed(1)).join(",")).join(" L");
  return `<path d="M${pts} Z" fill="#F0A868" stroke="#0a0c14" stroke-width="1" style="filter:drop-shadow(0 0 4px rgba(240,168,104,.7))"/>`;
}
function statusDot(n){
  if(n.type!=='actor'||!n.status) return '';
  const dx=n.r*0.68, dy=-n.r*0.68, dcx=n.x+dx, dcy=n.y+dy, dr=Math.max(3.4,n.r*0.24);
  const col=n.status==='active'?'#49D3B8':'#F0A868';
  return `<circle cx="${dcx.toFixed(1)}" cy="${dcy.toFixed(1)}" r="${dr.toFixed(1)}" fill="${col}" stroke="#0a0c14" stroke-width="1.6"/>`;
}
function badgeIcon(n){
  const name=n.displayName||n.label||"?";
  const bx=n.x, by=n.y+n.r*0.82, br=n.r*0.42, letter=name.charAt(0).toUpperCase();
  return `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="${br.toFixed(1)}" fill="#0a0c14" stroke="${COLORS[n.type]}" stroke-width="1.3"/>
  <text x="${bx.toFixed(1)}" y="${(by+br*0.36).toFixed(1)}" text-anchor="middle" font-size="${(br*1.15).toFixed(1)}" font-weight="700" fill="#fff" class="mono">${letter}</text>`;
}
function labelPill(n){
  const name=n.displayName||n.label, y=n.y+n.r+21, w=Math.max(46,name.length*6.6+18);
  return `<rect x="${(n.x-w/2).toFixed(1)}" y="${(y-12).toFixed(1)}" width="${w.toFixed(1)}" height="20" rx="6" fill="#0a0c14" stroke="#242c40"/>
  <text x="${n.x.toFixed(1)}" y="${(y+2).toFixed(1)}" text-anchor="middle" fill="#fff" font-size="11" font-weight="600" font-family="-apple-system,Segoe UI,Roboto,sans-serif">${name}</text>`;
}
function nodeGroupInner(n, showLabel){
  if(showLabel===undefined) showLabel=true;
  const gid=ringGradId(n);
  return `<radialGradient id="${gid}" cx="34%" cy="28%" r="78%">
    <stop offset="0%" stop-color="${COLORS[n.type]}" stop-opacity=".32"/>
    <stop offset="100%" stop-color="#0a0c14" stop-opacity="1"/>
  </radialGradient>
  <circle class="gnode-ring" cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${n.r}" fill="url(#${gid})" stroke="${COLORS[n.type]}" stroke-width="${n.hub?3:2}"
    ${n.hub?`style="filter:drop-shadow(0 0 9px ${COLORS[n.type]})"`:''}/>
  ${personIcon(n)}
  ${n.hub?crownIcon(n):''}
  ${statusDot(n)}
  ${badgeIcon(n)}
  ${(showLabel && n.type==='actor')?labelPill(n):''}`;
}
function avatarSVG(a, size){
  size=size||54;
  const hub=a.confidence>=75, extra=hub?size*0.24:0;
  const r=size/2-4, node={id:a.id,label:a.handles?a.handles[0]:a.label,displayName:a.handles?a.handles[0]:(a.label||a.id),type:"actor",status:a.status,hub,r,x:size/2,y:size/2+extra*0.55};
  return `<svg width="${size}" height="${(size+extra).toFixed(0)}" viewBox="0 0 ${size} ${(size+extra).toFixed(1)}" style="overflow:visible;flex:none">${nodeGroupInner(node,false)}</svg>`;
}

let GRAPH_CACHE=null;
let VB={x:0,y:0,w:900,h:520};
function graphPage(){
  if(!GRAPH_CACHE){ GRAPH_CACHE=buildGraphData(); forceLayout(GRAPH_CACHE.nodes,GRAPH_CACHE.edges,900,520,150); }
  const {nodes,edges}=GRAPH_CACHE;
  const edgeSvg=edges.map(e=>{
    const A=nodes.find(n=>n.id===e.a), B=nodes.find(n=>n.id===e.b); if(!A||!B) return "";
    const st=edgeStyle(e);
    return `<path class="gedge" data-a="${e.a}" data-b="${e.b}" data-kind="${e.kind}" data-curve="${e.curve.toFixed(3)}"
      d="${edgePathD(A,B,e.curve)}" fill="none" stroke="${st.color}" stroke-width="1.7" opacity=".82"
      ${st.dash?`stroke-dasharray="${st.dash}"`:''} ${st.arrow?'marker-end="url(#gArrow)"':''}/>`;
  }).join("");
  const nodeSvg=nodes.map(n=>`<g class="gnode${n.hub?' hub':''}" data-id="${n.id}" data-type="${n.type}" onmousedown="dragNodeStart(event,'${n.id}')" onmouseenter="hoverNode('${n.id}')" onmouseleave="hoverNode(null)" onclick="clickSound();showProfile('${n.id}')">
    ${nodeGroupInner(n)}
  </g>`).join("");
  VB={x:0,y:0,w:900,h:520};
  return `<div class="tag reveal">RELATIONSHIP MAP</div><h1 class="reveal">Entity graph — ${nodes.length} nodes, ${edges.length} edges</h1>
  <p class="desc reveal">Scroll to zoom, drag the background to pan, drag a node to reposition it. Crowned nodes are the most connected actors. Red ring = actor · blue = handle · teal = wallet · violet = PGP key.</p>
  <div class="graph-toolbar reveal">
    <div class="graph-searchbar" id="graphSearchWrap">
      <span class="gs-icon">⌕</span>
      <input id="graphSearch" class="mono" placeholder="Search nodes — actor, handle, wallet, PGP key…" autocomplete="off"
        oninput="graphSearchInput(this.value)" onkeydown="graphSearchKey(event)" onfocus="if(this.value)graphSearchInput(this.value)"/>
      <button class="gs-clear" onclick="clearGraphSearch()" title="Clear">✕</button>
      <div id="graphSearchSuggest" class="graph-suggest"></div>
    </div>
    <span class="gs-count" id="graphSearchCount"></span>
    <span class="badge b-blue" style="cursor:pointer" onclick="resetGraphView()">RESET VIEW</span>
  </div>
  <div id="graphwrap" class="reveal">
    <svg id="graphSvg" viewBox="0 0 900 520" onwheel="graphZoom(event)" onmousedown="panStart(event)">
      <defs><marker id="gArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto-start-reverse">
        <path d="M0,0 L8,4 L0,8 Z" fill="context-stroke"/></marker></defs>
      ${edgeSvg}${nodeSvg}
    </svg>
    <div style="display:flex;gap:14px;padding:8px 14px;border-top:1px solid var(--border);font-size:10.5px;color:var(--dim);flex-wrap:wrap">
      <span><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#E1555F;margin-right:4px"></i>Actor</span>
      <span><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#5B9FEE;margin-right:4px"></i>Handle</span>
      <span><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#49D3B8;margin-right:4px"></i>Wallet</span>
      <span><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#9B8CF2;margin-right:4px"></i>PGP key</span>
      <span>👑 Hub actor</span>
      <span class="mono" style="margin-left:auto" id="graphNodeCount">${nodes.length} nodes</span>
    </div>
  </div>
  </div>`;
}

function trendsPage(){
  const scope = window.__trendScope || "__all__";
  const showRisk = window.__trendShowRisk !== false;
  const showFlag = window.__trendShowFlag !== false;
  const data = buildTrendData(scope);
  const cur = data[data.length-1], prev = data[Math.max(0,data.length-8)];
  const delta = cur.risk - prev.risk;
  return `<div class="tag reveal">TREND ANALYSIS</div><h1 class="reveal">Activity trends</h1>
  <p class="desc reveal">Composite risk score and flagged-item volume over the last 14 days, plotted as smoothed dual-series curves.</p>

  <div class="grid stats reveal" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr));margin-bottom:16px">
    <div class="stat"><div class="n">${cur.risk}%</div><div class="l">CURRENT RISK</div></div>
    <div class="stat"><div class="n" style="color:${delta>0?'var(--red)':'var(--teal)'}">${delta>0?'▲':'▼'} ${Math.abs(delta)}</div><div class="l">7-DAY CHANGE</div></div>
    <div class="stat"><div class="n">${cur.flagged}</div><div class="l">FLAGGED TODAY</div></div>
    <div class="stat"><div class="n">${data.reduce((s,d)=>s+d.flagged,0)}</div><div class="l">14-DAY TOTAL</div></div>
  </div>

  <div class="panel reveal">
    <div class="panel-title" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px">
      <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center">
        <label class="mono" style="font-size:11px;display:flex;align-items:center;gap:5px;cursor:pointer"><input type="checkbox" ${showRisk?'checked':''} onchange="window.__trendShowRisk=this.checked;updateTrendChart()"/> <span style="color:var(--amber)">■</span> Risk score</label>
        <label class="mono" style="font-size:11px;display:flex;align-items:center;gap:5px;cursor:pointer"><input type="checkbox" ${showFlag?'checked':''} onchange="window.__trendShowFlag=this.checked;updateTrendChart()"/> <span style="color:var(--blue)">■</span> Flagged count</label>
      </div>
      <select id="trendActorSelect" class="mono" style="background:var(--input-bg);border:1px solid var(--border);color:var(--heading);border-radius:6px;padding:5px 8px;font-size:11.5px" onchange="window.__trendScope=this.value;updateTrendChart()">
        <option value="__all__" ${scope==='__all__'?'selected':''}>All actors (aggregate)</option>
        ${ACTORS.map(a=>`<option value="${a.id}" ${scope===a.id?'selected':''}>${a.handles[0]} (${a.id})</option>`).join("")}
      </select>
    </div>
    <div id="trendChartWrap">${dualLineChartSVG(data, scope, showRisk, showFlag)}</div>
  </div>
  <button class="cta" style="margin-top:14px;padding:9px 20px;font-size:12px" onclick="clickSound();render('overview')">🏠 BACK TO DASHBOARD</button>`;
}
function updateTrendChart(){
  clickSound();
  const scope=window.__trendScope||"__all__", showRisk=window.__trendShowRisk!==false, showFlag=window.__trendShowFlag!==false;
  document.getElementById("trendChartWrap").innerHTML = dualLineChartSVG(buildTrendData(scope), scope, showRisk, showFlag);
}
function buildTrendData(actorId){
  const days=14, out=[]; const scope=actorId||"__all__";
  for(let i=0;i<days;i++){
    const key="trend-"+scope+"-day-"+i;
    const base = scope==="__all__" ? {f:[8,20],r:[25,85]} : {f:[0,8],r:[15,95]};
    out.push({ day:i, flagged: base.f[0]+Math.round(seeded(key,1)*(base.f[1]-base.f[0])), risk: base.r[0]+Math.round(seeded(key,2)*(base.r[1]-base.r[0])) });
  }
  return out;
}
function smoothPath(points){
  if(points.length<2) return "";
  let d=`M ${points[0][0]},${points[0][1]}`;
  for(let i=0;i<points.length-1;i++){
    const [x0,y0]=points[i], [x1,y1]=points[i+1]; const mx=(x0+x1)/2;
    d+=` C ${mx},${y0} ${mx},${y1} ${x1},${y1}`;
  }
  return d;
}
function dualLineChartSVG(data, actorId, showRisk, showFlag){
  const scope=actorId||"__all__";
  const label = scope==="__all__" ? "across all tracked actors" : `for ${(ACTORS.find(a=>a.id===scope)||{}).handles?.[0]||scope}`;
  const w=860,h=220,padL=34,padR=14,padT=16,padB=26;
  const innerW=w-padL-padR, innerH=h-padT-padB;
  const n=data.length, maxFlag=Math.max(20,...data.map(d=>d.flagged));
  const xAt=i=>padL+(i/(n-1))*innerW;
  const yAtRisk=v=>padT+innerH-(v/100)*innerH;
  const yAtFlag=v=>padT+innerH-(v/maxFlag)*innerH;
  const riskPts=data.map((d,i)=>[xAt(i),yAtRisk(d.risk)]);
  const flagPts=data.map((d,i)=>[xAt(i),yAtFlag(d.flagged)]);
  const riskPath=smoothPath(riskPts), flagPath=smoothPath(flagPts);
  const areaPath=`${riskPath} L ${xAt(n-1).toFixed(1)},${padT+innerH} L ${padL},${padT+innerH} Z`;
  const gridLines=[0,25,50,75,100].map(v=>`<line x1="${padL}" x2="${w-padR}" y1="${yAtRisk(v).toFixed(1)}" y2="${yAtRisk(v).toFixed(1)}" stroke="#1c2130" stroke-width="1"/>
    <text x="${padL-6}" y="${(yAtRisk(v)+3).toFixed(1)}" text-anchor="end" font-size="9" fill="var(--dim)" font-family="monospace">${v}</text>`).join("");
  const xLabels=data.filter((_,i)=>i%2===0).map((d,idx)=>{ const i=idx*2; return `<text x="${xAt(i).toFixed(1)}" y="${h-8}" text-anchor="middle" font-size="9" fill="var(--dim)" font-family="monospace">D-${n-1-i}</text>`; }).join("");
  const riskDots=data.map((d,i)=>`<circle class="trend-dot" cx="${xAt(i).toFixed(1)}" cy="${yAtRisk(d.risk).toFixed(1)}" r="3.4" fill="#0a0c14" stroke="var(--amber)" stroke-width="1.6" onmouseenter="showTrendTip(event,${i},'${scope}')" onmouseleave="hideTrendTip()"/>`).join("");
  const flagDots=data.map((d,i)=>`<circle class="trend-dot" cx="${xAt(i).toFixed(1)}" cy="${yAtFlag(d.flagged).toFixed(1)}" r="3" fill="#0a0c14" stroke="var(--blue)" stroke-width="1.6" onmouseenter="showTrendTip(event,${i},'${scope}')" onmouseleave="hideTrendTip()"/>`).join("");
  window.__TREND_DATA=data;
  const pathLen=1400;
  return `<div style="position:relative">
    <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;display:block">
      <defs><linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--amber)" stop-opacity=".3"/><stop offset="100%" stop-color="var(--amber)" stop-opacity="0"/>
      </linearGradient></defs>
      ${gridLines}
      ${showRisk?`<path d="${areaPath}" fill="url(#trendFill)"/>`:''}
      ${showRisk?`<path d="${riskPath}" fill="none" stroke="var(--amber)" stroke-width="2.2" stroke-dasharray="${pathLen}" stroke-dashoffset="${pathLen}"><animate attributeName="stroke-dashoffset" from="${pathLen}" to="0" dur="1s" fill="freeze"/></path>`:''}
      ${showFlag?`<path d="${flagPath}" fill="none" stroke="var(--blue)" stroke-width="2" stroke-dasharray="6 4" opacity=".9"/>`:''}
      ${showRisk?riskDots:''}${showFlag?flagDots:''}${xLabels}
    </svg>
    <div id="trendTip" class="mono" style="position:absolute;display:none;background:#0a0c14;border:1px solid var(--border);border-radius:6px;padding:6px 9px;font-size:10.5px;color:#fff;pointer-events:none;white-space:nowrap;z-index:3"></div>
  </div>
  <p class="desc" style="margin:10px 0 0">Solid amber = risk score · dashed blue = flagged-item count, ${label}.</p>`;
}
function showTrendTip(evt,i){
  const d=window.__TREND_DATA[i]; const tip=document.getElementById("trendTip"); if(!tip) return;
  const wrap=tip.parentElement.getBoundingClientRect(); const r=evt.target.getBoundingClientRect();
  tip.style.left=(r.left-wrap.left+10)+"px"; tip.style.top=(r.top-wrap.top-34)+"px";
  tip.innerHTML=`Risk ${d.risk}% · ${d.flagged} flagged`; tip.style.display="block";
  tone(700,0.025,'sine',0.015);
}
function hideTrendTip(){ const tip=document.getElementById("trendTip"); if(tip) tip.style.display="none"; }
function hoverNode(id){
  document.querySelectorAll(".gedge").forEach(e=>{ const on=id&&(e.dataset.a===id||e.dataset.b===id);
    e.style.stroke=on?"#F0A868":""; e.style.strokeWidth=on?"2.4px":""; });
  document.querySelectorAll(".gnode").forEach(g=>{ g.classList.toggle("dim-el", !!id && g.dataset.id!==id &&
    !document.querySelector(`.gedge[data-a="${id}"][data-b="${g.dataset.id}"],.gedge[data-a="${g.dataset.id}"][data-b="${id}"]`)); });
}
function svgPoint(svg,evt){ const r=svg.getBoundingClientRect(); const sx=VB.w/r.width, sy=VB.h/r.height;
  return {x:VB.x+(evt.clientX-r.left)*sx, y:VB.y+(evt.clientY-r.top)*sy}; }
function graphZoom(evt){ evt.preventDefault(); const svg=document.getElementById("graphSvg"); const p=svgPoint(svg,evt);
  const f=evt.deltaY>0?1.12:0.89; const nw=Math.max(200,Math.min(2200,VB.w*f)), nh=VB.h*(nw/VB.w);
  VB.x=p.x-(p.x-VB.x)*(nw/VB.w); VB.y=p.y-(p.y-VB.y)*(nh/VB.h); VB.w=nw; VB.h=nh; setVB(); }
function setVB(){ const svg=document.getElementById("graphSvg"); if(svg) svg.setAttribute("viewBox",`${VB.x} ${VB.y} ${VB.w} ${VB.h}`); }
function resetGraphView(){ clickSound(); VB={x:0,y:0,w:900,h:520}; setVB(); }
let panning=null;
function panStart(evt){ if(evt.target.closest(".gnode")) return; panning={x:evt.clientX,y:evt.clientY,vb:{...VB}};
  document.onmousemove=panMove; document.onmouseup=()=>{panning=null;document.onmousemove=null;document.onmouseup=null;}; }
function panMove(evt){ if(!panning) return; const svg=document.getElementById("graphSvg"); const r=svg.getBoundingClientRect();
  const dx=(evt.clientX-panning.x)*(VB.w/r.width), dy=(evt.clientY-panning.y)*(VB.h/r.height);
  VB.x=panning.vb.x-dx; VB.y=panning.vb.y-dy; setVB(); }
let dragging=null;
function dragNodeStart(evt,id){ evt.stopPropagation(); const n=GRAPH_CACHE.nodes.find(x=>x.id===id); dragging=n;
  document.onmousemove=e=>dragNodeMove(e); document.onmouseup=()=>{dragging=null;document.onmousemove=null;document.onmouseup=null;}; }
function dragNodeMove(evt){ if(!dragging) return; const svg=document.getElementById("graphSvg"); const p=svgPoint(svg,evt);
  dragging.x=p.x; dragging.y=p.y;
  const g=document.querySelector(`.gnode[data-id="${CSS.escape(dragging.id)}"]`); if(g) g.innerHTML=nodeGroupInner(dragging);
  document.querySelectorAll(`.gedge[data-a="${CSS.escape(dragging.id)}"],.gedge[data-b="${CSS.escape(dragging.id)}"]`).forEach(path=>{
    const A=GRAPH_CACHE.nodes.find(n=>n.id===path.dataset.a), B=GRAPH_CACHE.nodes.find(n=>n.id===path.dataset.b);
    if(A&&B) path.setAttribute("d", edgePathD(A,B,parseFloat(path.dataset.curve)||0));
  });
}

/* ================= interactive graph search ================= */
function graphMatches(q){
  q=q.trim().toLowerCase();
  if(!q||!GRAPH_CACHE) return [];
  return GRAPH_CACHE.nodes.filter(n=>n.label.toLowerCase().includes(q))
    .sort((a,b)=> (a.label.toLowerCase().indexOf(q)) - (b.label.toLowerCase().indexOf(q)) || a.label.length-b.label.length);
}
function graphSearchInput(val){
  const wrap=document.getElementById("graphSearchWrap"); if(!wrap) return;
  wrap.classList.toggle("has-val", !!val);
  const suggest=document.getElementById("graphSearchSuggest");
  const countEl=document.getElementById("graphSearchCount");
  if(!val.trim()){ clearGraphHighlight(); suggest.classList.remove("show"); suggest.innerHTML=""; if(countEl) countEl.textContent=""; return; }
  const matches=graphMatches(val);
  applyGraphHighlight(matches.map(m=>m.id));
  if(countEl) countEl.textContent = matches.length ? `${matches.length} match${matches.length>1?"es":""}` : "no matches";
  renderGraphSuggest(matches.slice(0,8));
}
function renderGraphSuggest(matches){
  const suggest=document.getElementById("graphSearchSuggest"); if(!suggest) return;
  if(!matches.length){ suggest.innerHTML=`<div class="gs-item" style="cursor:default;color:var(--dim)">No nodes found</div>`; suggest.classList.add("show"); return; }
  suggest.innerHTML=matches.map((m,i)=>`<div class="gs-item${i===0?" active":""}" data-id="${m.id}" onmouseenter="hoverSound();graphSuggestHover('${m.id}')" onmousedown="event.preventDefault();selectGraphNode('${m.id}')">
    <span class="gs-dot" style="background:${COLORS[m.type]};color:${COLORS[m.type]}"></span>${m.label}<span class="gs-type">${m.type}</span></div>`).join("");
  suggest.classList.add("show");
}
function graphSuggestHover(id){
  document.querySelectorAll("#graphSearchSuggest .gs-item").forEach(i=>i.classList.toggle("active", i.dataset.id===id));
}
function clearGraphHighlight(){
  document.querySelectorAll("#graphSvg .gnode").forEach(g=>{ g.classList.remove("gmatch","dim-el"); const c=g.querySelector(".gnode-ring"); if(c) c.style.filter = g.classList.contains("hub")?`drop-shadow(0 0 9px ${COLORS[g.dataset.type]})`:""; });
  document.querySelectorAll("#graphSvg .gedge").forEach(e=>{ e.style.stroke=""; e.style.strokeWidth=""; });
}
function applyGraphHighlight(ids){
  const idset=new Set(ids);
  document.querySelectorAll("#graphSvg .gnode").forEach(g=>{
    const id=g.dataset.id, type=g.dataset.type, on=idset.has(id);
    g.classList.toggle("gmatch", on);
    g.classList.toggle("dim-el", idset.size>0 && !on);
    const c=g.querySelector(".gnode-ring"); if(c) c.style.filter = on ? `drop-shadow(0 0 7px ${COLORS[type]})` : (g.classList.contains("hub")?`drop-shadow(0 0 9px ${COLORS[type]})`:"");
  });
  document.querySelectorAll("#graphSvg .gedge").forEach(e=>{
    const touches = idset.has(e.dataset.a) || idset.has(e.dataset.b);
    e.style.stroke = touches ? "#F0A868" : "#171b28";
    e.style.strokeWidth = touches ? "2px" : "1px";
  });
}
function graphSearchKey(evt){
  const suggest=document.getElementById("graphSearchSuggest");
  const items=[...suggest.querySelectorAll(".gs-item[data-id]")];
  if(evt.key==="Escape"){ clearGraphSearch(); return; }
  if(evt.key==="Enter"){ evt.preventDefault(); const active=items.find(i=>i.classList.contains("active"))||items[0]; if(active) selectGraphNode(active.dataset.id); return; }
  if(!items.length) return;
  let idx=items.findIndex(i=>i.classList.contains("active"));
  if(evt.key==="ArrowDown"){ evt.preventDefault(); idx=(idx+1)%items.length; items.forEach(i=>i.classList.remove("active")); items[idx].classList.add("active"); items[idx].scrollIntoView({block:"nearest"}); }
  else if(evt.key==="ArrowUp"){ evt.preventDefault(); idx=(idx-1+items.length)%items.length; items.forEach(i=>i.classList.remove("active")); items[idx].classList.add("active"); items[idx].scrollIntoView({block:"nearest"}); }
}
function selectGraphNode(id){
  clickSound();
  const node=GRAPH_CACHE && GRAPH_CACHE.nodes.find(n=>n.id===id); if(!node) return;
  const input=document.getElementById("graphSearch"); if(input) input.value=node.label;
  const wrap=document.getElementById("graphSearchWrap"); if(wrap) wrap.classList.add("has-val");
  applyGraphHighlight([id]);
  const countEl=document.getElementById("graphSearchCount"); if(countEl) countEl.textContent="1 match";
  const suggest=document.getElementById("graphSearchSuggest"); if(suggest) suggest.classList.remove("show");
  panToNode(node);
}
function panToNode(node){
  const aspect=(VB.h||520)/(VB.w||900); const targetW=240, targetH=targetW*aspect;
  animateVB({x:node.x-targetW/2, y:node.y-targetH/2, w:targetW, h:targetH});
}
let vbAnim=null;
function animateVB(target,dur){
  dur=dur||420; const start={...VB}; const t0=performance.now();
  if(vbAnim) cancelAnimationFrame(vbAnim);
  (function step(t){
    const p=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-p,3);
    VB.x=start.x+(target.x-start.x)*e; VB.y=start.y+(target.y-start.y)*e;
    VB.w=start.w+(target.w-start.w)*e; VB.h=start.h+(target.h-start.h)*e;
    setVB();
    if(p<1) vbAnim=requestAnimationFrame(step);
  })(t0);
}
function clearGraphSearch(){
  const input=document.getElementById("graphSearch"); if(input){ input.value=""; input.focus(); }
  graphSearchInput("");
}
document.addEventListener("click",e=>{
  const wrap=document.getElementById("graphSearchWrap");
  if(wrap && !wrap.contains(e.target)){ const s=document.getElementById("graphSearchSuggest"); if(s) s.classList.remove("show"); }
});

/* ================= profile (generated for any searched name) ================= */
function genProfile(name){
  const existing=ACTORS.find(a=>a.handles.some(h=>h.toLowerCase()===name.toLowerCase())||a.id.toLowerCase()===name.toLowerCase());
  if(existing) return {...existing, generated:false, label:existing.handles[0], risk:null};
  const a=makeActor(name,0);
  return {...a, generated:true, label:name};
}
function showProfile(name){
  alertSound();
  const p=genProfile(name);
  document.querySelectorAll("nav button").forEach(b=>b.classList.remove("active"));
  document.getElementById("pages").innerHTML="";
  const el=document.getElementById("profile"); el.style.display="block";
  el.innerHTML=`<div class="profcard reveal in">
    <div class="profhead">
      <div style="display:flex;gap:14px;align-items:flex-start">
        <div id="avatarBox" class="avatar-box" onclick="avatarPoke()">${avatarSVG(p,66)}</div>
        <div><div class="tag">${p.generated?'<span class="spin"></span>SYNTHETIC PROFILE — GENERATED':'RESOLVED ENTITY'}</div>
        <h1 class="mono" style="margin:2px 0 0">${p.label}</h1>
        <div style="color:var(--dim);font-size:12px;margin-top:2px">${p.id||''} &middot; <span class="badge ${p.status==='active'?'b-teal':'b-amber'}">${(p.status||'active').toUpperCase()}</span></div></div>
      </div>
      <button onclick="clickSound();render('overview')" class="badge b-blue" style="cursor:pointer;border:none">&larr; BACK</button>
    </div>
    <div class="grid" style="grid-template-columns:1fr 1fr;margin-top:16px">
      <div><div style="font-size:11px;color:var(--dim);margin-bottom:4px">ATTRIBUTION CONFIDENCE</div>
        <div class="bar" style="height:8px"><i style="width:${p.confidence}%;transition:width .8s"></i></div>
        <div class="mono" style="margin-top:4px;font-size:20px;color:var(--heading)">${p.confidence}%</div></div>
      <div><div style="font-size:11px;color:var(--dim);margin-bottom:6px">CATEGORIES</div>
        <div class="tagrow">${(p.categories||[]).map(c=>`<span>${c}</span>`).join("")}</div>
        <div style="font-size:11px;color:var(--dim);margin:10px 0 4px">HANDLES / WALLETS</div>
        <div class="tagrow">${[...(p.handles||[]),...(p.wallets||[])].map(c=>`<span>${c}</span>`).join("")||'<span>none observed</span>'}</div></div>
    </div>
    ${p.generated?`<div class="note" style="margin-top:16px;border-top:1px solid var(--border);padding-top:12px">No entity named "${p.label}" exists in the seed dataset — deterministically generated from the name itself (same input always gives the same output).</div>`:''}
  </div>`;
  observeReveals();
  attachAvatarTilt();
}
function attachAvatarTilt(){
  const box=document.getElementById("avatarBox"); if(!box) return;
  box.addEventListener("mousemove",e=>{
    const r=box.getBoundingClientRect(); const px=(e.clientX-r.left)/r.width-.5, py=(e.clientY-r.top)/r.height-.5;
    box.style.transform=`perspective(300px) rotateY(${px*22}deg) rotateX(${-py*22}deg) scale(1.06)`;
  });
  box.addEventListener("mouseleave",()=>{ box.style.transform="perspective(300px) rotateY(0) rotateX(0) scale(1)"; });
}
function avatarPoke(){
  clickSound(); const box=document.getElementById("avatarBox"); if(!box) return;
  box.classList.remove("poke"); void box.offsetWidth; box.classList.add("poke");
}

/* ================= AI prediction (client-side demo classifier) ================= */
const CLASSIFIER_WEIGHTS = {
  leaked_credentials:["password","leak","dump","combo","email","credential","database","breach","login","hash"],
  malware:["malware","exploit","trojan","virus","payload","ransomware","rat","keylogger","botnet","undetected"],
  fraud:["wire","transfer","urgent","scam","payment","bank","fraud","invoice","paypal","fullz","cvv"],
  weapons:["gun","weapon","ammo","rifle","firearm","pistol","silencer","explosive"],
  threat_chatter:["kill","attack","threat","bomb","hurt","target","plan","violence"],
};
function classifyText(text){
  const t=text.toLowerCase(); const raw={};
  Object.entries(CLASSIFIER_WEIGHTS).forEach(([cat,words])=>{ raw[cat]=words.reduce((s,w)=>s+(t.includes(w)?1:0),0); });
  raw.benign = (raw.benign||0) + Math.max(0, 2 - Object.values(raw).reduce((a,b)=>a+b,0)) + seeded(text,3)*0.6;
  const exp = Object.entries(raw).map(([k,v])=>[k, Math.exp(v*1.4)]);
  const sum = exp.reduce((s,[,v])=>s+v,0);
  const dist = exp.map(([k,v])=>({label:k, pct: Math.round((v/sum)*100)})).sort((a,b)=>b.pct-a.pct);
  return dist;
}
const PREDICT_PRESETS = {
  "": "",
  "Leaked credentials example": "Fresh combo list, 50k lines, verified emails and passwords, DM for price",
  "Malware example": "Selling a custom RAT builder, fully undetectable by major antivirus engines",
  "Fraud example": "Urgent wire transfer needed today, send payment to this account now",
  "Weapons example": "Selling an untraceable firearm, ships discreetly worldwide, cash only",
  "Threat chatter example": "Finalizing the plan to attack the target location this week",
  "Benign example": "Does anyone have a good podcast recommendation about linux security",
};
function aiPage(){ return `
  <div class="tag reveal">MODEL INFERENCE</div><h1 class="reveal">AI risk prediction</h1>
  <p class="desc reveal">Mirrors the categories the real backend's trained RandomForest model uses. Pick an example or paste your own text.</p>
  <div class="panel reveal">
    <select id="predict-preset" class="mono" style="width:100%;background:var(--input-bg);border:1px solid var(--border);color:var(--heading);border-radius:7px;padding:9px;margin-bottom:10px" onchange="document.getElementById('predict-input').value=PREDICT_PRESETS[this.value]||''">
      ${Object.keys(PREDICT_PRESETS).map(k=>`<option value="${k}">${k||"— choose an example, or type your own below —"}</option>`).join("")}
    </select>
    <textarea id="predict-input" rows="4" style="width:100%;background:var(--input-bg);border:1px solid var(--border);color:var(--heading);border-radius:7px;padding:10px;font-size:13px;resize:vertical" placeholder="Paste a message, post, or listing to classify…"></textarea>
    <button class="cta" style="margin-top:12px;padding:9px 20px;font-size:12px" onclick="runPredict()">RUN PREDICTION</button>
    <div id="predict-result" style="margin-top:16px"></div>
  </div>`;
}
function runPredict(){
  clickSound();
  const text=document.getElementById("predict-input").value.trim();
  const box=document.getElementById("predict-result");
  if(!text){ box.innerHTML=`<div class="note">Enter or select some text first.</div>`; return; }
  const steps=["Tokenizing input…","Extracting TF-IDF features…","Running RandomForest ensemble…","Aggregating votes across trees…"];
  box.innerHTML=`<div class="mono" id="scanlog" style="font-size:11.5px;color:var(--teal);line-height:1.9"></div>`;
  const log=document.getElementById("scanlog");
  steps.forEach((s,i)=>setTimeout(()=>{ tone(500+i*90,0.05,'sine',0.02); log.innerHTML+=`<div class="reveal in">&gt; ${s}</div>`; },i*260));
  setTimeout(()=>{
    const dist=classifyText(text); const top=dist[0]; alertSound();
    const badge = top.label==="benign"?"b-teal":top.pct>50?"b-red":"b-amber";
    const circumf=2*Math.PI*34;
    box.innerHTML=`<div class="reveal in" style="display:flex;gap:22px;flex-wrap:wrap;align-items:center">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r="34" fill="none" stroke="#1c2130" stroke-width="7"/>
        <circle cx="45" cy="45" r="34" fill="none" stroke="${badge==='b-red'?'#E1555F':badge==='b-amber'?'#F0A868':'#49D3B8'}" stroke-width="7" stroke-linecap="round"
          stroke-dasharray="${circumf}" stroke-dashoffset="${circumf}" transform="rotate(-90 45 45)">
          <animate attributeName="stroke-dashoffset" from="${circumf}" to="${circumf*(1-top.pct/100)}" dur="0.8s" fill="freeze"/>
        </circle>
        <text x="45" y="50" text-anchor="middle" class="mono" style="fill:#fff;font-size:18px;font-weight:700">${top.pct}%</text>
      </svg>
      <div style="flex:1;min-width:220px">
        <span class="badge ${badge}" style="font-size:13px;padding:6px 14px;margin-bottom:10px;display:inline-block">${top.label.replace('_',' ').toUpperCase()}</span>
        ${dist.map(d=>`<div style="margin-bottom:6px"><div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--dim)"><span>${d.label.replace('_',' ')}</span><span class="mono">${d.pct}%</span></div><div class="bar"><i style="width:0" data-w="${d.pct}"></i></div></div>`).join("")}
      </div>
    </div>`;
    document.querySelectorAll("#predict-result .bar i[data-w]").forEach(b=>requestAnimationFrame(()=>b.style.width=b.dataset.w+"%"));
  }, steps.length*260+250);
}

/* ================= two-party risk comparison ================= */
function actorSelectOptions(sel){ return ACTORS.map(a=>`<option value="${a.handles[0]}" ${a.handles[0]===sel?'selected':''}>${a.handles[0]} (${a.id})</option>`).join("")+`<option value="__custom__">— custom name… —</option>`; }
function comparePage(){ return `
  <div class="tag reveal">CORRELATION ANALYSIS</div><h1 class="reveal">Compare two parties</h1>
  <p class="desc reveal">Pick two tracked actors, or choose "custom name" to test an unresolved handle.</p>
  <div class="panel reveal" style="display:flex;gap:10px;flex-wrap:wrap;align-items:end">
    <div style="flex:1;min-width:170px"><label style="font-size:11px;color:var(--dim)">PARTY A</label>
      <select id="cmp-a-sel" class="mono" style="width:100%;background:var(--input-bg);border:1px solid var(--border);color:var(--heading);border-radius:7px;padding:9px;margin-top:4px" onchange="toggleCustom('a',this.value)">${actorSelectOptions(ACTORS[0].handles[0])}</select>
      <input id="cmp-a-custom" class="mono" style="display:none;width:100%;background:var(--input-bg);border:1px solid var(--border);color:var(--heading);border-radius:7px;padding:9px;margin-top:6px" placeholder="type a custom name"/></div>
    <div style="flex:1;min-width:170px"><label style="font-size:11px;color:var(--dim)">PARTY B</label>
      <select id="cmp-b-sel" class="mono" style="width:100%;background:var(--input-bg);border:1px solid var(--border);color:var(--heading);border-radius:7px;padding:9px;margin-top:4px" onchange="toggleCustom('b',this.value)">${actorSelectOptions(ACTORS[1].handles[0])}</select>
      <input id="cmp-b-custom" class="mono" style="display:none;width:100%;background:var(--input-bg);border:1px solid var(--border);color:var(--heading);border-radius:7px;padding:9px;margin-top:6px" placeholder="type a custom name"/></div>
    <button class="cta" style="padding:9px 20px;font-size:12px" onclick="runCompare()">COMPARE</button>
  </div>
  <div id="compare-result"></div>`;
}
function toggleCustom(which,val){
  const inp=document.getElementById(`cmp-${which}-custom`);
  inp.style.display = val==="__custom__" ? "block" : "none";
  if(val==="__custom__") inp.focus();
}
function cmpValue(which){
  const sel=document.getElementById(`cmp-${which}-sel`).value;
  return sel==="__custom__" ? document.getElementById(`cmp-${which}-custom`).value.trim() : sel;
}
function runCompare(silent){
  if(!silent) clickSound();
  const a=cmpValue('a'), b=cmpValue('b');
  const box=document.getElementById("compare-result");
  if(!box) return;
  if(!a||!b){ box.innerHTML=`<div class="note">Enter both names.</div>`; return; }
  const combined=[a,b].sort().join("|");
  const dims=["linguistic","vocabulary","writingPattern","postingBehavior"].map((d,i)=>({d,v:30+Math.floor(seeded(combined,i+1)*65)}));
  const overall=Math.round(dims.reduce((s,x)=>s+x.v,0)/dims.length);
  const pA=genProfile(a), pB=genProfile(b);
  if(!silent) alertSound();
  box.innerHTML=`<div class="panel reveal in" style="margin-top:14px">
    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:14px">
      <div><div class="tag">OVERALL CORRELATION</div><div class="mono" style="font-size:28px;color:var(--heading)">${overall}%</div></div>
      <div style="text-align:right"><div class="tag">RISK IF LINKED</div><span class="badge ${overall>70?'b-red':overall>45?'b-amber':'b-teal'}" style="font-size:12px">${overall>70?'HIGH':overall>45?'MODERATE':'LOW'}</span></div>
    </div>
    ${dims.map(x=>`<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--dim)"><span>${x.d.replace(/([A-Z])/g,' $1').toUpperCase()}</span><span class="mono">${x.v}%</span></div><div class="bar"><i style="width:${x.v}%"></i></div></div>`).join("")}
    <hr style="border:none;border-top:1px solid var(--border);margin:14px 0"/>
    <div class="grid" style="grid-template-columns:1fr 1fr">
      <div><div class="tag">${a}</div><div class="tagrow">${(pA.categories||[]).map(c=>`<span>${c}</span>`).join("")}</div></div>
      <div><div class="tag">${b}</div><div class="tagrow">${(pB.categories||[]).map(c=>`<span>${c}</span>`).join("")}</div></div>
    </div>
    <div class="note">Deterministic synthetic scoring for demo purposes — same pair of names always produces the same result. Shown here with the default pair — pick any two to recompute.</div>
  </div>`;
}



function enterConsole(){
  clickSound();
  const hero=document.getElementById("hero");
  hero.classList.add("hidden");
  document.querySelector("header#app").classList.add("console-active");
  document.querySelector("main").classList.add("console-active");
  window.scrollTo({top:0,behavior:"instant"});
}
function backToLanding(){
  clickSound();
  document.getElementById("hero").classList.remove("hidden");
  document.querySelector("header#app").classList.remove("console-active");
  document.querySelector("main").classList.remove("console-active");
  window.scrollTo({top:0,behavior:"smooth"});
}
/* ================= ML Pipelines (real client-side implementations, mirroring the backend) ================= */
function levenshtein(a,b){
  a=a.toLowerCase(); b=b.toLowerCase();
  if(a===b) return 0; if(!a.length) return b.length; if(!b.length) return a.length;
  let prev=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){ const curr=[i]; for(let j=1;j<=b.length;j++){
    const cost=a[i-1]===b[j-1]?0:1; curr[j]=Math.min(curr[j-1]+1, prev[j]+1, prev[j-1]+cost); } prev=curr; }
  return prev[b.length];
}
function normSim(a,b){ a=(a||"").trim(); b=(b||"").trim(); if(!a&&!b) return 1;
  return 1-(levenshtein(a,b)/Math.max(a.length,b.length,1)); }
function jaccard(setA,setB){ const A=new Set(setA), B=new Set(setB); if(!A.size&&!B.size) return 1;
  const union=new Set([...A,...B]); if(!union.size) return 0;
  let inter=0; A.forEach(x=>{ if(B.has(x)) inter++; }); return inter/union.size; }
function bigrams(s){ s=s.toLowerCase(); const m={}; for(let i=0;i<s.length-1;i++){ const bg=s.slice(i,i+2); m[bg]=(m[bg]||0)+1; } return m; }
function cosineOfBigrams(a,b){
  const A=bigrams(a), B=bigrams(b); const keys=new Set([...Object.keys(A),...Object.keys(B)]);
  let dot=0,na=0,nb=0; keys.forEach(k=>{ const x=A[k]||0,y=B[k]||0; dot+=x*y; na+=x*x; nb+=y*y; });
  return (na&&nb) ? dot/(Math.sqrt(na)*Math.sqrt(nb)) : 0;
}
const ONION_SERVICES=[
  {id:"ONION-A17F", identifier:"a17f9k2m...qbmz.onion", banner:"nginx/1.18.0 (Ubuntu)", cert:"mail.northwind-holdings.com", headers:["Server","X-Powered-By"], category:"marketplace", status:"active", confidence:78},
  {id:"ONION-3D9C", identifier:"3d9cq7x1...vlks.onion", banner:"Apache/2.4.41", cert:"CN=localhost", headers:["Server","Date"], category:"forum", status:"active", confidence:41},
  {id:"ONION-77BE", identifier:"77be4h6p...ftrz.onion", banner:"lighttpd/1.4.53", cert:"secure.relaycore-vpn.net", headers:["Server","Content-Type","X-Frame-Options"], category:"hosting", status:"active", confidence:83},
  {id:"ONION-F4A2", identifier:"f4a29z7q...xkrp.onion", banner:"nginx/1.20.1", cert:"CN=northwind-holdings.com", headers:["Server","X-Powered-By","ETag"], category:"marketplace", status:"active", confidence:91},
  {id:"ONION-9C3E", identifier:"9c3e5m8t...whyn.onion", banner:"Apache/2.4.52", cert:"CN=self-signed", headers:["Server"], category:"forum", status:"dormant", confidence:29},
  {id:"ONION-6B21", identifier:"6b21p4l9...dzoq.onion", banner:"lighttpd/1.4.59", cert:"relaycore-vpn.net", headers:["Server","Date","Content-Type"], category:"hosting", status:"active", confidence:66},
];
const SOURCES=[
  {id:"SRC-A", name:"Forum-A", type:"Discussion forum", reliability:"A", status:"verified", firstObserved:"2025-11-02", lastObserved:"2026-09-20"},
  {id:"SRC-B", name:"Marketplace-B", type:"Marketplace", reliability:"A", status:"verified", firstObserved:"2025-08-14", lastObserved:"2026-09-25"},
  {id:"SRC-C", name:"Onion-Relay-7", type:"Infrastructure relay", reliability:"B", status:"monitoring", firstObserved:"2026-01-30", lastObserved:"2026-09-18"},
  {id:"SRC-D", name:"Forum-C", type:"Discussion forum", reliability:"B", status:"verified", firstObserved:"2025-12-11", lastObserved:"2026-09-22"},
  {id:"SRC-E", name:"Exchange-D", type:"Crypto exchange leak", reliability:"C", status:"unverified", firstObserved:"2026-04-05", lastObserved:"2026-08-30"},
  {id:"SRC-F", name:"Board-Nexus", type:"Discussion forum", reliability:"B", status:"monitoring", firstObserved:"2026-02-19", lastObserved:"2026-09-15"},
];
function actorTextSample(a){
  return FLAGGED.filter(f=>f.actor===a.id).map(f=>f.title).join(". ") || (a.handles[0]+" has no recent flagged posts on record.");
}
function pipelinesPage(){ return `
  <div class="tag reveal">DEPLOYABLE ML PIPELINES</div><h1 class="reveal">Threat-intel pipelines</h1>
  <p class="desc reveal">Three real similarity/matching algorithms, run live in your browser — the backend runs the same math server-side (TF-IDF cosine, Levenshtein, Jaccard) over the full dataset.</p>

  <div class="panel reveal">
    <h2>1 &middot; Stylometric persona identification</h2>
    <p class="desc" style="margin-bottom:10px">TF-IDF-style character-bigram cosine similarity between two actors' post history — catches a rebranded persona even after a handle change.</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:end">
      <div style="flex:1;min-width:160px"><label style="font-size:11px;color:var(--dim)">ACTOR A</label>
        <select id="sty-a" class="mono" style="width:100%;background:var(--input-bg);border:1px solid var(--border);color:var(--heading);border-radius:7px;padding:8px;margin-top:4px">${ACTORS.map(a=>`<option value="${a.id}">${a.handles[0]}</option>`).join("")}</select></div>
      <div style="flex:1;min-width:160px"><label style="font-size:11px;color:var(--dim)">ACTOR B</label>
        <select id="sty-b" class="mono" style="width:100%;background:var(--input-bg);border:1px solid var(--border);color:var(--heading);border-radius:7px;padding:8px;margin-top:4px">${ACTORS.map((a,i)=>`<option value="${a.id}" ${i===1?'selected':''}>${a.handles[0]}</option>`).join("")}</select></div>
      <button class="cta" style="padding:8px 18px;font-size:12px" onclick="runStylometry()">RUN</button>
    </div>
    <div id="sty-result" style="margin-top:12px"></div>
  </div>

  <div class="panel reveal">
    <h2>2 &middot; Infrastructure &amp; clearnet correlation matcher</h2>
    <p class="desc" style="margin-bottom:10px">Fuzzy string match (Levenshtein) on banners/certificates + Jaccard on header sets, to catch a hidden service leaking its real host.</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:end">
      <div style="flex:1;min-width:160px"><label style="font-size:11px;color:var(--dim)">ONION SERVICE</label>
        <select id="infra-onion" class="mono" style="width:100%;background:var(--input-bg);border:1px solid var(--border);color:var(--heading);border-radius:7px;padding:8px;margin-top:4px">${ONION_SERVICES.map(o=>`<option value="${o.id}">${o.identifier}</option>`).join("")}</select></div>
      <div style="flex:1;min-width:160px"><label style="font-size:11px;color:var(--dim)">CLEARNET BANNER</label>
        <input id="infra-banner" class="mono" value="nginx/1.18.0 (Ubuntu)" style="width:100%;background:var(--input-bg);border:1px solid var(--border);color:var(--heading);border-radius:7px;padding:8px;margin-top:4px" placeholder="e.g. nginx/1.18.0 (Ubuntu)"/></div>
      <button class="cta" style="padding:8px 18px;font-size:12px" onclick="runInfraMatch()">RUN</button>
    </div>
    <div id="infra-result" style="margin-top:12px"></div>
  </div>

  <div class="panel reveal">
    <h2>3 &middot; Cross-marketplace entity resolution</h2>
    <p class="desc" style="margin-bottom:10px">Blocking + attribute-overlap scoring (handle spelling, wallet reuse, PGP reuse) across all ${ACTORS.length} actors — surfaces which "different" identities are probably the same person.</p>
    <button class="cta" style="padding:8px 18px;font-size:12px" onclick="runEntityResolution()">RUN ACROSS DATASET</button>
    <div id="entity-result" style="margin-top:12px"></div>
  </div>`;
}
function scoreBar(label,pct){ return `<div style="margin-bottom:6px"><div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--dim)"><span>${label}</span><span class="mono">${pct}%</span></div><div class="bar"><i style="width:${pct}%"></i></div></div>`; }
function runStylometry(){
  clickSound();
  const a=ACTORS.find(x=>x.id===document.getElementById("sty-a").value), b=ACTORS.find(x=>x.id===document.getElementById("sty-b").value);
  const box=document.getElementById("sty-result");
  if(a.id===b.id){ box.innerHTML=`<div class="note">Pick two different actors.</div>`; return; }
  const ta=actorTextSample(a), tb=actorTextSample(b);
  const sim=Math.round(cosineOfBigrams(ta,tb)*100);
  alertSound();
  box.innerHTML=`<div class="reveal in">${scoreBar("Stylometric similarity",sim)}<div class="note" style="margin-top:8px">${sim>=55?`Possible shared authorship between ${a.handles[0]} and ${b.handles[0]} — writing samples are notably similar.`:`No strong stylometric link detected between ${a.handles[0]} and ${b.handles[0]}.`}</div></div>`;
}
function runInfraMatch(){
  clickSound();
  const o=ONION_SERVICES.find(x=>x.id===document.getElementById("infra-onion").value);
  const banner=document.getElementById("infra-banner").value.trim()||"(empty)";
  const bannerSim=Math.round(normSim(o.banner,banner)*100);
  const certSim=Math.round(normSim(o.cert,"unknown-host.example.com")*40+seeded(o.id,9)*20); // no clearnet cert input field in this lean demo
  const headerSim=Math.round(jaccard(o.headers,["Server","Date"])*100);
  const composite=Math.round(bannerSim*0.5+certSim*0.3+headerSim*0.2);
  alertSound();
  const box=document.getElementById("infra-result");
  box.innerHTML=`<div class="reveal in">${scoreBar("Banner similarity",bannerSim)}${scoreBar("Certificate/CN similarity",certSim)}${scoreBar("Header set overlap",headerSim)}
    <div style="margin-top:8px"><span class="badge ${composite>=60?'b-red':'b-teal'}">${composite}% COMPOSITE</span> <span class="note" style="display:inline">${composite>=60?'Flagged — likely origin-server leak.':'Below threshold — no leak flagged.'}</span></div></div>`;
}
function runEntityResolution(){
  clickSound();
  const entities=ACTORS.map(a=>({id:a.id,handles:a.handles,wallets:a.wallets,pgp:a.pgp,platforms:a.platforms}));
  const results=[];
  for(let i=0;i<entities.length;i++) for(let j=i+1;j<entities.length;j++){
    const A=entities[i],B=entities[j];
    let handleSim=0; A.handles.forEach(ha=>B.handles.forEach(hb=>{ handleSim=Math.max(handleSim,normSim(ha,hb)); }));
    const walletJ=jaccard(A.wallets,B.wallets), pgpJ=jaccard(A.pgp,B.pgp), platJ=jaccard(A.platforms,B.platforms);
    const composite=handleSim*0.2+walletJ*0.35+pgpJ*0.35+platJ*0.1;
    if(composite>0.15) results.push({a:A,b:B,score:Math.round(composite*100)});
  }
  results.sort((x,y)=>y.score-x.score);
  alertSound();
  const top=results.slice(0,8);
  document.getElementById("entity-result").innerHTML = top.length ? `<div class="reveal in"><table><thead><tr><th>Entity A</th><th>Entity B</th><th>Match score</th><th>Verdict</th></tr></thead><tbody>
    ${top.map(r=>`<tr><td class="mono">${r.a.handles[0]}</td><td class="mono">${r.b.handles[0]}</td><td>${r.score}%</td><td><span class="badge ${r.score>=55?'b-red':'b-amber'}">${r.score>=55?'LIKELY SAME ENTITY':'WEAK LINK'}</span></td></tr>`).join("")}
  </tbody></table></div>` : `<div class="note">No candidate pairs cleared the blocking threshold in this run.</div>`;
}

/* ================= Search (full index) ================= */
function buildSearchIndex(){
  const rows=[];
  ACTORS.forEach(a=>{
    rows.push({type:"actor",display:a.id,sub:a.handles.join(", "),conf:a.confidence,goto:()=>showProfile(a.handles[0])});
    a.handles.forEach(h=>rows.push({type:"handle",display:h,sub:a.id,conf:a.confidence,goto:()=>showProfile(h)}));
    a.wallets.forEach(w=>rows.push({type:"wallet",display:w,sub:a.id,conf:a.confidence,goto:()=>showProfile(a.handles[0])}));
    a.pgp.forEach(p=>rows.push({type:"pgp",display:p,sub:a.id,conf:a.confidence,goto:()=>showProfile(a.handles[0])}));
  });
  ONION_SERVICES.forEach(o=>rows.push({type:"onion",display:o.identifier,sub:o.category,conf:o.confidence,goto:()=>render('infra')}));
  return rows;
}
const TYPE_COLORS={actor:"b-red",handle:"b-blue",wallet:"b-teal",pgp:"b-violet",onion:"b-amber"};
function searchPage(){
  window.__SEARCH_INDEX=buildSearchIndex();
  return `<div class="tag reveal">LOOKUP</div><h1 class="reveal">Search intelligence index</h1>
  <p class="desc reveal">Search by handle, PGP fingerprint, wallet, onion identifier, or actor ID across the dataset.</p>
  <div class="panel reveal">
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
      ${Object.keys(TYPE_COLORS).map(t=>`<label class="mono" style="font-size:10.5px;display:flex;align-items:center;gap:4px;cursor:pointer"><input type="checkbox" class="type-filter" value="${t}" checked onchange="runIndexSearch()"/> ${t.toUpperCase()}</label>`).join("")}
    </div>
    <input id="idx-search" class="mono" style="width:100%;background:var(--input-bg);border:1px solid var(--border);color:var(--heading);border-radius:7px;padding:9px;font-size:13px" placeholder="e.g. AlphaX, WALLET-001, PGP-77A1, onion..." oninput="runIndexSearch()"/>
    <div id="idx-count" class="desc" style="margin:10px 0 6px"></div>
    <table><thead><tr><th>Type</th><th>Identifier</th><th>Linked to</th><th>Confidence</th></tr></thead><tbody id="idx-results"></tbody></table>
  </div>`;
}
function runIndexSearch(){
  const term=(document.getElementById("idx-search")?.value||"").toLowerCase();
  const active=[...document.querySelectorAll(".type-filter:checked")].map(c=>c.value);
  let rows=(window.__SEARCH_INDEX||[]).filter(r=>active.includes(r.type) && (!term||r.display.toLowerCase().includes(term)||r.sub.toLowerCase().includes(term)));
  document.getElementById("idx-count").textContent=`${rows.length} result${rows.length===1?"":"s"}`;
  document.getElementById("idx-results").innerHTML=rows.slice(0,80).map(r=>`<tr onclick="window.__idxGoto${r.display.replace(/[^a-zA-Z0-9]/g,'')}?.()" style="cursor:pointer"><td><span class="badge ${TYPE_COLORS[r.type]}">${r.type.toUpperCase()}</span></td><td class="mono">${r.display}</td><td class="dim">${r.sub}</td><td>${r.conf}%</td></tr>`).join("")||`<tr><td colspan="4"><div class="note">No matches.</div></td></tr>`;
  rows.forEach(r=>{ window["__idxGoto"+r.display.replace(/[^a-zA-Z0-9]/g,'')]=r.goto; });
}

/* ================= Timeline ================= */
const TIMELINE_TEMPLATES=["First observed active on {plat}","New handle variant detected: {h2}","Wallet {w} linked via transaction correlation","PGP key {p} associated with this identity","Flagged content posted and scored by the classifier","Cross-referenced with an infrastructure indicator","Dormant period ended — activity resumed","Migrated primary platform to {plat}"];
function buildTimelineEvents(scope){
  const pool = scope==="__all__" ? ACTORS : ACTORS.filter(a=>a.id===scope);
  const events=[];
  pool.forEach(a=>{
    const count=3+Math.floor(seeded(a.id,30)*3);
    for(let i=0;i<count;i++){
      const key=a.id+"-evt-"+i;
      const daysAgo=Math.floor(seeded(key,1)*175)+1;
      const d=new Date(Date.now()-daysAgo*86400000);
      const tmpl=TIMELINE_TEMPLATES[Math.floor(seeded(key,2)*TIMELINE_TEMPLATES.length)];
      const text=tmpl.replace("{plat}",a.platforms[0]).replace("{h2}",a.handles[1]||a.handles[0]+"_alt").replace("{w}",a.wallets[0]||"WALLET-???").replace("{p}",a.pgp[0]||"PGP-????");
      events.push({date:d, actor:a, text});
    }
  });
  return events.sort((x,y)=>y.date-x.date);
}
function timelinePage(){
  const scope=window.__timelineScope||"__all__";
  const events=buildTimelineEvents(scope);
  return `<div class="tag reveal">CHRONOLOGY</div><h1 class="reveal">Investigation timeline</h1>
  <p class="desc reveal">How an actor's identifiers and activity emerged over time.</p>
  <div class="panel reveal">
    <select class="mono" style="background:var(--input-bg);border:1px solid var(--border);color:var(--heading);border-radius:6px;padding:6px 9px;font-size:11.5px;margin-bottom:14px" onchange="window.__timelineScope=this.value;updateTimeline()">
      <option value="__all__" ${scope==='__all__'?'selected':''}>All actors</option>
      ${ACTORS.map(a=>`<option value="${a.id}" ${scope===a.id?'selected':''}>${a.handles[0]} (${a.id})</option>`).join("")}
    </select>
    <div id="timelineList" class="timeline">${events.slice(0,40).map(e=>`<div class="timeline-item" style="border-left:2px solid var(--border);padding:8px 10px 16px 16px;margin-left:4px;position:relative;border-radius:0 6px 6px 0"><div style="position:absolute;left:-5px;top:10px;width:8px;height:8px;border-radius:50%;background:var(--amber)"></div><div class="mono timeline-date">${e.date.toISOString().slice(0,10)} &middot; <a href="#" onclick="event.preventDefault();clickSound();showProfile('${e.actor.handles[0]}')" class="mono" style="color:var(--blue)">${e.actor.id}</a></div><div class="timeline-text">${e.text}</div></div>`).join("")}</div>
  </div>`;
}
function updateTimeline(){ clickSound(); document.getElementById("timelineList").innerHTML = buildTimelineEvents(window.__timelineScope||"__all__").slice(0,40).map(e=>`<div class="timeline-item" style="border-left:2px solid var(--border);padding:8px 10px 16px 16px;margin-left:4px;position:relative;border-radius:0 6px 6px 0"><div style="position:absolute;left:-5px;top:10px;width:8px;height:8px;border-radius:50%;background:var(--amber)"></div><div class="mono timeline-date">${e.date.toISOString().slice(0,10)} &middot; <a href="#" onclick="event.preventDefault();clickSound();showProfile('${e.actor.handles[0]}')" class="mono" style="color:var(--blue)">${e.actor.id}</a></div><div class="timeline-text">${e.text}</div></div>`).join(""); }

/* ================= Alerts (standalone) ================= */
function alertsPage(){
  const filter=window.__alertFilter||"all";
  const list = filter==="all" ? ALERTS : ALERTS.filter(a=>a.severity===filter);
  return `<div class="tag reveal">ACTIVE MONITORING</div><h1 class="reveal">Alerts</h1>
  <p class="desc reveal">System-generated alerts from the risk pipeline, newest first.</p>
  <div class="panel reveal">
    <div style="display:flex;gap:8px;margin-bottom:12px">
      ${["all","high","medium","low"].map(s=>`<button class="badge ${filter===s?(s==='all'?'b-blue':sevBadge(s)):'b-blue'}" style="cursor:pointer;border:none;opacity:${filter===s?1:.45}" onclick="window.__alertFilter='${s}';render('alerts')">${s.toUpperCase()}</button>`).join("")}
    </div>
    <table><thead><tr><th>Severity</th><th>Alert</th><th>Actor</th><th>Confidence</th></tr></thead><tbody>
      ${list.map(a=>`<tr onmouseenter="hoverSound()"><td><span class="badge ${sevBadge(a.severity)}">${a.severity.toUpperCase()}</span></td><td>${a.title}</td><td class="mono" style="cursor:pointer;color:var(--blue)" onclick="showProfile('${(ACTORS.find(x=>x.id===a.actor)||{}).handles?.[0]||a.actor}')">${a.actor}</td><td>${a.confidence}%</td></tr>`).join("")||`<tr><td colspan="4"><div class="note">No alerts at this severity.</div></td></tr>`}
    </tbody></table>
  </div>`;
}

/* ================= Infrastructure ================= */
function infraBadge(s){ return s==='active'?'b-teal':'b-amber'; }
function infrastructurePage(){ return `
  <div class="tag reveal">INFRASTRUCTURE INTELLIGENCE</div><h1 class="reveal">Hidden-service infrastructure</h1>
  <p class="desc reveal">Publicly observable configuration and certificate metadata for tracked onion services.</p>
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">
    ${ONION_SERVICES.map((o,i)=>`<div class="panel reveal" style="transition-delay:${i*40}ms">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <span class="mono" style="font-size:12.5px">${o.identifier}</span>
        <span class="badge ${infraBadge(o.status)}">${o.status.toUpperCase()}</span>
      </div>
      <div class="tagrow" style="margin-bottom:10px"><span>${o.category}</span></div>
      <div style="font-size:11px;color:var(--dim);margin-bottom:2px">SERVER BANNER</div>
      <div class="mono" style="font-size:11.5px;margin-bottom:8px">${o.banner}</div>
      <div style="font-size:11px;color:var(--dim);margin-bottom:2px">CERTIFICATE CN</div>
      <div class="mono" style="font-size:11.5px;margin-bottom:8px">${o.cert}</div>
      <div class="tagrow" style="margin-bottom:10px">${o.headers.map(h=>`<span>${h}</span>`).join("")}</div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--dim)"><span>ASSOCIATION CONFIDENCE</span><span class="mono">${o.confidence}%</span></div>
      <div class="bar"><i style="width:${o.confidence}%"></i></div>
      <button class="badge b-blue" style="cursor:pointer;border:none;margin-top:10px" onclick="render('pipelines')">RUN CORRELATION MATCH →</button>
    </div>`).join("")}
  </div>
  <div class="note" style="margin-top:6px">This does not attempt to deanonymize Tor traffic — associations are derived only from publicly observable service metadata (certificate reuse, server misconfiguration).</div>`;
}

/* ================= Sources ================= */
function relBadge(r){ return r==='A'?'b-teal':r==='B'?'b-blue':'b-amber'; }
function srcStatusBadge(s){ return s==='verified'?'b-teal':s==='monitoring'?'b-blue':'b-amber'; }
function sourcesPage(){ return `
  <div class="tag reveal">DATA PROVENANCE</div><h1 class="reveal">Source reliability</h1>
  <p class="desc reveal">Every piece of intelligence is tied to a source with a standardized reliability rating.</p>
  <div class="panel reveal">
    <table><thead><tr><th>ID</th><th>Source</th><th>Type</th><th>Reliability</th><th>First observed</th><th>Last observed</th><th>Status</th></tr></thead><tbody>
      ${SOURCES.map(s=>`<tr onmouseenter="hoverSound()"><td class="mono">${s.id}</td><td>${s.name}</td><td class="dim">${s.type}</td><td><span class="badge ${relBadge(s.reliability)}">RATING ${s.reliability}</span></td><td class="mono dim">${s.firstObserved}</td><td class="mono dim">${s.lastObserved}</td><td><span class="badge ${srcStatusBadge(s.status)}">${s.status.toUpperCase()}</span></td></tr>`).join("")}
    </tbody></table>
  </div>
  <div class="panel reveal">
    <h2>Reliability scale</h2>
    <div class="grid" style="grid-template-columns:60px 1fr;row-gap:8px">
      <div><span class="badge b-teal">A</span></div><div class="dim" style="font-size:12.5px">Consistently reliable — corroborated across multiple independent collection cycles.</div>
      <div><span class="badge b-blue">B</span></div><div class="dim" style="font-size:12.5px">Usually reliable — occasional inconsistency, still suitable for correlation.</div>
      <div><span class="badge b-amber">C</span></div><div class="dim" style="font-size:12.5px">Limited history or corroboration — used with caution.</div>
    </div>
  </div>`;
}

const PAGES={overview:overviewPage,flagged:flaggedPage,actors:actorsPage,search:searchPage,graph:graphPage,timeline:timelinePage,trends:trendsPage,pipelines:pipelinesPage,ai:aiPage,compare:comparePage,infra:infrastructurePage,alerts:alertsPage,sources:sourcesPage};
const LABELS={overview:"Overview",flagged:"Flagged Content",actors:"Actors",search:"Search",graph:"Graph",timeline:"Timeline",trends:"Trends",pipelines:"Pipelines",ai:"AI Prediction",compare:"Compare",infra:"Infrastructure",alerts:"Alerts",sources:"Sources"};
function render(active){
  document.getElementById("profile").style.display="none";
  document.getElementById("nav").innerHTML=Object.keys(PAGES).map(k=>`<button data-k="${k}" class="${k===active?'active':''}" onmouseenter="hoverSound()" onclick="clickSound();render('${k}')">${LABELS[k]}</button>`).join("");
  document.getElementById("pages").innerHTML=`<div class="page active">${PAGES[active]()}</div>`;
  observeReveals();
  document.querySelectorAll(".bar i[data-w]").forEach(b=>requestAnimationFrame(()=>b.style.width=b.dataset.w+"%"));
  animateCounts();
  if(active==="compare") runCompare(true);
}
function animateCounts(){
  document.querySelectorAll(".n[data-count]").forEach(el=>{
    const target=parseInt(el.dataset.count,10)||0; const dur=700; const start=performance.now();
    function step(now){
      const p=Math.min(1,(now-start)/dur); const eased=1-Math.pow(1-p,3);
      el.textContent=Math.round(eased*target).toLocaleString();
      if(p<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}
render("overview");
/* ---- default/suggested options for the top search box ---- */
const SEARCH_DEFAULT=ACTORS[0].handles[0];
document.getElementById("searchOptions").innerHTML=ACTORS.map(a=>`<option value="${a.handles[0]}">`).join("");
const searchEl=document.getElementById("search");
searchEl.setAttribute("placeholder",`Search a handle, actor ID, or any name… (e.g. ${SEARCH_DEFAULT})`);
searchEl.addEventListener("keydown",e=>{
  if(e.key==="Enter"){ const q=e.target.value.trim()||SEARCH_DEFAULT; e.target.value=q; showProfile(q); }
});
