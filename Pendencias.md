---
title: Pendências — UpLaudo
type: note
tags: [projeto, uplaudo]
updated: 2026-08-01
---

# Pendências — UpLaudo

## Já pronto (v1)

- [x] Aba **Abdômen total** funcional
  - Fígado: chips por parâmetro (dimensões, contornos, bordos, ecotextura,
    ecogenicidade) + atalhos esteatose / hepatopatia + cisto
  - Vesícula, vias biliares, veia porta, pâncreas, baço
  - Rins: cisto, nefrolitíase, hidronefrose — por lado
  - Aorta, cavidade
- [x] Interruptor liga/desliga por estrutura
- [x] Medida em branco = frase sem medida
- [x] Impressão gerada automaticamente
- [x] Editor final: negrito, itálico, A+/A−, pausa da regeneração ao editar à mão,
      botão "Regerar"
- [x] Copiar mantendo formatação, Compartilhar, Baixar .doc
- [x] "Usar minha máscara" por estrutura, salva no navegador

## A fazer — em ordem

- [ ] **1. Máscara TOTAL** — ⚠️ bloqueado: resolver o conflito em `Decisoes.md`
      antes de começar
- [ ] **2. Aba Vias urinárias** — rins + bexiga + ureteres, aproveitando o bloco
      de rins já pronto
- [ ] **3. Aba Tireoide** — integrar a partir do `tirads-calculator.html`
      (ACR TI-RADS com a pontuação customizada do Dr. Ryan, múltiplos nódulos,
      avaliação da glândula com volume × 0,52)
- [ ] **4. Aba Mama** — integrar a partir do `birads-calculator.html`
      (heurística de características suspeitas, todos os nódulos descritos,
      impressão do pior)
- [ ] **5. Ajustes de fraseologia** — contínuo, conforme feedback dos plantões

## Fases seguintes

- [ ] Fase 2 — Firebase: login e máscaras na nuvem
- [ ] Fase 3 — domínio próprio e assinatura

## Estado das abas

| Aba | Situação |
|---|---|
| Abdômen total | funcional |
| Vias urinárias | placeholder, desabilitada |
| Tireoide | placeholder, desabilitada |
| Mama | placeholder, desabilitada |
