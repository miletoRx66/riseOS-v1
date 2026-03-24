// Departamentos
export type DepartamentoId = "marketing" | "ops" | "comercial" | "produto";

export interface Departamento {
  id: DepartamentoId;
  nome: string;
  cor: string;
  icon: string;
  membros: number;
  tarefasAbertas: number;
  documentos: number;
}

// Tarefas
export type TarefaStatus = "planejamento" | "em-andamento" | "concluido" | "pausado";
export type TarefaPrioridade = "alta" | "media" | "baixa";
export type TarefaTipo =
  | "backend" | "frontend" | "infra" | "design"
  | "marketing" | "comercial" | "ops" | "pesquisa" | "outro";
export type TarefaVisibilidade = "publica" | "departamento" | "pessoal";

export interface TarefaLink {
  id: string;
  titulo: string;
  url: string;
  tipo: "figma" | "drive" | "github" | "notion" | "lark" | "outro";
}

export interface Tarefa {
  id: string;
  titulo: string;
  departamento: DepartamentoId;
  status: TarefaStatus;
  prioridade: TarefaPrioridade;
  responsavel: string;
  prazo: string;
  descricao?: string;
  dataCriacao?: string;
  tags?: string[];
  progresso?: number;
  tipo?: TarefaTipo;
  visibilidade?: TarefaVisibilidade;
  links?: TarefaLink[];
  subtarefas?: Subtarefa[];
  comentarios?: Comentario[];
  anexos?: Anexo[];
  atividades?: AtividadeTarefa[];
}

export interface Subtarefa {
  id: string;
  titulo: string;
  concluida: boolean;
  responsavel?: string;
}

export interface Comentario {
  id: string;
  autor: string;
  avatarAutor?: string;
  conteudo: string;
  data: string;
  parentId?: string;
}

export interface Anexo {
  id: string;
  nome: string;
  tipo: string;
  tamanho: string;
  url?: string;
  dataUpload: string;
}

export interface AtividadeTarefa {
  id: string;
  tipo: "criacao" | "status" | "comentario" | "anexo" | "subtarefa" | "edicao";
  descricao: string;
  usuario: string;
  data: string;
}

// Documentos
export type DocumentoTipo = 
  | "documento" 
  | "manual" 
  | "apresentacao" 
  | "especificacao" 
  | "guia" 
  | "diagrama";

export interface Documento {
  id: string;
  titulo: string;
  departamento: DepartamentoId;
  tipo: DocumentoTipo;
  autor: string;
  dataModificacao: string;
  tamanho: string;
}

// KPIs
export interface KPIsDashboard {
  receitaTotal: number;
  escritorios: number;
  assessores: number;
  clientes: number;
  variacaoReceita: string;
  variacaoEscritorios: string;
  variacaoAssessores: string;
  variacaoClientes: string;
}

export interface KPIsMarketing {
  leads: number;
  conversao: number;
  roi: number;
  engajamento: number;
}

export interface KPIsOps {
  eficiencia: number;
  tempoMedio: number;
  satisfacao: number;
  automacao: number;
}

export interface KPIsComercial {
  vendas: number;
  ticket: number;
  conversao: number;
  pipeline: number;
}

export interface KPIsProduto {
  usuarios: number;
  retencao: number;
  nps: number;
  features: number;
}

export type KPIsDepartamento = {
  marketing: KPIsMarketing;
  ops: KPIsOps;
  comercial: KPIsComercial;
  produto: KPIsProduto;
};

// Navigation
export interface MenuItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

// Theme
export interface ThemeColors {
  primary: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

// Common
export interface SelectOption {
  value: string;
  label: string;
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

export interface FilterState {
  search: string;
  departamento?: DepartamentoId;
  status?: TarefaStatus;
  prioridade?: TarefaPrioridade;
  tipo?: DocumentoTipo;
}

// API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// User (for future authentication)
export interface User {
  id: string;
  nome: string;
  email: string;
  avatar?: string;
  departamento: DepartamentoId;
  role: "admin" | "manager" | "member";
}

// Charts
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

// Activity / Timeline
export interface Activity {
  id: string;
  tipo: "tarefa" | "documento" | "comentario" | "status";
  titulo: string;
  descricao?: string;
  usuario: string;
  data: string;
  departamento?: DepartamentoId;
}

// Notifications
export interface Notification {
  id: string;
  tipo: "info" | "success" | "warning" | "error";
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
  link?: string;
}