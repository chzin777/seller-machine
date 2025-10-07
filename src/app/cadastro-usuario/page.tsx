"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { UserPlus, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Alert, AlertDescription } from "../../components/ui/alert";
import LoadingSpinner from "../../components/LoadingSpinner";

interface Empresa {
  id: number;
  razaoSocial: string;
  cnpjMatriz: string;
}

interface Diretoria {
  id: number;
  nome: string;
  empresaId: number;
}

interface Regional {
  id: number;
  nome: string;
  diretoriaId: number;
}

interface Filial {
  id: number;
  nome: string;
  cnpj: string;
  cidade: string;
  estado: string;
  regionalId: number;
}

const UserRoles = {
  VENDEDOR: 'Vendedor',
  GESTOR_I: 'Gestor I',
  GESTOR_II: 'Gestor II',
  GESTOR_III: 'Gestor III',
  GESTOR_MASTER: 'Gestor Master'
};

export default function CadastroUsuarioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');

  // Estados para dados hierárquicos
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [diretorias, setDiretorias] = useState<Diretoria[]>([]);
  const [regionais, setRegionais] = useState<Regional[]>([]);
  const [filiais, setFiliais] = useState<Filial[]>([]);

  // Estados de carregamento
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [loadingDiretorias, setLoadingDiretorias] = useState(false);
  const [loadingRegionais, setLoadingRegionais] = useState(false);
  const [loadingFiliais, setLoadingFiliais] = useState(false);

  // Estados dos campos do formulário
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    confirmarSenha: "",
    role: "VENDEDOR",
    area: "",
    empresaId: "",
    diretoriaId: "",
    regionalId: "",
    filialId: ""
  });

  // Carregar empresas ao montar o componente
  useEffect(() => {
    carregarEmpresas();
  }, []);

  const carregarEmpresas = async () => {
    setLoadingEmpresas(true);
    try {
      const res = await fetch('/api/hierarchy/empresas');
      if (res.ok) {
        const data = await res.json();
        setEmpresas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    } finally {
      setLoadingEmpresas(false);
    }
  };

  const carregarDiretorias = async (empresaId: string) => {
    if (!empresaId) {
      setDiretorias([]);
      return;
    }
    
    setLoadingDiretorias(true);
    try {
      const res = await fetch(`/api/hierarchy/diretorias?empresaId=${empresaId}`);
      if (res.ok) {
        const data = await res.json();
        setDiretorias(data);
      }
    } catch (error) {
      console.error('Erro ao carregar diretorias:', error);
    } finally {
      setLoadingDiretorias(false);
    }
  };

  const carregarRegionais = async (diretoriaId: string) => {
    if (!diretoriaId) {
      setRegionais([]);
      return;
    }
    
    setLoadingRegionais(true);
    try {
      const res = await fetch(`/api/hierarchy/regionais?diretoriaId=${diretoriaId}`);
      if (res.ok) {
        const data = await res.json();
        setRegionais(data);
      }
    } catch (error) {
      console.error('Erro ao carregar regionais:', error);
    } finally {
      setLoadingRegionais(false);
    }
  };

  const carregarFiliais = async (regionalId: string) => {
    if (!regionalId) {
      setFiliais([]);
      return;
    }
    
    setLoadingFiliais(true);
    try {
      const res = await fetch(`/api/filiais?regionalId=${regionalId}`);
      if (res.ok) {
        const data = await res.json();
        setFiliais(data);
      }
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
    } finally {
      setLoadingFiliais(false);
    }
  };

  // Handlers para mudanças nos selects hierárquicos
  const handleEmpresaChange = (empresaId: string) => {
    setFormData(prev => ({
      ...prev,
      empresaId,
      diretoriaId: "",
      regionalId: "",
      filialId: ""
    }));
    setDiretorias([]);
    setRegionais([]);
    setFiliais([]);
    if (empresaId) {
      carregarDiretorias(empresaId);
    }
  };

  const handleDiretoriaChange = (diretoriaId: string) => {
    setFormData(prev => ({
      ...prev,
      diretoriaId,
      regionalId: "",
      filialId: ""
    }));
    setRegionais([]);
    setFiliais([]);
    if (diretoriaId) {
      carregarRegionais(diretoriaId);
    }
  };

  const handleRegionalChange = (regionalId: string) => {
    setFormData(prev => ({
      ...prev,
      regionalId,
      filialId: ""
    }));
    setFiliais([]);
    if (regionalId) {
      carregarFiliais(regionalId);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const { nome, email, senha, confirmarSenha, empresaId, diretoriaId, area, role } = formData;

    // Validação de campos obrigatórios
    if (!nome.trim()) {
      setMsg("Nome é obrigatório");
      setMsgType('error');
      return false;
    }

    if (nome.trim().length < 2) {
      setMsg("Nome deve ter pelo menos 2 caracteres");
      setMsgType('error');
      return false;
    }

    if (!email.trim()) {
      setMsg("E-mail é obrigatório");
      setMsgType('error');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMsg("E-mail inválido");
      setMsgType('error');
      return false;
    }

    if (!senha) {
      setMsg("Senha é obrigatória");
      setMsgType('error');
      return false;
    }

    if (senha.length < 6) {
      setMsg("Senha deve ter pelo menos 6 caracteres");
      setMsgType('error');
      return false;
    }

    if (senha !== confirmarSenha) {
      setMsg("Senhas não coincidem");
      setMsgType('error');
      return false;
    }

    if (!empresaId) {
      setMsg("Empresa é obrigatória");
      setMsgType('error');
      return false;
    }

    if (!diretoriaId) {
      setMsg("Diretoria é obrigatória");
      setMsgType('error');
      return false;
    }

    if (!area.trim()) {
      setMsg("Área é obrigatória");
      setMsgType('error');
      return false;
    }

    if (!role) {
      setMsg("Perfil de acesso é obrigatório");
      setMsgType('error');
      return false;
    }

    // Validações específicas por role
    if ((role === 'VENDEDOR' || role === 'GESTOR_I') && !formData.filialId) {
      setMsg("Filial é obrigatória para Vendedores e Gestores I");
      setMsgType('error');
      return false;
    }

    if (role === 'GESTOR_II' && !formData.regionalId) {
      setMsg("Regional é obrigatória para Gestores II");
      setMsgType('error');
      return false;
    }

    // Validação de telefone (se preenchido)
    if (formData.telefone && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.telefone)) {
      setMsg("Telefone deve estar no formato (11) 99999-9999");
      setMsgType('error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.nome,
          email: formData.email,
          telefone: formData.telefone || null,
          password: formData.senha,
          empresaId: parseInt(formData.empresaId),
          diretoriaId: parseInt(formData.diretoriaId),
          regionalId: formData.regionalId ? parseInt(formData.regionalId) : null,
          filialId: formData.filialId ? parseInt(formData.filialId) : null,
          area: formData.area,
          role: formData.role
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMsg("Usuário cadastrado com sucesso!");
        setMsgType('success');
        setTimeout(() => {
          router.push("/usuarios");
        }, 2000);
      } else {
        setMsg(data.error || "Erro ao cadastrar usuário");
        setMsgType('error');
      }
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      setMsg("Erro interno do servidor");
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <UserPlus className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Cadastro de Usuário</h1>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados Pessoais */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Dados Pessoais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="usuario@empresa.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => {
                      // Formatação automática do telefone
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 11) {
                        value = value.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
                      }
                      handleInputChange('telefone', value);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Área *
                  </label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => handleInputChange('area', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ex: Vendas, Marketing, TI"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Senha */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Credenciais de Acesso</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.senha}
                      onChange={(e) => handleInputChange('senha', e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Senha *
                  </label>
                  <input
                    type="password"
                    value={formData.confirmarSenha}
                    onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Confirme a senha"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Hierarquia Organizacional */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Hierarquia Organizacional</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa *
                  </label>
                  <select
                    value={formData.empresaId}
                    onChange={(e) => handleEmpresaChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                    disabled={loadingEmpresas}
                  >
                    <option value="">Selecione uma empresa</option>
                    {empresas.map((empresa) => (
                      <option key={empresa.id} value={empresa.id}>
                        {empresa.razaoSocial}
                      </option>
                    ))}
                  </select>
                  {loadingEmpresas && <div className="text-sm text-gray-500 mt-1">Carregando empresas...</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diretoria *
                  </label>
                  <select
                    value={formData.diretoriaId}
                    onChange={(e) => handleDiretoriaChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                    disabled={!formData.empresaId || loadingDiretorias}
                  >
                    <option value="">Selecione uma diretoria</option>
                    {diretorias.map((diretoria) => (
                      <option key={diretoria.id} value={diretoria.id}>
                        {diretoria.nome}
                      </option>
                    ))}
                  </select>
                  {loadingDiretorias && <div className="text-sm text-gray-500 mt-1">Carregando diretorias...</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Regional {(formData.role === 'GESTOR_II' || formData.role === 'VENDEDOR' || formData.role === 'GESTOR_I') && '*'}
                  </label>
                  <select
                    value={formData.regionalId}
                    onChange={(e) => handleRegionalChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={!formData.diretoriaId || loadingRegionais}
                    required={formData.role === 'GESTOR_II' || formData.role === 'VENDEDOR' || formData.role === 'GESTOR_I'}
                  >
                    <option value="">
                      {formData.role === 'GESTOR_II' || formData.role === 'VENDEDOR' || formData.role === 'GESTOR_I' 
                        ? 'Selecione uma regional' 
                        : 'Selecione uma regional (opcional)'}
                    </option>
                    {regionais.map((regional) => (
                      <option key={regional.id} value={regional.id}>
                        {regional.nome}
                      </option>
                    ))}
                  </select>
                  {loadingRegionais && <div className="text-sm text-gray-500 mt-1">Carregando regionais...</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filial {(formData.role === 'VENDEDOR' || formData.role === 'GESTOR_I') && '*'}
                  </label>
                  <select
                    value={formData.filialId}
                    onChange={(e) => handleInputChange('filialId', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={!formData.regionalId || loadingFiliais}
                    required={formData.role === 'VENDEDOR' || formData.role === 'GESTOR_I'}
                  >
                    <option value="">
                      {formData.role === 'VENDEDOR' || formData.role === 'GESTOR_I' 
                        ? 'Selecione uma filial' 
                        : 'Selecione uma filial (opcional)'}
                    </option>
                    {filiais.map((filial) => (
                      <option key={filial.id} value={filial.id}>
                        {filial.nome} - {filial.cidade}/{filial.estado}
                      </option>
                    ))}
                  </select>
                  {loadingFiliais && <div className="text-sm text-gray-500 mt-1">Carregando filiais...</div>}
                </div>
              </div>
            </div>

            {/* Perfil de Acesso */}
            <div className="pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Perfil de Acesso</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível de Acesso *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="VENDEDOR">Vendedor</option>
                  <option value="GESTOR_I">Gestor I (Filial)</option>
                  <option value="GESTOR_II">Gestor II (Regional)</option>
                  <option value="GESTOR_III">Gestor III (Diretoria)</option>
                  <option value="GESTOR_MASTER">Gestor Master (Empresa)</option>
                </select>
                <div className="text-sm text-gray-500 mt-1">
                  O nível de acesso determina quais funcionalidades o usuário poderá acessar
                </div>
              </div>
            </div>

            {/* Mensagem de feedback */}
            {msg && (
              <div className={`p-4 rounded-lg text-center ${
                msgType === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {msg}
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner />
                    Cadastrando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Cadastrar Usuário
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}