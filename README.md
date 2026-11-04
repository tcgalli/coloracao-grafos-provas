# Alocação de Horários de Provas por Coloração de Grafos

Aplicação web para resolver o problema de **alocação de horários de provas** (*exam timetabling*) usando **coloração de grafos**. O trabalho foi desenvolvido para a disciplina de Teoria dos Grafos.

## Integrantes

| Nome | RA / Matrícula | Contribuição principal |
|---|---|---|
| João Matheus Veríssimo Francisco | 23110331 | Interface, visualização e geradores de instância |
| Pedro Marques Correa Domingues | 23110137 | Testes, coleta de dados, experimentos |
| Thiago de Carvalho Galli | 23110635 | Implementação dos algoritmos de coloração e do validador e relatório |

> Preencham a tabela antes da entrega. O histórico de commits também é usado para verificar a participação de cada integrante.

## O problema

Em uma universidade, duas provas não podem ocorrer no mesmo horário se algum aluno estiver matriculado nas duas. Com centenas de disciplinas e milhares de alunos, montar um calendário com poucos períodos de prova à mão é inviável. Menos períodos significa um calendário mais curto.

## Modelagem em grafo

| Elemento | Significado |
|---|---|
| Vértice | Uma prova (disciplina) |
| Aresta | Existe ao menos um aluno matriculado nas duas provas (conflito) |
| Tipo do grafo | Não direcionado, não ponderado |
| Cor | Horário (*slot*) da prova |
| Restrição | Vértices adjacentes não podem ter a mesma cor (coloração própria) |
| Objetivo | Minimizar o número de cores, ou seja, o número de horários |

**Hipóteses adotadas**
- Todo aluno deve poder fazer todas as suas provas.
- A capacidade das salas é ignorada.
- Cada prova ocupa um único horário.
- Cada aluno matriculado em *k* provas gera uma clique entre elas.

## Algoritmos implementados

Todos os algoritmos estão escritos no próprio código, **sem biblioteca de grafos ou de coloração**.

| Estratégia | Descrição | Complexidade |
|---|---|---|
| Guloso, ordem de entrada | Cada vértice recebe a menor cor não usada pelos vizinhos já coloridos | O(V + E) |
| Guloso, ordem aleatória | Mesma regra, com ordem embaralhada (semente configurável) | O(V + E) |
| Guloso, Welsh-Powell | Ordena os vértices por grau decrescente | O(V log V + E) |
| Guloso, Smallest-Last | Remove repetidamente o vértice de menor grau e colore na ordem inversa | O(V²) na implementação simples |
| DSATUR | Escolhe dinamicamente o vértice com maior grau de saturação (desempate por grau) | O(V²) na implementação simples |
| Exato (backtracking) | Busca o menor número de cores a partir do limite superior do DSATUR. Limitado a **n ≤ 150** | Exponencial |

Propriedades usadas na análise:
- O guloso é sempre válido e usa no máximo Δ + 1 cores, onde Δ é o grau máximo.
- O resultado do guloso depende da ordem dos vértices.
- Determinar o número cromático é NP-difícil, por isso as heurísticas não garantem o ótimo. O método exato serve de referência em instâncias pequenas.

## Funcionalidades

- Exemplos prontos: bipartido "coroa" 20+20 com ordem adversa, K8 completo, ciclo ímpar C9 e grafo sem arestas.
- Geração de grafos aleatórios G(n, p).
- Geração de matrículas sintéticas (provas × alunos) com popularidade enviesada.
- Carregamento de arquivo `.txt`, `.csv` ou `.stu`, em dois formatos:
  - **Matrículas:** uma linha por aluno, com as provas separadas por espaço ou vírgula (formato Carter `.stu`).
  - **Lista de arestas:** uma linha `A B` por aresta.
- Semente aleatória configurável, para reprodutibilidade.
- Limite opcional de cores *k*, para testar a restrição de número máximo de horários.
- Visualização do grafo colorido, com número de vértices, arestas e grau máximo.
- Lista de horários (cores) com as provas de cada um.
- Resultado com número de cores, tempo de execução e validação automática (nenhuma aresta com extremos de mesma cor).
- Comparação de todas as estratégias em uma tabela.
- Testes automáticos, executáveis pela interface e pelo terminal (`node tests/testes.js`).

## Como executar

Não há dependências nem build. É uma página web feita só com HTML, CSS e JavaScript puro, sem bibliotecas externas.

**Opção 1: abrir direto.** Abra o arquivo `index.html` em um navegador moderno (Chrome, Firefox, Edge ou Safari). Não precisa de internet.

