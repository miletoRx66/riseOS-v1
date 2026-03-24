# Sistema de Tarefas - Rise Admin

## 📋 Visão Geral

Sistema completo de gestão de tarefas integrado ao sistema administrativo Rise, com múltiplas visualizações, gestão detalhada e dados mock completos.

## 🎯 Telas Implementadas

### 1. **Lista de Tarefas** (`/tarefas`)
**Arquivo:** `/src/app/pages/Tarefas.tsx`

**Funcionalidades:**
- ✅ Visualização em grid de todas as tarefas
- ✅ Cards clicáveis com informações resumidas
- ✅ Estatísticas por status (Planejamento, Em Andamento, Concluído)
- ✅ Filtros por departamento e status
- ✅ Botão "Nova Tarefa" funcional
- ✅ Alternância para vista Kanban
- ✅ Contador de tarefas por status

**Dados Exibidos:**
- Título da tarefa
- Departamento
- Status com cores
- Prioridade (indicador visual para alta)
- Responsável
- Data de prazo
- Descrição resumida

---

### 2. **Detalhes da Tarefa** (`/tarefas/:id`)
**Arquivo:** `/src/app/pages/TarefaDetail.tsx`

**Funcionalidades:**
- ✅ Visualização completa de todos os dados da tarefa
- ✅ Seção de descrição e tags
- ✅ Lista de subtarefas com checkbox visual
- ✅ Sistema de anexos com download
- ✅ Sistema de comentários com input
- ✅ Histórico de atividades (timeline)
- ✅ Sidebar com detalhes (responsável, prazo, data de criação)
- ✅ Indicador de progresso visual
- ✅ Botões de ação (Editar, Adicionar Anexo, Adicionar Subtarefa, Excluir)
- ✅ Breadcrumb de navegação

**Seções:**
1. **Header**: Título, badges (departamento, status, prioridade), botões de ação
2. **Descrição**: Texto completo e tags
3. **Subtarefas**: Lista com checkbox e progresso
4. **Anexos**: Cards com nome, tipo, tamanho e data
5. **Comentários**: Sistema de comentários com input para novos
6. **Atividades**: Timeline de histórico
7. **Sidebar**: Detalhes, progresso e ações rápidas

---

### 3. **Nova Tarefa** (`/tarefas/nova`)
**Arquivo:** `/src/app/pages/NovaTarefa.tsx`

**Funcionalidades:**
- ✅ Formulário completo de criação
- ✅ Validação de campos obrigatórios
- ✅ Feedback de erros em tempo real
- ✅ Campos: Título, Descrição, Departamento, Status, Prioridade, Responsável, Prazo, Tags
- ✅ Botões Salvar e Cancelar
- ✅ Navegação automática após criação

**Campos:**
- Título * (obrigatório)
- Descrição (textarea)
- Departamento * (select)
- Status (select)
- Prioridade (select)
- Responsável * (text)
- Data de Prazo * (date picker)
- Tags (text com vírgulas)

---

### 4. **Editar Tarefa** (`/tarefas/:id/editar`)
**Arquivo:** `/src/app/pages/EditarTarefa.tsx`

**Funcionalidades:**
- ✅ Formulário pré-preenchido com dados existentes
- ✅ Validação de campos obrigatórios
- ✅ Campo adicional de progresso com slider
- ✅ Atualização de tags existentes
- ✅ Navegação de volta aos detalhes após salvar
- ✅ Verificação se tarefa existe (404 se não)

**Campos Adicionais:**
- Progresso (slider 0-100%)

---

### 5. **Vista Kanban** (`/tarefas/kanban`)
**Arquivo:** `/src/app/pages/TarefasKanban.tsx`

**Funcionalidades:**
- ✅ Visualização em quadro (3 colunas)
- ✅ Colunas: Planejamento, Em Andamento, Concluído
- ✅ Cards compactos e otimizados
- ✅ Contador de tarefas por coluna
- ✅ Filtro por departamento
- ✅ Indicadores de progresso, subtarefas e comentários
- ✅ Alternância para vista em lista
- ✅ Cards clicáveis para detalhes

**Informações nos Cards:**
- Título
- Departamento
- Indicador de prioridade alta
- Barra de progresso
- Avatar e nome do responsável
- Data de prazo
- Contador de subtarefas concluídas
- Contador de comentários

---

## 📊 Dados Mock Expandidos

### Estrutura de Dados de Tarefa Completa

```typescript
{
  id: string;
  titulo: string;
  departamento: DepartamentoId;
  status: TarefaStatus;
  prioridade: TarefaPrioridade;
  responsavel: string;
  prazo: string;
  descricao: string;
  dataCriacao: string;
  tags: string[];
  progresso: number;
  
  subtarefas: [
    {
      id: string;
      titulo: string;
      concluida: boolean;
      responsavel: string;
    }
  ];
  
  comentarios: [
    {
      id: string;
      autor: string;
      conteudo: string;
      data: string;
    }
  ];
  
  anexos: [
    {
      id: string;
      nome: string;
      tipo: string;
      tamanho: string;
      dataUpload: string;
    }
  ];
  
  atividades: [
    {
      id: string;
      tipo: "criacao" | "status" | "comentario" | "anexo" | "subtarefa" | "edicao";
      descricao: string;
      usuario: string;
      data: string;
    }
  ];
}
```

### 8 Tarefas Mock Criadas

