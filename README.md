# Engenharia reversa de aplicativos e softwares com apoio de IA

**Versão do guia:** 22 de outubro de 2026  
**Autor:** Carlos
**Apoio:** Manus & notebooklm

Este guia explica como estudar o funcionamento de aplicativos e softwares compilados, como combinar análise estática e dinâmica com modelos de IA e como montar um laboratório reproduzível. O material foi escrito para análise autorizada: software próprio, código aberto, amostras de treinamento, programas cujo proprietário autorizou o teste e dispositivos/ambientes sob seu controle.

Não use este conteúdo para roubar credenciais, criar malware, burlar licenças, contornar DRM, remover proteções de aplicativos de terceiros, interceptar dados de usuários ou acessar sistemas sem autorização. Em um trabalho profissional, guarde a autorização por escrito, limite o escopo, preserve evidências e não envie código proprietário ou dados pessoais para um serviço de IA sem aprovação.

## 1. O que é engenharia reversa

Engenharia reversa é o processo de inferir a estrutura, o comportamento e as decisões de um artefato a partir do artefato já construído. Em software, o artefato pode ser um executável, biblioteca, pacote Android, firmware, script empacotado, protocolo ou imagem de sistema.

O resultado não é necessariamente o código-fonte original. O objetivo pode ser documentar comportamento, localizar uma falha, entender compatibilidade, migrar uma integração, investigar um incidente, validar controles de segurança ou recuperar conhecimento de um sistema legado.

Há três perguntas diferentes:

1. **O que existe?** Arquivos, formatos, arquiteturas, bibliotecas, símbolos, strings, recursos e permissões.
2. **O que o programa faz?** Fluxo de controle, fluxo de dados, chamadas de API, arquivos, rede, criptografia, persistência e interação com o usuário.
3. **Em que condições ele faz isso?** Entradas, estados, configuração, ambiente, versão do sistema e respostas externas.

A análise confiável combina várias evidências. Um nome de função inferido pelo decompilador é uma hipótese; uma chamada observada em execução e confirmada pelo assembly é uma evidência mais forte.

## 2. Fundamentos necessários

### 2.1 Código-fonte, bytecode, assembly e máquina

Um compilador transforma código-fonte em uma forma executável. Em um binário nativo, instruções de máquina operam sobre registradores, memória, pilha e chamadas de funções. Em uma máquina virtual, como a ART do Android ou a JVM, existe uma etapa intermediária, como DEX ou bytecode Java.

O caminho típico é:

```text
código-fonte → compilador → objeto → linkedição → executável/biblioteca → carregador → processo
```

O descompilador tenta produzir uma aproximação em uma linguagem de alto nível. A aproximação pode perder tipos, nomes, comentários, macros, otimizações e a divisão original de módulos. Por isso, pseudocódigo decompilado deve ser lido junto com o assembly e o grafo de fluxo.

### 2.2 Conceitos que aparecem o tempo todo

- **ABI:** convenções que definem como funções recebem argumentos, retornam valores e usam registradores.
- **Calling convention:** regra de passagem de parâmetros e preservação de registradores.
- **Endianness:** ordem dos bytes na memória.
- **Seção:** região de um executável, como código, dados somente leitura, dados graváveis ou relocação.
- **Símbolo:** nome e metadados de uma função ou variável. Pode ser removido em uma build de produção.
- **String:** texto ou sequência de bytes que pode indicar mensagens, URLs, formatos, comandos ou nomes de APIs.
- **Cross-reference (xref):** local que referencia uma função, string, constante ou endereço.
- **CFG:** control-flow graph, grafo que mostra saltos e caminhos possíveis dentro de uma função.
- **Call graph:** grafo de chamadas entre funções.
- **Taint/data flow:** acompanhamento de um dado desde sua origem até seus usos e destinos.
- **Hook:** observação ou substituição temporária de uma função em execução.
- **Instrumentação:** inserção de observabilidade no processo, normalmente sem recompilar o aplicativo.
- **Obfuscação:** transformação que dificulta leitura, como renomeação, flattening de fluxo, strings codificadas e empacotamento.

### 2.3 O que pode e o que não pode ser recuperado

Com símbolos e informação de debug, a análise costuma ser mais simples. Sem eles, ferramentas ainda recuperam funções e estruturas aproximadas, mas não conseguem reconstruir fielmente nomes e intenções originais. Otimizações podem fundir funções, eliminar variáveis e reordenar operações. Um resultado profissional registra o grau de confiança e a evidência que sustenta cada conclusão.

