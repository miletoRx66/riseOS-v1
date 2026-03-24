-- =============================================================================
-- RiseOS — Migration 001: Initial Schema
-- Criado em: 22/03/2026
-- =============================================================================
-- Convenções:
--   • PKs: uuid geradas com gen_random_uuid()
--   • Timestamps: timestamptz (UTC), sempre criado_em + atualizado_em
--   • Soft delete: coluna deletado boolean default false onde aplicável
--   • FKs para auth.users via tabela pública "profiles"
--   • RLS habilitada em todas as tabelas
-- =============================================================================

-- Habilitar extensões necessárias
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- busca full-text fuzzy

-- =============================================================================
-- FUNÇÃO UTILITÁRIA: atualiza atualizado_em automaticamente
-- =============================================================================
create or replace function set_atualizado_em()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

-- =============================================================================
-- 1. DEPARTAMENTOS
-- =============================================================================
create table departamentos (
  id        text primary key,  -- 'marketing' | 'ops' | 'comercial' | 'produto' | 'financeiro'
  nome      text not null,
  cor       text not null,     -- hex: '#14E9BC'
  icon      text not null,     -- nome do ícone Lucide
  criado_em timestamptz default now()
);

comment on table departamentos is 'Departamentos da organização. ID é slug textual.';

-- =============================================================================
-- 2. PROFILES (estende auth.users do Supabase)
-- =============================================================================
create table profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  nome             text not null,
  cargo            text,
  departamento_id  text references departamentos(id),
  avatar_url       text,
  tema             text default 'dark' check (tema in ('dark', 'light')),
  criado_em        timestamptz default now(),
  atualizado_em    timestamptz default now()
);

comment on table profiles is 'Dados públicos do usuário. Espelha auth.users com campos extras.';

create trigger trg_profiles_atualizado_em
  before update on profiles
  for each row execute function set_atualizado_em();

-- =============================================================================
-- 3. PERMISSÕES (RBAC por departamento)
-- =============================================================================
create table permissoes (
  id               uuid primary key default gen_random_uuid(),
  usuario_id       uuid not null references profiles(id) on delete cascade,
  tipo             text not null check (tipo in ('admin', 'manager', 'member', 'viewer')),
  departamento_id  text references departamentos(id),  -- null = permissão global
  criado_em        timestamptz default now(),
  unique (usuario_id, tipo, departamento_id)
);

comment on table permissoes is 'Papéis do usuário. departamento_id null = escopo global (admin).';

-- =============================================================================
-- 4. STATUS CONFIG (pipelines de status por departamento)
-- =============================================================================
create table status_config (
  id               uuid primary key default gen_random_uuid(),
  departamento_id  text references departamentos(id),  -- null = global padrão
  label            text not null,
  cor              text not null,
  ordem            int  not null,
  eh_final         boolean default false,               -- conta como "concluído"
  criado_em        timestamptz default now()
);

comment on table status_config is 'Status customizáveis por departamento. eh_final=true conta como concluído nas métricas.';

-- Índice para buscar config de um departamento ordenada
create index idx_status_config_dept on status_config(departamento_id, ordem);

-- =============================================================================
-- 5. FLUXOS DE APROVAÇÃO (templates)
-- =============================================================================
create table fluxos_aprovacao (
  id               uuid primary key default gen_random_uuid(),
  nome             text not null,
  descricao        text,
  departamento_id  text references departamentos(id),  -- null = global
  criado_por       uuid not null references profiles(id),
  ativo            boolean default true,
  criado_em        timestamptz default now()
);

create table aprovacao_steps (
  id                  uuid primary key default gen_random_uuid(),
  fluxo_id            uuid not null references fluxos_aprovacao(id) on delete cascade,
  ordem               int  not null,
  label               text not null,
  aprovador_id        uuid references profiles(id),   -- aprovador fixo (ou nulo)
  papel_aprovador     text,                           -- 'manager' | 'director' | 'admin' (fallback)
  prazo_horas         int,                            -- SLA em horas
  obriga_comentario   boolean default false
);

create index idx_aprovacao_steps_fluxo on aprovacao_steps(fluxo_id, ordem);

