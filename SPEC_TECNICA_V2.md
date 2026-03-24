# RiseOS — Especificação Técnica v2.0
*Gerado em: 22/03/2026 | Base: Feedback multidepartamental*

---

## Índice

1. [F-01 — Gestão de Tarefas Avançada](#f-01)
2. [F-02 — Papéis e Fluxo de Aprovação](#f-02)
3. [F-03 — Templates de Tarefas](#f-03)
4. [F-04 — Colaboração e Mensagens](#f-04)
5. [F-05 — Notificações Integradas](#f-05)
6. [F-06 — Calendário e Planejamento Visual](#f-06)
7. [F-07 — Importação/Exportação de Dados](#f-07)
8. [F-08 — Integrações Externas](#f-08)
9. [F-09 — Analytics e Dashboards](#f-09)
10. [F-10 — Personalização de UI (Tema)](#f-10)
11. [Roadmap Sugerido](#roadmap)
12. [Quick Wins](#quick-wins)
13. [Riscos Técnicos](#riscos)

---

## F-01 — Gestão de Tarefas Avançada {#f-01}

**Feature:** Task Management v2

**Problema:**
O modelo atual de tarefas tem status fixos (planejamento/em-andamento/concluído/pausado), sem suporte a fluxos de fase customizados por departamento, sem tipagem, sem campos de link externo, e com filtros insuficientes para times maiores.

**Solução:**
Evoluir o modelo `Tarefa` para suportar status dinâmicos por workspace/departamento, tipagem de tarefa, campos de link, espaço pessoal, e filtros compostos com persistência.

---

### Requisitos Funcionais

- [ ] Campo `links[]` na tarefa: título livre + URL (Figma, Drive, Notion, GitHub, etc.)
- [ ] Status customizáveis por departamento (ex: Briefing → Exploração → Revisão → Aprovado)
- [ ] Status default global mantido; departamentos sobrescrevem com pipeline próprio
- [ ] Campo `tipo` na tarefa: `backend | frontend | infra | design | marketing | comercial | ops | pesquisa | outro`
- [ ] Espaço pessoal: tarefas com `visibilidade: "pessoal"` — visíveis apenas ao criador
- [ ] Filtros avançados compostos:
  - Data de criação (range)
  - Data de prazo (range)
  - Prioridade (múltipla)
  - Responsável (múltiplo)
  - Tipo (múltiplo)
  - Status (múltiplo)
  - Tags (múltiplas)
- [ ] Filtros persistem via `localStorage` ou URL query params
- [ ] Ordenação por: prazo, prioridade, data de criação, progresso, título
- [ ] Busca full-text por título, descrição e tags
- [ ] Comentários com threads (resposta a comentário específico)

### Requisitos Não Funcionais

- Filtros compostos devem responder em < 200ms no client
- Status customizados devem ser isolados por `departamentoId` — não vazar entre departamentos
- Links externos devem ser validados (formato URL) antes de salvar
- Busca full-text deve ser case-insensitive e ignorar acentos

---

### Modelagem de Dados

```typescript
// Extensão do model Tarefa existente
interface Tarefa {
  // campos atuais mantidos...
  id: string;
  titulo: string;
  descricao?: string;
  departamento: DepartamentoId;
  prioridade: TarefaPrioridade;
  responsavel: string;       // → migrar para responsavelId: string (userId)
  prazo: string;
  progresso: number;
  tags: string[];
  subtarefas: Subtarefa[];
  comentarios: Comentario[];
  anexos: Anexo[];
  atividades: AtividadeTarefa[];

  // NOVOS CAMPOS
  status: string;             // valor livre, validado contra StatusConfig do departamento
  tipo: TarefaTipo;
  visibilidade: "publica" | "departamento" | "pessoal";
  links: TarefaLink[];
  papeis: TarefaPapel[];      // executor, revisor, aprovador
  templateId?: string;        // se criada a partir de template
  aprovacaoId?: string;       // se em fluxo de aprovação
  dataCriacao: string;
  dataAtualizacao: string;
  criadoPor: string;          // userId
}

type TarefaTipo =
  | "backend" | "frontend" | "infra" | "design"
  | "marketing" | "comercial" | "ops" | "pesquisa" | "outro";

interface TarefaLink {
  id: string;
  titulo: string;
  url: string;
  tipo: "figma" | "drive" | "github" | "notion" | "lark" | "outro";
  icone?: string;             // auto-detectado pela URL
}

interface TarefaPapel {
  userId: string;
  papel: "executor" | "revisor" | "aprovador" | "observador";
}

// Status customizável por departamento
interface StatusConfig {
  id: string;
  departamentoId: DepartamentoId | "global";
  label: string;
  cor: string;
  ordem: number;
  ehFinal: boolean;          // conta como "concluído" para métricas
}

// Comentário com threading
interface Comentario {
  id: string;
  tarefaId: string;
  autor: string;             // userId
  avatarAutor: string;
  conteudo: string;
  data: string;
  parentId?: string;         // se é resposta a outro comentário
  mencoes: string[];         // userIds mencionados (@user)
  editado: boolean;
  respostas?: Comentario[];  // virtual, populado no frontend
}
```

---

### APIs REST

```
# Links
POST   /tarefas/:id/links          → adicionar link
DELETE /tarefas/:id/links/:linkId  → remover link

# Filtros (query params compostos)
GET    /tarefas?tipo=backend,frontend&prioridade=alta&responsavel=userId1,userId2
                &prazo_de=2026-03-01&prazo_ate=2026-03-31
                &status=em-revisao&tags=q1,campanha
                &visibilidade=departamento&busca=campanha

# Status customizados
GET    /departamentos/:id/status-config
POST   /departamentos/:id/status-config
PUT    /departamentos/:id/status-config/:statusId
DELETE /departamentos/:id/status-config/:statusId
PATCH  /departamentos/:id/status-config/reorder  → { ids: string[] }

# Comentários (threading)
POST   /tarefas/:id/comentarios                      → criar comentário raiz
POST   /tarefas/:id/comentarios/:comentarioId/reply  → responder comentário
PUT    /tarefas/:id/comentarios/:comentarioId        → editar
DELETE /tarefas/:id/comentarios/:comentarioId        → deletar
```

---

### Componentes Frontend

```
src/app/components/
├── tasks/
│   ├── TaskLinkField.tsx          → input de URL com auto-detecção de ícone
│   ├── TaskLinkList.tsx           → lista de links anexados
│   ├── TaskTypeSelector.tsx       → selector de tipo com ícones
│   ├── TaskStatusPipeline.tsx     → stepper visual do pipeline de status
│   ├── TaskRoleAssignment.tsx     → atribuição de executor/revisor/aprovador
│   ├── CommentThread.tsx          → comentário com respostas aninhadas
│   ├── CommentInput.tsx           → input com suporte a @menções
│   └── AdvancedFilterPanel.tsx    → painel de filtros compostos (drawer)
├── filters/
│   ├── FilterChip.tsx             → chip individual de filtro ativo
│   ├── FilterBar.tsx              → barra com chips de filtros ativos + reset
│   └── DateRangePicker.tsx        → seletor de intervalo de datas
```

---

**Dependências Técnicas:**
- Refatorar `TarefaStatus` de enum fixo para lookup dinâmico em `StatusConfig`
- Migrar `responsavel: string` (nome livre) para `responsavelId: string` (userId)
- Adicionar `date-fns` para filtros de range (já disponível)
- `fuse.js` ou implementação nativa para busca fuzzy nos filtros

**Esforço:** Alto
**Impacto:** Alto
**Prioridade:** #1 — base para outras features

---

## F-02 — Papéis e Fluxo de Aprovação {#f-02}

**Feature:** Task Roles & Approval Workflows

**Problema:**
Atualmente não existe separação entre quem executa, quem revisa e quem aprova uma tarefa. Fluxos de aprovação de budget, campanhas e documentos ocorrem fora do sistema (WhatsApp, e-mail), gerando perda de rastreabilidade.

**Solução:**
Implementar papéis por tarefa (executor, revisor, aprovador) e um motor de fluxos de aprovação multi-step configurável por departamento ou tipo de tarefa.

---

### Requisitos Funcionais

- [ ] Cada tarefa pode ter múltiplos usuários com papéis distintos: `executor | revisor | aprovador | observador`
- [ ] Fluxo de aprovação é uma sequência de steps, cada um com um aprovador (userId ou papel hierárquico)
- [ ] Steps são executados em ordem (multi-step hierárquico)
- [ ] Cada step pode ser aprovado, rejeitado ou solicitada revisão com comentário obrigatório
- [ ] Status da tarefa avança automaticamente quando um step é aprovado
- [ ] Rejeição em qualquer step retorna a tarefa ao status anterior com notificação
- [ ] Templates de fluxo de aprovação reutilizáveis (ex: "Aprovação de Budget", "Aprovação de Campanha")
- [ ] Histórico completo de aprovações na timeline da tarefa
- [ ] Aprovador pode delegar para outro usuário

### Requisitos Não Funcionais

- Somente o aprovador designado no step atual pode aprovar/rejeitar
- Notificação imediata ao próximo aprovador quando um step é concluído
- Auditoria imutável: log de aprovações não pode ser editado ou deletado

---

### Modelagem de Dados

```typescript
interface FluxoAprovacao {
  id: string;
  nome: string;
  descricao?: string;
  departamentoId?: DepartamentoId;  // null = global
  steps: AprovacaoStep[];
  criadoPor: string;
  ativo: boolean;
}

interface AprovacaoStep {
  id: string;
  ordem: number;
  label: string;                        // "Aprovação Gerente", "Aprovação Diretoria"
  aprovadorId?: string;                 // userId fixo
  papel?: "manager" | "director" | "admin"; // papel hierárquico (fallback)
  prazoHoras?: number;                  // SLA do step
  obrigaComentario: boolean;
}

interface AprovacaoInstancia {
  id: string;
  tarefaId: string;
  fluxoId: string;
  stepAtual: number;
  status: "pendente" | "aprovado" | "rejeitado" | "em-revisao";
  decisoes: AprovacaoDecisao[];
  criadaEm: string;
  concluidaEm?: string;
}

interface AprovacaoDecisao {
  id: string;
  instanciaId: string;
  stepId: string;
  aprovadorId: string;
  decisao: "aprovado" | "rejeitado" | "revisao";
  comentario?: string;
  delegadoPara?: string;
  data: string;
}
```

---

### APIs REST

```
# Templates de fluxo
GET    /fluxos-aprovacao
POST   /fluxos-aprovacao
PUT    /fluxos-aprovacao/:id
DELETE /fluxos-aprovacao/:id

# Instâncias (por tarefa)
POST   /tarefas/:id/aprovacao           → iniciar fluxo { fluxoId }
GET    /tarefas/:id/aprovacao           → estado atual
POST   /tarefas/:id/aprovacao/decidir   → { decisao, comentario, delegarPara? }
POST   /tarefas/:id/aprovacao/cancelar
```

---

### Componentes Frontend

```
src/app/components/
├── approval/
│   ├── ApprovalBadge.tsx          → badge de status de aprovação no card
│   ├── ApprovalTimeline.tsx       → timeline de decisões na tarefa
│   ├── ApprovalActionPanel.tsx    → painel de ação para aprovador atual
│   ├── ApprovalStepBuilder.tsx    → builder de steps (drag para reordenar)
│   └── ApprovalFlowTemplate.tsx   → card de template de fluxo
```

**Dependências Técnicas:**
- F-01 (papéis por tarefa)
- F-05 (notificações para trigger nos steps)
- Sistema de permissões deve verificar papel do usuário antes de permitir decisão

**Esforço:** Alto
**Impacto:** Alto
**Prioridade:** #3

---

## F-03 — Templates de Tarefas {#f-03}

**Feature:** Task Templates with SLA

**Problema:**
Tarefas recorrentes são criadas manualmente do zero toda vez, levando a inconsistência nos campos obrigatórios, subtarefas faltando, e SLAs não definidos.

**Solução:**
Sistema de templates reutilizáveis que pré-preenchem todos os campos da tarefa, incluindo subtarefas, papéis, links padrão e SLA por step.

---

### Requisitos Funcionais

- [ ] Templates criados a partir de uma tarefa existente ("Salvar como Template") ou do zero
- [ ] Template contém: título-modelo, tipo, prioridade, departamento, subtarefas pré-definidas, papéis padrão, links padrão, tags padrão, fluxo de aprovação associado (opcional)
- [ ] SLA: prazo calculado em dias úteis a partir da data de criação
- [ ] Templates são escopados por: departamento ou global
- [ ] Ao criar tarefa a partir de template, todos os campos são pré-preenchidos e editáveis
- [ ] Templates podem ser marcados como favoritos
- [ ] Contador de uso para analytics

### Requisitos Não Funcionais

- Templates globais só podem ser criados por admin
- Templates de departamento só podem ser editados por manager ou admin do departamento

---

### Modelagem de Dados

```typescript
interface TarefaTemplate {
  id: string;
  nome: string;
  descricao?: string;
  departamentoId?: DepartamentoId;    // null = global
  tipo: TarefaTipo;
  prioridade: TarefaPrioridade;
  tags: string[];
  subtarefas: SubtarefaTemplate[];
  links: TarefaLink[];
  papeis: { papel: TarefaPapelTipo; }[];  // sem userId fixo
  slasDias: number;                   // prazo padrão em dias úteis
  fluxoAprovacaoId?: string;
  criadoPor: string;
  atualizadoEm: string;
  usos: number;                       // contador
  favorito: boolean;                  // por usuário (relação N:N)
}

interface SubtarefaTemplate {
  id: string;
  titulo: string;
  ordem: number;
  responsavelPapel?: "executor" | "revisor";
}
```

---

### APIs REST

```
GET    /templates                        → lista (com ?departamento= e ?global=true)
POST   /templates
PUT    /templates/:id
DELETE /templates/:id
POST   /templates/:id/favoritar
POST   /tarefas/from-template/:templateId  → criar tarefa a partir de template
POST   /tarefas/:id/save-as-template       → salvar tarefa como template
```

---

### Componentes Frontend

```
src/app/components/
├── templates/
│   ├── TemplateCard.tsx           → card com preview de subtarefas e SLA
│   ├── TemplateGallery.tsx        → galeria com filtro por dept/global/favoritos
│   ├── TemplatePicker.tsx         → modal de seleção ao criar nova tarefa
│   └── TemplateBuilder.tsx        → formulário de criação/edição de template
```

**Dependências Técnicas:**
- F-01 (modelo de tarefa expandido)
- F-02 (referência a fluxo de aprovação no template)

**Esforço:** Médio
**Impacto:** Alto
**Prioridade:** #4

---

## F-04 — Colaboração e Mensagens v2 {#f-04}

**Feature:** Messaging v2 — Threads, Canais Temporários, Busca

**Problema:**
O sistema de mensagens atual não suporta respostas em thread, canais temporários para projetos, arquivamento de conversas, silenciamento de grupos, busca por conteúdo, ou compartilhamento de tasks.

**Solução:**
Evoluir o módulo de mensagens para um sistema de colaboração completo com threads, canais com ciclo de vida, busca indexada e compartilhamento de objetos do sistema.

---

### Requisitos Funcionais

**Threads:**
- [ ] Qualquer mensagem pode iniciar uma thread (resposta in-context)
- [ ] Thread exibe contador de respostas no feed principal
- [ ] Painel lateral para visualizar thread completa sem sair do canal

**Canais:**
- [ ] Canais temporários com data de expiração configurável
- [ ] Arquivar canais (somente leitura, não deletar)
- [ ] Silenciar canal/conversa (sem notificações por N horas ou indefinidamente)
- [ ] Canais privados (convite) vs. canais de departamento (auto-join)

**Busca:**
- [ ] Busca full-text por palavra-chave no histórico de mensagens
- [ ] Filtro por canal/conversa, remetente e data
- [ ] Destaque do termo buscado no resultado

**Compartilhamento:**
- [ ] Compartilhar tarefa via link interno (`/tarefas/:id`) dentro do chat (preview card)
- [ ] Link público para tarefa (hash token, expirável): `riseos.app/t/:token`

**Áudio:**
- [ ] Gravação de mensagem de áudio (Web Audio API, max 3 min)
- [ ] Player inline no chat

### Requisitos Não Funcionais

- Busca por histórico deve retornar resultados em < 500ms
- Links públicos de tarefa devem expirar em 7 dias por padrão (configurável)
- Áudios devem ser armazenados em object storage (não inline em DB)
- Arquivamento não deve deletar dados — apenas mudar flag de visibilidade

---

### Modelagem de Dados

```typescript
interface Canal {
  id: string;
  nome: string;
  tipo: "departamento" | "privado" | "temporario" | "p2p";
  departamentoId?: DepartamentoId;
  membros: string[];               // userIds
  arquivado: boolean;
  expiraEm?: string;               // para temporários
  criadoPor: string;
  criadoEm: string;
}

interface Mensagem {
  id: string;
  canalId: string;
  autorId: string;
  conteudo?: string;
  tipo: "texto" | "audio" | "sistema" | "task-share";
  audioUrl?: string;
  audioDuracao?: number;           // segundos
  taskShareId?: string;            // para tipo task-share
  parentId?: string;               // se é resposta em thread
  threadCount: number;             // replies count
  mencoes: string[];
  editado: boolean;
  deletado: boolean;               // soft delete
  criadoEm: string;
}

interface SilenciamentoCanal {
  userId: string;
  canalId: string;
  ate?: string;                    // null = indefinido
}

interface TaskShareLink {
  id: string;
  token: string;
  tarefaId: string;
  criadoPor: string;
  expiraEm: string;
  acessos: number;
}
```

---

### APIs REST

```
# Canais
POST   /canais                          → criar canal
PATCH  /canais/:id/arquivar
PATCH  /canais/:id/silenciar            → { ate?: string }
GET    /canais/:id/mensagens?busca=&de=&ate=&autorId=

# Mensagens
POST   /canais/:id/mensagens            → texto ou task-share
POST   /canais/:id/mensagens/:msgId/reply
POST   /canais/:id/mensagens/audio      → multipart/form-data
GET    /canais/:id/mensagens/:msgId/thread

# Busca
GET    /mensagens/busca?q=&canalId=&autorId=&de=&ate=

# Links de compartilhamento de tarefa
POST   /tarefas/:id/share-link          → { expiracaoDias?: number }
GET    /t/:token                        → dados públicos da tarefa (sem auth)
DELETE /tarefas/:id/share-link/:token
```

---

### Componentes Frontend

```
src/app/components/
├── messages/
│   ├── ThreadPanel.tsx            → painel lateral de thread
│   ├── ThreadIndicator.tsx        → badge de contagem de respostas
│   ├── AudioRecorder.tsx          → botão + timer de gravação
│   ├── AudioPlayer.tsx            → player inline com barra de progresso
│   ├── TaskShareCard.tsx          → preview card de tarefa compartilhada
│   ├── MessageSearch.tsx          → modal de busca com filtros
│   ├── ChannelSilenceMenu.tsx     → opções de silenciamento
│   └── TemporaryChannelBadge.tsx  → badge de expiração em canais temporários
```

**Dependências Técnicas:**
- Web Audio API (gravação de áudio — suporte nativo no browser)
- Object storage para áudios (S3/Supabase Storage)
- Full-text search: índice no backend (PostgreSQL `tsvector` ou Elasticsearch)
- F-05 (silenciamento afeta entrega de notificações)

**Esforço:** Alto
**Impacto:** Médio-Alto
**Prioridade:** #5

---

## F-05 — Notificações Integradas {#f-05}

**Feature:** Unified Notification System

**Problema:**
Não existe sistema de notificações. Usuários precisam navegar ativamente para descobrir novos comentários, mudanças de status, ou aprovações pendentes. Reuniões e tarefas não têm alertas.

**Solução:**
Centro de notificações unificado cobrindo tarefas, mensagens, aprovações e reuniões, com suporte a Web Push e preferências granulares por tipo.

---

### Requisitos Funcionais

- [ ] Sino de notificações no header com badge de contagem (não lidas)
- [ ] Painel dropdown com lista de notificações recentes (50 últimas)
- [ ] Tipos de notificação:
  - Tarefa atribuída
  - Comentário em tarefa que participo
  - Menção em comentário (@eu)
  - Mudança de status em tarefa que sigo
  - Aprovação pendente (minha vez no fluxo)
  - Decisão de aprovação (aprovado/rejeitado)
  - Nova mensagem direta (P2P)
  - Menção em canal (@eu)
  - Prazo de tarefa se aproximando (24h antes)
- [ ] Marcar como lida (individual e "todas")
- [ ] Preferências: ativar/desativar por tipo de notificação
- [ ] Web Push para notificações críticas (aprovação, menção direta)

### Requisitos Não Funcionais

- Notificações em tempo real (WebSocket ou SSE)
- Web Push requer HTTPS e service worker
- Notificações de tarefas silenciadas não são entregues (respeita F-04)

---

### Modelagem de Dados

```typescript
type NotificacaoTipo =
  | "tarefa_atribuida" | "comentario_tarefa" | "mencao_comentario"
  | "status_mudou" | "aprovacao_pendente" | "aprovacao_decidida"
  | "mensagem_direta" | "mencao_canal" | "prazo_proximo";

interface Notificacao {
  id: string;
  userId: string;                  // destinatário
  tipo: NotificacaoTipo;
  titulo: string;
  corpo: string;
  lida: boolean;
  linkInterno: string;             // rota para navegar ao clicar
  entidadeId: string;              // tarefaId | canalId | aprovacaoId
  entidadeTipo: "tarefa" | "canal" | "aprovacao";
  criadaEm: string;
}

interface PreferenciasNotificacao {
  userId: string;
  preferencias: Record<NotificacaoTipo, {
    app: boolean;
    push: boolean;
  }>;
}
```

---

### APIs REST

```
GET    /notificacoes?lidas=false&limit=50
PATCH  /notificacoes/:id/lida
PATCH  /notificacoes/todas-lidas
GET    /notificacoes/preferencias
PUT    /notificacoes/preferencias
POST   /notificacoes/push/subscribe  → { subscription: PushSubscription }
```

---

### Componentes Frontend

```
src/app/components/
├── notifications/
│   ├── NotificationBell.tsx       → ícone + badge no header
│   ├── NotificationDropdown.tsx   → painel dropdown de notificações
│   ├── NotificationItem.tsx       → item individual com ícone por tipo
│   └── NotificationPreferences.tsx → settings de preferências
```

**Dependências Técnicas:**
- WebSocket (Socket.io ou nativo) ou Server-Sent Events para real-time
- Service Worker para Web Push
- F-01 (menções em comentários)
- F-02 (triggers de aprovação)
- F-04 (silenciamento)

**Esforço:** Médio
**Impacto:** Alto
**Prioridade:** #2

---

## F-06 — Calendário e Planejamento Visual {#f-06}

**Feature:** Calendar View

**Problema:**
Não existe visualização temporal de tarefas. Times de social media e marketing precisam de uma visão de calendário para planejar publicações e campanhas. A vista Kanban e lista não substituem essa necessidade.

**Solução:**
Nova visualização de calendário para tarefas, com suporte a mês/semana, drag-to-reschedule e filtros por departamento e tipo.

---

### Requisitos Funcionais

- [ ] Vista de mês e semana (toggle)
- [ ] Tarefas exibidas na data de prazo
- [ ] Tarefas com data de início exibidas como range
- [ ] Clicar na tarefa abre popover com resumo e link para detalhe
- [ ] Drag-to-reschedule: arrastar tarefa muda a data de prazo
- [ ] Filtro por departamento, responsável e tipo
- [ ] Indicador de carga: cor de fundo da célula varia conforme quantidade de tarefas
- [ ] Criar tarefa clicando em data vazia
- [ ] Campo `dataInicio` adicionado ao model de Tarefa

### Requisitos Não Funcionais

- Vista de mês deve renderizar no máximo 3 tarefas por dia com "+N mais" clicável
- Drag-to-reschedule deve confirmar antes de salvar se tarefa tiver aprovação ativa

---

### Modelagem de Dados

```typescript
// Adição ao model Tarefa
interface Tarefa {
  // ...campos existentes
  dataInicio?: string;       // ISO date — novo campo
}
```

---

### APIs REST

```
GET  /tarefas/calendario?de=2026-03-01&ate=2026-03-31
                         &departamento=marketing&tipo=design
PATCH /tarefas/:id/reagendar  → { novaData: string, novoInicio?: string }
```

---

### Componentes Frontend

```
src/app/components/
├���─ calendar/
│   ├── CalendarView.tsx           → container principal com toggle mês/semana
│   ├── CalendarMonth.tsx          → grid mensal
│   ├── CalendarWeek.tsx           → grid semanal com horários
│   ├── CalendarDayCell.tsx        → célula de dia com tarefas
│   ├── CalendarTaskChip.tsx       → chip compacto de tarefa
│   └── CalendarTaskPopover.tsx    → popover de resumo ao clicar
```

**Dependências Técnicas:**
- `react-dnd` (já disponível no projeto) para drag-to-reschedule
- Adicionar campo `dataInicio` ao model e ao formulário de criação/edição
- F-01 (filtros compostos reutilizáveis)

**Esforço:** Médio
**Impacto:** Alto
**Prioridade:** #6

---

## F-07 — Importação/Exportação de Dados {#f-07}

**Feature:** Data Import/Export

**Problema:**
A importação CSV atual (Lark/outros) tem matching de departamento case-sensitive inconsistente e sem feedback de erros claro. Não há exportação estruturada além de PDF de relatórios.

**Solução:**
Pipeline robusto de importação CSV com validação, preview antes de importar, mapeamento de colunas, e exportação em CSV/Excel/PDF.

---

### Requisitos Funcionais

**Importação:**
- [ ] Upload de CSV com preview das primeiras 5 linhas
- [ ] Mapeamento de colunas: usuário associa coluna do CSV ao campo do sistema
- [ ] Validação linha a linha com erros detalhados (linha N: campo X inválido)
- [ ] Importação parcial: importar linhas válidas, ignorar ou corrigir inválidas
- [ ] Progress bar durante importação em lote
- [ ] Relatório final: N importadas, N com erro, N ignoradas
- [ ] Suporte a formatos: CSV, XLSX (futuro)

**Exportação:**
- [ ] Exportar lista de tarefas filtrada como CSV
- [ ] Exportar relatório de OKRs como PDF
- [ ] Exportar dashboard como PNG/PDF
- [ ] Exportar histórico de aprovações como CSV

### Requisitos Não Funcionais

- Importação de até 1.000 linhas deve completar em < 30s
- Mapeamento de colunas deve ser salvo por usuário (não repetir configuração)
- Sanitizar todos os campos importados (strip HTML, validar URLs)

---

### Modelagem de Dados

```typescript
interface ImportacaoJob {
  id: string;
  userId: string;
  status: "pendente" | "validando" | "importando" | "concluido" | "erro";
  totalLinhas: number;
  importadas: number;
  erros: ImportacaoErro[];
  mapeamento: Record<string, string>;  // coluna_csv → campo_sistema
  criadoEm: string;
}

interface ImportacaoErro {
  linha: number;
  campo: string;
  valor: string;
  motivo: string;
}

interface MapeamentoColunas {
  userId: string;
  nome: string;               // "Lark Import", "Notion Import"
  mapeamento: Record<string, string>;
}
```

---

### APIs REST

```
POST   /importacao/preview     → multipart/form-data, retorna primeiras 5 linhas
POST   /importacao/validar     → { arquivo, mapeamento } → erros por linha
POST   /importacao/executar    → { arquivo, mapeamento, ignorarErros: boolean }
GET    /importacao/:jobId      → status do job

GET    /exportacao/tarefas?filtros=...    → CSV stream
GET    /exportacao/okrs/:periodo          → PDF blob
POST   /exportacao/dashboard              → PNG blob
```

---

### Componentes Frontend

```
src/app/components/
├── import/
│   ├── ImportWizard.tsx           → stepper: upload → mapeamento → preview → importar
│   ├── ColumnMapper.tsx           → drag-and-drop de colunas para campos
│   ├── ImportPreviewTable.tsx     → tabela de preview das primeiras linhas
│   ├── ImportErrorList.tsx        → lista de erros com linha e sugestão
│   └── ImportProgressBar.tsx     → progresso em tempo real
```

**Dependências Técnicas:**
- `PapaParse` (já disponível) para parsing
- `SheetJS (xlsx)` para suporte a XLSX no futuro
- `jsPDF + jspdf-autotable` (já disponível) para exportação PDF
- Corrigir bug de matching case-sensitive do CSV import atual

**Esforço:** Médio
**Impacto:** Médio
**Prioridade:** #7

---

## F-08 — Integrações Externas {#f-08}

**Feature:** External Integrations Hub

**Problema:**
Time utiliza Google Drive, Figma, Gitbook e sistema de leads em silos separados. A transição entre ferramentas gera perda de contexto e retrabalho manual.

**Solução:**
Hub de integrações com OAuth2 para Google Drive e Figma, iframe embed para Gitbook, e SSO redirect para sistema de leads.

---

### Requisitos Funcionais

**Google Drive:**
- [ ] OAuth2: conectar conta Google por usuário
- [ ] Browser de arquivos Drive dentro do sistema (modal)
- [ ] Anexar arquivo do Drive a uma tarefa (link + metadata)
- [ ] Sincronização automática de documentos: Drive → módulo Documentos (one-way sync)
- [ ] Exibir thumbnail de arquivos Drive no módulo de documentos

**Figma:**
- [ ] OAuth2: conectar conta Figma
- [ ] Preview de frame Figma ao anexar link de Figma em tarefa
- [ ] Embed de protótipos Figma no detalhe da tarefa
- [ ] Sincronizar comentários do Figma → comentários da tarefa (webhook)

**Gitbook:**
- [ ] Embed de página Gitbook via iframe no módulo Documentos
- [ ] Campo `gitbookUrl` na configuração do workspace por departamento
- [ ] Link direto para criar/editar página no Gitbook

**Sistema de Leads (SSO + Redirect):**
- [ ] Botão de acesso rápido com SSO (SAML ou OAuth2)
- [ ] Parâmetros de redirect com token de sessão
- [ ] Badge no menu lateral indicando leads ativos (via API do sistema externo)

### Requisitos Não Funcionais

- OAuth tokens devem ser armazenados encriptados no backend
- Tokens expirados devem disparar re-autenticação silenciosa (refresh token)
- Integrações são per-user (não compartilhadas no tenant)
- Timeouts de integrações externas não devem bloquear a UI principal

---

### Modelagem de Dados

```typescript
interface IntegracaoUsuario {
  id: string;
  userId: string;
  tipo: "google_drive" | "figma" | "gitbook" | "leads";
  accessToken: string;           // encriptado
  refreshToken?: string;
  expiresAt: string;
  scope: string;
  metadata: Record<string, unknown>;  // email, workspace, etc.
  ativo: boolean;
}

interface AnexoDrive {
  id: string;
  tarefaId: string;
  driveFileId: string;
  nome: string;
  mimeType: string;
  thumbnailUrl: string;
  webViewLink: string;
  modificadoEm: string;
}
```

---

### APIs REST

```
# OAuth flows
GET    /integracoes/google/auth       → redirect para Google OAuth
GET    /integracoes/google/callback   → trocar code por token
GET    /integracoes/figma/auth
GET    /integracoes/figma/callback
DELETE /integracoes/:tipo/desconectar

# Google Drive
GET    /integracoes/drive/arquivos?q=&folderId=
POST   /tarefas/:id/anexos/drive      → { driveFileId }

# Figma
GET    /integracoes/figma/preview?url=  → metadata + thumbnail
POST   /integracoes/figma/webhook       → receber comentários

# Status das integrações
GET    /integracoes/status              → quais estão conectadas para o user
```

---

### Componentes Frontend

```
src/app/components/
├── integrations/
│   ├── IntegrationsHub.tsx        → página de configuração de integrações
│   ├── IntegrationCard.tsx        → card de integração com status connect/disconnect
│   ├── DriveFilePicker.tsx        → modal browser de arquivos Drive
│   ├── FigmaPreviewCard.tsx       → preview de frame Figma inline
│   ├── GitbookEmbed.tsx           → iframe wrapper com loader
│   └── LeadsAccessButton.tsx      → botão SSO com badge de leads ativos
```

**Dependências Técnicas:**
- Google OAuth2 + Drive API v3
- Figma OAuth2 + REST API
- Backend necessário para armazenar tokens (não pode ser client-side)
- HTTPS obrigatório para OAuth callbacks
- CORS proxy para evitar vazamento de tokens no frontend

**Esforço:** Alto
**Impacto:** Médio
**Prioridade:** #8 (Google Drive e Figma primeiro; Gitbook e Leads depois)

---

## F-09 — Analytics e Dashboards v2 {#f-09}

**Feature:** Advanced Analytics & OKR Transparency

**Problema:**
O dashboard atual exibe métricas estáticas e os OKRs não têm visibilidade cruzada entre departamentos. Não há gráficos de progresso por tipo de tarefa.

**Solução:**
Dashboard configurável com widgets, gráficos de progresso por tipo, e uma view de OKRs públicos acessível a todos os funcionários.

---

### Requisitos Funcionais

**Dashboard:**
- [ ] Widgets configuráveis por usuário (drag-to-reorder, mostrar/ocultar)
- [ ] Widget: Tarefas por tipo (gráfico de pizza/donut por `tipo`)
- [ ] Widget: Throughput semanal (tarefas concluídas por semana — linha)
- [ ] Widget: Gráfico de burndown por departamento
- [ ] Widget: Lead time médio por tipo de tarefa
- [ ] Widget: Minhas tarefas atrasadas
- [ ] Filtro de período global: últimos 7 / 30 / 90 dias

**OKRs Transparency:**
- [ ] View pública de OKRs de todos os departamentos
- [ ] Filtro por período e departamento
- [ ] Status visual por Key Result: On Track / At Risk / In Danger
- [ ] Histórico de evolução do KR (sparkline)
- [ ] Comentários públicos em Key Results

### Requisitos Não Funcionais

- Métricas de analytics calculadas server-side (não no cliente)
- Dashboard configurável salvo por usuário no backend
- Dados de OKRs em cache com TTL de 5 minutos

---

### Modelagem de Dados

```typescript
interface DashboardConfig {
  userId: string;
  widgets: DashboardWidget[];
  periodoPadrao: "7d" | "30d" | "90d";
}

interface DashboardWidget {
  id: string;
  tipo: WidgetTipo;
  posicao: number;
  visivel: boolean;
  config: Record<string, unknown>;  // ex: { departamento: "marketing" }
}

type WidgetTipo =
  | "tarefas_por_tipo" | "throughput" | "burndown"
  | "lead_time" | "atrasadas" | "okr_summary";

// Evolução de KR (histórico)
interface KRSnapshot {
  id: string;
  krId: string;
  valor: number;
  data: string;
  registradoPor: string;
  comentario?: string;
}
```

---

### APIs REST

```
GET    /analytics/tarefas/por-tipo?periodo=30d&departamento=
GET    /analytics/tarefas/throughput?periodo=30d&semanas=8
GET    /analytics/tarefas/burndown?departamento=&periodo=
GET    /analytics/tarefas/lead-time?tipo=

GET    /okrs?departamento=&periodo=&publico=true
POST   /okrs/:id/key-results/:krId/snapshot   → { valor, comentario }
GET    /okrs/:id/key-results/:krId/historico

GET    /dashboard/config
PUT    /dashboard/config
```

---

### Componentes Frontend

```
src/app/components/
├── analytics/
│   ├── DashboardGrid.tsx          → grid configurável com DnD
│   ├── WidgetWrapper.tsx          → container com header, ações e resize
│   ├── TasksByTypeChart.tsx       → donut chart (Recharts)
│   ├── ThroughputChart.tsx        → area chart semanal
│   ├── BurndownChart.tsx          → linha de burndown
│   ├── LeadTimeWidget.tsx         → tabela de lead time por tipo
│   └── OKRPublicView.tsx          → view de OKRs cross-departamental
├── okrs/
│   ├── KRSparkline.tsx            → gráfico minimalista de evolução
│   └── KRCommentThread.tsx        → comentários em Key Result
```

**Dependências Técnicas:**
- `recharts` (já disponível)
- `react-dnd` para dashboard configurável
- Agregações calculadas no backend (performance)
- F-01 (`tipo` de tarefa — base para tarefas_por_tipo widget)

**Esforço:** Médio-Alto
**Impacto:** Médio
**Prioridade:** #9

---

## F-10 — Personalização de UI (Tema) {#f-10}

**Feature:** Theme Customization (Dark / Light / Custom)

**Problema:**
O sistema opera exclusivamente em modo dark. Usuários solicitam modo claro. O toggle já consta no README mas não está implementado.

**Solução:**
Toggle dark/light com persistência, baseado em CSS custom properties já existentes no `theme.css`. Minimal effort — a arquitetura já suporta.

---

### Requisitos Funcionais

- [ ] Toggle dark/light no header ou em Settings
- [ ] Persistir preferência no `localStorage` (e futuramente no perfil do usuário)
- [ ] Respeitar `prefers-color-scheme` do SO como default
- [ ] Aplicar via classe no `<html>` (`class="dark"` ou `class="light"`)

### Requisitos Não Funcionais

- Troca de tema sem flash de conteúdo (aplicar classe antes do render)
- Todos os componentes devem ter variante clara mapeada

---

### Modelagem de Dados

```typescript
// Simples — sem novo model, salvo em localStorage
// localStorage.theme = "dark" | "light" | "system"

// Futuro: adicionar ao UserProfile
interface UserPreferences {
  userId: string;
  tema: "dark" | "light" | "system";
  // outros: idioma, fuso horário, notificações
}
```

---

### Implementação

```typescript
// src/app/utils/theme.ts
export function initTheme() {
  const saved = localStorage.getItem("theme") ?? "dark";
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const tema = saved === "system" ? (prefersDark ? "dark" : "light") : saved;
  document.documentElement.classList.toggle("dark", tema === "dark");
}

// Chamar em main.tsx antes do ReactDOM.render()
```

```css
/* src/styles/theme.css — adicionar variáveis light */
:root.light {
  --background: #ffffff;
  --surface: #f5f5f5;
  --text-primary: #0a0a0a;
  /* ... mapear todas as variáveis existentes */
}
```

---

### Componentes Frontend

```
src/app/components/
├── common/
│   └── ThemeToggle.tsx            → switch com ícone sol/lua
```

**Dependências Técnicas:**
- CSS custom properties já definidas em `theme.css` — precisa mapear variáveis light
- `matchMedia` API (nativo no browser)

**Esforço:** Baixo
**Impacto:** Médio
**Prioridade:** #2 (Quick Win)

---

## Roadmap Sugerido {#roadmap}

### NOW (Sprint 1–2 | Semanas 1–4)
> Fundação e Quick Wins — alto impacto, desbloqueiam outras features

| Feature | O que entregar | Prioridade |
|---------|---------------|------------|
| **F-10 Tema** | Toggle dark/light com persistência | QW-1 |
| **F-05 Notificações** | Centro de notificações no header (sem Web Push) | #2 |
| **F-01 Task v2 — Filtros** | Filtros avançados compostos + busca | QW-2 |
| **F-01 Task v2 — Links** | Campo de links externos (Figma, Drive) | QW-3 |
| **F-01 Task v2 — Tipo** | Campo de tipagem de tarefa | QW-4 |
| **F-01 Task v2 — Comentários** | Threading em comentários + @menções | #1 |
| **F-07 Import CSV** | Fix do bug de matching + wizard de importação | QW-5 |

---

### NEXT (Sprint 3–5 | Semanas 5–10)
> Core features — diferenciação do produto

| Feature | O que entregar |
|---------|---------------|
| **F-01 Status customizáveis** | Pipeline de status por departamento |
| **F-01 Espaço pessoal** | Visibilidade "pessoal" nas tarefas |
| **F-02 Papéis** | Executor/revisor/aprovador por tarefa |
| **F-02 Fluxo de aprovação** | Motor de aprovação multi-step |
| **F-03 Templates** | Galeria + criação de templates |
| **F-06 Calendário** | Vista mensal e semanal de tarefas |
| **F-04 Mensagens v2** | Threads + busca + canais temporários + áudio |

---

### LATER (Sprint 6+ | Semanas 11+)
> Expansão e integrações — crescimento da plataforma

| Feature | O que entregar |
|---------|---------------|
| **F-09 Analytics v2** | Dashboard configurável + OKR transparency |
| **F-08 Google Drive** | OAuth2 + file picker |
| **F-08 Figma** | OAuth2 + preview inline |
| **F-05 Web Push** | Notificações push para aprovações |
| **F-08 Gitbook** | Embed iframe no módulo Documentos |
| **F-08 SSO Leads** | Redirect com token de sessão |
| **F-07 Exportação** | CSV/PDF de tarefas e OKRs |

---

## Quick Wins {#quick-wins}

Features de **alto impacto com baixo esforço** — podem ser implementadas em 1–3 dias cada:

| # | Feature | Esforço | Impacto | Justificativa |
|---|---------|---------|---------|---------------|
| QW-1 | **Toggle Dark/Light** | 1 dia | Alto | CSS vars já existem; é só mapear light mode + switch |
| QW-2 | **Filtros Avançados** | 2 dias | Alto | Lógica é client-side; estado já existe |
| QW-3 | **Campo de Links** | 1 dia | Alto | Extensão simples do form atual; salvar como array |
| QW-4 | **Tipagem de Tarefa** | 1 dia | Médio | Select adicional no form; filtro extra |
| QW-5 | **Fix CSV Import** | 0.5 dia | Médio | Normalizar `.toLowerCase()` + trim() no parser |
| QW-6 | **Busca de tarefas** | 1 dia | Alto | `fuse.js` ou filter nativo por título/descrição/tags |
| QW-7 | **Espaço Pessoal** | 1 dia | Médio | Campo `visibilidade` + filtro "Minhas tarefas" |

---

## Riscos Técnicos e Pontos de Atenção {#riscos}

### Riscos de Arquitetura

**R-01: Migração de `responsavel: string` para `responsavelId`**
O campo atual é texto livre (nome do usuário). Migrar para `userId` é necessário para F-01, F-02 e F-05, mas quebra dados mock existentes e requer formulário com user picker.
→ **Ação:** Criar `UserPicker` component + planejar migration de dados antes do F-01.

**R-02: Status customizáveis vs. Kanban hardcoded**
O Kanban atual tem 3 colunas fixas (planejamento / em-andamento / concluído). Status dinâmicos vão requerer refatoração completa do `TarefasKanban.tsx`.
→ **Ação:** Refatorar Kanban para renderizar colunas a partir de `StatusConfig` antes de lançar status customizados.

**R-03: Ausência de backend**
Todas as features de Now dependem apenas de mock data no client. Features de Next em diante (aprovação, notificações real-time, OAuth) requerem backend real.
→ **Ação:** Definir backend antes do Sprint 3. Supabase é recomendado dado o stack atual (PostgreSQL + Auth + Storage + Realtime).

**R-04: Bundle size**
O bundle atual (~9.6 MB não comprimido) sem lazy loading pode degradar com adição de integrações pesadas (SheetJS, Figma SDK).
→ **Ação:** Implementar `React.lazy` + `Suspense` por rota antes de adicionar mais libs.

### Riscos de Produto

**R-05: Status customizáveis podem fragmentar relatórios**
Se cada departamento cria status únicos, métricas cross-departamental ficam inconsistentes.
→ **Ação:** Cada status deve ter flag `ehFinal: boolean` para compor métricas de "concluído" independente do label.

**R-06: Fluxo de aprovação pode conflitar com Kanban**
Uma tarefa em aprovação não deve ser movida no Kanban. Precisa de lock visual.
→ **Ação:** Cards em aprovação ativa devem ser não-arrastáveis + badge de "Em aprovação".

**R-07: Permissões multi-tenant não estão implementadas**
O RBAC atual é simples (admin/manager/member). Features como aprovação hierárquica e templates globais requerem permissões mais granulares.
→ **Ação:** Antes do F-02, definir matriz de permissões completa e implementar middleware de autorização.

---

*Documento gerado por: Claude Code (claude-sonnet-4-6)*
*Revisão necessária por: Tech Lead + Product Manager*
*Próximo passo sugerido: Alinhar prioridades do NOW com o time e iniciar F-10 + F-01 filtros*
