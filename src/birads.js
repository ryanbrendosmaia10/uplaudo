// birads.js — léxico e heurística BI-RADS PORTADOS de birads-calculator.html
// (calculadora validada clinicamente pelo Dr. Ryan Maia, baseada no léxico
// ACR BI-RADS para ultrassonografia, v2025 Manual). A sugestão de categoria
// é uma heurística prática pelo número de características suspeitas e deve
// sempre ser confirmada pelo médico. Não alterar textos ou a heurística sem
// revisão do médico. A interface fica em src/MamaBuilder.jsx.

export const SHAPE = [
  { id: "oval", label: "Oval", suspicious: false, text: "oval" },
  { id: "redonda", label: "Redonda", suspicious: false, text: "redondo" },
  { id: "lobulada", label: "Lobulada", suspicious: false, text: "lobulado" },
  { id: "irregular", label: "Irregular", suspicious: true, text: "irregular" },
];

export const ORIENTATION = [
  { id: "paralela", label: "Paralela", suspicious: false, text: "orientação paralela à pele" },
  { id: "nao_paralela", label: "Não paralela", suspicious: true, text: "orientação não paralela à pele" },
];

export const MARGIN = [
  { id: "circunscrita", label: "Circunscrita", suspicious: false, text: "margens circunscritas" },
  { id: "indistinta", label: "Indistinta", suspicious: true, text: "margens indistintas" },
  { id: "angulada", label: "Angulada", suspicious: true, text: "margens anguladas" },
  { id: "microlobulada", label: "Microlobulada", suspicious: true, text: "margens microlobuladas" },
  { id: "espiculada", label: "Espiculada", suspicious: true, text: "margens espiculadas" },
];

export const ECHO = [
  { id: "anecoica", label: "Anecoica", text: "anecoico" },
  { id: "hiperecoica", label: "Hiperecoica", text: "hiperecoico" },
  { id: "isoecoica", label: "Isoecoica", text: "isoecoico" },
  { id: "hipoecoica", label: "Hipoecoica", text: "hipoecoico" },
  { id: "heterogenea", label: "Heterogêneo", text: "de padrão heterogêneo" },
  { id: "misto", label: "Misto sólido e cístico", text: "misto, sólido e cístico" },
];

export const POSTERIOR = [
  { id: "nenhuma", label: "Nenhuma", suspicious: false, text: "sem alterações acústicas posteriores" },
  { id: "reforco", label: "Reforço acústico", suspicious: false, text: "com reforço acústico posterior" },
  { id: "sombra", label: "Sombra acústica", suspicious: true, text: "com sombra acústica posterior" },
];

export const CALC = [
  { id: "nenhuma", label: "Nenhuma", suspicious: false, text: "sem calcificações" },
  { id: "macro", label: "Macrocalcificações", suspicious: false, text: "com macrocalcificações" },
  { id: "micro_dentro", label: "Microcalcificações dentro da massa", suspicious: true, text: "com microcalcificações no interior da lesão" },
  { id: "micro_fora", label: "Microcalcificações fora da massa", suspicious: false, text: "com microcalcificações no tecido adjacente à lesão" },
  { id: "intraductal", label: "Calcificações intraductais", suspicious: false, text: "com calcificações intraductais" },
];

export const LATERALITY = [
  { id: "direita", label: "Mama direita" },
  { id: "esquerda", label: "Mama esquerda" },
];

const findOpt = (list, id) => list.find((o) => o.id === id) || null;

export const TISSUE_PADRAO = { pattern: "homog_fibro", gtc: "moderado" };

export function describeTissue(tissue) {
  const patternTxt = {
    homog_gordura: "homogênea, de padrão adiposo",
    homog_fibro: "homogênea, de padrão fibroglandular",
    heterogenea: "heterogênea",
  }[tissue.pattern];
  const gtcTxt = { minimo: "mínimo", leve: "leve", moderado: "moderado", marcado: "marcado" }[tissue.gtc];
  return `Mamas com ecotextura de fundo ${patternTxt}, com componente glandular ${gtcTxt}.`;
}

