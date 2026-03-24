-- =============================================================================
-- RiseOS — Seed 001: Dados de Referência
-- Executar DEPOIS da migration 001
-- =============================================================================

-- Departamentos
insert into departamentos (id, nome, cor, icon) values
  ('marketing',   'Marketing',   '#28d939', 'megaphone'),
  ('ops',         'Operações',   '#14E9BC', 'settings'),
  ('comercial',   'Comercial',   '#6B8AFF', 'trending-up'),
  ('produto',     'Produto',     '#E879F9', 'package'),
  ('financeiro',  'Financeiro',  '#f59e0b', 'dollar-sign')
on conflict (id) do nothing;

-- Status Config Global (pipeline padrão)
insert into status_config (departamento_id, label, cor, ordem, eh_final) values
  (null, 'Planejamento', '#6B8AFF', 1, false),
  (null, 'Em Andamento', '#28d939', 2, false),
  (null, 'Pausado',      '#f59e0b', 3, false),
  (null, 'Concluído',    '#bdbdbd', 4, true);

-- Status Config Marketing (pipeline customizado)
insert into status_config (departamento_id, label, cor, ordem, eh_final) values
  ('marketing', 'Briefing',   '#6B8AFF', 1, false),
  ('marketing', 'Exploração', '#14E9BC', 2, false),
  ('marketing', 'Produção',   '#f59e0b', 3, false),
  ('marketing', 'Revisão',    '#E879F9', 4, false),
  ('marketing', 'Aprovado',   '#28d939', 5, false),
  ('marketing', 'Publicado',  '#bdbdbd', 6, true);

-- Status Config Ops
insert into status_config (departamento_id, label, cor, ordem, eh_final) values
  ('ops', 'Backlog',    '#6B8AFF', 1, false),
  ('ops', 'Em Análise', '#14E9BC', 2, false),
  ('ops', 'Execução',   '#f59e0b', 3, false),
  ('ops', 'QA',         '#E879F9', 4, false),
  ('ops', 'Entregue',   '#bdbdbd', 5, true);