1. **Campanha de lançamento Q1** (Marketing - Em Andamento - Alta)
   - 4 subtarefas (2 concluídas)
   - 2 comentários
   - 2 anexos
   - 65% progresso

2. **Otimização de processos internos** (Ops - Planejamento - Média)
   - 3 subtarefas (1 concluída)
   - 1 comentário
   - 1 anexo
   - 20% progresso

3. **Estratégia de vendas B2B** (Comercial - Em Andamento - Alta)
   - 4 subtarefas (3 concluídas)
   - 1 comentário
   - 2 anexos
   - 75% progresso

4. **Roadmap de features 2026** (Produto - Concluído - Alta)
   - 4 subtarefas (todas concluídas)
   - 1 comentário
   - 1 anexo
   - 100% progresso

5. **Análise de métricas de redes sociais** (Marketing - Em Andamento - Média)
   - 3 subtarefas (1 concluída)
   - 40% progresso

6. **Implementação de automação** (Ops - Planejamento - Alta)
   - 3 subtarefas
   - 15% progresso

7. **Treinamento equipe de vendas** (Comercial - Em Andamento - Alta)
   - 3 subtarefas (2 concluídas)
   - 1 comentário
   - 1 anexo
   - 55% progresso

8. **Pesquisa de satisfação de usuários** (Produto - Em Andamento - Média)
   - 3 subtarefas (1 concluída)
   - 30% progresso

---

## 🎨 Design System

### Cores por Status
- **Planejamento**: `#6B8AFF` (Azul)
- **Em Andamento**: `#28d939` (Verde Rise)
- **Concluído**: `#bdbdbd` (Cinza)
- **Pausado**: `#ff6b6b` (Vermelho)

### Cores por Prioridade
- **Alta**: `#ff6b6b` (Vermelho)
- **Média**: `#FFA500` (Laranja)
- **Baixa**: `#6B8AFF` (Azul)

### Cores por Departamento
- **Marketing**: `#28d939` (Verde)
- **Operações**: `#14E9BC` (Teal Rise)
- **Comercial**: `#6B8AFF` (Azul)
- **Produto**: `#E879F9` (Rosa)

---

## 🔄 Fluxo de Navegação

```
/tarefas (Lista)
├── → /tarefas/nova (Criar) → /tarefas (volta após criar)
├── → /tarefas/kanban (Vista Kanban) ⟷ /tarefas (alternar vistas)
└── → /tarefas/:id (Detalhes)
    ├── → /tarefas/:id/editar (Editar) → /tarefas/:id (volta após editar)
    └── → /tarefas (voltar para lista)
```

---

## 📁 Arquivos Criados/Modificados

### Páginas Novas (4)
1. `/src/app/pages/TarefaDetail.tsx` - Detalhes completos
2. `/src/app/pages/NovaTarefa.tsx` - Formulário de criação
3. `/src/app/pages/EditarTarefa.tsx` - Formulário de edição
4. `/src/app/pages/TarefasKanban.tsx` - Vista em quadro

### Páginas Modificadas (1)
1. `/src/app/pages/Tarefas.tsx` - Adicionado botão funcional e alternância de vistas

### Componentes Modificados (1)
1. `/src/app/components/common/TaskCard.tsx` - Adicionado prop `id` e Link clicável

### Dados Modificados (1)
1. `/src/app/data/mockData.ts` - Expandido com dados completos (subtarefas, comentários, anexos, atividades)

### Types Modificados (1)
1. `/src/app/types/index.ts` - Adicionados tipos: Subtarefa, Comentario, Anexo, AtividadeTarefa

### Rotas Modificadas (1)
1. `/src/app/routes.ts` - Adicionadas 4 novas rotas

---

## ✨ Funcionalidades Principais

### Gestão Completa
- ✅ Criar tarefas
- ✅ Editar tarefas
- ✅ Visualizar detalhes
- ✅ Filtrar por departamento
- ✅ Filtrar por status
- ✅ Múltiplas visualizações (Lista/Kanban)

### Interatividade
- ✅ Cards clicáveis
- ✅ Formulários validados
- ✅ Sistema de comentários
- ✅ Gestão de subtarefas
- ✅ Gestão de anexos
- ✅ Histórico de atividades

### UX/UI
- ✅ Tema dark consistente
- ✅ Cores Rise (teal #14E9BC, verde #28d939)
- ✅ Tipografia Inter
- ✅ Feedback visual (hover, active)
- ✅ Estados vazios
- ✅ Validação em tempo real
- ✅ Breadcrumbs e navegação clara

---

## 🚀 Próximas Melhorações Sugeridas

1. **Funcionalidades**
   - [ ] Drag & drop no Kanban
   - [ ] Filtros avançados (prioridade, responsável, data)
   - [ ] Busca por texto
   - [ ] Ordenação customizável
   - [ ] Notificações
   - [ ] Menções em comentários (@usuario)

2. **Integrações**
   - [ ] Upload real de anexos
   - [ ] Integração com calendário
   - [ ] Export para Excel/PDF
   - [ ] Webhooks/automações

3. **Analytics**
   - [ ] Dashboard de produtividade
   - [ ] Tempo médio por tarefa
   - [ ] Gráficos de conclusão
   - [ ] Relatórios por departamento

---

**Total de Telas de Tarefas:** 5 (Lista, Kanban, Detalhes, Criar, Editar)
**Total de Arquivos Criados:** 5
**Total de Arquivos Modificados:** 4
**Total de Dados Mock:** 8 tarefas completas com todos os relacionamentos