## 3. Ciclo profissional de análise

### Fase 0 — autorização e escopo

Antes de abrir o arquivo, registre proprietário, finalidade, versão, hash, ambiente, permissões concedidas, restrições e prazo. Separe análise autorizada de qualquer tentativa de acessar serviço remoto.

### Fase 1 — preservação e triagem

Faça uma cópia somente leitura e calcule o hash. Não execute o arquivo desconhecido no computador pessoal. Identifique o formato e a arquitetura, extraia metadados e faça uma primeira leitura de strings e imports.

Exemplo de triagem em Linux para um arquivo próprio:

```bash
mkdir -p caso/{original,triagem,estatica,dinamica,evidencias,relatorio}
cp ./meu-programa caso/original/
sha256sum caso/original/meu-programa | tee caso/evidencias/hash.txt
file caso/original/meu-programa | tee caso/triagem/file.txt
readelf -h caso/original/meu-programa > caso/triagem/elf-header.txt
strings -a -n 6 caso/original/meu-programa > caso/triagem/strings.txt
```

Para PE no Windows, use as ferramentas equivalentes do Sysinternals, Detect It Easy, PE-bear ou a visão de headers do Ghidra/IDA. Para APK, preserve o arquivo original e o hash antes de decodificar.

### Fase 2 — análise estática

A análise estática não executa o alvo. O roteiro geral é:

1. importar o arquivo com a arquitetura correta;
2. deixar a ferramenta analisar funções e referências;
3. localizar o ponto de entrada e bibliotecas relevantes;
4. procurar strings, URLs, nomes de APIs, formatos de arquivo e mensagens de erro;
5. renomear funções somente quando houver evidência;
6. anotar argumentos, retornos, estruturas e hipóteses;
7. confirmar caminhos importantes no assembly e no grafo;
8. exportar notas e artefatos sem alterar o original.

O Ghidra é uma plataforma de engenharia reversa com disassembly, decompilação, grafos e scripts, e suporta análise interativa ou automatizada em várias plataformas [1]. O JADX produz uma aproximação em Java a partir de DEX e APK, mas a própria documentação alerta que não consegue decompilar 100% dos casos [2]. O Apktool decodifica recursos e manifesto do APK para inspeção e pode reconstruí-los, mas reconstrução não significa recuperar o projeto original [3].

### Fase 3 — análise dinâmica

A análise dinâmica observa um programa em execução. Use uma VM ou aparelho de teste descartável, sem contas pessoais e sem acesso desnecessário à rede. Registre processo, argumentos, arquivos abertos, conexões, carregamento de bibliotecas, chamadas importantes e mudanças de estado.

O Frida é um toolkit de instrumentação dinâmica que injeta JavaScript ou bibliotecas próprias em processos de várias plataformas, permitindo rastrear funções e criar ferramentas de diagnóstico [4]. Em um escopo autorizado, use-o para observar seu próprio aplicativo, validar uma hipótese ou reproduzir um teste, não para contornar controles de terceiros.

Exemplo conceitual de observação de uma função exportada em um binário de laboratório:

```javascript
// trace.js — use apenas em um processo de teste autorizado
const target = Module.findExportByName(null, "minha_funcao_de_teste");
if (target !== null) {
  Interceptor.attach(target, {
    onEnter(args) {
      console.log("minha_funcao_de_teste chamada");
    },
    onLeave(retval) {
      console.log("retorno: " + retval);
    }
  });
}
```

O exemplo é deliberadamente observacional. Não inclui bypass de autenticação, captura de segredos ou alteração de decisões de segurança.

### Fase 4 — confirmação e relatório

Cada achado deve ter: hipótese, evidência estática, evidência dinâmica, passos de reprodução no laboratório, impacto, confiança, limitações e recomendação. Diferencie claramente “observado”, “inferido” e “não confirmado”.

## 4. Famílias de ferramentas

### 4.1 Desktop e bibliotecas nativas

