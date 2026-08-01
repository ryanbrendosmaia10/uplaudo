import { useState, useEffect } from "react";
import {
  SHAPE, ORIENTATION, MARGIN, ECHO, POSTERIOR, CALC, LATERALITY,
  TISSUE_PADRAO, NODULO_VAZIO, scoreFor, montarLaudoMama,
} from "./birads.js";

// MamaBuilder — interface do módulo BI-RADS no modo "Montar por cliques".
// Todo o léxico e a heurística de suspeição vivem em src/birads.js,
// portados da calculadora validada do médico. A categoria sugerida deve
// sempre ser confirmada pelo médico.
//
// ATENÇÃO: ainda não há máscara de laudo normal de mama em src/mascaras.js;
// enquanto o médico não fornecer a máscara, este módulo monta apenas o
// bloco de achados + a linha de classificação final.

const rotuloSelect = "text-xs font-semibold text-slate-400 mb-1";
const selectCls = "w-full bg-slate-700 text-slate-100 text-sm rounded-md px-2 py-1.5 outline-none";
const inputCls = "w-full bg-slate-700 text-slate-100 text-sm rounded-md px-2 py-1.5 outline-none placeholder-slate-500";
const chipCls = (ativo) =>
  "px-2.5 py-1 rounded-full text-xs border transition " +
  (ativo
    ? "bg-sky-500 border-sky-400 text-slate-900 font-semibold"
    : "bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600");

