/* grafo.js — estrutura do grafo: vértices = provas; aresta = ao menos um aluno em comum (não direcionado, não ponderado).
   Representação: lista de adjacência (array de Set). mk(names, edges, label) constrói o grafo. */

function mk(names,edges,label){const adj=names.map(()=>new Set());for(const[a,b]of edges)if(a!==b){adj[a].add(b);adj[b].add(a)}return{names,adj,label}}
const nm=(n,p)=>Array.from({length:n},(_,i)=>p+(i+1));
