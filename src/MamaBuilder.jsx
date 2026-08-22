import { useState, useEffect } from "react";
import {
  SHAPE, ORIENTATION, MARGIN, ECHO, POSTERIOR, CALC, LATERALITY,
  TISSUE_VAZIO, gtcDesabilitadoPara, NODULO_VAZIO, scoreFor, montarLaudoMama,
  CATEGORIAS_BIRADS, NODULO_PADRAO_MAMA_VAZIO, CISTOS_VAZIO, FORMA_PADRAO_MAMA,
  noduloCompativelComBirads3, AVISO_BIRADS3_LINHA1, AVISO_BIRADS3_LINHA2,
} from "./birads.js";

// MamaBuilder — interface do módulo BI-RADS no modo "Montar por cliques".
// Todo o léxico e a heurística de suspeição vivem em src/birads.js,
// portados da calculadora validada do médico. A categoria sugerida deve
// sempre ser confirmada pelo médico.
//
// ATENÇÃO: ainda não há máscara de laudo normal de mama em src/mascaras.js;
// enquanto o médico não fornecer a máscara, este módulo monta apenas o
// bloco de achados + a linha de classificação final.

const rotuloSelect = "text-xs font-semibold text-[var(--c-slate-400)] mb-1";
const selectCls = "w-full bg-[var(--c-slate-700)] text-[var(--c-slate-100)] text-sm rounded-md px-2 py-1.5 outline-none";
const inputCls = "w-full bg-[var(--c-slate-700)] text-[var(--c-slate-100)] text-sm rounded-md px-2 py-1.5 outline-none placeholder-[var(--c-slate-500)]";
const chipCls = (ativo) =>
  "px-2.5 py-1 rounded-full text-xs border transition " +
  (ativo
    ? "bg-[var(--c-accent-500)] border-[var(--c-accent-400)] text-[var(--c-on-accent)] font-semibold"
    : "bg-[var(--c-slate-700)] border-[var(--c-slate-600)] text-[var(--c-slate-200)] hover:bg-[var(--c-slate-600)]");

// Botão genérico de nódulo padrão + par "Direita/Esquerda" que já entra com
// o campo "Mama" preenchido — pedido do Dr. Ryan pra não precisar escolher
// o lado toda vez; o campo "Mama" continua editável depois, pra corrigir.
function BotoesNoduloPadrao({ rotulo, variante, aoAdicionar }) {
  const clsGenerico = "px-2.5 py-1 rounded-full text-xs border border-[var(--c-accent-600)] text-[var(--c-accent-300)] hover:bg-[var(--c-accent-950)]";
  const clsLado = "px-2 py-1 rounded-full text-xs border border-[var(--c-accent-600)] text-[var(--c-accent-300)] hover:bg-[var(--c-accent-950)]";
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => aoAdicionar(variante)} className={clsGenerico}>{rotulo}</button>
      <button onClick={() => aoAdicionar(variante, "direita")} className={clsLado} title={`${rotulo} — mama direita, já selecionada`}>D</button>
      <button onClick={() => aoAdicionar(variante, "esquerda")} className={clsLado} title={`${rotulo} — mama esquerda, já selecionada`}>E</button>
    </div>
  );
}

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
      {dica && <div className="text-[11px] text-[var(--c-amber-300)] mt-0.5">{dica}</div>}
    </div>
  );
}

