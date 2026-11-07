/* Ladder: game logic. Word data lives in js/words.js (loaded first). */

/* ===================== HINT CLUES ===================== */
const CLUES = {
  cord:"a thin rope, like the one on a lamp",card:"you send one on a birthday",ward:"a room in a hospital",
  heal:"what a scraped knee does with time",teal:"a cozy blue-green color",tell:"to share a bedtime story",tall:"the opposite of short",
  wile:"a sneaky little trick",tile:"a square on the bathroom floor",tale:"a story read at bedtime",
  bind:"to tie things together",bond:"a close friendship",bony:"skinny, all elbows and knees",
  load:"something heavy to carry",goad:"to poke or nudge someone along",
  heed:"to listen carefully",head:"the part of you that rests on a pillow",bead:"a tiny ball on a bracelet",
  soil:"dirt in a flower pot",coil:"a spiral, like a spring",coal:"black stuff for a fire",coat:"what you wear when it's chilly",boat:"it floats on water",
  mile:"a long way to walk",male:"the opposite of female",make:"to bake or build",
  woof:"what a dog says",hoof:"a horse's foot",hood:"the top part of a hoodie",mood:"how you're feeling right now",
  damp:"a little bit wet, like a towel",dame:"a fancy lady",dare:"truth or ___?",
  best:"better than all the rest",bent:"not straight anymore",bend:"to curve something",
  beat:"the rhythm of a song",ware:"things for sale, as in silver___",care:"to look after someone",came:"arrived (past tense)",
  slay:"to totally win",slat:"a thin strip of wood in a bed frame",seat:"a place to sit",
  wild:"untamed, like a forest animal",will:"a strong wish to do something",wall:"where you hang a picture",call:"to ring someone on the phone",
  moan:"a sleepy groan",mean:"not very nice",bean:"a jelly___ or a coffee ___",bear:"a cuddly teddy ___",sear:"to sizzle on a hot pan",
  core:"the middle of an apple",sore:"achy after a long day",sort:"to put things in order",
  cold:"chilly, brrr",warm:"cozy, under a blanket",hard:"not soft",card2:""
};
const ORD = ["1st","2nd","3rd","4th","5th","6th"];
const MAX_MOVES = 6, MAX_HINTS = 3, BLANKS = 5;

/* ===================== STATE ===================== */
let S = null, lastIdx = -1, firstGame = true;
const $ = id => document.getElementById(id);
const game=$("game"), scene=$("scene"), rungsEl=$("rungs"), cat=$("cat"), input=$("word"), bed=$("bed");

function pickPuzzle(){
  if(firstGame){ firstGame=false; lastIdx=0; return PUZZLES[0]; }
  let i; do{ i=Math.floor(Math.random()*PUZZLES.length);}while(i===lastIdx && PUZZLES.length>1);
  lastIdx=i; return PUZZLES[i];
}
function newGame(same){
  const sol = same && S ? S.sol : pickPuzzle();
  S = {sol, start:sol[0], target:sol[sol.length-1], path:[sol[0]], moves:0, hints:0, over:false, busy:false};
  closeAll(); $("winScreen").classList.remove("on"); $("loseScreen").classList.remove("on");
  bed.classList.remove("sleeping"); cat.style.opacity=1; cat.style.transform="";
  input.value=""; input.disabled=false; $("submitBtn").disabled=false;
  buildRungs(); updateStats();
  requestAnimationFrame(()=>{ placeCat(0,false); });
  setTimeout(()=>placeCat(0,false),250);
}

/* ===================== LADDER ===================== */
function rungHTML(word, prev){
  return [...word.toUpperCase()].map((c,i)=>`<span class="ltr${prev&&prev[i]!==word[i]?" changed":""}">${c}</span>`).join("");
}
function buildRungs(){
  rungsEl.innerHTML="";
  const top=document.createElement("div"); top.className="rung dest"; top.innerHTML=`<span>${S.target.toUpperCase()}</span>`; rungsEl.appendChild(top);
  for(let i=BLANKS;i>=1;i--){ const r=document.createElement("div"); r.className="rung"; r.dataset.i=i; rungsEl.appendChild(r);}
  const st=document.createElement("div"); st.className="rung start"; st.innerHTML=`<span>${S.start.toUpperCase()}</span>`; rungsEl.appendChild(st);
}
// rung index: 0 = start, 1..5 = blanks, 6 = destination
function rungEl(i){ const kids=rungsEl.children; return kids[kids.length-1-i]; }
function placeCat(i, hop){
  const r=rungEl(i).getBoundingClientRect(), s=scene.getBoundingClientRect();
  const w=cat.offsetWidth, h=cat.offsetHeight;
  let left=r.left-s.left-w+12; if(left< -6) left=-6;
  cat.style.left=left+"px"; cat.style.top=(r.bottom-s.top-h+6)+"px";
  if(hop){ cat.classList.remove("hop"); void cat.offsetWidth; cat.classList.add("hop"); }
}
const wait = ms => new Promise(r=>setTimeout(r,ms));
async function climbTo(from,to){
  for(let i=from+1;i<=to;i++){ placeCat(i,true); await wait(i===to?380:260); }
}

