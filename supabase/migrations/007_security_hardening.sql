-- =============================================================================
-- RiseOS — Migration 007: Hardening de segurança (RLS, funções, views, storage)
--
-- Escrita contra o estado REAL do banco de produção (oaqasiaorraprtfzjlfo) em
-- 27/10/2026, não contra as migrations 001–006 do repositório (que estão
-- dessincronizadas). Idempotente: pode ser executada mais de uma vez.
--
-- Convenção de acesso por departamento: has_dept_access(uid, dept) retorna true
-- para quem tem permissão naquele departamento OU permissão global (admin).
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1. FUNÇÕES: search_path fixo + revogar EXECUTE de anon/public
-- -----------------------------------------------------------------------------

alter function public.is_admin(uuid)                         set search_path = public;
alter function public.has_dept_access(uuid, text)            set search_path = public;
alter function public.handle_new_user()                      set search_path = public;
alter function public.grant_admin_to_known_emails()          set search_path = public;
alter function public.fn_notificar_comentario()              set search_path = public;
alter function public.fn_notificar_documento()               set search_path = public;
alter function public.fn_notificar_kr_atualizado()           set search_path = public;
alter function public.fn_notificar_mensagem()                set search_path = public;
alter function public.set_atualizado_em()                    set search_path = public;
alter function public.increment_thread_count()               set search_path = public;
alter function public.registrar_historico_dist_pipeline()    set search_path = public;

-- Funções de trigger / event trigger: ninguém precisa chamá-las pela API.
-- (O EXECUTE não é checado quando o trigger dispara.)
revoke execute on function public.handle_new_user()                   from public, anon, authenticated;
revoke execute on function public.grant_admin_to_known_emails()       from public, anon, authenticated;
revoke execute on function public.fn_notificar_comentario()           from public, anon, authenticated;
revoke execute on function public.fn_notificar_documento()            from public, anon, authenticated;
revoke execute on function public.fn_notificar_kr_atualizado()        from public, anon, authenticated;
revoke execute on function public.fn_notificar_mensagem()             from public, anon, authenticated;
revoke execute on function public.fn_recalc_okr_progresso()           from public, anon, authenticated;
revoke execute on function public.rls_auto_enable()                   from public, anon, authenticated;

-- Helpers usados dentro de policies: precisam de EXECUTE para authenticated.
revoke execute on function public.is_admin(uuid)              from public, anon;
revoke execute on function public.has_dept_access(uuid, text) from public, anon;
grant  execute on function public.is_admin(uuid)              to authenticated;
grant  execute on function public.has_dept_access(uuid, text) to authenticated;

-- RPCs de recorrência (já validam auth.uid() internamente): só usuários logados.
revoke execute on function public.gerar_tarefa_recorrencia_agora(uuid) from public, anon;
revoke execute on function public.retomar_tarefa_recorrencia(uuid)     from public, anon;
grant  execute on function public.gerar_tarefa_recorrencia_agora(uuid) to authenticated;
grant  execute on function public.retomar_tarefa_recorrencia(uuid)     to authenticated;

-- -----------------------------------------------------------------------------
-- 2. RPCs de canais: passam a exigir que o chamador seja o próprio usuário.
--    Assinaturas mantidas para não quebrar src/lib/services/mensagens.ts.
-- -----------------------------------------------------------------------------

