# RiseOS — Plano de Implementação
*Atualizado em: 22/03/2026 | Base: Feedback multidepartamental (SPEC_TECNICA_V2.md)*

Este documento é a referência central da equipe para acompanhar o que já foi feito, o que está em andamento e o que vem a seguir.

---

## Contexto

O sistema passou por uma auditoria completa e coleta de feedback multidepartamental. O resultado foi consolidado na `SPEC_TECNICA_V2.md` com 10 features priorizadas. Este plano de implementação executa essas features em 3 sprints progressivos.

**Stack:** React 18 + TypeScript + Vite 6 + Tailwind CSS v4 + React Router v7
**Dados:** Mock (sem backend real) — toda a persistência é em `mockData.ts` e `localStorage`
**Regra principal:** Nunca usar `alert()`, sem `console.log` em produção, validação sempre inline

---

## Status Geral

| Sprint | Foco | Status |
|--------|------|--------|
| Sprint 1 — NOW | Quick Wins + Fundação | **Em andamento** |
| Sprint 2 — NEXT | Core Features | Não iniciado |
| Sprint 3 — LATER | Expansão e Integrações | Não iniciado |

---

## Sprint 1 — NOW
> Quick Wins e fundação. Alto impacto, baixo esforço, desbloqueiam features futuras.

### Concluído

#### F-10: Toggle Dark/Light (Tema)
- **O que foi feito:** `ThemeContext` com `localStorage` + toggle Sol/Lua no sidebar
- **Arquivos:** `src/app/context/ThemeContext.tsx`, `src/app/App.tsx`, `src/app/components/layout/MainLayout.tsx`
- **Detalhe:** Classe `.dark` aplicada no `<html>`, persistência em `localStorage` com chave `rise-theme`

#### F-01: Campo `tipo` na Tarefa
- **O que foi feito:** Campo `tipo` adicionado ao model, formulários (Nova/Editar) e exibição no detalhe
- **Valores:** `backend | frontend | infra | design | marketing | comercial | ops | pesquisa | outro`
- **Arquivos:** `mockData.ts`, `NovaTarefa.tsx`, `EditarTarefa.tsx`, `TarefaDetail.tsx`

#### F-01: Campo `visibilidade` na Tarefa
- **O que foi feito:** Campo `visibilidade` nos formulários, badge no detalhe, aba "Minhas Tarefas"
- **Valores:** `publica | departamento | pessoal`
- **Arquivos:** `mockData.ts`, `NovaTarefa.tsx`, `EditarTarefa.tsx`, `TarefaDetail.tsx`, `Tarefas.tsx`

#### F-01: Campo `links[]` na Tarefa
- **O que foi feito:** UI de adicionar/remover links em Nova e Editar Tarefa; exibição no detalhe
- **Campos por link:** `id`, `titulo`, `url`, `tipo` (figma | drive | notion | github | jira | outro)
- **Arquivos:** `NovaTarefa.tsx`, `EditarTarefa.tsx`, `TarefaDetail.tsx`

#### F-01: Filtros Avançados
- **O que foi feito:** Busca por texto (título, responsável, tags), filtro de prioridade, filtro de tipo
- **Somado ao existente:** Filtros de departamento e status já existiam
- **Arquivo:** `Tarefas.tsx`

#### F-01: "Minhas Tarefas"
- **O que foi feito:** Aba no topo da página de Tarefas filtrando por `responsavel` do usuário logado ou `visibilidade === "pessoal"`
- **Arquivo:** `Tarefas.tsx`

#### F-01: Comment Threading
- **O que foi feito:** Botão "Responder" em cada comentário, textarea inline para reply, respostas renderizadas indentadas com borda lateral
- **Arquivo:** `TarefaDetail.tsx`

---

### Pendente no Sprint 1

#### F-01: @menções em Comentários
- **O que falta:** Detectar `@nome` no input e popular `mencoes: string[]` no objeto `Comentario`
- **Escopo:** Highlight visual do @nome digitado + lista de usuários sugeridos ao digitar `@`
- **Arquivo:** `TarefaDetail.tsx`
- **Dependência:** Lista de `usuarios` de `mockData.ts`

