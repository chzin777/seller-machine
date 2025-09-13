"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "../../components/ui/button";
import { UserPlus, Pencil, Users, Search } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
// import Header from "../../components/header";
// Modal para editar usuário
function EditarUsuarioModal({ open, onClose, onSuccess, usuario }: { open: boolean; onClose: () => void; onSuccess: () => void; usuario: Usuario | null }) {
  const [nome, setNome] = useState(usuario?.nome || "");
  const [sobrenome, setSobrenome] = useState(usuario?.sobrenome || "");
  const [email, setEmail] = useState(usuario?.email || "");
  const [conta, setConta] = useState(usuario?.conta || "Vendedor");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [success, setSuccess] = useState(false);
  const nomeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && nomeRef.current) {
      nomeRef.current.focus();
    }
    if (open && usuario) {
      setNome(usuario.nome);
      setSobrenome(usuario.sobrenome);
      setEmail(usuario.email);
      setConta(usuario.conta || "Vendedor");
      setErro("");
      setSuccess(false);
    }
    if (!open) {
      setErro(""); setSuccess(false);
    }
  }, [open, usuario]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    setSuccess(false);
    if (!nome.trim() || !sobrenome.trim() || !email.trim() || !conta.trim()) {
      setErro("Preencha todos os campos obrigatórios.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: usuario?.id, nome, sobrenome, email, conta }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErro(data.error || "Erro ao editar usuário");
      } else {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onSuccess();
          onClose();
        }, 1200);
      }
    } catch {
      setErro("Erro ao editar usuário");
    } finally {
      setLoading(false);
    }
  };

  if (!open || !usuario) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl p-8 min-w-[340px] w-full max-w-md flex flex-col gap-4 animate-fade-in">
        <h2 className="text-2xl font-bold mb-2 text-blue-900 text-center">Editar Usuário</h2>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-blue-900" htmlFor="nome-edit">Nome</label>
          <input ref={nomeRef} id="nome-edit" className="border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white text-blue-900" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} required autoComplete="off" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-blue-900" htmlFor="sobrenome-edit">Sobrenome</label>
          <input id="sobrenome-edit" className="border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white text-blue-900" placeholder="Sobrenome" value={sobrenome} onChange={e => setSobrenome(e.target.value)} required autoComplete="off" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-blue-900" htmlFor="email-edit">Email</label>
          <input id="email-edit" type="email" className="border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white text-blue-900" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="off" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-blue-900" htmlFor="conta-edit">Tipo de Conta</label>
          <select
            id="conta-edit"
            className="border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white text-blue-900 hover:cursor-pointer"
            value={conta}
            onChange={e => setConta(e.target.value)}
            required
          >
            <option className="bg-white text-blue-900" value="Admin">Admin</option>
            <option className="bg-white text-blue-900" value="Vendedor">Vendedor</option>
          </select>
        </div>
        {erro && <div className="text-red-600 text-sm text-center mt-1">{erro}</div>}
        {success && <div className="text-green-600 text-sm text-center mt-1">Usuário editado com sucesso!</div>}
        <div className="flex gap-2 mt-2">
          <button type="button" className="flex-1 py-2 rounded bg-gray-200 hover:bg-gray-300 transition hover:scale-105 hover:cursor-pointer" onClick={onClose} disabled={loading}>Cancelar</button>
          <button type="submit" className="flex-1 py-2 rounded bg-blue-700 text-white hover:bg-blue-800 transition font-semibold disabled:opacity-60 hover:scale-105 hover:cursor-pointer" disabled={loading}>{loading ? "Salvando..." : "Salvar"}</button>
        </div>
      </form>
    </div>
  );
}
// Modal profissional para cadastro de usuário
import { useRef } from "react";
function NovoUsuarioModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [conta, setConta] = useState("Vendedor");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [success, setSuccess] = useState(false);
  const nomeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && nomeRef.current) {
      nomeRef.current.focus();
    }
    if (!open) {
      setNome(""); setSobrenome(""); setEmail(""); setConta("Vendedor"); setSenha(""); setErro(""); setSuccess(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    setLoading(true);
    setErro("");
    setSuccess(false);
    if (!nome.trim() || !sobrenome.trim() || !email.trim() || !senha.trim()) {
      setErro("Preencha todos os campos obrigatórios.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/users", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, sobrenome, email, conta, senha }),
      });
      if (!res.ok) {
        let data;
        try {
          data = await res.json();
        } catch (e) {
          data = { error: res.statusText };
        }
        setErro((data && data.error) || "Erro ao criar usuário");
        // Log detalhado para debug
        console.error("Erro ao criar usuário:", data, res.status, res.statusText);
      } else {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onSuccess();
          onClose();
        }, 1200);
      }
    } catch {
      setErro("Erro ao criar usuário");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="bg-white rounded-xl shadow-2xl p-8 min-w-[340px] w-full max-w-md flex flex-col gap-4 animate-fade-in">
        <h2 className="text-2xl font-bold mb-2 text-blue-900 text-center">Novo Usuário</h2>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-blue-900" htmlFor="nome">Nome</label>
          <input ref={nomeRef} id="nome" className="border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white text-blue-900" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} required autoComplete="off" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-blue-900" htmlFor="sobrenome">Sobrenome</label>
          <input id="sobrenome" className="border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white text-blue-900" placeholder="Sobrenome" value={sobrenome} onChange={e => setSobrenome(e.target.value)} required autoComplete="off" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-blue-900" htmlFor="email">Email</label>
          <input id="email" type="email" className="border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white text-blue-900" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="off" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-blue-900" htmlFor="conta">Tipo de Conta</label>
          <select
            id="conta"
            className="border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white text-blue-900 hover:cursor-pointer"
            value={conta}
            onChange={e => setConta(e.target.value)}
            required
          >
            <option className="bg-white text-blue-900" value="Admin">Admin</option>
            <option className="bg-white text-blue-900" value="Vendedor">Vendedor</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-blue-900" htmlFor="senha">Senha</label>
          <input id="senha" type="password" className="border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white text-blue-900" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} required autoComplete="new-password" />
        </div>
        {erro && <div className="text-red-600 text-sm text-center mt-1">{erro}</div>}
        {success && <div className="text-green-600 text-sm text-center mt-1">Usuário criado com sucesso!</div>}
        <div className="flex gap-2 mt-2">
          <button type="button" className="flex-1 py-2 rounded bg-gray-200 hover:bg-gray-300 transition hover:scale-105 hover:cursor-pointer" onClick={onClose} disabled={loading}>Cancelar</button>
          <button type="submit" className="flex-1 py-2 rounded bg-blue-700 text-white hover:bg-blue-800 transition font-semibold disabled:opacity-60 hover:scale-105 hover:cursor-pointer" disabled={loading}>{loading ? "Salvando..." : "Salvar"}</button>
        </div>
      </form>
    </div>
  );
}


