# IA Hub

> Um cockpit local para conversar com vários provedores de IA sem perder o contexto da conversa.

O **IA Hub** é um site estático construído com HTML semântico, CSS moderno e JavaScript ES Modules. Ele centraliza uma interface de chat, histórico local, seleção de provedor, configurações por IA, exportação de conversas, métricas locais e adaptadores separados para OpenAI, Claude, Gemini, DeepSeek e Manus.

O projeto foi desenhado para desenvolvimento local, aprendizado e experimentação autorizada. As chamadas diretas do navegador são experimentais e **não devem ser tratadas como uma arquitetura de produção**.

---

## Índice

- [Visão geral](#visão-geral)
- [Aviso importante de segurança](#aviso-importante-de-segurança)
- [Funcionalidades](#funcionalidades)
- [Tecnologias e decisões](#tecnologias-e-decisões)
- [Instalação e execução local](#instalação-e-execução-local)
- [Testes rápidos](#testes-rápidos)
- [Como usar](#como-usar)
- [Configuração dos provedores](#configuração-dos-provedores)
- [OpenAI em modo experimental](#openai-em-modo-experimental)
- [Arquitetura](#arquitetura)
- [Contrato comum dos adaptadores](#contrato-comum-dos-adaptadores)
- [Fluxo de envio](#fluxo-de-envio)
- [Persistência local](#persistência-local)
- [Tokens, métricas e custos](#tokens-métricas-e-custos)
- [Segurança, privacidade e CORS](#segurança-privacidade-e-cors)
- [Como adicionar um novo provedor](#como-adicionar-um-novo-provedor)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Design e identidade visual](#design-e-identidade-visual)
- [Limitações conhecidas](#limitações-conhecidas)
- [Roadmap](#roadmap)
- [Uso autorizado](#uso-autorizado)
- [Referências oficiais](#referências-oficiais)
- [Contribuição](#contribuição)
- [Licença](#licença)

---

## Visão geral

O IA Hub permite que o usuário:

1. escolha uma IA antes de enviar uma mensagem;
2. troque de provedor dentro de uma conversa ou crie uma nova conversa;
3. identifique claramente qual provedor respondeu;
4. mantenha conversas no navegador;
5. exporte conversas em JSON, Markdown ou texto;
6. configure modelo, temperatura, limite de saída, prompt de sistema e nome personalizado;
7. use o modo de demonstração sem fornecer qualquer chave;
8. habilite chamadas reais de forma opt-in e somente durante a sessão atual;
9. acompanhe estimativas locais de tokens por conversa, provedor e período.

A interface não tenta copiar a identidade visual de nenhuma plataforma específica. O foco é oferecer uma base simples, extensível e legível para estudar integrações com diferentes APIs de IA.

---

## Aviso importante de segurança

Uma chave digitada no navegador **não é um segredo confiável**. Mesmo que o IA Hub não a grave no `localStorage`, não a exporte e não a envie para um servidor próprio, ela ainda pode ser observada ou extraída por:

- extensões do navegador;
- código executado na página;
- ferramentas de desenvolvedor;
- malware no computador;
- qualquer pessoa com acesso ao perfil ou à sessão do navegador.

Portanto:

- nunca publique chaves no GitHub;
- nunca coloque chaves em HTML, CSS, JavaScript ou `.env` de frontend;
- nunca envie chaves em issues, pull requests, screenshots ou mensagens;
- não use o modo direto como backend de produção;
- prefira chaves com escopo, limite e duração reduzidos quando o provedor permitir;
- revogue imediatamente uma chave que tenha sido exposta.

Para produção, crie um backend ou proxy autorizado que mantenha as chaves em variáveis de ambiente ou em um gerenciador de segredos. Esse backend deve aplicar autenticação, autorização, rate limiting, limites por usuário, logs sem segredos e uma política de privacidade adequada.

---

## Funcionalidades

### Interface

- layout responsivo para desktop e mobile;
- tema claro e escuro;
- sidebar com conversas;
- criação, abertura, renomeação, exclusão e pesquisa de conversas;
- pesquisa também no conteúdo das mensagens;
- seletor visual de provedor;
- identificação do provedor em cada resposta;
- estado de carregamento;
- cópia de respostas com fallback quando a Clipboard API não estiver disponível;
- regeneração de respostas no modo de demonstração;
- painel rápido de temperatura e limite de saída;
- painel local de atividade e consumo.

### Integrações

- OpenAI Responses API;
- Anthropic Claude Messages API;
- Google Gemini `generateContent`;
- DeepSeek Chat Completions;
- Manus API assíncrona com criação de tarefas e polling limitado.

### Privacidade local

- histórico persistido no navegador usando `localStorage` versionado;
- preferências não sensíveis persistidas localmente;
- chaves mantidas apenas em memória enquanto a aba estiver aberta;
- chaves excluídas ao recarregar ou fechar a aba;
- chaves fora das exportações e do schema persistido.

---

## Tecnologias e decisões

### Stack

- HTML semântico;
- CSS moderno;
- JavaScript ES Modules;
- APIs nativas do navegador;
- `localStorage` para persistência inicial;
- servidor HTTP estático para desenvolvimento local.

Não há framework obrigatório nem dependências necessárias para executar a interface atual.

### Decisões técnicas

- A interface não conhece detalhes específicos de cada fornecedor.
- Cada provedor possui um adaptador isolado.
- O histórico usa mensagens normalizadas.
- Erros de rede, CORS, autenticação, limite e timeout são convertidos em mensagens compreensíveis.
- As chaves nunca devem ser commitadas, incluídas em builds públicos ou impressas no console.
- Tokens e custos são metadados auxiliares; as estimativas locais nunca substituem a fatura oficial.
- O Manus é tratado como tarefa assíncrona, não como uma resposta síncrona comum.

---

## Instalação e execução local

### Requisitos

- Git;
- Python 3, Node.js ou outro servidor HTTP estático;
- navegador moderno com suporte a módulos ES;
- uma chave criada na plataforma do provedor, somente se você quiser sair do modo de demonstração.

### Clonar e iniciar

```bash
git clone <URL-DO-SEU-REPOSITORIO>
cd iahub
python3 -m http.server 3000 --bind 127.0.0.1
```

Abra:

```text
http://127.0.0.1:3000
```

Não abra `index.html` diretamente com `file://`, pois o navegador pode bloquear módulos JavaScript e requisições por política de origem.

Também é possível usar qualquer servidor estático que preserve os caminhos relativos do projeto.

### Publicação estática

A interface pode ser publicada em um host estático. Porém, o modo direto com chave não deve ser disponibilizado como serviço público. Para uma publicação pública, mantenha as chamadas reais desativadas até existir um backend com autenticação e gerenciamento de segredos.

---

## Testes rápidos

Execute na raiz do projeto:

```bash
for file in js/app.js js/storage.js js/providers/*.js; do node --check "$file"; done
python3 -m json.tool manus-routes.json >/dev/null
git diff --check
```

Para confirmar que o servidor está respondendo:

```bash
curl -fsS http://127.0.0.1:3000/ >/dev/null
curl -fsS http://127.0.0.1:3000/manus-routes.json
```

Também é recomendável verificar visualmente a interface em desktop e mobile antes de publicar alterações.

---

## Como usar

### Modo de demonstração

O modo de demonstração funciona sem chave:

1. inicie o servidor local;
2. abra o IA Hub;
3. escolha um provedor;
4. digite uma mensagem;
5. envie a mensagem;
6. observe a resposta simulada e o histórico local.

Esse modo é adequado para testar a interface, persistência, pesquisa, exportação e troca de provedor sem realizar chamadas externas.

### Usar um provedor real

1. Abra **Configurações → Provedor selecionado**.
2. Escolha o provedor no seletor superior.
3. Escolha um modelo aceito pela sua conta.
4. Configure temperatura, limite de saída e prompt de sistema.
5. Crie uma chave na página oficial do provedor.
6. Cole a chave somente no campo de sessão do navegador.
7. Clique em **Concluído**.
8. Envie uma mensagem.

A chave fica somente em memória durante a sessão. Ela não é salva no `localStorage`, não entra nas exportações e não é incluída nos arquivos do projeto. Ao fechar ou recarregar a aba, ela é removida.

Se CORS, rede corporativa, extensão do navegador, permissões ou política do provedor bloquearem a chamada, o IA Hub exibirá uma falha compreensível e você poderá continuar usando o modo de demonstração.

---

## Configuração dos provedores

O IA Hub não cria, valida nem armazena permanentemente chaves. Use sempre as páginas oficiais, confira os limites da conta e trate cada chave como um segredo.

### OpenAI

O adaptador usa a Responses API:

```text
POST https://api.openai.com/v1/responses
```

Ele envia o histórico normalizado em `input`, o prompt de sistema em `instructions` quando configurado e lê o texto da resposta sem depender de uma posição fixa no array `output`.

O modelo exibido por padrão é `gpt-5.5`, mas a disponibilidade pode variar conforme o projeto e a conta. Confirme o modelo aceito na documentação oficial e no painel da OpenAI.

### Claude / Anthropic

O adaptador usa a Messages API:

```text
POST https://api.anthropic.com/v1/messages
```

A requisição utiliza `model`, `max_tokens`, `messages`, `system` quando necessário e `temperature`. A autenticação usa `x-api-key` e `anthropic-version`.

O exemplo usa `claude-sonnet-5-5`, mas os modelos disponíveis e as permissões variam conforme a conta.

### Gemini / Google

O adaptador usa `generateContent`:

```text
POST https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent
```

A requisição utiliza `contents`, `systemInstruction` e `generationConfig`, incluindo `temperature` e `maxOutputTokens`. A autenticação usa `x-goog-api-key`.

O exemplo usa `gemini-3.8-flash`; confirme o modelo vigente na documentação oficial do Gemini.

### DeepSeek

O adaptador usa o formato compatível com OpenAI:

```text
POST https://api.deepseek.com/chat/completions
```

A requisição usa Bearer token, `model`, `messages`, `max_tokens`, `temperature` e `stream: false`.

O modelo padrão do exemplo é `deepseek-flash`. A disponibilidade pode variar.

### Manus

A Manus API pública é assíncrona. Ela cria tarefas e acompanha eventos:

```text
POST https://api.manus.ai/v2/task.create
GET  https://api.manus.ai/v2/task.listMessages
```

O adaptador mantém IDs de tarefas por provedor e realiza polling por uma janela limitada. Uma tarefa Manus pode estar executando, aguardando uma resposta, pedindo confirmação ou produzindo artefatos. A interface atual ainda não implementa todos os controles necessários para perguntas interativas, confirmações, anexos, webhooks e artefatos.

Os perfis exibidos são `standard`, `lite` e `max`, mas a disponibilidade e os campos aceitos devem ser confirmados na documentação da API.

---

## OpenAI em modo experimental

A integração direta com OpenAI existe para desenvolvimento local e demonstração. A OpenAI recomenda não expor chaves em código client-side, navegadores ou aplicativos móveis, pois uma pessoa pode extraí-las e gerar consumo na conta.

A chamada usa:

```text
POST https://api.openai.com/v1/responses
Authorization: Bearer <CHAVE>
Content-Type: application/json
```

O IA Hub também envia um `X-Client-Request-Id` para auxiliar diagnósticos sem registrar a chave.

### Erros tratados

- `401` e `403`: chave rejeitada ou sem permissão;
- `429`: limite de uso ou requisições;
- `5xx`: indisponibilidade do provedor;
- timeout local de 45 segundos;
- falha de rede ou CORS;
- resposta sem texto exibível;
- cancelamento via `AbortController`.

Para um ambiente público ou de produção, use um backend ou proxy autorizado que mantenha a chave em variável de ambiente ou gerenciador de segredos.

---

## Arquitetura

### Camadas

- `index.html`: estrutura semântica e controles da interface;
- `css/style.css`: design responsivo, temas, estados e componentes visuais;
- `js/app.js`: estado da aplicação, renderização, eventos, envio, seleção de adaptador e métricas;
- `js/storage.js`: schema local versionado, normalização, persistência e exportação;
- `js/providers/`: adaptação dos formatos externos para o contrato interno;
- `manus-routes.json`: manifesto da rota principal do site;
- `app.config.ts`: identidade visual persistente do projeto.

### Contrato comum dos adaptadores

O arquivo `js/providers/provider-interface.js` fornece:

- `ProviderError`, com código e status sem expor credenciais;
- `normalizeMessages`, que reduz o histórico a mensagens de usuário e assistente;
- `requestJson`, que padroniza JSON, falhas de rede/CORS e status HTTP;
- `providerErrorMessage`, que converte falhas técnicas em mensagens compreensíveis;
- `createClientRequestId`, usado quando um provedor suporta ID de diagnóstico.

Um adaptador recebe, conforme o provedor:

```js
{
  apiKey,
  model,
  messages,
  instructions,
  temperature,
  maxTokens,
  signal
}
```

E retorna, quando disponível:

```js
{
  text: "resposta final",
  usage: {
    input_tokens: 10,
    output_tokens: 20,
    total_tokens: 30
  },
  requestId: "id-do-provedor"
}
```

O Manus também pode retornar:

```js
{
  text: "resposta final",
  taskId: "id-da-tarefa",
  waiting: false,
  usage: null
}
```

A UI não deve conhecer endpoints, nomes de headers, formatos de resposta ou regras de polling de nenhum fornecedor.

---

## Fluxo de envio

1. O usuário seleciona um provedor.
2. O usuário envia uma mensagem.
3. A mensagem é adicionada ao histórico local.
4. O workspace é persistido no navegador.
5. A interface mostra o estado de carregamento.
6. Se houver chave de sessão e adaptador, o adaptador real é chamado.
7. Sem chave, a resposta de demonstração é usada.
8. O resultado normalizado é anexado à conversa.
9. Uso de tokens, quando fornecido, é armazenado como metadado da mensagem.
10. Erros são convertidos em mensagens seguras, sem imprimir a chave.
11. A conversa e as métricas são renderizadas novamente.

---

## Persistência local

O IA Hub utiliza um schema versionado em `localStorage` para conversas e preferências não sensíveis.

### Dados persistidos

- conversas;
- mensagens;
- provedor associado à conversa e à resposta;
- título e preview;
- tema;
- provedor selecionado;
- conversa ativa;
- temperatura;
- limite de tokens;
- modelo e prompt de sistema;
- nome personalizado;
- IDs de tarefas remotas do Manus por provedor;
- metadados de uso retornados pelos provedores.

### Dados não persistidos

- API keys;
- tokens de autenticação;
- segredos de usuário;
- credenciais de backend.

O armazenamento possui normalização e fallback quando o `localStorage` não está disponível. Limpar os dados do site, usar modo privado, atingir a quota ou aplicar políticas restritivas do navegador pode apagar ou impedir a persistência.

### Exportação

Conversas podem ser exportadas localmente em:

- JSON;
- Markdown;
- texto simples.

Exportações devem ser tratadas como dados potencialmente sensíveis, pois podem conter prompts, código, informações pessoais ou respostas de provedores.

---

## Tokens, métricas e custos

O painel local apresenta:

- tokens de entrada;
- tokens de saída;
- total de tokens;
- consumo por conversa;
- consumo por provedor;
- consumo nas últimas 24 horas.

Quando o provedor retorna `usage`, o IA Hub utiliza os metadados fornecidos. Quando não há metadados, o projeto usa uma estimativa simples baseada no tamanho do texto. Essa estimativa não é equivalente ao tokenizer oficial do modelo.

O projeto ainda não possui:

- tabela de preços versionada;
- cálculo financeiro confiável para todos os modelos;
- alertas configuráveis por limite;
- dashboard financeiro;
- sincronização de consumo com as plataformas.

Estimativas locais nunca substituem a fatura oficial de OpenAI, Anthropic, Google, DeepSeek, Manus ou qualquer outro fornecedor.

---

## Segurança, privacidade e CORS

### Chaves

Uma chave digitada no navegador continua exposta ao ambiente do cliente. O IA Hub não a grava no `localStorage`, não a inclui no JSON exportado e não a imprime no console, mas isso não transforma a chave em um segredo forte.

Em produção, envie a solicitação para um backend autenticado e guarde a chave em variável de ambiente ou gerenciador de segredos.

### Dados enviados

O texto enviado a um provedor segue a política de retenção, treinamento, segurança e faturamento daquele provedor. Não envie código proprietário, dados pessoais, tokens, senhas ou segredos sem autorização e sem avaliar os termos aplicáveis.

### CORS

Uma página estática só consegue ler respostas de uma origem externa quando o provedor autoriza a origem por CORS. Usar `mode: no-cors` não resolve uma integração de chat, pois impede o JavaScript de ler o corpo da resposta.

Quando a chamada direta falhar:

1. confirme a chave e o modelo;
2. verifique o console apenas em ambiente local e sem expor segredos;
3. confirme se a origem é autorizada pelo provedor;
4. tente o modo de demonstração;
5. para produção, configure um backend ou proxy autorizado.

Não tente contornar a política de origem do navegador ou do provedor.

### Logs

IDs de requisição podem ajudar no diagnóstico, mas nunca devem ser registrados junto com chaves, prompts secretos ou dados pessoais em logs públicos.

---

## Como adicionar um novo provedor

1. Crie `js/providers/meu-provedor.js`.
2. Importe `normalizeMessages`, `requestJson` e `ProviderError`.
3. Normalize o histórico de mensagens.
4. Use `requestJson` para tratar JSON, rede e respostas HTTP.
5. Mantenha a chave somente no argumento da chamada.
6. Converta a resposta externa para `text` e `usage`.
7. Lance `ProviderError` para chave ausente, rede, CORS, autenticação, limite e timeout.
8. Importe o adaptador em `js/app.js`.
9. Adicione o provedor ao mapa `providers`.
10. Adicione a função ao mapa `liveRequesters`.
11. Adicione os modelos a `modelOptions`.
12. Atualize os controles de configuração, se houver campos específicos.
13. Atualize este README com endpoint, autenticação, modelos, limitações e referência oficial.
14. Execute os testes de sintaxe.
15. Nunca use ou commite uma chave real durante o desenvolvimento.

O adaptador deve manter isolados os detalhes do fornecedor. A interface principal não deve conhecer os nomes dos endpoints nem o formato específico do payload.

---

## Estrutura do projeto

```text
iahub/
├── index.html
├── manus-routes.json
├── README.md
├── LICENSE
├── app.config.ts
├── css/
│   └── style.css
└── js/
    ├── app.js
    ├── storage.js
    └── providers/
        ├── provider-interface.js
        ├── openai.js
        ├── anthropic.js
        ├── gemini.js
        ├── deepseek.js
        └── manus.js
```

O repositório mantém uma documentação única neste arquivo para facilitar a leitura no GitHub. Detalhes de implementação podem ser consultados diretamente nos módulos correspondentes.

---

## Design e identidade visual

### Estilo escolhido: Studio de conversa

O IA Hub utiliza um workspace escuro refinado, inspirado em ferramentas profissionais de criação e análise, sem copiar uma plataforma específica.

Princípios:

- hierarquia silenciosa;
- foco no conteúdo;
- controles acessíveis;
- estados sempre compreensíveis.

A paleta usa uma base azul-marinho quase preta para reduzir fadiga visual, superfícies azul-petróleo para separar camadas e turquesa luminoso para ações, foco e identidade.

A composição principal utiliza duas colunas assimétricas:

- barra lateral persistente para navegação;
- palco de conversa com cabeçalho contextual e compositor fixo.

Elementos de assinatura:

- indicador de provedor em formato de cápsula;
- linha de atividade no histórico;
- compositor com brilho sutil no foco;
- logotipo com três nós conectados formando um balão de conversa.

Cor de marca:

```text
#42E8D0
```

A interface deve utilizar transições curtas, normalmente entre 160 e 220 ms, respeitando `prefers-reduced-motion`.

---

## Limitações conhecidas

O projeto ainda não implementa:

- backend seguro;
- login de usuários;
- autorização por usuário;
- streaming incremental comum a todos os provedores;
- medição exata de tokens para todos os modelos;
- tabela de preços versionada;
- cálculo financeiro confiável;
- alertas de limite configuráveis;
- sincronização entre dispositivos;
- anexos completos;
- webhooks;
- artefatos do Manus;
- perguntas interativas e confirmações completas do Manus;
- persistência em IndexedDB para históricos muito grandes.

O adaptador Manus cria tarefas, consulta eventos e aguarda uma janela limitada. Uma tarefa que exija interação pode precisar de uma evolução da UI para exibir perguntas, estados, confirmações e ações de continuação.

---

## Roadmap

### Concluído

- interface principal responsiva;
- temas claro e escuro;
- histórico local versionado;
- criação, renomeação, abertura, exclusão e pesquisa de conversas;
- exportação JSON, Markdown e texto;
- contrato comum de provedores;
- OpenAI em modo opt-in;
- adaptadores Claude, Gemini, DeepSeek e Manus;
- configurações por provedor;
- chaves somente em memória;
- painel local de tokens;
- documentação consolidada neste README;
- licença MIT.

### Próximas evoluções

- backend ou proxy seguro;
- autenticação e autorização;
- rate limiting;
- streaming;
- cancelamento de requisições;
- preços por modelo;
- custos estimados;
- alertas de limite;
- testes automatizados dos adaptadores;
- suporte a anexos;
- IndexedDB para grandes volumes;
- sincronização opcional entre dispositivos;
- UI completa para estados interativos do Manus;
- observabilidade sem dados sensíveis.

---

## Uso autorizado

Use o IA Hub apenas com aplicativos, softwares, contas, APIs e dados para os quais você tenha autorização.

Em atividades de engenharia reversa, testes de segurança, análise de malware ou pesquisa técnica:

- trabalhe em laboratório isolado;
- preserve evidências;
- não contorne autenticação ou controle de acesso sem autorização;
- respeite leis, licenças, contratos e políticas dos provedores;
- não redistribua código, dados ou artefatos protegidos;
- não envie informações confidenciais a um provedor de IA sem permissão.

O fato de uma IA conseguir analisar um artefato não concede permissão para acessá-lo, copiá-lo ou redistribuí-lo.

---

## Referências oficiais

### Anthropic Claude

- [Messages API](https://docs.anthropic.com/en/api/messages)
- [API overview e autenticação](https://docs.anthropic.com/en/api/getting-started)
- [SDKs oficiais e suporte a navegador](https://docs.anthropic.com/en/api/client-sdks)

A Claude API utiliza `POST /v1/messages`, com `model`, `max_tokens`, `messages` e, quando necessário, `system`. A resposta contém blocos de conteúdo e uso de tokens.

### Google Gemini

- [generateContent reference](https://ai.google.dev/api/generate-content)
- [Interactions API](https://ai.google.dev/api/interactions)
- [Text generation guide](https://ai.google.dev/gemini-api/docs/text-generation)

A API REST utiliza `contents`, `systemInstruction` e `generationConfig`. A documentação atual também apresenta a Interactions API, que possui um fluxo de entrada e saída em etapas.

### DeepSeek

- [Chat Completions API](https://api-docs.deepseek.com/api/create-chat-completion/)
- [DeepSeek API](https://api-docs.deepseek.com/)

A API de chat usa Bearer token, `model`, `messages`, `max_tokens`, `temperature` e `stream`. O formato é compatível com a família de APIs OpenAI.

### Manus

- [Manus API introduction](https://open.manus.ai/docs/v2/introduction)
- [task.create](https://open.manus.ai/docs/v2/task.create.md)
- [task.listMessages](https://open.manus.ai/docs/v2/task.listMessages.md)
- [Task lifecycle](https://open.manus.ai/docs/v2/task-lifecycle.md)
- [Authentication](https://open.manus.ai/docs/v2/authentication.md)

A Manus API cria tarefas assíncronas e exige acompanhamento de eventos e resultados.

### OpenAI

- [Responses API reference](https://developers.openai.com/api/reference/resources/responses)
- [Text generation guide](https://platform.openai.com/docs/guides/text)
- [Best practices for API key safety](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety)
- [Authentication reference](https://platform.openai.com/docs/api-reference/authentication)

A OpenAI recomenda manter chaves fora do código client-side e de ambientes onde possam ser extraídas.

---

## Contribuição

Antes de enviar uma alteração:

```bash
for file in js/app.js js/storage.js js/providers/*.js; do node --check "$file"; done
python3 -m json.tool manus-routes.json >/dev/null
git diff --check
```

Ao adicionar funcionalidade:

1. mantenha a interface simples e responsiva;
2. evite dependências desnecessárias;
3. não inclua credenciais de teste;
4. documente limitações e riscos;
5. preserve o contrato comum dos adaptadores;
6. atualize este README;
7. verifique que o histórico local não persiste segredos;
8. teste desktop e mobile.

Pull requests devem explicar o que mudou, como testar e quais limitações permanecem.

---

## Licença

Este projeto é distribuído sob a licença MIT.

As APIs, marcas, SDKs, modelos e documentações citadas pertencem aos seus respectivos proprietários e seguem os termos de uso de cada fornecedor.
