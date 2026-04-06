import { supabase } from "../supabase";

export interface DepartamentoDB {
  id: string;
  nome: string;
  cor: string;
  icon: string;
}

export interface DepartamentoComStats extends DepartamentoDB {
  membros: number;
  tarefasAbertas: number;
  documentos: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = (table: string) => supabase.from(table) as any;

export async function getDepartamentos(): Promise<DepartamentoDB[]> {
  const { data, error } = await db("departamentos")
    .select("id, nome, cor, icon")
    .order("nome");

  if (error) throw error;
  return data ?? [];
}

export async function criarDepartamento(input: {
  nome: string;
  cor: string;
  icon: string;
}): Promise<DepartamentoDB> {
  const id = input.nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { data, error } = await db("departamentos")
    .insert({ id, ...input })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function atualizarDepartamento(
  id: string,
  input: { nome: string; cor: string; icon: string }
): Promise<DepartamentoDB> {
  const { data, error } = await db("departamentos")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getDepartamentosComStats(): Promise<DepartamentoComStats[]> {
  const { data: depts, error } = await db("departamentos")
    .select("id, nome, cor, icon")
    .order("nome");

  if (error) throw error;
  if (!depts) return [];

  const stats = await Promise.all(
    depts.map(async (d: DepartamentoDB) => {
      const [{ count: membros }, { count: tarefasAbertas }, { count: documentos }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("departamento_id", d.id),
          supabase
            .from("tarefas")
            .select("*", { count: "exact", head: true })
            .eq("departamento_id", d.id)
            .eq("deletado", false)
            .neq("status", "concluido"),
          supabase
            .from("documentos")
            .select("*", { count: "exact", head: true })
            .eq("departamento_id", d.id)
            .eq("deletado", false),
        ]);

      return {
        ...d,
        membros: membros ?? 0,
        tarefasAbertas: tarefasAbertas ?? 0,
        documentos: documentos ?? 0,
      };
    })
  );

  return stats;
}
