import { useState, useRef, useEffect, useCallback } from "react";
import { MASCARAS } from "./mascaras";
import { ALTERACOES } from "./alteracoes/index.js";
import { montarLaudo } from "./montarLaudo";
import TireoideBuilder from "./TireoideBuilder.jsx";
import MamaBuilder from "./MamaBuilder.jsx";

const IDS_MASCARAS = Object.keys(MASCARAS);
const MASCARA_ID_PADRAO = IDS_MASCARAS[0];

// Exames cujas alterações estão disponíveis no modo "Montar por cliques"
const EXAMES_CLIQUES = Array.from(
  new Set([...IDS_MASCARAS, "mama", "transvaginal", "prostata"])
);

const ehExameBuilder = (id) => id === "tireoide" || id === "mama";

const nomeExameCliques = (id) => {
  if (id === "mama") return "Mama (nódulos)";
  if (id === "transvaginal") return "Transvaginal";
  if (id === "prostata") return "Próstata (Via Abdominal)";
  return MASCARAS[id]?.nome || id;
};

const chaveStorageMascara = (id) => `laudovoz_mascara_${id}`;
const chaveAlteracao = (orgao, rotulo) => `${orgao}::${rotulo}`;

const lerMascaraAtiva = (id) => {
  try {
    return localStorage.getItem(chaveStorageMascara(id)) || MASCARAS[id]?.texto || "";
  } catch (e) {
    return MASCARAS[id]?.texto || "";
  }
};

const REGRAS_LAUDOVOZ = `Você é o motor de laudos do LaudoVoz, sistema do Dr. Ryan Maia (radiologista). Sua tarefa: receber a transcrição de um ditado de ultrassom e devolver o laudo completo estruturado.

REGRAS OBRIGATÓRIAS:
1. Responda APENAS com o texto do laudo. Sem comentários, sem preâmbulo, sem markdown, sem asteriscos, sem travessão (—). Texto puro em português brasileiro.
2. Estrutura: TÍTULO DO EXAME EM MAIÚSCULAS na primeira linha, depois linha em branco, depois ANÁLISE: com os parágrafos descritivos, depois IMPRESSÃO: com os achados.
3. Silêncio = normal: órgãos da modalidade não citados no ditado saem com descrição normal padrão de serviço grande brasileiro.
4. Medidas em cm com vírgula decimal (ex: 1,2 x 0,8 cm). Vias biliares, veia porta e espessura endometrial em mm.
5. Parágrafo renal sempre inclui "Ausência de sinais de hidronefrose ou macrolitíase." após a descrição e antes das medidas.
6. Cistos renais sem classificação Bosniak (Bosniak é reservada para TC).
7. Segmentos hepáticos em algarismos romanos (I a VIII). Na IMPRESSÃO, indicar apenas o LOBO CORRESPONDENTE (Lobo Direito / Lobo Esquerdo).
8. IMPRESSÃO: sem medidas e sem localizações anatômicas específicas/terços/polos, apenas descritores qualitativos. Cada achado em linha própria.
9. Nunca invente achados, medidas ou diagnósticos não ditados. Valor incerto ou inaudível na transcrição: marcar [revisar] no local.`;

