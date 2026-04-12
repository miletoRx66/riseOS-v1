import { supabase } from "../supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = (table: string) => supabase.from(table) as any;

export interface DocumentoDB {
  id: string;
  titulo: string;
  departamento_id: string;
  tipo: string;
  autor_id: string;
  storage_path: string | null;
  url_publica: string | null;
  tamanho_bytes: number | null;
  gitbook_url: string | null;
  deletado: boolean;
  criado_em: string;
  atualizado_em: string;
  autor?: { id: string; nome: string } | null;
  departamento?: { id: string; nome: string; cor: string } | null;
}

export async function getDocumentos(departamento_id?: string): Promise<DocumentoDB[]> {
  let query = db("documentos")
    .select("*, autor:profiles(id, nome), departamento:departamentos(id, nome, cor)")
    .eq("deletado", false)
    .order("criado_em", { ascending: false });

  if (departamento_id) query = query.eq("departamento_id", departamento_id);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function uploadDocumento(
  file: File,
  titulo: string,
  departamento_id: string,
  tipo: string,
  autorId: string
): Promise<DocumentoDB> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${departamento_id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("documentos")
    .upload(path, file, { contentType: file.type });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from("documentos").getPublicUrl(path);

  const { data, error } = await db("documentos")
    .insert({
      titulo,
      departamento_id,
      tipo,
      autor_id: autorId,
      storage_path: path,
      url_publica: urlData?.publicUrl ?? null,
      tamanho_bytes: file.size,
    })
    .select("*, autor:profiles(id, nome), departamento:departamentos(id, nome, cor)")
    .single();

  if (error) throw error;
  return data;
}

export async function criarDocumentoLink(input: {
  titulo: string;
  departamento_id: string;
  tipo: string;
  autor_id: string;
  gitbook_url: string;
}): Promise<DocumentoDB> {
  const { data, error } = await db("documentos")
    .insert(input)
    .select("*, autor:profiles(id, nome), departamento:departamentos(id, nome, cor)")
    .single();

  if (error) throw error;
  return data;
}

export async function deletarDocumento(id: string, storagePath: string | null): Promise<void> {
  // Soft delete no DB
  const { error } = await db("documentos").update({ deletado: true }).eq("id", id);
  if (error) throw error;

  // Remove do storage se existir
  if (storagePath) {
    await supabase.storage.from("documentos").remove([storagePath]);
  }
}

export async function getDocumentoUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("documentos")
    .createSignedUrl(storagePath, 3600); // 1 hora

  if (error) throw error;
  return data.signedUrl;
}

export function formatarTamanho(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
