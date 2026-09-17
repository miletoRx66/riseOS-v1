-- =====================================================================
-- Looping de Tarefas: regras de recorrência (diária/semanal/mensal) que
-- geram automaticamente novas linhas em `tarefas` via pg_cron diário.
-- Aplicada em produção via apply_migration (nome remoto: tarefa_recorrencias
-- + tarefa_recorrencias_revoke_public_exec).
-- =====================================================================

create table tarefa_recorrencias (
  id uuid primary key default gen_random_uuid(),

  -- campos-molde (clonados para cada tarefa gerada)
  titulo text not null,
  descricao text,
  departamento_id text not null references departamentos(id),
  prioridade text not null default 'media' check (prioridade in ('alta','media','baixa')),
  tipo text default 'outro' check (tipo in ('backend','frontend','infra','design','marketing','comercial','ops','pesquisa','outro')),
  visibilidade text not null default 'departamento' check (visibilidade in ('publica','departamento','pessoal')),
  responsavel_id uuid references profiles(id),
  tags text[] default '{}',

  -- regra de recorrência
  frequencia text not null check (frequencia in ('diaria','semanal','mensal')),
  dia_semana int check (dia_semana between 0 and 6),   -- 0=domingo..6=sábado (extract(dow from date), igual a JS Date.getDay())
  dia_mes int check (dia_mes between 1 and 31),
  data_inicio date not null default current_date,
  data_fim date,
  antecedencia_dias int not null default 0 check (antecedencia_dias >= 0),
  proxima_geracao date not null,
  ativo boolean not null default true,

  criado_por uuid not null references profiles(id),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),

  constraint chk_recorrencia_campos_frequencia check (
    (frequencia = 'diaria'  and dia_semana is null and dia_mes is null)
    or (frequencia = 'semanal' and dia_semana is not null and dia_mes is null)
    or (frequencia = 'mensal'  and dia_mes is not null and dia_semana is null)
  ),
  constraint chk_recorrencia_data_fim check (data_fim is null or data_fim >= data_inicio)
);

create index idx_tarefa_recorrencias_ativo_proxima
  on tarefa_recorrencias (proxima_geracao) where ativo = true;

create trigger trg_tarefa_recorrencias_atualizado_em
  before update on tarefa_recorrencias
  for each row execute function set_atualizado_em();

alter table tarefas
  add column recorrencia_id uuid references tarefa_recorrencias(id) on delete set null;

create index idx_tarefas_recorrencia_id on tarefas (recorrencia_id) where recorrencia_id is not null;

-- RLS espelhando o padrão real de `tarefas`
alter table tarefa_recorrencias enable row level security;

create policy "tarefa_recorrencias: leitura por acesso ao depto, dono ou admin"
  on tarefa_recorrencias for select
  using (has_dept_access(auth.uid(), departamento_id) or criado_por = auth.uid() or is_admin(auth.uid()));

create policy "tarefa_recorrencias: criação por autenticados"
  on tarefa_recorrencias for insert
  with check (criado_por = auth.uid());

create policy "tarefa_recorrencias: edição por criador ou admin"
  on tarefa_recorrencias for update
  using (criado_por = auth.uid() or is_admin(auth.uid()));

create policy "tarefa_recorrencias: exclusão por criador ou admin"
  on tarefa_recorrencias for delete
  using (criado_por = auth.uid() or is_admin(auth.uid()));

-- Próxima data válida ESTRITAMENTE APÓS p_apos, dada a frequência
create or replace function fn_proxima_ocorrencia(
  p_frequencia text, p_dia_semana int, p_dia_mes int, p_apos date
) returns date
language plpgsql immutable set search_path = public
as $$
declare
  v_data date; v_mes_base date; v_ultimo_dia int; v_candidato date; v_i int := 0;
begin
  if p_frequencia = 'diaria' then
    return p_apos + 1;
  elsif p_frequencia = 'semanal' then
    v_data := p_apos + 1;
    while extract(dow from v_data)::int <> p_dia_semana loop
      v_data := v_data + 1;
    end loop;
    return v_data;
  elsif p_frequencia = 'mensal' then
    v_mes_base := date_trunc('month', p_apos)::date;
    loop
      v_ultimo_dia := extract(day from (v_mes_base + interval '1 month' - interval '1 day'))::int;
      v_candidato := v_mes_base + (least(p_dia_mes, v_ultimo_dia) - 1) * interval '1 day';
      exit when v_candidato > p_apos;
      v_mes_base := (v_mes_base + interval '1 month')::date;
      v_i := v_i + 1;
      exit when v_i > 24;
    end loop;
    return v_candidato;
  else
    raise exception 'Frequência inválida: %', p_frequencia;
  end if;
end;
$$;

create or replace function fn_tarefa_recorrencias_set_proxima_geracao()
returns trigger language plpgsql set search_path = public
as $$
begin
  if new.proxima_geracao is null then
    new.proxima_geracao := fn_proxima_ocorrencia(new.frequencia, new.dia_semana, new.dia_mes, new.data_inicio - 1);
  end if;
  return new;
end;
$$;

create trigger trg_tarefa_recorrencias_proxima_geracao
  before insert on tarefa_recorrencias
  for each row execute function fn_tarefa_recorrencias_set_proxima_geracao();

