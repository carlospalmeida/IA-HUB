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

## Fase 2 — armazenamento local

### Conversas e preferências

- [ ] Salvar todas as conversas localmente no navegador, preferencialmente com localStorage ou IndexedDB.
- [ ] Permitir criar, renomear, abrir, excluir e pesquisar conversas.
- [ ] Separar o histórico por IA utilizada.
- [ ] Permitir exportar conversas em JSON, Markdown ou texto.
- [ ] Salvar configurações da interface no navegador.
- [ ] Explicar que uma API key armazenada no navegador continua exposta ao usuário e ao ambiente do navegador; não prometer segurança equivalente a um cofre de servidor.

## Fase 3 — primeira integração

### Contrato de provedor

- [ ] Criar uma interface comum para adaptadores de IA.
- [ ] Normalizar mensagens, modelo, temperatura, limite máximo de tokens e prompt de sistema.
- [ ] Implementar um primeiro provedor real somente depois de validar CORS, autenticação e documentação oficial.
- [ ] Informar quando a chamada não puder ser feita diretamente pelo navegador.
- [ ] Tratar loading, erro, timeout, rate limit e resposta parcial.
- [ ] Não armazenar API keys em repositórios públicos.

## Fase 4 — múltiplas IAs, consumo e documentação

### Provedores

- [ ] Adicionar adaptadores separados para ChatGPT/OpenAI, Claude/Anthropic, Gemini/Google, DeepSeek e Manus.
- [ ] Manter arquitetura extensível para outras IAs.
- [ ] Permitir seleção de modelo e nome personalizado por provedor.
- [ ] Permitir configurar temperatura, limite máximo de tokens e prompt de sistema por provedor.

### Tokens, custos e dashboard

- [ ] Controlar tokens enviados e recebidos por conversa, por IA e por período.
- [ ] Exibir estimativa de custo quando o provedor disponibilizar preços.
- [ ] Permitir definir limites de uso ou alertas quando determinado número de tokens for atingido.
- [ ] Mostrar dashboard com consumo por IA.
- [ ] Informar que estimativas locais não substituem a fatura oficial do provedor.

### Documentação para GitHub

- [ ] Criar README com descrição, funcionalidades, instruções, prints ou sugestão de telas e aviso de uso autorizado.
- [ ] Criar guia de instalação e execução local.
- [ ] Criar instruções para obter API keys de cada provedor, sem pedir que sejam publicadas.
- [ ] Explicar arquitetura do projeto e cada módulo JavaScript.
- [ ] Criar guia para adicionar nova IA.
- [ ] Explicar armazenamento local, tokens e custos.
- [ ] Documentar segurança, privacidade, CORS e limitações.
- [ ] Manter licença MIT e respeitar licenças das dependências e APIs.
- [ ] Documentar melhorias futuras.
