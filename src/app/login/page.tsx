"use client";
import { useState } from "react";
import { Checkbox } from "../../components/ui/checkbox";
import { useRouter } from "next/navigation";


export default function LoginPage() {
  const [form, setForm] = useState({ email: "", senha: "" });
  const [lembrar, setLembrar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string|null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, password: form.senha }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg("Login realizado!");
      if (lembrar) {
        localStorage.setItem("user", JSON.stringify(data));
      } else {
        sessionStorage.setItem("user", JSON.stringify(data));
      }
      if (data.precisa_trocar_senha) {
        router.push("/nova-senha");
      } else {
        router.push("/");
      }
    } else {
      setMsg(data.error || "Erro ao fazer login.");
    }
    setLoading(false);
  }

  return (
  <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-3 sm:px-6" style={{background: 'linear-gradient(120deg, #003153 0%, #001f35 100%)'}}>
      {/* Logo grande como background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{zIndex: 1}}>
        <img 
          src="/images/logo.png" 
          alt="Logo Única Background" 
          className="w-80 sm:w-96 h-auto object-contain opacity-20"
          style={{
            filter: 'brightness(3) saturate(0.3)',
            transform: 'translateY(-8vh)'
          }}
        />
      </div>
      
      {/* Montanhas estilizadas */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" style={{zIndex:2}}>
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
      
      {/* Logo acima do formulário - posição absoluta */}
      <div className="absolute top-16 sm:top-20 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
        <img 
          src="/images/logo-texto.png" 
          alt="Logo Única" 
          className="h-20 sm:h-24 w-auto object-contain"
        />
      </div>

      {/* Card de login */}
  <div className="relative z-10 w-full max-w-md mx-auto bg-white/95 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col items-center backdrop-blur-lg">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center" style={{ color: '#003153' }}>Login</h1>
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="flex flex-col gap-2">
            <label className="font-semibold flex items-center gap-2 text-sm sm:text-base" style={{ color: '#003153' }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 text-base transition-colors"
              style={{ 
                borderColor: 'rgba(0, 49, 83, 0.2)', 
                backgroundColor: 'rgba(0, 49, 83, 0.05)', 
                color: '#003153'
              }}
              onFocus={(e) => e.target.style.borderColor = '#003153'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(0, 49, 83, 0.2)'}
              placeholder="user@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold flex items-center gap-2 text-sm sm:text-base" style={{ color: '#003153' }}>
              Senha
            </label>
            <input
              id="senha"
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
              value={form.senha}
              onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
              required
            />
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm" style={{ color: '#003153' }}>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={lembrar}
                onChange={e => setLembrar(e.target.checked)}
                id="lembrar"
              />
              Lembrar-me
            </label>
            <a href="/esqueci-senha" className="hover:underline">Esqueceu a senha?</a>
          </div>
          <button
            type="submit"
            className="w-full text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-60 shadow-md hover:cursor-pointer text-base disabled:cursor-not-allowed"
            style={{ backgroundColor: '#003153' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#002d4a'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#003153'}
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        {msg && (
          <div className="text-center text-sm mt-4 p-3 rounded-lg w-full" style={{ color: '#003153', backgroundColor: 'rgba(0, 49, 83, 0.05)' }}>
            {msg}
          </div>
        )}
      </div>
  <div className="absolute bottom-4 w-full text-center text-xs z-10 select-none px-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Designed by Christofer</div>
    </div>
  );
}