-- =============================================================================
-- 6. TAREFA TEMPLATES
-- =============================================================================
create table tarefa_templates (
  id                   uuid primary key default gen_random_uuid(),
  nome                 text not null,
  descricao            text,
  departamento_id      text references departamentos(id),  -- null = global
  tipo                 text,
  prioridade           text default 'media' check (prioridade in ('alta', 'media', 'baixa')),
  tags                 text[] default '{}',
  sla_dias             int,
  fluxo_aprovacao_id   uuid references fluxos_aprovacao(id),
  criado_por           uuid not null references profiles(id),
  usos                 int default 0,
  criado_em            timestamptz default now(),
  atualizado_em        timestamptz default now()
);

create trigger trg_tarefa_templates_atualizado_em
  before update on tarefa_templates
  for each row execute function set_atualizado_em();

create table template_subtarefas (
  id                 uuid primary key default gen_random_uuid(),
  template_id        uuid not null references tarefa_templates(id) on delete cascade,
  titulo             text not null,
  ordem              int  not null,
  responsavel_papel  text  -- 'executor' | 'revisor'
);

create table template_links (
  id           uuid primary key default gen_random_uuid(),
  template_id  uuid not null references tarefa_templates(id) on delete cascade,
  titulo       text not null,
  url          text not null,
  tipo         text default 'outro'
);

create table template_favoritos (
  usuario_id   uuid not null references profiles(id) on delete cascade,
  template_id  uuid not null references tarefa_templates(id) on delete cascade,
  criado_em    timestamptz default now(),
  primary key (usuario_id, template_id)
);

-- =============================================================================
-- 7. TAREFAS (tabela central)
-- =============================================================================
create table tarefas (
  id               uuid primary key default gen_random_uuid(),
  titulo           text not null,
  descricao        text,
  departamento_id  text not null references departamentos(id),
  status           text not null default 'planejamento',
  prioridade       text not null default 'media' check (prioridade in ('alta', 'media', 'baixa')),
  tipo             text default 'outro' check (
                     tipo in ('backend','frontend','infra','design','marketing',
                              'comercial','ops','pesquisa','outro')
                   ),
  visibilidade     text not null default 'departamento' check (
                     visibilidade in ('publica','departamento','pessoal')
                   ),
  responsavel_id   uuid references profiles(id),
  criado_por       uuid not null references profiles(id),
  prazo            date,
  data_inicio      date,
  progresso        int default 0 check (progresso between 0 and 100),
  tags             text[] default '{}',
  template_id      uuid references tarefa_templates(id),
  aprovacao_id     uuid,  -- FK para aprovacao_instancias (circular, set após criação)
  deletado         boolean default false,
  criado_em        timestamptz default now(),
  atualizado_em    timestamptz default now()
);

comment on table tarefas is 'Tabela central de gestão de tarefas. visibilidade=pessoal só visível ao criador.';

create trigger trg_tarefas_atualizado_em
  before update on tarefas
  for each row execute function set_atualizado_em();

-- Índices principais
create index idx_tarefas_departamento    on tarefas(departamento_id) where not deletado;
create index idx_tarefas_responsavel     on tarefas(responsavel_id)  where not deletado;
create index idx_tarefas_criado_por      on tarefas(criado_por)      where not deletado;
create index idx_tarefas_status          on tarefas(status)          where not deletado;
create index idx_tarefas_prioridade      on tarefas(prioridade)      where not deletado;
create index idx_tarefas_prazo           on tarefas(prazo)           where not deletado;
create index idx_tarefas_tipo            on tarefas(tipo)            where not deletado;
create index idx_tarefas_visibilidade    on tarefas(visibilidade)    where not deletado;
-- Full-text search
create index idx_tarefas_titulo_fts      on tarefas using gin(to_tsvector('portuguese', titulo));
create index idx_tarefas_descricao_fts   on tarefas using gin(to_tsvector('portuguese', coalesce(descricao, '')));
-- Tags (array)
create index idx_tarefas_tags            on tarefas using gin(tags);

