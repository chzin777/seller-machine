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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-3 sm:px-6" style={{background: 'linear-gradient(120deg, #3b82f6 0%, #1e3a8a 100%)'}}>
      {/* Montanhas estilizadas */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" style={{zIndex:1}}>
        <defs>
          <linearGradient id="mountain1" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#60a5fa" />
            <stop offset="1" stopColor="#1e40af" />
          </linearGradient>
          <linearGradient id="mountain2" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#2563eb" />
            <stop offset="1" stopColor="#1e3a8a" />
          </linearGradient>
        </defs>
        <ellipse cx="400" cy="120" rx="40" ry="40" fill="#dbeafe" fillOpacity="0.25" />
        <ellipse cx="650" cy="80" rx="18" ry="18" fill="#dbeafe" fillOpacity="0.18" />
        <ellipse cx="120" cy="60" rx="12" ry="12" fill="#dbeafe" fillOpacity="0.12" />
        <path d="M0 600 Q 200 400 400 600 T 800 600 V 600 H 0 Z" fill="url(#mountain1)" />
        <path d="M0 600 Q 300 350 600 600 T 800 600 V 600 H 0 Z" fill="url(#mountain2)" fillOpacity="0.85" />
      </svg>
      
      {/* Card de esqueci senha */}
      <div className="relative z-10 w-full max-w-md mx-auto bg-white/95 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col items-center backdrop-blur-lg">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-blue-900">Esqueci minha senha</h1>
        <p className="mb-6 text-blue-800 text-center text-sm">Digite seu email cadastrado para receber o link de redefinição.</p>
        
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="flex flex-col gap-2">
            <label className="text-blue-800 font-semibold flex items-center gap-2 text-sm sm:text-base">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 text-blue-900 placeholder-blue-400 text-base transition-colors"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-60 shadow-md hover:cursor-pointer text-base disabled:cursor-not-allowed"
          >
            {loading ? "Enviando..." : "Enviar instruções"}
          </button>
        </form>
        
        {msg && (
          <div className="text-center text-sm mt-4 text-blue-700 p-3 bg-blue-50 rounded-lg w-full">
            {msg}
          </div>
        )}
        
        <div className="w-full flex justify-center mt-4 text-xs sm:text-sm text-blue-700">
          <a href="/login" className="hover:underline">
            ← Voltar ao login
          </a>
        </div>
      </div>
      
      <div className="absolute bottom-4 w-full text-center text-xs text-blue-200 z-10 select-none px-4">Designed by Christofer</div>
    </div>
  );
}