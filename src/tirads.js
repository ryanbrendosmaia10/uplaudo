// tirads.js — lógica TI-RADS PORTADA de tirads-calculator-v3.html
// (calculadora validada clinicamente pelo Dr. Ryan Maia, baseada no ACR
// TI-RADS, Tessler et al. 2017). Não alterar pontos, limiares ou textos
// sem revisão do médico. A interface fica em src/TireoideBuilder.jsx.

import { aplicarMedida } from "./camposMedida.js";

export const COMPOSITION = [
  { id: "cistico", label: "Cístico ou quase completamente cístico", pts: 0, text: "cístico" },
  { id: "espongiforme", label: "Espongiforme", pts: 0, text: "espongiforme" },
  { id: "misto_cistico", label: "Misto, predominantemente cístico", pts: 1, text: "misto, predominantemente cístico" },
  { id: "misto_solido", label: "Misto, predominantemente sólido", pts: 2, text: "misto, predominantemente sólido" },
  { id: "solido", label: "Sólido", pts: 2, text: "sólido" },
  { id: "quase_solido", label: "Quase completamente sólido", pts: 2, text: "quase completamente sólido" },
  { id: "indet_calc", label: "Indeterminado por calcificação", pts: 2, text: "de composição indeterminada por calcificação" },
];

export const ECHOGENICITY = [
  { id: "anecoico", label: "Anecoico", pts: 0, text: "anecoico" },
  { id: "isoecoico", label: "Isoecoico", pts: 1, text: "isoecoico" },
  { id: "hiperecoico", label: "Hiperecoico", pts: 1, text: "hiperecoico" },
  { id: "hipoecoico", label: "Hipoecoico", pts: 2, text: "hipoecoico" },
  { id: "acent_hipo", label: "Acentuadamente hipoecoico", pts: 3, text: "acentuadamente hipoecoico" },
  { id: "echo_indet", label: "Não determinado", pts: 1, text: "de ecogenicidade não determinada" },
];

export const SHAPE = [
  { id: "largo", label: "Mais largo do que alto", pts: 0, text: "mais largo do que alto" },
  { id: "alto", label: "Mais alto do que largo", pts: 3, text: "mais alto do que largo" },
];

export const MARGIN = [
  { id: "bem_def", label: "Margens bem definidas", pts: 0, text: "margens bem definidas" },
  { id: "mal_def", label: "Margens mal definidas", pts: 0, text: "margens mal definidas" },
  { id: "lobulada", label: "Margens lobuladas", pts: 2, text: "margens lobuladas" },
  { id: "irregular", label: "Margens irregulares", pts: 2, text: "margens irregulares" },
  { id: "extensao", label: "Com extensão extratireoidiana", pts: 3, text: "com extensão extratireoidiana" },
  { id: "margin_indet", label: "Margens não determinadas", pts: 0, text: "margens não determinadas" },
];

export const FOCI = [
  { id: "nenhum", label: "Nenhum foco ecogênico ou cauda de cometa", pts: 0, text: "sem calcificações" },
  { id: "macro", label: "Macrocalcificações", pts: 1, text: "com macrocalcificações" },
  { id: "periferica", label: "Calcificação periférica (em borda)", pts: 2, text: "com calcificação periférica (em borda)" },
  { id: "puntiforme", label: "Focos ecogênicos puntiformes", pts: 3, text: "com focos ecogênicos puntiformes (microcalcificações)" },
];

export const LOCATIONS = [
  { id: "", label: "selecionar" },
  { id: "lobo_d_sup", label: "Lobo direito, terço superior", text: "terço superior do lobo direito" },
  { id: "lobo_d_med", label: "Lobo direito, terço médio", text: "terço médio do lobo direito" },
  { id: "lobo_d_inf", label: "Lobo direito, terço inferior", text: "terço inferior do lobo direito" },
  { id: "lobo_e_sup", label: "Lobo esquerdo, terço superior", text: "terço superior do lobo esquerdo" },
  { id: "lobo_e_med", label: "Lobo esquerdo, terço médio", text: "terço médio do lobo esquerdo" },
  { id: "lobo_e_inf", label: "Lobo esquerdo, terço inferior", text: "terço inferior do lobo esquerdo" },
  { id: "istmo", label: "Istmo", text: "istmo" },
  { id: "transicao_d", label: "Transição istmo, lobo direito", text: "transição do istmo para o lobo direito" },
  { id: "transicao_e", label: "Transição istmo, lobo esquerdo", text: "transição do istmo para o lobo esquerdo" },
];

