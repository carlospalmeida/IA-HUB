# IA Hub — plano de implementação

## Escopo

Construir um site estático em HTML, CSS e JavaScript puro que funcione como um hub de múltiplas IAs. O usuário poderá selecionar um provedor, conversar, trocar de IA, consultar conversas e futuramente conectar OpenAI, Anthropic, Google Gemini, DeepSeek e Manus por adaptadores independentes.

A implementação será incremental:

1. Estrutura e interface navegável.
2. Armazenamento local de conversas e configurações.
3. Integração com uma IA, escolhida como primeiro adaptador após a base ser validada.
4. Inclusão dos demais provedores, dashboard de consumo, custos, exportações e documentação final.

A primeira entrega não deve prometer chamadas reais às APIs. Ela terá dados de demonstração e interações locais em memória para validar a experiência e a arquitetura visual.

## Decisões técnicas

- **Stack:** HTML semântico, CSS moderno e JavaScript ES Modules.
- **Execução:** servidor estático na porta configurada pelo Preview.
- **Dependências:** nenhuma dependência obrigatória na primeira fase; usar SVG inline e APIs nativas do navegador.
- **Armazenamento:** fase 2; começar com localStorage para preferências e conversas pequenas, evoluindo para IndexedDB caso o volume de mensagens e anexos exija.
- **IA:** fase 3; cada provedor implementará uma interface comum, com chamadas isoladas e erros tratados sem expor segredos em logs.
- **Segredos:** não haverá API keys no código. Como o projeto é estático, a documentação deverá explicar CORS, risco de chaves no navegador e quando um proxy/backend é necessário.
- **Observabilidade:** mensagens terão provedor, modelo, status e metadados preparados para contagem de tokens e custos nas fases futuras.

## Estrutura do projeto

```text
iahub/
├── index.html
├── manus-routes.json
├── plan.md
├── TODO.md
├── README.md
├── LICENSE
├── css/
│   ├── style.css
│   └── themes.css
├── js/
│   ├── app.js
│   ├── chat.js
│   ├── storage.js
│   ├── tokens.js
│   └── providers/
│       ├── provider-interface.js
│       ├── openai.js
│       ├── anthropic.js
│       ├── google.js
│       ├── deepseek.js
│       └── manus.js
├── docs/
│   ├── architecture.md
│   ├── local-development.md
│   ├── providers.md
│   ├── security-privacy.md
│   └── adding-provider.md
└── .github/
    └── workflows/
```

Na fase 1, apenas os arquivos necessários para a interface e o manifesto de rotas serão implementados. Os módulos de armazenamento, tokens e provedores serão adicionados quando suas fases começarem.

## Design

### Alternativas consideradas

- **Terminal editorial:** interface de ferramenta de análise, com alto contraste, bordas técnicas e densidade de informação. Probabilidade de escolha: 0,08.
- **Studio de conversa:** painel escuro refinado, tipografia editorial, navegação lateral e superfícies discretas. Probabilidade de escolha: 0,07.
- **Caderno claro:** workspace luminoso, cartões suaves e foco em leitura longa. Probabilidade de escolha: 0,05.

### Estilo escolhido: Studio de conversa

**Design Movement:** desktop AI workspace contemporâneo, inspirado em ferramentas profissionais de criação e análise, sem copiar uma plataforma específica.

**Core Principles:** hierarquia silenciosa, foco no conteúdo, controles acessíveis e estados sempre compreensíveis.

**Color Philosophy:** base azul-marinho quase preta para reduzir fadiga visual e criar uma sensação de ferramenta confiável; superfícies em azul-petróleo para separar camadas; turquesa luminoso como cor de ação e identidade; tons quentes apenas para alertas.

**Layout Paradigm:** composição em duas colunas assimétricas: uma barra lateral de navegação persistente e um palco de conversa com cabeçalho contextual e compositor fixo. A área principal deve respirar, sem um grid de cards dominando a tela.

**Signature Elements:** indicador de provedor em forma de cápsula, linha vertical de atividade no histórico e compositor com brilho sutil no foco.

**Interaction Philosophy:** ações primárias devem aparecer no contexto da tarefa, com feedback imediato e reversível. A interface nunca deve ocultar qual IA está selecionada.

**Animation:** transições curtas de 160–220 ms para troca de conversas, expansão de painéis e carregamento. Usar animação apenas para indicar estado; respeitar `prefers-reduced-motion`.

**Typography System:** Inter ou sistema sans-serif para interface, com escala compacta e peso forte apenas para títulos; fonte monoespaçada apenas para metadados técnicos e contadores.

**Brand Essence:** um cockpit simples para conversar com diferentes IAs sem perder contexto. Personalidade: claro, confiável e experimental.

**Brand Voice:** títulos diretos e microcopy explicativa. Exemplos: “Escolha um motor para começar” e “A resposta aparecerá aqui, com o provedor identificado”.

**Wordmark & Logo:** marca composta por três pequenos nós conectados formando um balão de conversa, representando seleção, contexto e resposta.

**Signature Brand Color:** `#42E8D0`, um turquesa ativo usado para foco, seleção e estados positivos.

## Fases

### Fase 1 — estrutura e interface

Criar a página principal, sidebar de conversas, seletor de provedor, cabeçalho da conversa, mensagens de demonstração, estados vazio/carregando, composer, botões de ação, painel rápido de configurações e tema claro/escuro. A interface deverá ser responsiva e navegável sem APIs.

### Fase 2 — armazenamento

Adicionar `storage.js` com persistência local versionada. Implementar criar, renomear, abrir, excluir, pesquisar e exportar conversas. Persistir tema, provedor selecionado e configurações não sensíveis. Se houver campo de API key no cliente, alertar claramente sobre o risco e evitar qualquer sincronização ou envio automático.

### Fase 3 — primeira IA

Escolher e implementar um único adaptador após validar CORS, autenticação e política do provedor. Criar `provider-interface.js`, normalizar mensagens, tratar streaming quando suportado e registrar erros sem revelar chaves. A integração deverá ser opt-in e ter modo de demonstração sem chave.

### Fase 4 — demais IAs e documentação

Adicionar OpenAI, Anthropic, Gemini, DeepSeek e Manus conforme os contratos atuais de cada API. Completar tokens, custos, alertas, dashboard, modelos, temperatura, limite de saída, prompt de sistema, nome customizado, documentação de CORS, privacidade, instalação, contribuição e criação de novos adaptadores.

## Critérios de arquitetura

- A UI não conhece detalhes de nenhum provedor.
- O adaptador recebe uma requisição normalizada e retorna eventos normalizados.
- O histórico não depende da resposta de um provedor específico.
- A contagem de tokens e custos é metadado, nunca a única fonte de verdade financeira.
- Nenhuma chave deve ser commitada, incluída em build público ou impressa no console.
- Falhas de CORS, autenticação, limite ou rede aparecem como mensagens compreensíveis.
