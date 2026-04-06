import { createBrowserRouter } from "react-router";
import { ProtectedLayout } from "./components/layout/ProtectedLayout";
import Login from "./pages/Login";
import EsqueceuSenha from "./pages/EsqueceuSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import CriarConta from "./pages/CriarConta";
import Dashboard from "./pages/Dashboard";
import Departamentos from "./pages/Departamentos";
import DepartamentoDetail from "./pages/DepartamentoDetail";
import Workspace from "./pages/Workspace";
import Tarefas from "./pages/Tarefas";
import TarefasKanban from "./pages/TarefasKanban";
import TarefaDetail from "./pages/TarefaDetail";
import NovaTarefa from "./pages/NovaTarefa";
import EditarTarefa from "./pages/EditarTarefa";
import OKRs from "./pages/OKRs";
import OKRDetail from "./pages/OKRDetail";
import Messages from "./pages/Messages";
import Documentos from "./pages/Documentos";
import Relatorios from "./pages/Relatorios";
import RelatorioDepartamento from "./pages/RelatorioDepartamento";
import NotFound from "./pages/NotFound";

/**
 * Router configuration for Rise Admin System
 * 
 * Routes:
 * - /login - Página de autenticação
 * - / - Dashboard principal com métricas e visão geral (protegido)
 * - /departamentos - Lista de departamentos (protegido)
 * - /departamentos/:id - Detalhes de um departamento específico ou painel financeiro (protegido)
 * - /workspace/:id - Workspace completo do departamento (protegido)
 * - /tarefas - Gestão de tarefas com filtros (protegido)
 * - /tarefas/kanban - Visualização em quadro Kanban (protegido)
 * - /tarefas/nova - Criar nova tarefa (protegido)
 * - /tarefas/:id - Detalhes de uma tarefa específica (protegido)
 * - /tarefas/:id/editar - Editar tarefa existente (protegido)
 * - /okrs - Gestão e orquestra de OKRs (protegido)
 * - /mensagens - Sistema de mensageria P2P e canais de departamento (protegido)
 * - /documentos - Gestão de documentos e conteúdos (protegido)
 * - /relatorios - Relatórios e análises consolidadas (protegido)
 * - /relatorio/:id - Relatório detalhado de um departamento específico (protegido)
 * - * - Página 404
 */
export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/esqueceu-senha",
    Component: EsqueceuSenha,
  },
  {
    path: "/redefinir-senha",
    Component: RedefinirSenha,
  },
  {
    path: "/criar-conta",
    Component: CriarConta,
  },
  {
    path: "/",
    Component: ProtectedLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "departamentos", Component: Departamentos },
      { path: "departamentos/:id", Component: DepartamentoDetail },
      { path: "workspace/:id", Component: Workspace },
      { path: "tarefas", Component: Tarefas },
      { path: "tarefas/kanban", Component: TarefasKanban },
      { path: "tarefas/nova", Component: NovaTarefa },
      { path: "tarefas/:id", Component: TarefaDetail },
      { path: "tarefas/:id/editar", Component: EditarTarefa },
      { path: "okrs", Component: OKRs },
      { path: "okrs/:id", Component: OKRDetail },
      { path: "mensagens", Component: Messages },
      { path: "documentos", Component: Documentos },
      { path: "relatorios", Component: Relatorios },
      { path: "relatorio/:id", Component: RelatorioDepartamento },
      { path: "*", Component: NotFound },
    ],
  },
]);