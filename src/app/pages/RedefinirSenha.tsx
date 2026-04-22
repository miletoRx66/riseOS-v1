import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function RedefinirSenha() {
  const navigate = useNavigate();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");
  const [sessaoValida, setSessaoValida] = useState(false);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    // Supabase processa os tokens do hash e dispara PASSWORD_RECOVERY.
    // Outros eventos (INITIAL_SESSION, TOKEN_REFRESHED) não devem encerrar a verificação.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessaoValida(!!session);
        setVerificando(false);
      }
    });

    // Timeout de segurança: se PASSWORD_RECOVERY não disparar em 5s, o link é inválido.
    const timeout = setTimeout(() => {
      setVerificando(false);
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro("");

    if (novaSenha.length < 8) {
      setErro("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha });

      if (error) {
        setErro("Erro ao redefinir senha. O link pode ter expirado.");
        setCarregando(false);
      } else {
        setSucesso(true);
        // Faz logout para forçar novo login com a senha atualizada
        await supabase.auth.signOut();
        setTimeout(() => navigate("/login"), 2500);
      }
    } catch {
      setErro("Erro inesperado. Tente novamente.");
      setCarregando(false);
    }
  };

  if (verificando) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#14E9BC] border-t-transparent rounded-full animate-spin" />
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
        <div className="bg-[#111] border border-[#333] rounded-2xl p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-[#14E9BC] to-[#28d939] rounded-xl flex items-center justify-center">
              <span className="font-bold text-[#000] text-[20px]">R</span>
            </div>
            <span className="font-bold text-[#eee] text-[22px]">Rise Admin</span>
          </div>

          {sucesso ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-[#28d939]/10 border border-[#28d939]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-[#28d939]" />
              </div>
              <h2 className="text-[#eee] text-[22px] font-bold mb-2">Senha redefinida!</h2>
              <p className="text-[#bdbdbd] text-[14px]">
                Redirecionando para o login...
              </p>
            </div>
          ) : !sessaoValida ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ec5d5e]/10 border border-[#ec5d5e]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-[#ec5d5e]" />
              </div>
              <h2 className="text-[#eee] text-[22px] font-bold mb-2">Link inválido</h2>
              <p className="text-[#bdbdbd] text-[14px] mb-6">
                Este link expirou ou já foi utilizado. Solicite um novo link de redefinição.
              </p>
              <button
                onClick={() => navigate("/esqueceu-senha")}
                className="w-full bg-gradient-to-r from-[#14E9BC] to-[#28d939] text-[#000] py-3 rounded-lg font-semibold text-[14px] hover:opacity-90 transition-opacity"
              >
                Solicitar novo link
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-[#eee] text-[24px] font-bold mb-2">Criar nova senha</h1>
              <p className="text-[#bdbdbd] text-[14px] mb-6">
                Escolha uma senha segura para sua conta.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[#eee] text-[13px] font-semibold mb-2">
                    Nova senha
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
                    <input
                      type={mostrarSenha ? "text" : "password"}
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      required
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-10 pr-12 py-3 text-[#eee] text-[14px] focus:border-[#14E9BC] focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#eee] transition-colors"
                    >
                      {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[#eee] text-[13px] font-semibold mb-2">
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
                    <input
                      type={mostrarSenha ? "text" : "password"}
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      placeholder="Repita a nova senha"
                      required
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-10 pr-4 py-3 text-[#eee] text-[14px] focus:border-[#14E9BC] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Força da senha */}
                {novaSenha && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            novaSenha.length >= i * 3
                              ? i <= 1 ? "bg-[#ec5d5e]"
                              : i <= 2 ? "bg-[#f59e0b]"
                              : i <= 3 ? "bg-[#14E9BC]"
                              : "bg-[#28d939]"
                              : "bg-[#333]"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[#666] text-[11px]">
                      {novaSenha.length < 4 ? "Fraca" : novaSenha.length < 7 ? "Razoável" : novaSenha.length < 10 ? "Boa" : "Forte"}
                    </p>
                  </div>
                )}

                {erro && (
                  <div className="bg-[#ec5d5e]/10 border border-[#ec5d5e]/40 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle size={16} className="text-[#ec5d5e] flex-shrink-0" />
                    <p className="text-[#ec5d5e] text-[13px]">{erro}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={carregando || !novaSenha || !confirmarSenha}
                  className="w-full bg-gradient-to-r from-[#14E9BC] to-[#28d939] text-[#000] py-3 rounded-lg font-semibold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {carregando ? "Salvando..." : "Salvar nova senha"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