/* ===================== VALIDATION ===================== */
function diff(a,b){ let n=0; for(let i=0;i<a.length;i++) if(a[i]!==b[i]) n++; return n; }
async function submit(e){
  e&&e.preventDefault();
  if(S.over||S.busy) return;
  const raw=input.value.trim().toLowerCase();
  if(!raw){ input.focus(); return; }
  const cur=S.path[S.path.length-1];
  let err=null;
  if(!/^[a-z]+$/.test(raw)) err=["Letters only, please!","No numbers, spaces or symbols."];
  else if(raw.length!==cur.length) err=["Keep the same number of letters!",`Every word here has ${cur.length} letters.`];
  else if(raw===cur) err=["That's where you are now!","Change one letter to climb up."];
  else if(S.path.includes(raw)) err=["You've already used that word.","Try a different one."];
  else if(diff(raw,cur)!==1) err=["Only one letter can change!",`Swap just one letter in ${cur.toUpperCase()}. No rearranging.`];
  else if(!WORDS.has(raw)) err=["Oops! That's not a valid word.","Please try another word."];
  if(err){ return invalid(err); }

  S.busy=true; S.path.push(raw); S.moves++; input.value=""; updateStats();
  if(raw===S.target){
    S.over=true; input.disabled=true; $("submitBtn").disabled=true;
    const top=rungEl(BLANKS+1); top.innerHTML=rungHTML(raw,cur); top.classList.add("reached");
    announce(`${raw.toUpperCase()}! You reached the top!`);
    await climbTo(S.moves-1>=BLANKS?BLANKS:S.moves-1, BLANKS+1);
    await toBed(); return;
  }
  if(S.moves>=MAX_MOVES){
    S.over=true; input.disabled=true; $("submitBtn").disabled=true;
    cat.classList.remove("hop"); cat.classList.add("sad");
    announce("Out of moves.");
    setTimeout(()=>{cat.classList.remove("sad"); showLose();},1100); return;
  }
  const r=rungEl(S.moves); r.classList.add("filled"); r.innerHTML=`<span>${rungHTML(raw,cur)}</span>`;
  announce(`${raw.toUpperCase()}. ${MAX_MOVES-S.moves} moves left.`);
  await wait(120); placeCat(S.moves,true); await wait(360);
  S.busy=false; input.focus();
}
function invalid([t,sub]){
  input.classList.remove("shake"); void input.offsetWidth; input.classList.add("shake");
  $("toastTitle").textContent=t; $("toastSub").textContent=sub;
  open("toast"); setTimeout(()=>$("toastOk").focus(),60);
}
async function toBed(){
  const b=bed.getBoundingClientRect(), s=scene.getBoundingClientRect(), k=b.width/320;
  cat.style.left=(b.left-s.left+200*k)+"px"; cat.style.top=(b.top-s.top-10*k)+"px";
  cat.classList.remove("hop"); void cat.offsetWidth; cat.classList.add("hop");
  await wait(380);
  cat.style.opacity=0; cat.style.transform="scale(.7) translateY(10px)";
  bed.classList.add("sleeping");
  await wait(1900);
  showWin();
}
function updateStats(){
  const left=MAX_MOVES-S.moves;
  $("movesLeft").textContent=left; $("movesWord").textContent=left===1?"move":"moves";
  const h=MAX_HINTS-S.hints;
  $("hintsLeft").textContent = h? `${h} hint${h===1?"":"s"} left` : "No hints left";
  $("hintLabel").textContent = h? "Need a hint?" : "All out!";
  $("hintBtn").disabled = !h || S.over;
  $("hintBtn").classList.toggle("used-up",!h);
}

