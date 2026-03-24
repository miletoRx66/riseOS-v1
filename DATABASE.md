# RiseOS — Arquitetura de Banco de Dados
*PostgreSQL via Supabase | Atualizado: 22/03/2026*

---

## Visão Geral

```
Auth (Supabase)
    │
    └── profiles            ← estende auth.users
            │
            ├── permissoes  ← RBAC por departamento
            │
departamentos
    │
    ├── status_config       ← pipelines de status por dept
    │
    ├── tarefas             ← tabela central
    │       ├── subtarefas
    │       ├── tarefa_links
    │       ├── tarefa_papeis
    │       ├── comentarios (threading via parent_id)
    │       ├── anexos      ← Supabase Storage
    │       └── atividades  ← log imutável
    │
    ├── fluxos_aprovacao
    │       └── aprovacao_steps
    │               └── aprovacao_instancias
    │                       └── aprovacao_decisoes
    │
    ├── tarefa_templates
    │       ├── template_subtarefas
    │       ├── template_links
    │       └── template_favoritos
    │
    ├── okrs
    │       ├── key_results
    │       │       └── kr_snapshots
    │       └── okr_tarefas (junction → tarefas)
    │
    ├── documentos          ← Supabase Storage
    │
    ├── canais
    │       ├── canal_membros
    │       └── mensagens (threading via parent_id)
    │
    └── notificacoes
            └── preferencias_notificacao
```

---

## Tabelas

### Identidade e Acesso

| Tabela | Descrição | Linhas esperadas |
|--------|-----------|-----------------|
| `profiles` | Perfil público de cada usuário (estende `auth.users`) | 10–500 |
| `permissoes` | Papéis por usuário × departamento (RBAC) | 10–2.000 |
| `departamentos` | Catálogo de departamentos (IDs são slugs) | 5–20 |

**Modelo de permissão:**
- `admin` + `departamento_id = null` → acesso total
- `manager` + `departamento_id = 'marketing'` → gerência de Marketing
- `member` + `departamento_id = 'ops'` → membro de Operações
- `viewer` → somente leitura

---

### Gestão de Tarefas

| Tabela | Descrição |
|--------|-----------|
| `status_config` | Pipelines de status customizáveis por departamento. `eh_final=true` conta como "concluído" nas métricas |
| `tarefas` | Tabela central. Soft delete via `deletado=true`. FTS via `pg_trgm` |
| `subtarefas` | Checklist dentro de uma tarefa |
| `tarefa_links` | Links externos (Figma, Drive, GitHub, etc.) |
| `tarefa_papeis` | Papéis por tarefa: executor, revisor, aprovador, observador |
| `comentarios` | Threading via `parent_id`. Soft delete via `deletado=true` |
| `anexos` | Metadados de arquivo. Binário no Supabase Storage |
| `atividades` | Log imutável de auditoria. Nunca editar ou deletar |

**Decisões de design em `tarefas`:**
- `status` é `text` livre validado contra `status_config` do departamento (não enum fixo)
- `tags` é `text[]` PostgreSQL nativo (não tabela separada — tags são simples demais)
- Índices GIN em `titulo`, `descricao` e `tags` para busca full-text
- `visibilidade='pessoal'`: RLS garante que apenas `criado_por` vê a tarefa

---

### Fluxo de Aprovação

| Tabela | Descrição |
|--------|-----------|
| `fluxos_aprovacao` | Templates de fluxo reutilizáveis por departamento ou globais |
| `aprovacao_steps` | Steps ordenados do fluxo. Aprovador pode ser user fixo ou papel hierárquico |
| `aprovacao_instancias` | Instância de um fluxo em execução por tarefa |
| `aprovacao_decisoes` | Decisões tomadas em cada step (imutável para auditoria) |

---

### Templates de Tarefas

| Tabela | Descrição |
|--------|-----------|
| `tarefa_templates` | Template reutilizável com SLA, subtarefas e links padrão |
| `template_subtarefas` | Subtarefas do template |
| `template_links` | Links padrão do template |
| `template_favoritos` | Relação N:N usuário ↔ template favorito |

---

### OKRs

| Tabela | Descrição |
|--------|-----------|
| `okrs` | Objetivos por departamento e período |
| `key_results` | KRs com valor inicial, meta e atual |
| `kr_snapshots` | Histórico de evolução do KR (sparkline) |
| `okr_tarefas` | Junction N:N: OKRs ↔ tarefas vinculadas |

---

### Documentos

| Tabela | Descrição |
|--------|-----------|
| `documentos` | Metadados. Arquivo binário no Supabase Storage bucket `documentos` |

---

### Mensagens

| Tabela | Descrição |
|--------|-----------|
| `canais` | Canais de departamento, privados, temporários e P2P |
| `canal_membros` | Membros de cada canal. `silenciado_ate` controla notificações |
| `mensagens` | Mensagens com threading (`parent_id`), áudio e compartilhamento de tarefa |

---

### Notificações

| Tabela | Descrição |
|--------|-----------|
| `notificacoes` | Inbox de notificações por usuário |
| `preferencias_notificacao` | Preferências de tipos de notificação (app + push) em JSONB |

---

## Row Level Security (RLS)

Todas as tabelas têm RLS habilitada. As políticas seguem a hierarquia:

```
admin (global)
  └── pode tudo em qualquer departamento

manager (departamento X)
  └── pode criar/editar/deletar em X

member (departamento X)
  └── pode criar e editar o que é seu em X

viewer
  └── somente leitura
```

**Política crítica — tarefas por visibilidade:**
```sql
-- Uma tarefa é visível se:
visibilidade = 'publica'                                   -- todos veem
OR (visibilidade = 'departamento' AND membro do dept)      -- membros do dept
OR (visibilidade = 'pessoal' AND criado_por = auth.uid())  -- só o criador
OR is_admin(auth.uid())                                    -- admin vê tudo
```

---

## Supabase Storage

| Bucket | Uso | Acesso |
|--------|-----|--------|
| `task-attachments` | Anexos de tarefas | Privado — URL assinada |
| `documents` | Arquivos do módulo Documentos | Privado — URL assinada |
| `avatars` | Fotos de perfil | Público |
| `audio-messages` | Áudios de mensagens | Privado — URL assinada |

---

## Views

| View | Descrição |
|------|-----------|
| `v_tarefas` | Tarefas com nome/avatar do responsável, nome/cor do dept, contadores de subtarefas, comentários e anexos |
| `v_key_results` | KRs com status calculado automaticamente (on_track / at_risk / in_danger) |

---

## Triggers

| Trigger | Tabela | Ação |
|---------|--------|------|
| `set_atualizado_em` | Várias | Atualiza `atualizado_em` antes de UPDATE |
| `on_auth_user_created` | `auth.users` | Cria `profile` automaticamente após signup |
| `trg_mensagem_thread_count` | `mensagens` | Incrementa `thread_count` da mensagem pai ao inserir reply |

---

## Arquivos

```
supabase/
├── migrations/
│   └── 001_initial_schema.sql   ← schema completo + RLS + triggers + views
└── seed/
    └── 001_reference_data.sql   ← departamentos + status_config padrão
```

---

## Próximo passo: configurar Supabase

Para conectar o projeto ao Supabase, são necessários:

1. Criar projeto em supabase.com
2. Executar `001_initial_schema.sql` no SQL Editor
3. Executar `001_reference_data.sql`
4. Criar os buckets de Storage
5. Adicionar as variáveis de ambiente ao projeto
6. Instalar `@supabase/supabase-js` e criar o client

Ver `SUPABASE_SETUP.md` para o passo a passo completo.