-- =============================================================================
-- 8. SUBTAREFAS
-- =============================================================================
create table subtarefas (
  id              uuid primary key default gen_random_uuid(),
  tarefa_id       uuid not null references tarefas(id) on delete cascade,
  titulo          text not null,
  concluida       boolean default false,
  responsavel_id  uuid references profiles(id),
  ordem           int default 0,
  criado_em       timestamptz default now()
);

create index idx_subtarefas_tarefa on subtarefas(tarefa_id, ordem);

-- =============================================================================
-- 9. LINKS EXTERNOS DAS TAREFAS
-- =============================================================================
create table tarefa_links (
  id         uuid primary key default gen_random_uuid(),
  tarefa_id  uuid not null references tarefas(id) on delete cascade,
  titulo     text not null,
  url        text not null,
  tipo       text default 'outro' check (
               tipo in ('figma','drive','github','notion','lark','jira','outro')
             ),
  criado_em  timestamptz default now()
);

create index idx_tarefa_links_tarefa on tarefa_links(tarefa_id);

-- =============================================================================
-- 10. PAPÉIS POR TAREFA
-- =============================================================================
create table tarefa_papeis (
  id          uuid primary key default gen_random_uuid(),
  tarefa_id   uuid not null references tarefas(id) on delete cascade,
  usuario_id  uuid not null references profiles(id) on delete cascade,
  papel       text not null check (papel in ('executor','revisor','aprovador','observador')),
  criado_em   timestamptz default now(),
  unique (tarefa_id, usuario_id)
);

create index idx_tarefa_papeis_tarefa   on tarefa_papeis(tarefa_id);
create index idx_tarefa_papeis_usuario  on tarefa_papeis(usuario_id);

-- =============================================================================
-- 11. COMENTÁRIOS (com threading)
-- =============================================================================
create table comentarios (
  id          uuid primary key default gen_random_uuid(),
  tarefa_id   uuid not null references tarefas(id) on delete cascade,
  autor_id    uuid not null references profiles(id),
  conteudo    text not null,
  parent_id   uuid references comentarios(id),      -- threading
  mencoes     uuid[] default '{}',                   -- profile IDs mencionados
  editado     boolean default false,
  deletado    boolean default false,
  criado_em   timestamptz default now(),
  editado_em  timestamptz
);

create index idx_comentarios_tarefa    on comentarios(tarefa_id) where not deletado;
create index idx_comentarios_parent    on comentarios(parent_id) where parent_id is not null;
create index idx_comentarios_mencoes   on comentarios using gin(mencoes);

-- =============================================================================
-- 12. ANEXOS
-- =============================================================================
create table anexos (
  id            uuid primary key default gen_random_uuid(),
  tarefa_id     uuid not null references tarefas(id) on delete cascade,
  nome          text not null,
  tipo_mime     text,
  tamanho_bytes bigint,
  storage_path  text not null,      -- caminho no Supabase Storage
  url_publica   text,
  upload_por    uuid not null references profiles(id),
  criado_em     timestamptz default now()
);

create index idx_anexos_tarefa on anexos(tarefa_id);

-- =============================================================================
-- 13. ATIVIDADES (log imutável de auditoria)
-- =============================================================================
create table atividades (
  id          uuid primary key default gen_random_uuid(),
  tarefa_id   uuid not null references tarefas(id) on delete cascade,
  tipo        text not null check (
                tipo in ('criacao','status','comentario','anexo','subtarefa',
                         'edicao','aprovacao','papel','link')
              ),
  descricao   text not null,
  usuario_id  uuid not null references profiles(id),
  metadata    jsonb default '{}',   -- dados extras (ex: status anterior, novo status)
  criado_em   timestamptz default now()
);

comment on table atividades is 'Log append-only de auditoria. Nunca deve ser deletado ou editado.';

create index idx_atividades_tarefa on atividades(tarefa_id, criado_em desc);

-- =============================================================================
-- 14. INSTÂNCIAS DE APROVAÇÃO (por tarefa)
-- =============================================================================
create table aprovacao_instancias (
  id            uuid primary key default gen_random_uuid(),
  tarefa_id     uuid not null references tarefas(id) on delete cascade,
  fluxo_id      uuid not null references fluxos_aprovacao(id),
  step_atual    int default 0,
  status        text not null default 'pendente' check (
                  status in ('pendente','aprovado','rejeitado','em-revisao')
                ),
  criada_em     timestamptz default now(),
  concluida_em  timestamptz
);

