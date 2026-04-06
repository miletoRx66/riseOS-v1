import { useState, FormEvent } from "react";
import { Link } from "react-router";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function EsqueceuSenha() {
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setErro("");
    setCarregando(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    if (error) {
      setErro("Erro ao enviar email. Verifique o endereço e tente novamente.");
    } else {
      setEnviado(true);
    }
    setCarregando(false);
  };

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

          {!enviado ? (
            <>
              <h1 className="text-[#eee] text-[24px] font-bold mb-2">Redefinir senha</h1>
              <p className="text-[#bdbdbd] text-[14px] mb-6">
                Informe seu email e enviaremos um link para você criar uma nova senha.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[#eee] text-[13px] font-semibold mb-2">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@risefinance.com.br"
                      required
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-10 pr-4 py-3 text-[#eee] text-[14px] focus:border-[#14E9BC] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {erro && (
                  <div className="bg-[#ec5d5e]/10 border border-[#ec5d5e]/40 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle size={16} className="text-[#ec5d5e] flex-shrink-0" />
                    <p className="text-[#ec5d5e] text-[13px]">{erro}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={carregando || !email}
                  className="w-full bg-gradient-to-r from-[#14E9BC] to-[#28d939] text-[#000] py-3 rounded-lg font-semibold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {carregando ? "Enviando..." : "Enviar link de redefinição"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-[#28d939]/10 border border-[#28d939]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-[#28d939]" />
              </div>
              <h2 className="text-[#eee] text-[22px] font-bold mb-2">Email enviado!</h2>
              <p className="text-[#bdbdbd] text-[14px] mb-2">
                Enviamos um link de redefinição para:
              </p>
              <p className="text-[#14E9BC] text-[15px] font-semibold mb-6">{email}</p>
              <p className="text-[#666] text-[13px]">
                Verifique sua caixa de entrada e a pasta de spam. O link expira em 1 hora.
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-[#222]">
            <Link
              to="/login"
              className="flex items-center gap-2 text-[#bdbdbd] hover:text-[#14E9BC] text-[14px] transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
