import { useState } from "react";

// Fase 2: alteração customizada pelo médico — rótulo + frase livre, sem
// campos estruturados (lado/medida/segmento), no mesmo espírito "texto
// livre" escolhido para as máscaras novas. A frase digitada em "descricao"
// deve começar com o rótulo do órgão da máscara (ex.: "Fígado: ...") pra
// substituir o parágrafo certo — mesma regra que já vale pros itens fixos.
export default function NovaAlteracaoForm({ mascaraId, gruposExistentes, aoSalvar }) {
  const [aberto, setAberto] = useState(false);
  const [orgao, setOrgao] = useState("");
  const [rotulo, setRotulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [impressao, setImpressao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const datalistId = `grupos-existentes-${mascaraId}`;

  const limpar = () => {
    setOrgao(""); setRotulo(""); setDescricao(""); setImpressao("");
  };

  const submeter = async (e) => {
    e.preventDefault();
    if (!rotulo.trim() || !descricao.trim()) return;
    setSalvando(true);
    try {
      await aoSalvar({ mascaraId, orgao: orgao.trim(), rotulo: rotulo.trim(), descricao: descricao.trim(), impressao: impressao.trim() });
      limpar();
      setAberto(false);
    } finally {
      setSalvando(false);
    }
  };

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="mt-2 text-xs px-2.5 py-1 rounded-full border border-dashed border-[var(--c-slate-600)] text-[var(--c-slate-400)] hover:text-[var(--c-slate-200)] hover:border-[var(--c-slate-400)]"
      >
        + Nova alteração
      </button>
    );
  }

  return (
    <form onSubmit={submeter} className="mt-2 p-3 rounded-lg bg-[var(--c-slate-900-60)] border border-[var(--c-slate-700)] flex flex-col gap-2">
      <div className="text-xs font-semibold text-[var(--c-slate-300)]">Nova alteração customizada</div>
      <input
        list={datalistId}
        placeholder={'Grupo (ex.: Fígado) — em branco vira "Personalizadas"'}
        value={orgao}
        onChange={(e) => setOrgao(e.target.value)}
        className="bg-[var(--c-slate-800)] border border-[var(--c-slate-600)] rounded px-2 py-1.5 text-xs text-[var(--c-slate-100)] outline-none focus:border-[var(--c-accent-400)]"
      />
      <datalist id={datalistId}>
        {gruposExistentes.map((g) => <option key={g} value={g} />)}
      </datalist>
      <input
        required
        placeholder="Rótulo do botão"
        value={rotulo}
        onChange={(e) => setRotulo(e.target.value)}
        className="bg-[var(--c-slate-800)] border border-[var(--c-slate-600)] rounded px-2 py-1.5 text-xs text-[var(--c-slate-100)] outline-none focus:border-[var(--c-accent-400)]"
      />
      <textarea
        required
        rows={3}
        placeholder='Frase que substitui o parágrafo (ex.: "Fígado: ...")'
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        className="bg-[var(--c-slate-800)] border border-[var(--c-slate-600)] rounded px-2 py-1.5 text-xs text-[var(--c-slate-100)] outline-none focus:border-[var(--c-accent-400)] resize-none"
      />
      <input
        placeholder="Linha da impressão (opcional)"
        value={impressao}
        onChange={(e) => setImpressao(e.target.value)}
        className="bg-[var(--c-slate-800)] border border-[var(--c-slate-600)] rounded px-2 py-1.5 text-xs text-[var(--c-slate-100)] outline-none focus:border-[var(--c-accent-400)]"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={salvando}
          className="px-3 py-1.5 rounded-md text-xs bg-[var(--c-accent-600)] hover:bg-[var(--c-accent-500)] text-white disabled:opacity-50"
        >
          {salvando ? "Salvando…" : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => { limpar(); setAberto(false); }}
          className="px-3 py-1.5 rounded-md text-xs bg-[var(--c-slate-700)] hover:bg-[var(--c-slate-600)] text-[var(--c-slate-200)]"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
