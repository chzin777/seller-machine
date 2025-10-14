"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "../../components/ui/button";
import { UserPlus, Pencil, Users, Search } from "lucide-react";
import LoadingSpinner, { CardLoader, InlineLogoSpinner } from "../../components/LoadingSpinner";
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
      setNome(usuario.nome || '');
      setSobrenome(usuario.sobrenome || '');
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
        credentials: 'include',
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
        <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: '#003153' }}>Editar Usuário</h2>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: '#003153' }} htmlFor="nome-edit">Nome</label>
          <input 
            ref={nomeRef} 
            id="nome-edit" 
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 transition bg-white" 
            style={{ 
              borderColor: 'rgba(0, 49, 83, 0.3)', 
              color: '#003153',
              '--tw-ring-color': '#003153',
              '--tw-ring-opacity': '0.5'
            } as any}
            placeholder="Nome" 
            value={nome} 
            onChange={e => setNome(e.target.value)} 
            required 
            autoComplete="off" 
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: '#003153' }} htmlFor="sobrenome-edit">Sobrenome</label>
          <input 
            id="sobrenome-edit" 
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 transition bg-white" 
            style={{ 
              borderColor: 'rgba(0, 49, 83, 0.3)', 
              color: '#003153',
              '--tw-ring-color': '#003153',
              '--tw-ring-opacity': '0.5'
            } as any}
            placeholder="Sobrenome" 
            value={sobrenome} 
            onChange={e => setSobrenome(e.target.value)} 
            required 
            autoComplete="off" 
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: '#003153' }} htmlFor="email-edit">Email</label>
          <input 
            id="email-edit" 
            type="email" 
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 transition bg-white" 
            style={{ 
              borderColor: 'rgba(0, 49, 83, 0.3)', 
              color: '#003153',
              '--tw-ring-color': '#003153',
              '--tw-ring-opacity': '0.5'
            } as any}
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            autoComplete="off" 
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: '#003153' }} htmlFor="conta-edit">Tipo de Conta</label>
          <select
            id="conta-edit"
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 transition bg-white hover:cursor-pointer"
            style={{ 
              borderColor: 'rgba(0, 49, 83, 0.3)', 
              color: '#003153',
              '--tw-ring-color': '#003153',
              '--tw-ring-opacity': '0.5'
            } as any}
            value={conta}
            onChange={e => setConta(e.target.value)}
            required
          >
            <option className="bg-white" style={{ color: '#003153' }} value="Admin">Admin</option>
            <option className="bg-white" style={{ color: '#003153' }} value="Vendedor">Vendedor</option>
          </select>
        </div>
        {erro && <div className="text-red-600 text-sm text-center mt-1">{erro}</div>}
        {success && <div className="text-green-600 text-sm text-center mt-1">Usuário editado com sucesso!</div>}
        <div className="flex gap-2 mt-2">
          <button type="button" className="flex-1 py-2 rounded bg-gray-200 hover:bg-gray-300 transition hover:scale-105 hover:cursor-pointer" onClick={onClose} disabled={loading}>Cancelar</button>
          <button 
            type="submit" 
            className="flex-1 py-2 rounded text-white transition font-semibold disabled:opacity-60 hover:scale-105 hover:cursor-pointer" 
            style={{ 
              backgroundColor: loading ? '#6b7280' : '#003153',
              ':hover': !loading ? { backgroundColor: '#004a6b' } : {}
            } as any}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <InlineLogoSpinner size={16} />
                Salvando...
              </div>
            ) : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
