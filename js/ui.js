/* Interface de apresentação. Os algoritmos originais permanecem em coloracao.js. */
const kval=()=>{const k=parseInt($("kmax").value,10);return k>0?k:0};
const DESCRIPTIONS={in:"Colore as provas na ordem em que aparecem nos dados.",rand:"Embaralha a ordem das provas antes da coloração.",wp:"Começa pelas provas com mais conflitos (maior grau).",sl:"Remove primeiro os vértices de menor grau e colore na ordem inversa.",dsatur:"Prioriza a prova que já tem mais restrições de horários entre suas vizinhas.",exact:"Busca comprovar o menor número de horários, em instâncias de até 150 provas."};
const CAPTIONS={vazio:"Dez provas independentes, sem conflitos entre elas.",c9:"Nove provas conectadas em ciclo: provas vizinhas não podem coincidir.",k8:"Oito provas: todas estão em conflito com todas as outras.",coroa:"Quarenta provas: a ordem de coloração muda muito a quantidade de horários."};
let enrollmentCount=null;
const $mode=$("bMode");
$mode.onclick=()=>{const on=document.body.classList.toggle("advanced");$mode.textContent=on?"✓ Voltar à apresentação":"⚙ Modo avançado";$mode.setAttribute("aria-expanded",String(on));if(G)draw()};
$("algo").onchange=()=>{$("algoHelp").textContent=DESCRIPTIONS[$("algo").value]};
function escapeText(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function setGraph(g){G=g;CUR=null;SELC=-1;POSF=g.names.length<=600?layout(g.adj):circle(g.names.length);$("cmp").innerHTML='<p class="muted">Clique em “Comparar algoritmos” para ver os resultados deste cenário.</p>';render()}
function render(){const adj=G.adj,n=adj.length,m=adj.reduce((s,a)=>s+a.size,0)/2,D=Math.max(0,...adj.map(s=>s.size));
 let h=`<div class="chip"><b>${n}</b><span>vértices</span></div><div class="chip"><b>${m}</b><span>arestas</span></div><div class="chip"><b>${n>1?(2*m/(n*(n-1))).toFixed(3):0}</b><span>densidade</span></div><div class="chip"><b>${D}</b><span>grau máx (Δ+1=${D+1})</span></div>`;
 if(CUR){const c=ncol(CUR.col);h+=`<div class="chip"><b>${c}</b><span>cores usadas</span></div><div class="chip"><b>${CUR.ms.toFixed(2)} ms</b><span>${escapeText(NAMES[CUR.a])}</span></div><div class="chip"><b class="${CUR.v.ok?'ok':'er'}">${CUR.v.ok?'válida':'inválida'}</b><span>${CUR.v.conf} conflitos, ${CUR.v.unc} sem cor</span></div>`;if(CUR.opt)h+=`<div class="chip"><b>${escapeText(CUR.opt)}</b><span>exato</span></div>`}
 $("stats").innerHTML=h;
 const colors=CUR?ncol(CUR.col):"—",conflicts=CUR?CUR.v.conf:"—";
 $("simpleStats").innerHTML=`<div class="stat-big"><b>${n}</b><span>Provas</span></div>${enrollmentCount!==null?`<div class="stat-big"><b>${enrollmentCount}</b><span>Alunos (linhas)</span></div>`:""}<div class="stat-big"><b>${colors}</b><span>Horários usados</span></div><div class="stat-big ${CUR?(CUR.v.ok?'good':'bad'):''}"><b>${conflicts}</b><span>Conflitos na solução</span></div>`;
 const label=G.label||"Cenário carregado";
 if(!CUR){$("summary").textContent=`${label}. Escolha um algoritmo e clique em “Organizar provas”.` ;$("summary").classList.remove('warning')}
 else if(CUR.v.ok){$("summary").textContent=`✓ ${n} provas distribuídas em ${colors} ${colors===1?'horário':'horários'}, sem conflitos. ${CUR.opt==='ótimo provado'?'O mínimo foi comprovado pelo método exato.':''}`;$("summary").classList.remove('warning')}
 else{$("summary").textContent=`Atenção: solução incompleta ou inválida (${CUR.v.conf} conflitos e ${CUR.v.unc} provas sem horário).`;$("summary").classList.add('warning')}
 draw();slots()}
function slots(){const el=$("slots");if(!CUR){el.innerHTML='<p class="muted">Execute um algoritmo para ver os horários.</p>';return}
 const k=ncol(CUR.col),g=Array.from({length:k},()=>[]);CUR.col.forEach((c,v)=>{if(c>=0)g[c].push(G.names[v])});
 el.innerHTML=g.map((l,c)=>`<div class="slot"><span class="dot" style="background:${hue(c)}"></span><div><b>Horário ${c+1}</b> <small>${l.length} ${l.length===1?'prova':'provas'}</small><small>${l.slice(0,20).map(escapeText).join(', ')}${l.length>20?' …':''}</small></div></div>`).join('') || '<p class="muted">Nenhum horário atribuído.</p>'}
function exec(a){if(a==='exact'&&G.adj.length>150){alert('O método exato é limitado a 150 vértices. Escolha um exemplo menor.');return null}return runAlgo(a,G.adj,kval(),+$("seed").value||1)}
$("bRun").onclick=()=>{const r=exec($("algo").value);if(r){CUR=r;render()}};
$("bCmp").onclick=()=>{const seed=+$("seed").value||1,rows=Object.keys(NAMES).filter(a=>a!=='exact'||G.adj.length<=150).map(a=>runAlgo(a,G.adj,kval(),seed));
 const mx=Math.max(1,...rows.map(r=>ncol(r.col)));const valid=rows.filter(r=>r.v.ok);const min=valid.length?Math.min(...valid.map(r=>ncol(r.col))):null;
 $("cmp").innerHTML=`<table><thead><tr><th>Algoritmo</th><th>Horários</th><th></th><th>Tempo</th><th>Válida?</th></tr></thead><tbody>`+rows.map((r,i)=>`<tr class="cl ${r.v.ok&&ncol(r.col)===min?'best':''}" data-i="${i}" title="Clique para exibir esta distribuição"><td>${escapeText(NAMES[r.a])}${r.v.ok&&ncol(r.col)===min?' ★':''}</td><td><b>${ncol(r.col)}</b></td><td style="min-width:52px"><div class="bar" style="width:${100*ncol(r.col)/mx}%"></div></td><td>${r.ms.toFixed(2)} ms</td><td class="${r.v.ok?'ok':'er'}">${r.v.ok?'Sim':'Não'}</td></tr>`).join('')+`</tbody></table><p class="fine">★ Menor quantidade de horários encontrada nesta comparação (não necessariamente o ótimo matemático).</p>`;
 $("cmp").querySelectorAll('tr.cl').forEach(tr=>tr.onclick=()=>{CUR=rows[Number(tr.dataset.i)];render()});CUR=(valid.length?valid.reduce((a,b)=>ncol(b.col)<ncol(a.col)?b:a):rows[0]);render()};
function markSelected(preset){document.querySelectorAll('[data-preset]').forEach(b=>b.classList.toggle('selected',b.dataset.preset===preset));$("preset").value=preset;$("scenarioCaption").textContent=CAPTIONS[preset]}
function loadPreset(preset){enrollmentCount=null;markSelected(preset);setGraph(PRE[preset]())}
document.querySelectorAll('[data-preset]').forEach(btn=>btn.onclick=()=>{loadPreset(btn.dataset.preset);const r=exec($("algo").value);if(r){CUR=r;render()}});
$("bPreset").onclick=()=>{loadPreset($("preset").value);const r=exec($("algo").value);if(r){CUR=r;render()}};
$("bRand").onclick=()=>{$("scenarioCaption").textContent='Grafo aleatório gerado com os parâmetros escolhidos.';document.querySelectorAll('[data-preset]').forEach(b=>b.classList.remove('selected'));enrollmentCount=null;setGraph(genRandom(Math.min(2000,+$("gn").value||1),+$("gp").value,+$("seed").value||1))};
$("bEnr").onclick=()=>{$("scenarioCaption").textContent='Conflitos criados a partir de matrículas sintéticas.';document.querySelectorAll('[data-preset]').forEach(b=>b.classList.remove('selected'));enrollmentCount=+$("es").value;setGraph(genEnroll(Math.max(2,+$("en").value),+$("es").value,+$("seed").value||1))};
$("bGenerateNumbers").onclick=()=>{
 const provas=Number($("numProvas").value),alunos=Number($("numAlunos").value);
 if(!Number.isInteger(provas)||provas<2||provas>1500||!Number.isInteger(alunos)||alunos<1||alunos>30000){alert('Informe entre 2 e 1.500 provas e entre 1 e 30.000 alunos.');return}
 $("en").value=provas;$("es").value=alunos;
 const seed=Number($("seed").value)||42;
 enrollmentCount=alunos;
 $("scenarioCaption").textContent=`Simulação: ${provas} provas e ${alunos} alunos. Matrículas e conflitos gerados automaticamente.`;
 document.querySelectorAll('[data-preset]').forEach(b=>b.classList.remove('selected'));
 $("importStatus").textContent='';
 setGraph(genEnroll(provas,alunos,seed));
 const r=exec($("algo").value);if(r){CUR=r;render()}
};
function importEnrollments(text,label,format='stu'){
 const lines=text.split(/\r?\n/).map(s=>s.trim()).filter(s=>s&&!/^[#%]/.test(s));
 if(!lines.length)throw Error('O arquivo não contém linhas de matrículas.');
 const g=parse(text,format,label);if(!g.names.length)throw Error('Nenhuma prova identificada.');
 enrollmentCount=format==='stu'?lines.length:null;
 $("scenarioCaption").textContent=label+' — '+g.names.length+' provas'+(enrollmentCount!==null?' e '+enrollmentCount+' alunos':'');
 document.querySelectorAll('[data-preset]').forEach(b=>b.classList.remove('selected'));
 setGraph(g);$("importStatus").textContent='✓ '+g.names.length+' provas identificadas e '+(g.adj.reduce((s,a)=>s+a.size,0)/2)+' pares de provas conflitantes.';
 const r=exec($("algo").value);if(r){CUR=r;render()}
}
function loadFile(f,format='stu'){
 if(!f)return;const rd=new FileReader();rd.onload=()=>{try{importEnrollments(String(rd.result),f.name,format)}catch(err){$("importStatus").textContent='Erro: '+err.message;alert('Erro ao ler matrículas: '+err.message)}};rd.readAsText(f);
}
$("fileMain").onchange=e=>loadFile(e.target.files[0],'stu');
$("file").onchange=e=>loadFile(e.target.files[0],$("fmt").value);
$("bPaste").onclick=()=>{try{importEnrollments($("pasted").value,'Matrículas coladas','stu')}catch(err){alert(err.message)}};
$("bSample").onclick=()=>{
 // Usa o mesmo gerador reprodutível do projeto, mas exibe alunos como dados de entrada.
 const txt=sampleEnrollmentText(60,600,42);
 importEnrollments(txt,'Demonstração sintética (600 alunos, 60 provas)','stu');
};
function sampleEnrollmentText(exams,students,seed){
 const random=rng(seed),out=['# DADOS SINTÉTICOS DE DEMONSTRAÇÃO — 1 linha por aluno'];
 for(let s=0;s<students;s++){
  const chosen=new Set(),count=3+Math.floor(random()*4);
  while(chosen.size<count){const r=random(),i=Math.min(exams-1,Math.floor(Math.pow(r,1.4)*exams));chosen.add('P'+String(i+1).padStart(2,'0'))}
  out.push([...chosen].join(' '));
 }
 return out.join('\n');
}
addEventListener('resize',()=>G&&draw());
$("bTest").onclick=()=>{const out=executarTestes();$("log").innerHTML=out.map(([d,c])=>`<div class="${c?'ok':'er'}">${c?'✔':'✘'} ${escapeText(d)}</div>`).join('')};
$("bGenerateNumbers").click();
