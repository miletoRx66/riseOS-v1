import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Building2,
  CheckSquare,
  FileText,
  BarChart3,
  Target,
  LogOut,
  MessageSquare,
  Sun,
  Moon,
  UserCircle,
  Globe,
  Activity,
  Ticket,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../../lib/supabase";
import { NotificacoesBell } from "./NotificacoesBell";

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [hasUnread, setHasUnread] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fecha sidebar ao mudar de rota (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!usuario) return;

    const channel = supabase
      .channel("layout-notificacoes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notificacoes",
          filter: `usuario_id=eq.${usuario.id}`,
        },
        (payload: { new: { tipo?: string } }) => {
          if (
            payload.new.tipo === "nova_mensagem" &&
            !window.location.pathname.startsWith("/mensagens")
          ) {
            setHasUnread(true);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [usuario?.id]);

  useEffect(() => {
    if (location.pathname.startsWith("/mensagens")) {
      setHasUnread(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdmin = usuario?.isAdmin ?? false;

  const menuItems = [
    { path: "/",              label: "Início",               icon: LayoutDashboard, sempre: true },
    { path: "/departamentos", label: "Departamentos",        icon: Building2,       sempre: true },
    { path: "/tarefas",       label: "Tarefas",              icon: CheckSquare,     sempre: true },
    { path: "/okrs",          label: "OKRs",                 icon: Target,          sempre: true },
    { path: "/mensagens",     label: "Mural de Comunicação", icon: MessageSquare,   sempre: true },
    { path: "/documentos",    label: "Documentos",           icon: FileText,        sempre: true },
    { path: "/relatorios",    label: "Relatórios",           icon: BarChart3,       sempre: true },
    { path: "/tickets",       label: "Tickets",              icon: Ticket,          sempre: true },
    { path: "/hub",           label: "Hub de Links",         icon: Globe,           sempre: true },
    { path: "/bi",            label: "BI Integrado",         icon: Activity,        sempre: false, adminOnly: true },
  ].filter((item) => item.sempre || (item.adminOnly && isAdmin));

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-rise-line flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#14E9BC] to-[#28d939] rounded-lg flex items-center justify-center">
            <span className="font-['Inter:Bold',sans-serif] font-bold text-[#000] text-[16px]">R</span>
          </div>
          <span className="font-['Inter:Bold',sans-serif] font-bold text-rise-fg text-[18px]">Rise Admin</span>
        </div>
        {/* Fechar drawer (mobile) */}
        <button
          className="md:hidden text-rise-fg-4 hover:text-rise-fg transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-rise-line">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-rise-raised">
          <img
            src={usuario?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"}
            alt={usuario?.nome || "Admin"}
            className="w-10 h-10 rounded-full bg-rise-line flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[14px] truncate">
              {usuario?.nome || "Admin Rise"}
            </p>
            <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[12px] truncate">
              {usuario?.cargo || "Administrador"}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[#ec5d5e] hover:bg-rise-raised transition-colors border border-rise-line hover:border-[#ec5d5e]/40"
        >
          <LogOut size={16} />
          <span className="font-['Inter:Medium',sans-serif] text-[13px]">Sair</span>
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? "bg-rise-raised text-[#14E9BC] border border-[#14E9BC]/30"
                    : "text-rise-fg-2 hover:bg-rise-raised hover:text-rise-fg"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <Icon size={20} />
                  {item.path === "/mensagens" && hasUnread && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ec5d5e] rounded-full" />
                  )}
                </div>
                <span className="font-['Inter:Medium',sans-serif] font-medium text-[14px]">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Notificações + Perfil + Tema */}
      <div className="p-4 border-t border-rise-line space-y-1">
        {usuario && <NotificacoesBell userId={usuario.id} />}
        <Link
          to="/perfil"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive("/perfil")
              ? "bg-rise-raised text-[#14E9BC] border border-[#14E9BC]/30"
              : "text-rise-fg-2 hover:bg-rise-raised hover:text-rise-fg"
          }`}
        >
          <UserCircle size={20} />
          <span className="font-['Inter:Medium',sans-serif] font-medium text-[14px]">Meu Perfil</span>
        </Link>
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-rise-fg-2 hover:bg-rise-raised hover:text-rise-fg transition-colors"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          <span className="font-['Inter:Medium',sans-serif] font-medium text-[14px]">
            {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
          </span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-rise-bg">

      {/* ── Sidebar desktop (sempre visível em md+) ── */}
      <aside className="hidden md:flex md:flex-col w-[240px] flex-shrink-0 bg-rise-surface border-r border-rise-line">
        {sidebarContent}
      </aside>

      {/* ── Sidebar mobile (drawer + overlay) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`
          fixed top-0 left-0 h-full w-[260px] bg-rise-surface border-r border-rise-line
          flex flex-col z-50 md:hidden
          transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {sidebarContent}
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar mobile (hamburger) */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-rise-surface border-b border-rise-line flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-rise-fg-2 hover:text-rise-fg transition-colors"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[#14E9BC] to-[#28d939] rounded flex items-center justify-center">
              <span className="font-bold text-[#000] text-[11px]">R</span>
            </div>
            <span className="font-bold text-rise-fg text-[15px]">Rise Admin</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
