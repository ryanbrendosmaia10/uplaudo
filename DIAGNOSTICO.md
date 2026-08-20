# Diagnóstico — "a API não está funcionando" (LaudoVoz IA / UpLaudo)

**Escopo desta tarefa: só diagnóstico.** Nenhum arquivo de código foi alterado, corrigido ou "melhorado". As
correções já preparadas anteriormente (PR #6, branch `claude/laudovoz-report-generator-wmk93t`) **não foram
mergeadas nem tocadas** durante este diagnóstico.

**Aviso de método, antes de tudo**: este ambiente roda atrás de um proxy de egress que bloqueia por política o
domínio `uplaudos.com`/`www.uplaudos.com` (confirmado no próprio log do proxy — ver Parte 1.5). Isso significa que
**não consegui fazer nenhuma chamada de rede real contra a produção**. Todo o diagnóstico abaixo foi feito por (a)
reprodução local do código nos commits relevantes e (b) leitura de código/histórico do git. Onde a evidência é
local e não a URL real de produção, isso está marcado explicitamente.

---

## PARTE 1 — Reproduzir a falha

### 1.1 `npm ci` e `npm run build` no estado atual do `main` (commit `999b647`)

**`npm ci` FALHA** — o `package-lock.json` está fora de sincronia com o `package.json`:

```
npm error Missing: mime-types@2.1.35 from lock file
npm error Missing: delayed-stream@1.0.0 from lock file
npm error Missing: es-errors@1.3.0 from lock file
npm error Missing: get-intrinsic@1.3.0 from lock file
npm error Missing: has-tostringtag@1.0.2 from lock file
npm error Missing: @paralleldrive/cuid2@2.3.1 from lock file
npm error Missing: dezalgo@1.0.4 from lock file
npm error Missing: once@1.4.0 from lock file
npm error Missing: @noble/hashes@1.8.0 from lock file
npm error Missing: asap@2.0.6 from lock file
npm error Missing: wrappy@1.0.2 from lock file
npm error Missing: call-bind-apply-helpers@1.0.2 from lock file
npm error Missing: es-define-property@1.0.1 from lock file
npm error Missing: es-object-atoms@1.1.2 from lock file
npm error Missing: function-bind@1.1.2 from lock file
npm error Missing: get-proto@1.0.1 from lock file
npm error Missing: gopd@1.2.0 from lock file
npm error Missing: has-symbols@1.1.0 from lock file
npm error Missing: math-intrinsics@1.1.0 from lock file
npm error Missing: dunder-proto@1.0.1 from lock file
npm error Missing: mime-db@1.52.0 from lock file
npm error
npm error Clean install a project
```

Causa raiz do próprio erro: `package.json` em `main` declara `"formidable": "^3.5.1"` e `"form-data": "^4.0.0"`
nas dependências (adicionadas para o `api/whisper.js`), mas o `package-lock.json` tem **zero** ocorrências de
`formidable` ou `form-data` — ele nunca foi regenerado com `npm install` depois que essas dependências foram
adicionadas ao `package.json` (aparentemente editado direto pelo GitHub, sem rodar `npm install` localmente).

A Vercel usa `npm ci` como comando de instalação padrão quando detecta `package-lock.json` no projeto. **Isso
significa que qualquer novo deploy automático de `main` hoje falharia já na etapa de instalação de dependências.**

Prossegui com `npm install` (não `npm ci`) só para conseguir chegar à etapa de build:

```
added 80 packages, and audited 81 packages in 6s
22 packages are looking for funding
1 high severity vulnerability
```

**`npm run build` FALHA:**

```
> laudovoz-ia@0.0.0 build
> vite build

vite v8.2.0 building client environment for production...
transforming...✓ 16 modules transformed.
rendering chunks...
✗ Build failed in 494ms
error during build:
Build failed with 1 error:

[MISSING_EXPORT] "default" is not exported by "src/LaudoVozIA.jsx"
   ╭─[ src/main.jsx:4:8 ]
 4 │ import LaudoVozIA from "./LaudoVozIA.jsx";
   │        ─────┬────
   │             ╰────── Missing export
```

Causa: `src/LaudoVozIA.jsx` em `main` foi sobrescrito com um fragmento JSX solto de 40 linhas — sem `import`,
sem `export default`, aparentando ser a cópia de só um trecho de uma resposta de IA colado por cima do arquivo
inteiro (edição feita direto no GitHub, fora de qualquer sessão desta ferramenta). Verifiquei o conteúdo real:

```
{/* Onde renderiza a lista de alterações no modo por cliques: */}
<div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 p-3 overflow-y-auto min-h-48">
  ...
</div>
```
(40 linhas ao todo, sem nenhuma declaração de componente.)

### 1.2 `npm run dev` no `main` atual

O servidor Vite sobe normalmente (`HTTP 200` na raiz), mas a página fica **completamente em branco**. Com
Playwright, capturei o erro de runtime:

```
[pageerror] The requested module '/src/LaudoVozIA.jsx' does not provide an export named 'default'
```

`document.body.innerText` = `""` (vazio). Não há nenhuma mensagem de erro visível para o usuário — é uma tela
branca sem nenhum indício do que houve.

### 1.3 Testando cada função — mas contra o commit REAL de produção, não contra `main`

Antes de testar as funções, precisei corrigir minha premissa: o contexto da tarefa diz que produção está travada
no rollback para o commit **`f58bc78`** ("Add files via upload"). Esse commit é **anterior** a toda a corrupção
que encontrei em `main` (a corrupção começou em commits posteriores — ver Parte 2, H6/H7). Ou seja: **o app que
está realmente no ar hoje não é o `main` quebrado que reproduzi acima.** Testei `f58bc78` separadamente (worktree
git local, sem tocar no branch principal):

- `npm ci` em `f58bc78`: **sucesso limpo** (lockfile em sincronia nesse ponto do histórico).
- `npm run build` em `f58bc78`: **sucesso**, `dist/` gerado sem erros nem warnings.
- App carrega normalmente na tela (não fica em branco).

Com o app rodando (via `npm run dev`, ver ressalva na seção 1.4 sobre essa limitação), testei:

**a) Montar por cliques (não usa API)** → **FUNCIONOU.** Cliquei em "Esteatose leve" no exame Abdome Total e o
editor à direita foi preenchido corretamente com o texto do laudo, substituindo a frase normal do Fígado. Este
recurso não depende de nenhuma API externa e está saudável.