create or replace function public.get_or_create_canal_p2p(uid1 uuid, uid2 uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_canal_id uuid;
begin
  if auth.uid() is null or auth.uid() not in (uid1, uid2) then
    raise exception 'Sem permissão para criar esta conversa';
  end if;
  if uid1 = uid2 then
    raise exception 'Conversa precisa de dois participantes distintos';
  end if;
  if not exists (select 1 from profiles where id = uid1)
     or not exists (select 1 from profiles where id = uid2) then
    raise exception 'Usuário não encontrado';
  end if;

  select cm1.canal_id into v_canal_id
  from canal_membros cm1
  join canal_membros cm2 on cm1.canal_id = cm2.canal_id
  join canais c on c.id = cm1.canal_id
  where cm1.usuario_id = uid1
    and cm2.usuario_id = uid2
    and c.tipo = 'p2p'
  limit 1;

  if v_canal_id is not null then
    return v_canal_id;
  end if;

  insert into canais (tipo, criado_por) values ('p2p', auth.uid())
  returning id into v_canal_id;

  insert into canal_membros (canal_id, usuario_id) values (v_canal_id, uid1);
  insert into canal_membros (canal_id, usuario_id) values (v_canal_id, uid2);

  return v_canal_id;
end;
$$;

-- Comportamento mantido: canais de departamento continuam abertos a qualquer
-- usuário logado (Messages.tsx entra em todos automaticamente). A mudança é
-- que só é possível inscrever a si mesmo.
create or replace function public.get_or_create_canal_departamento(dept_id text, uid uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_canal_id uuid;
begin
  if auth.uid() is null or uid <> auth.uid() then
    raise exception 'Sem permissão para entrar neste canal';
  end if;
  if not exists (select 1 from departamentos where id = dept_id) then
    raise exception 'Departamento não encontrado';
  end if;

  select id into v_canal_id from canais
  where departamento_id = dept_id and tipo = 'departamento'
  order by criado_em
  limit 1;

  if v_canal_id is null then
    insert into canais (tipo, departamento_id, criado_por)
    values ('departamento', dept_id, uid)
    returning id into v_canal_id;
  end if;

  insert into canal_membros (canal_id, usuario_id)
  values (v_canal_id, uid)
  on conflict do nothing;

  return v_canal_id;
end;
$$;

revoke execute on function public.get_or_create_canal_p2p(uuid, uuid)          from public, anon;
revoke execute on function public.get_or_create_canal_departamento(text, uuid) from public, anon;
grant  execute on function public.get_or_create_canal_p2p(uuid, uuid)          to authenticated;
grant  execute on function public.get_or_create_canal_departamento(text, uuid) to authenticated;

-- Helper sem recursão de RLS para as policies de canais/canal_membros.
create or replace function public.is_canal_membro(p_canal_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from canal_membros
    where canal_id = p_canal_id and usuario_id = auth.uid()
  );
$$;

revoke execute on function public.is_canal_membro(uuid) from public, anon;
grant  execute on function public.is_canal_membro(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 3. VIEWS: respeitar o RLS de quem consulta
-- -----------------------------------------------------------------------------

alter view public.v_tarefas     set (security_invoker = true);
alter view public.v_key_results set (security_invoker = true);

-- -----------------------------------------------------------------------------
-- 4. MENSAGENS: canais e membros visíveis só para quem participa.
--    Escrita em canais/canal_membros só via RPC (security definer).
-- -----------------------------------------------------------------------------

drop policy if exists "canais: acesso por autenticado" on canais;
drop policy if exists "canais: leitura por membro"     on canais;
create policy "canais: leitura por membro"
  on canais for select to authenticated
  using (is_canal_membro(id));

drop policy if exists "canal_membros: acesso por autenticado"     on canal_membros;
drop policy if exists "canal_membros: leitura por membro do canal" on canal_membros;
drop policy if exists "canal_membros: usuário edita a própria linha" on canal_membros;
create policy "canal_membros: leitura por membro do canal"
  on canal_membros for select to authenticated
  using (is_canal_membro(canal_id));
create policy "canal_membros: usuário edita a própria linha"
  on canal_membros for update to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 5. TAREFAS e tabelas filhas
--    Subconsultas em "tarefas" dentro das policies já passam pelo RLS de
--    tarefas, então "exists (select 1 from tarefas ...)" = "tarefa visível".
-- -----------------------------------------------------------------------------

-- tarefa_papeis: antes qualquer um se tornava "executor" e ganhava UPDATE.
drop policy if exists "tarefa_papeis: acesso por autenticado"          on tarefa_papeis;
drop policy if exists "tarefa_papeis: leitura por quem vê a tarefa"    on tarefa_papeis;
drop policy if exists "tarefa_papeis: escrita pelo criador ou admin"   on tarefa_papeis;
create policy "tarefa_papeis: leitura por quem vê a tarefa"
  on tarefa_papeis for select to authenticated
  using (exists (select 1 from tarefas t where t.id = tarefa_papeis.tarefa_id));
create policy "tarefa_papeis: escrita pelo criador ou admin"
  on tarefa_papeis for all to authenticated
  using (
    is_admin(auth.uid())
    or exists (select 1 from tarefas t where t.id = tarefa_papeis.tarefa_id and t.criado_por = auth.uid())
  )
  with check (
    is_admin(auth.uid())
    or exists (select 1 from tarefas t where t.id = tarefa_papeis.tarefa_id and t.criado_por = auth.uid())
  );

-- comentarios: só comenta em tarefa que consegue ver.
drop policy if exists "comentarios: inserção por autenticados" on comentarios;
create policy "comentarios: inserção por autenticados"
  on comentarios for insert to authenticated
  with check (
    autor_id = auth.uid()
    and exists (select 1 from tarefas t where t.id = comentarios.tarefa_id)
  );

-- atividades: sem forjar autor nem escrever em tarefa invisível.
drop policy if exists "atividades: inserção por autenticado" on atividades;
create policy "atividades: inserção por autenticado"
  on atividades for insert to authenticated
  with check (
    usuario_id = auth.uid()
    and exists (select 1 from tarefas t where t.id = atividades.tarefa_id)
  );

-- aprovacao_instancias: leitura por quem vê a tarefa; escrita só admin.
drop policy if exists "aprovacao_instancias: acesso por participante" on aprovacao_instancias;
drop policy if exists "aprovacao_instancias: leitura por quem vê a tarefa" on aprovacao_instancias;
drop policy if exists "aprovacao_instancias: escrita admin" on aprovacao_instancias;
create policy "aprovacao_instancias: leitura por quem vê a tarefa"
  on aprovacao_instancias for select to authenticated
  using (exists (select 1 from tarefas t where t.id = aprovacao_instancias.tarefa_id));
create policy "aprovacao_instancias: escrita admin"
  on aprovacao_instancias for all to authenticated
  using (is_admin(auth.uid()))
  with check (is_admin(auth.uid()));

-- templates: leitura livre, escrita pelo dono do template ou admin.
drop policy if exists "template_subtarefas: acesso por autenticado" on template_subtarefas;
drop policy if exists "template_subtarefas: leitura"                on template_subtarefas;
drop policy if exists "template_subtarefas: escrita pelo dono"      on template_subtarefas;
create policy "template_subtarefas: leitura"
  on template_subtarefas for select to authenticated
  using (true);
create policy "template_subtarefas: escrita pelo dono"
  on template_subtarefas for all to authenticated
  using (
    is_admin(auth.uid())
    or exists (select 1 from tarefa_templates tt where tt.id = template_subtarefas.template_id and tt.criado_por = auth.uid())
  )
  with check (
    is_admin(auth.uid())
    or exists (select 1 from tarefa_templates tt where tt.id = template_subtarefas.template_id and tt.criado_por = auth.uid())
  );

drop policy if exists "template_links: acesso por autenticado" on template_links;
drop policy if exists "template_links: leitura"                on template_links;
drop policy if exists "template_links: escrita pelo dono"      on template_links;
create policy "template_links: leitura"
  on template_links for select to authenticated
  using (true);
create policy "template_links: escrita pelo dono"
  on template_links for all to authenticated
  using (
    is_admin(auth.uid())
    or exists (select 1 from tarefa_templates tt where tt.id = template_links.template_id and tt.criado_por = auth.uid())
  )
  with check (
    is_admin(auth.uid())
    or exists (select 1 from tarefa_templates tt where tt.id = template_links.template_id and tt.criado_por = auth.uid())
  );

-- -----------------------------------------------------------------------------
-- 6. OKRs
-- -----------------------------------------------------------------------------

-- key_results: criação alinhada com a edição (responsável do OKR ou admin).
drop policy if exists "key_results: criação por autenticados" on key_results;
create policy "key_results: criação por autenticados"
  on key_results for insert to authenticated
  with check (
    is_admin(auth.uid())
    or exists (select 1 from okrs o where o.id = key_results.okr_id and o.responsavel_id = auth.uid())
  );

-- kr_snapshots: leitura por quem vê o KR; inserção por quem edita o KR.
drop policy if exists "kr_snapshots: leitura por autenticado" on kr_snapshots;
drop policy if exists "kr_snapshots: inserção por autenticado" on kr_snapshots;
create policy "kr_snapshots: leitura por autenticado"
  on kr_snapshots for select to authenticated
  using (exists (select 1 from key_results kr where kr.id = kr_snapshots.kr_id));
create policy "kr_snapshots: inserção por autenticado"
  on kr_snapshots for insert to authenticated
  with check (
    registrado_por = auth.uid()
    and (
      is_admin(auth.uid())
      or exists (
        select 1 from key_results kr join okrs o on o.id = kr.okr_id
        where kr.id = kr_snapshots.kr_id and o.responsavel_id = auth.uid()
      )
    )
  );

-- okr_tarefas: leitura por quem vê OKR e tarefa; escrita pelo responsável do OKR.
drop policy if exists "okr_tarefas: acesso por autenticado" on okr_tarefas;
drop policy if exists "okr_tarefas: leitura"                on okr_tarefas;
drop policy if exists "okr_tarefas: escrita pelo responsável do OKR" on okr_tarefas;
create policy "okr_tarefas: leitura"
  on okr_tarefas for select to authenticated
  using (
    exists (select 1 from okrs o where o.id = okr_tarefas.okr_id)
    and exists (select 1 from tarefas t where t.id = okr_tarefas.tarefa_id)
  );
create policy "okr_tarefas: escrita pelo responsável do OKR"
  on okr_tarefas for all to authenticated
  using (
    is_admin(auth.uid())
    or exists (select 1 from okrs o where o.id = okr_tarefas.okr_id and o.responsavel_id = auth.uid())
  )
  with check (
    is_admin(auth.uid())
    or exists (select 1 from okrs o where o.id = okr_tarefas.okr_id and o.responsavel_id = auth.uid())
  );

-- -----------------------------------------------------------------------------
-- 7. NOTIFICAÇÕES: só os triggers (security definer) criam notificações.
--    Antes qualquer usuário podia criar notificação para qualquer outro.
-- -----------------------------------------------------------------------------

drop policy if exists "notificacoes: inserção pelo sistema" on notificacoes;

-- -----------------------------------------------------------------------------
-- 8. FINANCEIRO: leitura restrita a financeiro + admin
--    (policies de escrita existentes já eram restritas e foram mantidas).
-- -----------------------------------------------------------------------------

drop policy if exists "fin_produtos: leitura" on fin_produtos;
create policy "fin_produtos: leitura"
  on fin_produtos for select to authenticated
  using (has_dept_access(auth.uid(), 'financeiro'));

drop policy if exists "fin_snapshots: leitura" on fin_snapshots;
create policy "fin_snapshots: leitura"
  on fin_snapshots for select to authenticated
  using (has_dept_access(auth.uid(), 'financeiro'));

drop policy if exists "fin_transacoes: leitura" on fin_transacoes;
create policy "fin_transacoes: leitura"
  on fin_transacoes for select to authenticated
  using (has_dept_access(auth.uid(), 'financeiro'));

-- -----------------------------------------------------------------------------
-- 9. COMERCIAL (CRM + Pipeline): restrito a comercial + admin.
--    Bate com o gate do frontend (DepartamentoDetail → DepartamentoComercial).
-- -----------------------------------------------------------------------------

drop policy if exists "crm_clientes_all"         on crm_clientes;
drop policy if exists "crm_clientes: comercial"  on crm_clientes;
create policy "crm_clientes: comercial"
  on crm_clientes for all to authenticated
  using (has_dept_access(auth.uid(), 'comercial'))
  with check (has_dept_access(auth.uid(), 'comercial'));

drop policy if exists "crm_operacoes_all"        on crm_operacoes;
drop policy if exists "crm_operacoes: comercial" on crm_operacoes;
create policy "crm_operacoes: comercial"
  on crm_operacoes for all to authenticated
  using (has_dept_access(auth.uid(), 'comercial'))
  with check (has_dept_access(auth.uid(), 'comercial'));

drop policy if exists "auth_full_access_comentarios"          on crm_operacao_comentarios;
drop policy if exists "crm_operacao_comentarios: leitura"     on crm_operacao_comentarios;
drop policy if exists "crm_operacao_comentarios: inserção"    on crm_operacao_comentarios;
drop policy if exists "crm_operacao_comentarios: exclusão"    on crm_operacao_comentarios;
create policy "crm_operacao_comentarios: leitura"
  on crm_operacao_comentarios for select to authenticated
  using (has_dept_access(auth.uid(), 'comercial'));
create policy "crm_operacao_comentarios: inserção"
  on crm_operacao_comentarios for insert to authenticated
  with check (usuario_id = auth.uid() and has_dept_access(auth.uid(), 'comercial'));
create policy "crm_operacao_comentarios: exclusão"
  on crm_operacao_comentarios for delete to authenticated
  using (usuario_id = auth.uid() or is_admin(auth.uid()));

drop policy if exists "pipeline_parceiros_select" on pipeline_parceiros;
drop policy if exists "pipeline_parceiros_insert" on pipeline_parceiros;
drop policy if exists "pipeline_parceiros_update" on pipeline_parceiros;
create policy "pipeline_parceiros_select"
  on pipeline_parceiros for select to authenticated
  using (has_dept_access(auth.uid(), 'comercial'));
create policy "pipeline_parceiros_insert"
  on pipeline_parceiros for insert to authenticated
  with check (has_dept_access(auth.uid(), 'comercial'));
create policy "pipeline_parceiros_update"
  on pipeline_parceiros for update to authenticated
  using (has_dept_access(auth.uid(), 'comercial'))
  with check (has_dept_access(auth.uid(), 'comercial'));

drop policy if exists "pipeline_comentarios_select" on pipeline_comentarios;
create policy "pipeline_comentarios_select"
  on pipeline_comentarios for select to authenticated
  using (has_dept_access(auth.uid(), 'comercial'));

-- pipeline_historico_distribuicao: tinha RLS sem nenhuma policy, então o
-- trigger trg_historico_dist (que roda como o usuário) falhava e derrubava
-- qualquer UPDATE de valor_distribuido.
drop policy if exists "pipeline_historico: leitura comercial"  on pipeline_historico_distribuicao;
drop policy if exists "pipeline_historico: inserção comercial" on pipeline_historico_distribuicao;
create policy "pipeline_historico: leitura comercial"
  on pipeline_historico_distribuicao for select to authenticated
  using (has_dept_access(auth.uid(), 'comercial'));
create policy "pipeline_historico: inserção comercial"
  on pipeline_historico_distribuicao for insert to authenticated
  with check (has_dept_access(auth.uid(), 'comercial'));

-- -----------------------------------------------------------------------------
-- 10. TICKETS: leitura continua aberta a logados (fila interna de suporte);
--     edição por reportador, responsável, membros do departamento ou admin;
--     exclusão só admin (o frontend fecha tickets via UPDATE, não DELETE).
-- -----------------------------------------------------------------------------

drop policy if exists "tickets_select" on tickets;
drop policy if exists "tickets_insert" on tickets;
drop policy if exists "tickets_update" on tickets;
drop policy if exists "tickets_delete" on tickets;
create policy "tickets_select"
  on tickets for select to authenticated
  using (true);
create policy "tickets_insert"
  on tickets for insert to authenticated
  with check (reportado_por = auth.uid());
create policy "tickets_update"
  on tickets for update to authenticated
  using (
    reportado_por = auth.uid()
    or responsavel_id = auth.uid()
    or is_admin(auth.uid())
    or (departamento_id is not null and has_dept_access(auth.uid(), departamento_id))
  );
create policy "tickets_delete"
  on tickets for delete to authenticated
  using (is_admin(auth.uid()));

-- -----------------------------------------------------------------------------
-- 11. STORAGE (bucket privado "documentos")
--     Leitura: só se existir um registro em documentos visível ao usuário
--     (o RLS de documentos já filtra por departamento). Isso funciona mesmo
--     para arquivos antigos em pastas como "marketing/" (o id do depto é "mkt").
--     Upload: só na pasta de um departamento ao qual o usuário tem acesso.
-- -----------------------------------------------------------------------------

drop policy if exists "documentos storage leitura" on storage.objects;
create policy "documentos storage leitura"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'documentos'
    and exists (select 1 from public.documentos d where d.storage_path = storage.objects.name)
  );

drop policy if exists "documentos storage upload" on storage.objects;
create policy "documentos storage upload"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'documentos'
    and public.has_dept_access(auth.uid(), (storage.foldername(name))[1])
  );

commit;
