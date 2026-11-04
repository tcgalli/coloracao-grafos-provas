/* entrada.js — instâncias: geradores (G(n,p), matrículas sintéticas), leitor de arquivos (.stu de Carter e lista de arestas) e exemplos prontos. */

/* ===== GERADORES E LEITURA ===== */
function genRandom(n,p,seed){const r=rng(seed),e=[];for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(r()<p)e.push([i,j]);return mk(nm(n,"P"),e,`G(${n}, ${p})`)}
function genEnroll(E,S,seed){const r=rng(seed),w=nm(E,"").map((_,i)=>Math.pow(i+1,-0.6)),cum=[];let t=0;
 for(const x of w){t+=x;cum.push(t)}
 const pick=()=>{const x=r()*t;let lo=0,hi=E-1;while(lo<hi){const m=(lo+hi)>>1;cum[m]<x?lo=m+1:hi=m}return lo};
 const ed=new Set();for(let s=0;s<S;s++){const k=Math.min(E,3+Math.floor(r()*4)),ex=new Set();while(ex.size<k)ex.add(pick());
  const a=[...ex];for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)ed.add(Math.min(a[i],a[j])*E+Math.max(a[i],a[j]))}
 return mk(nm(E,"Prova "),[...ed].map(x=>[Math.floor(x/E),x%E]),`Matrículas sintéticas (${E} provas, ${S} alunos)`)}
function parse(txt,fmt,label){const id=new Map(),names=[],get=s=>{if(!id.has(s)){id.set(s,names.length);names.push(s)}return id.get(s)},ed=[];
 for(const ln of txt.split(/\r?\n/)){const t=ln.trim();if(!t||/^[#%]/.test(t))continue;const tk=t.split(/[\s,;]+/).filter(Boolean).map(get);
  if(fmt==="stu"){for(let i=0;i<tk.length;i++)for(let j=i+1;j<tk.length;j++)ed.push([tk[i],tk[j]])}else for(let i=1;i<tk.length;i++)ed.push([tk[0],tk[i]])}
 return mk(names,ed,label)}
const PRE={
 coroa:()=>{const m=20,ed=[];for(let i=0;i<m;i++)for(let j=0;j<m;j++)if(i!==j)ed.push([2*i,2*j+1]);return mk(Array.from({length:2*m},(_,i)=>(i%2?"B":"A")+(i>>1)),ed,"Coroa 20+20 (ordem de entrada intercalada)")},
 k8:()=>mk(nm(8,"P"),[...Array(8).keys()].flatMap(i=>[...Array(8).keys()].filter(j=>j>i).map(j=>[i,j])),"K8"),
 c9:()=>mk(nm(9,"P"),[...Array(9).keys()].map(i=>[i,(i+1)%9]),"Ciclo C9"),
 vazio:()=>mk(nm(10,"P"),[],"10 provas sem conflitos")};

/* ===== EXECUÇÃO ===== */
