// rins.js — Item 3: rim direito e esquerdo descritos em dois blocos
// independentes, no mesmo espírito do Bloco 7 (ovários). Recurso ADITIVO:
// convive com os 12 itens de alteração já existentes no grupo "Rins"
// (cisto renal, hidronefrose, angiomiolipoma etc., que seguem a linha
// combinada "Rins:" da máscara) sem tocar em nenhum deles. Se o médico
// usar QUALQUER um desses chips antigos, este painel novo não altera nada
// — quem descreve o achado é o chip antigo, exatamente como hoje. O painel
// novo só entra em ação quando nenhum chip antigo de Rins está selecionado.
//
// AVISO — reconstrução não verificada: o pedido deu a frase normal exata
// por lado ("Rim direito: tópico, de forma, dimensões e ecotextura
// normais. Diferenciação córtico-medular preservada.") e a lista de campos
// do cálculo (polo + lado + medida), mas não deu a frase completa de como
// o cálculo entra na frase. Reconstruí no mesmo estilo já usado em outros
// itens de cálculo renal deste arquivo ("Presença de cálculo no
// grupamento/terço do rim, medindo cm") — o Dr. Ryan precisa confirmar
// antes de uso em laudo real. A linha de impressão para o cálculo também é
// acréscimo meu (o pedido não mencionou impressão) para não deixar um
// achado sem menção na conclusão, seguindo o padrão do resto do app.

import { aplicarMedida } from "./camposMedida.js";

export const POLOS_RIM = [
  { id: "", label: "selecionar" },
  { id: "superior", label: "Superior" },
  { id: "medio", label: "Médio", text: "médio" },
  { id: "inferior", label: "Inferior" },
];

export const RIM_VAZIO = {
  calculo: false,
  polo: "",
  m1: "",
};

export const rimEhPadrao = (r) => !r.calculo;

export function descreverRim(lado, r) {
  const base = `Rim ${lado}: tópico, de forma, dimensões e ecotextura normais. Diferenciação córtico-medular preservada.`;
  if (!r.calculo) return base;

  let frase = base + " Presença de cálculo";
  if (r.polo) {
    const poloOpt = POLOS_RIM.find((o) => o.id === r.polo);
    const poloTxt = poloOpt?.text || poloOpt?.label?.toLowerCase() || r.polo;
    frase += ` no polo ${poloTxt}`;
  }
  frase += ` do rim ${lado.toLowerCase()}, medindo cm.`;
  return aplicarMedida(frase, [r.m1]);
}

export function impressaoCalculoRim(lado, r) {
  if (!r.calculo) return null;
  return `- Nefrolitíase (cálculo renal) no rim ${lado.toLowerCase()}.`;
}

const ehLinhaNormalidade = (linha) => {
  const t = linha.trim();
  return t.startsWith("- ") && (t.includes("dentro dos padrões da normalidade") || t.includes("dentro dos limites da normalidade"));
};

// Aplica o(s) rim(ns) sobre o texto JÁ MONTADO pelo motor de cliques
// (montarLaudo), sem tocar em montarLaudo.js. Com os dois rins no estado
// padrão, ou se algum chip antigo do grupo "Rins" está selecionado (o
// médico está usando o caminho de hoje), devolve o texto de entrada sem
// nenhuma alteração — byte a byte igual ao de hoje.
export function aplicarRins(textoBase, direito, esquerdo, temAlteracaoRimAntiga) {
  if (temAlteracaoRimAntiga) return textoBase;
  if (rimEhPadrao(direito) && rimEhPadrao(esquerdo)) return textoBase;

  const impressaoLinhas = [impressaoCalculoRim("direito", direito), impressaoCalculoRim("esquerdo", esquerdo)].filter(Boolean);

  const linhas = textoBase.split("\n");
  const saida = [];
  let impressaoInserida = impressaoLinhas.length === 0;
  for (const linha of linhas) {
    if (linha.startsWith("Rins:")) {
      saida.push(descreverRim("Direito", direito));
      saida.push(descreverRim("Esquerdo", esquerdo));
      continue;
    }
    if (!impressaoInserida && ehLinhaNormalidade(linha)) {
      saida.push(...impressaoLinhas);
      impressaoInserida = true;
      continue;
    }
    saida.push(linha);
  }
  if (!impressaoInserida) saida.push(...impressaoLinhas);

  return saida.join("\n");
}
