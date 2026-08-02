---
title: Decisões — UpLaudo
type: note
tags: [projeto, uplaudo]
updated: 2026-08-01
---

# Decisões — UpLaudo

> Arquivo mais importante do projeto.
> **Nunca apagar decisão antiga.** Se mudar, marcar "Status: substituída em AAAA-MM-DD"
> e escrever a nova abaixo. O campo "Descartado" existe para não propor de novo o
> que já foi recusado.

---

## Arquitetura: HTML único, offline
**Status:** ativo
**Decidido:** um arquivo HTML só, sem dependências externas, rodando offline.
**Motivo:** precisa funcionar no plantão e no celular sem internet.
**Descartado:** frameworks, bibliotecas de CDN, backend na fase 1.

## Método de entrada: frases clicáveis, sem IA
**Status:** ativo
**Decidido:** montagem do laudo por cliques em frases pré-prontas.
**Motivo:** rápido, previsível, sem custo e sem risco de invenção de achado.
**Descartado:** geração por IA na fase 1 (adiada para fase posterior).

## Desenvolvimento incremental
**Status:** ativo
**Decidido:** sempre partir do arquivo atual, aplicar só o pedido e devolver o
HTML completo e funcional.
**Motivo:** o app já tem comportamento testado em plantão que não pode se perder.
**Descartado:** reescrever do zero a cada ciclo.

## Regra "silêncio = normal"
**Status:** ativo
**Decidido:** máscara normal completa já montada; estrutura desligada some do laudo;
medida em branco = frase sem medida.
**Motivo:** reproduz o fluxo real de quem lauda — só se mexe no que está alterado.

## Vínculo automático descrição → impressão
**Status:** ativo
**Decidido:** o clique na descrição gera sozinho a linha da impressão.
Ex.: ecogenicidade hepática aumentada moderada → "Sinais sugestivos de esteatose
hepática grau moderado."
**Motivo:** elimina a etapa mais repetitiva do laudo.

## Unidades e formato
**Status:** ativo
**Decidido:** cm com vírgula decimal; vias biliares e veia porta em mm;
laudo em TÍTULO → ANÁLISE: → IMPRESSÃO:
**Descartado:** ponto decimal; padronizar tudo em mm.

## Armazenamento das preferências (fase 1)
**Status:** ativo
**Decidido:** salvar no próprio navegador (localStorage).
**Motivo:** funciona offline e não exige login.
**Substituição prevista:** fase 2, com Firebase e conta de usuário.

---

## ⚠️ DECISÃO EM CONFLITO — resolver antes de codar

### Máscara personalizada do usuário
**Status:** EM CONFLITO — Dr. Ryan precisa definir.

**Versão A (instruções do projeto, backlog nº 1):**
campo para a pessoa colar o laudo normal completo dela; o app distribui as frases
pelos blocos por palavras-chave (Fígado, Vesícula, Rins...), com ajuste manual,
e esse modelo vira o padrão salvo.

**Versão B (decisão anterior de conversa):**
máscaras FIXAS — o app oferece algumas opções básicas prontas e a pessoa só escolhe
entre elas. Colar a própria fica para depois. As **frases de alteração**, essas sim,
podem ser editadas e criadas pelo usuário e ficam salvas no navegador.

**Pendente:** escolher A ou B, marcar a outra como descartada com o motivo.
