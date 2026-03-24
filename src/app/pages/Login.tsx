import { useState, FormEvent } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro("");
    setSucesso(false);
    setCarregando(true);

    const resultado = await login(email, senha);

    if (resultado.success) {
      setSucesso(true);
      setTimeout(() => navigate("/"), 1000);
    } else {
      setErro(resultado.message);
    }
    setCarregando(false);
  };

  const usuariosDemo = [
    { nome: "Admin Rise", email: "admin@rise.com", dept: "Todos" },
    { nome: "Maria Santos", email: "maria.santos@rise.com", dept: "Marketing" },
    { nome: "Carlos Oliveira", email: "carlos.oliveira@rise.com", dept: "Operações" },
    { nome: "Ana Costa", email: "ana.costa@rise.com", dept: "Comercial" },
    { nome: "Pedro Almeida", email: "pedro.almeida@rise.com", dept: "Produto" },
    { nome: "Juliana Ferreira", email: "juliana.ferreira@rise.com", dept: "Financeiro" },
  ];

  const preencherCredenciais = (emailDemo: string) => {
    setEmail(emailDemo);
    setSenha("rise2026");
    setErro("");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#14E9BC] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#28d939] rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Coluna Esquerda - Formulário de Login */}
        <div className="bg-[#111] border border-[#333] rounded-2xl p-8 lg:p-12">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#14E9BC] to-[#28d939] rounded-xl flex items-center justify-center">
                <span className="font-['Inter:Bold',sans-serif] text-[#000] text-[24px]">R</span>
              </div>
              <span className="font-['Inter:Bold',sans-serif] text-[#eee] text-[28px]">Rise Admin</span>
            </div>
            <h1 className="font-['Inter:Bold',sans-serif] text-[#eee] text-[32px] mb-2">
              Bem-vindo de volta!
            </h1>
            <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[16px]">
              Acesse sua conta para continuar
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[14px] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@rise.com"
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-12 pr-4 py-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[15px] focus:border-[#14E9BC] focus:outline-none transition-colors"
                  disabled={carregando}
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[14px] mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" />
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-12 pr-12 py-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[15px] focus:border-[#14E9BC] focus:outline-none transition-colors"
                  disabled={carregando}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#eee] transition-colors"
                  disabled={carregando}
                >
                  {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Mensagens de Erro/Sucesso */}
            {erro && (
              <div className="bg-[#ec5d5e]/10 border border-[#ec5d5e]/40 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle size={20} className="text-[#ec5d5e] flex-shrink-0" />
                <p className="font-['Inter:Regular',sans-serif] text-[#ec5d5e] text-[14px]">
                  {erro}
                </p>
              </div>
            )}

            {sucesso && (
              <div className="bg-[#28d939]/10 border border-[#28d939]/40 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle size={20} className="text-[#28d939] flex-shrink-0" />
                <p className="font-['Inter:Regular',sans-serif] text-[#28d939] text-[14px]">
                  Login realizado! Redirecionando...
                </p>
              </div>
            )}

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={carregando || sucesso}
              className="w-full bg-gradient-to-r from-[#14E9BC] to-[#28d939] text-[#000] py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] text-[16px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {carregando ? "Entrando..." : sucesso ? "Sucesso!" : "Entrar"}
            </button>
          </form>

          {/* Informação de Demo */}
          <div className="mt-6 p-4 bg-[#14E9BC]/5 border border-[#14E9BC]/20 rounded-lg">
            <p className="font-['Inter:Semi_Bold',sans-serif] text-[#14E9BC] text-[13px] mb-1">
              💡 Modo Demo
            </p>
            <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[12px]">
              Use a senha <span className="text-[#14E9BC] font-['Inter:Semi_Bold',sans-serif]">rise2026</span> ou{" "}
              <span className="text-[#14E9BC] font-['Inter:Semi_Bold',sans-serif]">123456</span> com qualquer email da lista ao lado
            </p>
          </div>
        </div>

        {/* Coluna Direita - Usuários Demo */}
        <div className="bg-[#111] border border-[#333] rounded-2xl p-8 lg:p-12">
          <h2 className="font-['Inter:Bold',sans-serif] text-[#eee] text-[24px] mb-2">
            Contas de Demonstração
          </h2>
          <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[15px] mb-6">
            Clique em um usuário para preencher automaticamente
          </p>

          <div className="space-y-3">
            {usuariosDemo.map((user) => (
              <button
                key={user.email}
                onClick={() => preencherCredenciais(user.email)}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-4 hover:border-[#14E9BC] hover:bg-[#0f0f0f] transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#14E9BC] to-[#28d939] flex items-center justify-center flex-shrink-0">
                    <span className="font-['Inter:Bold',sans-serif] text-[#000] text-[18px]">
                      {user.nome.split(" ")[0][0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[15px] mb-1 group-hover:text-[#14E9BC] transition-colors">
                      {user.nome}
                    </p>
                    <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[13px] truncate">
                      {user.email}
                    </p>
                    <p className="font-['Inter:Regular',sans-serif] text-[#666] text-[12px] mt-1">
                      Departamento: {user.dept}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-2 h-2 rounded-full bg-[#14E9BC]" />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Info Adicional */}
          <div className="mt-6 p-4 bg-[#28d939]/5 border border-[#28d939]/20 rounded-lg">
            <p className="font-['Inter:Semi_Bold',sans-serif] text-[#28d939] text-[13px] mb-2">
              🔐 Sistema de Permissões
            </p>
            <ul className="space-y-1 font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[12px]">
              <li>• <strong>Admin:</strong> Acesso total a todos os workspaces</li>
              <li>• <strong>Executivos:</strong> Edição apenas do próprio departamento</li>
              <li>• Todos podem visualizar todos os departamentos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
