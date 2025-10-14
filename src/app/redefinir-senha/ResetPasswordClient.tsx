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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-3 sm:px-6" style={{background: 'linear-gradient(120deg, #003153 0%, #001f35 100%)'}}>
      {/* Montanhas estilizadas */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" style={{zIndex:1}}>
        <defs>
          <linearGradient id="mountain1" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#004a7a" />
            <stop offset="1" stopColor="#003153" />
          </linearGradient>
          <linearGradient id="mountain2" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#003153" />
            <stop offset="1" stopColor="#001f35" />
          </linearGradient>
        </defs>
        <ellipse cx="400" cy="120" rx="40" ry="40" fill="rgba(255, 255, 255, 0.25)" fillOpacity="0.25" />
        <ellipse cx="650" cy="80" rx="18" ry="18" fill="rgba(255, 255, 255, 0.18)" fillOpacity="0.18" />
        <ellipse cx="120" cy="60" rx="12" ry="12" fill="rgba(255, 255, 255, 0.12)" fillOpacity="0.12" />
        <path d="M0 600 Q 200 400 400 600 T 800 600 V 600 H 0 Z" fill="url(#mountain1)" />
        <path d="M0 600 Q 300 350 600 600 T 800 600 V 600 H 0 Z" fill="url(#mountain2)" fillOpacity="0.85" />
      </svg>
      
      {/* Card de redefinir senha */}
      <div className="relative z-10 w-full max-w-md mx-auto bg-white/95 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col items-center backdrop-blur-lg">
        {/* Logo */}
        <div className="mb-4 flex justify-center">
          <img 
            src="/images/logo-texto.png" 
            alt="Logo Única" 
            className="h-14 w-auto object-contain"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center" style={{ color: '#003153' }}>Redefinir Senha</h1>
        <p className="mb-6 text-center text-sm" style={{ color: '#003153' }}>Insira o código recebido por email e defina sua nova senha.</p>
        
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="flex flex-col gap-2">
            <label className="font-semibold flex items-center gap-2 text-sm sm:text-base" style={{ color: '#003153' }}>
              Código/Token
            </label>
            <input
              id="token"
              type="text"
              className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 text-base transition-colors"
              style={{ 
                borderColor: 'rgba(0, 49, 83, 0.2)', 
                backgroundColor: 'rgba(0, 49, 83, 0.05)', 
                color: '#003153'
              }}
              onFocus={(e) => e.target.style.borderColor = '#003153'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(0, 49, 83, 0.2)'}
              placeholder="Cole aqui o código recebido"
              value={token}
              onChange={e => setToken(e.target.value)}
              required
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-semibold flex items-center gap-2 text-sm sm:text-base" style={{ color: '#003153' }}>
              Nova Senha
            </label>
            <input
              id="nova-senha"
              type="password"
              className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 text-base transition-colors"
              style={{ 
                borderColor: 'rgba(0, 49, 83, 0.2)', 
                backgroundColor: 'rgba(0, 49, 83, 0.05)', 
                color: '#003153'
              }}
              onFocus={(e) => e.target.style.borderColor = '#003153'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(0, 49, 83, 0.2)'}
              placeholder="••••••••"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
              minLength={6}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-semibold flex items-center gap-2 text-sm sm:text-base" style={{ color: '#003153' }}>
              Confirmar Senha
            </label>
            <input
              id="confirmar-senha"
              type="password"
              className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 text-base transition-colors"
              style={{ 
                borderColor: 'rgba(0, 49, 83, 0.2)', 
                backgroundColor: 'rgba(0, 49, 83, 0.05)', 
                color: '#003153'
              }}
              onFocus={(e) => e.target.style.borderColor = '#003153'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(0, 49, 83, 0.2)'}
              placeholder="••••••••"
              value={confirmar}
              onChange={e => setConfirmar(e.target.value)}
              required
              minLength={6}
            />
          </div>
          
          <button
            type="submit"
            className="w-full text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-60 shadow-md hover:cursor-pointer text-base disabled:cursor-not-allowed"
            style={{ backgroundColor: '#003153' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#002d4a'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#003153'}
            disabled={loading}
          >
            {loading ? "Redefinindo..." : "Confirmar Alteração"}
          </button>
        </form>
        
        {msg && (
          <div className="text-center text-sm mt-4 p-3 rounded-lg w-full" style={{ color: '#003153', backgroundColor: 'rgba(0, 49, 83, 0.05)' }}>
            {msg}
          </div>
        )}
        
        <div className="w-full flex justify-between mt-4 text-xs sm:text-sm" style={{ color: '#003153' }}>
          <button
            onClick={() => router.push("/login")}
            className="hover:underline"
          >
            ← Voltar ao login
          </button>
          <button
            onClick={() => router.push("/")}
            className="hover:underline"
          >
            Ir para a Home →
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-4 w-full text-center text-xs z-10 select-none px-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Designed by Christofer</div>
    </div>
  );
}