-- Adicionar FK de volta em tarefas agora que aprovacao_instancias existe
alter table tarefas
  add constraint fk_tarefas_aprovacao
  foreign key (aprovacao_id) references aprovacao_instancias(id);

create table aprovacao_decisoes (
  id             uuid primary key default gen_random_uuid(),
  instancia_id   uuid not null references aprovacao_instancias(id) on delete cascade,
  step_id        uuid not null references aprovacao_steps(id),
  aprovador_id   uuid not null references profiles(id),
  decisao        text not null check (decisao in ('aprovado','rejeitado','revisao')),
  comentario     text,
  delegado_para  uuid references profiles(id),
  criada_em      timestamptz default now()
);

-- =============================================================================
-- 15. OKRs
-- =============================================================================
create table okrs (
  id               uuid primary key default gen_random_uuid(),
  titulo           text not null,
  departamento_id  text not null references departamentos(id),
  periodo          text not null,   -- 'Q1 2026'
  responsavel_id   uuid not null references profiles(id),
  data_inicio      date,
  data_fim         date,
  progresso        int default 0 check (progresso between 0 and 100),
  visibilidade     text default 'departamento' check (visibilidade in ('publica','departamento')),
  criado_em        timestamptz default now(),
  atualizado_em    timestamptz default now()
);

create trigger trg_okrs_atualizado_em
  before update on okrs
  for each row execute function set_atualizado_em();

create table key_results (
  id             uuid primary key default gen_random_uuid(),
  okr_id         uuid not null references okrs(id) on delete cascade,
  descricao      text not null,
  metrica        text,
  valor_inicial  numeric default 0,
  valor_meta     numeric not null,
  valor_atual    numeric default 0,
  progresso      int default 0 check (progresso between 0 and 100),
  unidade        text,
  status         text default 'on_track' check (status in ('on_track','at_risk','in_danger')),
  criado_em      timestamptz default now(),
  atualizado_em  timestamptz default now()
);

create trigger trg_key_results_atualizado_em
  before update on key_results
  for each row execute function set_atualizado_em();

create index idx_key_results_okr on key_results(okr_id);

create table kr_snapshots (
  id              uuid primary key default gen_random_uuid(),
  kr_id           uuid not null references key_results(id) on delete cascade,
  valor           numeric not null,
  registrado_por  uuid not null references profiles(id),
  comentario      text,
  criado_em       timestamptz default now()
);

create index idx_kr_snapshots_kr on kr_snapshots(kr_id, criado_em desc);

-- Relação OKR ↔ Tarefas (N:N)
create table okr_tarefas (
  okr_id     uuid not null references okrs(id) on delete cascade,
  tarefa_id  uuid not null references tarefas(id) on delete cascade,
  primary key (okr_id, tarefa_id)
);

-- =============================================================================
-- 16. DOCUMENTOS
-- =============================================================================
create table documentos (
  id               uuid primary key default gen_random_uuid(),
  titulo           text not null,
  departamento_id  text not null references departamentos(id),
  tipo             text not null check (
                     tipo in ('documento','manual','apresentacao',
                              'especificacao','guia','diagrama')
                   ),
  autor_id         uuid not null references profiles(id),
  storage_path     text,
  url_publica      text,
  tamanho_bytes    bigint,
  gitbook_url      text,
  deletado         boolean default false,
  criado_em        timestamptz default now(),
  atualizado_em    timestamptz default now()
);

create trigger trg_documentos_atualizado_em
  before update on documentos
  for each row execute function set_atualizado_em();

create index idx_documentos_departamento on documentos(departamento_id) where not deletado;
create index idx_documentos_fts          on documentos using gin(to_tsvector('portuguese', titulo));

-- =============================================================================
-- 17. MENSAGENS E CANAIS
-- =============================================================================
create table canais (
  id               uuid primary key default gen_random_uuid(),
  nome             text,
  tipo             text not null check (tipo in ('departamento','privado','temporario','p2p')),
  departamento_id  text references departamentos(id),
  arquivado        boolean default false,
  expira_em        timestamptz,
  criado_por       uuid not null references profiles(id),
  criado_em        timestamptz default now()
);

