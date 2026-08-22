import { useState, useRef, useEffect, useCallback } from "react";
import { MASCARAS } from "./mascaras";
import { ALTERACOES } from "./alteracoes/index.js";
import { montarLaudo } from "./montarLaudo";
import TireoideBuilder from "./TireoideBuilder.jsx";
import MamaBuilder from "./MamaBuilder.jsx";
import OvariosPanel from "./OvariosPanel.jsx";
import { aplicarOvarios, OVARIO_VAZIO } from "./ovarios.js";
import RinsPanel from "./RinsPanel.jsx";
import { aplicarRins, RIM_VAZIO } from "./rins.js";
import {
  itemElegivelParaMedida,
  numeroDeCamposMedida,
  aplicarMedida,
  unidadeDoLocus,
} from "./camposMedida.js";
import { itemTemCampoSegmento, aplicarCampoSegmento, SEGMENTOS_HEPATICOS } from "./campoSegmento.js";
import { itemTemCampoLado, aplicarCampoLado } from "./campoLado.js";
import AuthPanel from "./AuthPanel.jsx";
import NovaAlteracaoForm from "./NovaAlteracaoForm.jsx";
import {
  assinarUsuario,
  assinarMascaras,
  obterMascaras,
  salvarMascara,
  excluirMascara,
  assinarAlteracoes,
  obterAlteracoes,
  salvarAlteracao,
  excluirAlteracao,
  gerarIdCustom,
} from "./nuvem.js";

const IDS_MASCARAS = Object.keys(MASCARAS);
const MASCARA_ID_PADRAO = IDS_MASCARAS[0];

const ehExameBuilder = (id) => id === "tireoide" || id === "mama";

const chaveStorageMascara = (id) => `laudovoz_mascara_${id}`;
const chaveAlteracao = (orgao, rotulo) => `${orgao}::${rotulo}`;

// ---- Fase 2: exames e alterações customizados pelo médico (Firebase quando
// logado; senão localStorage — ver src/nuvem.js). Fallback local: uma lista
// só, guardada como JSON, igual ao "Usar minha máscara" já existente. ----
const CHAVE_MASCARAS_CUSTOM_LOCAIS = "laudovoz_mascaras_customizadas";
const CHAVE_ALTERACOES_CUSTOM_LOCAIS = "laudovoz_alteracoes_customizadas";

const lerListaLocal = (chave) => {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : [];
  } catch (e) {
    return [];
  }
};
const salvarListaLocal = (chave, lista) => {
  try { localStorage.setItem(chave, JSON.stringify(lista)); } catch (e) {}
};

const REGRAS_LAUDOVOZ = `Você é o motor de laudos do LaudoVoz, sistema do Dr. Ryan Maia (radiologista). Sua tarefa: receber a transcrição de um ditado de ultrassom e devolver o laudo completo estruturado.

REGRAS OBRIGATÓRIAS:
1. Responda APENAS com o texto do laudo. Sem comentários, sem preâmbulo, sem markdown, sem asteriscos, sem travessão (—). Texto puro em português brasileiro.
2. Estrutura: TÍTULO DO EXAME EM MAIÚSCULAS na primeira linha, depois linha em branco, depois ANÁLISE: com os parágrafos descritivos, depois IMPRESSÃO: com os achados.
3. Silêncio = normal: órgãos da modalidade não citados no ditado saem com descrição normal padrão de serviço grande brasileiro.
4. Medidas em cm com vírgula decimal (ex: 1,2 x 0,8 cm). Vias biliares e veia porta em mm.
5. Parágrafo renal sempre inclui "Ausência de sinais de hidronefrose ou macrolitíase." após a descrição e antes das medidas.
6. Cistos renais sem classificação Bosniak (Bosniak é reservada para TC).
7. Líquido livre: "cavidade abdominal/pélvica".
8. IMPRESSÃO: sem medidas e sem localizações anatômicas específicas, apenas descritores qualitativos. Cada achado em linha própria. Tudo normal = "Exame ultrassonográfico dentro dos padrões da normalidade."
9. Vesícula não visualizada por cirurgia prévia: incluir "Status pós-colecistectomia." na impressão.
10. Nunca invente achados, medidas ou diagnósticos não ditados. Valor incerto ou inaudível na transcrição: marcar [revisar] no local.
11. A transcrição vem de voz e pode ter erros fonéticos (ex: "eco textura" = ecotextura, "pielo calicial" = pielocalicial): interprete pelo contexto médico.
12. Ignore conversas paralelas com o paciente ou equipe presentes na transcrição; aproveite apenas o conteúdo de achados do exame.

Você recebe uma MÁSCARA (laudo normal padrão do médico) e a TRANSCRIÇÃO do ditado. Use a MÁSCARA como base exata do laudo. Regras invioláveis:
1. Altere APENAS os trechos da máscara correspondentes ao que foi efetivamente ditado. Mantenha todo o resto da máscara igual, com a fraseologia normal dela. Nunca invente achados para estruturas que não foram ditadas.
2. Quando um achado for ditado como alterado, a frase alterada SUBSTITUI a frase normal daquela estrutura — nunca deixe a frase normal e a alterada juntas para a mesma estrutura, nem na descrição nem na impressão.
3. Na IMPRESSÃO DIAGNÓSTICA nunca inclua medidas nem localização anatômica específica. A impressão é um resumo qualitativo: o diagnóstico, ou palavras da descrição que levem a um diagnóstico, mais recomendações de complementação (TC/RM) e correlação clínico-laboratorial quando cabível.
4. Se algum trecho do ditado for divergente, ambíguo ou não compreendido, não chute: sinalize entre parênteses com [revisar].
5. Preserve a fraseologia e a estrutura da máscara (cabeçalhos por órgão, blocos de MEDIDAS, etc.). Não converta para outro formato.
6. Composição dentro da frase: cada estrutura segue a sequência fixa de parâmetros da máscara (ex.: dimensões, contornos, bordas, ecotextura; no fígado também marcas vasculares e lesões focais). Quando o ditado alterar um ou dois parâmetros, substitua APENAS esses parâmetros na posição deles dentro da frase, mantendo os demais normais e os conectivos naturais do português (ex.: "Fígado: de dimensões normais, com contornos irregulares, bordas agudas, exibindo ecotextura heterogênea. Marcas vasculares preservadas. Sem lesões focais evidenciadas ao método."). Nunca transcreva o ditado literalmente como frase solta: sempre componha a frase completa da estrutura no padrão da máscara.
7. O reconhecimento de voz comete erros fonéticos: interprete termos estranhos pelo contexto médico radiológico (ex.: "contextura" = ecotextura). Se a interpretação não for óbvia, aplique a regra 4.
8. Medidas ditadas vão nos campos de MEDIDAS da máscara, em cm com vírgula decimal.

ALTERAÇÕES SELECIONADAS são frases exatas do médico. Use a 'descricao' de cada alteração VERBATIM, substituindo a frase correspondente da estrutura na máscara (ou inserindo na posição anatômica correta quando for um achado adicional). Use a 'impressao' correspondente como linha da IMPRESSÃO DIAGNÓSTICA. Se o ditado trouxer medidas ou detalhes para uma alteração selecionada (ex.: tamanho do cálculo, lado do cisto), preencha esses dados dentro da frase da alteração. Não parafraseie as frases das alterações.`;

// Bloco 1: 0-3 campos de medida acoplados a um chip de alteração ativo.
// Só aparecem enquanto a alteração está selecionada; o valor some ao
// desativar. Aceita vírgula ou ponto, nunca converte unidade.
function CamposMedidaChip({ item, valores, aoMudar }) {
  const n = numeroDeCamposMedida(item);
  const unidade = unidadeDoLocus(item.descricao);
  return (
    <div className="flex items-center gap-1 mt-1 ml-1" onClick={(e) => e.stopPropagation()}>
      {Array.from({ length: n }).map((_, i) => (
        <input
          key={i}
          type="text"
          inputMode="decimal"
          value={valores[i] || ""}
          onChange={(e) => aoMudar(i, e.target.value)}
          placeholder={unidade}
          aria-label={`Medida ${i + 1} (${unidade}) de ${item.rotulo}`}
          className="w-14 bg-[var(--c-slate-900)] border border-[var(--c-slate-600)] rounded px-1.5 py-0.5 text-xs text-[var(--c-slate-100)] outline-none focus:border-[var(--c-accent-400)]"
        />
      ))}
    </div>
  );
}