const findOpt = (list, id) => list.find((o) => o.id === id) || null;

const parseNum = (v) => {
  const f = parseFloat((v || "").replace(",", "."));
  return isNaN(f) ? null : f;
};

export function lobeVolume(a, b, c) {
  const A = parseNum(a), B = parseNum(b), C = parseNum(c);
  if (A === null || B === null || C === null) return null;
  return A * B * C * 0.52;
}

export const fmtVol = (v) => (v === null ? "?" : v.toFixed(1).replace(".", ","));

const measureTriplet = (a, b, c) => `${a || "?"} x ${b || "?"} x ${c || "?"} cm`;

export function maxMeasure(n) {
  const vals = [n.m1, n.m2, n.m3].map((v) => parseFloat((v || "").replace(",", "."))).filter((v) => !isNaN(v));
  if (!vals.length) return null;
  return Math.max(...vals);
}

export function scoreFor(n) {
  let pts = 0;
  const comp = findOpt(COMPOSITION, n.composition);
  const echo = findOpt(ECHOGENICITY, n.echogenicity);
  const shape = findOpt(SHAPE, n.shape);
  const margin = findOpt(MARGIN, n.margin);
  const foci = findOpt(FOCI, n.foci);
  if (comp) pts += comp.pts;
  if (echo) pts += echo.pts;
  if (shape) pts += shape.pts;
  if (margin) pts += margin.pts;
  if (foci) pts += foci.pts;

  let tr, sub, risk, fna, follow;
  const size = maxMeasure(n);

  function sizeRec(fnaMin, followMin) {
    if (size === null) return { fna: "Informe as medidas", follow: "Informe as medidas" };
    if (size >= fnaMin) return { fna: `Indicada (≥ ${fnaMin.toString().replace(".", ",")} cm)`, follow: "Não se aplica, PAAF indicada" };
    if (size >= followMin) return { fna: "Não necessária pelo tamanho atual", follow: "Indicado, conforme faixa de tamanho" };
    return { fna: "Não necessária pelo tamanho atual", follow: "Sem seguimento pelo tamanho atual" };
  }

  tr = trDePontos(pts);
  if (tr === "TR1") { sub = "Benigno"; risk = "<1%"; fna = "Não necessária"; follow = "Sem seguimento"; }
  else if (tr === "TR2") { sub = "Não suspeito"; risk = "<1,5%"; fna = "Não necessária"; follow = "Sem seguimento, salvo indicação clínica"; }
  else if (tr === "TR3") {
    sub = "Levemente suspeito"; risk = "2-5%";
    const r = sizeRec(2.5, 1.5); fna = r.fna; follow = r.follow;
  } else if (tr === "TR4") {
    sub = "Moderadamente suspeito"; risk = "5-20%";
    const r = sizeRec(1.5, 1.0); fna = r.fna; follow = r.follow;
  } else {
    sub = "Altamente suspeito"; risk = ">20%";
    const r = sizeRec(1.0, 0.5); fna = r.fna; follow = r.follow;
  }
  return { pts, tr, sub, risk, fna, follow };
}

// Faixas de pontos -> categoria TI-RADS (ACR, Tessler et al. 2017). Extraída
// à parte para ser reaproveitada pelo seletor de combinação do nódulo padrão
// (item 6b) sem duplicar os limiares.
function trDePontos(pts) {
  if (pts <= 1) return "TR1";
  if (pts === 2) return "TR2";
  if (pts === 3) return "TR3";
  if (pts >= 4 && pts <= 6) return "TR4";
  return "TR5";
}

export function describeNodule(n) {
  const comp = findOpt(COMPOSITION, n.composition);
  const echo = findOpt(ECHOGENICITY, n.echogenicity);
  const shape = findOpt(SHAPE, n.shape);
  const margin = findOpt(MARGIN, n.margin);
  const foci = findOpt(FOCI, n.foci);
  const loc = LOCATIONS.find((l) => l.id === n.location);

  let parts = ["Nódulo"];
  parts.push(comp ? comp.text : "[composição]");
  if (echo) parts[parts.length - 1] += ",";
  parts.push(echo ? echo.text : "[ecogenicidade]");
  if (shape) { parts[parts.length - 1] += ","; parts.push(shape.text); }
  if (foci) { parts[parts.length - 1] += ","; parts.push(foci.text); }
  if (margin) { parts[parts.length - 1] += ","; parts.push("com " + margin.text.replace("com ", "")); }

  let desc = parts.join(" ");
  if (loc && loc.id) desc += `, localizado no ${loc.text}`;

  const m1 = n.m1 || "?", m2 = n.m2 || "?", m3 = n.m3 || "?";
  if (n.m1 || n.m2 || n.m3) desc += `, medindo ${m1} x ${m2} x ${m3} cm`;

  const s = scoreFor(n);
  desc += ` (ACR TI-RADS ${s.tr})`;
  desc += ".";
  return desc;
}

