-- Cadastra os produtos da V2 (Infra nova da Rise) em fin_produtos,
-- para que possam ter AUM lançado no departamento Financeiro.
--
-- Idempotente: insere apenas produtos que ainda não existem (por nome).
-- Observação: fin_produtos.id não tem default, por isso geramos com gen_random_uuid().

insert into fin_produtos (id, nome, descricao, status, cor)
select gen_random_uuid(), 'Rise CP · Classe Subordinada', 'Produto V2 — Infra Rise', 'ativo', '#f97316'
where not exists (select 1 from fin_produtos where nome = 'Rise CP · Classe Subordinada');

insert into fin_produtos (id, nome, descricao, status, cor)
select gen_random_uuid(), 'Rise CP · Classe Senior', 'Produto V2 — Infra Rise', 'ativo', '#3b82f6'
where not exists (select 1 from fin_produtos where nome = 'Rise CP · Classe Senior');

insert into fin_produtos (id, nome, descricao, status, cor)
select gen_random_uuid(), 'RFY - 18% a.a', 'Produto V2 — Infra Rise', 'ativo', '#eab308'
where not exists (select 1 from fin_produtos where nome = 'RFY - 18% a.a');

insert into fin_produtos (id, nome, descricao, status, cor)
select gen_random_uuid(), 'Rise Bitcoin Yield 1', 'Produto V2 — Infra Rise', 'ativo', '#f7931a'
where not exists (select 1 from fin_produtos where nome = 'Rise Bitcoin Yield 1');

insert into fin_produtos (id, nome, descricao, status, cor)
select gen_random_uuid(), 'Rise Impacto Social', 'Produto V2 — Infra Rise', 'ativo', '#22c55e'
where not exists (select 1 from fin_produtos where nome = 'Rise Impacto Social');
