---
title: Visão — UpLaudo
type: note
tags: [projeto, uplaudo]
updated: 2026-08-01
---

# Visão — UpLaudo

> Arquivo estável. Muda pouco. Leia antes de qualquer tarefa.

## O que é

Aplicativo web de laudos de ultrassom montados por **frases clicáveis**, organizado
em abas por modalidade. Arquivo HTML único, funciona offline, sem dependências
externas.

Arquivo principal: `laudo-us-multimodal.html`

## Para quem

Radiologistas e médicos que fazem ultrassom, incluindo em plantão e no celular.

## Conceito central — "silêncio = normal"

- Cada modalidade abre com a máscara normal completa já montada.
- Cada estrutura anatômica é um bloco com:
  - interruptor liga/desliga (desligado = some do laudo)
  - status normal / alterado
  - frases clicáveis de alterações comuns
  - campos de medida
- Medida em branco = a frase sai sem o trecho da medida.
- O que é clicado na descrição gera automaticamente a linha da IMPRESSÃO.
- Tudo normal → "Exame ultrassonográfico ... dentro dos padrões da normalidade."

## Padrões de linguagem (não alterar por conta própria)

- Fraseologia radiológica brasileira, padrão de serviço grande.
- Base: templates do LaudoVoz do Dr. Ryan.
- Medidas em cm com vírgula decimal (ex: 1,2 x 0,8 x 1,1).
- Vias biliares e veia porta em mm.
- Estrutura do laudo: TÍTULO em maiúsculas → ANÁLISE: → IMPRESSÃO:

## Fases do produto

- **Fase 1 (atual):** app HTML único, offline, dados no navegador.
- **Fase 2:** Firebase com login e máscaras na nuvem.
- **Fase 3:** domínio próprio e assinatura.

## O que este app NUNCA deve fazer

- Nunca ser reescrito do zero — desenvolvimento é sempre incremental.
- Nunca inventar diagnósticos.
- Nunca alterar medidas, categorias ou condutas por iniciativa própria.
- Nunca mudar a fraseologia do Dr. Ryan sem pedido explícito.
- Nunca depender de internet ou de biblioteca externa (fase 1).
