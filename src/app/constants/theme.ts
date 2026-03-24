// Brand Colors
export const COLORS = {
  // Primary
  primary: "#14E9BC",
  primaryDark: "#12d4a8",
  primaryLight: "#1ffcd4",
  
  // Success
  success: "#28d939",
  successLight: "#3ef04e",
  
  // Error
  error: "#ec5d5e",
  errorLight: "#ff6b6c",
  
  // Warning
  warning: "#f59e0b",
  warningLight: "#fbbf24",
  
  // Info
  info: "#6B8AFF",
  infoLight: "#8aa4ff",
  
  // Accent
  accent: "#E879F9",
  accentLight: "#f0a0fc",
  
  // Neutrals
  background: "#0a0a0a",
  surface: "#0f0f0f",
  surfaceLight: "#1a1a1a",
  surfaceHover: "#222",
  border: "#333",
  borderLight: "#555",
  borderActive: "#595959",
  
  // Text
  text: "#eee",
  textSecondary: "#bdbdbd",
  textMuted: "#999",
  textDisabled: "#666",
  
  // Special
  black: "#000",
  white: "#fff",
} as const;

// Status Colors
export const STATUS_COLORS = {
  planejamento: COLORS.info,
  "em-andamento": COLORS.success,
  concluido: COLORS.textSecondary,
  pausado: COLORS.error,
} as const;

// Priority Colors
export const PRIORITY_COLORS = {
  alta: COLORS.error,
  media: COLORS.warning,
  baixa: COLORS.info,
} as const;

// Department Colors
export const DEPARTMENT_COLORS = {
  marketing: "#28d939",
  ops: "#14E9BC",
  comercial: "#6B8AFF",
  produto: "#E879F9",
} as const;

// Status Labels
export const STATUS_LABELS = {
  planejamento: "Planejamento",
  "em-andamento": "Em Andamento",
  concluido: "Concluído",
  pausado: "Pausado",
} as const;

// Department Labels
export const DEPARTMENT_LABELS = {
  marketing: "Marketing",
  ops: "Operações",
  comercial: "Comercial",
  produto: "Produto",
} as const;

// Document Type Labels
export const DOCUMENT_TYPE_LABELS = {
  documento: "Documento",
  manual: "Manual",
  apresentacao: "Apresentação",
  especificacao: "Especificação",
  guia: "Guia",
  diagrama: "Diagrama",
} as const;

// Priority Labels
export const PRIORITY_LABELS = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
} as const;

// Breakpoints (matching Tailwind defaults)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

// Z-index layers
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// Animation durations (in ms)
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;