// ---- Bloco 2 / Item 6b-6c: "Nódulo padrão" ----
// Botão de atalho para o caso banal: gera de um clique uma frase completa e
// gramaticalmente correta, deixando para o médico só o que varia por
// paciente (combinação de composição+ecogenicidade+focos, localização
// opcional, medidas). Convive com o caminho detalhado acima (que fica
// intocado).
//
// Item 6b (substitui a decisão original do Bloco 2 de não calcular TI-RADS
// aqui): em vez de dois campos separados de composição/ecogenicidade, um
// único seletor de combinação. O TI-RADS é somado a partir dos MESMOS pesos
// já usados no caminho detalhado (COMPOSITION/ECHOGENICITY/FOCI acima) — não
// é uma tabela nova e fixa, então adicionar outro foco ecogênico no futuro
// não exige refazer a lógica de pontuação, só um novo item na lista de
// combinações abaixo.
export const COMPOSICAO_PADRAO = [
  { id: "solido", label: "Sólido", text: "sólido" },
  { id: "misto", label: "Misto", text: "misto" },
  { id: "misto_predom_solido", label: "Misto, predominantemente sólido", text: "misto, predominantemente sólido" },
];

export const ECOGENICIDADE_PADRAO = [
  { id: "isoecoico", label: "Isoecoico", text: "isoecoico" },
  { id: "hipoecoico", label: "Hipoecoico", text: "hipoecoico" },
  { id: "hiperecoico", label: "Hiperecoico", text: "hiperecoico" },
];

const PTS_COMPOSICAO_PADRAO = {
  solido: findOpt(COMPOSITION, "solido").pts,
  misto: findOpt(COMPOSITION, "misto_cistico").pts,
  misto_predom_solido: findOpt(COMPOSITION, "misto_solido").pts,
};
const PTS_ECOGENICIDADE_PADRAO = {
  isoecoico: findOpt(ECHOGENICITY, "isoecoico").pts,
  hipoecoico: findOpt(ECHOGENICITY, "hipoecoico").pts,
  hiperecoico: findOpt(ECHOGENICITY, "hiperecoico").pts,
};

// As 8 linhas da tabela do pedido, com "ou" desdobrado em opções separadas
// (mesma pontuação/TI-RADS nos dois lados do "ou" — só muda a palavra no
// texto do laudo, que precisa ser exata para o que o médico observou).
export const COMBINACOES_TIRADS_PADRAO = [
  { id: "misto_iso", label: "Misto, isoecoico", composicao: "misto", ecogenicidade: "isoecoico", foco: "nenhum" },
  { id: "misto_hiper", label: "Misto, hiperecoico", composicao: "misto", ecogenicidade: "hiperecoico", foco: "nenhum" },
  { id: "misto_hipo", label: "Misto, hipoecoico", composicao: "misto", ecogenicidade: "hipoecoico", foco: "nenhum" },
  { id: "mps_iso", label: "Misto predominantemente sólido, isoecoico", composicao: "misto_predom_solido", ecogenicidade: "isoecoico", foco: "nenhum" },
  { id: "mps_hiper", label: "Misto predominantemente sólido, hiperecoico", composicao: "misto_predom_solido", ecogenicidade: "hiperecoico", foco: "nenhum" },
  { id: "mps_hipo", label: "Misto predominantemente sólido, hipoecoico", composicao: "misto_predom_solido", ecogenicidade: "hipoecoico", foco: "nenhum" },
  { id: "solido_iso", label: "Sólido, isoecoico", composicao: "solido", ecogenicidade: "isoecoico", foco: "nenhum" },
  { id: "solido_hiper", label: "Sólido, hiperecoico", composicao: "solido", ecogenicidade: "hiperecoico", foco: "nenhum" },
  { id: "solido_hipo", label: "Sólido, hipoecoico", composicao: "solido", ecogenicidade: "hipoecoico", foco: "nenhum" },
  { id: "solido_hipo_macro", label: "Sólido, hipoecoico + macrocalcificações", composicao: "solido", ecogenicidade: "hipoecoico", foco: "macro" },
  { id: "solido_hipo_puntiforme", label: "Sólido, hipoecoico + microcalcificações/puntiformes", composicao: "solido", ecogenicidade: "hipoecoico", foco: "puntiforme" },
];