- **Ghidra:** opção gratuita e extensível para disassembly, decompilação, grafos e scripts [1].
- **IDA Pro + Hex-Rays:** plataforma comercial muito usada em análise de binários; confirme licença e versão.
- **Binary Ninja:** disassembler/decompiler interativo com ILs e automação.
- **x64dbg/WinDbg/lldb/gdb:** depuração de processos próprios e amostras de laboratório.
- **radare2/Cutter:** alternativa aberta para análise e scripting.
- **Detect It Easy, PE-bear, readelf, objdump, nm:** triagem de formato, arquitetura e símbolos.
- **Wireshark e mitmproxy:** análise de tráfego somente em ambiente e contas autorizados, preferencialmente com um serviço de teste controlado.

### 4.2 Android

- **JADX:** visualização aproximada de Java/Kotlin a partir de DEX/APK [2].
- **Apktool:** decodificação de recursos, manifesto e smali para inspeção [3].
- **Android SDK/adb/emulator:** instalação, logs, permissões e testes em emulador.
- **MobSF:** automação de triagem mobile em ambiente controlado.
- **Frida:** instrumentação dinâmica [4].
- **Ghidra/IDA/Binary Ninja:** análise de bibliotecas ELF nativas `.so`.

O OWASP MASTG destaca que Android pode envolver simultaneamente bytecode Java/Kotlin e código nativo, especialmente por JNI, e recomenda conhecer o ambiente Android e Linux para analisar os dois níveis [5].

Fluxo básico para um APK próprio:

```bash
sha256sum app-teste.apk
jadx -d saida-jadx app-teste.apk
apktool d -o saida-apktool app-teste.apk
apkanalyzer manifest permissions app-teste.apk
adb install -r app-teste.apk
adb logcat | tee logcat.txt
```

Analise o `AndroidManifest.xml`, permissões, activities exportadas, receivers, services, deep links, WebViews, armazenamento local e chamadas de rede. Não instale APK desconhecido em um aparelho com fotos, tokens, banco pessoal ou conta principal.

### 4.3 iOS e macOS

A análise normalmente envolve Mach-O, Objective-C/Swift, frameworks, entitlements, dyld e, quando autorizado, um simulador ou dispositivo de teste. O fluxo é análogo: identificar o pacote, analisar plist e entitlements, localizar classes e símbolos disponíveis, observar comportamento e confirmar hipóteses. Restrições de assinatura, sandbox e dispositivo tornam essencial trabalhar com um binário próprio ou explicitamente autorizado.

## 5. Como a IA ajuda

A IA não substitui o disassembler, o debugger nem a validação humana. Ela é mais útil em tarefas de compressão de contexto e geração de hipóteses:

- explicar uma função decompilada em linguagem simples;
- resumir dezenas de funções e agrupar possíveis módulos;
- sugerir nomes melhores para funções e variáveis;
- identificar chamadas de API relevantes;
- gerar consultas para localizar padrões;
- comparar duas versões de um binário ou de um APK;
- transformar notas em um relatório técnico;
- escrever scripts de Ghidra, IDA, Binary Ninja ou Frida para observabilidade;
- criar testes unitários para uma implementação própria compatível;
- montar uma linha do tempo a partir de logs;
- apontar contradições entre pseudocódigo, assembly e execução.

A IA é fraca quando recebe um bloco isolado sem arquitetura, convenção de chamada, contexto ou evidências. Também pode inventar o significado de uma constante, interpretar incorretamente um ponteiro, confundir código morto com código ativo ou sugerir um nome plausível mas errado.

### Regra de ouro

Peça ao modelo para separar **fato**, **inferência** e **pergunta em aberto**. Solicite endereço, trecho de assembly, xref ou log para cada conclusão. Depois confirme manualmente as conclusões de alto impacto.

## 6. Principais opções de IA e onde cada uma se encaixa

### 6.1 Modelos gerais com visão de código

ChatGPT/OpenAI, Claude/Anthropic e Gemini/Google são úteis para explicação de código, comparação de trechos, geração de scripts e síntese de relatórios. As interfaces e os nomes exatos de modelos mudam com frequência; escolha pelo suporte a contexto longo, análise de código, arquivos, visão, ferramentas e política de privacidade, não por um nome fixo.

A documentação da Anthropic recomenda definir critérios de sucesso e uma forma de avaliação antes de otimizar prompts [6]. A documentação do Gemini enfatiza instruções claras, contexto, restrições, exemplos few-shot e formatos estruturados [7]. A documentação da OpenAI recomenda instruções explícitas, separação entre instrução e contexto, saídas estruturadas e testes de avaliação ao mudar modelos ou prompts [8].