function SelectGrupo({ titulo, opcoes, valor, aoMudar, semVazio }) {
  return (
    <div>
      <div className={rotuloSelect}>{titulo}</div>
      <select value={valor ?? ""} onChange={(e) => aoMudar(e.target.value || null)} className={selectCls}>
        {!semVazio && <option value="">selecionar</option>}
        {opcoes.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
            {o.suspicious !== undefined ? (o.suspicious ? " (suspeito)" : " (típico)") : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function MamaBuilder({ aoAtualizar }) {
  const [tissueEnabled, setTissueEnabled] = useState(false);
  const [tissue, setTissue] = useState(TISSUE_PADRAO);
  const [cystPresent, setCystPresent] = useState(false);
  const [nodules, setNodules] = useState([]);

  useEffect(() => {
    aoAtualizar(montarLaudoMama(tissueEnabled, tissue, cystPresent, nodules));
  }, [tissueEnabled, tissue, cystPresent, nodules, aoAtualizar]);

  const setNodField = (i, key, val) =>
    setNodules((prev) => prev.map((n, j) => (j === i ? { ...n, [key]: val } : n)));
  const definirQtd = (qtd) =>
    setNodules((prev) => {
      const novo = prev.slice(0, qtd).map((n) => ({ ...n }));
      while (novo.length < qtd) novo.push({ ...NODULO_VAZIO });
      return novo;
    });

  return (
    <div className="space-y-4">
      <div className="bg-amber-900/40 border border-amber-700 rounded-lg p-3 text-xs text-amber-200 leading-relaxed">
        A máscara de laudo normal de mama ainda não foi cadastrada em mascaras.js. O módulo monta os achados
        e a classificação; o laudo completo depende da máscara a ser fornecida pelo médico.
      </div>

      {/* Tecido de fundo e cistos */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-3 space-y-3">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={tissueEnabled} onChange={(e) => setTissueEnabled(e.target.checked)} className="w-4 h-4 accent-sky-500" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Composição tecidual (opcional)</span>
        </label>
        {tissueEnabled && (
          <div className="grid grid-cols-2 gap-2">
            <SelectGrupo semVazio titulo="Ecotextura de fundo" valor={tissue.pattern} aoMudar={(v) => setTissue((t) => ({ ...t, pattern: v || "homog_fibro" }))}
              opcoes={[
                { id: "homog_gordura", label: "Homogênea, gordura" },
                { id: "homog_fibro", label: "Homogênea, fibroglandular" },
                { id: "heterogenea", label: "Heterogênea" },
              ]} />
            <SelectGrupo semVazio titulo="Componente glandular (GTC)" valor={tissue.gtc} aoMudar={(v) => setTissue((t) => ({ ...t, gtc: v || "moderado" }))}
              opcoes={[
                { id: "minimo", label: "Mínimo (<25%)" },
                { id: "leve", label: "Leve (25-49%)" },
                { id: "moderado", label: "Moderado (50-74%)" },
                { id: "marcado", label: "Marcado (≥75%)" },
              ]} />
          </div>
        )}
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={cystPresent} onChange={(e) => setCystPresent(e.target.checked)} className="w-4 h-4 accent-sky-500" />
          <span className="text-slate-300">Cisto simples presente</span>
        </label>
      </div>

      {/* Quantidade de nódulos */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-3">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Nódulos (ACR BI-RADS)</div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => definirQtd(0)} className={chipCls(nodules.length === 0)}>
            Sem nódulos
          </button>
          {[1, 2, 3, 4, 5].map((q) => (
            <button key={q} onClick={() => definirQtd(q)} className={chipCls(nodules.length === q)}>
              {q} nódulo{q > 1 ? "s" : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Painéis dos nódulos */}
      {nodules.map((n, i) => {
        const s = scoreFor(n);
        return (
          <div key={i} className="bg-slate-800 rounded-lg border border-slate-700 p-3 space-y-2" data-testid={`nodulo-mama-${i + 1}`}>
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold flex-1">N{i + 1}</div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-700 text-slate-200">
                {s.flags} suspeita{s.flags === 1 ? "" : "s"}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <SelectGrupo titulo="Forma" opcoes={SHAPE} valor={n.shape} aoMudar={(v) => setNodField(i, "shape", v)} />
              <SelectGrupo titulo="Orientação" opcoes={ORIENTATION} valor={n.orientation} aoMudar={(v) => setNodField(i, "orientation", v)} />
              <SelectGrupo titulo="Margem" opcoes={MARGIN} valor={n.margin} aoMudar={(v) => setNodField(i, "margin", v)} />
              <SelectGrupo titulo="Padrão de eco" opcoes={ECHO} valor={n.echo} aoMudar={(v) => setNodField(i, "echo", v)} />
              <SelectGrupo titulo="Características posteriores" opcoes={POSTERIOR} valor={n.posterior} aoMudar={(v) => setNodField(i, "posterior", v)} />
              <SelectGrupo titulo="Calcificações" opcoes={CALC} valor={n.calc} aoMudar={(v) => setNodField(i, "calc", v)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <SelectGrupo semVazio titulo="Lateralidade" opcoes={LATERALITY} valor={n.laterality} aoMudar={(v) => setNodField(i, "laterality", v || "direita")} />
              <div>
                <div className={rotuloSelect}>Hora do relógio (0-12h)</div>
                <input value={n.clock} onChange={(e) => setNodField(i, "clock", e.target.value)} placeholder="10" className={inputCls} />
              </div>
              <div>
                <div className={rotuloSelect}>Distância da pele (cm)</div>
                <input value={n.skinDist} onChange={(e) => setNodField(i, "skinDist", e.target.value)} placeholder="0,5" className={inputCls} />
              </div>
              <div>
                <div className={rotuloSelect}>Distância da papila (cm)</div>
                <input value={n.nippleDist} onChange={(e) => setNodField(i, "nippleDist", e.target.value)} placeholder="3" className={inputCls} />
              </div>
            </div>
            <div>
              <div className={rotuloSelect}>Medidas (cm)</div>
              <div className="grid grid-cols-3 gap-2">
                <input value={n.m1} onChange={(e) => setNodField(i, "m1", e.target.value)} placeholder="1,2" className={inputCls} />
                <input value={n.m2} onChange={(e) => setNodField(i, "m2", e.target.value)} placeholder="0,8" className={inputCls} />
                <input value={n.m3} onChange={(e) => setNodField(i, "m3", e.target.value)} placeholder="1,0" className={inputCls} />
              </div>
            </div>
            <div className="text-xs text-slate-400 leading-relaxed border-t border-slate-700 pt-2">
              <span className="text-amber-300 font-semibold">Sugestão (a confirmar pelo médico):</span>{" "}
              <span className="text-slate-200 font-semibold" data-testid={`birads-${i + 1}`}>{s.tr}</span> · {s.sub}
              <br />
              Probabilidade de malignidade: {s.risk} · Conduta: {s.mgmt}
            </div>
          </div>
        );
      })}
    </div>
  );
}
