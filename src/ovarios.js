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
  o.estado === "normal" && o.contornos === "regulares" && o.ecotextura === "homogenea" && (o.lesoes || []).length === 0;

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

export function descreverOvario(lado, o) {
  return descreverEstadoBase(lado, o);
}

function medidaLinha(lado, o) {
  if (estadoSuprimeMedidasELesoes(o.estado)) return null;
  const vals = [o.m1, o.m2, o.m3].map(normalizarValorMedida).filter(Boolean);
  if (!vals.length) return null;
  const vol = fmtVol(lobeVolume(o.m1, o.m2, o.m3));
  return `Ovário ${lado}: ${vals.join(" x ")} cm          Vol.: ${vol ?? "?"} cm³`;
}

// Aplica o(s) ovário(s) sobre o texto JÁ MONTADO pelo motor de cliques
// (montarLaudo), sem tocar em montarLaudo.js nem nas alterações de
// Útero/Endométrio. Com os dois ovários no estado padrão (o requisito de
// compatibilidade do Bloco 7), devolve o texto de entrada sem nenhuma
// alteração — byte a byte igual ao de hoje.
export function aplicarOvarios(textoBase, direito, esquerdo) {
  if (ovarioEhPadrao(direito) && ovarioEhPadrao(esquerdo)) return textoBase;

  const linhas = textoBase.split("\n");
  const saida = [];
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
    saida.push(linha);
  }
  return saida.join("\n");
}
