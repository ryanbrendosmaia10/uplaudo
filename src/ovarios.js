// ovarios.js — Bloco 7/8: ovário direito e esquerdo descritos separadamente
// (pélvica transvaginal), no mesmo espírito de como rim direito/esquerdo já
// aparecem descritos lado a lado no restante do app.
//
// AVISO IMPORTANTE — reconstrução não verificada:
// A citação literal das 5 frases de estado do ovário e do léxico completo
// de lesão O-RADS se perdeu numa compactação de contexto desta sessão (o
// documento original não está mais disponível aqui). A pedido do Dr. Ryan,
// segui em frente reconstruindo o texto mais plausível clinicamente, mas
// TODAS as frases abaixo (exceto a combinação "normal, contornos regulares,
// ecotextura homogênea", que é a divisão literal do texto já aprovado da
// máscara) precisam da revisão e aprovação dele linha por linha antes de
// uso em laudo real — não são cópia literal do documento original. Ver
// relatório de entrega para o detalhamento.

import { aplicarMedida, normalizarValorMedida } from "./camposMedida.js";

export const ESTADOS_OVARIO = [
  { id: "normal", label: "Normal" },
  { id: "reduzido", label: "Dimensões reduzidas" },
  { id: "aumentado", label: "Dimensões aumentadas" }, // [APROVAR TEXTO]
  { id: "nao_caracterizado", label: "Não caracterizado" },
  { id: "pos_ooforectomia", label: "Pós-ooforectomia" },
];

export const OVARIO_VAZIO = {
  estado: "normal",
  contornos: "regulares", // padrão | "irregulares"
  ecotextura: "homogenea", // padrão | "heterogenea"
  m1: "", m2: "", m3: "",
  lesoes: [], // Bloco 8
};

// ---- Bloco 8: lesões ovarianas pelo léxico O-RADS ----
// Descrita pela COMBINAÇÃO de dois campos independentes (loculação + parede
// e conteúdo), não por tipos nomeados. Não implementa: cálculo automático
// de O-RADS, campo de color-score/IC, nem os Ramos A/B/D/E do fluxograma
// O-RADS (hemorrágico/dermoide/endometrioma, paraovariano/inclusão
// peritoneal/hidrossalpinge, lesão sólida/ascite/implantes) — léxico
// próprio ainda não definido.
export const LOCULACAO = [
  { id: "unilocular", label: "Unilocular" },
  { id: "bilocular", label: "Bilocular" },
  { id: "multilocular", label: "Multilocular" },
];

export const PAREDE_CONTEUDO = [
  { id: "simples", label: "Simples (só unilocular)" },
  { id: "lisa_nao_simples", label: "Lisa, não simples" },
  { id: "espessamento_irregular", label: "Espessamento irregular" },
  { id: "componente_solido", label: "Componente sólido" },
];

export const SUB_ESPESSAMENTO = [
  { id: "da_parede", label: "Da parede" },
  { id: "das_septacoes", label: "Das septações" },
  { id: "da_parede_e_septacoes", label: "Da parede e das septações" },
];

export const LESAO_VAZIA = {
  loculacao: "unilocular",
  paredeConteudo: "",
  subEspessamento: "",
  numPapilas: "",
  medidaPapila: "",
  doppler: "", // "" (não avaliado) | "com" | "sem" — nunca automático
  m1: "", m2: "", m3: "",
};

function papilaClause(lesao) {
  const numero = (lesao.numPapilas || "").trim();
  if (!numero) return "apresentando componente sólido em sua parede";
  const n = parseInt(numero, 10);
  const plural = !isNaN(n) && n !== 1;
  let txt = `sob a forma de ${numero} projeç${plural ? "ões" : "ão"} papilar${plural ? "es" : ""}`;
  const medida = normalizarValorMedida(lesao.medidaPapila);
  if (medida) txt += `, a maior medindo ${medida} cm`;
  return txt;
}

