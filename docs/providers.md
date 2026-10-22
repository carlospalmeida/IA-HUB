# Configuração dos provedores

O IA Hub não cria, valida ou armazena permanentemente chaves. Use sempre as páginas oficiais, confira limites e permissões da sua conta e trate a chave como um segredo.

## OpenAI

Crie uma chave na área de API da OpenAI e escolha um modelo habilitado no projeto. O adaptador usa a Responses API em `/v1/responses`. O modelo padrão do exemplo é `gpt-5.5`, mas a disponibilidade pode variar. Consulte [OpenAI API reference](https://developers.openai.com/api/reference).

## Claude / Anthropic

Crie uma chave no Claude Console. O adaptador usa `POST /v1/messages`, o header `anthropic-version` e o modelo padrão `claude-sonnet-5-5`. Modelos e permissões variam por conta. Consulte [Anthropic API](https://docs.anthropic.com/en/api/getting-started).

## Gemini / Google

Crie uma chave na plataforma Google AI for Developers ou no ambiente Google apropriado. O adaptador usa `generateContent`, `x-goog-api-key`, `contents`, `systemInstruction` e `generationConfig`. O exemplo usa `gemini-3.8-flash`; confirme o modelo vigente em [Gemini API](https://ai.google.dev/api).

## DeepSeek

Crie a chave na conta DeepSeek. O adaptador usa o formato compatível com OpenAI em `https://api.deepseek.com/chat/completions` e o modelo padrão `deepseek-flash`. Consulte [DeepSeek first API call](https://api-docs.deepseek.com/).

## Manus

Crie uma chave na área de desenvolvedores da Manus. A API pública cria tarefas em `https://api.manus.ai/v2/task.create` e acompanha eventos via `task.listMessages`. O modelo é um perfil de agente (`standard`, `lite` ou `max`), não um nome de modelo de chat. Consulte [Manus API](https://open.manus.ai/docs/v2/introduction).

O adaptador Manus é assíncrono: uma tarefa pode ficar em execução, pedir informação ou exigir confirmação. A interface atual aguarda uma janela limitada e não implementa ainda todos os controles de perguntas, confirmações, anexos e artefatos.

## Chave em sessão

Ao salvar o modal, a chave continua apenas em memória. Não a inclua em screenshots, issues, logs, arquivos exportados, variáveis de frontend ou commits. Para qualquer uso público, substitua o modo direto por um backend.
