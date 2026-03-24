# Rise Admin - Sistema Administrativo

Sistema administrativo completo de gestão para a Rise, similar ao Notion, desenvolvido com React, TypeScript e Tailwind CSS.

## 🚀 Visão Geral

O Rise Admin é um protótipo funcional de sistema administrativo operacional que permite:
- Gestão centralizada de 4 departamentos (Marketing, Ops, Comercial e Produto)
- Controle de tarefas com diferentes status e prioridades
- Organização de documentos e conteúdos
- Visualização de KPIs e métricas por departamento
- Geração de relatórios consolidados

## 🎯 Funcionalidades

### Dashboard Principal
- Visualização de métricas-chave (receita, escritórios, assessores, clientes)
- Cards de quick stats com links para seções específicas
- Tarefas em andamento
- Documentos recentes
- Conteúdos em destaque com cards visuais

### Departamentos
- 4 departamentos pré-configurados: Marketing, Ops, Comercial e Produto
- Cada departamento possui:
  - Espaço de trabalho dedicado
  - KPIs específicos (leads, conversão, eficiência, usuários, etc.)
  - Tarefas associadas
  - Documentos relacionados
  - Gestão de membros
  - Cores e ícones personalizados

### Sistema de Tarefas
- Criação e gerenciamento de tarefas
- Status: Planejamento, Em Andamento, Concluído
- Prioridades: Alta, Média, Baixa
- Filtros por departamento e status
- Visualização de cards com detalhes completos
- Responsáveis e prazos
- Estatísticas de conclusão

### Gestão de Documentos
- Upload e organização de documentos
- Múltiplos tipos: Documento, Manual, Apresentação, Especificação, Guia, Diagrama
- Filtros por departamento
- Busca por título em tempo real
- Visualização em lista ou grid
- Metadados: autor, data de modificação, tamanho
- Preview com imagens (usando assets do Figma)

### Relatórios
- Taxa de conclusão de tarefas
- Distribuição de status (gráficos de barras)
- Performance por departamento com trends
- KPIs consolidados de todos os departamentos
- Filtros por período (semana, mês, trimestre, ano)
- Exportação de relatórios (UI pronta)

## 🎨 Design System

O sistema utiliza o design system da Rise com:
- **Tema dark**: Background #0a0a0a, Surface #0f0f0f
- **Cores principais**:
  - Verde/Teal: #14E9BC (primária), #28d939 (sucesso)
  - Azul: #6B8AFF (info)
  - Rosa: #E879F9 (accent)
  - Vermelho: #ec5d5e (erro)
  - Laranja: #f59e0b (warning)
- **Tipografia**: Inter (Regular, Medium, Semi Bold, Bold)
- **Componentes consistentes**: Todos os componentes seguem o mesmo padrão visual
- **Responsivo**: Layout adaptável para desktop e tablet

## 🗂️ Estrutura do Projeto

```
src/app/
├── components/
│   ├── common/              # Componentes reutilizáveis
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Charts.tsx       # Gráficos simples
│   │   ├── ContentCard.tsx  # Card com imagem
│   │   ├── DepartmentCard.tsx
│   │   ├── EmptyState.tsx
│   │   ├── FormFields.tsx   # Input, TextArea, Select
│   │   ├── Loading.tsx
│   │   ├── MetricCard.tsx   # Card de métrica
│   │   ├── Modal.tsx
│   │   ├── TaskCard.tsx
│   │   ├── Tooltip.tsx
│   │   └── index.ts         # Barrel export
│   └── layout/
│       └── MainLayout.tsx   # Layout principal com sidebar
├── constants/
│   └── theme.ts             # Constantes de cores e tema
├── data/
│   └── mockData.ts          # Dados mock para desenvolvimento
├── pages/
│   ├── Dashboard.tsx        # Dashboard principal
│   ├── Departamentos.tsx    # Lista de departamentos
│   ├── DepartamentoDetail.tsx # Detalhes do departamento
│   ├── Tarefas.tsx          # Gestão de tarefas
│   ├── Documentos.tsx       # Gestão de documentos
│   ├── Relatorios.tsx       # Relatórios e análises
│   └── NotFound.tsx         # Página 404
├── types/
│   └── index.ts             # TypeScript types
├── utils/
│   └── helpers.ts           # Funções utilitárias
├── App.tsx                  # App root com RouterProvider
└── routes.ts                # Configuração de rotas

src/imports/                 # Assets importados do Figma
├── Home.tsx                 # Componentes do design system
├── svg-xl2a669z0b.ts       # SVG paths
└── figma:asset/            # Imagens do Figma
```

