// src/alteracoes/transvaginal.js — USG Transvaginal (Útero, Endométrio, Ovários e O-RADS)

export default [
  {
    orgao: "Útero",
    itens: [
      {
        rotulo: "Útero normal",
        descricao: "Útero: em AVF/RVF, mediano, de forma e contornos regulares, com volume e ecotextura miometrial preservados, sem lesões focais caracterizadas ao método.",
        impressao: ""
      },
      {
        rotulo: "Miomas múltiplos",
        requerInput: true,
        campos: ["posicaoUtero", "medidaX"],
        descricao: "Útero: em AVF/RVF, mediano, com dimensões normais, contornos regulares e ecotextura miometrial heterogênea, exibindo nódulos sólidos, hipoecoicos, assim distribuídos:\n- M1: parede anterior/posterior/lateral, submucoso/intramural/subseroso, medindo cm;\n- M2: parede anterior/posterior/lateral, intramural/subseroso, medindo cm;\n- M3: parede anterior/posterior, intramural, com áreas císticas em permeio, medindo cm.",
        impressao: "Nódulos miometriais sugestivos de leiomioma (ou variantes histológicas)."
      },
      {
        rotulo: "Mioma único (Parede lateral)",
        requerInput: true,
        campos: ["medidaX"],
        descricao: "Útero: em AVF, mediano, de volume, contornos e ecotextura miometrial normais, exibindo nódulo heterogêneo, de contornos lobulados e limites precisos, situado na parede lateral esquerda/direita, intramural/subseroso, medindo cm.",
        impressao: "Nódulo miometrial sugestivo de leiomioma (ou variante histológica)."
      },
      {
        rotulo: "Sinais de Adenomiose",
        descricao: "Útero: em AVF, mediano, com volume aumentado, contornos regulares e ecotextura miometrial heterogênea, por vezes com áreas ecogênicas de permeio e sombras posteriores 'em leque', notando-se indefinição da interface juncional miometrio-endometrial.",
        impressao: "Sinais ultrassonográficos sugestivos de adenomiose."
      }
    ]
  },
  {
    orgao: "Endométrio",
    itens: [
      {
        rotulo: "Endométrio normal",
        requerInput: true,
        campos: ["medidaX"],
        descricao: "Endométrio: centrado, de espessura e ecotextura normais para a fase do ciclo menstrual/status hormonal, medindo mm.",
        impressao: ""
      },
      {
        rotulo: "Endométrio espessado com microcistos",
        requerInput: true,
        campos: ["medidaX"],
        descricao: "Endométrio: centrado, espessado e discretamente heterogêneo, exibindo microcistos de permeio, com espessura endometrial de até mm.",
        impressao: "Endométrio espessado e discretamente heterogêneo com microcistos de permeio. A critério clínico, sugere-se prosseguir a investigação."
      },
      {
        rotulo: "Distensão líquida / Muco da cavidade",
        requerInput: true,
        campos: ["medidaX", "medidaY"],
        descricao: "Endométrio: centrado, de espessura e ecotextura normais, medindo mm. Notando-se distensão líquida/anecoica e homogênea da cavidade uterina, medindo mm (inespécifico, podendo corresponder a acúmulo mucoso/fisiológico).",
        impressao: "Distensão líquida da cavidade uterina, conforme descrito."
      }
    ]
  },
  {
    orgao: "Ovários",
    itens: [
      {
        rotulo: "Ovários normais",
        descricao: "Ovários: tópicos, de forma, dimensões e ecotextura normais, apresentando folículos de reserva funcional.",
        impressao: ""
      },
      {
        rotulo: "Ovários senis / Involução pós-menopausa",
        descricao: "Ovários: direito e esquerdo com dimensões reduzidas, contornos regulares e ecotextura habitual, sem lesões focais ou folículos proeminentes.",
        impressao: "Ovários de dimensões reduzidas, compatíveis com involução fisiológica / status pós-menopausa."
      },
      {
        rotulo: "Ovários não caracterizados (Atróficos)",
        descricao: "Ovários: não caracterizados/individualizados ao método, com regiões anexiais livres de massas ou coleções.",
        impressao: "Ovários não individualizados ao método, achado que pode estar relacionado a processo atrófico fisiológico para a faixa etária/status hormonal."
      },
      {
        rotulo: "Aspecto micropolicístico",
        descricao: "Ovários: com dimensões aumentadas, contornos definidos e ecogenicidade habitual, exibindo múltiplos pequenos cistos simples com distribuição predominantemente periférica.",
        impressao: "Ovários de aspecto ultrassonográfico micropolicístico."
      },
      {
        rotulo: "Cisto simples pós-menopausa",
        requerInput: true,
        campos: ["lado", "medidaX"],
        descricao: "Ovários: de dimensões reduzidas, com contornos regulares, exibindo no ovário imagem cística, anecoica, unilocular, de paredes finas e regulares, sem septações ou vegetações, medindo cerca de cm.",
        impressao: "Cisto de aspecto simples no ovário ."
      }
    ]
  },
  {
    orgao: "Ovários - Lesões e Massas (O-RADS)",
    itens: [
      {
        rotulo: "O-RADS 2: Cisto simples",
        requerInput: true,
        campos: ["lado", "medidaX"],
        descricao: "Ovários: de dimensões habituais, notando-se no ovário formação cística anecoica, unilocular, de paredes finas e regulares, sem componente sólido, vegetação ou fluxo ao Doppler, medindo cm.",
        impressao: "Cisto ovariano simples no ovário (categoria O-RADS 2 - achado quase certamente benigno)."
      },
      {
        rotulo: "O-RADS 2: Lesão benigna típica (Cisto dermoide / Endometrioma)",
        requerInput: true,
        campos: ["lado", "medidaX"],
        descricao: "Ovários: de ecotextura habitual, exceto no ovário , onde se observa imagem nodular/cística com ecogênese típica de lesão benigna (eco interno homogêneo / focos hiperecogênicos com atenuação posterior), de contornos bem definidos, medindo cm, sem componente sólido vegetante ou vascularização central.",
        impressao: "Lesão ovariana benigna típica no ovário (categoria O-RADS 2 - risco de malignidade < 1%)."
      },
      {
        rotulo: "O-RADS 3: Cisto multilocular liso / Cisto de paredes irregulares",
        requerInput: true,
        campos: ["lado", "medidaX"],
        descricao: "Ovários: notando-se no ovário formação cística multilocular de contornos lisos / unilocular com paredes discretamente irregulares, sem nódulos sólidos ou projeções papilares internas, com Color Score baixo (CS 1-2), medindo cm.",
        impressao: "Lesão ovariana de baixo risco no ovário (categoria O-RADS 3 - risco de malignidade 1 a <10%). A critério clínico, sugere-se acompanhamento ecográfico / reavaliação especializada ou RM."
      },
      {
        rotulo: "O-RADS 4: Cisto com componente sólido / Projeção papilar",
        requerInput: true,
        campos: ["lado", "medidaX"],
        descricao: "Ovários: presença no ovário de lesão cística complexa (uni ou multilocular) apresentando componente sólido / projeção papilar no seu interior, medindo cm, evidenciando vascularização ao estudo Doppler.",
        impressao: "Lesão ovariana de risco intermediário no ovário (categoria O-RADS 4 - risco de malignidade 10 a <50%). Convém correlação com marcadores séricos (CA-125) e avaliação especializada com RM / ginecologia oncológica."
      },
      {
        rotulo: "O-RADS 5: Lesão sólida/cística de alto risco / Ascite",
        requerInput: true,
        campos: ["lado", "medidaX"],
        descricao: "Ovários: observa-se no ovário formação expansiva sólida/cística de contornos irregulares, com múltiplas projeções papilares (≥4) ou componente sólido vascularizado ao Doppler (CS 3-4), medindo cm. Notam-se sinais de ascite / espessamento peritoneal associado.",
        impressao: "Lesão expansiva ovariana de alto risco no ovário (categoria O-RADS 5 - risco de malignidade ≥50%). Recomenda-se avaliação urgente por ginecologia oncológica."
      }
    ]
  }
];
