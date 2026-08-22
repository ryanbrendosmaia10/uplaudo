// campoSegmento.js — Item 1: localização por segmento hepático acoplada ao
// chip, junto da medida que já existe, em toda lesão focal hepática.
//
// Segmentos hepáticos (algarismos romanos, com IVa/IVb per Couinaud).
// Se houver mais de uma lesão do mesmo tipo, o campo é para descrever a
// maior (segmento + medida) — orientação operacional para o médico, não
// altera a frase.

export const SEGMENTOS_HEPATICOS = ["I", "II", "III", "IVa", "IVb", "V", "VI", "VII", "VIII"];

const LOCUS_SEGMENTO = /no segmento(?: hepático)?/;

function limparPontuacao(texto) {
  return texto
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+([.,;:])/g, "$1")
    .replace(/,\s*,/g, ",")
    .replace(/,\s*\./g, ".");
}

// Itens do grupo Fígado que já têm o local "no segmento[ hepático] ," em
// branco na própria descrição — só falta o valor.
const ROTULOS_COM_LOCUS = new Set(["Preservação focal única", "Hemangioma hepático", "Cisto hepático simples"]);

// "Nódulos hepáticos secundários (Metástases)" não tem local de segmento
// nenhum na descrição — precisa ser inserido, não só preenchido.
const ROTULO_SEM_LOCUS = "Nódulos hepáticos secundários (Metástases)";

export function itemTemCampoSegmento(item) {
  return ROTULOS_COM_LOCUS.has(item.rotulo) || item.rotulo === ROTULO_SEM_LOCUS;
}

function aplicarLocusExistente(descricaoTemplate, valor) {
  const match = LOCUS_SEGMENTO.exec(descricaoTemplate);
  if (!match) return descricaoTemplate;
  const antes = descricaoTemplate.slice(0, match.index);
  const depois = descricaoTemplate.slice(match.index + match[0].length);
  if (!valor) {
    return limparPontuacao(antes.replace(/[ \t]*,?[ \t]*$/, "") + depois);
  }
  return limparPontuacao(`${antes}${match[0]} ${valor}${depois}`);
}

function inserirLocusNovo(descricaoTemplate, valor) {
  if (!valor) return descricaoTemplate;
  // Insere ", localizada no segmento {valor}" antes de ", medindo" (mesma
  // posição — localização antes da medida — usada nos outros itens do grupo).
  return descricaoTemplate.replace(/,\s*medindo/, `, localizada no segmento ${valor}, medindo`);
}

// `descricaoAtual` permite compor com outras transformações (ex.: a medida
// do Bloco 1) já aplicadas antes desta — os dois loci não se sobrepõem.
export function aplicarCampoSegmento(rotulo, descricaoAtual, valor) {
  const seg = (valor || "").trim();
  if (rotulo === ROTULO_SEM_LOCUS) return inserirLocusNovo(descricaoAtual, seg);
  if (ROTULOS_COM_LOCUS.has(rotulo)) return aplicarLocusExistente(descricaoAtual, seg);
  return descricaoAtual;
}