// Item 1: campo de segmento hepático acoplado ao chip, mesmo padrão do
// CamposMedidaChip do Bloco 1 (só aparece com o chip ativo, some ao
// desativar).
function CampoSegmentoChip({ item, valor, aoMudar }) {
  return (
    <div className="flex items-center gap-1 mt-1 ml-1" onClick={(e) => e.stopPropagation()}>
      <select
        value={valor || ""}
        onChange={(e) => aoMudar(e.target.value)}
        aria-label={`Segmento hepático de ${item.rotulo}`}
        className="bg-[var(--c-slate-900)] border border-[var(--c-slate-600)] rounded px-1.5 py-0.5 text-xs text-[var(--c-slate-100)] outline-none focus:border-[var(--c-accent-400)]"
      >
        <option value="">segmento</option>
        {SEGMENTOS_HEPATICOS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}

// Campo de lado (direito/esquerdo) acoplado ao chip, mesmo padrão do campo
// de segmento. Em branco não altera nada (só quando um valor é escolhido).
function CampoLadoChip({ item, valor, aoMudar }) {
  return (
    <div className="flex items-center gap-1 mt-1 ml-1" onClick={(e) => e.stopPropagation()}>
      <select
        value={valor || ""}
        onChange={(e) => aoMudar(e.target.value)}
        aria-label={`Lado de ${item.rotulo}`}
        className="bg-[var(--c-slate-900)] border border-[var(--c-slate-600)] rounded px-1.5 py-0.5 text-xs text-[var(--c-slate-100)] outline-none focus:border-[var(--c-accent-400)]"
      >
        <option value="">lado</option>
        <option value="direito">Direito</option>
        <option value="esquerdo">Esquerdo</option>
      </select>
    </div>
  );
}

function BarraFormatacao({ aoFormatar, aoAumentar, aoDiminuir }) {
  return (
    <div className="px-3 py-1.5 border-b border-[var(--c-slate-700)] flex items-center gap-1 bg-[var(--c-slate-800-60)]">
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => aoFormatar("bold")}
        title="Negrito"
        className="w-7 h-7 rounded text-sm font-bold bg-[var(--c-slate-700)] hover:bg-[var(--c-slate-600)] text-[var(--c-slate-100)]"
      >
        B
      </button>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => aoFormatar("italic")}
        title="Itálico"
        className="w-7 h-7 rounded text-sm italic bg-[var(--c-slate-700)] hover:bg-[var(--c-slate-600)] text-[var(--c-slate-100)]"
      >
        I
      </button>
      <span className="w-px h-4 bg-[var(--c-slate-600)] mx-1" />
      <button
        onClick={aoAumentar}
        title="Aumentar fonte"
        className="px-2 h-7 rounded text-xs font-semibold bg-[var(--c-slate-700)] hover:bg-[var(--c-slate-600)] text-[var(--c-slate-100)]"
      >
        A+
      </button>
      <button
        onClick={aoDiminuir}
        title="Diminuir fonte"
        className="px-2 h-7 rounded text-xs font-semibold bg-[var(--c-slate-700)] hover:bg-[var(--c-slate-600)] text-[var(--c-slate-100)]"
      >
        A−
      </button>
    </div>
  );
}

