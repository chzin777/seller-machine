"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

import { Button } from "../../components/ui/button";
import { UserPlus, Pencil, Users, Search } from "lucide-react";
import LoadingSpinner, { CardLoader, InlineLogoSpinner } from "../../components/LoadingSpinner";
// import Header from "../../components/header";
// Modal para editar usuário
function EditarUsuarioModal({ open, onClose, onSuccess, usuario }: { open: boolean; onClose: () => void; onSuccess: () => void; usuario: Usuario | null }) {
  const [name, setName] = useState(usuario?.name || "");
  const [email, setEmail] = useState(usuario?.email || "");
  const [cpf, setCpf] = useState(usuario?.cpf || "");
  const [role, setRole] = useState(usuario?.role || "VENDEDOR");
  const [active, setActive] = useState(usuario?.active !== false);
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [diretoriaId, setDiretoriaId] = useState<number | null>(null);
  const [regionalId, setRegionalId] = useState<number | null>(null);
  const [filialId, setFilialId] = useState<number | null>(null);
  const [area, setArea] = useState<string>("");
  const [telefone, setTelefone] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Estados para dados hierárquicos
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [diretorias, setDiretorias] = useState<any[]>([]);
  const [regionais, setRegionais] = useState<any[]>([]);
  const [filiais, setFiliais] = useState<any[]>([]);
  
  const nomeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && nomeRef.current) {
      nomeRef.current.focus();
    }
    if (open && usuario) {
      setName(usuario.name || '');
      setEmail(usuario.email);
      setCpf(usuario.cpf || '');
      setRole(usuario.role || "VENDEDOR");
      setActive(usuario.active !== false);
      setEmpresaId(usuario.empresaId || null);
      setDiretoriaId(usuario.diretoriaId || null);
      setRegionalId(usuario.regionalId || null);
      setFilialId(usuario.filialId || null);
      setArea(usuario.area || "");
      setTelefone(usuario.telefone || "");
      setErro("");
      setSuccess(false);
      
      // Carregar dados hierárquicos
      fetchEmpresas();
    }
    if (!open) {
      // Reset form
      setName(""); setEmail(""); setCpf(""); setRole("VENDEDOR"); setActive(true);
      setEmpresaId(null); setDiretoriaId(null); setRegionalId(null); setFilialId(null);
      setArea(""); setTelefone("");
      setErro(""); setSuccess(false);
      setEmpresas([]); setDiretorias([]); setRegionais([]); setFiliais([]);
    }
  }, [open, usuario]);

  // Carregar diretorias quando empresa é selecionada
  useEffect(() => {
    if (empresaId) {
      fetchDiretorias(empresaId);
      if (empresaId !== usuario?.empresaId) {
        setDiretoriaId(null); setRegionalId(null); setFilialId(null);
      }
    } else {
      setDiretorias([]); setRegionais([]); setFiliais([]);
    }
  }, [empresaId, usuario?.empresaId]);

  // Carregar regionais quando diretoria é selecionada
  useEffect(() => {
    if (diretoriaId) {
      fetchRegionais(diretoriaId);
      if (diretoriaId !== usuario?.diretoriaId) {
        setRegionalId(null); setFilialId(null);
      }
    } else {
      setRegionais([]); setFiliais([]);
    }
  }, [diretoriaId, usuario?.diretoriaId]);

  // Carregar filiais quando regional é selecionada
  useEffect(() => {
    if (regionalId) {
      fetchFiliais(regionalId);
      if (regionalId !== usuario?.regionalId) {
        setFilialId(null);
      }
    } else {
      setFiliais([]);
    }
  }, [regionalId, usuario?.regionalId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    setSuccess(false);
    
    if (!name.trim() || !email.trim() || !role.trim()) {
      setErro("Nome, email e perfil são obrigatórios.");
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ 
          id: usuario?.id, 
          name, 
          email,
          cpf: cpf.trim() || null,
          role, 
          active,
          empresaId,
          diretoriaId,
          regionalId,
          filialId,
          area: area.trim() || null,
          telefone: telefone.trim() || null
        }),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col gap-4 animate-fade-in">
        <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: '#003153' }}>Editar Usuário</h2>
        
        {/* Informações Básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: '#003153' }} htmlFor="name-edit">Nome Completo *</label>
            <input 
              ref={nomeRef} 
              id="name-edit" 
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
            <label className="text-sm font-medium" style={{ color: '#003153' }} htmlFor="email-edit">Email *</label>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: '#003153' }} htmlFor="cpf-edit">CPF</label>
            <input 
              id="cpf-edit" 
              type="text" 
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 transition bg-white" 
              style={{ 
                borderColor: 'rgba(0, 49, 83, 0.3)', 
                color: '#003153',
                '--tw-ring-color': '#003153',
                '--tw-ring-opacity': '0.5'
              } as any}
              placeholder="000.000.000-00" 
              value={cpf} 
              onChange={e => setCpf(e.target.value)} 
              autoComplete="off"
              maxLength={14}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: '#003153' }} htmlFor="telefone-edit">Telefone</label>
            <input 
              id="telefone-edit" 
              type="text" 
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 transition bg-white" 
              style={{ 
                borderColor: 'rgba(0, 49, 83, 0.3)', 
                color: '#003153',
                '--tw-ring-color': '#003153',
                '--tw-ring-opacity': '0.5'
              } as any}
              placeholder="(00) 00000-0000" 
              value={telefone} 
              onChange={e => setTelefone(e.target.value)} 
              autoComplete="off" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: '#003153' }} htmlFor="role-edit">Perfil *</label>
            <select
              id="role-edit"
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
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: '#003153' }} htmlFor="active-edit">Status *</label>
            <select
              id="active-edit"
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 transition bg-white hover:cursor-pointer"
              style={{ 
                borderColor: 'rgba(0, 49, 83, 0.3)', 
                color: '#003153',
                '--tw-ring-color': '#003153',
                '--tw-ring-opacity': '0.5'
              } as any}
              value={active ? "true" : "false"}
              onChange={e => setActive(e.target.value === "true")}
              required
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: '#003153' }} htmlFor="telefone-edit">Telefone</label>
            <input 
              id="telefone-edit" 
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 transition bg-white" 
              style={{ 
                borderColor: 'rgba(0, 49, 83, 0.3)', 
                color: '#003153',
                '--tw-ring-color': '#003153',
                '--tw-ring-opacity': '0.5'
              } as any}
              placeholder="Telefone (opcional)" 
              value={telefone} 
              onChange={e => setTelefone(e.target.value)} 
              autoComplete="off" 
            />
          </div>
        </div>

        {/* Hierarquia Organizacional */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#003153' }}>Hierarquia Organizacional</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-blue-900" htmlFor="empresa-edit">Empresa</label>
              <select
                id="empresa-edit"
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
              <label className="text-sm font-medium text-blue-900" htmlFor="diretoria-edit">Diretoria</label>
              <select
                id="diretoria-edit"
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
              <label className="text-sm font-medium text-blue-900" htmlFor="regional-edit">Regional</label>
              <select
                id="regional-edit"
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
              <label className="text-sm font-medium text-blue-900" htmlFor="filial-edit">Filial</label>
              <select
                id="filial-edit"
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
              <label className="text-sm font-medium text-blue-900" htmlFor="area-edit">Área</label>
              <input 
                id="area-edit" 
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
        {success && <div className="text-green-600 text-sm text-center mt-1 bg-green-50 p-2 rounded">Usuário editado com sucesso!</div>}
        
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
// Modal profissional para cadastro de usuário

function NovoUsuarioModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
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
      setName(""); setEmail(""); setCpf(""); setPassword(""); setRole("VENDEDOR"); 
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
          cpf: cpf.trim() || null,
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
            <label className="text-sm font-medium" style={{ color: '#003153' }} htmlFor="cpf-new">CPF</label>
            <input 
              id="cpf-new" 
              type="text" 
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 transition bg-white" 
              style={{ 
                borderColor: 'rgba(0, 49, 83, 0.3)', 
                color: '#003153',
                '--tw-ring-color': '#003153',
                '--tw-ring-opacity': '0.5'
              } as any}
              placeholder="000.000.000-00" 
              value={cpf} 
              onChange={e => setCpf(e.target.value)} 
              autoComplete="off"
              maxLength={14}
            />
          </div>
          
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
  name: string;
  email: string;
  cpf?: string | null;
  role: string;
  active: boolean;
  empresaId?: number | null;
  diretoriaId?: number | null;
  regionalId?: number | null;
  filialId?: number | null;
  area?: string | null;
  telefone?: string | null;
  Empresas?: {
    id: number;
    razaoSocial: string;
  } | null;
  diretorias?: {
    id: number;
    nome: string;
  } | null;
  regionais?: {
    id: number;
    nome: string;
  } | null;
  Filiais?: {
    id: number;
    nome: string;
  } | null;
}