### 6.2 IA integrada à ferramenta de binário

- **Binary Ninja Sidekick:** integração orientada a binários com busca semântica, recuperação de tipos, links para evidências, validação e notebook de análise [9].
- **IDAssist para IDA Pro:** plugin que integra LLMs, RAG, grafo semântico e sugestões revisáveis de nomes e tipos; sua página informa suporte a provedores como OpenAI, Anthropic, Ollama e LiteLLM [10]. Verifique a licença, a origem do plugin e a política de envio de dados antes de usar.
- **Plugins e MCPs de terceiros:** podem dar ao modelo acesso a funções, disassembly ou ao banco de dados da ferramenta. Exija revisão antes de qualquer alteração e desative escrita automática no início.

### 6.3 IDEs e agentes de código

GitHub Copilot, Claude Code, ferramentas do VS Code e outros agentes são úteis para scripts, parsers, automação e relatórios. O VS Code permite selecionar modelos, usar BYOK e conectar modelos locais como Ollama; alguns recursos, como agentes, dependem de tool calling [11]. Não dê a um agente terminal irrestrito em um diretório que contenha segredos ou amostras executáveis.

### 6.4 Modelos locais

Ollama, LM Studio e servidores compatíveis com APIs OpenAI/Anthropic permitem executar modelos localmente. Isso reduz o envio de propriedade intelectual para terceiros, embora não elimine riscos: o computador ainda pode registrar prompts, extensões podem exfiltrar dados e modelos locais podem ter menor capacidade.

Um fluxo local típico é:

```bash
# instalar Ollama conforme a documentação oficial do seu sistema
ollama pull qwen2.5-coder:14b
ollama run qwen2.5-coder:14b
```

Use um modelo local para triagem e explicações de baixo risco. Para achados críticos, compare a saída com um segundo modelo ou com análise manual. O nome e a disponibilidade dos modelos mudam; confirme no catálogo do provedor antes de fixar uma configuração.

## 7. Configuração recomendada de um laboratório

### 7.1 Separação de ambientes

Use uma VM ou emulador dedicado. Crie um snapshot limpo. Desative pastas compartilhadas, clipboard compartilhado e drag-and-drop quando não forem necessários. Restrinja a rede a um segmento de teste. Use DNS e endpoints falsos apenas em uma rede que você controla. Nunca inclua tokens, chaves privadas, cookies, dados pessoais ou credenciais reais nos arquivos enviados à IA.

### 7.2 Estrutura de caso

```text
caso/
├── original/       # cópia intocada, somente leitura
├── triagem/        # hashes, file type, headers, strings
├── estatica/       # projetos Ghidra/IDA, pseudocódigo, xrefs
├── dinamica/       # logs, traces, dumps autorizados
├── scripts/        # scripts versionados e revisados
├── evidencias/     # capturas, checksums e artefatos
└── relatorio/      # hipóteses, achados e conclusão
```

Versione scripts e notas. Não versione segredos. Para cada arquivo gerado, registre origem, hash, ferramenta e versão.

### 7.3 Configurando uma IA na prática

1. Escolha o nível de confidencialidade: local, endpoint empresarial ou serviço público aprovado.
2. Escolha o modelo conforme a tarefa: rápido para classificação, forte em código para scripts, raciocínio para hipóteses complexas e visão para screenshots/diagramas.
3. Crie um prompt de sistema fixo com regras de segurança e formato de saída.
4. Envie somente o contexto necessário: função, callers, callees, assembly adjacente, strings e logs relevantes.
5. Peça respostas com confiança e evidências.
6. Salve prompt, modelo, data, temperatura/configuração e resposta no caso.
7. Avalie em uma amostra conhecida antes de usar em lote.
8. Não permita que a IA aplique renomeações, patches ou comandos sem revisão.

No VS Code, abra o seletor de modelos, use “Manage Language Models”, selecione um provedor ou configure BYOK/custom endpoint. A documentação oficial descreve também o uso de modelos locais e a exigência de tool calling para agentes [11]. Em plugins de IDA/Binary Ninja, comece com leitura apenas, configure um endpoint local ou empresarial e teste com um binário de treinamento.

## 8. Prompts prontos e seguros

### 8.1 Explicação de função

