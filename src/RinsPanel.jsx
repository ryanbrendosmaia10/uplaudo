import { useState, useEffect } from "react";
import { POLOS_RIM, RIM_VAZIO } from "./rins.js";

// RinsPanel — Item 3: rim direito e esquerdo em painéis independentes,
// dentro dos exames "Abdome Total" e "Vias Urinárias" (que continuam com o
// painel de chips normal ao lado, incluindo o grupo "Rins" já existente —
// os dois caminhos coexistem, o antigo tem prioridade se estiver em uso;
// ver aplicarRins em src/rins.js). Só entrega {direito, esquerdo} para o
// chamador via `aoMudar`.

const rotuloSelect = "text-xs font-semibold text-[var(--c-slate-400)] mb-1";
const selectCls = "w-full bg-[var(--c-slate-700)] text-[var(--c-slate-100)] text-sm rounded-md px-2 py-1.5 outline-none";
const inputCls = "w-full bg-[var(--c-slate-700)] text-[var(--c-slate-100)] text-sm rounded-md px-2 py-1.5 outline-none placeholder-[var(--c-slate-500)]";

function PainelLado({ titulo, r, setCampo, testId }) {
  return (
    <div className="border border-[var(--c-slate-700)] rounded-md p-3 space-y-2" data-testid={testId}>
      <div className="text-sm font-semibold">{titulo}</div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={r.calculo} onChange={(e) => setCampo("calculo", e.target.checked)} className="w-4 h-4 accent-[var(--c-accent-500)]" />
        <span className="text-[var(--c-slate-300)]">Cálculo renal</span>
      </label>
      {r.calculo && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className={rotuloSelect}>Polo (opcional)</div>
            <select value={r.polo} onChange={(e) => setCampo("polo", e.target.value)} className={selectCls}>
              {POLOS_RIM.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <div className={rotuloSelect}>Medida (cm, opcional)</div>
            <input value={r.m1} onChange={(e) => setCampo("m1", e.target.value)} placeholder="0,5" inputMode="decimal" className={inputCls} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function RinsPanel({ aoMudar }) {
  const [direito, setDireito] = useState(RIM_VAZIO);
  const [esquerdo, setEsquerdo] = useState(RIM_VAZIO);

  useEffect(() => {
    aoMudar(direito, esquerdo);
  }, [direito, esquerdo, aoMudar]);

  return (
    <div className="bg-[var(--c-slate-800)] rounded-lg border border-[var(--c-slate-700)] p-3 space-y-3">
      <div className="text-xs font-semibold text-[var(--c-slate-400)] uppercase tracking-wide">Rins (direito e esquerdo)</div>
      <div className="text-[11px] text-[var(--c-slate-500)]">
        Só se aplica se nenhuma alteração do grupo "Rins" abaixo estiver marcada.
      </div>
      <PainelLado titulo="Rim direito" r={direito} setCampo={(k, v) => setDireito((p) => ({ ...p, [k]: v }))} testId="rim-direito" />
      <PainelLado titulo="Rim esquerdo" r={esquerdo} setCampo={(k, v) => setEsquerdo((p) => ({ ...p, [k]: v }))} testId="rim-esquerdo" />
    </div>
  );
}
