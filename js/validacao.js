/* validacao.js — verifica se uma coloração é própria (nenhuma aresta com extremos de mesma cor) e se todos os vértices foram coloridos. */

function validate(adj,col){let conf=0,unc=col.filter(c=>c<0).length;
 adj.forEach((s,v)=>{for(const u of s)if(u>v&&col[u]>=0&&col[u]===col[v])conf++});return{conf,unc,ok:conf===0&&unc===0}}