/* ===================== HINTS ===================== */
function neighbors(w,set){
  const out=[]; for(let i=0;i<w.length;i++) for(let c=97;c<123;c++){ const ch=String.fromCharCode(c); if(ch===w[i]) continue; const x=w.slice(0,i)+ch+w.slice(i+1); if(set.has(x)) out.push(x);} return out;
}
function shortest(from,to,set,avoid){
  const prev=new Map([[from,null]]), q=[from];
  while(q.length){ const w=q.shift(); if(w===to){ const p=[]; let x=w; while(x){p.push(x); x=prev.get(x);} return p.reverse(); }
    for(const n of neighbors(w,set)){ if(!prev.has(n)&&!avoid.has(n)){ prev.set(n,w); q.push(n);} } }
  return null;
}
function nextStep(){
  const cur=S.path[S.path.length-1], used=new Set(S.path);
  const i=S.sol.indexOf(cur);
  if(i>=0 && S.sol.slice(i+1).every(w=>!used.has(w))) return S.sol[i+1];
  const pool=new Set([...COMMON,...S.sol]); NO_HINT.forEach(w=>pool.delete(w)); pool.add(S.target); pool.add(cur);
  used.delete(cur);
  let p=shortest(cur,S.target,pool,used) || shortest(cur,S.target,WORDS,used);
  return p&&p.length>1? p[1] : null;
}
function showHint(){
  if(S.hints>=MAX_HINTS||S.over) return;
  const cur=S.path[S.path.length-1], nx=nextStep();
  S.hints++; const lvl=S.hints;
  let html;
  if(!nx){ html="This ladder is a real tangle! Try a brand-new letter somewhere fresh."; }
  else{
    const pos=[...cur].findIndex((c,i)=>c!==nx[i]);
    if(lvl===1){
      const where = pos===0 ? "keeps the same ending, but starts with a different letter" : pos===cur.length-1 ? "shares the same starting letters, but has a different ending" : "keeps the first and last letters, but changes one in the middle";
      html = CLUES[nx] ? `Try a word that ${where}.<br>Think: <i>${CLUES[nx]}</i>.` : `Try a word that ${where}!`;
    } else if(lvl===2){
      html=`Try changing the <b>${ORD[pos]} letter</b> of ${cur.toUpperCase()}, the “${cur[pos].toUpperCase()}”.`;
    } else {
      const pat=[...cur].map((c,i)=>i===pos?nx[i].toUpperCase():"_").join(" ");
      html=`Here's a letter from a good next word: put ${/[aefhilmnorsx]/.test(nx[pos])?"an":"a"} “${nx[pos].toUpperCase()}” in the ${ORD[pos]} spot.<br><span class="pattern">${pat}</span>`;
    }
  }
  $("hintTitle").textContent=`Hint #${lvl}`; $("hintText").innerHTML=html;
  $("hintOwn").hidden = lvl<MAX_HINTS;
  const left=MAX_HINTS-lvl; $("hintPill").textContent = left? `${left} hint${left===1?"":"s"} left` : "No hints left";
  updateStats(); open("hintModal");
}

/* ===================== MODALS ===================== */
let openId=null;
function open(id){ closeAll(true); openId=id; $("dim").classList.add("on"); $(id).classList.add("on"); }
function closeAll(silent){
  ["hintModal","toast","rulesModal"].forEach(id=>$(id).classList.remove("on")); $("dim").classList.remove("on");
  const was=openId; openId=null;
  if(!silent && was && S && !S.over){ input.focus(); if(was==="toast") input.select(); }
}
document.addEventListener("click",e=>{ if(e.target.closest("[data-close]")||e.target.id==="dim") closeAll(); });
document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&openId) closeAll(); });
$("toastOk").addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); closeAll(); }});
input.addEventListener("keydown",e=>{ if(e.key==="Enter"&&openId){ e.preventDefault(); closeAll(); }});

/* ===================== END SCREENS ===================== */
function showWin(){
  $("wMoves").textContent=`${S.moves} / ${MAX_MOVES}`; $("wHints").textContent=`${S.hints} / ${MAX_HINTS}`;
  $("wPath").textContent="Your climb: "+S.path.map(w=>w.toUpperCase()).join(" → ");
  $("winScreen").classList.add("on"); $("playAgain").focus();
}
function showLose(){
  const mr=$("miniRungs"); mr.innerHTML="";
  [...S.sol].reverse().forEach((w,i,a)=>{ const d=document.createElement("div"); d.className="rung"+(i===0?" dest":i===a.length-1?" start":""); d.textContent=w.toUpperCase(); mr.appendChild(d); });
  $("solText").textContent=S.sol.map(w=>w.toUpperCase()).join(" → ");
  $("lPath").textContent="Your climb: "+S.path.map(w=>w.toUpperCase()).join(" → ");
  $("loseScreen").classList.add("on"); $("tryAgain").focus();
}
function announce(t){ $("live").textContent=t; }

