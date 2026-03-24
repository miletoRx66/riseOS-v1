// =============================================================================
// RiseOS — Tipos TypeScript do schema Supabase
// Gerado manualmente em 23/03/2026 — manter sincronizado com 001_initial_schema.sql
// Após ter o Supabase CLI instalado, pode substituir por:
//   npx supabase gen types typescript --project-id kmxqvcknhakhhquplmpi > src/lib/database.types.ts
// =============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nome: string;
          cargo: string | null;
          departamento_id: string | null;
          avatar_url: string | null;
          tema: "dark" | "light";
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id: string;
          nome: string;
          cargo?: string | null;
          departamento_id?: string | null;
          avatar_url?: string | null;
          tema?: "dark" | "light";
        };
        Update: {
          nome?: string;
          cargo?: string | null;
          departamento_id?: string | null;
          avatar_url?: string | null;
          tema?: "dark" | "light";
        };
      };

      departamentos: {
        Row: {
          id: string;
          nome: string;
          cor: string;
          icon: string;
          criado_em: string;
        };
        Insert: {
          id: string;
          nome: string;
          cor: string;
          icon: string;
        };
        Update: {
          nome?: string;
          cor?: string;
          icon?: string;
        };
      };

      permissoes: {
        Row: {
          id: string;
          usuario_id: string;
          tipo: "admin" | "manager" | "member" | "viewer";
          departamento_id: string | null;
          criado_em: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          tipo: "admin" | "manager" | "member" | "viewer";
          departamento_id?: string | null;
        };
        Update: {
          tipo?: "admin" | "manager" | "member" | "viewer";
          departamento_id?: string | null;
        };
      };

      status_config: {
        Row: {
          id: string;
          departamento_id: string | null;
          label: string;
          cor: string;
          ordem: number;
          eh_final: boolean;
          criado_em: string;
        };
        Insert: {
          id?: string;
          departamento_id?: string | null;
          label: string;
          cor: string;
          ordem: number;
          eh_final?: boolean;
        };
        Update: {
          label?: string;
          cor?: string;
          ordem?: number;
          eh_final?: boolean;
        };
      };

      tarefas: {
        Row: {
          id: string;
          titulo: string;
          descricao: string | null;
          departamento_id: string;
          status: string;
          prioridade: "alta" | "media" | "baixa";
          tipo: "backend" | "frontend" | "infra" | "design" | "marketing" | "comercial" | "ops" | "pesquisa" | "outro";
          visibilidade: "publica" | "departamento" | "pessoal";
          responsavel_id: string | null;
          criado_por: string;
          prazo: string | null;
          data_inicio: string | null;
          progresso: number;
          tags: string[];
          template_id: string | null;
          aprovacao_id: string | null;
          deletado: boolean;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          titulo: string;
          descricao?: string | null;
          departamento_id: string;
          status?: string;
          prioridade?: "alta" | "media" | "baixa";
          tipo?: "backend" | "frontend" | "infra" | "design" | "marketing" | "comercial" | "ops" | "pesquisa" | "outro";
          visibilidade?: "publica" | "departamento" | "pessoal";
          responsavel_id?: string | null;
          criado_por: string;
          prazo?: string | null;
          data_inicio?: string | null;
          progresso?: number;
          tags?: string[];
          template_id?: string | null;
        };
        Update: {
          titulo?: string;
          descricao?: string | null;
          departamento_id?: string;
          status?: string;
          prioridade?: "alta" | "media" | "baixa";
          tipo?: "backend" | "frontend" | "infra" | "design" | "marketing" | "comercial" | "ops" | "pesquisa" | "outro";
          visibilidade?: "publica" | "departamento" | "pessoal";
          responsavel_id?: string | null;
          prazo?: string | null;
          data_inicio?: string | null;
          progresso?: number;
          tags?: string[];
          deletado?: boolean;
          aprovacao_id?: string | null;
        };
      };

      subtarefas: {
        Row: {
          id: string;
          tarefa_id: string;
          titulo: string;
          concluida: boolean;
          responsavel_id: string | null;
          ordem: number;
          criado_em: string;
        };
        Insert: {
          id?: string;
          tarefa_id: string;
          titulo: string;
          concluida?: boolean;
          responsavel_id?: string | null;
          ordem?: number;
        };
        Update: {
          titulo?: string;
          concluida?: boolean;
          responsavel_id?: string | null;
          ordem?: number;
        };
      };

      tarefa_links: {
        Row: {
          id: string;
          tarefa_id: string;
          titulo: string;
          url: string;
          tipo: "figma" | "drive" | "github" | "notion" | "lark" | "jira" | "outro";
          criado_em: string;
        };
        Insert: {
          id?: string;
          tarefa_id: string;
          titulo: string;
          url: string;
          tipo?: "figma" | "drive" | "github" | "notion" | "lark" | "jira" | "outro";
        };
        Update: {
          titulo?: string;
          url?: string;
          tipo?: "figma" | "drive" | "github" | "notion" | "lark" | "jira" | "outro";
        };
      };

      tarefa_papeis: {
        Row: {
          id: string;
          tarefa_id: string;
          usuario_id: string;
          papel: "executor" | "revisor" | "aprovador" | "observador";
          criado_em: string;
        };
        Insert: {
          id?: string;
          tarefa_id: string;
          usuario_id: string;
          papel: "executor" | "revisor" | "aprovador" | "observador";
        };
        Update: {
          papel?: "executor" | "revisor" | "aprovador" | "observador";
        };
      };

      comentarios: {
        Row: {
          id: string;
          tarefa_id: string;
          autor_id: string;
          conteudo: string;
          parent_id: string | null;
          mencoes: string[];
          editado: boolean;
          deletado: boolean;
          criado_em: string;
          editado_em: string | null;
        };
        Insert: {
          id?: string;
          tarefa_id: string;
          autor_id: string;
          conteudo: string;
          parent_id?: string | null;
          mencoes?: string[];
        };
        Update: {
          conteudo?: string;
          mencoes?: string[];
          editado?: boolean;
          deletado?: boolean;
          editado_em?: string | null;
        };
      };

      anexos: {
        Row: {
          id: string;
          tarefa_id: string;
          nome: string;
          tipo_mime: string | null;
          tamanho_bytes: number | null;
          storage_path: string;
          url_publica: string | null;
          upload_por: string;
          criado_em: string;
        };
        Insert: {
          id?: string;
          tarefa_id: string;
          nome: string;
          tipo_mime?: string | null;
          tamanho_bytes?: number | null;
          storage_path: string;
          url_publica?: string | null;
          upload_por: string;
        };
        Update: {
          url_publica?: string | null;
        };
      };

      atividades: {
        Row: {
          id: string;
          tarefa_id: string;
          tipo: "criacao" | "status" | "comentario" | "anexo" | "subtarefa" | "edicao" | "aprovacao" | "papel" | "link";
          descricao: string;
          usuario_id: string;
          metadata: Json;
          criado_em: string;
        };
        Insert: {
          id?: string;
          tarefa_id: string;
          tipo: "criacao" | "status" | "comentario" | "anexo" | "subtarefa" | "edicao" | "aprovacao" | "papel" | "link";
          descricao: string;
          usuario_id: string;
          metadata?: Json;
        };
        Update: never; // imutável
      };

      okrs: {
        Row: {
          id: string;
          titulo: string;
          departamento_id: string;
          periodo: string;
          responsavel_id: string;
          data_inicio: string | null;
          data_fim: string | null;
          progresso: number;
          visibilidade: "publica" | "departamento";
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          titulo: string;
          departamento_id: string;
          periodo: string;
          responsavel_id: string;
          data_inicio?: string | null;
          data_fim?: string | null;
          progresso?: number;
          visibilidade?: "publica" | "departamento";
        };
        Update: {
          titulo?: string;
          periodo?: string;
          responsavel_id?: string;
          data_inicio?: string | null;
          data_fim?: string | null;
          progresso?: number;
          visibilidade?: "publica" | "departamento";
        };
      };

      key_results: {
        Row: {
          id: string;
          okr_id: string;
          descricao: string;
          metrica: string | null;
          valor_inicial: number;
          valor_meta: number;
          valor_atual: number;
          progresso: number;
          unidade: string | null;
          status: "on_track" | "at_risk" | "in_danger";
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          okr_id: string;
          descricao: string;
          metrica?: string | null;
          valor_inicial?: number;
          valor_meta: number;
          valor_atual?: number;
          progresso?: number;
          unidade?: string | null;
        };
        Update: {
          descricao?: string;
          metrica?: string | null;
          valor_meta?: number;
          valor_atual?: number;
          progresso?: number;
          unidade?: string | null;
          status?: "on_track" | "at_risk" | "in_danger";
        };
      };

      kr_snapshots: {
        Row: {
          id: string;
          kr_id: string;
          valor: number;
          registrado_por: string;
          comentario: string | null;
          criado_em: string;
        };
        Insert: {
          id?: string;
          kr_id: string;
          valor: number;
          registrado_por: string;
          comentario?: string | null;
        };
        Update: never; // imutável
      };

      documentos: {
        Row: {
          id: string;
          titulo: string;
          departamento_id: string;
          tipo: "documento" | "manual" | "apresentacao" | "especificacao" | "guia" | "diagrama";
          autor_id: string;
          storage_path: string | null;
          url_publica: string | null;
          tamanho_bytes: number | null;
          gitbook_url: string | null;
          deletado: boolean;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          titulo: string;
          departamento_id: string;
          tipo: "documento" | "manual" | "apresentacao" | "especificacao" | "guia" | "diagrama";
          autor_id: string;
          storage_path?: string | null;
          url_publica?: string | null;
          tamanho_bytes?: number | null;
          gitbook_url?: string | null;
        };
        Update: {
          titulo?: string;
          tipo?: "documento" | "manual" | "apresentacao" | "especificacao" | "guia" | "diagrama";
          storage_path?: string | null;
          url_publica?: string | null;
          gitbook_url?: string | null;
          deletado?: boolean;
        };
      };

      canais: {
        Row: {
          id: string;
          nome: string | null;
          tipo: "departamento" | "privado" | "temporario" | "p2p";
          departamento_id: string | null;
          arquivado: boolean;
          expira_em: string | null;
          criado_por: string;
          criado_em: string;
        };
        Insert: {
          id?: string;
          nome?: string | null;
          tipo: "departamento" | "privado" | "temporario" | "p2p";
          departamento_id?: string | null;
          expira_em?: string | null;
          criado_por: string;
        };
        Update: {
          nome?: string | null;
          arquivado?: boolean;
          expira_em?: string | null;
        };
      };

      canal_membros: {
        Row: {
          canal_id: string;
          usuario_id: string;
          silenciado_ate: string | null;
        };
        Insert: {
          canal_id: string;
          usuario_id: string;
          silenciado_ate?: string | null;
        };
        Update: {
          silenciado_ate?: string | null;
        };
      };

      mensagens: {
        Row: {
          id: string;
          canal_id: string;
          autor_id: string;
          conteudo: string | null;
          tipo: "texto" | "audio" | "sistema" | "task_share";
          audio_url: string | null;
          audio_duracao: number | null;
          task_share_id: string | null;
          parent_id: string | null;
          thread_count: number;
          mencoes: string[];
          editado: boolean;
          deletado: boolean;
          criado_em: string;
          editado_em: string | null;
        };
        Insert: {
          id?: string;
          canal_id: string;
          autor_id: string;
          conteudo?: string | null;
          tipo?: "texto" | "audio" | "sistema" | "task_share";
          audio_url?: string | null;
          audio_duracao?: number | null;
          task_share_id?: string | null;
          parent_id?: string | null;
          mencoes?: string[];
        };
        Update: {
          conteudo?: string | null;
          editado?: boolean;
          deletado?: boolean;
          editado_em?: string | null;
        };
      };

      notificacoes: {
        Row: {
          id: string;
          usuario_id: string;
          tipo: string;
          titulo: string;
          corpo: string | null;
          lida: boolean;
          link_interno: string | null;
          entidade_id: string | null;
          entidade_tipo: "tarefa" | "canal" | "aprovacao" | "okr" | null;
          criada_em: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          tipo: string;
          titulo: string;
          corpo?: string | null;
          lida?: boolean;
          link_interno?: string | null;
          entidade_id?: string | null;
          entidade_tipo?: "tarefa" | "canal" | "aprovacao" | "okr" | null;
        };
        Update: {
          lida?: boolean;
        };
      };

      preferencias_notificacao: {
        Row: {
          usuario_id: string;
          preferencias: Json;
          atualizado_em: string;
        };
        Insert: {
          usuario_id: string;
          preferencias?: Json;
        };
        Update: {
          preferencias?: Json;
          atualizado_em?: string;
        };
      };
    };

    Views: {
      v_tarefas: {
        Row: {
          // todos os campos de tarefas +
          responsavel_nome: string | null;
          responsavel_avatar: string | null;
          departamento_nome: string;
          departamento_cor: string;
          total_subtarefas: number;
          subtarefas_concluidas: number;
          total_comentarios: number;
          total_anexos: number;
        };
      };
      v_key_results: {
        Row: {
          // todos os campos de key_results +
          status_calculado: "on_track" | "at_risk" | "in_danger";
          okr_titulo: string;
          periodo: string;
        };
      };
    };

    Functions: {
      is_admin: {
        Args: { user_id: string };
        Returns: boolean;
      };
      has_dept_access: {
        Args: { user_id: string; dept_id: string };
        Returns: boolean;
      };
    };
  };
}