**b) Ditado + IA (usa `/api/claude`)** → **Erro visível na tela**, mas por uma limitação do meu método de teste,
não necessariamente da produção real (detalhado em 1.4 abaixo).

**c) Gravação de áudio / transcrição via Whisper** → **O recurso simplesmente não existe no código de produção.**
Não há botão de gravação, não há chamada a `/api/whisper`, e o arquivo `api/whisper.js` **não existe** nesse
commit (confirmado por `git ls-tree`). Isso é consistente com o que o médico relatou ("algumas coisas que foram
configuradas" não aparecem): a funcionalidade de Whisper só foi adicionada no commit `6a929bd`, que é exatamente
o commit que o rollback descartou (ver H7).

### 1.4 Console + Network ao testar "Ditado + IA"

**Ressalva de método importante**: `npm run dev` (Vite) **não executa as funções serverless da pasta `api/`** —
isso só acontece de fato dentro da infraestrutura da Vercel (ou com `vercel dev`, que não usei, pois a tarefa
pediu para não instalar/autenticar nada). Então o teste abaixo confirma **o comportamento do front-end** (para
onde ele manda a requisição, com que payload, como trata a resposta), mas o **404 que apareceu é esperado do
Vite em modo dev e não reflete o comportamento real da função na Vercel**.

```
REQ  POST http://localhost:5200/api/claude
RESP 404 http://localhost:5200/api/claude :: (corpo vazio)
```

```
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
```

Erro mostrado na tela para o usuário:

> Falha ao gerar o laudo: Failed to execute 'json' on 'Response': Unexpected end of JSON input

Isso é relevante mesmo sendo um artefato do dev-mode: mostra que o código do front-end faz `await response.json()`
sem checar `response.ok` primeiro, e sem tratar o caso de a resposta não ser JSON válido. Se a Vercel devolver um
erro de plataforma (por exemplo uma página HTML de erro, ou uma função ausente/quebrada) em vez de um JSON de
erro estruturado, o médico veria essa mesma mensagem técnica incompreensível.

O que também ficou confirmado por esse teste: a requisição foi disparada corretamente para a URL relativa
`/api/claude` (não uma URL absoluta errada) e o corpo enviado tem exatamente a estrutura esperada (system prompt
+ máscara + transcrição) — o front-end está se comportando como deveria até o ponto em que a rede entra em jogo.

### 1.5 `curl` contra a produção real

**Não verificável a partir deste ambiente.** O proxy de egress deste sandbox bloqueia por política o domínio
`uplaudos.com` (e também bloqueou `google.com` no mesmo teste, então não é algo específico do domínio — é uma
allowlist genérica de saída). Evidência do próprio proxy:

```
$ curl -v https://www.uplaudos.com/
* CONNECT tunnel: HTTP/1.1 negotiated
* Establish HTTP proxy tunnel to www.uplaudos.com:443
< HTTP/1.1 403 Forbidden
* CONNECT tunnel failed, response 403

$ curl "http://127.0.0.1:<proxy>/__agentproxy/status"
"recentRelayFailures": [
  { "kind": "connect_rejected", "detail": "gateway answered 403 to CONNECT (policy denial or upstream failure)", "host": "www.uplaudos.com:443" },
  { "kind": "connect_rejected", "detail": "gateway answered 403 to CONNECT (policy denial or upstream failure)", "host": "uplaudos.com:443" },
  { "kind": "connect_rejected", "detail": "gateway answered 403 to CONNECT (policy denial or upstream failure)", "host": "www.google.com:443" }
]
```

O 403 acima **é do proxy do meu ambiente**, não da Vercel nem do app. Não usei esse resultado em nenhuma
conclusão sobre o estado da produção. DNS resolve normalmente (`www.uplaudos.com` → `64.29.17.1` /
`216.198.79.65`, típico de Vercel), mas não consegui completar nenhum handshake TLS até o servidor real.

---

## PARTE 2 — Hipóteses

**H1 — Rotas `/api` nunca são chamadas / URL errada.**
**DESCARTADA.** `grep` em todo o `src/` (main e no commit de produção) não encontra nenhuma URL absoluta nem
domínio hardcoded (`.vercel.app`, `uplaudos`, etc.). A única chamada de API relacionada a laudo é
`fetch("/api/claude", ...)` — URL relativa, correta. Confirmado também dinamicamente: a requisição É disparada
para `/api/claude` quando o botão "Gerar laudo" é clicado (ver 1.4).

**H2 — A rota `/api` não existe no build / está no lugar errado.**
**DESCARTADA.** `git ls-tree -r --name-only` tanto em `f58bc78` (produção) quanto em `main` mostra `api/claude.js`
na raiz do repositório (exigência da Vercel), não dentro de `src/` ou `public/`. Em `main`, também existe
`api/whisper.js`, igualmente na raiz. Não há `vercel.json` em nenhum commit que pudesse estar redirecionando ou
quebrando essas rotas.

**H3 — Formato do handler incompatível (ESM vs CommonJS).**
**DESCARTADA.** `package.json` declara `"type": "module"` em todos os commits relevantes. Tanto `api/claude.js`
quanto `api/whisper.js` usam `import`/`export default async function handler(req, res)` de ponta a ponta —
nenhuma ocorrência de `require(` em nenhum arquivo de `api/`. Formato consistente com o `"type": "module"`.

**H4 — Variáveis de ambiente ausentes (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`).**
**NÃO VERIFICÁVEL.** A CLI da Vercel não está instalada neste ambiente e, conforme instruído, não instalei nem
autentiquei nada (`vercel whoami` falharia por falta de instalação; não tentei contornar isso). Este ponto só
pode ser confirmado pelo médico no painel da Vercel (Settings → Environment Variables), em Production.

**H5 — Chave inválida, sem crédito ou sem permissão (401/403/429).**
**NÃO VERIFICÁVEL.** Depende de uma chamada real à API com a chave de produção, que não tenho como fazer (nem
tenho a chave, nem tenho rede liberada para `api.anthropic.com`/`api.openai.com` a partir daqui com credenciais
reais). Só verificável pelo médico direto no painel da Vercel/Anthropic/OpenAI, ou pelos logs de Function da
Vercel quando uma invocação real acontecer.

**H6 — O commit `f58bc78` ("Add files via upload") sobrescreveu ou apagou arquivos.**
**DESCARTADA.** `git show --stat f58bc78`:
```
CLAUDE.md | 52 ++++++++++++++++++++++++++++++++++++++++++++++++++++
1 file changed, 52 insertions(+)
```
`f58bc78` só **adicionou** um arquivo `CLAUDE.md` (documentação de processo). Não tocou em nenhum arquivo de
código. O app nesse commit é, na prática, idêntico ao commit anterior (`7176fa6`), que por sua vez vem
diretamente do merge do PR #5 (`02b4c23`) — um estado que eu já tinha validado com build limpo e testes
anteriormente nesta mesma sessão.

**H7 — O rollback é a causa do sintoma (Whisper só existe no commit descartado).**
**CONFIRMADA.** `git diff f58bc78 6a929bd --stat`:
```
api/whisper.js | 62 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
1 file changed, 62 insertions(+)
```
A única diferença entre o que está em produção (`f58bc78`) e o commit descartado pelo rollback (`6a929bd`) é a
adição do `api/whisper.js`. Confirmei também que não há nenhuma referência a "Whisper" em `src/` no commit de
produção (`git grep` sem resultado) — ou seja, nem o botão, nem a chamada de fetch para `/api/whisper` existem
hoje no ar. **A funcionalidade de ditado por Whisper que o médico configurou nunca chegou a ir ao ar**: o
commit que a adicionou foi descartado pelo próprio rollback, dois dias atrás.

**H8 — Payload de áudio (multipart) e limite de 4,5 MB de body da Vercel.**
**NÃO APLICÁVEL À PRODUÇÃO ATUAL** (o arquivo não existe no deployment ativo — ver H7). Avaliando o código em
`main`, caso venha a ser promovido: `api/whisper.js` desativa o `bodyParser` padrão da Vercel
(`api: { bodyParser: false }`) e usa `formidable` para parsear o `multipart/form-data` manualmente — essa é uma
abordagem válida e correta para lidar com upload de arquivo numa função Vercel/Node. Quanto ao limite de 4,5 MB:
a duração máxima de gravação que caberia depende do bitrate do codec escolhido pelo `MediaRecorder` do navegador,
que o código **não fixa explicitamente** (`audioBitsPerSecond` não é definido). Para Opus/WebM (codec padrão de
voz no Chrome), bitrates típicos ficam entre ~32 kbps (voz) e ~128 kbps (padrão genérico do navegador quando não
especificado): a 128 kbps, 4,5 MB cabem em ~4,7 minutos de áudio; a 32 kbps, em ~19 minutos. **Não é possível
determinar o número exato sem medir o bitrate real do MediaRecorder no navegador de destino** — isso é uma
estimativa, não uma medição.

**H9 — Timeout de função.**
**PARCIALMENTE CONFIRMADA (achado de código, sem confirmação do plano Vercel).** `api/claude.js` define
explicitamente `export const config = { maxDuration: 60 }`. `api/whisper.js`, em contraste, define
`export const config = { api: { bodyParser: false } }` **sem `maxDuration`** — ou seja, fica sujeita ao timeout
padrão da conta/plano da Vercel (não verificável por mim qual é esse valor sem acesso ao painel). Se o plano for
Hobby com o padrão histórico de 10s, uma transcrição de áudio mais longa (upload + processamento no lado da
OpenAI) plausivelmente estouraria esse limite. As duas rotas fazem uma única chamada de rede e devolvem uma
única resposta JSON — não há streaming em nenhuma delas (confirmado lendo o código: ambas fazem
`await upstream.json()` e retornam de uma vez).

**H10 — Domínio (`www` vs apex) e CORS.**
**PARCIALMENTE VERIFICÁVEL.** Por código: não há nenhuma configuração de CORS (`Access-Control-Allow-Origin` ou
similar) em nenhuma das duas rotas de API, nem em `main` nem em produção — o que é coerente com front-end e API
sendo servidos do mesmo domínio (same-origin), então CORS não deveria ser um fator aqui de qualquer forma. Não
há `vercel.json` com regras de redirect entre `www.uplaudos.com` e `uplaudos.com`. **O comportamento real de
redirect entre os dois domínios não pôde ser testado** (bloqueio de rede, ver 1.5) — isso só a Vercel/o médico
podem confirmar no painel de Domains do projeto.

**H11 — Nome de modelo inválido/descontinuado.**
**NÃO VERIFICÁVEL COM CERTEZA (sem chave de API), mas com suspeita concreta que registro aqui.** `api/claude.js`
chama o modelo `"claude-sonnet-4-6"` (`src/LaudoVozIA.jsx`, linha do `fetch`). Não tenho como consultar a API da
Anthropic sem uma chave de produção válida. Registro como fato observável neste próprio ambiente: a lista de
IDs de modelo Claude atualmente vigentes que me foi informada nesta sessão é `claude-fable-5`, `claude-opus-5`,
`claude-sonnet-5` e `claude-haiku-4-5-20251001` — `claude-sonnet-4-6` não está nessa lista, o que é consistente
com ser um identificador de uma geração anterior (Claude 4.6) que pode já não estar mais disponível. Isso é uma
pista fundamentada, não uma confirmação — só uma chamada real à API (com chave válida) confirma se o modelo
retorna 404/`not_found_error` ou se ainda está ativo. Para o Whisper: o modelo usado é `"whisper-1"`
(`api/whisper.js`), que historicamente é um nome estável e de baixo risco de ter sido descontinuado — mas, de
novo, isso não está em produção hoje (H7).

---

## PARTE 3 — Veredito

### CAUSA RAIZ

Não há uma única causa — há (pelo menos) duas falhas independentes, uma delas explicando diretamente o sintoma
relatado, a outra sendo uma bomba-relógio que vai piorar as coisas se não for tratada antes de desfazer o
rollback:

1. **[Gravidade alta — explica o sintoma "coisas configuradas não funcionam"]** O rollback feito há 2 dias
   descartou exatamente e apenas o commit que adicionava `api/whisper.js` (H7, CONFIRMADA por diff de git). A
   funcionalidade de ditado por Whisper que o médico configurou (presumivelmente configurando
   `OPENAI_API_KEY` na Vercel esperando que funcionasse) **nunca esteve no ar** — o botão e a rota simplesmente
   não existem no deployment ativo hoje. Isso por si só já responde a metade do que ele descreveu.

2. **[Gravidade crítica, mas ainda não afeta produção — afeta o PRÓXIMO deploy]** `main` está com o build
   completamente quebrado: `npm ci` falha (lockfile fora de sincronia) e, mesmo contornando isso,
   `npm run build` falha (`src/LaudoVozIA.jsx` virou um fragmento sem `export default`, e `src/mascaras.js` tem
   texto de 3 exames substituído por um placeholder `"..."`, com 3 exames inteiros removidos). Isso não é a
   causa do sintoma atual (produção não está rodando `main`, está congelada em `f58bc78`), mas é crítico: **se o
   rollback for desfeito antes de corrigir `main`, o próximo auto-deploy vai quebrar a aplicação inteira (tela
   branca)** — um cenário pior do que o atual.

3. **[Não confirmável por mim, mas não descartável — pode ser a causa direta de "a API não funciona" mesmo para
   o que já está no ar]** Não consegui verificar se `ANTHROPIC_API_KEY` está configurada e válida em Production
   na Vercel (H4/H5, NÃO VERIFICÁVEL), nem se o modelo `claude-sonnet-4-6` usado em `api/claude.js` ainda é um
   ID de modelo ativo na Anthropic (H11, suspeita fundamentada mas não confirmada). Qualquer uma dessas duas
   coisas, isoladamente, faria a chamada "Gerar laudo" falhar mesmo com tudo o mais correto — e ambas são
   completamente independentes do rollback (rollback não mexe em env vars nem em qual modelo o código chama).

### POR QUE NÃO FOI PERCEBIDO

- Quando `src/LaudoVozIA.jsx` quebra (cenário 2, ainda não em produção), a tela fica **totalmente em branco, sem
  nenhuma mensagem** — nem um "algo deu errado", nada. Um usuário não teria como saber que é um problema de
  deploy e não, por exemplo, o próprio navegador.
- Quando a chamada a `/api/claude` falha (cenário 1 ou 3), o app **mostra**, sim, um banner vermelho — mas com o
  texto cru de uma exceção JavaScript (`"Unexpected end of JSON input"` ou similar), não uma frase que um
  médico sem contexto técnico associaria a "a chave da API está errada" ou "o modelo não existe mais". O
  `catch` em `gerarLaudo` engloba qualquer tipo de falha (rede, JSON malformado, erro HTTP) na mesma mensagem
  genérica `"Falha ao gerar o laudo: " + e.message`.
- Não existe nenhum monitoramento proativo (health check, alerta de erro, Sentry ou equivalente) — o painel de
  Observability da própria Vercel (127 Edge Requests, 0 Function Invocations em 6h) só é visto se alguém for lá
  checar manualmente, o que aparentemente só aconteceu quando o problema já estava sendo sentido no uso real.
- O aviso da própria Vercel de que o "auto-assign de domínio customizado foi desativado pelo rollback" é uma
  mensagem de painel administrativo — não é algo visível para quem só usa o app pelo domínio público; um médico
  não teria motivo para ir procurar essa informação sem saber que ela existe.

### CORREÇÃO PROPOSTA (não implementada — só descrita)

Por arquivo, no branch `claude/laudovoz-report-generator-wmk93t` (PR #6), que já contém a maior parte disto:

- **`package-lock.json`**: regenerar com `npm install` a partir do `package.json` atual de `main`, para voltar
  a incluir `formidable`/`form-data` e todas as transitivas, permitindo `npm ci` funcionar de novo. *(Já feito
  no PR #6.)*
- **`src/LaudoVozIA.jsx`**: restaurar a versão íntegra com `export default function LaudoVozIA()`. *(Já feito
  no PR #6, a partir do último commit íntegro.)*
- **`src/mascaras.js`**: restaurar o texto completo dos 7 exames (3 estavam com placeholder `"..."`, 3 tinham
  sumido inteiramente). *(Já feito no PR #6.)*
- **`src/alteracoes/prostata.js` e `transvaginal.js`**: já estavam com conteúdo correto, só faltava a extensão
  `.js` no nome do arquivo. *(Já corrigido no PR #6.)*
- **`api/whisper.js`**: adicionar `maxDuration` ao `config` (hoje só tem `bodyParser: false`), num valor
  compatível com o plano contratado da Vercel, para transcrições mais longas não estourarem o timeout padrão.
  *(Ainda não feito — não estava no escopo do PR #6.)*
- **`api/claude.js`** (ou o valor de `model` em `src/LaudoVozIA.jsx`): confirmar o ID `"claude-sonnet-4-6"`
  contra a documentação vigente da Anthropic e atualizar se estiver descontinuado. *(Precisa ser decidido/
  testado antes de aplicar — não implementei nenhuma troca.)*
- **`src/LaudoVozIA.jsx`, tratamento de erro em `gerarLaudo`**: melhorar a mensagem de erro mostrada ao usuário
  para diferenciar "sem resposta do servidor", "erro HTTP com corpo não-JSON" e "erro estruturado da API",
  em vez de um `e.message` genérico. *(Sugestão de melhoria, não crítica para o sintoma atual.)*
- **Fora do código, no painel da Vercel** (não é um arquivo, é uma ação administrativa): confirmar/definir
  `ANTHROPIC_API_KEY` e `OPENAI_API_KEY` em Production; decidir sobre desfazer o rollback e reabilitar o
  auto-assign do domínio customizado.

### RISCO DA CORREÇÃO

- **Reabilitar o auto-assign/desfazer o rollback antes de corrigir `main`** faria a Vercel promover
  automaticamente o `main` quebrado para produção — trocaria "Whisper não funciona" por "o app inteiro fica em
  branco". A ordem entre essas duas ações importa e é crítica.
- Trocar o `model` em `api/claude.js` sem testar pode trocar um erro por outro (parâmetros ou formato de
  resposta podem diferir entre gerações de modelo) — precisa ser validado num ambiente de preview antes de ir
  para produção.
- Adicionar `maxDuration` em `api/whisper.js` pode não resolver sozinho se o teto do plano contratado for menor
  que o necessário para transcrições realmente longas — pode ser necessário também limitar a duração máxima de
  gravação no front-end.
- O PR #6 traz a correção do build **junto** com a feature de Whisper (botão novo, `MediaRecorder`, etc.) num
  único commit — se o médico preferir isolar só o conserto do que já estava quebrado, valeria separar em dois
  PRs; isso é uma escolha dele, não uma decisão técnica que eu deva tomar sozinho.

### ORDEM SUGERIDA

1. **Decisão do médico**: desfazer o rollback agora (aceitando que o `main` atual quebraria o app até o passo 3
   ser concluído) ou manter a produção congelada em `f58bc78` enquanto o resto é resolvido primeiro. Recomendo
   a segunda opção.
2. **Decisão/ação do médico, fora do código**: confirmar no painel da Vercel se `ANTHROPIC_API_KEY` (e, quando
   for a hora, `OPENAI_API_KEY`) estão configuradas em Production — eu não tenho como verificar isso.
3. Merge do PR #6 (`claude/laudovoz-report-generator-wmk93t` → `main`) — resolve o build quebrado e a
   sincronização do lockfile.
4. Confirmar/atualizar o `model` em `api/claude.js` contra a documentação vigente da Anthropic (H11).
5. Adicionar `maxDuration` em `api/whisper.js` (H9).
6. Testar num deployment de **preview** da Vercel (não em produção) que "Gerar laudo" e a gravação por Whisper
   funcionam de ponta a ponta.
7. Só então, no painel da Vercel: reabilitar o auto-assign do domínio customizado e promover esse deployment
   para produção — desfazendo o rollback de forma controlada.
8. Testar manualmente em `www.uplaudos.com`, algo que eu não consegui fazer neste diagnóstico por causa do
   bloqueio de rede deste ambiente.
