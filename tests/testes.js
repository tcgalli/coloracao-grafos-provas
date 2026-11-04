// testes.js — executa os testes no terminal: `node tests/testes.js`
const fs=require("fs"),path=require("path");
const raiz=path.join(__dirname,"..");
const arquivos=["js/util.js","js/grafo.js","js/coloracao.js","js/validacao.js","js/entrada.js","tests/casos.js"];
const codigo=arquivos.map(f=>fs.readFileSync(path.join(raiz,f),"utf8")).join("\n");
const resultados=new Function(codigo+"\nreturn executarTestes();")();
let falhas=0;
for(const [desc,ok] of resultados){console.log((ok?"✔ ":"✘ ")+desc);if(!ok)falhas++}
console.log(`\n${resultados.length-falhas}/${resultados.length} testes passaram`);
process.exit(falhas?1:0);
