# Segurança, privacidade e CORS

## Chaves

Uma chave digitada no navegador não vira um segredo confiável. O IA Hub não a grava no `localStorage`, não a inclui no JSON exportado e não a imprime no console, mas ela ainda pode ser extraída do ambiente do cliente. Use chaves de curta duração ou com escopo e limite quando o provedor permitir; revogue imediatamente uma chave exposta.

Nunca publique chaves em repositórios, HTML, CSS, JavaScript, screenshots ou mensagens. Em produção, envie a solicitação para um backend autenticado e guarde a chave em variável de ambiente ou gerenciador de segredos.

## Dados locais

O histórico e as preferências não sensíveis ficam no navegador do usuário. Limpar dados do site, modo privado, quota cheia ou políticas do navegador podem apagar ou impedir a persistência. Exportações são criadas localmente e devem ser tratadas como dados potencialmente sensíveis.

O texto enviado a um provedor segue a política de retenção, treinamento, segurança e faturamento daquele provedor. Não envie código proprietário, dados pessoais ou segredos sem autorização e sem avaliar os termos aplicáveis.

## CORS

Uma página estática só consegue ler respostas de uma origem externa quando o provedor autoriza a origem por CORS. `mode: no-cors` não resolve uma integração de chat, porque impede que o JavaScript leia o corpo da resposta. Quando a chamada direta falha, use o modo de demonstração ou um proxy/backend autorizado; não tente contornar a política do provedor.

## Erros e logs

O código transforma erros em mensagens genéricas para o usuário. IDs de requisição podem ser usados em diagnósticos, mas nunca devem ser acompanhados de chaves, prompts secretos ou dados pessoais em logs públicos.

## Uso autorizado

O projeto deve ser usado apenas com contas, aplicativos, código e dados autorizados. O fato de uma IA conseguir analisar um artefato não concede permissão para acessá-lo ou redistribuí-lo.
