"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { UserPlus } from "lucide-react";
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
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
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
  }, [router]);

  // Filtro de pesquisa
  const usuariosFiltrados = usuarios.filter(u => {
    const termo = search.toLowerCase();
    return (
      u.nome.toLowerCase().includes(termo) ||
      u.sobrenome.toLowerCase().includes(termo) ||
      u.email.toLowerCase().includes(termo)
    );
  });

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-200">Usuários</h1>
        <Button variant="default" className="flex items-center gap-2 hover:cursor-pointer" onClick={() => setModalOpen(true)}>
          <UserPlus className="w-4 h-4" /> Novo Usuário
        </Button>
      </div>
      {/* Barra de pesquisa */}
      <div className="mb-6 flex justify-end">
        <input
          type="text"
          className="w-full max-w-xs px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100 placeholder-blue-400"
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
      <Card className="shadow-lg border border-blue-200/30 bg-gray-50 dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-blue-700">Carregando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-200">
                <thead className="bg-transparent">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-200 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-200 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-200 uppercase tracking-wider">Conta</th>
                  </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-blue-100">
                  {usuariosFiltrados.map((u) => (
                    <tr key={u.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-blue-900 dark:text-blue-100">{u.nome} {u.sobrenome}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-blue-900 dark:text-blue-100">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-blue-900 dark:text-blue-100">{u.conta || '-'}</td>
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
  );
}