#### F-07: Fix do CSV Import
- **O que falta:** Normalização case-insensitive já funciona, mas falta:
  1. Mapeamento de colunas (usuário associa coluna do CSV ao campo do sistema)
  2. Importação parcial (importar linhas válidas, pular inválidas com aviso)
  3. Progress bar durante importação
- **Arquivo:** `Tarefas.tsx` (modal de importação)

---

## Sprint 2 — NEXT
> Core features. Diferenciação do produto. Dependem de F-01 concluído.

### F-05: Centro de Notificações
**Prioridade: Alta — usuários não sabem de comentários/aprovações sem navegar ativamente**

- Sino no header com badge de contagem (não lidas)
- Dropdown com 50 últimas notificações
- Tipos: tarefa atribuída, comentário, menção, status mudou, aprovação pendente, prazo próximo
- Marcar como lida (individual e "marcar todas")
- **Arquivos a criar:** `NotificationBell.tsx`, `NotificationDropdown.tsx`, `NotificationItem.tsx`
- **Dados:** Mock de `notificacoes[]` em `mockData.ts`

### F-01: Status Customizáveis por Departamento
**Prioridade: Alta — Marketing e Ops precisam de pipelines próprios (Briefing → Revisão → Aprovado)**

- `StatusConfig` por `departamentoId` com label, cor e ordem
- Status global padrão mantido para departamentos sem config própria
- Seletor de status no detalhe da tarefa adapta ao pipeline do departamento
- **Dados a criar:** `statusConfigs[]` em `mockData.ts`
- **Arquivos a criar:** `TaskStatusPipeline.tsx`
- **Arquivos a editar:** `TarefaDetail.tsx`, `EditarTarefa.tsx`

### F-02: Papéis por Tarefa + Fluxo de Aprovação
**Prioridade: Alta — aprovações acontecem fora do sistema (WhatsApp/e-mail), sem rastreabilidade**

- Papéis: `executor | revisor | aprovador | observador` por tarefa
- Motor de aprovação multi-step sequencial
- Cada step: aprovar, rejeitar, solicitar revisão (comentário obrigatório)
- Status da tarefa avança automaticamente
- Histórico de aprovações na timeline da tarefa
- **Dados a criar:** `fluxosAprovacao[]`, `aprovacaoInstancias[]` em `mockData.ts`
- **Arquivos a criar:** `ApprovalBadge.tsx`, `ApprovalTimeline.tsx`, `ApprovalActionPanel.tsx`
- **Arquivos a editar:** `TarefaDetail.tsx`, `NovaTarefa.tsx`

### F-03: Templates de Tarefas
**Prioridade: Média — tarefas recorrentes são criadas do zero com campos inconsistentes**

- Templates com: título-modelo, tipo, prioridade, subtarefas pré-definidas, links padrão, SLA em dias
- Escopo por departamento ou global (admin)
- "Salvar tarefa como template" no detalhe
- Seletor de template ao criar nova tarefa
- **Dados a criar:** `tarefaTemplates[]` em `mockData.ts`
- **Arquivos a criar:** `TemplateGallery.tsx`, `TemplatePicker.tsx`, `TemplateCard.tsx`
- **Arquivos a editar:** `NovaTarefa.tsx`

### F-06: Calendário de Tarefas
**Prioridade: Média — Marketing/Social Media precisam de vista temporal para planejar publicações**

- Vista mensal e semanal (toggle)
- Tarefas exibidas na data de prazo
- Clicar na tarefa abre popover com resumo
- Criar tarefa clicando em data vazia
- Adicionar campo `dataInicio?` ao model de Tarefa
- **Rota nova:** `/tarefas/calendario`
- **Arquivos a criar:** `TarefasCalendario.tsx`, `CalendarView.tsx`, `CalendarDayCell.tsx`
- **Dependência:** `react-dnd` (já disponível no projeto) para drag-to-reschedule

### F-04: Mensagens v2
**Prioridade: Média — sistema atual não tem threads, busca, nem canais temporários**

- Threads em mensagens (resposta in-context com painel lateral)
- Busca full-text no histórico por palavra-chave
- Canais temporários com data de expiração
- Arquivar canal (somente leitura)
- Silenciar canal (sem notificações)
- Compartilhar tarefa como card dentro do chat
- **Arquivos a criar:** `ThreadPanel.tsx`, `MessageSearch.tsx`, `TaskShareCard.tsx`
- **Arquivos a editar:** `Messages.tsx` (refatoração do módulo)