// Frase da lesão em si (sem o "exibindo" nem o Doppler, que são aplicados
// por quem chama). Campo B em branco = campo obrigatório ainda não
// preenchido: sem frase (string vazia), a lesão não entra no texto.
function descreverLesaoBase(lesao) {
  if (lesao.loculacao === "unilocular" && lesao.paredeConteudo === "simples") {
    // EXCEÇÃO: usa o texto já existente na biblioteca, verbatim — não o
    // novo molde "formação cística {loculação}, {parede e conteúdo}...".
    const base = "imagem cística, de paredes finas e regulares, conteúdo anecóide homogêneo, medindo cm.";
    return aplicarMedida(base, [lesao.m1, lesao.m2, lesao.m3]).replace(/\.$/, "");
  }

  let paredeTxt;
  if (lesao.paredeConteudo === "lisa_nao_simples") {
    paredeTxt = "de paredes lisas, com conteúdo não anecoide";
  } else if (lesao.paredeConteudo === "espessamento_irregular") {
    const sub = lesao.loculacao === "unilocular" ? "da_parede" : lesao.subEspessamento;
    const subOpt = SUB_ESPESSAMENTO.find((o) => o.id === sub);
    paredeTxt = `com espessamento irregular ${(subOpt?.label || "Da parede").toLowerCase()}`;
  } else if (lesao.paredeConteudo === "componente_solido") {
    paredeTxt = `com componente sólido, ${papilaClause(lesao)}`;
  } else {
    return "";
  }

  const locOpt = LOCULACAO.find((o) => o.id === lesao.loculacao);
  const locTxt = (locOpt?.label || "unilocular").toLowerCase();
  const base = `formação cística ${locTxt}, ${paredeTxt}, medindo cm.`;
  return aplicarMedida(base, [lesao.m1, lesao.m2, lesao.m3]).replace(/\.$/, "");
}

function descreverLesaoComDoppler(lesao) {
  const base = descreverLesaoBase(lesao);
  if (!base) return "";
  if (lesao.doppler === "com") return base + " com vascularização ao estudo Doppler";
  if (lesao.doppler === "sem") return base + " sem vascularização ao estudo Doppler";
  return base;
}

const lesoesValidas = (o) => (o.lesoes || []).filter((l) => descreverLesaoBase(l));

function juntarComE(textos) {
  if (textos.length === 1) return textos[0];
  return textos.slice(0, -1).join(", ") + " e " + textos[textos.length - 1];
}

export function impressaoLesaoOvario(lado, o) {
  if (estadoSuprimeMedidasELesoes(o.estado)) return null;
  const n = lesoesValidas(o).length;
  if (!n) return null;
  const plural = n > 1;
  return `- ${plural ? "Lesões" : "Lesão"} cística${plural ? "s" : ""} no ovário ${lado.toLowerCase()}, conforme pormenorizado no corpo do laudo.`;
}

const lobeVolume = (a, b, c) => {
  const A = parseFloat((a || "").replace(",", "."));
  const B = parseFloat((b || "").replace(",", "."));
  const C = parseFloat((c || "").replace(",", "."));
  if (isNaN(A) || isNaN(B) || isNaN(C)) return null;
  return A * B * C * 0.52;
};
const fmtVol = (v) => (v === null ? null : v.toFixed(1).replace(".", ","));

export const estadoSuprimeMedidasELesoes = (estado) =>
  estado === "nao_caracterizado" || estado === "pos_ooforectomia";

// Um ovário está no estado "padrão" (equivalente ao que a máscara normal já
// descreve) quando nada foi alterado — usado para decidir se a linha
// combinada da máscara pode ficar 100% intocada.
export const ovarioEhPadrao = (o) =>
  o.estado === "normal" && o.contornos === "regulares" && o.ecotextura === "homogenea" && lesoesValidas(o).length === 0;

function descreverEstadoBase(lado, o) {
  if (o.estado === "nao_caracterizado") return `Ovário ${lado}: não caracterizado ao método.`;
  if (o.estado === "pos_ooforectomia") return `Ovário ${lado}: não caracterizado (status pós-ooforectomia).`;

  const contornosTxt = o.contornos === "irregulares" ? "irregulares" : "regulares";
  const ecotexturaTxt = o.ecotextura === "heterogenea" ? "heterogênea" : "homogênea";
  const tudoPadrao = o.contornos === "regulares" && o.ecotextura === "homogenea";

  if (o.estado === "normal") {
    // Divisão literal da frase já aprovada na máscara normal — sem alterar
    // uma palavra — quando contornos/ecotextura também estão no padrão.
    if (tudoPadrao) return `Ovário ${lado}: de dimensões, contornos, forma e ecotextura parenquimatosa normais para a faixa etária.`;
    return `Ovário ${lado}: de dimensões normais para a faixa etária, contornos ${contornosTxt} e ecotextura parenquimatosa ${ecotexturaTxt}.`;
  }

  const dimTxt = o.estado === "aumentado" ? "aumentadas" : "reduzidas";
  return `Ovário ${lado}: de dimensões ${dimTxt}, contornos ${contornosTxt} e ecotextura parenquimatosa ${ecotexturaTxt}.`;
}

