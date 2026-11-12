-- =============================================================================
-- RiseOS — Migration 008: Módulo Comercial em três frentes (PRD Comercial & CRM)
--
-- Fase A do PRD de 10/11/2026:
--   • pipeline_parceiros ganha a frente de negócio (trilha) e os campos da
--     esteira Apex / trava de conformidade contratual (API sem contrato).
--   • pipeline_contatos: pontos focais P2P (decisores) de cada parceiro.
--   • pipeline_comentarios ganha o tipo de interação (reunião, ligação...).
--   • crm_clientes passa a ser a base de assessores, com categoria qualitativa,
--     e ganha um feed próprio de relacionamento (crm_cliente_notas).
--
-- Somente estrutura. A classificação dos registros existentes é feita à parte,
-- pela interface ou por script de dados — nunca com nomes de clientes aqui.
-- Aditiva: o frontend atual continua funcionando antes do novo deploy.
-- Idempotente: pode ser executada mais de uma vez.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1. pipeline_parceiros: trilha + esteira Apex + trava contratual
-- -----------------------------------------------------------------------------

alter table public.pipeline_parceiros
  add column if not exists trilha              text    not null default 'infraestrutura',
  add column if not exists administradora_apex boolean not null default true,
  add column if not exists usa_software_rise   boolean not null default true,
  add column if not exists contrato_assinado   boolean not null default false,
  add column if not exists api_em_uso          boolean not null default false;

-- Card vermelho "Bloqueio Contratual": consome API sem contrato assinado.
alter table public.pipeline_parceiros
  add column if not exists bloqueio_contratual boolean
    generated always as (api_em_uso and not contrato_assinado) stored;

alter table public.pipeline_parceiros
  drop constraint if exists pipeline_parceiros_trilha_check,
  add  constraint pipeline_parceiros_trilha_check
    check (trilha in ('infraestrutura', 'assessores', 'fidc_like'));

-- Regra Apex: toda abertura com a Apex Group exige a contratação do RiseOS.
alter table public.pipeline_parceiros
  drop constraint if exists pipeline_parceiros_apex_exige_rise,
  add  constraint pipeline_parceiros_apex_exige_rise
    check (not administradora_apex or usa_software_rise);

create index if not exists pipeline_parceiros_trilha_idx
  on public.pipeline_parceiros (trilha);

-- -----------------------------------------------------------------------------
-- 2. pipeline_contatos: pontos focais P2P
-- -----------------------------------------------------------------------------

create table if not exists public.pipeline_contatos (
  id          uuid primary key default gen_random_uuid(),
  parceiro_id uuid not null references public.pipeline_parceiros(id) on delete cascade,
  nome        text not null,
  papel       text,
  decisor     boolean not null default true,
  telefone    text,
  email       text,
  criado_por  uuid references public.profiles(id) default auth.uid(),
  criado_em   timestamptz not null default now()
);

create index if not exists pipeline_contatos_parceiro_idx
  on public.pipeline_contatos (parceiro_id);

alter table public.pipeline_contatos enable row level security;

drop policy if exists "pipeline_contatos: comercial" on public.pipeline_contatos;
create policy "pipeline_contatos: comercial" on public.pipeline_contatos
  for all to authenticated
  using      (has_dept_access(auth.uid(), 'comercial'))
  with check (has_dept_access(auth.uid(), 'comercial'));

-- -----------------------------------------------------------------------------
-- 3. Tipo de interação na linha do tempo dos parceiros
-- -----------------------------------------------------------------------------

alter table public.pipeline_comentarios
  add column if not exists tipo text not null default 'nota';

alter table public.pipeline_comentarios
  drop constraint if exists pipeline_comentarios_tipo_check,
  add  constraint pipeline_comentarios_tipo_check
    check (tipo in ('nota', 'reuniao', 'ligacao', 'whatsapp', 'email'));

-- -----------------------------------------------------------------------------
-- 4. crm_clientes → base de assessores
-- -----------------------------------------------------------------------------

-- NULL = ainda não classificado.
alter table public.crm_clientes
  add column if not exists categoria_assessor text;

alter table public.crm_clientes
  drop constraint if exists crm_clientes_categoria_assessor_check,
  add  constraint crm_clientes_categoria_assessor_check
    check (categoria_assessor in ('nativo', 'comprometido', 'potencial'));

-- -----------------------------------------------------------------------------
-- 5. crm_cliente_notas: feed de saúde do relacionamento com o assessor
-- -----------------------------------------------------------------------------

create table if not exists public.crm_cliente_notas (
  id         uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.crm_clientes(id) on delete cascade,
  usuario_id uuid not null references public.profiles(id) default auth.uid(),
  tipo       text not null default 'nota'
    check (tipo in ('nota', 'reuniao', 'ligacao', 'whatsapp', 'email')),
  conteudo   text not null,
  criado_em  timestamptz not null default now()
);

create index if not exists crm_cliente_notas_cliente_idx
  on public.crm_cliente_notas (cliente_id, criado_em);

alter table public.crm_cliente_notas enable row level security;

drop policy if exists "crm_cliente_notas: select" on public.crm_cliente_notas;
create policy "crm_cliente_notas: select" on public.crm_cliente_notas
  for select to authenticated
  using (has_dept_access(auth.uid(), 'comercial'));

drop policy if exists "crm_cliente_notas: insert" on public.crm_cliente_notas;
create policy "crm_cliente_notas: insert" on public.crm_cliente_notas
  for insert to authenticated
  with check (usuario_id = auth.uid() and has_dept_access(auth.uid(), 'comercial'));

drop policy if exists "crm_cliente_notas: delete" on public.crm_cliente_notas;
create policy "crm_cliente_notas: delete" on public.crm_cliente_notas
  for delete to authenticated
  using (usuario_id = auth.uid() or is_admin(auth.uid()));

commit;
