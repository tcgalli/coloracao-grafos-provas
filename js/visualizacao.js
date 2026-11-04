/* visualizacao.js — desenho do grafo em canvas: layout de forças, visão agrupada por horário, zoom/arraste, hover, legenda. */

let G=null,POS=null,CUR=null;
const hue=c=>c<0?"#888":`hsl(${(c*137.5)%360},65%,52%)`;
let VIEW="auto",EFF="force",Z={k:1,x:0,y:0},HOV=-1,SELC=-1,POSF=null,CW=0,CH=0,NE=0,DM=1,CL=[],CONF=[],DRAG=null;
function circle(n){return Array.from({length:n},(_,i)=>[.5+.46*Math.cos(2*Math.PI*i/n),.5+.46*Math.sin(2*Math.PI*i/n)])}
function layout(adj){const n=adj.length,r=rng(7),P=Array.from({length:n},()=>[r(),r()]),k=Math.sqrt(1/Math.max(n,1));let t=.1;
 for(let it=0;it<120;it++){const D=P.map(()=>[0,0]);
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){let dx=P[i][0]-P[j][0],dy=P[i][1]-P[j][1],d=Math.hypot(dx,dy)||1e-3,f=k*k/d;dx/=d;dy/=d;D[i][0]+=dx*f;D[i][1]+=dy*f;D[j][0]-=dx*f;D[j][1]-=dy*f}
  for(let i=0;i<n;i++)for(const j of adj[i])if(j>i){let dx=P[i][0]-P[j][0],dy=P[i][1]-P[j][1],d=Math.hypot(dx,dy)||1e-3,f=d*d/k;dx/=d;dy/=d;D[i][0]-=dx*f;D[i][1]-=dy*f;D[j][0]+=dx*f;D[j][1]+=dy*f}
  for(let i=0;i<n;i++){const d=Math.hypot(D[i][0],D[i][1])||1e-3,m=Math.min(d,t);P[i][0]+=D[i][0]/d*m;P[i][1]+=D[i][1]/d*m}t*=.96}
 const xs=P.map(p=>p[0]),ys=P.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
 return P.map(p=>[.03+.94*(p[0]-x0)/((x1-x0)||1),.03+.94*(p[1]-y0)/((y1-y0)||1)])}
function groupPos(col){const n=col.length,k=ncol(col),g=Array.from({length:k},()=>[]),un=[];
 col.forEach((c,v)=>{if(c>=0)g[c].push(v);else un.push(v)});if(un.length)g.push(un);
 const m=g.length,cols=Math.max(1,Math.ceil(Math.sqrt(m*CW/CH))),rows=Math.ceil(m/cols),cw=CW/cols,ch=CH/rows,mx=Math.max(1,...g.map(a=>a.length)),P=new Array(n);CL=[];
 g.forEach((a,i)=>{const cx=(i%cols+.5)*cw,cy=(Math.floor(i/cols)+.5)*ch,R=Math.max(6,.4*Math.min(cw,ch)*Math.max(.3,Math.sqrt(a.length/mx)));
  CL.push({x:cx/CW,y:(cy-R-5)/CH,t:(i<k?"Horário "+(i+1):"Sem cor")+" ("+a.length+")"});
  a.forEach((v,j)=>{const r=R*Math.sqrt((j+.5)/a.length),t=j*2.39996;P[v]=[(cx+r*Math.cos(t))/CW,(cy+r*Math.sin(t))/CH]})});return P}
const sp=v=>[POS[v][0]*CW*Z.k+Z.x,POS[v][1]*CH*Z.k+Z.y];
const rad=v=>Math.max(2.5,Math.min(10,170/Math.sqrt(G.adj.length)))*(.8+.5*G.adj[v].size/DM)*Math.sqrt(Z.k);
function legend(){const el=$("legend");if(!CUR){el.innerHTML="";return}const k=ncol(CUR.col),cnt=Array(k).fill(0);CUR.col.forEach(c=>{if(c>=0)cnt[c]++});
 el.innerHTML=cnt.map((c,i)=>`<span class="lg${SELC===i?" on":""}" data-c="${i}"><i style="background:${hue(i)}"></i>${i+1}<small>${c}</small></span>`).join("");
 el.onclick=e=>{const t=e.target.closest(".lg");if(!t)return;const c=+t.dataset.c;SELC=SELC===c?-1:c;legend();paint()}}
function draw(){const cv=$("cv"),r=cv.getBoundingClientRect(),dpr=devicePixelRatio||1,n=G.adj.length;CW=r.width;CH=r.height;cv.width=CW*dpr;cv.height=CH*dpr;
 NE=G.adj.reduce((s,a)=>s+a.size,0)/2;DM=Math.max(1,...G.adj.map(s=>s.size));
 EFF=VIEW==="auto"?(CUR&&n>150?"groups":"force"):VIEW;if(EFF==="groups"&&!CUR)EFF="force";
 CL=[];POS=EFF==="groups"?groupPos(CUR.col):POSF;Z={k:1,x:0,y:0};HOV=-1;
 CONF=[];if(CUR)G.adj.forEach((s,v)=>{for(const u of s)if(u>v&&CUR.col[v]>=0&&CUR.col[v]===CUR.col[u])CONF.push([v,u])});
 legend();paint();
 $("vnote").textContent=(EFF==="groups"?"Cada agrupamento é um horário: numa solução válida não há arestas dentro de um grupo. ":(n>600?"Layout circular (n > 600): execute um algoritmo e use \"Agrupado por horário\". ":"Layout de forças. "))+"Passe o mouse num vértice para ver seus vizinhos (azul). Arestas vermelhas = conflitos. Cinza = sem cor."}
