# UpLaudo — Dr. Ryan Maia

## Antes de qualquer tarefa

Leia estes arquivos, nesta ordem:

1. `docs/Visao.md`
2. `docs/Decisoes.md`
3. `docs/Pendencias.md`
4. `docs/Contrato.md`

Depois leia o `docs/Diario.md` apenas se precisar do histórico de alguma alteração
específica.

Antes de alterar qualquer função, procure o nome dela na coluna "Mora em" do
`Contrato.md`. Se aparecer, você está em terreno protegido: teste os
comportamentos ligados a ela antes de entregar e relate item por item.

## Regras que vêm desses arquivos

- **Nunca proponha algo marcado como "Descartado"** em `Decisoes.md`.
- Se um item estiver marcado como **EM CONFLITO**, pare e pergunte ao Dr. Ryan
  antes de escrever código naquele ponto.
- Para mudar uma decisão antiga: não apague. Marque
  `Status: substituída em AAAA-MM-DD` e escreva a nova logo abaixo, com o motivo.

## Como trabalhar no código

- Parta sempre de `laudo-us-multimodal.html` (ou da versão mais recente que o
  Dr. Ryan enviar na conversa). **Nunca reescreva o app do zero.**
- Aplique **só** o que foi pedido.
- Entregue sempre o arquivo HTML completo e funcional, testado quando possível.
- Não invente diagnósticos.
- Não altere medidas, categorias, condutas ou fraseologia por iniciativa própria.
- Não adicione dependências externas — o app roda offline, em arquivo único.

## Comunicação

- Responder sempre em português brasileiro, direto e técnico.
- Fluxo iterativo: o Dr. Ryan traz listas de ajustes depois de testar nos plantões.

## Ao terminar a sessão

Atualize, na pasta `docs/`:

1. `docs/Decisoes.md` — se alguma escolha nova foi feita ou alguma antiga substituída
2. `docs/Pendencias.md` — marque o que foi concluído, acrescente o que surgiu
3. `docs/Contrato.md` — se algum comportamento novo passou a ser protegido, ou se
   a coluna "Mora em" mudou de função
4. `docs/Diario.md` — nova entrada no topo, seguindo o modelo do fim do arquivo

Inclua essas alterações no mesmo commit/PR da mudança de código.
