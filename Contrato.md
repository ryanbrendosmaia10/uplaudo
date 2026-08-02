---
title: Contrato de Comportamento — UpLaudo
type: note
tags: [projeto, uplaudo]
updated: 2026-08-01
---

# Contrato de Comportamento

> Leia antes de tocar em qualquer código. Cada item aqui já funcionou e foi
> validado em plantão. Quebrar um deles é erro de entrega, mesmo que o pedido
> tenha sido cumprido.
>
> Como usar: antes de alterar uma função, procure o nome dela na coluna "Mora em".
> Se aparecer, você está mexendo em terreno protegido — teste os itens ligados a
> ela antes de entregar.

## Como preencher

Cada linha tem quatro partes:

- **Comportamento** — o que precisa acontecer, escrito como o usuário percebe
- **Mora em** — a função ou bloco do código responsável
- **Como testar** — os cliques ou o ditado exato que comprovam
- **Validado em** — data em que passou no plantão

---

## Modo Cliques

| Comportamento | Mora em | Como testar | Validado em |
|---|---|---|---|
| Exame todo normal gera máscara completa + impressão de normalidade | `gerarLaudo()` | Abrir a aba e copiar sem clicar em nada | |
| Estrutura desligada some da ANÁLISE e da IMPRESSÃO | `gerarLaudo()` | Desligar Pâncreas → conferir os dois blocos | |
| Medida em branco → frase sem o trecho da medida, sem vírgula solta | `montarFrase()` | Marcar cisto renal sem preencher a medida | |
| Esteatose leve / moderada / acentuada → impressão correspondente | `gerarImpressao()` | Clicar cada um dos três graus | |
| Preset hepatopatia monta descrição + impressão coerentes | atalho hepatopatia | Clicar o atalho e ler os dois blocos | |
| Achados renais por lado não se misturam | bloco Rins | Nefrolitíase só à direita | |
| Edição manual pausa a regeneração; "Regerar" restaura | editor final | Digitar no editor → clicar outra estrutura | |
| Copiar mantém formatação; Baixar .doc abre correto | `copiar()`, `baixarDoc()` | Colar no Word | |
| "Usar minha máscara" sobrevive ao recarregar a página | localStorage | Salvar → F5 → conferir | |

## Modo Ditado

| Comportamento | Mora em | Como testar | Validado em |
|---|---|---|---|
| Nunca acrescenta achado, medida ou conclusão que não foi ditada | prompt da IA | Ditar só "fígado com esteatose leve" e conferir se apareceu mais alguma coisa | |
| Ditado fora de ordem cai na estrutura certa do laudo | prompt da IA | Ditar rim antes de fígado | |
| Números ditados por extenso viram medida formatada em cm com vírgula | pós-processamento | "um vírgula dois por zero vírgula oito" | |
| Achado ditado gera a linha correspondente na IMPRESSÃO | prompt da IA | Ditar uma esteatose moderada | |

## Compartilhado entre os dois modos

| Comportamento | Mora em | Como testar | Validado em |
|---|---|---|---|
| Os dois modos produzem o MESMO formato final de laudo | gerador de texto único | Fazer o mesmo laudo pelos dois caminhos e comparar | |
| Etiqueta de identificação (iniciais + data) nunca entra no texto copiado | `copiar()` | Preencher a etiqueta e colar no Word | |
| Trocar de modo no meio não perde o que já foi montado | controle de abas/modo | Montar metade nos cliques e trocar para ditado | |

---

## Regra de crescimento

Toda vez que um comportamento passar no plantão, ele entra nesta tabela com a
data. A lista só cresce — item não sai daqui, mesmo que a função seja reescrita;
nesse caso, atualize a coluna "Mora em".