```text
Você é um analista de engenharia reversa em um laboratório autorizado.
Analise apenas o trecho fornecido. Não invente detalhes ausentes.

Contexto:
- Arquitetura: [x86-64/ARM64/...]
- Convenção de chamada, se conhecida: [..]
- Função: [endereço e nome atual]
- Callers: [lista]
- Callees: [lista]
- Strings/xrefs relevantes: [lista]

Trecho de pseudocódigo:
```c
[cole aqui]
```

Assembly adjacente:
```asm
[cole aqui]
```

Responda em quatro partes:
1. Fatos diretamente observáveis.
2. Interpretação provável do objetivo da função.
3. Hipóteses alternativas e o que as diferenciaria.
4. Próximas verificações seguras, indicando endereço, xref ou log que deve ser consultado.
Dê uma confiança de 0 a 100 para cada conclusão. Não proponha bypass de autenticação, DRM ou controle de acesso.
```

### 8.2 Sugestão de nomes

```text
Com base somente no código e nas referências abaixo, proponha até cinco nomes semânticos para a função e para suas variáveis.
Para cada nome, explique a evidência e atribua confiança.
Não altere nada automaticamente. Se a evidência for insuficiente, use um nome neutro como sub_XXXX.
```

### 8.3 Investigação de fluxo de dados

```text
Rastreie o valor que nasce em [origem] até [destino] neste conjunto de funções.
Liste cada transformação, cópia, validação, serialização e chamada externa.
Marque cada passo como OBSERVADO no código, OBSERVADO no log ou INFERIDO.
Aponte caminhos que não podem ser confirmados com o material fornecido.
Não inclua técnicas para extrair segredos ou contornar controles.
```

### 8.4 Geração de script de análise

```text
Escreva um script somente leitura para [Ghidra/IDA/Binary Ninja/Frida].
Objetivo: [por exemplo, listar funções que chamam uma API específica].
Restrições:
- não modificar nomes, tipos, bytes, memória ou arquivos do alvo;
- não exfiltrar dados;
- imprimir endereço, nome atual e evidência;
- tratar erros e versões incompatíveis;
- incluir instruções de instalação e um teste mínimo em um binário de laboratório.
Antes do código, explique o plano em cinco linhas. Depois, inclua limitações e como validar o resultado manualmente.
```

### 8.5 Comparação entre versões

```text
Compare as duas descrições abaixo de uma forma compatível com auditoria.
Não conclua que houve vulnerabilidade apenas porque uma função mudou.
Produza:
- mudanças observadas;
- impacto funcional provável;
- possíveis mudanças de segurança;
- evidências faltantes;
- testes seguros para confirmar;
- confiança por item.

Versão A:
[funções, imports, strings e logs]

Versão B:
[funções, imports, strings e logs]
```

### 8.6 Relatório de achado

```text
Transforme as notas em um achado técnico.
Use os campos: título, escopo, pré-condições, evidência, reprodução em laboratório autorizado,
impacto, probabilidade, limitação, correção recomendada e confiança.
Não inclua dados pessoais, segredos, instruções ofensivas ou passos para atacar terceiros.
Diferencie claramente o que foi observado do que é hipótese.
```

## 9. RAG, automação e agentes

Para projetos grandes, crie um índice local de documentação do próprio produto, símbolos, convenções de dados, changelogs e relatórios anteriores. Um pipeline RAG pode recuperar funções relacionadas, mas o texto recuperado não é prova. Cada resposta deve apontar para o endereço e para o artefato de origem.

Uma automação segura tem este formato:

```text
extrair metadados → indexar funções → gerar resumo → registrar evidência → revisão humana → aplicar anotação aprovada
```

Evite o formato “agente com terminal livre”. Se for necessário usar ferramentas, aplique allowlist: leitura de arquivos do caso, comandos sem rede e saída para um diretório de resultados. Faça o agente pedir aprovação antes de escrever no banco de dados da ferramenta, executar um binário, alterar memória ou acessar rede.

## 10. Validação e qualidade

Use uma lista de verificação antes de aceitar uma conclusão:

- a arquitetura e o formato foram identificados corretamente;
- o trecho foi analisado no contexto de callers e callees;
- o decompilador não apresentou erro relevante;
- a hipótese é consistente com assembly, strings e dados;
- o comportamento foi reproduzido em ambiente autorizado quando possível;
- a versão da ferramenta e do modelo foi registrada;
- a IA recebeu dados suficientes e não recebeu segredos desnecessários;
- outra pessoa consegue repetir o passo sem acesso ao seu raciocínio privado;
- a conclusão separa fato, inferência e incerteza.