export default function MamaBuilder({ aoAtualizar }) {
  const [tissue, setTissue] = useState(TISSUE_VAZIO);
  const [cistos, setCistos] = useState(CISTOS_VAZIO);
  const [nodules, setNodules] = useState([]);
  const [nodulosPadrao, setNodulosPadrao] = useState([]);
  const [categoria, setCategoria] = useState("");

  useEffect(() => {
    aoAtualizar(montarLaudoMama(tissue, cistos, nodules, nodulosPadrao, categoria));
  }, [tissue, cistos, nodules, nodulosPadrao, categoria, aoAtualizar]);

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
  const adicionarNoduloPadrao = (variante = "padrao", lado = "") => {
    setNodulosPadrao((prev) => [...prev, { ...NODULO_PADRAO_MAMA_VAZIO, variante, lado }]);
    setCategoria((prev) => prev || "3");
  };
  const removerNoduloPadrao = (i) => setNodulosPadrao((prev) => prev.filter((_, j) => j !== i));
  const setNodPadraoField = (i, key, val) =>
    setNodulosPadrao((prev) => prev.map((n, j) => (j === i ? { ...n, [key]: val } : n)));

  // Bloco 5: aviso de coerência do BI-RADS 3 — nunca bloqueia, só realça o
  // campo de classificação quando algum nódulo detalhado não atende aos 4
  // critérios do "provavelmente benigno" com a categoria atual em 3.
  const algumNoduloIncompativelCom3 = categoria === "3" && nodules.some((n) => !noduloCompativelComBirads3(n));

  const setCistoField = (key, val) => setCistos((prev) => ({ ...prev, [key]: val }));
  const alternarModoCisto = (modo) =>
    setCistos((prev) =>
      prev.modo === modo
        ? { ...CISTOS_VAZIO }
        : { ...CISTOS_VAZIO, modo, lado: modo === "unilateral" ? "direita" : "" }
    );

  return (
    <div className="space-y-4">
      <div className="bg-[var(--c-amber-900-40)] border border-[var(--c-amber-700)] rounded-lg p-3 text-xs text-[var(--c-amber-200)] leading-relaxed">
        A máscara de laudo normal de mama ainda não foi cadastrada em mascaras.js. O módulo monta os achados
        e a classificação; o laudo completo depende da máscara a ser fornecida pelo médico.
      </div>

      {/* Bloco 6: Composição Tecidual — seção obrigatória e dedicada
          (BI-RADS v2025). Nenhum dos dois campos vem pré-selecionado; o
          médico escolhe os dois. GTC (glandular tissue component, quartil
          do tecido fibroglandular) só se aplica quando o padrão não é
          adiposo. Percentuais aqui são só ajuda de interface — nunca vão
          para o texto do laudo, e o GTC nunca é usado para relacionar risco. */}
      <div className="bg-[var(--c-slate-800)] rounded-lg border border-[var(--c-slate-700)] p-3 space-y-3">
        <div className="text-xs font-semibold text-[var(--c-slate-400)] uppercase tracking-wide">Composição tecidual</div>
        <div className="grid grid-cols-2 gap-2">
          <SelectGrupo
            titulo="Padrão tecidual / ecotextura de fundo"
            valor={tissue.pattern}
            aoMudar={(v) =>
              setTissue((t) => (gtcDesabilitadoPara(v) ? { pattern: v || "", gtc: "" } : { ...t, pattern: v || "" }))
            }
            opcoes={[
              { id: "homog_gordura", label: "Ecotextura de fundo homogênea - gordura" },
              { id: "homog_fibro", label: "Ecotextura de fundo homogênea - fibroglandular" },
              { id: "heterogenea", label: "Ecotextura de fundo heterogênea" },
            ]}
          />
          <SelectGrupo
            titulo="Componente glandular (GTC)"
            valor={tissue.gtc}
            aoMudar={(v) => setTissue((t) => ({ ...t, gtc: v || "" }))}
            desabilitado={gtcDesabilitadoPara(tissue.pattern)}
            dica={
              gtcDesabilitadoPara(tissue.pattern)
                ? "GTC não se aplica a mama predominantemente adiposa"
                : tissue.pattern && !tissue.gtc
                ? "Pendente: escolha o GTC para completar a seção (não bloqueia o laudo)."
                : null
            }
            opcoes={[
              { id: "minimo", label: "Mínimo (<25%)" },
              { id: "leve", label: "Leve (25-49%)" },
              { id: "moderado", label: "Moderado (50-74%)" },
              { id: "marcado", label: "Marcado (≥75%)" },
            ]}
          />
        </div>
      </div>

      {/* Bloco 3b: Cistos mamários — item separado do nódulo, duas opções
          mutuamente exclusivas. Convive com nódulo(s), sem categoria BI-RADS
          própria (cisto simples não é classificado). */}
      <div className="bg-[var(--c-slate-800)] rounded-lg border border-[var(--c-slate-700)] p-3 space-y-3">
        <div className="text-xs font-semibold text-[var(--c-slate-400)] uppercase tracking-wide">Cistos mamários (opcional)</div>
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

      {/* Bloco 3a/5a-5c: Nódulo padrão e variantes — atalho para os casos
          banais, convive com o caminho detalhado abaixo (que fica intocado). */}
      <div className="bg-[var(--c-slate-800)] rounded-lg border border-[var(--c-slate-700)] p-3 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs font-semibold text-[var(--c-slate-400)] uppercase tracking-wide">Nódulo padrão</div>
          <div className="flex flex-wrap gap-2">
            <BotoesNoduloPadrao rotulo="+ Nódulo padrão" variante="padrao" aoAdicionar={adicionarNoduloPadrao} />
            <BotoesNoduloPadrao rotulo="+ Ilhota de gordura" variante="ilhota_gordura" aoAdicionar={adicionarNoduloPadrao} />
            <BotoesNoduloPadrao rotulo="+ Cisto de conteúdo espesso" variante="cisto_espesso" aoAdicionar={adicionarNoduloPadrao} />
          </div>
        </div>
        {nodulosPadrao.map((n, i) => (
          <div key={i} className="border border-[var(--c-slate-700)] rounded-md p-3 space-y-2" data-testid={`nodulo-padrao-mama-${i + 1}`}>
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold flex-1">
                {n.variante === "ilhota_gordura" ? "Ilhota de gordura" : n.variante === "cisto_espesso" ? "Cisto de conteúdo espesso" : "Nódulo padrão"} {i + 1}
              </div>
              <button
                onClick={() => removerNoduloPadrao(i)}
                aria-label={`Remover nódulo padrão ${i + 1}`}
                className="w-5 h-5 flex items-center justify-center rounded-full text-[var(--c-slate-400)] hover:text-white hover:bg-[var(--c-slate-700)] leading-none"
              >
                ×
              </button>
            </div>
            {n.variante === "padrao" && (
              <SelectGrupo semVazio titulo="Forma" opcoes={FORMA_PADRAO_MAMA} valor={n.forma} aoMudar={(v) => setNodPadraoField(i, "forma", v || "oval")} />
            )}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className={rotuloSelect}>Raio (h, opcional)</div>
                <input value={n.hora} onChange={(e) => setNodPadraoField(i, "hora", e.target.value)} placeholder="10" inputMode="decimal" className={inputCls} />
              </div>
              <SelectGrupo titulo="Mama (opcional)" opcoes={LATERALITY} valor={n.lado} aoMudar={(v) => setNodPadraoField(i, "lado", v || "")} />
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
            <div>
              <div className={rotuloSelect}>Medidas (cm, opcional)</div>
              <div className="grid grid-cols-3 gap-2">
                <input value={n.m1} onChange={(e) => setNodPadraoField(i, "m1", e.target.value)} placeholder="1,2" inputMode="decimal" className={inputCls} />
                <input value={n.m2} onChange={(e) => setNodPadraoField(i, "m2", e.target.value)} placeholder="0,8" inputMode="decimal" className={inputCls} />
                <input value={n.m3} onChange={(e) => setNodPadraoField(i, "m3", e.target.value)} placeholder="1,0" inputMode="decimal" className={inputCls} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bloco 3: categoria BI-RADS final — sempre manual, nunca calculada. */}
      <div
        className={
          "bg-[var(--c-slate-800)] rounded-lg border p-3 " +
          (algumNoduloIncompativelCom3 ? "border-[var(--c-red-500)]" : "border-[var(--c-slate-700)]")
        }
        data-testid="classificacao-final"
      >
        <SelectGrupo
          titulo="Classificação final (ACR BI-RADS)"
          opcoes={CATEGORIAS_BIRADS.map((c) => ({ id: c, label: c }))}
          valor={categoria}
          aoMudar={(v) => setCategoria(v || "")}
        />
      </div>

      {/* Quantidade de nódulos */}
      <div className="bg-[var(--c-slate-800)] rounded-lg border border-[var(--c-slate-700)] p-3">
        <div className="text-xs font-semibold text-[var(--c-slate-400)] uppercase tracking-wide mb-2">Nódulos (ACR BI-RADS)</div>
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
          <div key={i} className="bg-[var(--c-slate-800)] rounded-lg border border-[var(--c-slate-700)] p-3 space-y-2" data-testid={`nodulo-mama-${i + 1}`}>
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold flex-1">N{i + 1}</div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[var(--c-slate-700)] text-[var(--c-slate-200)]">
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
            <div className="text-xs text-[var(--c-slate-400)] leading-relaxed border-t border-[var(--c-slate-700)] pt-2" data-testid={`suspeitas-${i + 1}`}>
              {s.flags} característica{s.flags === 1 ? "" : "s"} suspeita{s.flags === 1 ? "" : "s"} (informativo — a
              categoria final é sempre escolhida pelo médico no campo "Classificação final" abaixo).
            </div>
            {categoria === "3" && !noduloCompativelComBirads3(n) && (
              <div className="text-xs text-[var(--c-red-300)] bg-[var(--c-red-950-40)] border border-[var(--c-red-700)] rounded-md p-2 leading-relaxed" data-testid={`aviso-birads3-${i + 1}`}>
                <div>{AVISO_BIRADS3_LINHA1}</div>
                <div>{AVISO_BIRADS3_LINHA2}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