export function pontosCombinacaoPadrao(combinacaoId) {
  const combo = findOpt(COMBINACOES_TIRADS_PADRAO, combinacaoId) || COMBINACOES_TIRADS_PADRAO[6]; // solido_iso
  const focoOpt = findOpt(FOCI, combo.foco) || FOCI[0];
  return PTS_COMPOSICAO_PADRAO[combo.composicao] + PTS_ECOGENICIDADE_PADRAO[combo.ecogenicidade] + focoOpt.pts;
}

export function tiradsCombinacaoPadrao(combinacaoId) {
  return trDePontos(pontosCombinacaoPadrao(combinacaoId));
}

export const TERCOS_PADRAO = [
  { id: "", label: "selecionar" },
  { id: "superior", label: "Superior" },
  { id: "medio", label: "Médio", text: "médio" },
  { id: "inferior", label: "Inferior" },
];

export const LOBOS_PADRAO = [
  { id: "", label: "selecionar" },
  { id: "direito", label: "Direito" },
  { id: "esquerdo", label: "Esquerdo" },
  { id: "istmo", label: "Istmo" },
];

export const NODULO_PADRAO_VAZIO = {
  combinacao: "solido_iso", // Sólido, isoecoico — mesmo padrão de antes (era composicao:"solido"+ecogenicidade:"isoecoico")
  terco: "",
  lobo: "",
  m1: "", m2: "", m3: "",
};

// Item 6c: o TI-RADS do nódulo padrão aparece logo após a descrição, no
// corpo do laudo — formato "medindo X cm. TI-RADS: [número]." — diferente
// do BI-RADS de mama (que só entra na classificação final do exame, porque
// lá é sempre do pior achado; aqui cada nódulo de tireoide tem o seu).
export function describeNoduloPadrao(n) {
  const combo = findOpt(COMBINACOES_TIRADS_PADRAO, n.combinacao) || COMBINACOES_TIRADS_PADRAO[6];
  const comp = findOpt(COMPOSICAO_PADRAO, combo.composicao) || COMPOSICAO_PADRAO[0];
  const echo = findOpt(ECOGENICIDADE_PADRAO, combo.ecogenicidade) || ECOGENICIDADE_PADRAO[0];
  const focoOpt = findOpt(FOCI, combo.foco) || FOCI[0];
  const focoTxt = combo.foco === "nenhum" ? "sem calcificações no seu interior" : `${focoOpt.text} no seu interior`;

  let frase =
    `Nódulo ${comp.text}, ${echo.text}, de contornos regulares e margens bem definidas, ` +
    `com maior eixo paralelo à pele, ${focoTxt}`;

  if (n.lobo === "istmo") {
    frase += ", situado no istmo";
  } else if (n.lobo && n.terco) {
    const tercoOpt = findOpt(TERCOS_PADRAO, n.terco);
    const tercoTxt = (tercoOpt && tercoOpt.text) || tercoOpt?.label?.toLowerCase() || n.terco;
    const loboTxt = n.lobo === "direito" ? "direito" : "esquerdo";
    frase += `, situado no terço ${tercoTxt} do lobo ${loboTxt}`;
  }

  frase += ", medindo cm.";
  frase = aplicarMedida(frase, [n.m1, n.m2, n.m3]);
  const tr = tiradsCombinacaoPadrao(n.combinacao).replace("TR", "");
  return frase.replace(/\.$/, "") + `. TI-RADS: ${tr}.`;
}

export const GLAND_PADRAO = {
  location: "topica",
  rd1: "", rd2: "", rd3: "",
  le1: "", le2: "", le3: "",
  ist1: "", ist2: "", ist3: "",
  volumeClass: "normal",
  contour: "regulares",
  texture: "homogenea",
};

