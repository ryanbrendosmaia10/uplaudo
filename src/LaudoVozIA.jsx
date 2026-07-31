import { useState, useRef, useEffect } from "react";
import { MASCARAS } from "./mascaras";
import { ALTERACOES } from "./alteracoes";

const IDS_MASCARAS = Object.keys(MASCARAS);
const MASCARA_ID_PADRAO = IDS_MASCARAS[0];

const chaveStorageMascara = (id) => `laudovoz_mascara_${id}`;
const chaveAlteracao = (orgao, rotulo) => `${orgao}::${rotulo}`;

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

export default function LaudoVozIA() {
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [busyMsg, setBusyMsg] = useState("");
  const [erro, setErro] = useState("");
  const [toast, setToast] = useState("");
  const [abaEntrada, setAbaEntrada] = useState("ditado");
  const [alteracoesSelecionadas, setAlteracoesSelecionadas] = useState([]);
  const [mascaraId, setMascaraId] = useState(MASCARA_ID_PADRAO);
  const [mascaraTexto, setMascaraTexto] = useState(() => {
    try {
      return localStorage.getItem(chaveStorageMascara(MASCARA_ID_PADRAO)) || MASCARAS[MASCARA_ID_PADRAO].texto;
    } catch (e) {
      return MASCARAS[MASCARA_ID_PADRAO].texto;
    }
  });
  const [laudoFontSize, setLaudoFontSize] = useState(14);
  const recRef = useRef(null);
  const listeningRef = useRef(false);
  const toastTimer = useRef(null);
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

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2400);
  };

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
    let salvo = null;
    try { salvo = localStorage.getItem(chaveStorageMascara(id)); } catch (e) {}
    setMascaraTexto(salvo || MASCARAS[id].texto);
    setAlteracoesSelecionadas([]);
  };

  const editarMascaraTexto = (texto) => {
    setMascaraTexto(texto);
    try { localStorage.setItem(chaveStorageMascara(mascaraId), texto); } catch (e) {}
  };

  const restaurarMascaraPadrao = () => {
    const original = MASCARAS[mascaraId].texto;
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
    setBusyMsg(`Gerando laudo (${MASCARAS[mascaraId].nome})…`);
    setErro("");
    try {
      const blocoAlteracoes = alteracoesSelecionadas.length
        ? "\n\nALTERAÇÕES SELECIONADAS:\n" +
          alteracoesSelecionadas
            .map((a) => `- ${a.rotulo}\n  descricao: ${a.descricao}\n  impressao: ${a.impressao}`)
            .join("\n")
        : "";
      const blocoTranscricao = transcript.trim()
        ? "\n\nTRANSCRIÇÃO DO DITADO:\n" + transcript
        : "";
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content:
                REGRAS_LAUDOVOZ +
                "\n\nMÁSCARA:\n" + mascaraTexto +
                blocoAlteracoes +
                blocoTranscricao,
            },
          ],
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

  const formatarLaudo = (comando) => {
    laudoEditorRef.current?.focus();
    document.execCommand(comando);
  };

  const copiarLaudo = async () => {
    const el = laudoEditorRef.current;
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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col font-sans">
      {/* Cabeçalho */}
      <header className="px-4 py-3 border-b border-slate-700 bg-slate-800 flex items-center gap-3 flex-wrap">
        <h1 className="text-base font-semibold tracking-wide">LaudoVoz IA</h1>
        <span className="text-xs text-slate-400">protótipo v0.1 · ditado → IA → laudo estruturado</span>
      </header>

      {erro && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-md border border-red-500 text-red-300 text-sm">
          {erro}
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4">
        {/* Painel de entrada */}
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
                  placeholder="Toque em Ditar e fale os achados ou cole a transcrição aqui. Você pode editar livremente antes de gerar o laudo."
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
                {alteracoesSelecionadas.length > 0 && (
                  <div className="px-3 pb-3 pt-2 border-t border-slate-700">
                    <div className="text-xs font-semibold text-slate-400 mb-1">Selecionadas:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {alteracoesSelecionadas.map((a) => (
                        <span
                          key={chaveAlteracao(a.orgao, a.rotulo)}
                          className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full text-xs bg-sky-950 border border-sky-700 text-sky-200"
                        >
                          {a.rotulo}
                          <button
                            onClick={() => removerAlteracao(a.orgao, a.rotulo)}
                            aria-label={`Remover ${a.rotulo}`}
                            className="w-4 h-4 flex items-center justify-center rounded-full text-sky-300 hover:text-white hover:bg-sky-800 leading-none"
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
              <div className="px-3 py-2 border-b border-slate-700 flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-semibold flex-1">Máscara do exame</h2>
                <select
                  value={mascaraId}
                  onChange={(e) => selecionarMascara(e.target.value)}
                  className="bg-slate-700 text-slate-100 text-sm rounded-md px-2 py-2 outline-none"
                >
                  {IDS_MASCARAS.map((id) => (
                    <option key={id} value={id}>{MASCARAS[id].nome}</option>
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

        {/* Painel do laudo */}
        <section className="flex-1 flex flex-col bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-700 flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-semibold flex-1">2. Laudo estruturado</h2>
            <button
              onClick={gerarLaudo}
              disabled={busy || (!transcript.trim() && alteracoesSelecionadas.length === 0)}
              className="px-4 py-2 rounded-md text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-slate-900 disabled:opacity-50"
            >
              {busy && busyMsg.startsWith("Gerando") ? "Gerando…" : "Gerar laudo"}
            </button>
            <button
              onClick={copiarLaudo}
              disabled={busy}
              className="px-3 py-2 rounded-md text-sm bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
            >
              Copiar
            </button>
          </div>
          <div className="px-3 py-1.5 border-b border-slate-700 flex items-center gap-1 bg-slate-800/60">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => formatarLaudo("bold")}
              title="Negrito"
              className="w-7 h-7 rounded text-sm font-bold bg-slate-700 hover:bg-slate-600 text-slate-100"
            >
              B
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => formatarLaudo("italic")}
              title="Itálico"
              className="w-7 h-7 rounded text-sm italic bg-slate-700 hover:bg-slate-600 text-slate-100"
            >
              I
            </button>
            <span className="w-px h-4 bg-slate-600 mx-1" />
            <button
              onClick={() => setLaudoFontSize((f) => Math.min(f + 2, 28))}
              title="Aumentar fonte"
              className="px-2 h-7 rounded text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-100"
            >
              A+
            </button>
            <button
              onClick={() => setLaudoFontSize((f) => Math.max(f - 2, 10))}
              title="Diminuir fonte"
              className="px-2 h-7 rounded text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-100"
            >
              A−
            </button>
          </div>
          {busy && (
            <div className="px-3 py-1 text-sky-400 text-sm border-b border-slate-700">{busyMsg}</div>
          )}
          <div
            ref={laudoEditorRef}
            contentEditable
            suppressContentEditableWarning
            data-placeholder="O laudo gerado pela IA aparece aqui, em texto puro, no padrão TÍTULO → ANÁLISE: → IMPRESSÃO:. Revise sempre antes de assinar."
            style={{ fontSize: laudoFontSize + "px" }}
            className="flex-1 min-h-48 bg-white text-slate-900 p-4 leading-relaxed outline-none whitespace-pre-wrap overflow-auto empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400"
          />
        </section>
      </div>

      <footer className="px-4 py-2 text-center text-[11px] text-slate-500 border-t border-slate-700 bg-slate-800">
        LaudoVoz IA v0.1 · O laudo gerado é um rascunho: revisão e responsabilidade final são do médico. Ditado pelo navegador requer Chrome/Edge com internet.
      </footer>

      {toast && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-600 text-slate-100 text-sm px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