// Modal profissional para cadastro de usuário
import { useRef } from "react";
function NovoUsuarioModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("VENDEDOR");
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [diretoriaId, setDiretoriaId] = useState<number | null>(null);
  const [regionalId, setRegionalId] = useState<number | null>(null);
  const [filialId, setFilialId] = useState<number | null>(null);
  const [area, setArea] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Estados para dados hierárquicos
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [diretorias, setDiretorias] = useState<any[]>([]);
  const [regionais, setRegionais] = useState<any[]>([]);
  const [filiais, setFiliais] = useState<any[]>([]);
  
  const nomeRef = useRef<HTMLInputElement>(null);

  // Carregar empresas ao abrir o modal
  useEffect(() => {
    if (open) {
      fetchEmpresas();
      if (nomeRef.current) {
        nomeRef.current.focus();
      }
    }
    if (!open) {
      // Reset form
      setName(""); setEmail(""); setPassword(""); setRole("VENDEDOR"); 
      setEmpresaId(null); setDiretoriaId(null); setRegionalId(null); setFilialId(null); setArea("");
      setErro(""); setSuccess(false);
      setEmpresas([]); setDiretorias([]); setRegionais([]); setFiliais([]);
    }
  }, [open]);

  // Carregar diretorias quando empresa é selecionada
  useEffect(() => {
    if (empresaId) {
      fetchDiretorias(empresaId);
      setDiretoriaId(null); setRegionalId(null); setFilialId(null);
    } else {
      setDiretorias([]); setRegionais([]); setFiliais([]);
    }
  }, [empresaId]);

  // Carregar regionais quando diretoria é selecionada
  useEffect(() => {
    if (diretoriaId) {
      fetchRegionais(diretoriaId);
      setRegionalId(null); setFilialId(null);
    } else {
      setRegionais([]); setFiliais([]);
    }
  }, [diretoriaId]);

  // Carregar filiais quando regional é selecionada
  useEffect(() => {
    if (regionalId) {
      fetchFiliais(regionalId);
      setFilialId(null);
    } else {
      setFiliais([]);
    }
  }, [regionalId]);

  const fetchEmpresas = async () => {
    try {
      const res = await fetch('/api/hierarchy/empresas', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setEmpresas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const fetchDiretorias = async (empresaId: number) => {
    try {
      const res = await fetch(`/api/hierarchy/diretorias?empresaId=${empresaId}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setDiretorias(data);
      }
    } catch (error) {
      console.error('Erro ao carregar diretorias:', error);
    }
  };

  const fetchRegionais = async (diretoriaId: number) => {
    try {
      const res = await fetch(`/api/hierarchy/regionais?diretoriaId=${diretoriaId}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setRegionais(data);
      }
    } catch (error) {
      console.error('Erro ao carregar regionais:', error);
    }
  };

  const fetchFiliais = async (regionalId: number) => {
    try {
      const res = await fetch(`/api/hierarchy/filiais?regionalId=${regionalId}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setFiliais(data);
      }
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErro("");
    setSuccess(false);
    
    if (!name.trim() || !email.trim() || !password.trim() || !role || !empresaId || !diretoriaId) {
      setErro("Nome, email, senha, perfil, empresa e diretoria são obrigatórios.");
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch("/api/users", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          role,
          empresaId,
          diretoriaId,
          regionalId,
          filialId,
          area: area.trim() || null
        }),
      });
      
      if (!res.ok) {
        let data;
        try {
          data = await res.json();
        } catch (e) {
          data = { error: res.statusText };
        }
        setErro((data && data.error) || "Erro ao criar usuário");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col gap-4 animate-fade-in">
        <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: '#003153' }}>Novo Usuário</h2>
        
        {/* Informações Básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: '#003153' }} htmlFor="name">Nome Completo *</label>
            <input 
              ref={nomeRef} 
              id="name" 
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 transition bg-white" 
              style={{ 
                borderColor: 'rgba(0, 49, 83, 0.3)', 
                color: '#003153',
                '--tw-ring-color': '#003153',
                '--tw-ring-opacity': '0.5'
              } as any}
              placeholder="Nome completo" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              autoComplete="off" 
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: '#003153' }} htmlFor="email">Email *</label>
            <input 
              id="email" 
              type="email" 
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 transition bg-white" 
              style={{ 
                borderColor: 'rgba(0, 49, 83, 0.3)', 
                color: '#003153',
                '--tw-ring-color': '#003153',
                '--tw-ring-opacity': '0.5'
              } as any}
              placeholder="Email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              autoComplete="off" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: '#003153' }} htmlFor="password">Senha *</label>
            <input 
              id="password" 
              type="password" 
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 transition bg-white" 
              style={{ 
                borderColor: 'rgba(0, 49, 83, 0.3)', 
                color: '#003153',
                '--tw-ring-color': '#003153',
                '--tw-ring-opacity': '0.5'
              } as any}
              placeholder="Senha (mín. 6 caracteres)" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              autoComplete="new-password" 
              minLength={6}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: '#003153' }} htmlFor="role">Perfil *</label>
            <select
              id="role"
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 transition bg-white hover:cursor-pointer"
              style={{ 
                borderColor: 'rgba(0, 49, 83, 0.3)', 
                color: '#003153',
                '--tw-ring-color': '#003153',
                '--tw-ring-opacity': '0.5'
              } as any}
              value={role}
              onChange={e => setRole(e.target.value)}
              required
            >
              <option value="VENDEDOR">Vendedor</option>
              <option value="GESTOR_I">Gestor I (Filial)</option>
              <option value="GESTOR_II">Gestor II (Regional)</option>
              <option value="GESTOR_III">Gestor III (Diretor)</option>
              <option value="GESTOR_MASTER">Gestor Master (Admin)</option>
            </select>
          </div>
        </div>

        {/* Hierarquia Organizacional */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#003153' }}>Hierarquia Organizacional</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-blue-900" htmlFor="empresa">Empresa</label>
              <select
                id="empresa"
                className="border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white text-blue-900 hover:cursor-pointer"
                value={empresaId || ""}
                onChange={e => setEmpresaId(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">Selecione uma empresa</option>
                {empresas.map(empresa => (
                  <option key={empresa.id} value={empresa.id}>{empresa.razaoSocial}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-blue-900" htmlFor="diretoria">Diretoria</label>
              <select
                id="diretoria"
                className="border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white text-blue-900 hover:cursor-pointer"
                value={diretoriaId || ""}
                onChange={e => setDiretoriaId(e.target.value ? parseInt(e.target.value) : null)}
                disabled={!empresaId}
              >
                <option value="">Selecione uma diretoria</option>
                {diretorias.map(diretoria => (
                  <option key={diretoria.id} value={diretoria.id}>{diretoria.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-blue-900" htmlFor="regional">Regional</label>
              <select
                id="regional"
                className="border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white text-blue-900 hover:cursor-pointer"
                value={regionalId || ""}
                onChange={e => setRegionalId(e.target.value ? parseInt(e.target.value) : null)}
                disabled={!diretoriaId}
              >
                <option value="">Selecione uma regional</option>
                {regionais.map(regional => (
                  <option key={regional.id} value={regional.id}>{regional.nome}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-blue-900" htmlFor="filial">Filial</label>
              <select
                id="filial"
                className="border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white text-blue-900 hover:cursor-pointer"
                value={filialId || ""}
                onChange={e => setFilialId(e.target.value ? parseInt(e.target.value) : null)}
                disabled={!regionalId}
              >
                <option value="">Selecione uma filial</option>
                {filiais.map(filial => (
                  <option key={filial.id} value={filial.id}>{filial.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-blue-900" htmlFor="area">Área</label>
              <input 
                id="area" 
                className="border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white text-blue-900" 
                placeholder="Área de atuação (opcional)" 
                value={area} 
                onChange={e => setArea(e.target.value)} 
                autoComplete="off" 
              />
            </div>
          </div>
        </div>

        {erro && <div className="text-red-600 text-sm text-center mt-1 bg-red-50 p-2 rounded">{erro}</div>}
        {success && <div className="text-green-600 text-sm text-center mt-1 bg-green-50 p-2 rounded">Usuário criado com sucesso!</div>}
        
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <button 
            type="button" 
            className="flex-1 py-2 rounded bg-gray-200 hover:bg-gray-300 transition hover:scale-105 hover:cursor-pointer" 
            onClick={onClose} 
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="flex-1 py-2 rounded text-white transition font-semibold disabled:opacity-60 hover:scale-105 hover:cursor-pointer" 
            style={{ 
              backgroundColor: loading ? '#6b7280' : '#003153',
              ':hover': !loading ? { backgroundColor: '#004a6b' } : {}
            } as any}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <InlineLogoSpinner size={16} />
                Salvando...
              </div>
            ) : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}


interface Usuario {
  id: number;
  nome?: string;
  sobrenome?: string;
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

  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    async function fetchUsuarios() {
      setLoading(true);
      try {
        const res = await fetch("/api/users", {
          credentials: 'include'
        });
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
  }, [isClient]);

  // Filtro de pesquisa
  const usuariosFiltrados = usuarios.filter(u => {
    const termo = search.toLowerCase();
    return (
      (u.nome || '').toLowerCase().includes(termo) ||
      (u.sobrenome || '').toLowerCase().includes(termo) ||
      (u.email || '').toLowerCase().includes(termo)
    );
  });



  return (
    <>
      {/* Título da página */}
      <div className="flex items-center gap-3 mb-8 mt-16 sm:mt-0 max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl shadow" style={{ backgroundColor: '#003153', color: '#ffffff' }}>
          <Users className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold leading-tight" style={{ color: '#003153' }}>Usuários</h1>
          <p className="text-gray-600 text-sm mt-1">Gerencie os usuários cadastrados e suas permissões de acesso.</p>
        </div>
      </div>
      {/* Botão de novo usuário abaixo do header global */}
      <div className="max-w-3xl mx-auto mt-4 mb-2 px-4 flex justify-end">
        <Button
          className="flex items-center gap-2 hover:cursor-pointer border-none shadow font-semibold px-5 py-2 rounded-lg transition-transform hover:scale-105"
          style={{ 
            backgroundColor: 'rgba(0, 49, 83, 0.1)', 
            color: '#003153',
            ':hover': { backgroundColor: 'rgba(0, 49, 83, 0.15)' }
          } as any}
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
              const res = await fetch("/api/users", {
                credentials: 'include'
              });
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
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm w-full focus:outline-none focus:ring-2 text-base transition"
            style={{ 
              color: '#003153',
              '--tw-ring-color': '#003153',
              '--tw-ring-opacity': '0.5',
              borderColor: 'rgba(0, 49, 83, 0.2)'
            } as any}
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
              const res = await fetch("/api/users", {
                credentials: 'include'
              });
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
              <CardLoader text="Carregando usuários..." />
            ) : usuariosFiltrados.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-xl shadow border border-gray-100" style={{ color: '#003153' }}>Nenhum usuário encontrado.</div>
            ) : (
              usuariosFiltrados.map((u) => (
                <div key={u.id} className="rounded-xl shadow-lg border border-gray-100 bg-white p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold" style={{ color: '#003153' }}>{u.nome || ''} {u.sobrenome || ''}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs mb-1">
                    <span className="rounded px-2 py-1" style={{ backgroundColor: 'rgba(0, 49, 83, 0.05)', color: '#003153' }}>Email: <b>{u.email}</b></span>
                    <span className="rounded px-2 py-1" style={{ backgroundColor: 'rgba(0, 49, 83, 0.05)', color: '#003153' }}>Conta: <b>{u.conta || '-'}</b></span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      className="flex-1 py-2 rounded font-semibold transition hover:scale-105 hover:cursor-pointer"
                      style={{ 
                        backgroundColor: 'rgba(0, 49, 83, 0.1)', 
                        color: '#003153',
                        ':hover': { backgroundColor: 'rgba(0, 49, 83, 0.15)' }
                      } as any}
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
                <tr style={{ backgroundColor: 'rgba(0, 49, 83, 0.05)', color: '#003153' }}>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Conta</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider w-12">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-8">
                      <CardLoader text="Carregando lista de usuários..." />
                    </td>
                  </tr>
                ) : usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8" style={{ color: '#003153' }}>Nenhum usuário encontrado.</td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((u) => (
                    <tr key={u.id} className="border-t border-gray-100 hover:bg-blue-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap font-semibold" style={{ color: '#003153' }}>{u.nome || ''} {u.sobrenome || ''}</td>
                      <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#003153' }}>{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#003153' }}>{u.conta || '-'}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-center align-middle">
                        <button
                          type="button"
                          className="p-1 rounded transition hover:scale-110 hover:cursor-pointer"
                          style={{ ':hover': { backgroundColor: 'rgba(0, 49, 83, 0.1)' } } as any}
                          title="Editar usuário"
                          onClick={() => { setUsuarioEditando(u); setEditarModalOpen(true); }}
                        >
                          <Pencil className="w-4 h-4 mx-auto" style={{ color: '#003153' }} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

          </div>
        </div>
      </div>
    </>
  );
}
