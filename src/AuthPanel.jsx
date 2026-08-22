import { useState } from "react";
import { criarConta, entrar, sair } from "./nuvem.js";

const traduzErro = (e) => {
  const c = e?.code || "";
  if (c.includes("email-already-in-use")) return "Já existe uma conta com esse e-mail. Tente entrar.";
  if (c.includes("invalid-credential") || c.includes("wrong-password") || c.includes("user-not-found")) return "E-mail ou senha incorretos.";
  if (c.includes("weak-password")) return "Senha muito curta (mínimo 6 caracteres).";
  if (c.includes("invalid-email")) return "E-mail inválido.";
  return "Não foi possível completar. Tente novamente.";
};

export default function AuthPanel({ usuario }) {
  const [aberto, setAberto] = useState(false);
  const [modo, setModo] = useState("entrar"); // "entrar" | "criar"
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  if (usuario) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-300">
        <span className="w-2 h-2 rounded-full bg-emerald-400" title="Sincronizado na nuvem" />
        <span className="hidden sm:inline">{usuario.email}</span>
        <button
          onClick={() => sair()}
          className="px-2 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200"
        >
          Sair
        </button>
      </div>
    );
  }

  const submeter = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      if (modo === "criar") await criarConta(email, senha);
      else await entrar(email, senha);
      setAberto(false);
      setEmail("");
      setSenha("");
    } catch (e2) {
      setErro(traduzErro(e2));
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setAberto((v) => !v)}
        className="flex items-center gap-2 px-2 py-1 rounded-md text-xs bg-slate-700 hover:bg-slate-600 text-slate-200"
      >
        <span className="w-2 h-2 rounded-full bg-slate-500" title="Salvando só neste navegador" />
        Entrar (backup na nuvem)
      </button>
      {aberto && (
        <div className="absolute right-0 mt-1 w-64 bg-slate-800 border border-slate-600 rounded-lg shadow-lg p-3 z-20">
          <div className="flex gap-1 mb-2 text-xs">
            <button
              onClick={() => setModo("entrar")}
              className={"flex-1 py-1 rounded " + (modo === "entrar" ? "bg-sky-600 text-white" : "bg-slate-700 text-slate-300")}
            >
              Entrar
            </button>
            <button
              onClick={() => setModo("criar")}
              className={"flex-1 py-1 rounded " + (modo === "criar" ? "bg-sky-600 text-white" : "bg-slate-700 text-slate-300")}
            >
              Criar conta
            </button>
          </div>
          <form onSubmit={submeter} className="flex flex-col gap-2">
            <input
              type="email"
              required
              placeholder="e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-sky-400"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-sky-400"
            />
            {erro && <div className="text-xs text-red-400">{erro}</div>}
            <button
              type="submit"
              disabled={carregando}
              className="px-3 py-1.5 rounded-md text-sm bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-50"
            >
              {carregando ? "Aguarde…" : modo === "criar" ? "Criar conta" : "Entrar"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
