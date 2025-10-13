"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RedefinirSenhaClient() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [msg, setMsg] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = searchParams.get("token");
    if (t) setToken(t);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!token) {
      setMsg("Informe o código/token recebido por email.");
      return;
    }
    if (senha.length < 6) {
      setMsg("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      setMsg("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/password-reset", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: senha }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Senha redefinida com sucesso!");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setMsg(data.error || "Erro ao redefinir senha.");
      }
    } catch (err) {
      setMsg("Erro inesperado. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 dark:from-gray-900 dark:to-blue-950 px-3">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md flex flex-col items-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-blue-900 dark:text-blue-200 text-center">Redefinir senha</h1>
        <p className="mb-6 text-blue-800 dark:text-blue-300 text-center">Insira o código/token recebido por email e defina sua nova senha.</p>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block text-blue-800 dark:text-blue-200 font-semibold mb-1">Código/Token</label>
            <input
              id="token"
              type="text"
              className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100 placeholder-blue-400"
              value={token}
              onChange={e => setToken(e.target.value)}
              required
              placeholder="cole aqui o código"
            />
          </div>
          <div>
            <label className="block text-blue-800 dark:text-blue-200 font-semibold mb-1">Nova senha</label>
            <input
              id="nova-senha"
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
              id="confirmar-senha"
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
            {loading ? "Redefinindo..." : "Confirmar alteração"}
          </button>
        </form>
        {msg && (
          <div className="text-center text-sm mt-4 text-blue-700 dark:text-blue-300 w-full p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg">{msg}</div>
        )}
        <div className="w-full flex justify-between mt-4 text-sm">
          <button
            onClick={() => router.push("/login")}
            className="text-blue-700 hover:underline"
          >Voltar ao login</button>
          <button
            onClick={() => router.push("/")}
            className="text-blue-700 hover:underline"
          >Ir para a Home</button>
        </div>
      </div>
    </div>
  );
}