// Lesão é CONTINUAÇÃO da própria frase do ovário, nunca uma frase à parte:
// "Ovário direito: ... normais para a faixa etária, exibindo {lesão}."
// Várias lesões no mesmo ovário: mesma frase, separadas por vírgula, a
// última unida por " e ".
export function descreverOvario(lado, o) {
  const base = descreverEstadoBase(lado, o);
  if (estadoSuprimeMedidasELesoes(o.estado)) return base;

  const textos = lesoesValidas(o).map(descreverLesaoComDoppler);
  if (!textos.length) return base;

  return base.replace(/\.$/, "") + `, exibindo ${juntarComE(textos)}.`;
}

function medidaLinha(lado, o) {
  if (estadoSuprimeMedidasELesoes(o.estado)) return null;
  const vals = [o.m1, o.m2, o.m3].map(normalizarValorMedida).filter(Boolean);
  if (!vals.length) return null;
  const vol = fmtVol(lobeVolume(o.m1, o.m2, o.m3));
  return `Ovário ${lado}: ${vals.join(" x ")} cm          Vol.: ${vol ?? "?"} cm³`;
}

const ehLinhaNormalidadeConclusao = (linha) => {
  const t = linha.trim();
  return t.startsWith("- ") && (t.includes("dentro dos padrões da normalidade") || t.includes("dentro dos limites da normalidade"));
};

// Aplica o(s) ovário(s) sobre o texto JÁ MONTADO pelo motor de cliques
// (montarLaudo), sem tocar em montarLaudo.js nem nas alterações de
// Útero/Endométrio. Com os dois ovários no estado padrão e sem lesões (o
// requisito de compatibilidade do Bloco 7), devolve o texto de entrada sem
// nenhuma alteração — byte a byte igual ao de hoje.
export function aplicarOvarios(textoBase, direito, esquerdo, orads) {
  const oradsTexto = orads && orads.ativo && orads.valor !== "" ? `CLASSIFICAÇÃO ULTRASSONOGRÁFICA: O-RADS (US) - ${orads.valor}` : null;

  if (ovarioEhPadrao(direito) && ovarioEhPadrao(esquerdo)) {
    return oradsTexto ? textoBase + "\n\n" + oradsTexto : textoBase;
  }

  const impressaoLinhas = [impressaoLesaoOvario("direito", direito), impressaoLesaoOvario("esquerdo", esquerdo)].filter(Boolean);

  const linhas = textoBase.split("\n");
  const saida = [];
  let impressaoInserida = impressaoLinhas.length === 0;
  for (const linha of linhas) {
    if (linha.startsWith("Ovários:")) {
      saida.push(descreverOvario("Direito", direito));
      saida.push(descreverOvario("Esquerdo", esquerdo));
      continue;
    }
    if (/^Ovário Direito:/i.test(linha)) {
      saida.push(medidaLinha("Direito", direito) || linha);
      continue;
    }
    if (/^Ovário Esquerdo:/i.test(linha)) {
      saida.push(medidaLinha("Esquerdo", esquerdo) || linha);
      continue;
    }
    if (!impressaoInserida && ehLinhaNormalidadeConclusao(linha)) {
      // Nenhuma outra alteração (Útero/Endométrio) gerou achados: a linha
      // de normalidade da máscara é substituída pelas linhas de lesão.
      saida.push(...impressaoLinhas);
      impressaoInserida = true;
      continue;
    }
    saida.push(linha);
  }
  // Outras alterações já substituíram a linha de normalidade por achados
  // próprios: as linhas de lesão ovariana são só anexadas ao final da lista.
  if (!impressaoInserida) saida.push(...impressaoLinhas);

  let resultado = saida.join("\n");
  if (oradsTexto) resultado += "\n\n" + oradsTexto;
  return resultado;
}
