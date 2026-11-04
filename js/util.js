/* util.js — utilitários: seletor do DOM e gerador pseudoaleatório com semente (reprodutibilidade). */

const $=id=>document.getElementById(id);
function rng(s){let a=s>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
