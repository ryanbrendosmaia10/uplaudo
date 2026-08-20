// mascaras.js — Máscaras de laudo normais do Dr. Ryan Maia
// Extraídas da biblioteca BeeText (Combos usg ryan e andre.json)
// Cada máscara é o laudo normal completo do exame; a IA usa como base e altera só o que for ditado.

export const MASCARAS = {
  abdome_total: {
    nome: "Abdome Total",
    texto: `ULTRASSONOGRAFIA DO ABDOME TOTAL

Fígado: de dimensões, contornos, ecotextura parenquimatosa e bordas normais. Marcas vasculares preservadas. Sem lesões focais evidenciadas ao método.
MEDIDAS HEPÁTICAS:
         Eixo Longitudinal do Lobo Direito: cm.
         Eixo Longitudinal do Lobo Esquerdo: cm.
         Eixo AP do Lobo Caudado: cm.

Vesícula Biliar: em situação habitual, normodistendida, de paredes finas, com conteúdo homogêneo habitual.
Ausência de dilatação das vias biliares intra e extra-hepáticas.
Veia Porta: de calibre e trajeto normais.

Pâncreas: de volume, contornos e ecotextura dentro da normalidade.
Baço: de dimensões, forma, contornos e ecotextura normais.
          Eixo longitudinal do baço: cm.

Rins: tópicos, de forma, dimensões, contornos e ecotextura normais. Diferenciação corticomedular preservada. Não foram caracterizados sinais de macrolitíase ou hidronefrose.
MEDIDAS RENAIS:
          Rim Direito: cm               Espessura do parênquima: mm.
          Rim Esquerdo: cm            Espessura do parênquima: mm.

Aorta abdominal: de trajeto e calibre normais.
Bexiga: parcialmente repleta, sem evidência de ecos amorfos no seu interior.
Cavidade abdominal/pélvica: não foram visualizados líquido livre ou coleções.

IMPRESSÃO DIAGNÓSTICA:
- Ultrassonografia do abdome dentro dos padrões da normalidade.`
  },

  vias_urinarias: {
    nome: "Vias Urinárias",
    texto: `ULTRASSONOGRAFIA DAS VIAS URINÁRIAS

Rins: tópicos, de forma, dimensões, contornos e ecotextura normais. Diferenciação córtico-medular preservada. Regiões perirrenais sem alterações ao método. Não foram visualizados sinais de macrolitíase ou hidronefrose.

MEDIDAS RENAIS:
          Rim Direito: cm               Espessura do parênquima: mm.
          Rim Esquerdo: cm            Espessura do parênquima: mm.

Bexiga: de topografia, conteúdo, capacidade e paredes normais.

Não foi evidenciada dilatação ureteral.

IMPRESSÃO DIAGNÓSTICA:
- Ultrassonografia das vias urinárias dentro dos padrões da normalidade.`
  },

  tireoide: {
    nome: "Tireoide",
    texto: `ULTRASSONOGRAFIA DA TIREOIDE

Realizado estudo ultrassonográfico da tireoide com transdutor linear, demonstrando:

LAUDO:

Tireoide: tópica, com dimensões normais, contornos regulares e ecotextura parenquimatosa homogênea, sem evidências de lesões nodulares sólidas e/ou císticas.

MEDIDAS TIREOIDEANAS:
LOBO DIREITO: cm
LOBO ESQUERDO: cm
Volume tireoideano: cm³ (VR 5-15cm³)

Não foram visualizadas linfonodomegalias ou linfonodos atípicos regionais.

IMPRESSÃO DIAGNÓSTICA:
- Ultrassonografia da tireoide dentro dos padrões da normalidade.`
  },

  transvaginal: {
    nome: "Pélvica transvaginal",
    texto: `ULTRASSONOGRAFIA PÉLVICA TRANSVAGINAL

Ultrassonografia pélvica realizada por via transabdominal e transvaginal, que mostra:

Bexiga: de topografia, conteúdo e parede normais.

Útero: em AVF, mediano, dimensões normais para a paridade e faixa etária, contornos regulares e ecotextura miometrial homogênea.

Endométrio: centrado e homogêneo.
Eco endometrial: mm

MEDIDAS UTERINAS:
Vol.: cm³

Ovários: de dimensões, contornos, forma e ecotextura parenquimatosa normais para a faixa etária.
MEDIDAS OVARIANAS:
Ovário Direito: cm          Vol.: cm³
Ovário Esquerdo: cm         Vol.: cm³

CONCLUSÃO:
- Exame ultrassonográfico dentro dos padrões da normalidade para a faixa etária.`
  },

  pelvica_abdominal: {
    nome: "Pélvica (via abdominal)",
    texto: `ULTRASSONOGRAFIA PÉLVICA (VIA ABDOMINAL)

Exame realizado com transdutor convexo que evidenciou:

Bexiga: com boa repleção, paredes regulares, conteúdo homogêneo.

Útero: em AVF, mediano, dimensões normais, contornos regulares, ecotextura miometrial homogênea.
Medidas Uterinas: cm (Vol: cm³)

Endométrio: centrado e homogêneo.
Eco endometrial: cm

Ovários: tópicos de dimensões, formato e ecotextura preservados.
Medidas Ovarianas:
Ovário direito: cm (Vol: cm³).
Ovário esquerdo: cm (Vol: cm³).

Fundo de saco posterior livre.

IMPRESSÃO DIAGNÓSTICA:
- Ultrassonografia da pelve feminina dentro dos padrões da normalidade.`
  },

  prostata: {
    nome: "Próstata (Via Abdominal)",
    texto: `ULTRASSONOGRAFIA DA PRÓSTATA (VIA ABDOMINAL)

Realizada ultrassonografia da próstata por via transabdominal que demonstra:

Bexiga: de capacidade normal, conteúdo anecóico e paredes de espessura habitual.
Resíduo pós-miccional medindo cerca de ml.

Próstata: de volume normal, contornos regulares e ecotextura heterogênea habitual. Regiões periprostáticas preservadas.
Medidas Prostáticas: cm
Peso aproximado: g
IPP:

Vesículas seminais: anatômicas.

Não se observam líquido livre ou coleções intracavitários.

IMPRESSÃO DIAGNÓSTICA:
- Aspectos ultrassonográficos da próstata dentro dos padrões da normalidade.`
  },

  abdome_superior_doppler: {
    nome: "Abdome superior com Doppler de vasos hepáticos",
    texto: `ULTRASSONOGRAFIA DE ABDOME SUPERIOR COM DOPPLER DE VASOS HEPÁTICOS

Fígado: de dimensões, contornos, bordas e ecotextura parenquimatosa normais.
MEDIDAS HEPÁTICAS:
         Eixo Longitudinal do Lobo Direito: cm.
         Eixo Longitudinal do Lobo Esquerdo: cm.
         Eixo AP do Lobo Caudado: cm.

Vesícula Biliar: em situação habitual, normodistendida, de paredes finas, com conteúdo homogêneo habitual.
Ausência de dilatação das vias biliares intra e extra-hepáticas.

Veia Porta: de calibre normal, medindo mm de diâmetro, com fluxo hepatopetal e pico de velocidade de cm/s.
Artéria hepática: visível, com fluxo pulsátil ao Doppler e índice de resistência de .
Veias hepáticas: pérvias, com fluxo fásico ao Doppler, sem evidência de trombos.

Pâncreas: de volume, contornos e ecotextura dentro da normalidade.
Baço: de dimensões, forma, contornos e ecotextura normais.
          Eixo longitudinal do baço: cm.

IMPRESSÃO DIAGNÓSTICA:
- Estudo dopplervelocimétrico dos vasos hepáticos dentro dos padrões da normalidade.`
  }
};
