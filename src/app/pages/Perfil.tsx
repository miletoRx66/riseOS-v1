import { useState, FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { supabase } from "../../lib/supabase";
import { User, Lock, Save, Eye, EyeOff } from "lucide-react";

export default function Perfil() {
  const { usuario } = useAuth();
  const { success, error } = useToast();

  const [nome, setNome] = useState(usuario?.nome ?? "");
  const [cargo, setCargo] = useState(usuario?.cargo ?? "");
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenhas, setMostrarSenhas] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  async function handleSalvarPerfil(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim()) { error("Nome é obrigatório"); return; }
    if (!usuario?.id) return;
    setSalvandoPerfil(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: err } = await (supabase.from("profiles") as any)
        .update({ nome: nome.trim(), cargo: cargo.trim() || null })
        .eq("id", usuario.id);
      if (err) throw err;
      success("Perfil atualizado com sucesso!");
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Erro ao atualizar perfil");
    } finally {
      setSalvandoPerfil(false);
    }
  }

  async function handleAlterarSenha(e: FormEvent) {
    e.preventDefault();
    if (!novaSenha || novaSenha.length < 6) { error("A nova senha precisa ter pelo menos 6 caracteres"); return; }
    if (novaSenha !== confirmarSenha) { error("As senhas não coincidem"); return; }
    setSalvandoSenha(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password: novaSenha });
      if (err) throw err;
      success("Senha alterada com sucesso!");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Erro ao alterar senha");
    } finally {
      setSalvandoSenha(false);
    }
  }

  function getIniciais(nome: string) {
    return nome.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
  }

  return (
    <div className="min-h-screen bg-rise-bg p-8">
      <div className="max-w-[640px] mx-auto">
        <h1 className="font-['Inter:Bold',sans-serif] font-bold text-rise-fg text-[32px] mb-8">
          Meu Perfil
        </h1>

        {/* Avatar + Info */}
        <div className="bg-rise-surface border border-rise-line rounded-xl p-6 mb-6 flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-[#14E9BC]/20 flex items-center justify-center text-[28px] font-bold text-[#14E9BC] flex-shrink-0">
            {usuario?.nome ? getIniciais(usuario.nome) : "?"}
          </div>
          <div>
            <h2 className="text-rise-fg text-[20px] font-['Inter:Semi_Bold',sans-serif]">{usuario?.nome}</h2>
            <p className="text-rise-fg-2 text-[14px] mt-0.5">{usuario?.cargo || "Sem cargo"}</p>
            <p className="text-rise-fg-4 text-[13px] mt-0.5">{usuario?.email}</p>
          </div>
        </div>

        {/* Editar perfil */}
        <div className="bg-rise-surface border border-rise-line rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-[#14E9BC]/15 rounded-lg flex items-center justify-center">
              <User size={16} className="text-[#14E9BC]" />
            </div>
            <h3 className="text-rise-fg text-[16px] font-['Inter:Semi_Bold',sans-serif]">Informações Pessoais</h3>
          </div>

          <form onSubmit={handleSalvarPerfil} className="space-y-4">
            <div>
              <label className="block text-rise-fg-2 text-[13px] mb-1.5 font-['Inter:Medium',sans-serif]">
                Nome completo *
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-rise-raised border border-rise-line rounded-lg px-4 py-2.5 text-rise-fg text-[14px] focus:border-[#14E9BC] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-rise-fg-2 text-[13px] mb-1.5 font-['Inter:Medium',sans-serif]">
                Cargo
              </label>
              <input
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Ex: Gerente de Projetos"
                className="w-full bg-rise-raised border border-rise-line rounded-lg px-4 py-2.5 text-rise-fg text-[14px] focus:border-[#14E9BC] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-rise-fg-2 text-[13px] mb-1.5 font-['Inter:Medium',sans-serif]">
                E-mail
              </label>
              <input
                type="email"
                value={usuario?.email ?? ""}
                disabled
                className="w-full bg-rise-surface border border-rise-line-2 rounded-lg px-4 py-2.5 text-rise-fg-4 text-[14px] cursor-not-allowed"
              />
              <p className="text-rise-fg-4 text-[11px] mt-1">O e-mail não pode ser alterado aqui</p>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={salvandoPerfil}
                className="bg-[#14E9BC] text-[#000] px-5 py-2.5 rounded-lg font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] flex items-center gap-2 hover:bg-[#12d4a8] transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {salvandoPerfil ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>

        {/* Alterar senha */}
        <div className="bg-rise-surface border border-rise-line rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-[#f59e0b]/15 rounded-lg flex items-center justify-center">
              <Lock size={16} className="text-[#f59e0b]" />
            </div>
            <h3 className="text-rise-fg text-[16px] font-['Inter:Semi_Bold',sans-serif]">Alterar Senha</h3>
          </div>

          <form onSubmit={handleAlterarSenha} className="space-y-4">
            <div>
              <label className="block text-rise-fg-2 text-[13px] mb-1.5 font-['Inter:Medium',sans-serif]">
                Nova senha *
              </label>
              <div className="relative">
                <input
                  type={mostrarSenhas ? "text" : "password"}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-rise-raised border border-rise-line rounded-lg px-4 py-2.5 text-rise-fg text-[14px] focus:border-[#14E9BC] focus:outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenhas(!mostrarSenhas)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-rise-fg-4 hover:text-rise-fg-2 transition-colors"
                >
                  {mostrarSenhas ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {novaSenha.length > 0 && novaSenha.length < 6 && (
                <p className="text-[#ec5d5e] text-[11px] mt-1">Mínimo 6 caracteres</p>
              )}
            </div>
            <div>
              <label className="block text-rise-fg-2 text-[13px] mb-1.5 font-['Inter:Medium',sans-serif]">
                Confirmar nova senha *
              </label>
              <input
                type={mostrarSenhas ? "text" : "password"}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full bg-rise-raised border border-rise-line rounded-lg px-4 py-2.5 text-rise-fg text-[14px] focus:border-[#14E9BC] focus:outline-none"
              />
              {confirmarSenha.length > 0 && novaSenha !== confirmarSenha && (
                <p className="text-[#ec5d5e] text-[11px] mt-1">As senhas não coincidem</p>
              )}
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={salvandoSenha || !novaSenha || !confirmarSenha}
                className="bg-[#f59e0b] text-[#000] px-5 py-2.5 rounded-lg font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] flex items-center gap-2 hover:bg-[#d97706] transition-colors disabled:opacity-50"
              >
                <Lock size={16} />
                {salvandoSenha ? "Alterando..." : "Alterar Senha"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
