-- Recalcula okrs.progresso automaticamente a partir da média de key_results.progresso,
-- pois hoje nenhuma parte do app grava esse valor agregado (fica travado no default 0).
-- Aplicada em produção via apply_migration (nome remoto: okr_progresso_trigger).

create or replace function fn_recalc_okr_progresso()
returns trigger as $$
declare
  v_okr_id uuid;
  v_progresso int;
begin
  v_okr_id := coalesce(new.okr_id, old.okr_id);

  select coalesce(round(avg(progresso)), 0)
  into v_progresso
  from key_results
  where okr_id = v_okr_id;

  update okrs
  set progresso = v_progresso, atualizado_em = now()
  where id = v_okr_id;

  return null;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_recalc_okr_progresso on key_results;

create trigger trg_recalc_okr_progresso
after insert or update or delete on key_results
for each row execute function fn_recalc_okr_progresso();

-- Backfill: corrige o progresso dos OKRs já existentes.
update okrs o
set progresso = coalesce(
  (select round(avg(kr.progresso)) from key_results kr where kr.okr_id = o.id),
  0
);