// =============================================================================
// Tipos de conveniência para uso nos componentes
// =============================================================================
export type Profile         = Database["public"]["Tables"]["profiles"]["Row"];
export type Departamento    = Database["public"]["Tables"]["departamentos"]["Row"];
export type Tarefa          = Database["public"]["Tables"]["tarefas"]["Row"];
export type TarefaInsert    = Database["public"]["Tables"]["tarefas"]["Insert"];
export type TarefaUpdate    = Database["public"]["Tables"]["tarefas"]["Update"];
export type Subtarefa       = Database["public"]["Tables"]["subtarefas"]["Row"];
export type TarefaLink      = Database["public"]["Tables"]["tarefa_links"]["Row"];
export type TarefaPapel     = Database["public"]["Tables"]["tarefa_papeis"]["Row"];
export type Comentario      = Database["public"]["Tables"]["comentarios"]["Row"];
export type Anexo           = Database["public"]["Tables"]["anexos"]["Row"];
export type Atividade       = Database["public"]["Tables"]["atividades"]["Row"];
export type OKR             = Database["public"]["Tables"]["okrs"]["Row"];
export type KeyResult       = Database["public"]["Tables"]["key_results"]["Row"];
export type KRSnapshot      = Database["public"]["Tables"]["kr_snapshots"]["Row"];
export type Documento       = Database["public"]["Tables"]["documentos"]["Row"];
export type Canal           = Database["public"]["Tables"]["canais"]["Row"];
export type Mensagem        = Database["public"]["Tables"]["mensagens"]["Row"];
export type Notificacao     = Database["public"]["Tables"]["notificacoes"]["Row"];
export type StatusConfig    = Database["public"]["Tables"]["status_config"]["Row"];

// Tarefa com joins da view v_tarefas
export type TarefaCompleta = Tarefa & {
  responsavel_nome: string | null;
  responsavel_avatar: string | null;
  departamento_nome: string;
  departamento_cor: string;
  total_subtarefas: number;
  subtarefas_concluidas: number;
  total_comentarios: number;
  total_anexos: number;
};
