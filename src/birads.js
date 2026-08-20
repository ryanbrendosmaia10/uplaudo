// birads.js — léxico e heurística BI-RADS PORTADOS de birads-calculator.html
// (calculadora validada clinicamente pelo Dr. Ryan Maia, baseada no léxico
// ACR BI-RADS para ultrassonografia, v2025 Manual). A sugestão de categoria
// é uma heurística prática pelo número de características suspeitas e deve
// sempre ser confirmada pelo médico. Não alterar textos ou a heurística sem
// revisão do médico. A interface fica em src/MamaBuilder.jsx.

import { aplicarMedida, normalizarValorMedida } from "./camposMedida.js";

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

// ---- Bloco 3: categoria BI-RADS única e manual para o exame ----
// Uma só CLASSIFICAÇÃO ULTRASSONOGRÁFICA por laudo, sempre escolhida pelo
// médico (nunca somada, calculada ou tirada do pior achado). "3" é apenas o
// valor inicial de conveniência quando o primeiro Nódulo padrão é criado.
export const CATEGORIAS_BIRADS = ["0", "1", "2", "3", "4", "5", "6"];

// ---- Bloco 3a: Mama — "Nódulo padrão" ----
// Atalho para o caso banal: um clique gera a frase completa (forma oval,
// orientação paralela, margens circunscritas, ecotextura hipoecoica fixas
// no texto), deixando para o médico só localização/distâncias/medidas.
// Sem seletor de ecogenicidade aqui — quem precisar de outra usa o caminho
// detalhado acima. Convive com ele, não o substitui.
export const NODULO_PADRAO_MAMA_VAZIO = {
  hora: "",
  lado: "",
  m1: "", m2: "", m3: "",
  distPapila: "",
  distPele: "",
};

export function describeNoduloPadraoMama(n) {
  const clausulas = ["Nódulo, de forma oval, com orientação paralela, margens circunscritas, ecotextura hipoecoica"];

  const hora = (n.hora || "").trim();
  if (hora && n.lado) {
    const ladoTxt = n.lado === "direita" ? "direita" : "esquerda";
    clausulas.push(`localizado no raio de ${hora} horas, na mama ${ladoTxt}`);
  }

  const medidas = [n.m1, n.m2, n.m3].map(normalizarValorMedida).filter(Boolean);
  if (medidas.length) clausulas.push(`medindo ${medidas.join(" x ")} cm`);

  const y = normalizarValorMedida(n.distPapila);
  const z = normalizarValorMedida(n.distPele);
  if (y && z) clausulas.push(`distando ${y} cm da papila e ${z} cm da pele`);
  else if (y) clausulas.push(`distando ${y} cm da papila`);
  else if (z) clausulas.push(`distando ${z} cm da pele`);

  return clausulas.join(", ") + ".";
}

// ---- Bloco 3b: Mama — Cistos ----
// Item separado do nódulo, duas opções mutuamente exclusivas. Convive com
// nódulo(s) padrão/detalhado(s), cada um com sua própria frase e linha de
// impressão. Sem categoria BI-RADS própria (cisto simples não é classificado).
//
// AVISO: o texto exato dos dois modelos (unilateral/bilateral) foi
// reconstruído a partir de fragmentos preservados do documento original
// ("esparsos na mama direita.", "esparsos em ambas as mamas.", "o maior
// localizado no raio de...") porque a citação literal completa se perdeu
// numa compactação de contexto desta sessão. Preservei as regras de
// montagem (campo em branco remove o trecho) e as duas frases finais que
// tenho certeza. O meio da frase (conector entre "esparsos" e "o maior
// localizado...") é minha melhor reconstrução, NÃO uma cópia literal
// verificada do documento — o Dr. Ryan precisa conferir contra o original
// antes de usar em laudo real. Ver relatório de entrega.
export const CISTOS_VAZIO = {
  modo: "", // "" | "unilateral" | "bilateral"
  lado: "", // mama única (modo unilateral)
  ladoMaior: "", // lado do maior cisto (modo bilateral, opcional)
  hora: "",
  medida: "",
};