/* ===================== DECORATION ===================== */
function decorate(svg, items){
  svg.innerHTML = items.map(([t,x,y,s,o,cls])=>`<use href="#i-${t}" x="${x}%" y="${y}%" width="${s}" height="${s}" opacity="${o??1}" class="${cls||""}" style="transform-box:fill-box;transform-origin:center;animation-delay:${(x*37%30)/10}s"/>`).join("");
}
function wallDeco(){
  const svg=$("wallDeco");
  decorate(svg,[["star",88,22,18,.9,"twinkle"],["star",93,52,16,.8,"twinkle"],["star",30,62,14,.7,"twinkle"],["spark",34,12,14,.8,"twinkle"],["star",84,72,15,.8,"twinkle"],["cloud",24,4,70,.9],["cloud",80,70,60,.8],["spark",66,4,12,.8,"twinkle"]]);
  // window w/ moon, lamp, books, string lights
  svg.insertAdjacentHTML("beforeend",`
   <g class="hide-sm" opacity=".9">
    <svg x="88%" y="30%" width="40" height="56" overflow="visible"><rect x="0" y="0" width="34" height="50" rx="5" fill="#9fb0e4" stroke="#7d8fd0" stroke-width="2"/><path d="M20 15a8 8 0 1 0 6 13 9 9 0 0 1-6-13z" fill="#f9e7b0"/><circle cx="9" cy="36" r="1.4" fill="#fff"/><circle cx="11" cy="12" r="1" fill="#fff"/></svg>
    <svg x="0" y="62%" width="140" height="160" overflow="visible">
      <path d="M34 4h40l10 40H24z" fill="#fcefd2" stroke="#e5cfa6" stroke-width="2" stroke-linejoin="round"/>
      <rect x="51" y="44" width="6" height="40" fill="#e2c49f"/><ellipse cx="54" cy="86" rx="20" ry="5" fill="#e2c49f"/>
      <rect x="-20" y="90" width="150" height="70" rx="8" fill="#f6e6d2" stroke="#ead8c2" stroke-width="2"/>
      <rect x="62" y="56" width="10" height="34" rx="2" fill="#a9b7e6"/><rect x="73" y="50" width="11" height="40" rx="2" fill="#f2b9b4"/><rect x="85" y="58" width="9" height="32" rx="2" fill="#c9b7e2"/><rect x="95" y="62" width="12" height="28" rx="2" fill="#f2d39c"/>
    </svg>
    <path d="M60 520 L640 520" stroke="#efe1cf" stroke-width="2"/>
   </g>`);
}
function screenDeco(id){
  const it=[]; const spots=[[4,10],[94,8],[8,30],[90,28],[3,52],[95,50],[10,72],[88,74],[6,90],[92,92],[20,20],[78,18],[16,86],[82,86]];
  spots.forEach(([x,y],i)=>it.push([i%3===0?"spark":"star",x,y,14+(i*7%12),.85,"twinkle"]));
  it.push(["cloud",-4,40,90,.9],["cloud",84,58,90,.9],["cloud",70,2,70,.7]);
  decorate($(id),it);
}

/* ===================== WIRING ===================== */
$("form").addEventListener("submit",submit);
$("hintBtn").addEventListener("click",showHint);
$("rulesBtn").addEventListener("click",()=>open("rulesModal"));
$("restartBtn").addEventListener("click",()=>newGame(true));
$("playAgain").addEventListener("click",()=>newGame(false));
$("tryAgain").addEventListener("click",()=>newGame(false));
input.addEventListener("input",()=>{ input.value=input.value.replace(/[^a-zA-Z]/g,""); });
window.addEventListener("resize",()=>{ if(S && !S.over) placeCat(Math.min(S.moves,BLANKS),false); });
wallDeco(); screenDeco("winDeco"); screenDeco("loseDeco");
newGame(false);
document.fonts && document.fonts.ready.then(()=>{ if(!S.over) placeCat(Math.min(S.moves,BLANKS),false); });
