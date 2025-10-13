"use client";
import { useState } from "react";
// removido: import { useRouter } from "next/navigation";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  // removido: const [devToken, setDevToken] = useState<string|undefined>(undefined);
  // removido: const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    // removido: setDevToken(undefined);
    if (!email) {
      setMsg("Informe seu email cadastrado.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(data.message || "Se o email existir, você receberá instruções para redefinir sua senha.");
        // removido: if (data.resetToken) { setDevToken(data.resetToken); }
      } else {
        setMsg(data.error || "Erro ao enviar instruções de redefinição.");
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
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-blue-900 dark:text-blue-200 text-center">Esqueci minha senha</h1>
        <p className="mb-6 text-blue-800 dark:text-blue-300 text-center">Digite seu email cadastrado para receber o link de redefinição.</p>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block text-blue-800 dark:text-blue-200 font-semibold mb-1">Email</label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100 placeholder-blue-400"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="seuemail@exemplo.com"
            />
          </div>
          {/* removido: campo opcional de telefone */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Enviando..." : "Enviar instruções"}
          </button>
        </form>
        {msg && (
          <div className="text-center text-sm mt-4 text-blue-700 p-3 bg-blue-50 rounded-lg w-full">
            {msg}
          </div>
        )}
        {/* removido: bloco de exibição do token de desenvolvimento */}
      </div>
    </div>
  );
}