## 🚀 Tecnologias

- **React** 18.3.1 - Biblioteca UI
- **TypeScript** - Type safety
- **React Router** 7.13.0 - Navegação (Data mode)
- **Tailwind CSS** v4 - Estilização
- **Lucide React** - Ícones
- **Vite** - Build tool

## 📊 Dados

O sistema utiliza dados mock armazenados em `/src/app/data/mockData.ts`:
- 4 departamentos com configurações completas
- 8 tarefas de exemplo distribuídas entre departamentos
- 6 documentos de diferentes tipos
- KPIs específicos por departamento
- Métricas consolidadas do dashboard

## 🎯 Componentes Principais

### Layout
- **MainLayout**: Sidebar fixa com navegação, perfil de usuário e menu

### Cards
- **MetricCard**: Exibe métricas com variação e gradiente opcional
- **DepartmentCard**: Card de departamento com ícone, cor e estatísticas
- **TaskCard**: Card de tarefa com status, prioridade e detalhes
- **ContentCard**: Card visual com imagem e título

### Formulários
- **Input**: Campo de texto com label, erro e helper text
- **TextArea**: Campo de texto multilinha
- **Select**: Dropdown com opções
- **Button**: Botão com variantes (primary, secondary, outline, ghost)

### Feedback
- **Badge**: Tag colorida para status
- **Loading**: Spinner de carregamento
- **EmptyState**: Estado vazio com ícone e ação
- **Modal**: Modal reutilizável com backdrop
- **Tooltip**: Tooltip posicionável

## 💡 Funcionalidades Implementadas

✅ Navegação entre páginas com React Router
✅ Sidebar responsiva com menu ativo
✅ Dashboard com métricas em tempo real
✅ Filtros e buscas funcionais
✅ Visualização em grid e lista (documentos)
✅ Cards interativos com hover states
✅ Estados vazios tratados
✅ Sistema de cores consistente
✅ Componentes reutilizáveis
✅ TypeScript para type safety
✅ Mock data estruturado
✅ Imagens do Figma integradas
✅ Layout responsivo

## 🎯 Próximos Passos Sugeridos

Para evolução do sistema em produção:

### Backend & API
1. Integração com API REST/GraphQL
2. Autenticação e autorização JWT
3. Gestão de permissões por role
4. Upload real de arquivos

### Funcionalidades
5. Edição inline de tarefas e documentos
6. Sistema de notificações em tempo real
7. Colaboração (comentários, menções)
8. Calendário de tarefas e deadlines
9. Histórico de atividades
10. Busca global no sistema

### UX/UI
11. Drag & drop para organização
12. Atalhos de teclado
13. Modo claro/escuro toggle
14. Personalização de dashboard
15. Exportação de dados (PDF, Excel)

### Performance
16. Lazy loading de componentes
17. Virtualização de listas longas
18. Cache de dados
19. Otimização de imagens

### Analytics
20. Tracking de eventos
21. Métricas de uso
22. A/B testing
23. Heatmaps

## 📝 Notas Técnicas

- Sistema desenvolvido para uso interno da Rise
- Design responsivo otimizado para desktop e tablet
- Navegação intuitiva com sidebar fixa
- Todas as cores seguem o design system
- Componentes documentados com TypeScript
- Código organizado e escalável
- Assets do Figma integrados corretamente
- Mock data realista para testes

## 🎨 Paleta de Cores

```css
--primary: #14E9BC (Teal)
--success: #28d939 (Verde)
--error: #ec5d5e (Vermelho)
--warning: #f59e0b (Laranja)
--info: #6B8AFF (Azul)
--accent: #E879F9 (Rosa)
--background: #0a0a0a
--surface: #0f0f0f
--text: #eee
--text-secondary: #bdbdbd
```

## 📄 Licença

Sistema proprietário da Rise - Todos os direitos reservados