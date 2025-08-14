"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { UserPlus, Pencil, UserCog } from "lucide-react";
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
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 min-w-[340px] w-full max-w-md flex flex-col gap-4 animate-fade-in">
        <h2 className="text-2xl font-bold mb-2 text-blue-900 dark:text-blue-200 text-center">Editar Usuário</h2>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-blue-900 dark:text-blue-200" htmlFor="nome-edit">Nome</label>
          <input ref={nomeRef} id="nome-edit" className="border border-blue-200 dark:border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} required autoComplete="off" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-blue-900 dark:text-blue-200" htmlFor="sobrenome-edit">Sobrenome</label>
          <input id="sobrenome-edit" className="border border-blue-200 dark:border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" placeholder="Sobrenome" value={sobrenome} onChange={e => setSobrenome(e.target.value)} required autoComplete="off" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-blue-900 dark:text-blue-200" htmlFor="email-edit">Email</label>
          <input id="email-edit" type="email" className="border border-blue-200 dark:border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="off" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-blue-900 dark:text-blue-200" htmlFor="conta-edit">Tipo de Conta</label>
          <select
            id="conta-edit"
            className="border border-blue-200 dark:border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white dark:bg-gray-900 text-blue-900 dark:text-blue-100 hover:cursor-pointer"
            value={conta}
            onChange={e => setConta(e.target.value)}
            required
          >
            <option className="bg-white text-blue-900 dark:bg-gray-900 dark:text-blue-100" value="Admin">Admin</option>
            <option className="bg-white text-blue-900 dark:bg-gray-900 dark:text-blue-100" value="Vendedor">Vendedor</option>
          </select>
        </div>
        {erro && <div className="text-red-600 text-sm text-center mt-1">{erro}</div>}
        {success && <div className="text-green-600 text-sm text-center mt-1">Usuário editado com sucesso!</div>}
        <div className="flex gap-2 mt-2">
          <button type="button" className="flex-1 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition hover:cursor-pointer" onClick={onClose} disabled={loading}>Cancelar</button>
          <button type="submit" className="flex-1 py-2 rounded bg-blue-700 text-white hover:bg-blue-800 transition font-semibold disabled:opacity-60 hover:cursor-pointer" disabled={loading}>{loading ? "Salvando..." : "Salvar"}</button>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        const data = await res.json();
        setErro(data.error || "Erro ao criar usuário");
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
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 min-w-[340px] w-full max-w-md flex flex-col gap-4 animate-fade-in">
        <h2 className="text-2xl font-bold mb-2 text-blue-900 dark:text-blue-200 text-center">Novo Usuário</h2>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-blue-900 dark:text-blue-200" htmlFor="nome">Nome</label>
          <input ref={nomeRef} id="nome" className="border border-blue-200 dark:border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} required autoComplete="off" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-blue-900 dark:text-blue-200" htmlFor="sobrenome">Sobrenome</label>
          <input id="sobrenome" className="border border-blue-200 dark:border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" placeholder="Sobrenome" value={sobrenome} onChange={e => setSobrenome(e.target.value)} required autoComplete="off" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-blue-900 dark:text-blue-200" htmlFor="email">Email</label>
          <input id="email" type="email" className="border border-blue-200 dark:border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="off" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-blue-900 dark:text-blue-200" htmlFor="conta">Tipo de Conta</label>
          <select
            id="conta"
            className="border border-blue-200 dark:border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white dark:bg-gray-900 text-blue-900 dark:text-blue-100 hover:cursor-pointer"
            value={conta}
            onChange={e => setConta(e.target.value)}
            required
          >
            <option className="bg-white text-blue-900 dark:bg-gray-900 dark:text-blue-100" value="Admin">Admin</option>
            <option className="bg-white text-blue-900 dark:bg-gray-900 dark:text-blue-100" value="Vendedor">Vendedor</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-blue-900 dark:text-blue-200" htmlFor="senha">Senha</label>
          <input id="senha" type="password" className="border border-blue-200 dark:border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} required autoComplete="new-password" />
        </div>
        {erro && <div className="text-red-600 text-sm text-center mt-1">{erro}</div>}
        {success && <div className="text-green-600 text-sm text-center mt-1">Usuário criado com sucesso!</div>}
        <div className="flex gap-2 mt-2">
          <button type="button" className="flex-1 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition hover:cursor-pointer" onClick={onClose} disabled={loading}>Cancelar</button>
          <button type="submit" className="flex-1 py-2 rounded bg-blue-700 text-white hover:bg-blue-800 transition font-semibold disabled:opacity-60 hover:cursor-pointer" disabled={loading}>{loading ? "Salvando..." : "Salvar"}</button>
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
    return <div className="w-full flex justify-center items-center py-20 text-blue-700">Carregando...</div>;
  }

  return (
    <>
      {/* Botão de novo usuário abaixo do header global */}
      <div className="max-w-3xl mx-auto mt-4 mb-2 px-4 flex justify-end">
        <Button
          className="flex items-center gap-2 hover:cursor-pointer bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-700 dark:text-white dark:hover:bg-blue-800 border-none shadow font-semibold px-5 py-2 rounded-lg"
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
        {/* Barra de pesquisa */}
        <div className="mb-6 flex justify-end">
          <input
            type="text"
            className="w-full max-w-[360px] px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100 placeholder-blue-400"
            placeholder="Pesquisar por nome, sobrenome ou email..."
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
        <Card className="shadow-lg border border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950">
          <CardHeader>
            {/* Removido título duplicado */}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-blue-700">Carregando...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-200">
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Conta</th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider w-12">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.map((u) => (
                      <tr key={u.id} className="border-t border-gray-100 dark:border-gray-900 hover:bg-blue-50/40 dark:hover:bg-blue-900/40 transition">
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-blue-900 dark:text-blue-100">{u.nome} {u.sobrenome}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-blue-900 dark:text-blue-100">{u.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-blue-900 dark:text-blue-100">{u.conta || '-'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center align-middle">
                          <button
                            type="button"
                            className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition hover:cursor-pointer"
                            title="Editar usuário"
                            onClick={() => { setUsuarioEditando(u); setEditarModalOpen(true); }}
                          >
                            <Pencil className="w-4 h-4 text-blue-700 dark:text-blue-200 mx-auto" />
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
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