export function scoreFor(n) {
  const shape = findOpt(SHAPE, n.shape);
  const orient = findOpt(ORIENTATION, n.orientation);
  const margin = findOpt(MARGIN, n.margin);
  const posterior = findOpt(POSTERIOR, n.posterior);
  const calc = findOpt(CALC, n.calc);

  let flags = 0;
  if (shape && shape.suspicious) flags++;
  if (orient && orient.suspicious) flags++;
  if (margin && margin.suspicious) flags++;
  if (posterior && posterior.suspicious) flags++;
  if (calc && calc.suspicious) flags++;

  let tr, sub, risk, mgmt;
  if (flags <= 0) { tr = "BI-RADS 3"; sub = "Provavelmente benigno"; risk = ">0% a ≤2%"; mgmt = "Seguimento em curto intervalo (6 meses) ou vigilância (12 meses)"; }
  else if (flags === 1) { tr = "BI-RADS 4A"; sub = "Suspeita baixa"; risk = ">2% a ≤10%"; mgmt = "Diagnóstico tecidual (biópsia)"; }
  else if (flags === 2) { tr = "BI-RADS 4B"; sub = "Suspeita moderada"; risk = ">10% a ≤50%"; mgmt = "Diagnóstico tecidual (biópsia)"; }
  else if (flags === 3) { tr = "BI-RADS 4C"; sub = "Suspeita alta"; risk = ">50% a <95%"; mgmt = "Diagnóstico tecidual (biópsia)"; }
  else { tr = "BI-RADS 5"; sub = "Altamente sugestivo de malignidade"; risk = "≥95%"; mgmt = "Diagnóstico tecidual (biópsia)"; }

  return { flags, tr, sub, risk, mgmt };
}

// comCategoria=false na montagem do laudo: pela regra do projeto, a
// categoria BI-RADS aparece apenas na linha de classificação final.
export function describeNodule(n, comCategoria = true) {
  const shape = findOpt(SHAPE, n.shape);
  const orient = findOpt(ORIENTATION, n.orientation);
  const margin = findOpt(MARGIN, n.margin);
  const echo = findOpt(ECHO, n.echo);
  const posterior = findOpt(POSTERIOR, n.posterior);
  const calc = findOpt(CALC, n.calc);
  const s = scoreFor(n);

  let parts = ["Nódulo"];
  parts.push(shape ? shape.text : "[forma]");
  if (margin) { parts[parts.length - 1] += ","; parts.push(margin.text); }
  if (orient) { parts[parts.length - 1] += ","; parts.push(orient.text); }
  if (echo) { parts[parts.length - 1] += ","; parts.push(echo.text); }
  if (posterior) { parts[parts.length - 1] += ","; parts.push(posterior.text); }
  if (calc) { parts[parts.length - 1] += ","; parts.push(calc.text); }

  let desc = parts.join(" ");

  const latTxt = n.laterality === "direita" ? "direita" : "esquerda";
  desc += `, localizado na mama ${latTxt}`;
  if (n.clock) desc += ` às ${n.clock}h`;
  if (n.skinDist) desc += `, a ${n.skinDist} cm da pele`;
  if (n.nippleDist) desc += ` e ${n.nippleDist} cm da papila`;

  const m1 = n.m1 || "?", m2 = n.m2 || "?", m3 = n.m3 || "?";
  if (n.m1 || n.m2 || n.m3) desc += `, medindo ${m1} x ${m2} x ${m3} cm`;

  if (comCategoria) desc += ` (${s.tr})`;
  desc += ".";
  return desc;
}

export function worstNoduleIdx(nodules) {
  let worst = 0, worstFlags = -1;
  nodules.forEach((n, i) => {
    const f = scoreFor(n).flags;
    if (f > worstFlags) { worstFlags = f; worst = i; }
  });
  return worst;
}

export const NODULO_VAZIO = {
  shape: null, orientation: null, margin: null, echo: null, posterior: null, calc: null,
  laterality: "direita", clock: "", skinDist: "", nippleDist: "",
  m1: "", m2: "", m3: "",
};

// Monta o bloco de achados de mama. Sem máscara de laudo normal de mama em
// mascaras.js, o texto é autônomo: tecido de fundo (opcional), cistos,
// lista de nódulos e a classificação final. A categoria BI-RADS aparece
// APENAS na linha de classificação, nunca na impressão.
export function montarLaudoMama(tissueEnabled, tissue, cystPresent, nodules) {
  const partes = [];
  if (tissueEnabled) partes.push(describeTissue(tissue));
  if (cystPresent) partes.push("Presença de cisto(s) simples.");
  if (nodules.length) {
    partes.push(nodules.map((n, i) => `- N${i + 1}: ${describeNodule(n, false).replace(/^Nódulo /, "")}`).join("\n"));
    const pior = scoreFor(nodules[worstNoduleIdx(nodules)]);
    partes.push(`CLASSIFICAÇÃO ULTRASSONOGRÁFICA: ACR BIRADS (US) - ${pior.tr.replace("BI-RADS ", "")}`);
  }
  return partes.join("\n\n");
}
