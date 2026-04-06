import { supabase } from "../supabase";

export interface UsuarioDB {
  id: string;
  nome: string;
  cargo: string | null;
  departamento_id: string | null;
  avatar_url: string | null;
  tema: string;
}

export async function getUsuarios(): Promise<UsuarioDB[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nome, cargo, departamento_id, avatar_url, tema")
    .order("nome");

  if (error) throw error;
  return data ?? [];
}

export async function getUsuarioById(id: string): Promise<UsuarioDB | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nome, cargo, departamento_id, avatar_url, tema")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function getUsuariosPorDepartamento(departamento_id: string): Promise<UsuarioDB[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nome, cargo, departamento_id, avatar_url, tema")
    .eq("departamento_id", departamento_id)
    .order("nome");

  if (error) throw error;
  return data ?? [];
}

export async function atualizarPerfil(
  id: string,
  updates: { nome?: string; cargo?: string; departamento_id?: string; avatar_url?: string; tema?: string }
): Promise<UsuarioDB> {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
