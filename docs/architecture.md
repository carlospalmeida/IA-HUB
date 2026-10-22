# Arquitetura

## Camadas

`index.html` contém a estrutura semântica e os controles. `css/style.css` concentra o design responsivo e os temas. `js/app.js` controla estado da interface, renderização, eventos, envio e seleção do adaptador. `js/storage.js` mantém o schema local e exportações. `js/providers/` traduz o contrato comum para cada serviço externo.

## Contrato comum

`provider-interface.js` fornece:

- `ProviderError`, com código e status sem expor credenciais;
- `normalizeMessages`, que reduz o histórico a mensagens de usuário/assistente;
- `requestJson`, que padroniza JSON, falhas de rede/CORS, status HTTP e ID de diagnóstico;
- `providerErrorMessage`, que converte falhas técnicas em mensagens compreensíveis.

Um adaptador recebe `apiKey`, `model`, `messages`, `instructions`, `temperature`, `maxTokens` e `signal`. Ele retorna, quando disponível:

```js
{
  text: "resposta final",
  usage: { input_tokens: 10, output_tokens: 20, total_tokens: 30 },
  requestId: "id-do-provedor"
}
```

O Manus também retorna `taskId`, porque seu contrato público é assíncrono.

## Adicionar um provedor

1. Crie `js/providers/meu-provedor.js`.
2. Normalize o histórico com `normalizeMessages`.
3. Use `requestJson` e mantenha a chave somente no argumento da chamada.
4. Converta o payload para `text` e `usage` sem assumir posições frágeis na resposta.
5. Lance `ProviderError` para chave ausente, rede, CORS, autenticação, limite e timeout.
6. Importe o adaptador em `js/app.js`.
7. Adicione-o a `providers`, `liveRequesters` e `modelOptions`.
8. Atualize o README, `docs/providers.md` e `docs/provider-references.md`.
9. Teste sintaxe e comportamento sem inserir uma chave no repositório.

A UI não deve conhecer endpoints, nomes de headers, formatos de resposta ou regras de polling de nenhum fornecedor.

## Estado local

`loadWorkspace` carrega um schema versionado com conversas, preferências e configurações não sensíveis. Chaves não entram nesse objeto. Conversas incluem `provider`, mensagens, `preview`, `time` e, quando necessário, `remoteTaskIds.manus` para continuar uma tarefa Manus sem misturá-la com outro provedor.

## Fluxo de envio

1. O usuário envia uma mensagem.
2. A conversa local é atualizada e persistida.
3. A UI mostra o estado de carregamento.
4. Se houver chave de sessão e adaptador, o adaptador é chamado; caso contrário, a resposta de demonstração é usada.
5. A resposta normalizada é anexada ao histórico e renderizada.
6. Erros são convertidos em uma mensagem segura, sem imprimir a chave.

## Próxima evolução

Para produção, mover adaptadores para um backend, associar chaves a usuários autenticados, implementar rate limiting, streaming, auditoria sem segredos, cancelamento e uma tabela de preços versionada.
