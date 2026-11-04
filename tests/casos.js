/* casos.js — casos de teste automáticos, sem dependência de DOM. Usados pelo botão da interface e por `node tests/testes.js`.
   Cobrem: resultado conhecido, grafo vazio/1 vértice, ausência de solução (k < χ), validador, limite Δ+1 e instância grande. */

function executarTestes(){const out=[],T=(d,c)=>out.push([d,c]);
 const k8=PRE.k8().adj,cr=PRE.coroa().adj,c9=PRE.c9().adj,ev=PRE.vazio().adj,rd=genRandom(60,.3,3).adj;
 T("K8: DSATUR usa 8 cores",ncol(dsatur(k8))===8);
 T("K8: exato prova χ=8",(r=>r.opt&&ncol(r.col)===8)(exact(k8)));
 T("Coroa (bipartido): DSATUR = 2 cores",ncol(dsatur(cr))===2);
 T("Coroa: guloso na ordem intercalada usa >2 (ordem importa)",ncol(greedy(cr,ordIn(cr.length)))>2);
 T("Coroa: Smallest-Last = 2 cores",ncol(greedy(cr,ordSL(cr)))===2);
 T("Ciclo ímpar C9: exato = 3",ncol(exact(c9).col)===3);
 T("Ciclo par C8: exato = 2",ncol(exact(mk(nm(8,"P"),[...Array(8).keys()].map(i=>[i,(i+1)%8])).adj).col)===2);
 T("Sem arestas: 1 cor",ncol(dsatur(ev))===1);
 T("Fronteira: grafo vazio (0 vértices) → 0 cores, válido",(c=>ncol(c)===0&&validate([],c).ok)(dsatur([])));
 T("Fronteira: 1 vértice → 1 cor",ncol(dsatur([new Set()]))===1);
 T("Sem solução: K8 com k=7 é impossível (exato)",tryK(k8,7)===false);
 T("Sem solução: guloso com k=7 deixa vértices sem cor",!validate(k8,greedy(k8,ordIn(8),7)).ok);
 T("Validador detecta coloração inválida (tudo cor 0)",!validate(k8,new Array(8).fill(0)).ok);
 let all=true,bound=true;const D=Math.max(...rd.map(s=>s.size));
 for(const a of["in","rand","wp","sl","dsatur"]){const r=runAlgo(a,rd,0,5);all&&=r.v.ok;bound&&=ncol(r.col)<=D+1}
 T("G(60,0.3): todas as heurísticas válidas",all);T("G(60,0.3): cores ≤ Δ+1 (limite do guloso)",bound);
 T("G(60,0.3): exato ≤ DSATUR",ncol(exact(rd).col)<=ncol(dsatur(rd)));
 const big=genEnroll(500,8000,1),rb=runAlgo("dsatur",big.adj,0,1);T(`Instância grande (${big.names.length} provas, ${big.adj.reduce((s,a)=>s+a.size,0)/2} arestas): DSATUR válido em ${rb.ms.toFixed(0)} ms, ${ncol(rb.col)} cores`,rb.v.ok);
 return out}
