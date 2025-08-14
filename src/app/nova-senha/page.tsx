"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NovaSenhaPage() {
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [msg, setMsg] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (senha.length < 6) {
      setMsg("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      setMsg("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    // Recupera usuário do localStorage/sessionStorage
    let user = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!user) {
      setMsg("Usuário não autenticado.");
      setLoading(false);
      router.replace("/login");
      return;
    }
    const { id } = JSON.parse(user);
    const res = await fetch("/api/nova-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, senha }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg("Senha alterada com sucesso! Redirecionando...");
      // Atualiza o campo precisa_trocar_senha no objeto salvo
      const updatedUser = { ...JSON.parse(user), precisa_trocar_senha: false };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      setTimeout(() => router.replace("/"), 1500);
    } else {
      setMsg(data.error || "Erro ao atualizar senha.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 dark:from-gray-900 dark:to-blue-950">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4 text-blue-900 dark:text-blue-200">Primeiro acesso</h1>
        <p className="mb-6 text-blue-800 dark:text-blue-300 text-center">Defina uma nova senha para continuar.</p>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block text-blue-800 dark:text-blue-200 font-semibold mb-1">Nova senha</label>
            <input
              type="password"
              className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100 placeholder-blue-400"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-blue-800 dark:text-blue-200 font-semibold mb-1">Confirmar senha</label>
            <input
              type="password"
              className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100 placeholder-blue-400"
              value={confirmar}
              onChange={e => setConfirmar(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-60 shadow-md hover:cursor-pointer"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
        {msg && <div className="text-center text-sm mt-4 text-blue-700 dark:text-blue-300">{msg}</div>}
      </div>
    </div>
  );
}
