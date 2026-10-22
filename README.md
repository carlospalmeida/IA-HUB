# IA Hub

> Um cockpit local para conversar com vários provedores de IA sem perder o contexto da conversa.

O IA Hub é um site estático em HTML, CSS e JavaScript puro. Ele centraliza uma interface de chat, histórico local, seleção de provedor e adaptadores separados para OpenAI, Claude, Gemini, DeepSeek e Manus.

## Atenção antes de usar

As chamadas diretas do navegador são experimentais. Chaves digitadas no modal ficam somente em memória enquanto a aba estiver aberta, mas ainda podem ser observadas por extensões, código da página, ferramentas de desenvolvedor ou por qualquer pessoa com acesso ao navegador. Não publique uma chave, não a coloque em `.env` de frontend, não a committe e não use o modo direto como backend de produção.

Para produção, crie um backend/proxy autorizado, guarde as chaves em variável de ambiente ou gerenciador de segredos, aplique autenticação, limites por usuário, logs sem segredos e políticas de privacidade. CORS, permissões, modelos disponíveis e limites dependem de cada provedor.

## Funcionalidades atuais

- seleção visual entre OpenAI, Claude, Gemini, DeepSeek e Manus;
- modo de demonstração sem chave;
- adaptadores independentes com contratos de entrada e saída normalizados;
- histórico local com criação, abertura, renomeação, exclusão, pesquisa e exportação em JSON, Markdown e texto;
- tema claro/escuro, configurações por provedor, temperatura, limite de tokens, prompt de sistema e nome personalizado;
- chave de sessão não persistida;
- tratamento de loading, timeout, falha de rede/CORS, autenticação, limite de uso e respostas sem texto;
- Manus tratado como tarefa assíncrona com polling limitado, não como resposta síncrona comum.

## Executar localmente

Não é necessário instalar dependências para a interface atual:

```bash
git clone <URL-DO-SEU-REPOSITORIO>
cd iahub
python3 -m http.server 3000 --bind 127.0.0.1
```

Abra `http://127.0.0.1:3000`. Como o projeto usa módulos ES, evite abrir `index.html` diretamente com `file://`.

Também é possível usar qualquer servidor estático simples que preserve os caminhos relativos.

## Configurar uma IA

1. Abra **Configurações → Provedor selecionado**.
2. Escolha o provedor no seletor superior.
3. Revise o modelo, temperatura, limite de saída e prompt de sistema.
4. Crie uma chave na página oficial do provedor e cole-a somente na sessão local.
5. Salve e envie uma mensagem.
6. Se CORS ou uma política de rede impedir a chamada, o IA Hub mostrará uma falha compreensível e você poderá continuar no modo de demonstração.

A chave não é exportada nem salva no `localStorage`. Ao fechar ou recarregar a aba, ela é removida.

## Provedores e documentação

- [OpenAI Responses API](docs/openai-integration.md)
- [Contratos oficiais consultados](docs/provider-references.md)
- [Guia de instalação](docs/installation.md)
- [Arquitetura e módulos](docs/architecture.md)
- [Configuração dos provedores](docs/providers.md)
- [Segurança, privacidade e CORS](docs/security.md)

## Estrutura

```text
index.html
css/style.css
js/app.js
js/storage.js
js/providers/
  provider-interface.js
  openai.js
  anthropic.js
  gemini.js
  deepseek.js
  manus.js
docs/
  architecture.md
  installation.md
  openai-integration.md
  provider-references.md
  providers.md
  security.md
manus-routes.json
plan.md
TODO.md
LICENSE
```

A UI conhece apenas o contrato comum. Cada adaptador traduz o histórico e as configurações para a API correspondente e devolve texto, uso de tokens, identificador de requisição e, no caso do Manus, o ID da tarefa assíncrona.

## Limitações conhecidas

O projeto ainda não implementa um backend seguro, login de usuários, streaming incremental comum a todos os provedores, medição exata de tokens para todos os modelos, tabela de preços versionada, dashboard financeiro completo ou sincronização entre dispositivos. Estimativas locais nunca substituem a fatura oficial de uma plataforma.

O adaptador Manus cria tarefas, consulta eventos e aguarda uma janela limitada. Perguntas interativas, confirmações de ações, anexos, webhooks e artefatos exigem uma próxima camada de UI e servidor.

## Uso autorizado

Use o IA Hub apenas com aplicativos, softwares, contas e dados para os quais você tenha autorização. Em atividades de engenharia reversa, testes de segurança e análise de malware, trabalhe em laboratório isolado, preserve evidências e respeite leis, licenças, contratos e políticas dos provedores.

## Desenvolvimento

Antes de enviar uma alteração:

```bash
for file in js/app.js js/storage.js js/providers/*.js; do node --check "$file"; done
python3 -m json.tool manus-routes.json >/dev/null
git diff --check
```

Para adicionar um provedor, siga [docs/architecture.md](docs/architecture.md) e atualize o mapa `liveRequesters`, os modelos em `modelOptions` e o README. Nunca inclua credenciais de teste em commits.

## Licença

Este projeto é distribuído sob a licença MIT. As APIs, marcas, SDKs e modelos citados pertencem aos seus respectivos proprietários e seguem os termos de uso de cada fornecedor.
