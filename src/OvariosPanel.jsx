import { useState, useEffect } from "react";
import { ESTADOS_OVARIO, OVARIO_VAZIO, estadoSuprimeMedidasELesoes } from "./ovarios.js";

// OvariosPanel — Bloco 7: ovário direito e esquerdo descritos separadamente,
// dentro do exame "Pélvica transvaginal" (que continua com o painel de
// chips normal para Útero/Endométrio ao lado). Só entrega o par de estados
// {direito, esquerdo} para o chamador (LaudoVozIA.jsx) via `aoMudar` — quem
// decide como isso vira texto é src/ovarios.js (aplicarOvarios).

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

function PainelLado({ titulo, o, setCampo, testId }) {
  const suprimido = estadoSuprimeMedidasELesoes(o.estado);
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
        </>
      )}
    </div>
  );
}

export default function OvariosPanel({ aoMudar }) {
  const [direito, setDireito] = useState(OVARIO_VAZIO);
  const [esquerdo, setEsquerdo] = useState(OVARIO_VAZIO);

  useEffect(() => {
    aoMudar(direito, esquerdo);
  }, [direito, esquerdo, aoMudar]);

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-3 space-y-3">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Ovários (direito e esquerdo)</div>
      <PainelLado titulo="Ovário direito" o={direito} setCampo={(k, v) => setDireito((p) => ({ ...p, [k]: v }))} testId="ovario-direito" />
      <PainelLado titulo="Ovário esquerdo" o={esquerdo} setCampo={(k, v) => setEsquerdo((p) => ({ ...p, [k]: v }))} testId="ovario-esquerdo" />
    </div>
  );
}
