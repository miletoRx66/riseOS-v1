import { supabase } from "../supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = (table: string) => supabase.from(table) as any;

export interface CanalDB {
  id: string;
  nome: string | null;
  tipo: "departamento" | "privado" | "temporario" | "p2p";
  departamento_id: string | null;
  arquivado: boolean;
  criado_por: string;
  criado_em: string;
  // Enriquecidos no client
  outroUsuario?: { id: string; nome: string; avatar_url: string | null } | null;
  departamento?: { id: string; nome: string; cor: string } | null;
  ultimaMensagem?: string | null;
  ultimaMensagemEm?: string | null;
}

export interface MensagemDB {
  id: string;
  canal_id: string;
  autor_id: string;
  conteudo: string | null;
  tipo: string;
  criado_em: string;
  editado: boolean;
  autor?: { id: string; nome: string; avatar_url: string | null } | null;
}

/** Busca todos os canais do usuário (p2p + departamento) */
export async function getMeusCanais(userId: string): Promise<CanalDB[]> {
  const { data: memberships, error } = await db("canal_membros")
    .select("canal_id, canais(id, nome, tipo, departamento_id, arquivado, criado_por, criado_em)")
    .eq("usuario_id", userId);

  if (error) throw error;

  const canais: CanalDB[] = (memberships ?? [])
    .map((m: any) => m.canais)
    .filter(Boolean)
    .filter((c: any) => !c.arquivado);

  return canais;
}

/** Enriquece canal p2p com dados do outro participante */
export async function getOutroParticipante(
  canalId: string,
  myUserId: string
): Promise<{ id: string; nome: string; avatar_url: string | null } | null> {
  const { data, error } = await db("canal_membros")
    .select("usuario_id, profiles(id, nome, avatar_url)")
    .eq("canal_id", canalId)
    .neq("usuario_id", myUserId)
    .single();

  if (error || !data) return null;
  return (data as any).profiles ?? null;
}

/** Busca mensagens de um canal */
export async function getMensagens(canalId: string): Promise<MensagemDB[]> {
  const { data, error } = await db("mensagens")
    .select("*, autor:profiles(id, nome, avatar_url)")
    .eq("canal_id", canalId)
    .eq("deletado", false)
    .order("criado_em", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Envia uma mensagem */
export async function enviarMensagem(
  canalId: string,
  autorId: string,
  conteudo: string
): Promise<MensagemDB> {
  const { data, error } = await db("mensagens")
    .insert({ canal_id: canalId, autor_id: autorId, conteudo, tipo: "texto" })
    .select("*, autor:profiles(id, nome, avatar_url)")
    .single();

  if (error) throw error;
  return data;
}

/** Cria ou busca canal P2P entre dois usuários via RPC */
export async function iniciarConversaP2P(uid1: string, uid2: string): Promise<string> {
  const { data, error } = await supabase.rpc("get_or_create_canal_p2p", {
    uid1,
    uid2,
  });
  if (error) throw error;
  return data as string;
}

/** Cria ou entra no canal de um departamento via RPC */
export async function entrarCanalDepartamento(deptId: string, uid: string): Promise<string> {
  const { data, error } = await supabase.rpc("get_or_create_canal_departamento", {
    dept_id: deptId,
    uid,
  });
  if (error) throw error;
  return data as string;
}

/** Assina realtime de um canal */
export function subscribeToMensagens(
  canalId: string,
  onInsert: (msg: MensagemDB) => void
) {
  const channel = supabase
    .channel(`mensagens-${canalId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "mensagens",
        filter: `canal_id=eq.${canalId}`,
      },
      async (payload) => {
        // Buscar com join do autor
        const { data } = await db("mensagens")
          .select("*, autor:profiles(id, nome, avatar_url)")
          .eq("id", payload.new.id)
          .single();
        if (data) onInsert(data);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
