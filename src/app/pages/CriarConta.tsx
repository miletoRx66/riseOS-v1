import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, User, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

export default function CriarConta() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [erro, setErro] = useState("");
  const [confirmacaoPendente, setConfirmacaoPendente] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const senhaForte = senha.length >= 8;
  const senhasIguais = senha === confirmarSenha && confirmarSenha.length > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro("");

    if (!senhaForte) {
      setErro("A senha deve ter pelo menos 8 caracteres");
      return;
    }
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem");
      return;
    }

    setCarregando(true);
    const resultado = await signup(nome.trim(), email, senha);
    setCarregando(false);

    if (!resultado.success) {
      setErro(resultado.message);
      return;
    }

    if (resultado.requiresConfirmation) {
      setConfirmacaoPendente(true);
    } else {
      // Já autenticado — vai para o dashboard
      navigate("/");
    }
  };

  if (confirmacaoPendente) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden opacity-5">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#14E9BC] rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#28d939] rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-[#111] border border-[#333] rounded-2xl p-8 lg:p-12 text-center">
            <div className="w-16 h-16 bg-[#14E9BC]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-[#14E9BC]" />
            </div>
            <h1 className="font-bold text-[#eee] text-[24px] mb-3">
              Verifique seu email
            </h1>
            <p className="text-[#bdbdbd] text-[15px] mb-2">
              Enviamos um link de confirmação para
            </p>
            <p className="text-[#14E9BC] font-semibold text-[15px] mb-6">
              {email}
            </p>
            <p className="text-[#777] text-[13px] mb-8">
              Clique no link no email para ativar sua conta. Depois volte aqui para entrar.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-[#14E9BC] text-[14px] font-semibold hover:opacity-80 transition-opacity"
            >
              <ArrowLeft size={16} />
              Ir para o login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#14E9BC] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#28d939] rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#111] border border-[#333] rounded-2xl p-8 lg:p-10">
          {/* Logo */}
          <div className="mb-8">
            <Link to="/login" className="flex items-center gap-2 text-[#555] hover:text-[#bdbdbd] transition-colors text-[13px] mb-6">
              <ArrowLeft size={16} />
              Voltar para o login
            </Link>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#14E9BC] to-[#28d939] rounded-xl flex items-center justify-center">
                <span className="font-bold text-[#000] text-[24px]">R</span>
              </div>
              <span className="font-bold text-[#eee] text-[28px]">Rise Admin</span>
            </div>
            <h1 className="font-bold text-[#eee] text-[24px] mb-2">
              Criar sua conta
            </h1>
            <p className="text-[#bdbdbd] text-[14px]">
              Preencha os dados para acessar o sistema
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block font-semibold text-[#eee] text-[13px] mb-2">
                Nome completo
              </label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" />
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-11 pr-4 py-3 text-[#eee] text-[14px] focus:border-[#14E9BC] focus:outline-none transition-colors"
                  disabled={carregando}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block font-semibold text-[#eee] text-[13px] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-11 pr-4 py-3 text-[#eee] text-[14px] focus:border-[#14E9BC] focus:outline-none transition-colors"
                  disabled={carregando}
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block font-semibold text-[#eee] text-[13px] mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" />
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  className={`w-full bg-[#0a0a0a] border rounded-lg pl-11 pr-12 py-3 text-[#eee] text-[14px] focus:outline-none transition-colors ${
                    senha.length > 0
                      ? senhaForte
                        ? "border-[#28d939] focus:border-[#28d939]"
                        : "border-[#ec5d5e] focus:border-[#ec5d5e]"
                      : "border-[#333] focus:border-[#14E9BC]"
                  }`}
                  disabled={carregando}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#eee] transition-colors"
                  disabled={carregando}
                >
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {senha.length > 0 && !senhaForte && (
                <p className="text-[#ec5d5e] text-[12px] mt-1">
                  Mínimo de 8 caracteres ({senha.length}/8)
                </p>
              )}
            </div>

            {/* Confirmar Senha */}
            <div>
              <label className="block font-semibold text-[#eee] text-[13px] mb-2">
                Confirmar senha
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" />
                <input
                  type={mostrarConfirmar ? "text" : "password"}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a senha"
                  required
                  className={`w-full bg-[#0a0a0a] border rounded-lg pl-11 pr-12 py-3 text-[#eee] text-[14px] focus:outline-none transition-colors ${
                    confirmarSenha.length > 0
                      ? senhasIguais
                        ? "border-[#28d939] focus:border-[#28d939]"
                        : "border-[#ec5d5e] focus:border-[#ec5d5e]"
                      : "border-[#333] focus:border-[#14E9BC]"
                  }`}
                  disabled={carregando}
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#eee] transition-colors"
                  disabled={carregando}
                >
                  {mostrarConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmarSenha.length > 0 && !senhasIguais && (
                <p className="text-[#ec5d5e] text-[12px] mt-1">
                  As senhas não coincidem
                </p>
              )}
            </div>

            {/* Erro */}
            {erro && (
              <div className="bg-[#ec5d5e]/10 border border-[#ec5d5e]/40 rounded-lg p-3 flex items-center gap-3">
                <AlertCircle size={18} className="text-[#ec5d5e] flex-shrink-0" />
                <p className="text-[#ec5d5e] text-[13px]">{erro}</p>
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-gradient-to-r from-[#14E9BC] to-[#28d939] text-[#000] py-3 rounded-lg font-semibold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {carregando ? "Criando conta..." : "Criar conta"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-[#1e1e1e] text-center">
            <p className="text-[#555] text-[13px]">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-[#14E9BC] hover:opacity-80 transition-opacity font-semibold">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