interface Usuario {
  id: number;
  nome: string;
  sobrenome: string;
  email: string;
  conta?: string;
}

export default function UsuariosPage() {
  const [editarModalOpen, setEditarModalOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    let user = localStorage.getItem("user");
    if (!user) {
      user = sessionStorage.getItem("user");
    }
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.conta !== "Admin") {
          router.replace("/");
          return;
        }
      } catch {}
    } else {
      router.replace("/login");
      return;
    }
    async function fetchUsuarios() {
      setLoading(true);
      try {
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error("Erro ao buscar usuários");
        const data = await res.json();
        setUsuarios(data || []);
      } catch (e) {
        setUsuarios([]);
      } finally {
        setLoading(false);
      }
    }
    fetchUsuarios();
    setAuthChecked(true);
  }, [router, isClient]);

  // Filtro de pesquisa
  const usuariosFiltrados = usuarios.filter(u => {
    const termo = search.toLowerCase();
    return (
      u.nome.toLowerCase().includes(termo) ||
      u.sobrenome.toLowerCase().includes(termo) ||
      u.email.toLowerCase().includes(termo)
    );
  });

  if (!authChecked) {
    return <LoadingSpinner size="full" text="Carregando página..." />;
  }

  return (
    <>
      {/* Título da página */}
      <div className="flex items-center gap-3 mb-8 mt-16 sm:mt-0 max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-700 shadow">
          <Users className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold leading-tight text-blue-900">Usuários</h1>
          <p className="text-gray-600 text-sm mt-1">Gerencie os usuários cadastrados e suas permissões de acesso.</p>
        </div>
      </div>
      {/* Botão de novo usuário abaixo do header global */}
      <div className="max-w-3xl mx-auto mt-4 mb-2 px-4 flex justify-end">
        <Button
          className="flex items-center gap-2 hover:cursor-pointer bg-blue-100 text-blue-700 hover:bg-blue-200 border-none shadow font-semibold px-5 py-2 rounded-lg transition-transform hover:scale-105"
          onClick={() => setModalOpen(true)}
        >
          <UserPlus className="w-5 h-5" /> Novo Usuário
        </Button>
      </div>
      <div className="max-w-3xl mx-auto py-0 px-4">
        <EditarUsuarioModal
          open={editarModalOpen}
          onClose={() => setEditarModalOpen(false)}
          onSuccess={async () => {
            setLoading(true);
            try {
              const res = await fetch("/api/users");
              if (!res.ok) throw new Error("Erro ao buscar usuários");
              const data = await res.json();
              setUsuarios(data || []);
            } catch {
              setUsuarios([]);
            } finally {
              setLoading(false);
            }
          }}
          usuario={usuarioEditando}
        />
        {/* Barra de pesquisa igual clientes */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            className="pl-10 pr-4 py-2 rounded-lg border border-blue-200 bg-white shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-base transition text-blue-900"
            placeholder="Buscar usuário..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <NovoUsuarioModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={() => {
          // Recarrega usuários após cadastro
          (async () => {
            setLoading(true);
            try {
              const res = await fetch("/api/users");
              if (!res.ok) throw new Error("Erro ao buscar usuários");
              const data = await res.json();
              setUsuarios(data || []);
            } catch {
              setUsuarios([]);
            } finally {
              setLoading(false);
            }
          })();
        }} />
        {/* Mobile: Cards, Desktop: Tabela */}
        <div className="mt-4">
          {/* Mobile: Cards */}
          <div className="flex flex-col gap-4 sm:hidden">
            {loading ? (
              <div className="text-center py-8 text-blue-700">Carregando...</div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className="text-center py-8 text-blue-700 bg-white rounded-xl shadow border border-gray-100">Nenhum usuário encontrado.</div>
            ) : (
              usuariosFiltrados.map((u) => (
                <div key={u.id} className="rounded-xl shadow-lg border border-gray-100 bg-white p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-blue-800">{u.nome} {u.sobrenome}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs mb-1">
                    <span className="bg-blue-50 text-blue-900 rounded px-2 py-1">Email: <b>{u.email}</b></span>
                    <span className="bg-blue-50 text-blue-900 rounded px-2 py-1">Conta: <b>{u.conta || '-'}</b></span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      className="flex-1 py-2 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold transition hover:scale-105 hover:cursor-pointer"
                      title="Editar usuário"
                      onClick={() => { setUsuarioEditando(u); setEditarModalOpen(true); }}
                    >
                      <Pencil className="w-4 h-4 mx-auto" /> Editar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Desktop: Tabela */}
          <div className="hidden sm:block overflow-x-auto rounded-xl shadow-lg bg-white border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-50 text-blue-900">
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Conta</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider w-12">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((u) => (
                  <tr key={u.id} className="border-t border-gray-100 hover:bg-blue-50/40 transition">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-blue-900">{u.nome} {u.sobrenome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-blue-900">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-blue-900">{u.conta || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center align-middle">
                      <button
                        type="button"
                        className="p-1 rounded hover:bg-blue-100 transition hover:scale-110 hover:cursor-pointer"
                        title="Editar usuário"
                        onClick={() => { setUsuarioEditando(u); setEditarModalOpen(true); }}
                      >
                        <Pencil className="w-4 h-4 text-blue-700 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {usuariosFiltrados.length === 0 && (
              <div className="text-center py-8 text-blue-700">Nenhum usuário encontrado.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