export default function LaudoVozIA() {
  const [modo, setModo] = useState("cliques");
  const [toast, setToast] = useState("");
  const [erro, setErro] = useState("");
  const toastTimer = useRef(null);

  // ---- Estado do modo "Montar por cliques" (100% local) ----
  const [cliquesExameId, setCliquesExameId] = useState(MASCARA_ID_PADRAO);
  const [cliquesChips, setCliquesChips] = useState([]);
  const [medidasPorChip, setMedidasPorChip] = useState({}); // chave -> [v1,v2,v3]
  const [segmentosPorChip, setSegmentosPorChip] = useState({}); // chave -> "VI" etc.
  const [ladosPorChip, setLadosPorChip] = useState({}); // chave -> "direito"/"esquerdo"
  const [ovarioDireito, setOvarioDireito] = useState(OVARIO_VAZIO);
  const [ovarioEsquerdo, setOvarioEsquerdo] = useState(OVARIO_VAZIO);
  const ovariosRef = useRef({ direito: OVARIO_VAZIO, esquerdo: OVARIO_VAZIO, orads: { ativo: false, valor: "" } });
  const rinsRef = useRef({ direito: RIM_VAZIO, esquerdo: RIM_VAZIO });
  const [cliquesEdicaoManual, setCliquesEdicaoManual] = useState(false);
  const [cliquesFontSize, setCliquesFontSize] = useState(14);
  const cliquesEditorRef = useRef(null);
  const edicaoManualRef = useRef(false);
  const builderTextoRef = useRef("");

  // ---- Estado do modo "Ditado + IA" ----
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [busyMsg, setBusyMsg] = useState("");
  const [abaEntrada, setAbaEntrada] = useState("ditado");
  const [criandoExame, setCriandoExame] = useState(false);
  const [nomeNovoExame, setNomeNovoExame] = useState("");
  const [alteracoesSelecionadas, setAlteracoesSelecionadas] = useState([]);
  const [medidasPorAlteracao, setMedidasPorAlteracao] = useState({}); // chave -> [v1,v2,v3]
  const [segmentosPorAlteracao, setSegmentosPorAlteracao] = useState({}); // chave -> "VI" etc.
  const [ladosPorAlteracao, setLadosPorAlteracao] = useState({}); // chave -> "direito"/"esquerdo"
  const [mascaraId, setMascaraId] = useState(MASCARA_ID_PADRAO);

  // Grupos recolhíveis nos painéis de alterações ("Montar por cliques" e
  // "Ditado + IA"): chave é grupo.orgao, compartilhada entre os dois modos
  // (recolher "Rins" num modo mantém recolhido no outro). Ausente = expandido
  // (estado inicial preserva o comportamento de hoje, nada começa escondido).
  const [gruposColapsados, setGruposColapsados] = useState({});
  const alternarGrupoColapsado = (orgao) =>
    setGruposColapsados((prev) => ({ ...prev, [orgao]: !prev[orgao] }));
  const contarAtivosNoGrupo = (grupo, selecionados) =>
    grupo.itens.filter((item) =>
      selecionados.some((a) => chaveAlteracao(a.orgao, a.rotulo) === chaveAlteracao(grupo.orgao, item.rotulo))
    ).length;
  // ---- Fase 2: nuvem (Firebase) — login e máscaras/alterações customizadas.
  // Sem login, tudo isso continua 100% local (localStorage), como sempre.
  // Tema claro/escuro — persistido no navegador, aplicado via atributo
  // data-theme na <html> (ver src/index.css). Escuro é o padrão (o que já
  // existia); o destaque nele passou de azul pra laranja, que perde menos
  // luminância numa sala de ultrassom escurecida.
  const [tema, setTema] = useState(() => {
    try { return localStorage.getItem("laudovoz_tema") || "dark"; } catch (e) { return "dark"; }
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tema);
    try { localStorage.setItem("laudovoz_tema", tema); } catch (e) {}
  }, [tema]);
  const alternarTema = () => setTema((t) => (t === "dark" ? "light" : "dark"));

  const [usuario, setUsuario] = useState(null);
  const [mascarasNuvem, setMascarasNuvem] = useState({}); // id -> {nome?, texto, customizada?}
  const [alteracoesNuvem, setAlteracoesNuvem] = useState([]);
  const [mascarasLocais, setMascarasLocais] = useState(() => lerListaLocal(CHAVE_MASCARAS_CUSTOM_LOCAIS));
  const [alteracoesLocais, setAlteracoesLocais] = useState(() => lerListaLocal(CHAVE_ALTERACOES_CUSTOM_LOCAIS));

  useEffect(() => assinarUsuario(setUsuario), []);

  useEffect(() => {
    if (!usuario) { setMascarasNuvem({}); setAlteracoesNuvem([]); return; }
    const unsub1 = assinarMascaras(usuario.uid, setMascarasNuvem);
    const unsub2 = assinarAlteracoes(usuario.uid, setAlteracoesNuvem);
    return () => { unsub1(); unsub2(); };
  }, [usuario]);

  // Login: sobe pra nuvem o que só existia neste navegador — só o que a
  // nuvem ainda não tem (nunca sobrescreve o que já está lá, pra não perder
  // dado mais novo de outro aparelho). Roda uma vez por login, com leitura
  // direta (não a assinatura reativa, que pode ainda estar vazia nesse
  // instante).
  const migracaoPorUsuarioRef = useRef(null);
  useEffect(() => {
    if (!usuario || migracaoPorUsuarioRef.current === usuario.uid) return;
    migracaoPorUsuarioRef.current = usuario.uid;
    (async () => {
      try {
        const [nuvemMascaras, nuvemAlteracoes] = await Promise.all([
          obterMascaras(usuario.uid),
          obterAlteracoes(usuario.uid),
        ]);
        for (const id of IDS_MASCARAS) {
          let textoLocal = null;
          try { textoLocal = localStorage.getItem(chaveStorageMascara(id)); } catch (e) {}
          if (textoLocal && !nuvemMascaras[id]) {
            await salvarMascara(usuario.uid, id, { texto: textoLocal });
          }
        }
        for (const m of mascarasLocais) {
          if (!nuvemMascaras[m.id]) {
            await salvarMascara(usuario.uid, m.id, { nome: m.nome, texto: m.texto, customizada: true });
          }
        }
        const idsNuvem = new Set(nuvemAlteracoes.map((a) => a.id));
        for (const a of alteracoesLocais) {
          if (!idsNuvem.has(a.id)) {
            await salvarAlteracao(usuario.uid, a.id, {
              mascaraId: a.mascaraId, orgao: a.orgao, rotulo: a.rotulo, descricao: a.descricao, impressao: a.impressao || "",
            });
          }
        }
      } catch (e) {
        // Falha de rede/permissão na migração: os dados continuam salvos
        // localmente, nada se perde — só não sobe desta vez.
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  // Registro combinado de exames customizados (novos, não presentes em
  // MASCARAS): nuvem quando logado, local quando não.
  const registroMascarasCustom = usuario
    ? Object.fromEntries(Object.entries(mascarasNuvem).filter(([id]) => !MASCARAS[id]))
    : Object.fromEntries(mascarasLocais.map((m) => [m.id, m]));
  const idsMascarasCustom = Object.keys(registroMascarasCustom);
  const nomeExameCliques = (id) => {
    if (id === "mama") return "Mama (nódulos)";
    if (MASCARAS[id]) return MASCARAS[id].nome;
    return registroMascarasCustom[id]?.nome || id;
  };
  // Exames cujo painel do modo por cliques é um módulo dedicado (builder de
  // nódulos), não a lista genérica de chips. "mama" ainda não tem máscara em
  // mascaras.js, por isso só existe no modo por cliques.
  const EXAMES_CLIQUES = [...IDS_MASCARAS, ...idsMascarasCustom, "mama"];

  const lerMascaraAtiva = (id) => {
    if (usuario && mascarasNuvem[id]?.texto !== undefined) return mascarasNuvem[id].texto;
    if (registroMascarasCustom[id]) return registroMascarasCustom[id].texto;
    if (!MASCARAS[id]) return "";
    try {
      return localStorage.getItem(chaveStorageMascara(id)) || MASCARAS[id].texto;
    } catch (e) {
      return MASCARAS[id].texto;
    }
  };

  // Alterações de um exame, com as customizadas do médico mescladas por
  // grupo (orgao) — cria um grupo novo se o nome não existir ainda.
  const alteracoesAtivas = (idExame) => {
    const base = ALTERACOES[idExame] || [];
    const extras = (usuario ? alteracoesNuvem : alteracoesLocais).filter((a) => a.mascaraId === idExame);
    if (!extras.length) return base;
    const grupos = base.map((g) => ({ ...g, itens: [...g.itens] }));
    for (const a of extras) {
      const orgao = a.orgao || "Personalizadas";
      let grupo = grupos.find((g) => g.orgao === orgao);
      if (!grupo) { grupo = { orgao, itens: [] }; grupos.push(grupo); }
      grupo.itens.push({ rotulo: a.rotulo, descricao: a.descricao, impressao: a.impressao || "", _customId: a.id });
    }
    return grupos;
  };

  // montarLaudo.js só sabe substituir parágrafos cujo rótulo está no léxico
  // fixo dela (ROTULOS_ORGAOS). Uma alteração customizada cujo parágrafo é
  // novo (ex.: "Órgão X:", de um exame criado do zero) não está nesse léxico
  // — sem isso, o clique só ANEXARIA a frase nova, deixando a linha "normal"
  // antiga duplicada ao lado. O 3º parâmetro (opcional) de montarLaudo cobre
  // esse caso sem tocar no léxico fixo nem em nenhuma chamada existente.
  const rotulosExtrasParaExame = (idExame) => {
    const extras = (usuario ? alteracoesNuvem : alteracoesLocais).filter((a) => a.mascaraId === idExame);
    const vistos = new Set();
    for (const a of extras) {
      const m = /^([^:\n]+:)/.exec(a.descricao || "");
      if (m) vistos.add(m[1]);
    }
    return [...vistos];
  };

  const salvarNovaMascaraCustom = async (nome) => {
    const id = gerarIdCustom();
    const dados = { nome, texto: "", customizada: true };
    if (usuario) {
      await salvarMascara(usuario.uid, id, dados);
    } else {
      const nova = [...mascarasLocais, { id, ...dados }];
      setMascarasLocais(nova);
      salvarListaLocal(CHAVE_MASCARAS_CUSTOM_LOCAIS, nova);
    }
    return id;
  };

  const excluirMascaraCustom = async (id) => {
    if (usuario) {
      await excluirMascara(usuario.uid, id).catch(() => {});
    } else {
      const nova = mascarasLocais.filter((m) => m.id !== id);
      setMascarasLocais(nova);
      salvarListaLocal(CHAVE_MASCARAS_CUSTOM_LOCAIS, nova);
    }
  };

  const salvarNovaAlteracaoCustom = async ({ mascaraId: idExame, orgao, rotulo, descricao, impressao }) => {
    const id = gerarIdCustom();
    const dados = { mascaraId: idExame, orgao: orgao || "", rotulo, descricao, impressao: impressao || "" };
    if (usuario) {
      await salvarAlteracao(usuario.uid, id, dados);
    } else {
      const nova = [...alteracoesLocais, { id, ...dados }];
      setAlteracoesLocais(nova);
      salvarListaLocal(CHAVE_ALTERACOES_CUSTOM_LOCAIS, nova);
    }
  };

  const excluirAlteracaoCustom = async (id) => {
    if (usuario) {
      await excluirAlteracao(usuario.uid, id).catch(() => {});
    } else {
      const nova = alteracoesLocais.filter((a) => a.id !== id);
      setAlteracoesLocais(nova);
      salvarListaLocal(CHAVE_ALTERACOES_CUSTOM_LOCAIS, nova);
    }
  };

  const [mascaraTexto, setMascaraTexto] = useState(() => lerMascaraAtiva(MASCARA_ID_PADRAO));
  const [laudoFontSize, setLaudoFontSize] = useState(14);
  const recRef = useRef(null);
  const listeningRef = useRef(false);
  const laudoEditorRef = useRef(null);

  // ---- Ditado alternativo via Whisper (grava áudio e transcreve no servidor) ----
  const [gravandoWhisper, setGravandoWhisper] = useState(false);
  const [transcrevendoWhisper, setTranscrevendoWhisper] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "pt-BR";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (ev) => {
      let inter = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (r.isFinal) {
          setTranscript((prev) => (prev ? prev.trimEnd() + " " : "") + r[0].transcript.trim());
        } else {
          inter += r[0].transcript;
        }
      }
      setInterim(inter);
    };
    rec.onerror = (ev) => {
      // "aborted" é disparado quando chamamos rec.stop() manualmente; não é um erro real.
      if (ev.error === "aborted") return;
      if (ev.error === "not-allowed" || ev.error === "permission-denied" || ev.error === "service-not-allowed") {
        listeningRef.current = false;
        setListening(false);
        setErro("Permita o microfone no cadeado da barra de endereço e recarregue.");
        return;
      }
      if (ev.error === "no-speech") {
        showToast("Nenhuma fala detectada.");
        return;
      }
      listeningRef.current = false;
      setListening(false);
      setErro("Erro no reconhecimento de voz: " + ev.error);
    };
    rec.onend = () => {
      setInterim("");
      if (listeningRef.current) {
        try { rec.start(); } catch (e) {}
      }
    };
    recRef.current = rec;
    return () => { listeningRef.current = false; try { rec.stop(); } catch (e) {} };
  }, []);

  // Carrega a máscara no editor do modo por cliques na abertura do app.
  useEffect(() => {
    atualizarEditorCliques(MASCARA_ID_PADRAO, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2400);
  };

  const formatarEditor = (ref, comando) => {
    ref.current?.focus();
    document.execCommand(comando);
  };

  const copiarEditor = async (ref) => {
    const el = ref.current;
    const texto = (el?.innerText || "").trim();
    if (!texto) { showToast("O laudo está vazio."); return; }
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({
          "text/html": new Blob([el.innerHTML], { type: "text/html" }),
          "text/plain": new Blob([el.innerText], { type: "text/plain" }),
        });
        await navigator.clipboard.write([item]);
      } else {
        await navigator.clipboard.writeText(el.innerText);
      }
      showToast("Laudo copiado.");
    } catch (e) {
      try {
        await navigator.clipboard.writeText(el.innerText);
        showToast("Laudo copiado (texto simples).");
      } catch (e2) {
        showToast("Não foi possível copiar automaticamente. Selecione e copie manualmente.");
      }
    }
  };

  // ---- Modo "Montar por cliques" ----

  const marcarEdicaoManual = (v) => {
    edicaoManualRef.current = v;
    setCliquesEdicaoManual(v);
  };

  // chips com a descrição final (medidas do Bloco 1, segmento do Item 1 e
  // lado já substituídos/removidos/inseridos).
  const chipsComMedidas = (chips, mapaMedidas, mapaSegmentos, mapaLados) =>
    chips.map((chip) => {
      const chave = chaveAlteracao(chip.orgao, chip.rotulo);
      let descricao = chip.descricao;
      // Segmento/lado primeiro: em alguns itens o campo é inserido usando
      // "medindo" ou uma âncora fixa no texto original — se a medida rodasse
      // antes e removesse esse trecho (médico deixou a medida em branco), a
      // âncora já teria sumido.
      if (itemTemCampoSegmento(chip)) descricao = aplicarCampoSegmento(chip.rotulo, descricao, mapaSegmentos[chave]);
      if (itemTemCampoLado(chip)) descricao = aplicarCampoLado(chip.rotulo, descricao, mapaLados[chave]);
      if (itemElegivelParaMedida(chip)) descricao = aplicarMedida(descricao, mapaMedidas[chave] || []);
      return descricao === chip.descricao ? chip : { ...chip, descricao };
    });

  const atualizarEditorCliques = (exameId, chips, mapaMedidas = medidasPorChip, mapaSegmentos = segmentosPorChip, mapaLados = ladosPorChip) => {
    if (!cliquesEditorRef.current) return;
    let texto = montarLaudo(lerMascaraAtiva(exameId), chipsComMedidas(chips, mapaMedidas, mapaSegmentos, mapaLados), rotulosExtrasParaExame(exameId));
    // Bloco 7: ovário direito/esquerdo é um recurso à parte do motor de
    // chips (não mexe em montarLaudo.js) — aplicado por cima do texto já
    // montado, só na pélvica transvaginal, só quando algum lado sai do
    // estado padrão (ver aplicarOvarios em src/ovarios.js).
    if (exameId === "transvaginal") {
      texto = aplicarOvarios(texto, ovariosRef.current.direito, ovariosRef.current.esquerdo, ovariosRef.current.orads);
    }
    // Item 3: rim direito/esquerdo, mesmo espírito do Bloco 7 — mas aditivo
    // ao grupo "Rins" já existente. Se o médico já está usando algum chip
    // antigo desse grupo, este painel novo não interfere (ver aplicarRins).
    if (exameId === "abdome_total" || exameId === "vias_urinarias") {
      const temAlteracaoRimAntiga = chips.some((c) => c.orgao === "Rins");
      texto = aplicarRins(texto, rinsRef.current.direito, rinsRef.current.esquerdo, temAlteracaoRimAntiga);
    }
    cliquesEditorRef.current.textContent = texto;
  };

  // Callback estável para os builders (tireoide/mama): guarda o texto mais
  // recente e só escreve no editor quando não há edição manual ativa.
  const aoAtualizarBuilder = useCallback((texto) => {
    builderTextoRef.current = texto;
    if (!edicaoManualRef.current && cliquesEditorRef.current) {
      cliquesEditorRef.current.textContent = texto;
    }
  }, []);

  const toggleChipCliques = (orgao, item) => {
    const chave = chaveAlteracao(orgao, item.rotulo);
    const jaTem = cliquesChips.some((a) => chaveAlteracao(a.orgao, a.rotulo) === chave);
    const novos = jaTem
      ? cliquesChips.filter((a) => chaveAlteracao(a.orgao, a.rotulo) !== chave)
      : [...cliquesChips, { orgao, ...item }];
    setCliquesChips(novos);
    // Desativar a alteração descarta as medidas/segmento digitados para ela.
    let mapaMedidas = medidasPorChip;
    if (jaTem && medidasPorChip[chave]) {
      mapaMedidas = { ...medidasPorChip };
      delete mapaMedidas[chave];
      setMedidasPorChip(mapaMedidas);
    }
    let mapaSegmentos = segmentosPorChip;
    if (jaTem && segmentosPorChip[chave]) {
      mapaSegmentos = { ...segmentosPorChip };
      delete mapaSegmentos[chave];
      setSegmentosPorChip(mapaSegmentos);
    }
    let mapaLados = ladosPorChip;
    if (jaTem && ladosPorChip[chave]) {
      mapaLados = { ...ladosPorChip };
      delete mapaLados[chave];
      setLadosPorChip(mapaLados);
    }
    if (!cliquesEdicaoManual) atualizarEditorCliques(cliquesExameId, novos, mapaMedidas, mapaSegmentos, mapaLados);
  };

  const alterarSegmentoChip = (orgao, rotulo, valor) => {
    const chave = chaveAlteracao(orgao, rotulo);
    const mapaSegmentos = { ...segmentosPorChip, [chave]: valor };
    setSegmentosPorChip(mapaSegmentos);
    if (!cliquesEdicaoManual) atualizarEditorCliques(cliquesExameId, cliquesChips, medidasPorChip, mapaSegmentos);
  };

  const alterarLadoChip = (orgao, rotulo, valor) => {
    const chave = chaveAlteracao(orgao, rotulo);
    const mapaLados = { ...ladosPorChip, [chave]: valor };
    setLadosPorChip(mapaLados);
    if (!cliquesEdicaoManual) atualizarEditorCliques(cliquesExameId, cliquesChips, medidasPorChip, segmentosPorChip, mapaLados);
  };

  const aoMudarOvarios = useCallback((direito, esquerdo, orads) => {
    ovariosRef.current = { direito, esquerdo, orads };
    setOvarioDireito(direito);
    setOvarioEsquerdo(esquerdo);
    if (!edicaoManualRef.current) atualizarEditorCliques(cliquesExameId, cliquesChips, medidasPorChip);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cliquesExameId, cliquesChips, medidasPorChip]);

  const aoMudarRins = useCallback((direito, esquerdo) => {
    rinsRef.current = { direito, esquerdo };
    if (!edicaoManualRef.current) atualizarEditorCliques(cliquesExameId, cliquesChips, medidasPorChip);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cliquesExameId, cliquesChips, medidasPorChip]);

  const alterarMedidaChip = (orgao, rotulo, indice, valor) => {
    const chave = chaveAlteracao(orgao, rotulo);
    const atual = medidasPorChip[chave] ? [...medidasPorChip[chave]] : [];
    atual[indice] = valor;
    const mapaMedidas = { ...medidasPorChip, [chave]: atual };
    setMedidasPorChip(mapaMedidas);
    if (!cliquesEdicaoManual) atualizarEditorCliques(cliquesExameId, cliquesChips, mapaMedidas);
  };

  const trocarExameCliques = (id) => {
    if (
      cliquesEdicaoManual &&
      !window.confirm("Trocar de exame descarta as edições manuais do laudo. Continuar?")
    ) return;
    setCliquesExameId(id);
    setCliquesChips([]);
    setMedidasPorChip({});
    setSegmentosPorChip({});
    setLadosPorChip({});
    ovariosRef.current = { direito: OVARIO_VAZIO, esquerdo: OVARIO_VAZIO, orads: { ativo: false, valor: "" } };
    setOvarioDireito(OVARIO_VAZIO);
    setOvarioEsquerdo(OVARIO_VAZIO);
    rinsRef.current = { direito: RIM_VAZIO, esquerdo: RIM_VAZIO };
    marcarEdicaoManual(false);
    builderTextoRef.current = "";
    if (!ehExameBuilder(id)) atualizarEditorCliques(id, []);
    // Exames com builder: o próprio builder emite o laudo ao montar.
  };

  const remontarCliques = () => {
    if (!window.confirm("Remontar reaplica máscara + alterações do zero. As edições manuais serão perdidas. Continuar?")) return;
    marcarEdicaoManual(false);
    if (ehExameBuilder(cliquesExameId)) {
      if (cliquesEditorRef.current) cliquesEditorRef.current.textContent = builderTextoRef.current;
    } else {
      atualizarEditorCliques(cliquesExameId, cliquesChips);
    }
  };

  // ---- Modo "Ditado + IA" ----

  const toggleMic = () => {
    const rec = recRef.current;
    if (!rec) { setErro("Ditado por voz requer Chrome ou Edge."); return; }
    setErro("");
    if (listening) {
      listeningRef.current = false;
      setListening(false);
      rec.stop();
    } else {
      listeningRef.current = true;
      setListening(true);
      try { rec.start(); } catch (e) {}
    }
  };

  const extractText = (data) =>
    (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

  // Alternativa ao ditado ao vivo: grava o áudio inteiro e envia para o
  // Whisper (api/whisper.js) transcrever de uma vez, em vez de streaming.
  const toggleGravacaoWhisper = async () => {
    if (gravandoWhisper) {
      mediaRecorderRef.current?.stop();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setErro("Gravação de áudio não é suportada neste navegador.");
      return;
    }
    setErro("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      audioChunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setGravandoWhisper(false);
        const blob = new Blob(audioChunksRef.current, { type: rec.mimeType || "audio/webm" });
        if (blob.size === 0) { showToast("Nenhum áudio gravado."); return; }
        setTranscrevendoWhisper(true);
        try {
          const formData = new FormData();
          formData.append("file", blob, "gravacao.webm");
          const response = await fetch("/api/whisper", { method: "POST", body: formData });
          const data = await response.json();
          if (data.error) throw new Error(data.error);
          const texto = (data.text || "").trim();
          if (!texto) throw new Error("O Whisper não retornou texto.");
          setTranscript((prev) => (prev ? prev.trimEnd() + " " : "") + texto);
          showToast("Áudio transcrito pelo Whisper.");
        } catch (e) {
          setErro("Falha ao transcrever com Whisper: " + e.message);
        } finally {
          setTranscrevendoWhisper(false);
        }
      };
      mediaRecorderRef.current = rec;
      rec.start();
      setGravandoWhisper(true);
    } catch (e) {
      setErro("Não foi possível acessar o microfone. Permita o acesso e tente novamente.");
    }
  };

  const selecionarMascara = (id) => {
    setMascaraId(id);
    setMascaraTexto(lerMascaraAtiva(id));
    setAlteracoesSelecionadas([]);
  };

  const criarNovoExame = async () => {
    const nome = nomeNovoExame.trim();
    if (!nome) return;
    const id = await salvarNovaMascaraCustom(nome);
    setNomeNovoExame("");
    setCriandoExame(false);
    selecionarMascara(id);
  };

  const excluirExameAtual = async () => {
    await excluirMascaraCustom(mascaraId);
    selecionarMascara(MASCARA_ID_PADRAO);
  };

  const editarMascaraTexto = (texto) => {
    setMascaraTexto(texto);
    if (!MASCARAS[mascaraId]) {
      // Exame customizado: o texto digitado É o conteúdo salvo, não um
      // "override" por cima de nada.
      if (usuario) {
        salvarMascara(usuario.uid, mascaraId, { texto }).catch(() => {});
      } else {
        const nova = mascarasLocais.map((m) => (m.id === mascaraId ? { ...m, texto } : m));
        setMascarasLocais(nova);
        salvarListaLocal(CHAVE_MASCARAS_CUSTOM_LOCAIS, nova);
      }
      return;
    }
    try { localStorage.setItem(chaveStorageMascara(mascaraId), texto); } catch (e) {}
    if (usuario) salvarMascara(usuario.uid, mascaraId, { texto }).catch(() => {});
  };

  const restaurarMascaraPadrao = () => {
    if (!MASCARAS[mascaraId]) return; // exame customizado não tem "padrão" pra restaurar
    const original = MASCARAS[mascaraId].texto;
    setMascaraTexto(original);
    try { localStorage.removeItem(chaveStorageMascara(mascaraId)); } catch (e) {}
    if (usuario) excluirMascara(usuario.uid, mascaraId).catch(() => {});
    showToast("Máscara restaurada ao padrão.");
  };

  const toggleAlteracao = (orgao, item) => {
    const chave = chaveAlteracao(orgao, item.rotulo);
    const jaTem = alteracoesSelecionadas.some((a) => chaveAlteracao(a.orgao, a.rotulo) === chave);
    setAlteracoesSelecionadas((prev) =>
      jaTem
        ? prev.filter((a) => chaveAlteracao(a.orgao, a.rotulo) !== chave)
        : [...prev, { orgao, ...item }]
    );
    // Desativar a alteração descarta as medidas/segmento digitados para ela.
    if (jaTem && medidasPorAlteracao[chave]) {
      setMedidasPorAlteracao((prev) => {
        const novo = { ...prev };
        delete novo[chave];
        return novo;
      });
    }
    if (jaTem && segmentosPorAlteracao[chave]) {
      setSegmentosPorAlteracao((prev) => {
        const novo = { ...prev };
        delete novo[chave];
        return novo;
      });
    }
    if (jaTem && ladosPorAlteracao[chave]) {
      setLadosPorAlteracao((prev) => {
        const novo = { ...prev };
        delete novo[chave];
        return novo;
      });
    }
  };

  const alterarMedidaAlteracao = (orgao, rotulo, indice, valor) => {
    const chave = chaveAlteracao(orgao, rotulo);
    setMedidasPorAlteracao((prev) => {
      const atual = prev[chave] ? [...prev[chave]] : [];
      atual[indice] = valor;
      return { ...prev, [chave]: atual };
    });
  };

  const alterarSegmentoAlteracao = (orgao, rotulo, valor) => {
    const chave = chaveAlteracao(orgao, rotulo);
    setSegmentosPorAlteracao((prev) => ({ ...prev, [chave]: valor }));
  };

  const alterarLadoAlteracao = (orgao, rotulo, valor) => {
    const chave = chaveAlteracao(orgao, rotulo);
    setLadosPorAlteracao((prev) => ({ ...prev, [chave]: valor }));
  };

  const removerAlteracao = (orgao, rotulo) => {
    const chave = chaveAlteracao(orgao, rotulo);
    setAlteracoesSelecionadas((prev) => prev.filter((a) => chaveAlteracao(a.orgao, a.rotulo) !== chave));
    if (medidasPorAlteracao[chave]) {
      setMedidasPorAlteracao((prev) => {
        const novo = { ...prev };
        delete novo[chave];
        return novo;
      });
    }
    if (segmentosPorAlteracao[chave]) {
      setSegmentosPorAlteracao((prev) => {
        const novo = { ...prev };
        delete novo[chave];
        return novo;
      });
    }
    if (ladosPorAlteracao[chave]) {
      setLadosPorAlteracao((prev) => {
        const novo = { ...prev };
        delete novo[chave];
        return novo;
      });
    }
  };

  const gerarLaudo = async () => {
    if (!transcript.trim() && alteracoesSelecionadas.length === 0) {
      showToast("Dite algo ou selecione ao menos uma alteração.");
      return;
    }
    setBusy(true);
    setBusyMsg(`Gerando laudo (${nomeExameCliques(mascaraId)})…`);
    setErro("");
    try {
      // gerarLaudo é recriada a cada render, então alteracoesSelecionadas aqui
      // é sempre o estado atual do clique (sem closure desatualizada).
      const blocoAlteracoes = alteracoesSelecionadas.length
        ? "\n\nALTERAÇÕES SELECIONADAS:\n" +
          alteracoesSelecionadas
            .map((a, i) => {
              const chave = chaveAlteracao(a.orgao, a.rotulo);
              let descricao = a.descricao;
              if (itemTemCampoSegmento(a)) descricao = aplicarCampoSegmento(a.rotulo, descricao, segmentosPorAlteracao[chave]);
              if (itemTemCampoLado(a)) descricao = aplicarCampoLado(a.rotulo, descricao, ladosPorAlteracao[chave]);
              if (itemElegivelParaMedida(a)) descricao = aplicarMedida(descricao, medidasPorAlteracao[chave] || []);
              return `${i + 1}. ${a.rotulo}\n   Descrição: ${descricao}\n   Impressão: ${a.impressao}`;
            })
            .join("\n")
        : "";
      const blocoTranscricao = transcript.trim()
        ? "\n\nTRANSCRIÇÃO DO DITADO:\n" + transcript
        : "";
      const conteudo =
        REGRAS_LAUDOVOZ +
        "\n\nMÁSCARA:\n" + mascaraTexto +
        blocoAlteracoes +
        blocoTranscricao;
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-5",
          max_tokens: 2000,
          messages: [{ role: "user", content: conteudo }],
        }),
      });
      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error(
          response.ok
            ? "O servidor respondeu sem um corpo JSON válido."
            : `O servidor respondeu com erro (status ${response.status}) sem detalhes no corpo.`
        );
      }
      if (data.error) {
        const mensagemErro = typeof data.error === "string" ? data.error : data.error.message;
        throw new Error(mensagemErro || `Erro da API (status ${response.status})`);
      }
      const texto = extractText(data);
      if (!texto) throw new Error("A IA não retornou texto.");
      if (laudoEditorRef.current) laudoEditorRef.current.textContent = texto;
      showToast("Laudo gerado. Revise antes de usar.");
    } catch (e) {
      const mensagem =
        e instanceof TypeError
          ? "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente."
          : e.message;
      setErro("Falha ao gerar o laudo: " + mensagem);
    } finally {
      setBusy(false);
      setBusyMsg("");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--c-slate-900)] text-[var(--c-slate-200)] flex flex-col font-sans">
      {/* Cabeçalho */}
      <header className="px-4 py-3 border-b border-[var(--c-slate-700)] bg-[var(--c-slate-800)] flex items-center gap-3 flex-wrap">
        <h1 className="text-base font-semibold tracking-wide">LaudoVoz IA</h1>
        <span className="text-xs text-[var(--c-slate-400)]">protótipo v0.2 · montar por cliques ou ditado + IA</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={alternarTema}
            title={tema === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
            className="px-2 py-1 rounded-md text-xs bg-[var(--c-slate-700)] hover:bg-[var(--c-slate-600)] text-[var(--c-slate-200)]"
          >
            {tema === "dark" ? "☀️ Claro" : "🌙 Escuro"}
          </button>
          <AuthPanel usuario={usuario} />
        </div>
      </header>

      {/* Abas de modo */}
      <div className="flex border-b border-[var(--c-slate-700)] bg-[var(--c-slate-800)]">
        <button
          onClick={() => setModo("cliques")}
          className={
            "px-6 py-3 text-sm font-bold transition border-b-2 " +
            (modo === "cliques"
              ? "text-[var(--c-accent-400)] border-[var(--c-accent-400)]"
              : "text-[var(--c-slate-400)] border-transparent hover:text-[var(--c-slate-200)]")
          }
        >
          Montar por cliques
        </button>
        <button
          onClick={() => setModo("ia")}
          className={
            "px-6 py-3 text-sm font-bold transition border-b-2 " +
            (modo === "ia"
              ? "text-[var(--c-accent-400)] border-[var(--c-accent-400)]"
              : "text-[var(--c-slate-400)] border-transparent hover:text-[var(--c-slate-200)]")
          }
        >
          Ditado + IA
        </button>
      </div>

      {erro && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-md border border-[var(--c-red-500)] text-[var(--c-red-300)] text-sm">
          {erro}
        </div>
      )}

      {/* ===================== MODO MONTAR POR CLIQUES ===================== */}
      <div className={modo === "cliques" ? "flex-1 flex flex-col lg:flex-row gap-4 p-4" : "hidden"}>
        {/* Coluna esquerda: exame + alterações */}
        <section className="lg:w-2/5 flex flex-col gap-4">
          <div className="bg-[var(--c-slate-800)] rounded-lg border border-[var(--c-slate-700)] px-3 py-2 flex items-center gap-2">
            <label htmlFor="exame-cliques" className="text-sm font-semibold">Exame</label>
            <select
              id="exame-cliques"
              value={cliquesExameId}
              onChange={(e) => trocarExameCliques(e.target.value)}
              className="flex-1 bg-[var(--c-slate-700)] text-[var(--c-slate-100)] text-sm rounded-md px-2 py-2 outline-none"
            >
              {EXAMES_CLIQUES.map((id) => (
                <option key={id} value={id}>{nomeExameCliques(id)}</option>
              ))}
            </select>
          </div>
          {cliquesExameId === "tireoide" ? (
            <div className="flex-1 overflow-y-auto min-h-48">
              <TireoideBuilder mascaraTexto={lerMascaraAtiva("tireoide")} aoAtualizar={aoAtualizarBuilder} />
            </div>
          ) : cliquesExameId === "mama" ? (
            <div className="flex-1 overflow-y-auto min-h-48">
              <MamaBuilder aoAtualizar={aoAtualizarBuilder} />
            </div>
          ) : (
            <div className="flex-1 bg-[var(--c-slate-800)] rounded-lg border border-[var(--c-slate-700)] p-3 overflow-y-auto min-h-48">
              <div className="text-xs font-semibold text-[var(--c-slate-400)] uppercase tracking-wide mb-2">
                Alterações
              </div>
              {(alteracoesAtivas(cliquesExameId) || []).filter((g) => !(g.orgao === "Ovários" && cliquesExameId === "transvaginal")).length === 0 ? (
                <div className="text-sm text-[var(--c-slate-500)]">
                  Sem alterações cadastradas para este exame. Você pode editar o laudo diretamente no editor ao lado.
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Ovários/Rins por lado entram na posição que a máscara mostra
                      (Ovários depois de Endométrio; Rins depois de Baço), não
                      soltos no topo — âncora no grupo que aparece logo depois
                      na ordem real do laudo (ver reordenação em abdome_total.js). */}
                  {alteracoesAtivas(cliquesExameId).filter((g) => !(g.orgao === "Ovários" && cliquesExameId === "transvaginal")).map((grupo) => {
                    const colapsado = !!gruposColapsados[grupo.orgao];
                    const contagem = contarAtivosNoGrupo(grupo, cliquesChips);
                    return (
                    <div key={grupo.orgao}>
                      {(cliquesExameId === "abdome_total" || cliquesExameId === "vias_urinarias") && grupo.orgao === "Rins" && (
                        <div className="mb-3"><RinsPanel aoMudar={aoMudarRins} /></div>
                      )}
                      {cliquesExameId === "transvaginal" && grupo.orgao === "Ovários - Lesões e Massas (O-RADS)" && (
                        <div className="mb-3"><OvariosPanel aoMudar={aoMudarOvarios} /></div>
                      )}
                      <button
                        onClick={() => alternarGrupoColapsado(grupo.orgao)}
                        className="w-full flex items-center gap-1.5 text-xs font-semibold text-[var(--c-slate-400)] mb-1 hover:text-[var(--c-slate-200)]"
                      >
                        <span className="inline-block w-3 text-[10px]">{colapsado ? "▸" : "▾"}</span>
                        <span>{grupo.orgao}</span>
                        {contagem > 0 && (
                          <span className="px-1.5 rounded-full bg-[var(--c-accent-900-60)] border border-[var(--c-accent-700)] text-[var(--c-accent-300)] text-[10px] font-normal">
                            {contagem}
                          </span>
                        )}
                      </button>
                      {!colapsado && (
                      <div className="flex flex-wrap gap-1.5">
                        {grupo.itens.map((item) => {
                          const chave = chaveAlteracao(grupo.orgao, item.rotulo);
                          const selecionado = cliquesChips.some(
                            (a) => chaveAlteracao(a.orgao, a.rotulo) === chave
                          );
                          return (
                            <div key={item.rotulo} className="flex flex-col items-start">
                              <button
                                onClick={() => toggleChipCliques(grupo.orgao, item)}
                                className={
                                  "px-2.5 py-1 rounded-full text-xs border transition " +
                                  (selecionado
                                    ? "bg-[var(--c-accent-500)] border-[var(--c-accent-400)] text-[var(--c-on-accent)] font-semibold"
                                    : "bg-[var(--c-slate-700)] border-[var(--c-slate-600)] text-[var(--c-slate-200)] hover:bg-[var(--c-slate-600)]")
                                }
                              >
                                {selecionado ? "✓ " : ""}{item.rotulo}
                              </button>
                              {item._customId && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); excluirAlteracaoCustom(item._customId); }}
                                  title="Excluir esta alteração customizada"
                                  className="text-[10px] text-[var(--c-slate-500)] hover:text-[var(--c-red-400)] mt-0.5"
                                >
                                  excluir
                                </button>
                              )}
                              {selecionado && itemElegivelParaMedida(item) && (
                                <CamposMedidaChip
                                  item={item}
                                  valores={medidasPorChip[chave] || []}
                                  aoMudar={(i, v) => alterarMedidaChip(grupo.orgao, item.rotulo, i, v)}
                                />
                              )}
                              {selecionado && itemTemCampoSegmento(item) && (
                                <CampoSegmentoChip
                                  item={item}
                                  valor={segmentosPorChip[chave]}
                                  aoMudar={(v) => alterarSegmentoChip(grupo.orgao, item.rotulo, v)}
                                />
                              )}
                              {selecionado && itemTemCampoLado(item) && (
                                <CampoLadoChip
                                  item={item}
                                  valor={ladosPorChip[chave]}
                                  aoMudar={(v) => alterarLadoChip(grupo.orgao, item.rotulo, v)}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
              <NovaAlteracaoForm
                mascaraId={cliquesExameId}
                gruposExistentes={(ALTERACOES[cliquesExameId] || []).map((g) => g.orgao)}
                aoSalvar={salvarNovaAlteracaoCustom}
              />
            </div>
          )}
        </section>

        {/* Coluna direita: editor do laudo */}
        <section className="lg:w-3/5 flex flex-col bg-[var(--c-slate-800)] rounded-lg border border-[var(--c-slate-700)] overflow-hidden">
          <div className="px-3 py-2 border-b border-[var(--c-slate-700)] flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-semibold flex-1">Laudo</h2>
            {cliquesEdicaoManual && (
              <>
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-[var(--c-amber-900-60)] border border-[var(--c-amber-600)] text-[var(--c-amber-300)]">
                  Edição manual ativa
                </span>
                <button
                  onClick={remontarCliques}
                  className="px-3 py-2 rounded-md text-sm bg-[var(--c-slate-700)] hover:bg-[var(--c-slate-600)]"
                >
                  Remontar
                </button>
              </>
            )}
            <button
              onClick={() => copiarEditor(cliquesEditorRef)}
              className="px-3 py-2 rounded-md text-sm bg-[var(--c-slate-700)] hover:bg-[var(--c-slate-600)]"
            >
              Copiar
            </button>
          </div>
          <BarraFormatacao
            aoFormatar={(c) => formatarEditor(cliquesEditorRef, c)}
            aoAumentar={() => setCliquesFontSize((f) => Math.min(f + 2, 28))}
            aoDiminuir={() => setCliquesFontSize((f) => Math.max(f - 2, 10))}
          />
          <div
            ref={cliquesEditorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={() => marcarEdicaoManual(true)}
            style={{ fontSize: cliquesFontSize + "px" }}
            className="flex-1 min-h-64 bg-white text-slate-900 p-4 leading-relaxed outline-none whitespace-pre-wrap overflow-auto"
          />
        </section>
      </div>

      {/* ===================== MODO DITADO + IA ===================== */}
      <div className={modo === "ia" ? "flex-1 flex flex-col lg:flex-row gap-4 p-4" : "hidden"}>
        {/* Painel de entrada */}
        <section className="flex-1 flex flex-col bg-[var(--c-slate-800)] rounded-lg border border-[var(--c-slate-700)] overflow-hidden">
          <div className="flex border-b border-[var(--c-slate-700)]">
            <button
              onClick={() => setAbaEntrada("ditado")}
              className={
                "flex-1 px-3 py-2 text-sm font-semibold transition " +
                (abaEntrada === "ditado"
                  ? "bg-[var(--c-slate-800)] text-[var(--c-accent-400)]"
                  : "bg-[var(--c-slate-900-40)] text-[var(--c-slate-400)] hover:text-[var(--c-slate-200)]")
              }
            >
              Ditado
            </button>
            <button
              onClick={() => setAbaEntrada("mascara")}
              className={
                "flex-1 px-3 py-2 text-sm font-semibold transition " +
                (abaEntrada === "mascara"
                  ? "bg-[var(--c-slate-800)] text-[var(--c-accent-400)]"
                  : "bg-[var(--c-slate-900-40)] text-[var(--c-slate-400)] hover:text-[var(--c-slate-200)]")
              }
            >
              Máscara
            </button>
          </div>

          {abaEntrada === "ditado" && (
            <>
              <div className="px-3 py-2 border-b border-[var(--c-slate-700)] flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-semibold flex-1">Transcrição do ditado</h2>
                <button
                  onClick={toggleMic}
                  disabled={busy || gravandoWhisper || transcrevendoWhisper}
                  className={
                    "px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 disabled:opacity-50 " +
                    (listening
                      ? "bg-[var(--c-red-600)] text-white"
                      : "bg-[var(--c-slate-700)] hover:bg-[var(--c-slate-600)] text-[var(--c-slate-100)]")
                  }
                >
                  {listening && (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--c-red-300)] opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--c-red-100)]" />
                    </span>
                  )}
                  {listening ? "Gravando… (parar)" : "Ditar"}
                </button>
                <button
                  onClick={toggleGravacaoWhisper}
                  disabled={busy || listening || transcrevendoWhisper}
                  title="Grava o áudio inteiro e transcreve via Whisper (mais lento, geralmente mais preciso)"
                  className={
                    "px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 disabled:opacity-50 " +
                    (gravandoWhisper
                      ? "bg-[var(--c-red-600)] text-white"
                      : "bg-[var(--c-slate-700)] hover:bg-[var(--c-slate-600)] text-[var(--c-slate-100)]")
                  }
                >
                  {gravandoWhisper && (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--c-red-300)] opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--c-red-100)]" />
                    </span>
                  )}
                  {gravandoWhisper ? "Gravando… (parar)" : transcrevendoWhisper ? "Transcrevendo…" : "Gravar (Whisper)"}
                </button>
                <button
                  onClick={() => { setTranscript(""); setInterim(""); setAlteracoesSelecionadas([]); }}
                  disabled={busy}
                  className="px-3 py-2 rounded-md text-sm bg-[var(--c-slate-700)] hover:bg-[var(--c-slate-600)] text-[var(--c-red-300)] disabled:opacity-50"
                >
                  Limpar
                </button>
              </div>
              {transcrevendoWhisper && (
                <div className="px-3 py-1 text-[var(--c-accent-400)] text-sm border-b border-[var(--c-slate-700)]">
                  Transcrevendo áudio com Whisper…
                </div>
              )}
              <div className="flex-1 relative flex flex-col min-h-48">
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Toque em Ditar e fale os achados ou cole a transcrição aqui. Você pode editar livremente antes de gerar o laudo."
                  className="flex-1 bg-[var(--c-slate-800)] text-[var(--c-slate-100)] p-3 pb-9 text-sm leading-relaxed resize-none outline-none placeholder-[var(--c-slate-500)]"
                />
                {listening && interim && (
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 text-[var(--c-slate-400)] text-sm italic bg-[var(--c-slate-800-95)] border-t border-[var(--c-slate-700)] pointer-events-none">
                    {interim}
                  </div>
                )}
              </div>

              <div className="border-t border-[var(--c-slate-700)] flex flex-col max-h-56 overflow-y-auto">
                <div className="px-3 pt-2 text-xs font-semibold text-[var(--c-slate-400)] uppercase tracking-wide">
                  Alterações rápidas
                </div>
                {(alteracoesAtivas(mascaraId) || []).length === 0 ? (
                  <div className="px-3 pb-3 pt-1 text-sm text-[var(--c-slate-500)]">
                    Sem alterações cadastradas para este exame.
                  </div>
                ) : (
                  <div className="px-3 pb-2 pt-1 space-y-2">
                    {alteracoesAtivas(mascaraId).map((grupo) => {
                      const colapsado = !!gruposColapsados[grupo.orgao];
                      const contagem = contarAtivosNoGrupo(grupo, alteracoesSelecionadas);
                      return (
                      <div key={grupo.orgao}>
                        <button
                          onClick={() => alternarGrupoColapsado(grupo.orgao)}
                          className="w-full flex items-center gap-1.5 text-xs font-semibold text-[var(--c-slate-400)] mb-1 hover:text-[var(--c-slate-200)]"
                        >
                          <span className="inline-block w-3 text-[10px]">{colapsado ? "▸" : "▾"}</span>
                          <span>{grupo.orgao}</span>
                          {contagem > 0 && (
                            <span className="px-1.5 rounded-full bg-[var(--c-accent-900-60)] border border-[var(--c-accent-700)] text-[var(--c-accent-300)] text-[10px] font-normal">
                              {contagem}
                            </span>
                          )}
                        </button>
                        {!colapsado && (
                        <div className="flex flex-wrap gap-1.5">
                          {grupo.itens.map((item) => {
                            const chave = chaveAlteracao(grupo.orgao, item.rotulo);
                            const selecionado = alteracoesSelecionadas.some(
                              (a) => chaveAlteracao(a.orgao, a.rotulo) === chave
                            );
                            return (
                              <div key={item.rotulo} className="flex flex-col items-start">
                                <button
                                  onClick={() => toggleAlteracao(grupo.orgao, item)}
                                  className={
                                    "px-2.5 py-1 rounded-full text-xs border transition " +
                                    (selecionado
                                      ? "bg-[var(--c-accent-500)] border-[var(--c-accent-400)] text-[var(--c-on-accent)] font-semibold"
                                      : "bg-[var(--c-slate-700)] border-[var(--c-slate-600)] text-[var(--c-slate-200)] hover:bg-[var(--c-slate-600)]")
                                  }
                                >
                                  {item.rotulo}
                                </button>
                                {item._customId && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); excluirAlteracaoCustom(item._customId); }}
                                    title="Excluir esta alteração customizada"
                                    className="text-[10px] text-[var(--c-slate-500)] hover:text-[var(--c-red-400)] mt-0.5"
                                  >
                                    excluir
                                  </button>
                                )}
                                {selecionado && itemElegivelParaMedida(item) && (
                                  <CamposMedidaChip
                                    item={item}
                                    valores={medidasPorAlteracao[chave] || []}
                                    aoMudar={(i, v) => alterarMedidaAlteracao(grupo.orgao, item.rotulo, i, v)}
                                  />
                                )}
                                {selecionado && itemTemCampoSegmento(item) && (
                                  <CampoSegmentoChip
                                    item={item}
                                    valor={segmentosPorAlteracao[chave]}
                                    aoMudar={(v) => alterarSegmentoAlteracao(grupo.orgao, item.rotulo, v)}
                                  />
                                )}
                                {selecionado && itemTemCampoLado(item) && (
                                  <CampoLadoChip
                                    item={item}
                                    valor={ladosPorAlteracao[chave]}
                                    aoMudar={(v) => alterarLadoAlteracao(grupo.orgao, item.rotulo, v)}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                        )}
                      </div>
                      );
                    })}
                  </div>
                )}
                <div className="px-3 pb-1">
                  <NovaAlteracaoForm
                    mascaraId={mascaraId}
                    gruposExistentes={(ALTERACOES[mascaraId] || []).map((g) => g.orgao)}
                    aoSalvar={salvarNovaAlteracaoCustom}
                  />
                </div>
                {alteracoesSelecionadas.length > 0 && (
                  <div className="px-3 pb-3 pt-2 border-t border-[var(--c-slate-700)]">
                    <div className="text-xs font-semibold text-[var(--c-slate-400)] mb-1">Selecionadas:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {alteracoesSelecionadas.map((a) => (
                        <span
                          key={chaveAlteracao(a.orgao, a.rotulo)}
                          className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full text-xs bg-[var(--c-accent-950)] border border-[var(--c-accent-700)] text-[var(--c-accent-200)]"
                        >
                          {a.rotulo}
                          <button
                            onClick={() => removerAlteracao(a.orgao, a.rotulo)}
                            aria-label={`Remover ${a.rotulo}`}
                            className="w-4 h-4 flex items-center justify-center rounded-full text-[var(--c-accent-300)] hover:text-white hover:bg-[var(--c-accent-800)] leading-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {abaEntrada === "mascara" && (
            <>
              <div className="px-3 py-2 border-b border-[var(--c-slate-700)] flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-semibold flex-1">Máscara do exame</h2>
                <select
                  value={mascaraId}
                  onChange={(e) => selecionarMascara(e.target.value)}
                  className="bg-[var(--c-slate-700)] text-[var(--c-slate-100)] text-sm rounded-md px-2 py-2 outline-none"
                >
                  {[...IDS_MASCARAS, ...idsMascarasCustom].map((id) => (
                    <option key={id} value={id}>{nomeExameCliques(id)}</option>
                  ))}
                </select>
                {MASCARAS[mascaraId] ? (
                  <button
                    onClick={restaurarMascaraPadrao}
                    className="px-3 py-2 rounded-md text-sm bg-[var(--c-slate-700)] hover:bg-[var(--c-slate-600)]"
                  >
                    Restaurar padrão
                  </button>
                ) : (
                  <button
                    onClick={excluirExameAtual}
                    className="px-3 py-2 rounded-md text-sm bg-[var(--c-slate-700)] hover:bg-[var(--c-red-900)] text-[var(--c-red-300)]"
                  >
                    Excluir exame
                  </button>
                )}
                <button
                  onClick={() => setCriandoExame((v) => !v)}
                  className="px-3 py-2 rounded-md text-sm bg-[var(--c-slate-700)] hover:bg-[var(--c-slate-600)]"
                >
                  + Novo exame
                </button>
              </div>
              {criandoExame && (
                <div className="px-3 py-2 border-b border-[var(--c-slate-700)] flex items-center gap-2">
                  <input
                    autoFocus
                    placeholder="Nome do exame novo (ex.: USG Partes Moles)"
                    value={nomeNovoExame}
                    onChange={(e) => setNomeNovoExame(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && criarNovoExame()}
                    className="flex-1 bg-[var(--c-slate-900)] border border-[var(--c-slate-600)] rounded px-2 py-1.5 text-sm text-[var(--c-slate-100)] outline-none focus:border-[var(--c-accent-400)]"
                  />
                  <button
                    onClick={criarNovoExame}
                    className="px-3 py-1.5 rounded-md text-sm bg-[var(--c-accent-600)] hover:bg-[var(--c-accent-500)] text-white"
                  >
                    Criar
                  </button>
                </div>
              )}
              <textarea
                value={mascaraTexto}
                onChange={(e) => editarMascaraTexto(e.target.value)}
                placeholder={MASCARAS[mascaraId] ? "" : "Escreva ou cole aqui o laudo normal completo deste exame."}
                className="flex-1 min-h-48 bg-[var(--c-slate-800)] text-[var(--c-slate-100)] p-3 text-sm leading-relaxed resize-none outline-none font-mono"
              />
            </>
          )}
        </section>

        {/* Painel do laudo */}
        <section className="flex-1 flex flex-col bg-[var(--c-slate-800)] rounded-lg border border-[var(--c-slate-700)] overflow-hidden">
          <div className="px-3 py-2 border-b border-[var(--c-slate-700)] flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-semibold flex-1">Laudo estruturado</h2>
            <button
              onClick={gerarLaudo}
              disabled={busy || (!transcript.trim() && alteracoesSelecionadas.length === 0)}
              className="px-4 py-2 rounded-md text-sm font-semibold bg-[var(--c-accent-500)] hover:bg-[var(--c-accent-400)] text-[var(--c-on-accent)] disabled:opacity-50"
            >
              {busy && busyMsg.startsWith("Gerando") ? "Gerando…" : "Gerar laudo"}
            </button>
            <button
              onClick={() => copiarEditor(laudoEditorRef)}
              disabled={busy}
              className="px-3 py-2 rounded-md text-sm bg-[var(--c-slate-700)] hover:bg-[var(--c-slate-600)] disabled:opacity-50"
            >
              Copiar
            </button>
          </div>
          <BarraFormatacao
            aoFormatar={(c) => formatarEditor(laudoEditorRef, c)}
            aoAumentar={() => setLaudoFontSize((f) => Math.min(f + 2, 28))}
            aoDiminuir={() => setLaudoFontSize((f) => Math.max(f - 2, 10))}
          />
          {busy && (
            <div className="px-3 py-1 text-[var(--c-accent-400)] text-sm border-b border-[var(--c-slate-700)]">{busyMsg}</div>
          )}
          <div
            ref={laudoEditorRef}
            contentEditable
            suppressContentEditableWarning
            data-placeholder="O laudo gerado pela IA aparece aqui, em texto puro, no padrão TÍTULO → ANÁLISE: → IMPRESSÃO:. Revise sempre antes de assinar."
            style={{ fontSize: laudoFontSize + "px" }}
            className="flex-1 min-h-48 bg-white text-slate-900 p-4 leading-relaxed outline-none whitespace-pre-wrap overflow-auto empty:before:content-[attr(data-placeholder)] empty:before:text-[var(--c-slate-400)]"
          />
        </section>
      </div>

      <footer className="px-4 py-2 text-center text-[11px] text-[var(--c-slate-500)] border-t border-[var(--c-slate-700)] bg-[var(--c-slate-800)]">
        LaudoVoz IA v0.2 · O laudo gerado é um rascunho: revisão e responsabilidade final são do médico. Ditado pelo navegador requer Chrome/Edge com internet.
      </footer>

      {toast && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 bg-[var(--c-slate-950)] border border-[var(--c-slate-600)] text-[var(--c-slate-100)] text-sm px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
