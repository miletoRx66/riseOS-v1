-- =============================================================================
-- RiseOS — Migration 009: Módulos da frente de Infraestrutura
--
-- A frente "Infraestrutura" se divide em quatro módulos contratáveis:
-- Administração, Gestão, Pagamento (Pix & Swap) e Distribuição.
-- Um parceiro pode contratar mais de um módulo, por isso é um array.
-- Vazio = ainda não classificado.
-- Aditiva e idempotente.
-- =============================================================================

begin;

alter table public.pipeline_parceiros
  add column if not exists modulos_infra text[] not null default '{}';

alter table public.pipeline_parceiros
  drop constraint if exists pipeline_parceiros_modulos_infra_check,
  add  constraint pipeline_parceiros_modulos_infra_check
    check (modulos_infra <@ array['administracao', 'gestao', 'pagamento', 'distribuicao']);

commit;
