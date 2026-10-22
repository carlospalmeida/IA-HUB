# Contratos consultados para provedores

Este arquivo registra apenas os fatos necessários para os adaptadores do IA Hub e preserva as fontes oficiais consultadas.

## Anthropic Claude

A Claude API usa `POST https://api.anthropic.com/v1/messages`. A requisição exige `model`, `max_tokens` e `messages`; `system` pode ser enviado como instrução separada. A autenticação usa `x-api-key` ou, em fluxos compatíveis, `Authorization: Bearer`, junto com `anthropic-version` e `Content-Type: application/json`. A resposta contém blocos de conteúdo e uso de tokens. [1] [2]

## Google Gemini

A API REST tradicional usa `POST https://generativelanguage.googleapis.com/v1beta/{model=models/*}:generateContent`, com `contents`, `systemInstruction` e `generationConfig`. A referência documenta `temperature` e `maxOutputTokens`. A documentação atual também apresenta a Interactions API, com modelos como `gemini-flash-latest`, entrada e saída em etapas, e opção `store=false` para manter o histórico no cliente. [3] [4] [5]

## DeepSeek

O endpoint de chat é `POST https://api.deepseek.com/chat/completions`, com autenticação Bearer, `model`, `messages`, `max_tokens`, `temperature` e `stream`. A API é compatível com o formato OpenAI. A documentação atual lista `deepseek-flash` e recomenda a base `https://api.deepseek.com`. [6] [7]

## Manus

A Manus API pública não é um endpoint síncrono de geração de texto. Ela cria tarefas assíncronas em `POST https://api.manus.ai/v2/task.create`, usa `x-manus-api-key` ou OAuth, e exige polling por `GET /v2/task.listMessages` para acompanhar eventos e resultados. A integração precisa de um adaptador específico para tarefa assíncrona, UI de progresso e tratamento de perguntas/confirmações; não deve ser tratada como uma resposta instantânea comum. [8] [9] [10] [11]

## Referências

[1]: https://docs.anthropic.com/en/api/messages "Anthropic Messages API"
[2]: https://docs.anthropic.com/en/api/getting-started "Anthropic API overview and authentication"
[3]: https://ai.google.dev/api/generate-content "Google Gemini generateContent reference"
[4]: https://ai.google.dev/api/interactions "Google Gemini Interactions API"
[5]: https://ai.google.dev/gemini-api/docs/text-generation "Google Gemini text generation guide"
[6]: https://api-docs.deepseek.com/api/create-chat-completion/ "DeepSeek Chat Completions API"
[7]: https://api-docs.deepseek.com/ "DeepSeek API first call"
[8]: https://open.manus.ai/docs/v2/task.create.md "Manus task.create"
[9]: https://open.manus.ai/docs/v2/task.listMessages.md "Manus task.listMessages"
[10]: https://open.manus.ai/docs/v2/task-lifecycle.md "Manus task lifecycle"
[11]: https://open.manus.ai/docs/v2/authentication.md "Manus API authentication"
