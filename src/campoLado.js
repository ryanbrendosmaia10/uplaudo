// campoLado.js — campo de lado (direito/esquerdo) acoplado ao chip, mesmo
// esquema do campo de segmento hepático (Item 1): só aparece para itens
// cuja descrição já tem "lado" como campo declarado E que usam uma das
// âncoras reconhecidas abaixo ("no rim", "do rim", "no ovário", "na junção
// ureterovesical"). Preenche um local em branco já existente quando há um
// (ex.: "no rim , medindo cm") ou insere a palavra quando a âncora não tem
// nenhum blank (ex.: "no rim imagem nodular..."). Nunca mexe em blank.
// Itens "bilateral" (Dilatação pielocalicinal bilateral etc.) não entram
// na lista — não têm campo "lado" porque descrevem os dois rins.
//
// Em branco: não altera nada (evita quebrar outros blanks vizinhos, como
// "polo ," ou "terço ,", que não são cobertos por este campo).

const ROTULOS_COM_LADO = new Set([
  "Cisto renal simples",
  "Cisto com fino septo",
  "Aumento ecogenicidade + Cisto simples",
  "Nefrolitíase (único - com ectasia)",
  "Múltiplos cálculos (maior medida)",
  "Múltiplos cálculos (por grupamento)",
  "Dilatação pielocalicinal (Hidronefrose)",
  "Dilatação uretero-pielocalicinal (Ureterohidronefrose)",
  "Retração cortical focal (Cicatriz/Sequela)",
  "Angiomiolipoma renal",
  "Ureterocele",
  "Cisto simples pós-menopausa",
  "O-RADS 2: Cisto simples",
  "O-RADS 2: Lesão benigna típica (Cisto dermoide / Endometrioma)",
  "O-RADS 3: Cisto multilocular liso / Cisto de paredes irregulares",
  "O-RADS 4: Cisto com componente sólido / Projeção papilar",
  "O-RADS 5: Lesão sólida/cística de alto risco / Ascite",
]);

const ANCORAS_LADO = [
  { padrao: /no rim/, feminino: false },
  { padrao: /do rim/, feminino: false },
  { padrao: /no ovário/, feminino: false },
  { padrao: /na junção ureterovesical/, feminino: true },
];

export function itemTemCampoLado(item) {
  return ROTULOS_COM_LADO.has(item.rotulo);
}

function encontrarAncora(descricao) {
  for (const ancora of ANCORAS_LADO) {
    const m = ancora.padrao.exec(descricao);
    if (m) return { match: m, feminino: ancora.feminino };
  }
  return null;
}

export function aplicarCampoLado(rotulo, descricaoAtual, valor) {
  if (!ROTULOS_COM_LADO.has(rotulo)) return descricaoAtual;
  const lado = (valor || "").trim();
  if (!lado) return descricaoAtual;

  const encontrada = encontrarAncora(descricaoAtual);
  if (!encontrada) return descricaoAtual;
  const { match, feminino } = encontrada;
  const ladoTxt = feminino ? (lado === "esquerdo" ? "esquerda" : "direita") : lado;

  const fim = match.index + match[0].length;
  const antes = descricaoAtual.slice(0, fim);
  let depois = descricaoAtual.slice(fim);
  if (/^[ \t]*,/.test(depois)) {
    depois = depois.replace(/^[ \t]*,/, ",");
  } else {
    depois = depois.replace(/^[ \t]*/, " ");
  }
  return `${antes} ${ladoTxt}${depois}`;
}
