-- =============================================================================
-- RiseOS — Migration 003: Policies restantes + seed + admin
-- Executar APÓS a 002 (que pode ter falhado no meio)
-- As policies da 002 que já rodaram com sucesso serão ignoradas pelo Supabase
-- =============================================================================

-- key_results: edição (corrigido — tabela não tem criado_por, usa okr.responsavel_id)
create policy "key_results: edição pelo responsável do OKR ou admin"
  on key_results for update
  to authenticated
  using (
    is_admin(auth.uid())
    or exists (
      select 1 from okrs o
      where o.id = key_results.okr_id
        and o.responsavel_id = auth.uid()
    )
  );

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

-- okrs: criação e edição (corrigido — usa responsavel_id, não criado_por)
create policy "okrs: criação por autenticado"
  on okrs for insert
  to authenticated
  with check (responsavel_id = auth.uid() or is_admin(auth.uid()));

create policy "okrs: edição pelo responsável ou admin"
  on okrs for update
  to authenticated
  using (responsavel_id = auth.uid() or is_admin(auth.uid()));

-- documentos: criação (usa autor_id, não criado_por)
create policy "documentos: criação por autenticado"
  on documentos for insert
  to authenticated
  with check (autor_id = auth.uid());

-- =============================================================================
-- SEED: status_config
-- =============================================================================
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

-- =============================================================================
-- PRIMEIRO ADMIN: admin@rise.com
-- =============================================================================
insert into permissoes (usuario_id, tipo, departamento_id)
select p.id, 'admin', null
from profiles p
join auth.users u on u.id = p.id
where u.email = 'admin@rise.com'
on conflict (usuario_id, tipo, departamento_id) do nothing;