-- Função principal (chamada pelo cron): gera as tarefas devidas hoje
create or replace function fn_gerar_tarefas_recorrentes()
returns void language plpgsql security definer set search_path = public
as $$
declare
  r record; v_proxima date;
begin
  for r in
    select * from tarefa_recorrencias
    where ativo = true and (proxima_geracao - antecedencia_dias) <= current_date
    order by proxima_geracao
  loop
    if not exists (
      select 1 from tarefas
      where recorrencia_id = r.id and prazo = r.proxima_geracao and deletado = false
    ) then
      insert into tarefas (
        titulo, descricao, departamento_id, status, prioridade, tipo,
        visibilidade, responsavel_id, criado_por, prazo, tags, recorrencia_id
      ) values (
        r.titulo, r.descricao, r.departamento_id, 'planejamento', r.prioridade, r.tipo,
        r.visibilidade, r.responsavel_id, r.criado_por, r.proxima_geracao, r.tags, r.id
      );
    end if;

    v_proxima := fn_proxima_ocorrencia(r.frequencia, r.dia_semana, r.dia_mes, r.proxima_geracao);

    if r.data_fim is not null and v_proxima > r.data_fim then
      update tarefa_recorrencias set proxima_geracao = v_proxima, ativo = false, atualizado_em = now() where id = r.id;
    else
      update tarefa_recorrencias set proxima_geracao = v_proxima, atualizado_em = now() where id = r.id;
    end if;
  end loop;
end;
$$;

-- fn_gerar_tarefas_recorrentes() ignora RLS de propósito (processa todas as
-- regras de todos os departamentos) e deve rodar SÓ via pg_cron. Postgres
-- concede EXECUTE a PUBLIC por padrão em funções novas — revogamos aqui.
revoke execute on function fn_gerar_tarefas_recorrentes() from public;
revoke execute on function fn_gerar_tarefas_recorrentes() from anon;
revoke execute on function fn_gerar_tarefas_recorrentes() from authenticated;

-- RPC "gerar agora": materializa a 1ª ocorrência na hora se já devida
create or replace function gerar_tarefa_recorrencia_agora(p_recorrencia_id uuid)
returns tarefas language plpgsql security definer set search_path = public
as $$
declare r tarefa_recorrencias%rowtype; v_nova tarefas%rowtype;
begin
  select * into r from tarefa_recorrencias where id = p_recorrencia_id;
  if not found then raise exception 'Recorrência não encontrada'; end if;
  if r.criado_por <> auth.uid() and not is_admin(auth.uid()) then
    raise exception 'Sem permissão para gerar esta recorrência';
  end if;
  if not r.ativo then raise exception 'Recorrência está pausada'; end if;
  if (r.proxima_geracao - r.antecedencia_dias) > current_date then
    raise exception 'Ainda não é hora de gerar esta ocorrência';
  end if;

  select * into v_nova from tarefas
  where recorrencia_id = r.id and prazo = r.proxima_geracao and deletado = false limit 1;

  if not found then
    insert into tarefas (
      titulo, descricao, departamento_id, status, prioridade, tipo,
      visibilidade, responsavel_id, criado_por, prazo, tags, recorrencia_id
    ) values (
      r.titulo, r.descricao, r.departamento_id, 'planejamento', r.prioridade, r.tipo,
      r.visibilidade, r.responsavel_id, r.criado_por, r.proxima_geracao, r.tags, r.id
    ) returning * into v_nova;

    update tarefa_recorrencias
    set proxima_geracao = fn_proxima_ocorrencia(r.frequencia, r.dia_semana, r.dia_mes, r.proxima_geracao),
        atualizado_em = now()
    where id = r.id;
  end if;

  return v_nova;
end;
$$;
grant execute on function gerar_tarefa_recorrencia_agora(uuid) to authenticated;

-- RPC "retomar": reativa e pula ocorrências perdidas se ficou pausada no passado
create or replace function retomar_tarefa_recorrencia(p_recorrencia_id uuid)
returns tarefa_recorrencias language plpgsql security definer set search_path = public
as $$
declare r tarefa_recorrencias%rowtype;
begin
  select * into r from tarefa_recorrencias where id = p_recorrencia_id;
  if not found then raise exception 'Recorrência não encontrada'; end if;
  if r.criado_por <> auth.uid() and not is_admin(auth.uid()) then
    raise exception 'Sem permissão para alterar esta recorrência';
  end if;

  update tarefa_recorrencias
  set ativo = true,
      proxima_geracao = case
        when proxima_geracao < current_date
          then fn_proxima_ocorrencia(frequencia, dia_semana, dia_mes, current_date - 1)
        else proxima_geracao
      end,
      atualizado_em = now()
  where id = p_recorrencia_id
  returning * into r;

  return r;
end;
$$;
grant execute on function retomar_tarefa_recorrencia(uuid) to authenticated;

-- pg_cron: habilita a extensão e agenda o job diário (06:00 UTC = 03:00 America/Sao_Paulo)
create extension if not exists pg_cron with schema extensions;

do $$
begin
  perform cron.unschedule(jobid) from cron.job where jobname = 'gerar-tarefas-recorrentes';
exception when others then null;
end $$;

select cron.schedule('gerar-tarefas-recorrentes', '0 6 * * *', $$select fn_gerar_tarefas_recorrentes();$$);
