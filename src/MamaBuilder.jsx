import { useState, useEffect } from "react";
import {
  SHAPE, ORIENTATION, MARGIN, ECHO, POSTERIOR, CALC, LATERALITY,
  TISSUE_PADRAO, NODULO_VAZIO, scoreFor, montarLaudoMama,
  CATEGORIAS_BIRADS, NODULO_PADRAO_MAMA_VAZIO, CISTOS_VAZIO,
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

function SelectGrupo({ titulo, opcoes, valor, aoMudar, semVazio, desabilitado, dica }) {
  return (
    <div>
      <div className={rotuloSelect}>{titulo}</div>
      <select
        value={valor ?? ""}
        onChange={(e) => aoMudar(e.target.value || null)}
        disabled={desabilitado}
        className={selectCls + (desabilitado ? " opacity-60 cursor-not-allowed" : "")}
      >
        {!semVazio && <option value="">selecionar</option>}
        {opcoes.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
            {o.suspicious !== undefined ? (o.suspicious ? " (suspeito)" : " (típico)") : ""}
          </option>
        ))}
      </select>
      {dica && <div className="text-[11px] text-amber-300 mt-0.5">{dica}</div>}
    </div>
  );
}

export default function MamaBuilder({ aoAtualizar }) {
  const [tissueEnabled, setTissueEnabled] = useState(false);
  const [tissue, setTissue] = useState(TISSUE_PADRAO);
  const [cistos, setCistos] = useState(CISTOS_VAZIO);
  const [nodules, setNodules] = useState([]);
  const [nodulosPadrao, setNodulosPadrao] = useState([]);
  const [categoria, setCategoria] = useState("");

  useEffect(() => {
    aoAtualizar(montarLaudoMama(tissueEnabled, tissue, cistos, nodules, nodulosPadrao, categoria));
  }, [tissueEnabled, tissue, cistos, nodules, nodulosPadrao, categoria, aoAtualizar]);

  const setNodField = (i, key, val) =>
    setNodules((prev) => prev.map((n, j) => (j === i ? { ...n, [key]: val } : n)));

  // Bloco 4b: forma "redonda" tem por definição 3 eixos iguais e não pode
  // ter orientação paralela à pele — a combinação seria contraditória. Ao
  // escolher redonda, a orientação é travada em "não paralela" (consequência
  // lógica direta, não uma decisão do app). Saindo de redonda, o campo
  // volta a ficar livre, com "paralela" pré-selecionada como padrão.
  const setNodShape = (i, shapeVal) =>
    setNodules((prev) =>
      prev.map((n, j) => {
        if (j !== i) return n;
        if (shapeVal === "redonda") return { ...n, shape: shapeVal, orientation: "nao_paralela" };
        if (n.shape === "redonda" || n.orientation == null) return { ...n, shape: shapeVal, orientation: "paralela" };
        return { ...n, shape: shapeVal };
      })
    );
  const definirQtd = (qtd) =>
    setNodules((prev) => {
      const novo = prev.slice(0, qtd).map((n) => ({ ...n }));
      while (novo.length < qtd) novo.push({ ...NODULO_VAZIO });
      return novo;
    });

  // "3" é só o valor inicial de conveniência do primeiro Nódulo padrão —
  // se o médico já escolheu uma categoria, um novo nódulo não a sobrescreve.
  const adicionarNoduloPadrao = () => {
    setNodulosPadrao((prev) => [...prev, { ...NODULO_PADRAO_MAMA_VAZIO }]);
    setCategoria((prev) => prev || "3");
  };
  const removerNoduloPadrao = (i) => setNodulosPadrao((prev) => prev.filter((_, j) => j !== i));
  const setNodPadraoField = (i, key, val) =>
    setNodulosPadrao((prev) => prev.map((n, j) => (j === i ? { ...n, [key]: val } : n)));

  const setCistoField = (key, val) => setCistos((prev) => ({ ...prev, [key]: val }));
  const alternarModoCisto = (modo) =>
    setCistos((prev) =>
      prev.modo === modo
        ? { ...CISTOS_VAZIO }
        : { ...CISTOS_VAZIO, modo, lado: modo === "unilateral" ? "direita" : "" }
    );

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
      </div>

      {/* Bloco 3b: Cistos mamários — item separado do nódulo, duas opções
          mutuamente exclusivas. Convive com nódulo(s), sem categoria BI-RADS
          própria (cisto simples não é classificado). */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-3 space-y-3">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Cistos mamários (opcional)</div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => alternarModoCisto("unilateral")} className={chipCls(cistos.modo === "unilateral")}>
            Esparsos em uma mama
          </button>
          <button onClick={() => alternarModoCisto("bilateral")} className={chipCls(cistos.modo === "bilateral")}>
            Esparsos bilateralmente
          </button>
        </div>
        {cistos.modo === "unilateral" && (
          <div className="grid grid-cols-2 gap-2">
            <SelectGrupo semVazio titulo="Mama" opcoes={LATERALITY} valor={cistos.lado} aoMudar={(v) => setCistoField("lado", v || "direita")} />
          </div>
        )}
        {cistos.modo === "bilateral" && (
          <div className="grid grid-cols-2 gap-2">
            <SelectGrupo titulo="Mama do maior cisto (opcional)" opcoes={LATERALITY} valor={cistos.ladoMaior} aoMudar={(v) => setCistoField("ladoMaior", v || "")} />
          </div>
        )}
        {cistos.modo && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className={rotuloSelect}>Raio do maior cisto (h, opcional)</div>
              <input value={cistos.hora} onChange={(e) => setCistoField("hora", e.target.value)} placeholder="2" inputMode="decimal" className={inputCls} />
            </div>
            <div>
              <div className={rotuloSelect}>Medida do maior cisto (cm, opcional)</div>
              <input value={cistos.medida} onChange={(e) => setCistoField("medida", e.target.value)} placeholder="0,5" inputMode="decimal" className={inputCls} />
            </div>
          </div>
        )}
      </div>

      {/* Bloco 3a: Nódulo padrão — atalho para o caso banal, convive com o
          caminho detalhado abaixo (que fica intocado). */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Nódulo padrão</div>
          <button onClick={adicionarNoduloPadrao} className="px-2.5 py-1 rounded-full text-xs border border-sky-600 text-sky-300 hover:bg-sky-950">
            + Nódulo padrão
          </button>
        </div>
        {nodulosPadrao.map((n, i) => (
          <div key={i} className="border border-slate-700 rounded-md p-3 space-y-2" data-testid={`nodulo-padrao-mama-${i + 1}`}>
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold flex-1">Nódulo padrão {i + 1}</div>
              <button
                onClick={() => removerNoduloPadrao(i)}
                aria-label={`Remover nódulo padrão ${i + 1}`}
                className="w-5 h-5 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-700 leading-none"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className={rotuloSelect}>Raio (h, opcional)</div>
                <input value={n.hora} onChange={(e) => setNodPadraoField(i, "hora", e.target.value)} placeholder="10" inputMode="decimal" className={inputCls} />
              </div>
              <SelectGrupo titulo="Mama (opcional)" opcoes={LATERALITY} valor={n.lado} aoMudar={(v) => setNodPadraoField(i, "lado", v || "")} />
            </div>
            <div>
              <div className={rotuloSelect}>Medidas (cm, opcional)</div>
              <div className="grid grid-cols-3 gap-2">
                <input value={n.m1} onChange={(e) => setNodPadraoField(i, "m1", e.target.value)} placeholder="1,2" inputMode="decimal" className={inputCls} />
                <input value={n.m2} onChange={(e) => setNodPadraoField(i, "m2", e.target.value)} placeholder="0,8" inputMode="decimal" className={inputCls} />
                <input value={n.m3} onChange={(e) => setNodPadraoField(i, "m3", e.target.value)} placeholder="1,0" inputMode="decimal" className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className={rotuloSelect}>Distância da papila (cm, opcional)</div>
                <input value={n.distPapila} onChange={(e) => setNodPadraoField(i, "distPapila", e.target.value)} placeholder="3" inputMode="decimal" className={inputCls} />
              </div>
              <div>
                <div className={rotuloSelect}>Distância da pele (cm, opcional)</div>
                <input value={n.distPele} onChange={(e) => setNodPadraoField(i, "distPele", e.target.value)} placeholder="0,5" inputMode="decimal" className={inputCls} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bloco 3: categoria BI-RADS final — sempre manual, nunca calculada. */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-3">
        <SelectGrupo
          titulo="Classificação final (ACR BI-RADS)"
          opcoes={CATEGORIAS_BIRADS.map((c) => ({ id: c, label: c }))}
          valor={categoria}
          aoMudar={(v) => setCategoria(v || "")}
        />
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
              <SelectGrupo titulo="Forma" opcoes={SHAPE} valor={n.shape} aoMudar={(v) => setNodShape(i, v)} />
              <SelectGrupo
                titulo="Orientação"
                opcoes={ORIENTATION}
                valor={n.orientation}
                aoMudar={(v) => setNodField(i, "orientation", v)}
                desabilitado={n.shape === "redonda"}
                dica={n.shape === "redonda" ? "Redonda tem 3 eixos iguais: orientação não paralela por definição." : null}
              />
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
            <div className="text-xs text-slate-400 leading-relaxed border-t border-slate-700 pt-2" data-testid={`suspeitas-${i + 1}`}>
              {s.flags} característica{s.flags === 1 ? "" : "s"} suspeita{s.flags === 1 ? "" : "s"} (informativo — a
              categoria final é sempre escolhida pelo médico no campo "Classificação final" abaixo).
            </div>
          </div>
        );
      })}
    </div>
  );
}
