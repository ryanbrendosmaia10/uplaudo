// montarLaudo.js — Motor determinístico do modo "Montar por cliques".
// Função pura: recebe o texto da máscara normal e a lista de alterações
// selecionadas (na ordem de clique) e devolve o laudo final, sem IA.

export const ROTULOS_ORGAOS = [
  "Fígado:",
  "Vesícula Biliar:",
  "Veia Porta:",
  "Pâncreas:",
  "Baço:",
  "Rins:",
  "Aorta abdominal:",
  "Bexiga:",
  "Cavidade abdominal/pélvica:",
  "Tireoide:",
  "Útero:",
  "Endométrio:",
  "Ovários:",
  "Próstata:",
  "Vesículas seminais:",
  "Artéria hepática:",
  "Veias hepáticas:",
];

const PREFIXOS_MEDIDA = [
  "Eixo ",
  "Rim Direito:",
  "Rim Esquerdo:",
  "Ovário Direito:",
  "Ovário Esquerdo:",
  "Ovário direito:",
  "Ovário esquerdo:",
  "LOBO DIREITO:",
  "LOBO ESQUERDO:",
  "Volume tireoideano:",
  "Vol.:",
  "Medidas ",
  "Eco endometrial:",
  "Peso aproximado:",
  "IPP:",
];

const rotuloDaLinha = (linha, rotulos = ROTULOS_ORGAOS) => rotulos.find((r) => linha.startsWith(r)) || null;

const ehInicioImpressao = (linha) => {
  const t = linha.trim();
  return t.startsWith("IMPRESSÃO DIAGNÓSTICA:") || t.startsWith("CONCLUSÃO:");
};

const ehLinhaMedida = (linha) => {
  if (linha.includes("MEDIDAS")) return true;
  const t = linha.trim();
  return PREFIXOS_MEDIDA.some((p) => t.startsWith(p));
};

const ehLinhaNormalidade = (linha) => {
  const t = linha.trim();
  return (
    t.startsWith("- ") &&
    (t.includes("dentro dos padrões da normalidade") || t.includes("dentro dos limites da normalidade"))
  );
};

// Rótulo do órgão que a descrição de um chip substitui. Aceita a forma com
// dois pontos ("Bexiga: ...") e a forma corrida ("Bexiga urinária ..."),
// pois a fraseologia do médico nem sempre repete os dois pontos.
const rotuloDaDescricao = (descricao, rotulos = ROTULOS_ORGAOS) => {
  for (const r of rotulos) {
    if (descricao.startsWith(r)) return r;
    if (descricao.startsWith(r.slice(0, -1) + " ")) return r;
  }
  return null;
};

// Divide a máscara em blocos: "orgao" (parágrafo descritivo iniciado por um
// rótulo), "impressao" (do cabeçalho IMPRESSÃO/CONCLUSÃO até o fim) e
// "outro" (título, linhas em branco e blocos de MEDIDAS, nunca alterados).
function parsearMascara(texto, rotulos = ROTULOS_ORGAOS) {
  const blocos = [];
  let atual = null;
  let emImpressao = false;
  const abrir = (bloco) => {
    atual = bloco;
    blocos.push(bloco);
  };
  for (const linha of texto.split("\n")) {
    if (emImpressao) {
      atual.linhas.push(linha);
      continue;
    }
    if (ehInicioImpressao(linha)) {
      emImpressao = true;
      abrir({ tipo: "impressao", linhas: [linha] });
      continue;
    }
    const rotulo = rotuloDaLinha(linha, rotulos);
    if (rotulo) {
      abrir({ tipo: "orgao", rotulo, linhas: [linha] });
      continue;
    }
    if (linha.trim() === "" || ehLinhaMedida(linha)) {
      if (atual && atual.tipo === "outro") atual.linhas.push(linha);
      else abrir({ tipo: "outro", linhas: [linha] });
      continue;
    }
    // Linha solta não vazia: pertence ao bloco anterior (ex.: "Ausência de
    // dilatação das vias biliares..." continua o parágrafo da Vesícula).
    if (atual) atual.linhas.push(linha);
    else abrir({ tipo: "outro", linhas: [linha] });
  }
  return blocos;
}

