"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { UserCog, Lock, Mail, User } from "lucide-react"; // Added User import

export default function ConfiguracoesPage() {
  // Estados
  const [showSenhaModal, setShowSenhaModal] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [novaSenha2, setNovaSenha2] = useState("");
  const [loadingSenha, setLoadingSenha] = useState(false);
  const [senhaMsg, setSenhaMsg] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [novoEmail, setNovoEmail] = useState("");
  const [emailMsg, setEmailMsg] = useState<string | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [showDadosModal, setShowDadosModal] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoSobrenome, setNovoSobrenome] = useState("");
  const [dadosMsg, setDadosMsg] = useState<string | null>(null);
  const [loadingDados, setLoadingDados] = useState(false);

  // Funções
  const handleAlterarSenha = async () => {
    setSenhaMsg(null);
    if (novaSenha.length < 6) {
      setSenhaMsg("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenha !== novaSenha2) {
      setSenhaMsg("As senhas não coincidem.");
      return;
    }
    setLoadingSenha(true);
    let user = null;
    if (typeof window !== "undefined") {
      user = localStorage.getItem("user") || sessionStorage.getItem("user");
    }
    let id = null;
    try {
      if (user) id = JSON.parse(user).id;
    } catch {}
    if (!id) {
      setSenhaMsg("Usuário não encontrado. Faça login novamente.");
      setLoadingSenha(false);
      return;
    }
    try {
      const res = await fetch("/api/nova-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, senha: novaSenha }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSenhaMsg("Senha alterada com sucesso!");
        setNovaSenha("");
        setNovaSenha2("");
        setTimeout(() => setShowSenhaModal(false), 1500);
      } else {
        setSenhaMsg(data.error || "Erro ao alterar senha.");
      }
    } catch {
      setSenhaMsg("Erro ao conectar ao servidor.");
    }
    setLoadingSenha(false);
  };

  const handleAlterarEmail = async () => {
    setEmailMsg(null);
    if (!novoEmail || !novoEmail.includes("@")) {
      setEmailMsg("Digite um e-mail válido.");
      return;
    }
    setLoadingEmail(true);
    let user = null;
    if (typeof window !== "undefined") {
      user = localStorage.getItem("user") || sessionStorage.getItem("user");
    }
    let id = null, nome = "", sobrenome = "", conta = "";
    try {
      if (user) {
        const parsed = JSON.parse(user);
        id = parsed.id;
        nome = parsed.nome || "";
        sobrenome = parsed.sobrenome || "";
        conta = parsed.conta || "";
      }
    } catch {}
    if (!id) {
      setEmailMsg("Usuário não encontrado. Faça login novamente.");
      setLoadingEmail(false);
      return;
    }
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, nome, sobrenome, email: novoEmail, conta }),
      });
      const data = await res.json();
      if (res.ok && !data.error) {
        setEmailMsg("E-mail alterado com sucesso!");
        setTimeout(() => setShowEmailModal(false), 1500);
      } else {
        setEmailMsg(data.error || "Erro ao alterar e-mail.");
      }
    } catch {
      setEmailMsg("Erro ao conectar ao servidor.");
    }
    setLoadingEmail(false);
  };

  const handleAlterarDados = async () => {
    setDadosMsg(null);
    if (!novoNome || !novoSobrenome) {
      setDadosMsg("Preencha nome e sobrenome.");
      return;
    }
    setLoadingDados(true);
    let user = null;
    if (typeof window !== "undefined") {
      user = localStorage.getItem("user") || sessionStorage.getItem("user");
    }
    let id = null, email = "", conta = "";
    try {
      if (user) {
        const parsed = JSON.parse(user);
        id = parsed.id;
        email = parsed.email || "";
        conta = parsed.conta || "";
      }
    } catch {}
    if (!id) {
      setDadosMsg("Usuário não encontrado. Faça login novamente.");
      setLoadingDados(false);
      return;
    }
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, nome: novoNome, sobrenome: novoSobrenome, email, conta }),
      });
      const data = await res.json();
      if (res.ok && !data.error) {
        setDadosMsg("Dados alterados com sucesso!");
        setTimeout(() => setShowDadosModal(false), 1500);
      } else {
        setDadosMsg(data.error || "Erro ao alterar dados.");
      }
    } catch {
      setDadosMsg("Erro ao conectar ao servidor.");
    }
    setLoadingDados(false);
  };

  // JSX de retorno
  return (
  <div className="max-w-2xl w-full mx-auto py-6 px-2 sm:py-10 sm:px-4 min-h-screen flex flex-col">
      <h1 className="text-3xl font-bold text-blue-900 mb-8 flex items-center gap-3">
        <UserCog className="w-7 h-7 text-blue-700" /> Configurações
      </h1>

      {/* Card Alterar e-mail */}
  <Card className="shadow-lg border border-gray-100 bg-white mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-900">
            <Mail className="w-5 h-5 text-blue-700" /> E-mail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Button className="w-fit hover:cursor-pointer bg-blue-100 text-blue-700 hover:bg-blue-200 border-none shadow font-semibold px-5 py-2 rounded-lg" onClick={() => setShowEmailModal(true)}>Alterar e-mail</Button>
            <span className="text-xs text-gray-500">Mantenha seu e-mail atualizado para receber notificações importantes.</span>
          </div>
        </CardContent>
      </Card>

      {/* Card Alterar dados pessoais */}
  <Card className="shadow-lg border border-gray-100 bg-white mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-900">
            <User className="w-5 h-5 text-blue-700" /> Dados pessoais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Button className="w-fit hover:cursor-pointer bg-blue-100 text-blue-700 hover:bg-blue-200 border-none shadow font-semibold px-5 py-2 rounded-lg" onClick={() => setShowDadosModal(true)}>Alterar nome e sobrenome</Button>
            <span className="text-xs text-gray-500">Mantenha seus dados pessoais atualizados.</span>
          </div>
        </CardContent>
      </Card>

      {/* Card Segurança */}
  <Card className="shadow-lg border border-gray-100 bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-900">
            <Lock className="w-5 h-5 text-blue-700" /> Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Button className="w-fit hover:cursor-pointer bg-blue-100 text-blue-700 hover:bg-blue-200 border-none shadow font-semibold px-5 py-2 rounded-lg" onClick={() => setShowSenhaModal(true)}>Alterar senha</Button>
            <span className="text-xs text-gray-500">Recomendado trocar sua senha periodicamente para maior segurança.</span>
          </div>
        </CardContent>
      </Card>

      {/* Modal Alterar e-mail */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-3xl font-bold hover:cursor-pointer" onClick={() => setShowEmailModal(false)}>&times;</button>
            <h2 className="text-lg font-bold mb-4">Alterar e-mail</h2>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                className="border rounded px-3 py-2 bg-gray-50"
                placeholder="Novo e-mail"
                value={novoEmail}
                onChange={e => setNovoEmail(e.target.value)}
                disabled={loadingEmail}
              />
              <Button onClick={handleAlterarEmail} disabled={loadingEmail} className="mt-2 hover:cursor-pointer bg-blue-100 text-blue-700 hover:bg-blue-200 border-none shadow font-semibold px-5 py-2 rounded-lg">
                {loadingEmail ? "Salvando..." : "Salvar novo e-mail"}
              </Button>
              {emailMsg && (
                <span className={`text-xs ${emailMsg.includes("sucesso") ? "text-green-600" : "text-red-600"}`}>{emailMsg}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Alterar dados pessoais */}
      {showDadosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-3xl font-bold hover:cursor-pointer" onClick={() => setShowDadosModal(false)}>&times;</button>
            <h2 className="text-lg font-bold mb-4">Alterar dados pessoais</h2>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                className="border rounded px-3 py-2 bg-gray-50"
                placeholder="Novo nome"
                value={novoNome}
                onChange={e => setNovoNome(e.target.value)}
                disabled={loadingDados}
              />
              <input
                type="text"
                className="border rounded px-3 py-2 bg-gray-50"
                placeholder="Novo sobrenome"
                value={novoSobrenome}
                onChange={e => setNovoSobrenome(e.target.value)}
                disabled={loadingDados}
              />
              <Button onClick={handleAlterarDados} disabled={loadingDados} className="mt-2 hover:cursor-pointer bg-blue-100 text-blue-700 hover:bg-blue-200 border-none shadow font-semibold px-5 py-2 rounded-lg">
                {loadingDados ? "Salvando..." : "Salvar dados"}
              </Button>
              {dadosMsg && (
                <span className={`text-xs ${dadosMsg.includes("sucesso") ? "text-green-600" : "text-red-600"}`}>{dadosMsg}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de alteração de senha */}
      {showSenhaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-3xl font-bold hover:cursor-pointer" onClick={() => setShowSenhaModal(false)}>&times;</button>
            <h2 className="text-lg font-bold mb-4">Alterar senha</h2>
            <div className="flex flex-col gap-3">
              <input
                type="password"
                className="border rounded px-3 py-2 bg-gray-50"
                placeholder="Nova senha"
                value={novaSenha}
                onChange={e => setNovaSenha(e.target.value)}
                disabled={loadingSenha}
              />
              <input
                type="password"
                className="border rounded px-3 py-2 bg-gray-50"
                placeholder="Repita a nova senha"
                value={novaSenha2}
                onChange={e => setNovaSenha2(e.target.value)}
                disabled={loadingSenha}
              />
              <Button onClick={handleAlterarSenha} disabled={loadingSenha} className="mt-2 hover:cursor-pointer bg-blue-100 text-blue-700 hover:bg-blue-200 border-none shadow font-semibold px-5 py-2 rounded-lg">
                {loadingSenha ? "Salvando..." : "Salvar nova senha"}
              </Button>
              {senhaMsg && (
                <span className={`text-xs ${senhaMsg.includes("sucesso") ? "text-green-600" : "text-red-600"}`}>{senhaMsg}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
