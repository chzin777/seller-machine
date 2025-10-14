'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Users, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface User {
  id: number;
  name: string;
  email: string;
  telefone?: string;
  role: string;
  area: string;
  active: boolean;
  Empresas?: { id: number; razaoSocial: string };
  diretorias?: { id: number; nome: string };
  regionais?: { id: number; nome: string };
  Filiais?: { id: number; nome: string };
  createdAt: string;
  updatedAt: string;
}

interface Empresa {
  id: number;
  razaoSocial: string;
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
  regionalId: number;
}

export default function UserManagement() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [diretorias, setDiretorias] = useState<Diretoria[]>([]);
  const [regionais, setRegionais] = useState<Regional[]>([]);
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telefone: '',
    password: '',
    role: '',
    empresaId: '',
    diretoriaId: '',
    regionalId: '',
    filialId: '',
    area: ''
  });

  // Filtered data based on selections
  const filteredDiretorias = diretorias.filter(d => d.empresaId === parseInt(formData.empresaId));
  const filteredRegionais = regionais.filter(r => r.diretoriaId === parseInt(formData.diretoriaId));
  const filteredFiliais = filiais.filter(f => f.regionalId === parseInt(formData.regionalId));

  // Load initial data
  useEffect(() => {
    loadUsers();
    loadEmpresas();
    loadDiretorias();
    loadRegionais();
    loadFiliais();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      showToast('Erro ao carregar usuários', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadEmpresas = async () => {
    try {
      const response = await fetch('/api/empresas');
      if (response.ok) {
        const data = await response.json();
        setEmpresas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const loadDiretorias = async () => {
    try {
      const response = await fetch('/api/diretorias');
      if (response.ok) {
        const data = await response.json();
        setDiretorias(data);
      }
    } catch (error) {
      console.error('Erro ao carregar diretorias:', error);
    }
  };

  const loadRegionais = async () => {
    try {
      const response = await fetch('/api/regionais');
      if (response.ok) {
        const data = await response.json();
        setRegionais(data);
      }
    } catch (error) {
      console.error('Erro ao carregar regionais:', error);
    }
  };

  const loadFiliais = async () => {
    try {
      const response = await fetch('/api/filiais');
      if (response.ok) {
        const data = await response.json();
        setFiliais(data);
      }
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.role || 
        !formData.empresaId || !formData.diretoriaId || !formData.area) {
      showToast('Preencha todos os campos obrigatórios', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          empresaId: parseInt(formData.empresaId),
          diretoriaId: parseInt(formData.diretoriaId),
          regionalId: formData.regionalId ? parseInt(formData.regionalId) : null,
          filialId: formData.filialId ? parseInt(formData.filialId) : null,
        }),
      });

      if (response.ok) {
        showToast('Usuário cadastrado com sucesso!', 'success');
        setFormData({
          name: '',
          email: '',
          telefone: '',
          password: '',
          role: '',
          empresaId: '',
          diretoriaId: '',
          regionalId: '',
          filialId: '',
          area: ''
        });
        loadUsers();
      } else {
        const error = await response.json();
        showToast(error.error || 'Erro ao cadastrar usuário', 'error');
      }
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      showToast('Erro ao cadastrar usuário', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'GESTOR_MASTER': return 'bg-purple-100 text-purple-800';
      case 'GESTOR_III': return 'bg-blue-100 text-blue-800';
      case 'GESTOR_II': return 'bg-green-100 text-green-800';
      case 'GESTOR_I': return 'bg-yellow-100 text-yellow-800';
      case 'VENDEDOR': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
          <p className="text-gray-600">Cadastre e gerencie usuários do sistema</p>
        </div>
      </div>

      <Tabs defaultValue="cadastro" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cadastro" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Cadastrar Usuário
          </TabsTrigger>
          <TabsTrigger value="lista" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Lista de Usuários
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cadastro">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Cadastrar Novo Usuário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nome completo"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Mínimo 6 caracteres"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Perfil *</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VENDEDOR">Vendedor</SelectItem>
                        <SelectItem value="GESTOR_I">Gestor I</SelectItem>
                        <SelectItem value="GESTOR_II">Gestor II</SelectItem>
                        <SelectItem value="GESTOR_III">Gestor III</SelectItem>
                        <SelectItem value="GESTOR_MASTER">Gestor Master</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">Área *</Label>
                    <Input
                      id="area"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      placeholder="Ex: Vendas, Marketing, etc."
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="empresa">Empresa *</Label>
                    <Select 
                      value={formData.empresaId} 
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        empresaId: value,
                        diretoriaId: '',
                        regionalId: '',
                        filialId: ''
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {empresas.map((empresa) => (
                          <SelectItem key={empresa.id} value={empresa.id.toString()}>
                            {empresa.razaoSocial}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diretoria">Diretoria *</Label>
                    <Select 
                      value={formData.diretoriaId} 
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        diretoriaId: value,
                        regionalId: '',
                        filialId: ''
                      })}
                      disabled={!formData.empresaId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a diretoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredDiretorias.map((diretoria) => (
                          <SelectItem key={diretoria.id} value={diretoria.id.toString()}>
                            {diretoria.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regional">Regional</Label>
                    <Select 
                      value={formData.regionalId} 
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        regionalId: value,
                        filialId: ''
                      })}
                      disabled={!formData.diretoriaId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a regional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhuma</SelectItem>
                        {filteredRegionais.map((regional) => (
                          <SelectItem key={regional.id} value={regional.id.toString()}>
                            {regional.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="filial">Filial</Label>
                    <Select 
                      value={formData.filialId} 
                      onValueChange={(value) => setFormData({ ...formData, filialId: value })}
                      disabled={!formData.regionalId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a filial" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhuma</SelectItem>
                        {filteredFiliais.map((filial) => (
                          <SelectItem key={filial.id} value={filial.id.toString()}>
                            {filial.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={loading} className="min-w-32">
                    {loading ? 'Cadastrando...' : 'Cadastrar Usuário'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lista">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Lista de Usuários ({users.length})
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar usuários..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="logo-loading mx-auto mb-4">
                    <img 
                      src="/images/logo.png" 
                      alt="Carregando" 
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  <p className="text-gray-600">Carregando usuários...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'Nenhum usuário encontrado com os critérios de busca.' : 'Nenhum usuário cadastrado.'}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{user.name}</h3>
                            <Badge className={getRoleBadgeColor(user.role)}>
                              {user.role.replace('_', ' ')}
                            </Badge>
                            <Badge variant={user.active ? "default" : "secondary"}>
                              {user.active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                            <div>📧 {user.email}</div>
                            {user.telefone && <div>📱 {user.telefone}</div>}
                            <div>🏢 {user.area}</div>
                            {user.Empresas && <div>🏛️ {user.Empresas.razaoSocial}</div>}
                            {user.diretorias && <div>📋 {user.diretorias.nome}</div>}
                            {user.regionais && <div>🌍 {user.regionais.nome}</div>}
                            {user.Filiais && <div>🏪 {user.Filiais.nome}</div>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}