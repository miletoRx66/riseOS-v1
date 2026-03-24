-- =============================================================================
-- RiseOS — Migration 002: Fix RLS + Seed status_config + Primeiro Admin
-- Executar no SQL Editor do Supabase
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. POLÍTICAS RLS (ausentes na migration 001)
-- -----------------------------------------------------------------------------

-- permissoes
create policy "permissoes: usuário lê as próprias"
  on permissoes for select
  to authenticated
  using (usuario_id = auth.uid() or is_admin(auth.uid()));

create policy "permissoes: admin insere"
  on permissoes for insert
  to authenticated
  with check (is_admin(auth.uid()));

create policy "permissoes: admin deleta"
  on permissoes for delete
  to authenticated
  using (is_admin(auth.uid()));

-- status_config
create policy "status_config: leitura para autenticados"
  on status_config for select
  to authenticated
  using (true);

create policy "status_config: escrita somente admin"
  on status_config for insert
  to authenticated
  with check (is_admin(auth.uid()));

create policy "status_config: update somente admin"
  on status_config for update
  to authenticated
  using (is_admin(auth.uid()));

-- key_results (ausente na 001)
create policy "key_results: leitura por acesso ao OKR pai"
  on key_results for select
  to authenticated
  using (
    exists (
      select 1 from okrs o
      where o.id = key_results.okr_id
        and (o.visibilidade = 'publica' or has_dept_access(auth.uid(), o.departamento_id) or is_admin(auth.uid()))
    )
  );

create policy "key_results: criação por autenticados"
  on key_results for insert
  to authenticated
  with check (true);

create policy "key_results: edição pelo criador ou admin"
  on key_results for update
  to authenticated
  using (criado_por = auth.uid() or is_admin(auth.uid()));

-- okr_tarefas
create policy "okr_tarefas: acesso por autenticado"
  on okr_tarefas for all
  to authenticated
  using (true);

-- tarefa_papeis
create policy "tarefa_papeis: acesso por autenticado"
  on tarefa_papeis for all
  to authenticated
  using (true);

-- canal_membros
create policy "canal_membros: acesso por autenticado"
  on canal_membros for all
  to authenticated
  using (true);

-- canais
create policy "canais: acesso por autenticado"
  on canais for all
  to authenticated
  using (true);

-- kr_snapshots
create policy "kr_snapshots: leitura por autenticado"
  on kr_snapshots for select
  to authenticated
  using (true);

create policy "kr_snapshots: inserção por autenticado"
  on kr_snapshots for insert
  to authenticated
  with check (true);

-- atividades
create policy "atividades: inserção por autenticado"
  on atividades for insert
  to authenticated
  with check (true);

-- tarefa_templates
create policy "tarefa_templates: leitura por autenticado"
  on tarefa_templates for select
  to authenticated
  using (true);

create policy "tarefa_templates: criação por autenticado"
  on tarefa_templates for insert
  to authenticated
  with check (criado_por = auth.uid());

create policy "tarefa_templates: edição pelo criador ou admin"
  on tarefa_templates for update
  to authenticated
  using (criado_por = auth.uid() or is_admin(auth.uid()));

-- template_subtarefas, template_links, template_favoritos
create policy "template_subtarefas: acesso por autenticado"
  on template_subtarefas for all
  to authenticated
  using (true);

create policy "template_links: acesso por autenticado"
  on template_links for all
  to authenticated
  using (true);

create policy "template_favoritos: acesso por autenticado"
  on template_favoritos for all
  to authenticated
  using (usuario_id = auth.uid());

-- fluxos_aprovacao, aprovacao_steps, aprovacao_instancias
create policy "fluxos_aprovacao: leitura por autenticado"
  on fluxos_aprovacao for select
  to authenticated
  using (true);

create policy "aprovacao_steps: leitura por autenticado"
  on aprovacao_steps for select
  to authenticated
  using (true);

create policy "aprovacao_instancias: acesso por participante"
  on aprovacao_instancias for all
  to authenticated
  using (true);

-- okrs: criação e edição
create policy "okrs: criação por autenticado"
  on okrs for insert
  to authenticated
  with check (criado_por = auth.uid());

create policy "okrs: edição pelo criador ou admin"
  on okrs for update
  to authenticated
  using (criado_por = auth.uid() or is_admin(auth.uid()));

-- documentos: criação
create policy "documentos: criação por autenticado"
  on documentos for insert
  to authenticated
  with check (criado_por = auth.uid());

-- -----------------------------------------------------------------------------
-- 2. SEED: status_config
-- -----------------------------------------------------------------------------
insert into status_config (departamento_id, label, cor, ordem, eh_final) values
  (null, 'Planejamento', '#6B8AFF', 1, false),
  (null, 'Em Andamento', '#28d939', 2, false),
  (null, 'Pausado',      '#f59e0b', 3, false),
  (null, 'Concluído',    '#bdbdbd', 4, true);

insert into status_config (departamento_id, label, cor, ordem, eh_final) values
  ('marketing', 'Briefing',   '#6B8AFF', 1, false),
  ('marketing', 'Exploração', '#14E9BC', 2, false),
  ('marketing', 'Produção',   '#f59e0b', 3, false),
  ('marketing', 'Revisão',    '#E879F9', 4, false),
  ('marketing', 'Aprovado',   '#28d939', 5, false),
  ('marketing', 'Publicado',  '#bdbdbd', 6, true);

insert into status_config (departamento_id, label, cor, ordem, eh_final) values
  ('ops', 'Backlog',    '#6B8AFF', 1, false),
  ('ops', 'Em Análise', '#14E9BC', 2, false),
  ('ops', 'Execução',   '#f59e0b', 3, false),
  ('ops', 'QA',         '#E879F9', 4, false),
  ('ops', 'Entregue',   '#bdbdbd', 5, true);

-- -----------------------------------------------------------------------------
-- 3. PRIMEIRO ADMIN
-- Promove o usuário com email admin@rise.com a admin global
-- -----------------------------------------------------------------------------
insert into permissoes (usuario_id, tipo, departamento_id)
select p.id, 'admin', null
from profiles p
join auth.users u on u.id = p.id
where u.email = 'admin@rise.com'
on conflict (usuario_id, tipo, departamento_id) do nothing;