export default function UsuariosPage() {
  const [editarModalOpen, setEditarModalOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  // Estados para paginação
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);

  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Resetar página quando a pesquisa muda
  useEffect(() => {
    setPagina(1);
  }, [search]);

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
      (u.name || '').toLowerCase().includes(termo) ||
      (u.email || '').toLowerCase().includes(termo) ||
      (u.role || '').toLowerCase().includes(termo) ||
      (u.Empresas?.razaoSocial || '').toLowerCase().includes(termo) ||
      (u.diretorias?.nome || '').toLowerCase().includes(termo) ||
      (u.regionais?.nome || '').toLowerCase().includes(termo) ||
      (u.Filiais?.nome || '').toLowerCase().includes(termo)
    );
  });

  // Lógica de paginação
  const totalPaginas = Math.ceil(usuariosFiltrados.length / porPagina) || 1;
  const usuariosPaginados = usuariosFiltrados.slice((pagina - 1) * porPagina, pagina * porPagina);



  return (
    <>
      {/* Título da página */}
      <div className="flex items-center gap-3 mb-3 mt-4 sm:mt-0 max-w-full mx-auto px-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl shadow" style={{ backgroundColor: '#003153', color: '#ffffff' }}>
          <Users className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold leading-tight" style={{ color: '#003153' }}>Usuários</h1>
          <p className="text-gray-600 text-sm mt-1">Gerencie os usuários cadastrados e suas permissões de acesso.</p>
        </div>
      </div>
      {/* Botão de novo usuário abaixo do header global */}
      <div className="max-w-full mx-auto mt-2 mb-2 px-4 flex justify-end">
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
      <div className="max-w-full mx-auto py-0 px-4">
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
        <div className="relative mb-3">
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
              usuariosPaginados.map((u) => (
                <div key={u.id} className="rounded-xl shadow-lg border border-gray-100 bg-white p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg" style={{ color: '#003153' }}>{u.name || '-'}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      u.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {u.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-gray-500">Email:</span>
                      <span className="text-sm font-medium" style={{ color: '#003153' }}>{u.email}</span>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-gray-500">Perfil:</span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full inline-block w-fit" style={{
                        backgroundColor: u.role === 'GESTOR_MASTER' ? '#ef4444' : 
                                        u.role === 'GESTOR_III' ? '#f97316' : 
                                        u.role === 'GESTOR_II' ? '#eab308' : 
                                        u.role === 'GESTOR_I' ? '#22c55e' : '#6366f1',
                        color: 'white'
                      }}>
                        {u.role === 'GESTOR_MASTER' ? 'Admin' : 
                         u.role === 'GESTOR_III' ? 'Diretor' : 
                         u.role === 'GESTOR_II' ? 'Regional' : 
                         u.role === 'GESTOR_I' ? 'Filial' : 'Vendedor'}
                      </span>
                    </div>

                    {(u.Empresas || u.diretorias || u.regionais || u.Filiais) && (
                      <div className="border-t pt-2 mt-3">
                        <span className="text-xs font-medium text-gray-500 mb-2 block">Hierarquia:</span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {u.Empresas && (
                            <div>
                              <span className="text-gray-500">Empresa:</span>
                              <div className="font-medium" style={{ color: '#003153' }}>{u.Empresas.razaoSocial}</div>
                            </div>
                          )}
                          {u.diretorias && (
                            <div>
                              <span className="text-gray-500">Diretoria:</span>
                              <div className="font-medium" style={{ color: '#003153' }}>{u.diretorias.nome}</div>
                            </div>
                          )}
                          {u.regionais && (
                            <div>
                              <span className="text-gray-500">Regional:</span>
                              <div className="font-medium" style={{ color: '#003153' }}>{u.regionais.nome}</div>
                            </div>
                          )}
                          {u.Filiais && (
                            <div>
                              <span className="text-gray-500">Filial:</span>
                              <div className="font-medium" style={{ color: '#003153' }}>{u.Filiais.nome}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <button
                      type="button"
                      className="flex-1 py-2 rounded font-semibold transition hover:scale-105 hover:cursor-pointer flex items-center justify-center gap-2"
                      style={{ 
                        backgroundColor: 'rgba(0, 49, 83, 0.1)', 
                        color: '#003153',
                        ':hover': { backgroundColor: 'rgba(0, 49, 83, 0.15)' }
                      } as any}
                      title="Editar usuário"
                      onClick={() => { setUsuarioEditando(u); setEditarModalOpen(true); }}
                    >
                      <Pencil className="w-4 h-4" /> Editar
                    </button>
                  </div>
                </div>
              ))
            )}
            
            {/* Paginação Mobile */}
            {usuariosFiltrados.length > porPagina && (
              <div className="flex flex-col items-center gap-4 mt-6 p-4 bg-white rounded-xl shadow border border-gray-100">
                <div className="flex items-center gap-2">
                  <label htmlFor="porPaginaMobile" className="text-sm text-gray-700">Exibir por página:</label>
                  <select
                    id="porPaginaMobile"
                    className="border border-blue-600 rounded px-2 py-1 bg-white text-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    value={porPagina}
                    onChange={e => {
                      setPorPagina(Number(e.target.value));
                      setPagina(1);
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:bg-gray-400 hover:bg-blue-700 transition-colors text-sm font-medium hover:cursor-pointer"
                    onClick={() => setPagina(p => Math.max(1, p - 1))}
                    disabled={pagina === 1}
                  >
                    ← Anterior
                  </button>
                  <span className="text-sm text-gray-700 px-3">
                    {pagina} de {totalPaginas}
                  </span>
                  <button
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:bg-gray-400 hover:bg-blue-700 transition-colors text-sm font-medium hover:cursor-pointer"
                    onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                    disabled={pagina === totalPaginas}
                  >
                    Próxima →
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* Desktop: Tabela */}
          <div className="hidden sm:block rounded-xl shadow-lg bg-white border border-gray-100">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col className="w-[16%]" /> {/* Nome */}
                <col className="w-[16%]" /> {/* Email */}
                <col className="w-[10%]" /> {/* Perfil */}
                <col className="w-[6%]" />  {/* Status */}
                <col className="w-[16%]" /> {/* Empresa */}
                <col className="w-[12%]" /> {/* Diretoria */}
                <col className="w-[12%]" /> {/* Regional */}
                <col className="w-[10%]" /> {/* Filial */}
                <col className="w-[2%]" />  {/* Ações */}
              </colgroup>
              <thead>
                <tr style={{ backgroundColor: 'rgba(0, 49, 83, 0.05)', color: '#003153' }}>
                  <th className="px-2 py-3 text-left text-xs font-bold uppercase tracking-tight">Nome</th>
                  <th className="px-2 py-3 text-left text-xs font-bold uppercase tracking-tight">Email</th>
                  <th className="px-2 py-3 text-center text-xs font-bold uppercase tracking-tight">Perfil</th>
                  <th className="px-2 py-3 text-center text-xs font-bold uppercase tracking-tight">Status</th>
                  <th className="px-2 py-3 text-left text-xs font-bold uppercase tracking-tight">Empresa</th>
                  <th className="px-2 py-3 text-left text-xs font-bold uppercase tracking-tight">Diretoria</th>
                  <th className="px-2 py-3 text-left text-xs font-bold uppercase tracking-tight">Regional</th>
                  <th className="px-2 py-3 text-left text-xs font-bold uppercase tracking-tight">Filial</th>
                  <th className="px-2 py-3 text-center text-xs font-bold uppercase tracking-tight">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-8">
                      <CardLoader text="Carregando lista de usuários..." />
                    </td>
                  </tr>
                ) : usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8" style={{ color: '#003153' }}>Nenhum usuário encontrado.</td>
                  </tr>
                ) : (
                  usuariosPaginados.map((u) => (
                    <tr key={u.id} className="border-t border-gray-100 hover:bg-blue-50 transition">
                      <td className="px-2 py-3 font-semibold text-sm truncate" style={{ color: '#003153' }} title={u.name || '-'}>
                        {u.name || '-'}
                      </td>
                      <td className="px-2 py-3 text-sm truncate" style={{ color: '#003153' }} title={u.email}>
                        {u.email}
                      </td>
                      <td className="px-2 py-3 text-center">
                        <span className="px-2 py-1 text-xs font-medium rounded-full inline-block" style={{
                          backgroundColor: u.role === 'GESTOR_MASTER' ? '#ef4444' : 
                                          u.role === 'GESTOR_III' ? '#f97316' : 
                                          u.role === 'GESTOR_II' ? '#eab308' : 
                                          u.role === 'GESTOR_I' ? '#22c55e' : '#6366f1',
                          color: 'white',
                          fontSize: '10px',
                          minWidth: 'fit-content'
                        }}>
                          {u.role === 'GESTOR_MASTER' ? 'Admin' : 
                           u.role === 'GESTOR_III' ? 'Diretor' : 
                           u.role === 'GESTOR_II' ? 'Regional' : 
                           u.role === 'GESTOR_I' ? 'Filial' : 'Vendedor'}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full inline-block ${
                          u.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`} style={{ fontSize: '11px' }}>
                          {u.active ? '✓' : '✗'}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-sm truncate" style={{ color: '#003153' }} title={u.Empresas?.razaoSocial || '-'}>
                        {u.Empresas?.razaoSocial || '-'}
                      </td>
                      <td className="px-2 py-3 text-sm truncate" style={{ color: '#003153' }} title={u.diretorias?.nome || '-'}>
                        {u.diretorias?.nome || '-'}
                      </td>
                      <td className="px-2 py-3 text-sm truncate" style={{ color: '#003153' }} title={u.regionais?.nome || '-'}>
                        {u.regionais?.nome || '-'}
                      </td>
                      <td className="px-2 py-3 text-sm truncate" style={{ color: '#003153' }} title={u.Filiais?.nome || '-'}>
                        {u.Filiais?.nome || '-'}
                      </td>
                      <td className="px-2 py-3 text-center align-middle">
                        <button
                          type="button"
                          className="p-1 rounded transition hover:scale-110 hover:cursor-pointer"
                          style={{ ':hover': { backgroundColor: 'rgba(0, 49, 83, 0.1)' } } as any}
                          title="Editar usuário"
                          onClick={() => { setUsuarioEditando(u); setEditarModalOpen(true); }}
                        >
                          <Pencil className="w-3 h-3 mx-auto" style={{ color: '#003153' }} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={9} className="py-4">
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label htmlFor="porPagina" className="text-sm text-gray-700">Exibir por página:</label>
                        <select
                          id="porPagina"
                          className="border border-blue-600 rounded px-2 py-1 bg-white text-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                          value={porPagina}
                          onChange={e => {
                            setPorPagina(Number(e.target.value));
                            setPagina(1);
                          }}
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={15}>15</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                      {usuariosFiltrados.length > porPagina && (
                        <div className="flex items-center gap-2">
                          <button
                            className="px-3 py-1 rounded border bg-white text-blue-700 disabled:opacity-50 hover:cursor-pointer"
                            onClick={() => setPagina(p => Math.max(1, p - 1))}
                            disabled={pagina === 1}
                          >Anterior</button>
                          <span className="text-sm text-gray-700">Página {pagina} de {totalPaginas}</span>
                          <button
                            className="px-3 py-1 rounded border bg-white text-blue-700 disabled:opacity-50 hover:cursor-pointer"
                            onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                            disabled={pagina === totalPaginas}
                          >Próxima</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>

          </div>
        </div>
      </div>
    </>
  );
}
