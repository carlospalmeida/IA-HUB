# Instalação e execução local

## Requisitos

- Git;
- Python 3, Node.js ou outro servidor HTTP estático;
- um navegador moderno com suporte a módulos ES;
- uma chave criada na plataforma do provedor escolhido, somente se você quiser sair do modo de demonstração.

## Passo a passo

```bash
git clone <URL-DO-REPOSITORIO>
cd iahub
python3 -m http.server 3000 --bind 127.0.0.1
```

Acesse `http://127.0.0.1:3000`. Não abra o arquivo diretamente com `file://`, porque o navegador pode bloquear os módulos JavaScript por política de origem.

## Testes rápidos

```bash
for file in js/app.js js/storage.js js/providers/*.js; do node --check "$file"; done
python3 -m json.tool manus-routes.json >/dev/null
git diff --check
```

## Usar um provedor

Abra o modal de configurações, selecione um provedor, escolha um modelo aceito pela sua conta, informe a chave de sessão e salve. O IA Hub não cria as chaves para você e não deve recebê-las por issue, pull request ou mensagem pública.

Se o navegador exibir uma falha CORS, isso não é corrigido com `mode: no-cors`: essa opção impediria a leitura da resposta. Use o modo de demonstração ou configure um backend/proxy seguro para o ambiente de produção.

## Publicação estática

A interface pode ser publicada em um host estático, mas o modo direto com chave não deve ser habilitado como serviço público. Para uma publicação pública, mantenha as chamadas reais desativadas até existir um backend com autenticação e gestão de segredos.
