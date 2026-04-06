import { supabase } from "../supabase";

export interface ComentarioDB {
  id: string;
  tarefa_id: string;
  autor_id: string;
  conteudo: string;
  parent_id: string | null;
  editado: boolean;
  criado_em: string;
  // join
  autor?: { id: string; nome: string; avatar_url: string | null } | null;
}

export async function criarComentario(input: {
  tarefa_id: string;
  autor_id: string;
  conteudo: string;
  parent_id?: string;
}): Promise<ComentarioDB> {
  const { data, error } = await supabase
    .from("comentarios")
    .insert(input)
    .select("id, tarefa_id, autor_id, conteudo, parent_id, editado, criado_em, autor:profiles(id, nome, avatar_url)")
    .single();

  if (error) throw error;
  return data;
}