create index idx_canais_departamento on canais(departamento_id) where not arquivado;

create table canal_membros (
  canal_id       uuid not null references canais(id) on delete cascade,
  usuario_id     uuid not null references profiles(id) on delete cascade,
  silenciado_ate timestamptz,   -- null = não silenciado; far future = indefinido
  primary key (canal_id, usuario_id)
);

create index idx_canal_membros_usuario on canal_membros(usuario_id);

create table mensagens (
  id            uuid primary key default gen_random_uuid(),
  canal_id      uuid not null references canais(id) on delete cascade,
  autor_id      uuid not null references profiles(id),
  conteudo      text,
  tipo          text not null default 'texto' check (
                  tipo in ('texto','audio','sistema','task_share')
                ),
  audio_url     text,
  audio_duracao int,            -- segundos
  task_share_id uuid references tarefas(id),
  parent_id     uuid references mensagens(id),    -- threading
  thread_count  int default 0,
  mencoes       uuid[] default '{}',
  editado       boolean default false,
  deletado      boolean default false,
  criado_em     timestamptz default now(),
  editado_em    timestamptz
);

create index idx_mensagens_canal    on mensagens(canal_id, criado_em desc) where not deletado;
create index idx_mensagens_parent   on mensagens(parent_id) where parent_id is not null;
create index idx_mensagens_fts      on mensagens using gin(to_tsvector('portuguese', coalesce(conteudo, '')));

-- =============================================================================
-- 18. NOTIFICAÇÕES
-- =============================================================================
create table notificacoes (
  id              uuid primary key default gen_random_uuid(),
  usuario_id      uuid not null references profiles(id) on delete cascade,
  tipo            text not null,   -- ver NotificacaoTipo na SPEC_TECNICA_V2
  titulo          text not null,
  corpo           text,
  lida            boolean default false,
  link_interno    text,            -- rota React: '/tarefas/uuid'
  entidade_id     uuid,
  entidade_tipo   text check (entidade_tipo in ('tarefa','canal','aprovacao','okr')),
  criada_em       timestamptz default now()
);

create index idx_notificacoes_usuario on notificacoes(usuario_id, lida, criada_em desc);