// rotulosExtras: rótulos de órgão adicionais (ex.: parágrafos de um exame
// customizado pelo médico, cujos nomes não estão no léxico fixo acima) —
// só entram na busca de substituição desta chamada; ROTULOS_ORGAOS nunca é
// alterado, então toda chamada existente sem esse 3º parâmetro continua
// idêntica a antes.
export function montarLaudo(mascaraTexto, chipsSelecionados, rotulosExtras = []) {
  const rotulos = rotulosExtras.length ? [...ROTULOS_ORGAOS, ...rotulosExtras] : ROTULOS_ORGAOS;
  const blocos = parsearMascara(mascaraTexto, rotulos);
  const temOrgao = (rotulo) => blocos.some((b) => b.tipo === "orgao" && b.rotulo === rotulo);

  const porOrgao = new Map(); // rotulo -> [descricoes na ordem de clique]
  const anexosRins = []; // achados renais que entram no fim do parágrafo dos Rins
  const paragrafosAvulsos = []; // inseridos antes da IMPRESSÃO DIAGNÓSTICA

  for (const chip of chipsSelecionados) {
    const descricao = (chip.descricao || "").trim();
    if (!descricao) continue;
    if (descricao.startsWith("Imagem nodular") && chip.orgao === "Rins" && temOrgao("Rins:")) {
      anexosRins.push(descricao);
      continue;
    }
    const rotulo = rotuloDaDescricao(descricao, rotulos);
    if (rotulo && temOrgao(rotulo)) {
      if (!porOrgao.has(rotulo)) porOrgao.set(rotulo, []);
      porOrgao.get(rotulo).push(descricao);
    } else {
      paragrafosAvulsos.push(descricao);
    }
  }

  const impressoes = chipsSelecionados.map((c) => (c.impressao || "").trim()).filter(Boolean);

  const saida = [];
  let teveImpressao = false;
  for (const bloco of blocos) {
    if (bloco.tipo === "orgao") {
      const descricoes = porOrgao.get(bloco.rotulo);
      if (descricoes) {
        saida.push(descricoes[0]);
        for (const extra of descricoes.slice(1)) {
          saida.push(extra.startsWith(bloco.rotulo) ? extra.slice(bloco.rotulo.length).trim() : extra);
        }
      } else {
        saida.push(...bloco.linhas);
      }
      if (bloco.rotulo === "Rins:") saida.push(...anexosRins);
      continue;
    }
    if (bloco.tipo === "impressao") {
      teveImpressao = true;
      for (const paragrafo of paragrafosAvulsos) saida.push(paragrafo, "");
      if (impressoes.length === 0) {
        saida.push(...bloco.linhas);
        continue;
      }
      const comPrefixo = impressoes.filter((t) => !t.startsWith("Achado adicional:"));
      const achadosAdicionais = impressoes.filter((t) => t.startsWith("Achado adicional:"));
      const restantes = bloco.linhas.filter((l) => !ehLinhaNormalidade(l));
      while (restantes.length && restantes[restantes.length - 1].trim() === "") restantes.pop();
      saida.push(...restantes);
      for (const t of comPrefixo) saida.push("- " + t);
      for (const t of achadosAdicionais) saida.push(t);
      continue;
    }
    saida.push(...bloco.linhas);
  }

  // Máscara editada sem seção de impressão: achados não podem se perder.
  if (!teveImpressao && (paragrafosAvulsos.length || impressoes.length)) {
    for (const paragrafo of paragrafosAvulsos) saida.push("", paragrafo);
    for (const t of impressoes) saida.push("", t.startsWith("Achado adicional:") ? t : "- " + t);
  }

  return saida.join("\n");
}
