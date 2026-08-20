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

  if (pts <= 1) { tr = "TR1"; sub = "Benigno"; risk = "<1%"; fna = "Não necessária"; follow = "Sem seguimento"; }
  else if (pts === 2) { tr = "TR2"; sub = "Não suspeito"; risk = "<1,5%"; fna = "Não necessária"; follow = "Sem seguimento, salvo indicação clínica"; }
  else if (pts === 3) {
    tr = "TR3"; sub = "Levemente suspeito"; risk = "2-5%";
    const r = sizeRec(2.5, 1.5); fna = r.fna; follow = r.follow;
  } else if (pts >= 4 && pts <= 6) {
    tr = "TR4"; sub = "Moderadamente suspeito"; risk = "5-20%";
    const r = sizeRec(1.5, 1.0); fna = r.fna; follow = r.follow;
  } else {
    tr = "TR5"; sub = "Altamente suspeito"; risk = ">20%";
    const r = sizeRec(1.0, 0.5); fna = r.fna; follow = r.follow;
  }
  return { pts, tr, sub, risk, fna, follow };
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

// ---- Bloco 2: "Nódulo padrão" ----
// Botão de atalho para o caso banal: gera de um clique uma frase completa e
// gramaticalmente correta, com todas as características assumidas normais,
// deixando para o médico só o que varia por paciente (composição,
// ecogenicidade, localização opcional, medidas). Convive com o caminho
// detalhado acima (que fica intocado) — não calcula TI-RADS aqui.

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
  composicao: "solido",
  ecogenicidade: "isoecoico",
  terco: "",
  lobo: "",
  m1: "", m2: "", m3: "",
};

export function describeNoduloPadrao(n) {
  const comp = findOpt(COMPOSICAO_PADRAO, n.composicao) || COMPOSICAO_PADRAO[0];
  const echo = findOpt(ECOGENICIDADE_PADRAO, n.ecogenicidade) || ECOGENICIDADE_PADRAO[0];

  let frase =
    `Nódulo ${comp.text}, ${echo.text}, de contornos regulares e margens bem definidas, ` +
    `com maior eixo paralelo à pele, sem calcificações no seu interior`;

  if (n.lobo === "istmo") {
    frase += ", situado no istmo";
  } else if (n.lobo && n.terco) {
    const tercoOpt = findOpt(TERCOS_PADRAO, n.terco);
    const tercoTxt = (tercoOpt && tercoOpt.text) || tercoOpt?.label?.toLowerCase() || n.terco;
    const loboTxt = n.lobo === "direito" ? "direito" : "esquerdo";
    frase += `, situado no terço ${tercoTxt} do lobo ${loboTxt}`;
  }

  frase += ", medindo cm.";
  return aplicarMedida(frase, [n.m1, n.m2, n.m3]);
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