create table preferencias_notificacao (
  usuario_id    uuid primary key references profiles(id) on delete cascade,
  preferencias  jsonb default '{}',
  atualizado_em timestamptz default now()
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Habilitar RLS em todas as tabelas
alter table profiles               enable row level security;
alter table permissoes             enable row level security;
alter table departamentos          enable row level security;
alter table status_config          enable row level security;
alter table tarefas                enable row level security;
alter table subtarefas             enable row level security;
alter table tarefa_links           enable row level security;
alter table tarefa_papeis          enable row level security;
alter table comentarios            enable row level security;
alter table anexos                 enable row level security;
alter table atividades             enable row level security;
alter table fluxos_aprovacao       enable row level security;
alter table aprovacao_steps        enable row level security;
alter table aprovacao_instancias   enable row level security;
alter table aprovacao_decisoes     enable row level security;
alter table tarefa_templates       enable row level security;
alter table template_subtarefas    enable row level security;
alter table template_links         enable row level security;
alter table template_favoritos     enable row level security;
alter table okrs                   enable row level security;
alter table key_results            enable row level security;
alter table kr_snapshots           enable row level security;
alter table okr_tarefas            enable row level security;
alter table documentos             enable row level security;
alter table canais                 enable row level security;
alter table canal_membros          enable row level security;
alter table mensagens              enable row level security;
alter table notificacoes           enable row level security;
alter table preferencias_notificacao enable row level security;

-- -----------------------------------------------------------------------
-- Função helper: verifica se usuário é admin
-- -----------------------------------------------------------------------
create or replace function is_admin(user_id uuid)
returns boolean as $$
  select exists (
    select 1 from permissoes
    where usuario_id = user_id
      and tipo = 'admin'
      and departamento_id is null
  );
$$ language sql security definer;

-- Função helper: verifica acesso ao departamento
create or replace function has_dept_access(user_id uuid, dept_id text)
returns boolean as $$
  select exists (
    select 1 from permissoes
    where usuario_id = user_id
      and (departamento_id = dept_id or departamento_id is null)
  );
$$ language sql security definer;

-- -----------------------------------------------------------------------
-- POLÍTICAS: profiles
-- -----------------------------------------------------------------------
create policy "profiles: leitura pública para autenticados"
  on profiles for select
  to authenticated
  using (true);

create policy "profiles: usuário atualiza o próprio perfil"
  on profiles for update
  to authenticated
  using (id = auth.uid());

-- -----------------------------------------------------------------------
-- POLÍTICAS: departamentos (leitura livre)
-- -----------------------------------------------------------------------
create policy "departamentos: leitura para autenticados"
  on departamentos for select
  to authenticated
  using (true);

create policy "departamentos: escrita somente admin"
  on departamentos for all
  to authenticated
  using (is_admin(auth.uid()));

-- -----------------------------------------------------------------------
-- POLÍTICAS: tarefas
-- -----------------------------------------------------------------------
create policy "tarefas: leitura por visibilidade"
  on tarefas for select
  to authenticated
  using (
    not deletado
    and (
      visibilidade = 'publica'
      or (visibilidade = 'departamento' and has_dept_access(auth.uid(), departamento_id))
      or (visibilidade = 'pessoal' and criado_por = auth.uid())
      or is_admin(auth.uid())
    )
  );

create policy "tarefas: criação por autenticados"
  on tarefas for insert
  to authenticated
  with check (criado_por = auth.uid());

create policy "tarefas: edição por responsável, criador ou admin"
  on tarefas for update
  to authenticated
  using (
    criado_por = auth.uid()
    or responsavel_id = auth.uid()
    or is_admin(auth.uid())
    or exists (
      select 1 from tarefa_papeis
      where tarefa_id = tarefas.id
        and usuario_id = auth.uid()
        and papel in ('executor', 'revisor')
    )
  );

create policy "tarefas: delete (soft) por criador ou admin"
  on tarefas for update
  to authenticated
  using (criado_por = auth.uid() or is_admin(auth.uid()));

-- -----------------------------------------------------------------------
-- POLÍTICAS: comentários
-- -----------------------------------------------------------------------
create policy "comentarios: leitura por acesso à tarefa"
  on comentarios for select
  to authenticated
  using (
    not deletado
    and exists (
      select 1 from tarefas t
      where t.id = comentarios.tarefa_id
        and not t.deletado
        and (
          t.visibilidade = 'publica'
          or (t.visibilidade = 'departamento' and has_dept_access(auth.uid(), t.departamento_id))
          or (t.visibilidade = 'pessoal' and t.criado_por = auth.uid())
          or is_admin(auth.uid())
        )
    )
  );

create policy "comentarios: inserção por autenticados"
  on comentarios for insert
  to authenticated
  with check (autor_id = auth.uid());

create policy "comentarios: edição pelo autor"
  on comentarios for update
  to authenticated
  using (autor_id = auth.uid());

-- -----------------------------------------------------------------------
-- POLÍTICAS: notificações
-- -----------------------------------------------------------------------
create policy "notificacoes: somente o destinatário lê"
  on notificacoes for select
  to authenticated
  using (usuario_id = auth.uid());

create policy "notificacoes: somente o destinatário atualiza"
  on notificacoes for update
  to authenticated
  using (usuario_id = auth.uid());

-- -----------------------------------------------------------------------
-- POLÍTICAS: mensagens
-- -----------------------------------------------------------------------
create policy "mensagens: leitura por membros do canal"
  on mensagens for select
  to authenticated
  using (
    not deletado
    and exists (
      select 1 from canal_membros
      where canal_id = mensagens.canal_id
        and usuario_id = auth.uid()
    )
  );

create policy "mensagens: inserção por membros do canal"
  on mensagens for insert
  to authenticated
  with check (
    autor_id = auth.uid()
    and exists (
      select 1 from canal_membros
      where canal_id = mensagens.canal_id
        and usuario_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------
-- POLÍTICAS: tabelas filho (herdam acesso da tarefa pai)
-- -----------------------------------------------------------------------
-- subtarefas
create policy "subtarefas: acesso por membro da tarefa"
  on subtarefas for all
  to authenticated
  using (
    exists (
      select 1 from tarefas t
      where t.id = subtarefas.tarefa_id and not t.deletado
        and (
          t.visibilidade = 'publica'
          or (t.visibilidade = 'departamento' and has_dept_access(auth.uid(), t.departamento_id))
          or t.criado_por = auth.uid()
          or is_admin(auth.uid())
        )
    )
  );

-- tarefa_links
create policy "tarefa_links: acesso por membro da tarefa"
  on tarefa_links for all
  to authenticated
  using (
    exists (
      select 1 from tarefas t
      where t.id = tarefa_links.tarefa_id and not t.deletado
        and (
          t.visibilidade = 'publica'
          or (t.visibilidade = 'departamento' and has_dept_access(auth.uid(), t.departamento_id))
          or t.criado_por = auth.uid()
          or is_admin(auth.uid())
        )
    )
  );

-- anexos
create policy "anexos: acesso por membro da tarefa"
  on anexos for all
  to authenticated
  using (
    exists (
      select 1 from tarefas t
      where t.id = anexos.tarefa_id and not t.deletado
        and (
          t.visibilidade = 'publica'
          or (t.visibilidade = 'departamento' and has_dept_access(auth.uid(), t.departamento_id))
          or t.criado_por = auth.uid()
          or is_admin(auth.uid())
        )
    )
  );

-- atividades
create policy "atividades: leitura por membro da tarefa"
  on atividades for select
  to authenticated
  using (
    exists (
      select 1 from tarefas t
      where t.id = atividades.tarefa_id and not t.deletado
    )
  );

-- preferencias_notificacao
create policy "preferencias: somente o próprio usuário"
  on preferencias_notificacao for all
  to authenticated
  using (usuario_id = auth.uid());

-- OKRs: leitura por visibilidade
create policy "okrs: leitura por visibilidade"
  on okrs for select
  to authenticated
  using (
    visibilidade = 'publica'
    or has_dept_access(auth.uid(), departamento_id)
    or is_admin(auth.uid())
  );

-- documentos
create policy "documentos: leitura por membro do departamento"
  on documentos for select
  to authenticated
  using (
    not deletado
    and has_dept_access(auth.uid(), departamento_id)
  );

-- =============================================================================
-- TRIGGER: auto-criar profile após signup no Supabase Auth
-- =============================================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =============================================================================
-- TRIGGER: incrementar thread_count ao responder mensagem
-- =============================================================================
create or replace function increment_thread_count()
returns trigger as $$
begin
  if new.parent_id is not null then
    update mensagens set thread_count = thread_count + 1
    where id = new.parent_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_mensagem_thread_count
  after insert on mensagens
  for each row execute function increment_thread_count();

-- =============================================================================
-- VIEWS ÚTEIS
-- =============================================================================

-- Tarefas com dados do responsável e departamento (evita joins repetitivos)
create view v_tarefas as
  select
    t.*,
    p.nome           as responsavel_nome,
    p.avatar_url     as responsavel_avatar,
    d.nome           as departamento_nome,
    d.cor            as departamento_cor,
    (select count(*) from subtarefas s where s.tarefa_id = t.id)                      as total_subtarefas,
    (select count(*) from subtarefas s where s.tarefa_id = t.id and s.concluida)      as subtarefas_concluidas,
    (select count(*) from comentarios c where c.tarefa_id = t.id and not c.deletado)  as total_comentarios,
    (select count(*) from anexos a where a.tarefa_id = t.id)                          as total_anexos
  from tarefas t
  left join profiles p on p.id = t.responsavel_id
  left join departamentos d on d.id = t.departamento_id
  where not t.deletado;

-- Key Results com status calculado
create view v_key_results as
  select
    kr.*,
    case
      when kr.progresso >= 70 then 'on_track'
      when kr.progresso >= 40 then 'at_risk'
      else 'in_danger'
    end as status_calculado,
    o.titulo as okr_titulo,
    o.periodo
  from key_results kr
  join okrs o on o.id = kr.okr_id;
