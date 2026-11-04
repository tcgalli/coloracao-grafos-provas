/* coloracao.js — ALGORITMOS DE COLORAÇÃO (implementação própria, sem biblioteca de grafos).
   greedy + ordens (entrada, aleatória, Welsh-Powell, Smallest-Last), DSATUR, backtracking exato e despacho runAlgo. */

/* ===== ALGORITMOS DE COLORAÇÃO (implementação própria) ===== */
// Guloso sequencial: cada vértice recebe a menor cor ausente na vizinhança já colorida.
function greedy(adj,order,kmax){const col=new Array(adj.length).fill(-1);
 for(const v of order){const used=new Set();for(const u of adj[v])if(col[u]>=0)used.add(col[u]);
  let c=0;while(used.has(c))c++;if(kmax&&c>=kmax)continue;col[v]=c}return col}
const ordIn=n=>[...Array(n).keys()];
function ordRand(n,seed){const r=rng(seed),a=ordIn(n);for(let i=n-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const ordWP=adj=>ordIn(adj.length).sort((a,b)=>adj[b].size-adj[a].size);
function ordSL(adj){const n=adj.length,deg=adj.map(s=>s.size),rem=new Array(n).fill(false),out=[];
 for(let i=0;i<n;i++){let b=-1;for(let v=0;v<n;v++)if(!rem[v]&&(b<0||deg[v]<deg[b]))b=v;
  rem[b]=true;out.push(b);for(const u of adj[b])if(!rem[u])deg[u]--}return out.reverse()}
// DSATUR: escolhe dinamicamente o vértice com maior saturação (cores distintas na vizinhança).
function dsatur(adj,kmax){const n=adj.length,col=new Array(n).fill(-1),done=new Array(n).fill(false),sat=adj.map(()=>new Set());
 for(let i=0;i<n;i++){let b=-1;
  for(let v=0;v<n;v++)if(!done[v]&&(b<0||sat[v].size>sat[b].size||(sat[v].size===sat[b].size&&adj[v].size>adj[b].size)))b=v;
  done[b]=true;let c=0;while(sat[b].has(c))c++;if(kmax&&c>=kmax)continue;
  col[b]=c;for(const u of adj[b])sat[u].add(c)}return col}
// Backtracking exato (DSATUR + quebra de simetria): existe k-coloração? true/false/null(limite estourado)
function tryK(adj,k,limit=200000){const n=adj.length,col=new Array(n).fill(-1),cnt=adj.map(()=>new Int16Array(k)),dist=new Int16Array(n);let nodes=0;
 function rec(done,mx){if(done===n)return true;if(++nodes>limit)throw 0;
  let b=-1;for(let v=0;v<n;v++)if(col[v]<0&&(b<0||dist[v]>dist[b]||(dist[v]===dist[b]&&adj[v].size>adj[b].size)))b=v;
  for(let c=0;c<=Math.min(mx+1,k-1);c++){if(cnt[b][c])continue;col[b]=c;
   for(const u of adj[b])if(cnt[u][c]++===0)dist[u]++;
   if(rec(done+1,Math.max(mx,c)))return true;
   col[b]=-1;for(const u of adj[b])if(--cnt[u][c]===0)dist[u]--}
  return false}
 try{return rec(0,-1)?col.slice():false}catch(e){return null}}
function exact(adj){let best=dsatur(adj),opt=false;
 for(;;){const k=ncol(best)-1;if(k<1){opt=true;break}const r=tryK(adj,k);if(Array.isArray(r))best=r;else{opt=r===false;break}}
 return{col:best,opt}}
const ncol=c=>c.length?Math.max(-1,...c)+1:0;

const NAMES={in:"Guloso (entrada)",rand:"Guloso (aleatória)",wp:"Guloso (Welsh-Powell)",sl:"Guloso (Smallest-Last)",dsatur:"DSATUR",exact:"Exato (backtracking)"};
function runAlgo(a,adj,kmax,seed){const t=performance.now(),n=adj.length;let col,opt=null;
 if(a==="in")col=greedy(adj,ordIn(n),kmax);else if(a==="rand")col=greedy(adj,ordRand(n,seed),kmax);
 else if(a==="wp")col=greedy(adj,ordWP(adj),kmax);else if(a==="sl")col=greedy(adj,ordSL(adj),kmax);
 else if(a==="dsatur")col=dsatur(adj,kmax);
 else{if(kmax){const r=tryK(adj,kmax);col=Array.isArray(r)?r:new Array(n).fill(-1);opt=r===false?"sem solução com k":null}else{const r=exact(adj);col=r.col;opt=r.opt?"ótimo provado":"limite atingido"}}
 return{a,col,ms:performance.now()-t,opt,v:validate(adj,col)}}