function BarraFormatacao({ aoFormatar, aoAumentar, aoDiminuir }) {
  return (
    <div className="px-3 py-1.5 border-b border-slate-700 flex items-center gap-1 bg-slate-800/60">
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => aoFormatar("bold")}
        title="Negrito"
        className="w-7 h-7 rounded text-sm font-bold bg-slate-700 hover:bg-slate-600 text-slate-100"
      >
        B
      </button>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => aoFormatar("italic")}
        title="Itálico"
        className="w-7 h-7 rounded text-sm italic bg-slate-700 hover:bg-slate-600 text-slate-100"
      >
        I
      </button>
      <span className="w-px h-4 bg-slate-600 mx-1" />
      <button
        onClick={aoAumentar}
        title="Aumentar fonte"
        className="px-2 h-7 rounded text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-100"
      >
        A+
      </button>
      <button
        onClick={aoDiminuir}
        title="Diminuir fonte"
        className="px-2 h-7 rounded text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-100"
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

  // ---- Estado do modo "Montar por cliques" ----
  const [cliquesExameId, setCliquesExameId] = useState(MASCARA_ID_PADRAO);
  const [cliquesChips, setCliquesChips] = useState([]);
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
  const [alteracoesSelecionadas, setAlteracoesSelecionadas] = useState([]);
  const [mascaraId, setMascaraId] = useState(MASCARA_ID_PADRAO);
  const [mascaraTexto, setMascaraTexto] = useState(() => lerMascaraAtiva(MASCARA_ID_PADRAO));
  const [laudoFontSize, setLaudoFontSize] = useState(14);
  const recRef = useRef(null);
  const listeningRef = useRef(false);
  const laudoEditorRef = useRef(null);

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

  useEffect(() => {
    atualizarEditorCliques(MASCARA_ID_PADRAO, []);
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
        showToast("Não foi possível copiar automaticamente.");
      }
    }
  };

  // ---- Modo "Montar por cliques" ----

  const marcarEdicaoManual = (v) => {
    edicaoManualRef.current = v;
    setCliquesEdicaoManual(v);
  };

  const atualizarEditorCliques = (exameId, chips) => {
    if (cliquesEditorRef.current) {
      cliquesEditorRef.current.textContent = montarLaudo(lerMascaraAtiva(exameId), chips);
    }
  };

  const aoAtualizarBuilder = useCallback((texto) => {
    builderTextoRef.current = texto;
    if (!edicaoManualRef.current && cliquesEditorRef.current) {
      cliquesEditorRef.current.textContent = texto;
    }
  }, []);

  const toggleChipCliques = (orgao, item) => {
    const chave = chaveAlteracao(orgao, item.rotulo);
    const jaTem = cliquesChips.some((a) => chaveAlteracao(a.orgao, a.rotulo) === chave);

    let parametros = {};
    if (!jaTem && item.requerInput && item.campos) {
      // Coleta rápida dos parâmetros caso o card solicite entradas numéricas/anatômicas
      if (item.campos.includes("lado")) {
        parametros.lado = window.prompt("Lado (Direito / Esquerdo / Bilateral):", "Direito") || "Direito";
      }
      if (item.campos.includes("segmento")) {
        parametros.segmento = window.prompt("Segmento Hepático (1 a 8 ou IVa/IVb):", "VI") || "VI";
      }
      if (item.campos.includes("terço")) {
        parametros.terço = window.prompt("Terço / Polo (terço inferior, médio, superior):", "terço inferior") || "terço inferior";
      }
      if (item.campos.includes("grau")) {
        parametros.grau = window.prompt("Grau de Dilatação (Leve, Leve a moderada, Moderada, Acentuada):", "Leve") || "Leve";
      }
      if (item.campos.includes("medidaX")) {
        parametros.medidaX = window.prompt("Medida (cm ou mm):", "1,5") || "";
      }
      if (item.campos.includes("medidaY")) {
        parametros.medidaY = window.prompt("Segunda Medida (opcional em cm):", "") || "";
      }
      if (item.campos.includes("volumeRPM")) {
        parametros.volumeRPM = window.prompt("Volume do Resíduo Pós-Miccional (ml):", "50") || "50";
      }
      if (item.campos.includes("ippMedida")) {
        parametros.ippMedida = window.prompt("Medida da Projeção Intravesical - IPP (mm):", "6") || "6";
      }
    }

    const novos = jaTem
      ? cliquesChips.filter((a) => chaveAlteracao(a.orgao, a.rotulo) !== chave)
      : [...cliquesChips, { orgao, ...item, parametros }];

    setCliquesChips(novos);
    if (!cliquesEdicaoManual) atualizarEditorCliques(cliquesExameId, novos);
  };

  const trocarExameCliques = (id) => {
    if (
      cliquesEdicaoManual &&
      !window.confirm("Trocar de exame descarta as edições manuais do laudo. Continuar?")
    ) return;
    setCliquesExameId(id);
    setCliquesChips([]);
    marcarEdicaoManual(false);
    builderTextoRef.current = "";
    if (!ehExameBuilder(id)) atualizarEditorCliques(id, []);
  };

  const remontarCliques = () => {
    if (!window.confirm("Remontar reaplica a máscara do zero. As edições manuais serão perdidas. Continuar?")) return;
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

  const selecionarMascara = (id) => {
    setMascaraId(id);
    setMascaraTexto(lerMascaraAtiva(id));
    setAlteracoesSelecionadas([]);
  };

  const editarMascaraTexto = (texto) => {
    setMascaraTexto(texto);
    try { localStorage.setItem(chaveStorageMascara(mascaraId), texto); } catch (e) {}
  };

  const restaurarMascaraPadrao = () => {
    const original = MASCARAS[mascaraId]?.texto || "";
    setMascaraTexto(original);
    try { localStorage.removeItem(chaveStorageMascara(mascaraId)); } catch (e) {}
    showToast("Máscara restaurada ao padrão.");
  };

  const toggleAlteracao = (orgao, item) => {
    const chave = chaveAlteracao(orgao, item.rotulo);
    setAlteracoesSelecionadas((prev) =>
      prev.some((a) => chaveAlteracao(a.orgao, a.rotulo) === chave)
        ? prev.filter((a) => chaveAlteracao(a.orgao, a.rotulo) !== chave)
        : [...prev, { orgao, ...item }]
    );
  };

  const removerAlteracao = (orgao, rotulo) => {
    const chave = chaveAlteracao(orgao, rotulo);
    setAlteracoesSelecionadas((prev) => prev.filter((a) => chaveAlteracao(a.orgao, a.rotulo) !== chave));
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
      const blocoAlteracoes = alteracoesSelecionadas.length
        ? "\n\nALTERAÇÕES SELECIONADAS:\n" +
          alteracoesSelecionadas
            .map((a, i) => `${i + 1}. ${a.rotulo}\n   Descrição: ${a.descricao}\n   Impressão: ${a.impressao}`)
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
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          messages: [{ role: "user", content: conteudo }],
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || "Erro da API");
      const texto = extractText(data);
      if (!texto) throw new Error("A IA não retornou texto.");
      if (laudoEditorRef.current) laudoEditorRef.current.textContent = texto;
      showToast("Laudo gerado. Revise antes de usar.");
    } catch (e) {
      setErro("Falha ao gerar o laudo: " + e.message);
    } finally {
      setBusy(false);
      setBusyMsg("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col font-sans">
      <header className="px-4 py-3 border-b border-slate-700 bg-slate-800 flex items-center gap-3 flex-wrap">
        <h1 className="text-base font-semibold tracking-wide">LaudoVoz IA</h1>
        <span className="text-xs text-slate-400">protótipo v0.2 · montar por cliques ou ditado + IA</span>
      </header>

      <div className="flex border-b border-slate-700 bg-slate-800">
        <button
          onClick={() => setModo("cliques")}
          className={
            "px-6 py-3 text-sm font-bold transition border-b-2 " +
            (modo === "cliques"
              ? "text-sky-400 border-sky-400"
              : "text-slate-400 border-transparent hover:text-slate-200")
          }
        >
          Montar por cliques
        </button>
        <button
          onClick={() => setModo("ia")}
          className={
            "px-6 py-3 text-sm font-bold transition border-b-2 " +
            (modo === "ia"
              ? "text-sky-400 border-sky-400"
              : "text-slate-400 border-transparent hover:text-slate-200")
          }
        >
          Ditado + IA
        </button>
      </div>

      {erro && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-md border border-red-500 text-red-300 text-sm">
          {erro}
        </div>
      )}

      {/* MODO MONTAR POR CLIQUES */}
      <div className={modo === "cliques" ? "flex-1 flex flex-col lg:flex-row gap-4 p-4" : "hidden"}>
        <section className="lg:w-2/5 flex flex-col gap-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 px-3 py-2 flex items-center gap-2">
            <label htmlFor="exame-cliques" className="text-sm font-semibold">Exame</label>
            <select
              id="exame-cliques"
              value={cliquesExameId}
              onChange={(e) => trocarExameCliques(e.target.value)}
              className="flex-1 bg-slate-700 text-slate-100 text-sm rounded-md px-2 py-2 outline-none"
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
            <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 p-3 overflow-y-auto min-h-48">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Alterações
              </div>
              {(ALTERACOES[cliquesExameId] || []).length === 0 ? (
                <div className="text-sm text-slate-500">
                  Sem alterações cadastradas para este exame.
                </div>
              ) : (
                <div className="space-y-3">
                  {ALTERACOES[cliquesExameId].map((grupo) => (
                    <div key={grupo.orgao}>
                      <div className="text-xs font-semibold text-slate-400 mb-1">{grupo.orgao}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {grupo.itens.map((item) => {
                          const selecionado = cliquesChips.some(
                            (a) => chaveAlteracao(a.orgao, a.rotulo) === chaveAlteracao(grupo.orgao, item.rotulo)
                          );
                          return (
                            <button
                              key={item.rotulo}
                              onClick={() => toggleChipCliques(grupo.orgao, item)}
                              className={
                                "px-2.5 py-1 rounded-full text-xs border transition " +
                                (selecionado
                                  ? "bg-sky-500 border-sky-400 text-slate-900 font-semibold"
                                  : "bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600")
                              }
                            >
                              {selecionado ? "✓ " : ""}{item.rotulo}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        <section className="lg:w-3/5 flex flex-col bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-700 flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-semibold flex-1">Laudo</h2>
            {cliquesEdicaoManual && (
              <>
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-amber-900/60 border border-amber-600 text-amber-300">
                  Edição manual ativa
                </span>
                <button
                  onClick={remontarCliques}
                  className="px-3 py-2 rounded-md text-sm bg-slate-700 hover:bg-slate-600"
                >
                  Remontar
                </button>
              </>
            )}
            <button
              onClick={() => copiarEditor(cliquesEditorRef)}
              className="px-3 py-2 rounded-md text-sm bg-slate-700 hover:bg-slate-600"
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

      {/* MODO DITADO + IA */}
      <div className={modo === "ia" ? "flex-1 flex flex-col lg:flex-row gap-4 p-4" : "hidden"}>
        <section className="flex-1 flex flex-col bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setAbaEntrada("ditado")}
              className={
                "flex-1 px-3 py-2 text-sm font-semibold transition " +
                (abaEntrada === "ditado"
                  ? "bg-slate-800 text-sky-400"
                  : "bg-slate-900/40 text-slate-400 hover:text-slate-200")
              }
            >
              Ditado
            </button>
            <button
              onClick={() => setAbaEntrada("mascara")}
              className={
                "flex-1 px-3 py-2 text-sm font-semibold transition " +
                (abaEntrada === "mascara"
                  ? "bg-slate-800 text-sky-400"
                  : "bg-slate-900/40 text-slate-400 hover:text-slate-200")
              }
            >
              Máscara
            </button>
          </div>

          {abaEntrada === "ditado" && (
            <>
              <div className="px-3 py-2 border-b border-slate-700 flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-semibold flex-1">Transcrição do ditado</h2>
                <button
                  onClick={toggleMic}
                  disabled={busy}
                  className={
                    "px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 " +
                    (listening
                      ? "bg-red-600 text-white"
                      : "bg-slate-700 hover:bg-slate-600 text-slate-100")
                  }
                >
                  {listening && (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-100" />
                    </span>
                  )}
                  {listening ? "Gravando… (parar)" : "Ditar"}
                </button>
                <button
                  onClick={() => { setTranscript(""); setInterim(""); setAlteracoesSelecionadas([]); }}
                  disabled={busy}
                  className="px-3 py-2 rounded-md text-sm bg-slate-700 hover:bg-slate-600 text-red-300 disabled:opacity-50"
                >
                  Limpar
                </button>
              </div>
              <div className="flex-1 relative flex flex-col min-h-48">
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Toque em Ditar e fale os achados ou cole a transcrição aqui."
                  className="flex-1 bg-slate-800 text-slate-100 p-3 pb-9 text-sm leading-relaxed resize-none outline-none placeholder-slate-500"
                />
                {listening && interim && (
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 text-slate-400 text-sm italic bg-slate-800/95 border-t border-slate-700 pointer-events-none">
                    {interim}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-700 flex flex-col max-h-56 overflow-y-auto">
                <div className="px-3 pt-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Alterações rápidas
                </div>
                {(ALTERACOES[mascaraId] || []).length === 0 ? (
                  <div className="px-3 pb-3 pt-1 text-sm text-slate-500">
                    Sem alterações cadastradas para este exame.
                  </div>
                ) : (
                  <div className="px-3 pb-2 pt-1 space-y-2">
                    {ALTERACOES[mascaraId].map((grupo) => (
                      <div key={grupo.orgao}>
                        <div className="text-xs font-semibold text-slate-400 mb-1">{grupo.orgao}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {grupo.itens.map((item) => {
                            const selecionado = alteracoesSelecionadas.some(
                              (a) => chaveAlteracao(a.orgao, a.rotulo) === chaveAlteracao(grupo.orgao, item.rotulo)
                            );
                            return (
                              <button
                                key={item.rotulo}
                                onClick={() => toggleAlteracao(grupo.orgao, item)}
                                className={
                                  "px-2.5 py-1 rounded-full text-xs border transition " +
                                  (selecionado
                                    ? "bg-sky-500 border-sky-400 text-slate-900 font-semibold"
                                    : "bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600")
                                }
                              >
                                {item.rotulo}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {abaEntrada === "mascara" && (
            <>
              <div className="px-3 py-2 border-b border-slate-700 flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-semibold flex-1">Máscara do exame</h2>
                <select
                  value={mascaraId}
                  onChange={(e) => selecionarMascara(e.target.value)}
                  className="bg-slate-700 text-slate-100 text-sm rounded-md px-2 py-2 outline-none"
                >
                  {IDS_MASCARAS.map((id) => (
                    <option key={id} value={id}>{nomeExameCliques(id)}</option>
                  ))}
                </select>
                <button
                  onClick={restaurarMascaraPadrao}
                  className="px-3 py-2 rounded-md text-sm bg-slate-700 hover:bg-slate-600"
                >
                  Restaurar padrão
                </button>
              </div>
              <textarea
                value={mascaraTexto}
                onChange={(e) => editarMascaraTexto(e.target.value)}
                className="flex-1 min-h-48 bg-slate-800 text-slate-100 p-3 text-sm leading-relaxed resize-none outline-none font-mono"
              />
            </>
          )}
        </section>

        <section className="flex-1 flex flex-col bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-700 flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-semibold flex-1">Laudo estruturado</h2>
            <button
              onClick={gerarLaudo}
              disabled={busy || (!transcript.trim() && alteracoesSelecionadas.length === 0)}
              className="px-4 py-2 rounded-md text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-slate-900 disabled:opacity-50"
            >
              {busy && busyMsg.startsWith("Gerando") ? "Gerando…" : "Gerar laudo"}
            </button>
            <button
              onClick={() => copiarEditor(laudoEditorRef)}
              disabled={busy}
              className="px-3 py-2 rounded-md text-sm bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
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
            <div className="px-3 py-1 text-sky-400 text-sm border-b border-slate-700">{busyMsg}</div>
          )}
          <div
            ref={laudoEditorRef}
            contentEditable
            suppressContentEditableWarning
            data-placeholder="O laudo gerado pela IA aparece aqui em texto puro. Revise antes de usar."
            style={{ fontSize: laudoFontSize + "px" }}
            className="flex-1 min-h-48 bg-white text-slate-900 p-4 leading-relaxed outline-none whitespace-pre-wrap overflow-auto empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400"
          />
        </section>
      </div>

      <footer className="px-4 py-2 text-center text-[11px] text-slate-500 border-t border-slate-700 bg-slate-800">
        LaudoVoz IA v0.2 · O laudo gerado é um rascunho: revisão e responsabilidade final são do médico.
      </footer>

      {toast && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-600 text-slate-100 text-sm px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
