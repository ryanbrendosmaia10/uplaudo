// camposMedida.js — Bloco 1: campo de medida acoplado à frase de alteração.
//
// Só entra em ação para itens de alteração cuja `descricao` tenha exatamente
// UM local de medida em branco (uma "trava" só). Itens com dois ou mais locais
// de medida (ex.: aneurisma de aorta com diâmetro + extensão, hérnia com saco
// + colo, miomas M1/M2/M3) ficam de fora deste mecanismo genérico e continuam
// exigindo edição manual no texto de saída, como hoje.

// Reconhece o local de medida em branco dentro da descrição-modelo: sempre
// "medindo[ até| cerca de] cm/mm" ou, no único caso que não usa "medindo",
// "de até mm" (Endométrio espessado).
const LOCUS_MEDIDA = /(medindo(?:\s+(?:até|cerca de))?|de\s+até)\s+(cm|mm)\b/;

// Para contar quantos locais de medida em branco existem na frase, não basta
// procurar "medindo cm": alguns achados (ex.: aneurisma de aorta, com
// diâmetro e "extensão longitudinal de cm") têm um segundo local que não usa
// "medindo". Por isso a contagem usa qualquer "cm"/"mm" solto (sem dígito
// antes) — é o sinal confiável de "aqui falta preencher um valor".
const UNIDADE_SOLTA_G = /(?<!\d)\b(cm|mm)\b/g;

export function contarLocaisMedida(descricao) {
  if (!descricao) return 0;
  return (descricao.match(UNIDADE_SOLTA_G) || []).length;
}

// Elegível para o campo acoplado: precisa ter sido marcado como requerInput
// e ter exatamente um local de medida na descrição.
export function itemElegivelParaMedida(item) {
  return !!item?.requerInput && contarLocaisMedida(item.descricao) === 1;
}

// Quantos campos (1 a 3) mostrar, com base nos `campos` já cadastrados no
// item (medidaX/medidaY/medidaZ). Sem informação, assume 1.
export function numeroDeCamposMedida(item) {
  const campos = Array.isArray(item?.campos) ? item.campos : [];
  const n = campos.filter((c) => /^medida/i.test(c)).length;
  return Math.min(3, Math.max(1, n || 1));
}

// Unidade declarada pela própria frase (cm ou mm) — nunca escolhida pelo usuário.
export function unidadeDoLocus(descricao) {
  const m = LOCUS_MEDIDA.exec(descricao);
  return m ? m[2] : "cm";
}

// Aceita vírgula ou ponto na digitação; sempre guarda/mostra com vírgula.
// Não arredonda, não converte unidade.
export function normalizarValorMedida(bruto) {
  return (bruto || "").trim().replace(".", ",");
}

function limparPontuacao(texto) {
  return texto
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+([.,;:])/g, "$1")
    .replace(/,\s*,/g, ",")
    .replace(/,\s*\./g, ".");
}

// Aplica os valores digitados (0 a 3, na ordem dos campos) ao local de medida
// da descrição-modelo. Com 1+ valores presentes, junta com " x " antes da
// unidade. Com todos em branco, remove o trecho da medida por completo, sem
// deixar espaço duplo ou vírgula solta.
export function aplicarMedida(descricaoTemplate, valoresBrutos) {
  const match = LOCUS_MEDIDA.exec(descricaoTemplate);
  if (!match) return descricaoTemplate;

  const valores = (valoresBrutos || []).map(normalizarValorMedida).filter(Boolean);
  const [trechoCompleto, prefixo, unidade] = match;
  const antes = descricaoTemplate.slice(0, match.index);
  const depois = descricaoTemplate.slice(match.index + trechoCompleto.length);

  let resultado;
  if (valores.length === 0) {
    resultado = antes.replace(/[ \t]*,?[ \t]*$/, "") + depois;
  } else {
    resultado = `${antes}${prefixo} ${valores.join(" x ")} ${unidade}${depois}`;
  }
  return limparPontuacao(resultado);
}