**Opção 2: servidor local** (se o navegador bloquear algo ao abrir do disco):

```
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000`.

**Testes automáticos no terminal** (requer Node.js 16 ou superior):

```
node tests/testes.js
```

Os mesmos testes também podem ser executados pelo botão "Rodar testes automáticos" na interface.

## Como usar

1. Em **1. Instância**, escolha um exemplo, gere um grafo ou carregue um arquivo.
2. Em **2. Algoritmo**, escolha a estratégia e, se quiser, informe o limite de cores *k*. Clique em **Executar**.
3. Veja a coloração no grafo, o número de cores, o tempo e a validade.
4. Clique em **Comparar todas as estratégias** para ver a tabela comparativa.
5. Em **3. Verificação**, clique em **Rodar testes automáticos**.

## Dados

| Instância | Origem | Observações |
|---|---|---|
| Exemplos prontos (coroa, K8, C9, sem arestas) | Construídos pelo grupo | Resultado conhecido, usados para verificar a corretude |
| Matrículas sintéticas | Gerador do próprio app (semente 42 por padrão) | Simula matrículas reais; **não são dados reais** |
| Grafos G(n, p) | Gerador do próprio app | Servem para testes de escala e de tempo |
| Benchmark de Carter (Toronto) | Literatura, por exemplo `car-f-92` | Dados reais de exames e matrículas; **baixar e carregar pelo botão de arquivo** |

Download direto: https://people.cs.nott.ac.uk/pszrq/files/Toronto.zip, com as 13 instâncias. O car-f-92.stu deve estar dentro do zip.

**Limitações dos dados:** os dados sintéticos refletem as hipóteses do gerador (3 a 7 provas por aluno, popularidade das disciplinas decrescente). Os benchmarks de Carter são antigos e ignoram capacidade de salas e restrições de professores.

## Casos de teste

O projeto cobre os seguintes tipos de caso:

- **Resultado verificável:** K_n (n cores), bipartido (2 cores), ciclo ímpar (3 cores).
- **Fronteira:** grafo sem arestas, vértice isolado, limite *k* menor que o número cromático.
- **Instâncias de tamanhos diferentes:** exemplos pequenos, matrículas sintéticas de porte médio e grafos grandes, incluindo benchmarks de Carter.
- **Validação:** conferência automática de todas as arestas em cada coloração.

_Incluam no relatório a tabela de resultados (cores e tempo por estratégia e instância), comparando com os melhores valores conhecidos na literatura._

## Estrutura do repositório

```
.
├── index.html            # página principal
├── css/
│   └── estilo.css        # aparência (tema claro e escuro)
├── js/
│   ├── util.js           # seletor do DOM e gerador pseudoaleatório com semente
│   ├── grafo.js          # estrutura do grafo (lista de adjacência)
│   ├── coloracao.js      # ALGORITMOS: guloso e ordens, DSATUR, exato, runAlgo
│   ├── validacao.js      # validador de coloração
│   ├── entrada.js        # geradores, leitor de arquivos (.stu, arestas) e exemplos
│   ├── visualizacao.js   # desenho do grafo, zoom, hover, legenda
│   └── ui.js             # eventos, tabelas e inicialização
├── tests/
│   ├── casos.js          # casos de teste (sem dependência de DOM)
│   └── testes.js         # executa os casos no terminal com Node
├── data/                 # instâncias (ex.: car-f-92.stu) e origem dos dados
├── package.json
└── README.md
```

Os algoritmos de coloração ficam isolados em `js/coloracao.js`, sem dependência da interface.

## Limitações e melhorias

- O método exato é limitado a n ≤ 150, pois a busca é exponencial.
- A capacidade das salas não é modelada.
- Possíveis melhorias: Tabu Search ou busca local para reduzir cores, pesos por número de alunos em comum (conflitos "suaves") e exportação do calendário.

## Declaração de uso de Inteligência Artificial

Foi utilizada uma ferramenta de IA (Claude, da Anthropic) como apoio na definição do problema, na explicação dos algoritmos e na geração inicial do código da aplicação e deste README.


## Referências

- Welsh, D. J. A.; Powell, M. B. An upper bound for the chromatic number of a graph and its application to timetabling problems. *The Computer Journal*, 1967.
- Brélaz, D. New methods to color the vertices of a graph. *Communications of the ACM*, 1979.
- Carter, M. W.; Laporte, G.; Lee, S. Y. Examination timetabling: algorithmic strategies and applications. *Journal of the Operational Research Society*, 1996.
