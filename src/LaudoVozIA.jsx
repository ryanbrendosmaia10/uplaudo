import { useState, useRef, useEffect } from "react";

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
12. Ignore conversas paralelas com o paciente ou equipe presentes na transcrição; aproveite apenas o conteúdo de achados do exame.`;

export default function LaudoVozIA() {
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [laudo, setLaudo] = useState("");
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [busyMsg, setBusyMsg] = useState("");
  const [erro, setErro] = useState("");
  const [toast, setToast] = useState("");
  const recRef = useRef(null);
  const listeningRef = useRef(false);
  const toastTimer = useRef(null);

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

  const gerarLaudo = async () => {
    if (!transcript.trim()) { showToast("A transcrição está vazia."); return; }
    setBusy(true);
    setBusyMsg("Gerando laudo com IA…");
    setErro("");
    try {
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: REGRAS_LAUDOVOZ + "\n\nTRANSCRIÇÃO DO DITADO:\n" + transcript,
            },
          ],
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || "Erro da API");
      const texto = extractText(data);
      if (!texto) throw new Error("A IA não retornou texto.");
      setLaudo(texto);
      showToast("Laudo gerado. Revise antes de usar.");
    } catch (e) {
      setErro("Falha ao gerar o laudo: " + e.message);
    } finally {
      setBusy(false);
      setBusyMsg("");
    }
  };

  const importarGranola = async () => {
    setBusy(true);
    setBusyMsg("Buscando última gravação no Granola…");
    setErro("");
    try {
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
                "Liste minhas reuniões mais recentes no Granola, pegue a MAIS RECENTE e obtenha a transcrição completa dela. Depois responda APENAS com o texto integral da transcrição, sem comentários e sem resumir.",
            },
          ],
          mcp_servers: [
            { type: "url", url: "https://mcp.granola.ai/mcp", name: "granola" },
          ],
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || "Erro da API");
      const textos = (data.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      const results = (data.content || [])
        .filter((b) => b.type === "mcp_tool_result")
        .map((b) => (b.content && b.content[0] && b.content[0].text) || "")
        .join("\n")
        .trim();
      const texto = textos || results;
      if (!texto) throw new Error("Nenhuma transcrição encontrada no Granola.");
      setTranscript(texto);
      showToast("Transcrição importada do Granola.");
    } catch (e) {
      setErro("Falha na importação do Granola: " + e.message);
    } finally {
      setBusy(false);
      setBusyMsg("");
    }
  };

  const copiarLaudo = async () => {
    if (!laudo.trim()) { showToast("O laudo está vazio."); return; }
    try {
      await navigator.clipboard.writeText(laudo);
      showToast("Laudo copiado.");
    } catch (e) {
      showToast("Não foi possível copiar automaticamente. Selecione e copie manualmente.");
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
        {/* Painel de transcrição */}
        <section className="flex-1 flex flex-col bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-700 flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-semibold flex-1">1. Transcrição do ditado</h2>
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
              onClick={importarGranola}
              disabled={busy}
              className="px-3 py-2 rounded-md text-sm bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
            >
              Importar do Granola
            </button>
            <button
              onClick={() => { setTranscript(""); setInterim(""); }}
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
              placeholder="Toque em Ditar e fale os achados, importe do Granola ou cole a transcrição aqui. Você pode editar livremente antes de gerar o laudo."
              className="flex-1 bg-slate-800 text-slate-100 p-3 pb-9 text-sm leading-relaxed resize-none outline-none placeholder-slate-500"
            />
            {listening && interim && (
              <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 text-slate-400 text-sm italic bg-slate-800/95 border-t border-slate-700 pointer-events-none">
                {interim}
              </div>
            )}
          </div>
        </section>

        {/* Painel do laudo */}
        <section className="flex-1 flex flex-col bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-700 flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-semibold flex-1">2. Laudo estruturado</h2>
            <button
              onClick={gerarLaudo}
              disabled={busy || !transcript.trim()}
              className="px-4 py-2 rounded-md text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-slate-900 disabled:opacity-50"
            >
              {busy && busyMsg.startsWith("Gerando") ? "Gerando…" : "Gerar laudo"}
            </button>
            <button
              onClick={copiarLaudo}
              disabled={busy || !laudo.trim()}
              className="px-3 py-2 rounded-md text-sm bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
            >
              Copiar
            </button>
          </div>
          {busy && (
            <div className="px-3 py-1 text-sky-400 text-sm border-b border-slate-700">{busyMsg}</div>
          )}
          <textarea
            value={laudo}
            onChange={(e) => setLaudo(e.target.value)}
            placeholder="O laudo gerado pela IA aparece aqui, em texto puro, no padrão TÍTULO → ANÁLISE: → IMPRESSÃO:. Revise sempre antes de assinar."
            className="flex-1 min-h-48 bg-white text-slate-900 p-4 text-sm leading-relaxed resize-none outline-none font-mono placeholder-slate-400"
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
