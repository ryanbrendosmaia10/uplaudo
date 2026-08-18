{/* Onde renderiza a lista de alterações no modo por cliques: */}
<div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 p-3 overflow-y-auto min-h-48">
  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
    Alterações
  </div>
  {(!ALTERACOES[cliquesExameId] || ALTERACOES[cliquesExameId].length === 0) ? (
    <div className="text-sm text-slate-500">
      Sem alterações cadastradas para este exame. Você pode editar o laudo diretamente no editor ao lado.
    </div>
  ) : (
    <div className="space-y-3">
      {ALTERACOES[cliquesExameId].map((grupo) => (
        <div key={grupo.orgao}>
          <div className="text-xs font-semibold text-slate-400 mb-1">{grupo.orgao}</div>
          <div className="flex flex-wrap gap-1.5">
            {grupo.itens.map((item) => {
              const selecionado = cliquesChips.some(
                (a) => chaveAlteracao(a.orgao, a.rotulo) === chaveAlteracao(grupo.orgao, item.rotulo)
              );
              return (
                <button
                  key={item.rotulo}
                  onClick={() => toggleChipCliques(grupo.orgao, item)}
                  className={
                    "px-2.5 py-1 rounded-full text-xs border transition " +
                    (selecionado
                      ? "bg-sky-500 border-sky-400 text-slate-900 font-semibold"
                      : "bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600")
                  }
                >
                  {selecionado ? "✓ " : ""}{item.rotulo}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  )}
</div>
