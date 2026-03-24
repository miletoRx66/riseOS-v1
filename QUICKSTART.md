# Guia de Início Rápido - Rise Admin

## 📋 Navegação

### Sidebar
A sidebar fixa à esquerda contém:
- **Logo Rise Admin** no topo
- **Perfil do usuário** com avatar e email
- **Menu de navegação** com 5 seções principais
- **Configurações e Logout** no rodapé

### Seções Principais

#### 1. Dashboard (/)
**O que você encontra:**
- 4 cards de métricas principais com variações percentuais
- 3 quick stats clicáveis (Tarefas, Documentos, Departamentos)
- Lista de tarefas em andamento
- Documentos recentes
- Galeria de conteúdos em destaque

**Ações disponíveis:**
- Clicar nos cards para navegar para seções específicas
- Visualizar métricas em tempo real

#### 2. Departamentos (/departamentos)
**O que você encontra:**
- Grid com 4 departamentos (Marketing, Ops, Comercial, Produto)
- Cada card mostra: ícone, cor, membros, tarefas e documentos
- Estatísticas consolidadas na parte inferior

**Ações disponíveis:**
- Clicar em um departamento para ver detalhes
- Botão "Novo Departamento" (UI pronta)

#### 3. Detalhes do Departamento (/departamentos/:id)
**O que você encontra:**
- Header com nome, cor e estatísticas do departamento
- Grid de KPIs específicos do departamento
- Todas as tarefas do departamento
- Todos os documentos do departamento

**Ações disponíveis:**
- Voltar para lista de departamentos
- Visualizar tarefas e documentos filtrados

#### 4. Tarefas (/tarefas)
**O que você encontra:**
- 3 cards de estatísticas por status
- Filtros por departamento e status
- Grid de tarefas com todas as informações

**Ações disponíveis:**
- Filtrar tarefas por departamento
- Filtrar tarefas por status
- Limpar filtros
- Botão "Nova Tarefa" (UI pronta)

**Status de Tarefas:**
- 🔵 Planejamento (azul)
- 🟢 Em Andamento (verde)
- ⚪ Concluído (cinza)

**Prioridades:**
- 🔴 Alta (vermelho)
- 🟠 Média (laranja)
- 🔵 Baixa (azul)

#### 5. Documentos (/documentos)
**O que você encontra:**
- 4 cards de estatísticas por departamento
- Barra de busca em tempo real
- Filtro por departamento
- Toggle entre visualização em lista e grid

**Ações disponíveis:**
- Buscar documentos por título
- Filtrar por departamento
- Alternar entre vista de lista e grid
- Clicar em card de departamento para filtrar
- Botão "Upload Documento" (UI pronta)

**Tipos de Documentos:**
- 📄 Documento
- 📖 Manual
- 📊 Apresentação
- 📋 Especificação
- 📚 Guia
- 🗺️ Diagrama

#### 6. Relatórios (/relatorios)
**O que você encontra:**
- 4 cards de métricas consolidadas
- Gráfico de distribuição de status de tarefas
- Gráfico de performance por departamento com trends
- Grid de KPIs consolidados por departamento

**Ações disponíveis:**
- Filtrar por período (semana, mês, trimestre, ano)
- Botão "Exportar" (UI pronta)

## 🎨 Códigos de Cores por Departamento

- **Marketing**: 🟢 Verde (#28d939)
- **Operações**: 🩵 Teal (#14E9BC)
- **Comercial**: 🔵 Azul (#6B8AFF)
- **Produto**: 🩷 Rosa (#E879F9)

## 🔍 Recursos de Busca e Filtros

### Tarefas
- **Filtrar por Departamento**: Dropdown no topo
- **Filtrar por Status**: Dropdown no topo
- **Limpar Filtros**: Botão aparece quando há filtros ativos

### Documentos
- **Busca**: Campo de texto que filtra em tempo real
- **Filtrar por Departamento**: Dropdown ou click nos cards de estatística
- **Limpar**: Botão aparece quando há filtros ou busca ativa
- **Visualização**: Toggle entre lista (tabela) e grid (cards visuais)

### Relatórios
- **Período**: Dropdown para selecionar última semana, mês, trimestre ou ano

## 💡 Dicas de Uso

1. **Navegação Rápida**: Use a sidebar para alternar entre seções
2. **Filtros Múltiplos**: Combine departamento + status em Tarefas
3. **Busca Inteligente**: A busca em Documentos é case-insensitive
4. **Cards Clicáveis**: Muitos cards são clicáveis e levam para detalhes
5. **Estados Ativos**: Items ativos na sidebar são destacados em teal
6. **Hover States**: Passe o mouse sobre cards para ver interações

## 📊 Entendendo os KPIs

### Dashboard
- **Receita**: Valor total em R$ com variação percentual
- **Escritórios**: Quantidade total de escritórios
- **Assessores**: Quantidade total de assessores
- **Clientes**: Quantidade total de clientes

### Marketing
- **Leads**: Número de leads gerados
- **Conversão**: Taxa de conversão em %
- **ROI**: Return on Investment (multiplicador)
- **Engajamento**: Score de engajamento

### Operações
- **Eficiência**: Percentual de eficiência operacional
- **Tempo Médio**: Tempo médio em horas
- **Satisfação**: Score de satisfação (0-5)
- **Automação**: Percentual de processos automatizados

### Comercial
- **Vendas**: Valor total em R$
- **Ticket Médio**: Valor médio por venda
- **Conversão**: Taxa de conversão de leads
- **Pipeline**: Valor total no pipeline

### Produto
- **Usuários Ativos**: Quantidade de usuários ativos
- **Retenção**: Taxa de retenção em %
- **NPS**: Net Promoter Score
- **Features**: Número de features lançadas

## 🎯 Atalhos Visuais

- **Verde/Teal**: Positivo, primário, ações principais
- **Vermelho**: Negativo, alta prioridade, alertas
- **Azul**: Informação, média prioridade
- **Laranja**: Atenção, aviso
- **Cinza**: Neutro, concluído, secundário

## 📱 Responsividade

O sistema é otimizado para:
- **Desktop**: Experiência completa (recomendado)
- **Tablet**: Layout adaptado com grid responsivo
- **Mobile**: Navegação funcional (em desenvolvimento)

## 🚀 Começando

1. Acesse o **Dashboard** para visão geral
2. Explore os **Departamentos** para entender a estrutura
3. Navegue para **Tarefas** para ver o trabalho em andamento
4. Confira **Documentos** para gerenciar conteúdos
5. Analise **Relatórios** para insights consolidados

## ❓ Resolução de Problemas

**Filtros não funcionam?**
- Verifique se há dados com os critérios selecionados
- Tente limpar os filtros e começar de novo

**Não vê dados?**
- O sistema usa dados mock de exemplo
- Todos os dados estão em `/src/app/data/mockData.ts`

**Navegação não funciona?**
- Certifique-se de estar usando um navegador moderno
- O sistema usa React Router 7 com data mode

---

**Desenvolvido para Rise Admin**
Versão 1.0.0 - Protótipo Funcional
