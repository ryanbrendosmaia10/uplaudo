import { useState, useEffect } from "react";
import {
  ESTADOS_OVARIO, OVARIO_VAZIO, estadoSuprimeMedidasELesoes,
  LOCULACAO, PAREDE_CONTEUDO, SUB_ESPESSAMENTO, LESAO_VAZIA,
} from "./ovarios.js";

// OvariosPanel — Bloco 7/8: ovário direito e esquerdo descritos
// separadamente, com lesões pelo léxico O-RADS, dentro do exame "Pélvica
// transvaginal" (que continua com o painel de chips normal para
// Útero/Endométrio ao lado). Só entrega {direito, esquerdo, orads} para o
// chamador (LaudoVozIA.jsx) via `aoMudar` — quem decide como isso vira
// texto é src/ovarios.js (aplicarOvarios).

const rotuloSelect = "text-xs font-semibold text-slate-400 mb-1";
const selectCls = "w-full bg-slate-700 text-slate-100 text-sm rounded-md px-2 py-1.5 outline-none";
const inputCls = "w-full bg-slate-700 text-slate-100 text-sm rounded-md px-2 py-1.5 outline-none placeholder-slate-500";

function SelectGrupo({ titulo, opcoes, valor, aoMudar, semVazio }) {
  return (
    <div>
      <div className={rotuloSelect}>{titulo}</div>
      <select value={valor ?? ""} onChange={(e) => aoMudar(e.target.value || null)} className={selectCls}>
        {!semVazio && <option value="">selecionar</option>}
        {opcoes.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function PainelLesao({ lesao, setCampo, remover, testId }) {
  return (
    <div className="border border-slate-600 rounded-md p-2 space-y-2 bg-slate-900/40" data-testid={testId}>
      <div className="flex items-center gap-2">
        <div className="text-xs font-semibold text-slate-300 flex-1">Lesão</div>
        <button onClick={remover} aria-label="Remover lesão" className="w-5 h-5 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-700 leading-none">×</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <SelectGrupo semVazio titulo="Loculação (A)" opcoes={LOCULACAO} valor={lesao.loculacao}
          aoMudar={(v) => setCampo("loculacao", v || "unilocular")} />
        <SelectGrupo titulo="Parede e conteúdo (B)"
          opcoes={PAREDE_CONTEUDO.filter((o) => o.id !== "simples" || lesao.loculacao === "unilocular")}
          valor={lesao.paredeConteudo} aoMudar={(v) => setCampo("paredeConteudo", v || "")} />
      </div>
      {lesao.paredeConteudo === "espessamento_irregular" && lesao.loculacao !== "unilocular" && (
        <SelectGrupo titulo="Espessamento irregular de" opcoes={SUB_ESPESSAMENTO} valor={lesao.subEspessamento}
          aoMudar={(v) => setCampo("subEspessamento", v || "")} />
      )}
      {lesao.paredeConteudo === "componente_solido" && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className={rotuloSelect}>Nº de projeções papilares (opcional)</div>
            <input value={lesao.numPapilas} onChange={(e) => setCampo("numPapilas", e.target.value)} placeholder="2" inputMode="numeric" className={inputCls} />
          </div>
          <div>
            <div className={rotuloSelect}>Maior papila (cm, opcional)</div>
            <input value={lesao.medidaPapila} onChange={(e) => setCampo("medidaPapila", e.target.value)} placeholder="0,4" inputMode="decimal" className={inputCls} />
          </div>
        </div>
      )}
      <div>
        <div className={rotuloSelect}>Medidas (cm, opcional)</div>
        <div className="grid grid-cols-3 gap-2">
          <input value={lesao.m1} onChange={(e) => setCampo("m1", e.target.value)} placeholder="3,0" inputMode="decimal" className={inputCls} />
          <input value={lesao.m2} onChange={(e) => setCampo("m2", e.target.value)} placeholder="2,5" inputMode="decimal" className={inputCls} />
          <input value={lesao.m3} onChange={(e) => setCampo("m3", e.target.value)} placeholder="2,0" inputMode="decimal" className={inputCls} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-xs cursor-pointer text-slate-300">
        <input type="checkbox" checked={!!lesao.doppler} onChange={(e) => setCampo("doppler", e.target.checked ? "sem" : "")} className="w-3.5 h-3.5 accent-sky-500" />
        Avaliada ao Doppler
      </label>
      {lesao.doppler && (
        <SelectGrupo semVazio titulo="Vascularização ao Doppler" opcoes={[{ id: "com", label: "Com vascularização" }, { id: "sem", label: "Sem vascularização" }]}
          valor={lesao.doppler} aoMudar={(v) => setCampo("doppler", v || "sem")} />
      )}
    </div>
  );
}

function PainelLado({ titulo, o, setCampo, testId }) {
  const suprimido = estadoSuprimeMedidasELesoes(o.estado);

  const adicionarLesao = () => setCampo("lesoes", [...(o.lesoes || []), { ...LESAO_VAZIA }]);
  const removerLesao = (i) => setCampo("lesoes", o.lesoes.filter((_, j) => j !== i));
  const setCampoLesao = (i, chave, valor) =>
    setCampo("lesoes", o.lesoes.map((l, j) => (j === i ? { ...l, [chave]: valor } : l)));

  return (
    <div className="border border-slate-700 rounded-md p-3 space-y-2" data-testid={testId}>
      <div className="text-sm font-semibold">{titulo}</div>
      <SelectGrupo semVazio titulo="Estado" opcoes={ESTADOS_OVARIO} valor={o.estado} aoMudar={(v) => setCampo("estado", v || "normal")} />
      {!suprimido && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <SelectGrupo semVazio titulo="Contornos" opcoes={[{ id: "regulares", label: "Regulares" }, { id: "irregulares", label: "Irregulares" }]}
              valor={o.contornos} aoMudar={(v) => setCampo("contornos", v || "regulares")} />
            <SelectGrupo semVazio titulo="Ecotextura" opcoes={[{ id: "homogenea", label: "Homogênea" }, { id: "heterogenea", label: "Heterogênea" }]}
              valor={o.ecotextura} aoMudar={(v) => setCampo("ecotextura", v || "homogenea")} />
          </div>
          <div>
            <div className={rotuloSelect}>Medidas (cm, opcional)</div>
            <div className="grid grid-cols-3 gap-2">
              <input value={o.m1} onChange={(e) => setCampo("m1", e.target.value)} placeholder="3,2" inputMode="decimal" className={inputCls} />
              <input value={o.m2} onChange={(e) => setCampo("m2", e.target.value)} placeholder="2,1" inputMode="decimal" className={inputCls} />
              <input value={o.m3} onChange={(e) => setCampo("m3", e.target.value)} placeholder="1,8" inputMode="decimal" className={inputCls} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Lesões (O-RADS)</div>
              <button onClick={adicionarLesao} className="px-2 py-0.5 rounded-full text-xs border border-sky-600 text-sky-300 hover:bg-sky-950">+ lesão</button>
            </div>
            {(o.lesoes || []).map((lesao, i) => (
              <PainelLesao
                key={i}
                lesao={lesao}
                testId={`${testId}-lesao-${i + 1}`}
                setCampo={(chave, valor) => setCampoLesao(i, chave, valor)}
                remover={() => removerLesao(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function OvariosPanel({ aoMudar }) {
  const [direito, setDireito] = useState(OVARIO_VAZIO);
  const [esquerdo, setEsquerdo] = useState(OVARIO_VAZIO);
  const [oradsAtivo, setOradsAtivo] = useState(false);
  const [oradsValor, setOradsValor] = useState("");

  useEffect(() => {
    aoMudar(direito, esquerdo, { ativo: oradsAtivo, valor: oradsValor });
  }, [direito, esquerdo, oradsAtivo, oradsValor, aoMudar]);

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-3 space-y-3">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Ovários (direito e esquerdo)</div>
      <PainelLado titulo="Ovário direito" o={direito} setCampo={(k, v) => setDireito((p) => ({ ...p, [k]: v }))} testId="ovario-direito" />
      <PainelLado titulo="Ovário esquerdo" o={esquerdo} setCampo={(k, v) => setEsquerdo((p) => ({ ...p, [k]: v }))} testId="ovario-esquerdo" />

      {/* Classificação O-RADS: opcional, desligada por padrão, nunca sugerida
          — abre vazia, o médico escolhe (0-5). Só entra no texto no final do
          laudo, nunca na impressão. */}
      <div className="border-t border-slate-700 pt-2 space-y-2">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={oradsAtivo} onChange={(e) => { setOradsAtivo(e.target.checked); if (!e.target.checked) setOradsValor(""); }} className="w-4 h-4 accent-sky-500" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Classificação O-RADS (opcional)</span>
        </label>
        {oradsAtivo && (
          <SelectGrupo
            titulo="O-RADS (US)"
            opcoes={["0", "1", "2", "3", "4", "5"].map((n) => ({ id: n, label: n }))}
            valor={oradsValor}
            aoMudar={(v) => setOradsValor(v || "")}
          />
        )}
      </div>
    </div>
  );
}