---

## Sprint 3 — LATER
> Expansão. Requer backend real para ser implementado em produção.

### F-09: Analytics v2
- Dashboard configurável com widgets (drag-to-reorder)
- Widgets: tarefas por tipo (donut), throughput semanal (linha), burndown, lead time, atrasadas
- OKR Transparency: view pública cross-departamental com histórico de evolução (sparkline)
- **Dependência:** `recharts` (j�� disponível), `react-dnd`

### F-08: Integrações Externas
- **Google Drive:** OAuth2 + file picker para anexar arquivos a tarefas
- **Figma:** OAuth2 + preview inline de frames ao adicionar link Figma
- **Gitbook:** Embed iframe no módulo Documentos
- **SSO Leads:** Redirect com token de sessão para sistema externo
- **Atenção:** Requer backend real (tokens OAuth não podem ficar no client)

### F-05: Web Push
- Notificações push para aprovações críticas e menções diretas
- Requer HTTPS + Service Worker
- **Dependência:** F-05 (centro de notificações) concluído

### F-07: Exportação de Dados
- Exportar tarefas filtradas como CSV
- Exportar relatório de OKRs como PDF
- Exportar dashboard como PNG
- **Dependência:** `jsPDF + jspdf-autotable` (já disponível)

---

## Arquitetura de Dados — Campos Novos

Todos os campos abaixo já foram adicionados ao `mockData.ts` e ao `src/app/types/index.ts`:

```typescript
// Campos adicionados a Tarefa
tipo: "backend" | "frontend" | "infra" | "design" | "marketing" | "comercial" | "ops" | "pesquisa" | "outro"
visibilidade: "publica" | "departamento" | "pessoal"
links: TarefaLink[]

// Novo tipo
interface TarefaLink {
  id: string
  titulo: string
  url: string
  tipo: "figma" | "drive" | "github" | "notion" | "jira" | "outro"
}

// Comentário (threading já suportado)
interface Comentario {
  id: string
  autor: string
  avatarAutor: string
  conteudo: string
  data: string
  parentId?: string   // threading
  mencoes: string[]   // @menções — implementar no Sprint 1
}
```

---

## Regras de Desenvolvimento

1. **Sem backend** — toda lógica é client-side. Dados novos entram em `mockData.ts`, persistência temporária em `useState`.
2. **Sem `alert()`** — erros e feedback sempre via estado React + UI inline.
3. **Sem `console.log`** — remover antes de commitar.
4. **Erros de TypeScript do IDE** — o projeto tem erros pré-existentes de tsconfig (`Cannot find module 'react'`, `JSX requires React in scope`). São um problema de configuração do language server, **não afetam o build do Vite**. Ignorar.
5. **Design system:** cores `#14E9BC` (primary), `#0a0a0a` (bg), `#0f0f0f` (surface), `#333` (border), `#eee` (text). Fonte Inter. Ícones Lucide React.
6. **Tema:** todos os componentes novos devem funcionar em dark e light mode.

---

## Arquivos Principais

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/app/data/mockData.ts` | Fonte de verdade de todos os dados |
| `src/app/types/index.ts` | Interfaces TypeScript de todas as entidades |
| `src/app/routes.ts` | Registro de rotas |
| `src/app/context/AuthContext.tsx` | Sessão e permissões do usuário |
| `src/app/context/ThemeContext.tsx` | Estado dark/light + persistência |
| `src/app/components/layout/MainLayout.tsx` | Sidebar + navegação principal |
| `src/app/pages/Tarefas.tsx` | Lista, filtros, tabs, import CSV |
| `src/app/pages/TarefaDetail.tsx` | Detalhe completo, comentários, links, subtarefas |
| `src/app/pages/NovaTarefa.tsx` | Formulário de criação |
| `src/app/pages/EditarTarefa.tsx` | Formulário de edição |

---

*Documento mantido por: equipe de produto Rise*
*Referência técnica completa: `SPEC_TECNICA_V2.md`*
