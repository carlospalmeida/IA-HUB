# IA Hub — backlog incremental

## Fase 1 — estrutura e interface — concluída

### Interface principal navegável

- [x] Criar um site em HTML, CSS e JavaScript puro que funcione como um hub/agregador de várias IAs.
- [x] Permitir que o usuário escolha qual IA deseja usar antes de enviar a mensagem.
- [x] Permitir trocar de IA dentro da mesma conversa ou iniciar uma nova conversa com outra IA em memória nesta fase.
- [x] Identificar claramente qual IA respondeu cada mensagem.
- [x] Exibir uma interface moderna, responsiva e semelhante a plataformas de IA, sem copiar identidade visual de terceiros.
- [x] Exibir mensagens do usuário e respostas da IA.
- [x] Exibir indicador de carregamento enquanto uma IA estiver respondendo, em estado simulado.
- [x] Incluir botão visual para copiar respostas, com fallback quando Clipboard API não estiver disponível.
- [x] Incluir botão visual para regenerar resposta em modo de demonstração.
- [x] Incluir barra lateral com múltiplas conversas de demonstração.
- [x] Incluir tema claro e escuro.
- [x] Criar configurações visuais preparadas para API key, modelo, temperatura, limite máximo de tokens, prompt de sistema e nome personalizado da IA, sem persistir dados nesta fase.

### Estrutura e execução

- [x] Usar HTML, CSS e JavaScript puro, sem framework obrigatório.
- [x] Organizar código em `index.html`, `css/`, `js/` e `js/providers/`.
- [x] Servir `manus-routes.json` com a rota da página principal.
- [x] Fazer o site iniciar na porta configurada do projeto e ser acessível pelo Preview.

## Fase 2 — armazenamento local — concluída

### Conversas e preferências

- [x] Salvar todas as conversas localmente no navegador usando `localStorage` versionado, com fallback seguro quando o armazenamento não estiver disponível.
- [x] Permitir criar, renomear, abrir, excluir e pesquisar conversas, incluindo busca no conteúdo das mensagens.
- [x] Separar o histórico por IA utilizada por meio do provedor associado a cada conversa e mensagem.
- [x] Permitir exportar conversas em JSON, Markdown ou texto.
- [x] Salvar configurações da interface no navegador, incluindo tema, provedor, conversa ativa, temperatura, limite de tokens e configurações não sensíveis do provedor.
- [x] Explicar que uma API key armazenada no navegador continua exposta ao usuário e ao ambiente do navegador; a API key permanece desabilitada e não é incluída no schema persistido.

## Fase 3 — primeira integração — em andamento

### Contrato de provedor

- [x] Criar uma interface comum para adaptadores de IA.
- [x] Normalizar mensagens, modelo, temperatura, limite máximo de tokens e prompt de sistema.
- [x] Implementar o adaptador OpenAI Responses API em modo opt-in, com chave somente em memória e documentação das limitações; a execução real ainda depende de uma chave válida e de uma origem/rede que aceite a chamada.
- [x] Informar quando a chamada não puder ser feita diretamente pelo navegador, incluindo falhas de rede/CORS, permissões e uso recomendado de backend/proxy.
- [ ] Tratar loading, erro, timeout, rate limit e resposta parcial.
- [ ] Não armazenar API keys em repositórios públicos.

## Fase 4 — múltiplas IAs, consumo e documentação

### Provedores

- [x] Adicionar adaptadores separados para ChatGPT/OpenAI, Claude/Anthropic, Gemini/Google, DeepSeek e Manus; o adaptador Manus trata a API pública como tarefa assíncrona com polling limitado.
- [x] Manter arquitetura extensível para outras IAs por meio de `provider-interface.js`, `liveRequesters` e módulos independentes em `js/providers/`.
- [x] Permitir seleção de modelo e nome personalizado por provedor.
- [x] Permitir configurar temperatura, limite máximo de tokens e prompt de sistema por provedor.

### Tokens, custos e dashboard

- [x] Controlar tokens enviados e recebidos por conversa, por IA e por período, usando metadados retornados pelo provedor e estimativa local quando eles não existem.
- [ ] Exibir estimativa de custo quando o provedor disponibilizar preços.
- [ ] Permitir definir limites de uso ou alertas quando determinado número de tokens for atingido.
- [x] Mostrar painel local com consumo total, entrada/saída, últimas 24 horas e distribuição por IA.
- [x] Informar que estimativas locais não substituem a fatura oficial do provedor.

### Documentação para GitHub

- [x] Criar README com descrição, funcionalidades, instruções, estrutura de telas e aviso de uso autorizado.
- [x] Criar guia de instalação e execução local.
- [x] Criar instruções para obter API keys de cada provedor, sem pedir que sejam publicadas.
- [x] Explicar arquitetura do projeto e cada módulo JavaScript.
- [x] Criar guia para adicionar nova IA.
- [x] Explicar armazenamento local, tokens e custos, incluindo limitações atuais e a necessidade de consultar a fatura oficial.
- [x] Documentar segurança, privacidade, CORS e limitações.
- [x] Manter licença MIT e respeitar licenças das dependências e APIs.
- [x] Documentar melhorias futuras.