export function describeCistos(c) {
  if (!c.modo) return "";
  const hora = (c.hora || "").trim();
  const medida = normalizarValorMedida(c.medida);

  if (c.modo === "unilateral") {
    const ladoTxt = c.lado === "esquerda" ? "esquerda" : "direita";
    const clausulas = [`Cistos simples esparsos na mama ${ladoTxt}`];
    if (hora) clausulas.push(`o maior localizado no raio de ${hora} horas`);
    if (medida) clausulas.push(`medindo ${medida} cm`);
    return clausulas.join(", ") + ".";
  }

  // bilateral
  const clausulas = ["Cistos simples esparsos em ambas as mamas"];
  if (c.ladoMaior && hora) {
    const ladoTxt = c.ladoMaior === "esquerda" ? "esquerda" : "direita";
    clausulas.push(`o maior localizado na mama ${ladoTxt}, no raio de ${hora} horas`);
  } else if (hora) {
    clausulas.push(`o maior localizado no raio de ${hora} horas`);
  }
  if (medida) clausulas.push(`medindo ${medida} cm`);
  return clausulas.join(", ") + ".";
}

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

// ---- Bloco 5: validação de coerência do BI-RADS 3 ----
// [CONFIRMAR — critério recebido assim; nota do médico de que "hipoecoica
// ou heterogênea" pode vir a virar "hipoecoica ou isoecoica" no futuro; não
// alterado sem confirmação dele.] Os 4 critérios do "provavelmente
// benigno": margem circunscrita, forma oval, orientação paralela à pele e
// ecotextura hipoecoica ou heterogênea, todos precisam ser verdadeiros.
// Só se aplica ao nódulo detalhado — o nódulo padrão tem esses 4 descritores
// fixos por construção e portanto é sempre compatível (nunca dispara aviso).
export function noduloCompativelComBirads3(n) {
  return (
    n.margin === "circunscrita" &&
    n.shape === "oval" &&
    n.orientation === "paralela" &&
    (n.echo === "hipoecoica" || n.echo === "heterogenea")
  );
}

export const AVISO_BIRADS3_LINHA1 =
  "Nódulo não atende aos critérios de BI-RADS 3. O nódulo não apresenta todas as características necessárias " +
  "(margem circunscrita, forma oval, orientação paralela e ecotextura hipoecoica ou heterogênea) para classificação como provavelmente benigno.";
export const AVISO_BIRADS3_LINHA2 = "Selecione a categoria BI-RADS apropriada.";

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
// lista de nódulos (detalhados + padrão, na ordem de criação de cada grupo)
// e a classificação final. A categoria BI-RADS é sempre a escolha manual do
// médico (parâmetro `categoria`) — nunca somada, calculada ou tirada do
// pior achado — e aparece só na linha de classificação, nunca na frase do
// nódulo nem na impressão.
export function montarLaudoMama(tissueEnabled, tissue, cistos, nodules, nodulosPadrao, categoria) {
  const partes = [];
  if (tissueEnabled) partes.push(describeTissue(tissue));

  const textoCistos = describeCistos(cistos || CISTOS_VAZIO);
  if (textoCistos) partes.push(textoCistos);

  const totalNodulos = nodules.length + nodulosPadrao.length;
  if (totalNodulos) {
    const linhas = [];
    let i = 0;
    nodules.forEach((n) => {
      i += 1;
      linhas.push(`- N${i}: ${describeNodule(n, false).replace(/^Nódulo /, "")}`);
    });
    nodulosPadrao.forEach((n) => {
      i += 1;
      linhas.push(`- N${i}: ${describeNoduloPadraoMama(n).replace(/^Nódulo, /, "")}`);
    });
    partes.push(linhas.join("\n"));
  }

  const impressao = [];
  if (totalNodulos) {
    const plural = totalNodulos > 1;
    impressao.push(`- Nódulo${plural ? "s" : ""} mamário${plural ? "s" : ""}, conforme pormenorizado no corpo do laudo.`);
  }
  if (textoCistos) impressao.push("- Cistos mamários simples.");
  if (impressao.length) partes.push("IMPRESSÃO DIAGNÓSTICA:\n" + impressao.join("\n"));

  if (categoria) partes.push(`CLASSIFICAÇÃO ULTRASSONOGRÁFICA: ACR BI-RADS (US) - ${categoria}`);

  return partes.join("\n\n");
}
