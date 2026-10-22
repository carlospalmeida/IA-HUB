# Integração OpenAI

O IA Hub possui um adaptador experimental para a Responses API da OpenAI. Ele usa `POST https://api.openai.com/v1/responses`, envia o histórico normalizado em `input`, o prompt de sistema em `instructions` quando configurado e lê o texto a partir dos campos de saída sem assumir que o primeiro item de `output` seja uma mensagem. Essa abordagem segue a referência atual da API e o guia oficial de geração de texto. [1] [2]

## Como usar no modo experimental

Abra **Configurações → Provedor selecionado**, selecione OpenAI e informe o modelo aceito pelo seu projeto, como `gpt-5.5` ou outro modelo disponível para a sua conta. Cole uma chave criada para uso pessoal e com limites adequados. Clique em **Concluído** e envie uma mensagem.

A chave fica apenas em memória enquanto a aba estiver aberta. Ela não é enviada ao `localStorage`, não entra nas exportações de conversa e não é incluída em arquivos do repositório. Fechar ou recarregar a aba remove a chave.

## Limitação importante

Este modo direto do navegador existe para desenvolvimento local e demonstração. A OpenAI recomenda não expor chaves em código client-side, navegadores ou aplicativos móveis, pois uma pessoa pode extraí-las e gerar consumo na conta. Para um ambiente público ou produção, use um backend ou proxy autorizado que mantenha a chave em variável de ambiente ou em um gerenciador de segredos. [3] [4]

Além disso, a chamada pode ser bloqueada por CORS, rede corporativa, extensão do navegador ou política do provedor. Nesse caso, o IA Hub mantém a conversa local e mostra uma mensagem orientando o uso de um proxy/backend; ele não tenta contornar a política de origem.

## O que o adaptador trata

- `401` e `403`: chave rejeitada ou sem permissão.
- `429`: limite de uso ou requisições.
- `5xx`: indisponibilidade do provedor.
- timeout local de 45 segundos.
- falha de rede ou CORS.
- resposta sem texto exibível.
- `usage` retornado pelo provedor, reservado para a próxima etapa de tokens e custos.

A autenticação usa o cabeçalho `Authorization: Bearer ...`. O código também envia um `X-Client-Request-Id` por requisição para facilitar diagnóstico sem registrar a chave. [4]

## Referências

[1]: https://developers.openai.com/api/reference/resources/responses "OpenAI Responses API reference"
[2]: https://platform.openai.com/docs/guides/text "OpenAI text generation guide"
[3]: https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety "OpenAI best practices for API key safety"
[4]: https://platform.openai.com/docs/api-reference/authentication "OpenAI API authentication reference"