function paint(){const cv=$("cv"),x=cv.getContext("2d"),dpr=devicePixelRatio||1,n=G.adj.length,col=CUR?CUR.col:null;
 x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,CW,CH);x.globalAlpha=1;
 const cs=getComputedStyle(document.documentElement),tx=getComputedStyle(document.body).color,ac=cs.getPropertyValue("--ac").trim()||"#2563eb";
 const act=v=>SELC<0||(col&&col[v]===SELC),hn=HOV>=0?G.adj[HOV]:null;
 const seg=(v,u,st,lw,al)=>{const a=sp(v),b=sp(u);x.globalAlpha=al;x.strokeStyle=st;x.lineWidth=lw;x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.stroke()};
 const base=EFF==="groups"?0:NE<=4000?.28:NE<=20000?.07:0;
 if(base>0)G.adj.forEach((s,v)=>{for(const u of s)if(u>v)seg(v,u,"rgb(128,134,150)",1,(SELC<0||(act(v)&&act(u)))?base:base*.2)});
 if(hn)for(const u of hn)seg(HOV,u,ac,1.6,.85);
 for(const[v,u]of CONF)seg(v,u,"#e33",2.2,1);
 for(let v=0;v<n;v++){const[px,py]=sp(v);if(px<-20||py<-20||px>CW+20||py>CH+20)continue;
  const dim=(SELC>=0&&!act(v))||(hn&&v!==HOV&&!hn.has(v));x.globalAlpha=dim?.15:1;
  x.fillStyle=col?hue(col[v]):"#8a93a6";x.beginPath();x.arc(px,py,rad(v),0,7);x.fill();
  if(v===HOV||(hn&&hn.has(v))){x.strokeStyle=tx;x.lineWidth=v===HOV?2:1;x.stroke()}
  if(!dim&&(n<=60||Z.k>=3||v===HOV||(hn&&hn.has(v)&&n<=300))){x.globalAlpha=1;x.fillStyle=tx;x.font="10px system-ui";x.textAlign="center";x.fillText(G.names[v],px,py+rad(v)+11)}}
 x.globalAlpha=1;if(EFF==="groups"){x.fillStyle=tx;x.font="bold 12px system-ui";x.textAlign="center";for(const c of CL)x.fillText(c.t,c.x*CW*Z.k+Z.x,c.y*CH*Z.k+Z.y)}}
function hit(mx,my){let b=-1,bd=1e9;for(let v=0;v<G.adj.length;v++){const[px,py]=sp(v),d=Math.hypot(px-mx,py-my);if(d<bd){bd=d;b=v}}return b>=0&&bd<=Math.max(8,rad(b)+3)?b:-1}
(function(){const cv=$("cv"),tip=$("tip"),pos=e=>{const r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};
 cv.onwheel=e=>{e.preventDefault();if(!G)return;const[mx,my]=pos(e),nk=Math.max(1,Math.min(40,Z.k*(e.deltaY<0?1.2:1/1.2))),q=nk/Z.k;Z.x=mx-(mx-Z.x)*q;Z.y=my-(my-Z.y)*q;Z.k=nk;if(nk===1){Z.x=0;Z.y=0}paint()};
 cv.onpointerdown=e=>{DRAG={x:e.clientX,y:e.clientY,zx:Z.x,zy:Z.y,moved:false};cv.setPointerCapture(e.pointerId);cv.style.cursor="grabbing"};
 cv.onpointerup=()=>{DRAG=null;cv.style.cursor="grab"};
 cv.onpointermove=e=>{if(!G)return;if(DRAG){const dx=e.clientX-DRAG.x,dy=e.clientY-DRAG.y;if(Math.abs(dx)+Math.abs(dy)>2)DRAG.moved=true;Z.x=DRAG.zx+dx;Z.y=DRAG.zy+dy;paint();return}
  const[mx,my]=pos(e),v=hit(mx,my);if(v!==HOV){HOV=v;paint()}
  if(v<0){tip.style.display="none";return}
  const nb=[...G.adj[v]].slice(0,6).map(u=>G.names[u]).join(", ")+(G.adj[v].size>6?" …":"");
  tip.innerHTML=`<b>${G.names[v]}</b><br>grau ${G.adj[v].size} · horário ${CUR&&CUR.col[v]>=0?CUR.col[v]+1:"–"}<br><span class="note">vizinhos: ${nb||"nenhum"}</span>`;
  tip.style.display="block";tip.style.left=Math.min(mx+14,CW-240)+"px";tip.style.top=(my+14)+"px"};
 cv.onpointerleave=()=>{HOV=-1;tip.style.display="none";if(G)paint()};
 cv.ondblclick=()=>{Z={k:1,x:0,y:0};paint()};
 $("vmode").onchange=e=>{VIEW=e.target.value;if(G)draw()};
 addEventListener("resize",()=>{if(G)draw()})})();
