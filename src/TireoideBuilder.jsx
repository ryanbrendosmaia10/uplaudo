import { useState, useEffect } from "react";
import {
  COMPOSITION, ECHOGENICITY, SHAPE, MARGIN, FOCI, LOCATIONS,
  lobeVolume, fmtVol, scoreFor, montarLaudoTireoide,
  GLAND_PADRAO, NODULO_VAZIO,
} from "./tirads.js";

// TireoideBuilder — interface do módulo TI-RADS no modo "Montar por cliques".
// Toda a lógica clínica (pontos, categorias, fraseologia) vive em
// src/tirads.js, portada da calculadora validada do médico.

const rotuloSelect = "text-xs font-semibold text-slate-400 mb-1";
const selectCls = "w-full bg-slate-700 text-slate-100 text-sm rounded-md px-2 py-1.5 outline-none";
const inputCls = "w-full bg-slate-700 text-slate-100 text-sm rounded-md px-2 py-1.5 outline-none placeholder-slate-500";
const chipCls = (ativo) =>
  "px-2.5 py-1 rounded-full text-xs border transition " +
  (ativo
    ? "bg-sky-500 border-sky-400 text-slate-900 font-semibold"
    : "bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600");

function SelectGrupo({ titulo, opcoes, valor, aoMudar, comPts }) {
  return (
    <div>
      <div className={rotuloSelect}>{titulo}</div>
      <select value={valor ?? ""} onChange={(e) => aoMudar(e.target.value || null)} className={selectCls}>
        <option value="">selecionar</option>
        {opcoes.filter((o) => o.id !== "").map((o) => (
          <option key={o.id} value={o.id}>
            {comPts ? `${o.label} (${o.pts} pt${o.pts === 1 ? "" : "s"})` : o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function TireoideBuilder({ mascaraTexto, aoAtualizar }) {
  const [gland, setGland] = useState(GLAND_PADRAO);
  const [nodules, setNodules] = useState([]);

  useEffect(() => {
    aoAtualizar(montarLaudoTireoide(mascaraTexto, gland, nodules));
  }, [mascaraTexto, gland, nodules, aoAtualizar]);

  const setGlandField = (key, val) => setGland((prev) => ({ ...prev, [key]: val }));
  const setNodField = (i, key, val) =>
    setNodules((prev) => prev.map((n, j) => (j === i ? { ...n, [key]: val } : n)));
  const definirQtd = (qtd) =>
    setNodules((prev) => {
      const novo = prev.slice(0, qtd).map((n) => ({ ...n }));
      while (novo.length < qtd) novo.push({ ...NODULO_VAZIO });
      return novo;
    });

  const rdVol = lobeVolume(gland.rd1, gland.rd2, gland.rd3);
  const leVol = lobeVolume(gland.le1, gland.le2, gland.le3);
  const totalVol = rdVol === null && leVol === null ? null : (rdVol || 0) + (leVol || 0);

  return (
    <div className="space-y-4">
      {/* Glândula */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-3 space-y-3">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Glândula</div>
        <div className="grid grid-cols-2 gap-2">
          <SelectGrupo titulo="Localização" valor={gland.location} aoMudar={(v) => setGlandField("location", v || "topica")}
            opcoes={[{ id: "topica", label: "Tópica" }, { id: "ectopica", label: "Ectópica" }]} />
          <SelectGrupo titulo="Classificação do volume" valor={gland.volumeClass} aoMudar={(v) => setGlandField("volumeClass", v || "normal")}
            opcoes={[{ id: "reduzido", label: "Reduzido" }, { id: "normal", label: "Normal" }, { id: "aumentado", label: "Aumentado" }]} />
          <SelectGrupo titulo="Contornos" valor={gland.contour} aoMudar={(v) => setGlandField("contour", v || "regulares")}
            opcoes={[{ id: "regulares", label: "Regulares" }, { id: "lobulados", label: "Lobulados" }, { id: "irregulares", label: "Irregulares" }]} />
          <SelectGrupo titulo="Ecotextura" valor={gland.texture} aoMudar={(v) => setGlandField("texture", v || "homogenea")}
            opcoes={[{ id: "homogenea", label: "Homogênea" }, { id: "fin_heterogenea", label: "Finamente heterogênea" }, { id: "heterogenea", label: "Heterogênea" }]} />
        </div>
        {[
          ["Lobo direito (cm)", "rd1", "rd2", "rd3"],
          ["Lobo esquerdo (cm)", "le1", "le2", "le3"],
          ["Istmo (cm, opcional)", "ist1", "ist2", "ist3"],
        ].map(([titulo, k1, k2, k3]) => (
          <div key={titulo}>
            <div className={rotuloSelect}>{titulo}</div>
            <div className="grid grid-cols-3 gap-2">
              <input value={gland[k1]} onChange={(e) => setGlandField(k1, e.target.value)} placeholder="L" className={inputCls} />
              <input value={gland[k2]} onChange={(e) => setGlandField(k2, e.target.value)} placeholder="A-P" className={inputCls} />
              <input value={gland[k3]} onChange={(e) => setGlandField(k3, e.target.value)} placeholder="T" className={inputCls} />
            </div>
          </div>
        ))}
        <div className="text-sm text-slate-400">
          Volume: lobo direito <b className="text-slate-200">{fmtVol(rdVol)}</b> cm³ · lobo esquerdo{" "}
          <b className="text-slate-200">{fmtVol(leVol)}</b> cm³ · total{" "}
          <b className="text-slate-200" data-testid="volume-total">{fmtVol(totalVol)}</b> cm³
        </div>
      </div>

      {/* Quantidade de nódulos */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-3">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Nódulos (ACR TI-RADS)</div>
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
          <div key={i} className="bg-slate-800 rounded-lg border border-slate-700 p-3 space-y-2" data-testid={`nodulo-${i + 1}`}>
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold flex-1">N{i + 1}</div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-700 text-slate-200" data-testid={`pts-${i + 1}`}>
                {s.pts} pts
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-sky-500 text-slate-900" data-testid={`tr-${i + 1}`}>
                {s.tr}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <SelectGrupo titulo="Composição" opcoes={COMPOSITION} valor={n.composition} aoMudar={(v) => setNodField(i, "composition", v)} comPts />
              <SelectGrupo titulo="Ecogenicidade" opcoes={ECHOGENICITY} valor={n.echogenicity} aoMudar={(v) => setNodField(i, "echogenicity", v)} comPts />
              <SelectGrupo titulo="Formato" opcoes={SHAPE} valor={n.shape} aoMudar={(v) => setNodField(i, "shape", v)} comPts />
              <SelectGrupo titulo="Margem" opcoes={MARGIN} valor={n.margin} aoMudar={(v) => setNodField(i, "margin", v)} comPts />
              <SelectGrupo titulo="Focos ecogênicos" opcoes={FOCI} valor={n.foci} aoMudar={(v) => setNodField(i, "foci", v)} comPts />
              <SelectGrupo titulo="Localização" opcoes={LOCATIONS} valor={n.location || ""} aoMudar={(v) => setNodField(i, "location", v || "")} />
            </div>
            <div>
              <div className={rotuloSelect}>Medidas (cm)</div>
              <div className="grid grid-cols-3 gap-2">
                <input value={n.m1} onChange={(e) => setNodField(i, "m1", e.target.value)} placeholder="1,2" className={inputCls} />
                <input value={n.m2} onChange={(e) => setNodField(i, "m2", e.target.value)} placeholder="0,8" className={inputCls} />
                <input value={n.m3} onChange={(e) => setNodField(i, "m3", e.target.value)} placeholder="1,1" className={inputCls} />
              </div>
            </div>
            <div className="text-xs text-slate-400 leading-relaxed">
              <span className="text-slate-300 font-semibold">{s.sub}</span> · Risco de malignidade: {s.risk}
              <br />
              PAAF: <span className="text-slate-200">{s.fna}</span> · Seguimento: <span className="text-slate-200">{s.follow}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
