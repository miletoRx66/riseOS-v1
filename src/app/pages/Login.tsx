import { useState, FormEvent, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login, usuario, isLoading } = useAuth();

  // Redireciona para dashboard se já autenticado (ex: clicou link de confirmação de email)
  useEffect(() => {
    if (!isLoading && usuario) {
      navigate("/", { replace: true });
    }
  }, [usuario, isLoading, navigate]);

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
      navigate("/");
    } else {
      setErro(resultado.message);
    }
    setCarregando(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#14E9BC] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#28d939] rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#111] border border-[#333] rounded-2xl p-8 lg:p-12">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#14E9BC] to-[#28d939] rounded-xl flex items-center justify-center">
                <span className="font-bold text-[#000] text-[24px]">R</span>
              </div>
              <span className="font-bold text-[#eee] text-[28px]">Rise Admin</span>
            </div>
            <h1 className="font-bold text-[#eee] text-[28px] mb-2">
              Bem-vindo de volta
            </h1>
            <p className="text-[#bdbdbd] text-[15px]">
              Acesse sua conta para continuar
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="seu@risefinance.com.br"
                  required
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-11 pr-4 py-3 text-[#eee] text-[14px] focus:border-[#14E9BC] focus:outline-none transition-colors"
                  disabled={carregando}
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-semibold text-[#eee] text-[13px]">
                  Senha
                </label>
                <Link
                  to="/esqueceu-senha"
                  className="text-[#14E9BC] text-[12px] hover:opacity-80 transition-opacity"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" />
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-11 pr-12 py-3 text-[#eee] text-[14px] focus:border-[#14E9BC] focus:outline-none transition-colors"
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
            </div>

            {/* Erro */}
            {erro && (
              <div className="bg-[#ec5d5e]/10 border border-[#ec5d5e]/40 rounded-lg p-3 flex items-center gap-3">
                <AlertCircle size={18} className="text-[#ec5d5e] flex-shrink-0" />
                <p className="text-[#ec5d5e] text-[13px]">{erro}</p>
              </div>
            )}

            {/* Sucesso */}
            {sucesso && (
              <div className="bg-[#28d939]/10 border border-[#28d939]/40 rounded-lg p-3 flex items-center gap-3">
                <CheckCircle size={18} className="text-[#28d939] flex-shrink-0" />
                <p className="text-[#28d939] text-[13px]">Login realizado! Redirecionando...</p>
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={carregando || sucesso}
              className="w-full bg-gradient-to-r from-[#14E9BC] to-[#28d939] text-[#000] py-3 rounded-lg font-semibold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {carregando ? "Entrando..." : sucesso ? "Sucesso!" : "Entrar"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-[#1e1e1e] text-center space-y-3">
            <p className="text-[#555] text-[13px]">
              Não tem uma conta?{" "}
              <Link to="/criar-conta" className="text-[#14E9BC] hover:opacity-80 transition-opacity font-semibold">
                Criar conta
              </Link>
            </p>
            <p className="text-[#444] text-[12px]">
              Rise Finance · Sistema Administrativo Operacional
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