Para medir uma IA, monte um conjunto pequeno de funções com respostas conhecidas. Compare nomes sugeridos, classificação de funções, identificação de APIs, falsos positivos e citações de evidência. Não use apenas “pareceu uma boa resposta” como métrica.

## 11. Erros comuns

**Confiar no pseudocódigo como se fosse o fonte original.** Leia o assembly quando tipos, ponteiros, aritmética ou chamadas forem importantes.

**Enviar o APK ou binário inteiro para um chatbot público.** Isso pode expor propriedade intelectual, dados pessoais, chaves embutidas e material sujeito a contrato.

**Pedir “explique tudo” sem contexto.** Divida a análise por função, módulo e pergunta verificável.

**Permitir alterações automáticas.** Sugestão de nome, patch ou comando deve passar por revisão e ser reversível.

**Executar a amostra fora da VM.** Preservar o computador pessoal é parte do método, não um detalhe.

**Confundir string com comportamento.** Uma URL ou nome de API pode estar morto, ser de teste ou ser apenas mensagem.

**Ignorar código nativo no Android.** O APK pode delegar a lógica crítica para `.so` via JNI [5].

**Usar modelo com nome instável em produção.** Fixe uma versão quando o provedor permitir e mantenha avaliações, como recomenda a documentação de prompting da OpenAI [8].

## 12. Roteiros de estudo

### Iniciante

Aprenda C básico, ponteiros, memória, processos, ELF/PE, assembly x86-64 e ARM64. Depois use Ghidra em pequenos programas que você mesmo compilou com símbolos e sem otimização. Compare código-fonte, assembly e pseudocódigo.

### Intermediário

Compile o mesmo programa com otimizações diferentes. Remova símbolos, observe o efeito no decompilador, analise chamadas de biblioteca, construa um call graph e use um debugger para confirmar uma hipótese.

### Android

Crie um APK de laboratório com permissões controladas, armazenamento local e uma biblioteca nativa simples. Analise manifesto, DEX, smali e `.so`; em seguida observe logs e chamadas em um emulador sem dados reais. Use o OWASP MASTG como lista de testes e referências [5].

### Avançado

Estude ABI, compiladores, linkers, formatos binários, otimizações, exceções, TLS em aplicativos próprios, JNI, carregamento dinâmico e automação de análise. Integre scripts com CI para comparar builds e detectar mudanças inesperadas, sempre com revisão humana.

## 13. Checklist rápido de execução

1. Tenho autorização e escopo documentados?
2. O alvo foi copiado, hasheado e isolado?
3. O ambiente de execução é descartável?
4. Identifiquei formato, arquitetura e versão?
5. Fiz triagem antes de interpretar funções?
6. Tenho uma hipótese concreta por vez?
7. Registrei xrefs, endereços e artefatos?
8. Usei IA para acelerar, não para substituir a evidência?
9. Removi segredos e dados pessoais do prompt?
10. Validei conclusões importantes por uma segunda evidência?
11. Desabilitei alterações automáticas do agente?
12. O relatório permite reprodução por outra pessoa autorizada?

## Referências

[1]: https://www.nsa.gov/serve-from-netstorage/ghidra/index.html "Ghidra — página oficial da NSA"

[2]: https://github.com/skylot/jadx "JADX — repositório e documentação oficial"

[3]: https://apktool.org/ "Apktool — página oficial"

[4]: https://frida.re/docs/home/ "Frida — documentação oficial"

[5]: https://mas.owasp.org/MASTG/techniques/android/MASTG-TECH-0013/ "OWASP MASTG — Reverse Engineering Android Apps"

[6]: https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview "Anthropic — Prompt engineering overview"

[7]: https://ai.google.dev/gemini-api/docs/prompting-strategies "Google Gemini API — Prompt design strategies"

[8]: https://platform.openai.com/docs/guides/prompt-engineering "OpenAI — Prompt engineering guide"

[9]: https://sidekick.binary.ninja/ "Binary Ninja Sidekick — AI-powered reverse engineering"

[10]: https://plugins.hex-rays.com/symgraph/IDAssist/IDAssist "IDAssist — plugin de IA para IDA Pro"

[11]: https://code.visualstudio.com/docs/agent-customization/language-models "VS Code — AI language models"