export function describeGland(gland) {
  const locTxt = gland.location === "topica" ? "tópica" : "ectópica";
  const volClassTxt = { reduzido: "reduzido", normal: "normal", aumentado: "aumentado" }[gland.volumeClass];
  const contourTxt = gland.contour; // regulares/lobulados/irregulares já em forma adjetiva
  let textureTxt, suffix;
  if (gland.texture === "homogenea") { textureTxt = "homogênea"; suffix = "exceto pela presença dos nódulos abaixo descritos"; }
  else if (gland.texture === "fin_heterogenea") { textureTxt = "finamente heterogênea"; suffix = "exibindo os nódulos abaixo descritos"; }
  else { textureTxt = "heterogênea"; suffix = "exibindo os nódulos abaixo descritos"; }

  return `Tireoide ${locTxt}, de volume ${volClassTxt}, contornos ${contourTxt}, com ecotextura ${textureTxt}, ${suffix}.`;
}

export const NODULO_VAZIO = {
  composition: null, echogenicity: null, shape: null, margin: null, foci: null,
  location: "", m1: "", m2: "", m3: "",
};

const glandFoiAlterada = (gland) =>
  gland.location !== "topica" ||
  gland.volumeClass !== "normal" ||
  gland.contour !== "regulares" ||
  gland.texture !== "homogenea";

// Remonta o laudo de tireoide sobre a máscara normal: substitui a frase da
// glândula, lista os nódulos, preenche MEDIDAS TIREOIDEANAS e o volume, e
// troca a linha de normalidade da impressão. Impressão sem medidas e sem
// localização (regra inviolável do projeto).
export function montarLaudoTireoide(mascaraTexto, gland, nodules, nodulosPadrao = []) {
  const totalNodulos = nodules.length + nodulosPadrao.length;
  const temNodulos = totalNodulos > 0;
  const rd = lobeVolume(gland.rd1, gland.rd2, gland.rd3);
  const le = lobeVolume(gland.le1, gland.le2, gland.le3);
  const total = rd === null && le === null ? null : (rd || 0) + (le || 0);

  const linhas = [];
  for (const linha of mascaraTexto.split("\n")) {
    if (linha.startsWith("Tireoide:") && (temNodulos || glandFoiAlterada(gland))) {
      let frase = describeGland(gland);
      if (temNodulos) {
        frase = frase.replace(/\.$/, ":");
        linhas.push(frase);
        let i = 0;
        nodules.forEach((n) => {
          i += 1;
          linhas.push(`- N${i}: ${describeNodule(n).replace(/^Nódulo /, "")}`);
        });
        nodulosPadrao.forEach((n) => {
          i += 1;
          linhas.push(`- N${i}: ${describeNoduloPadrao(n).replace(/^Nódulo /, "")}`);
        });
      } else {
        // Sem nódulos, o sufixo da calculadora (que referencia nódulos) não se aplica.
        frase = frase
          .replace(", exceto pela presença dos nódulos abaixo descritos.", ".")
          .replace(", exibindo os nódulos abaixo descritos.", ".");
        linhas.push(frase);
      }
      continue;
    }
    if (linha.startsWith("LOBO DIREITO:") && (gland.rd1 || gland.rd2 || gland.rd3)) {
      linhas.push(`LOBO DIREITO: ${measureTriplet(gland.rd1, gland.rd2, gland.rd3)}`);
      continue;
    }
    if (linha.startsWith("LOBO ESQUERDO:")) {
      if (gland.le1 || gland.le2 || gland.le3) linhas.push(`LOBO ESQUERDO: ${measureTriplet(gland.le1, gland.le2, gland.le3)}`);
      else linhas.push(linha);
      if (gland.ist1 || gland.ist2 || gland.ist3) linhas.push(`ISTMO: ${measureTriplet(gland.ist1, gland.ist2, gland.ist3)}`);
      continue;
    }
    if (linha.startsWith("Volume tireoideano:") && total !== null) {
      linhas.push(`Volume tireoideano: ${fmtVol(total)} cm³ (VR 5-15cm³)`);
      continue;
    }
    if (temNodulos && linha.trim().startsWith("- ") && linha.includes("dentro dos padrões da normalidade")) {
      const plural = totalNodulos > 1;
      linhas.push(`- Nódulo${plural ? "s" : ""} tireoideano${plural ? "s" : ""}, conforme pormenorizado no corpo do laudo.`);
      continue;
    }
    linhas.push(linha);
  }
  return linhas.join("\n");
}
