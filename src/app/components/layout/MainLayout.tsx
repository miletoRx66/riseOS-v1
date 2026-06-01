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

  useEffect(() => {
    if (!usuario) return;

    // Assina a tabela notificacoes filtrando pelo usuário atual.
    // O trigger trg_notificar_mensagem insere uma linha aqui para cada
    // membro do canal quando uma mensagem é enviada — sem depender de RLS
    // complexo sobre canal_membros.
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
  }, [usuario]);

  useEffect(() => {
    if (location.pathname.startsWith("/mensagens")) {
      setHasUnread(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { path: "/", label: "Início", icon: LayoutDashboard },
    { path: "/departamentos", label: "Departamentos", icon: Building2 },
    { path: "/tarefas", label: "Tarefas", icon: CheckSquare },
    { path: "/okrs", label: "OKRs", icon: Target },
    { path: "/mensagens", label: "Mensagens", icon: MessageSquare },
    { path: "/documentos", label: "Documentos", icon: FileText },
    { path: "/relatorios", label: "Relatórios", icon: BarChart3 },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Sidebar */}
      <aside className="w-[240px] bg-[#111] border-r border-[#333] flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[#333]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#14E9BC] to-[#28d939] rounded-lg flex items-center justify-center">
              <span className="font-['Inter:Bold',sans-serif] font-bold text-[#000] text-[16px]">R</span>
            </div>
            <span className="font-['Inter:Bold',sans-serif] font-bold text-[#eee] text-[18px]">Rise Admin</span>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-[#333]">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a1a]">
            <img
              src={usuario?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"}
              alt={usuario?.nome || "Admin"}
              className="w-10 h-10 rounded-full bg-[#333]"
            />
            <div className="flex-1 min-w-0">
              <p className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[14px] truncate">
                {usuario?.nome || "Admin Rise"}
              </p>
              <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[12px] truncate">
                {usuario?.cargo || "Administrador"}
              </p>
            </div>
          </div>
          
          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[#ec5d5e] hover:bg-[#1a1a1a] transition-colors border border-[#333] hover:border-[#ec5d5e]/40"
          >
            <LogOut size={16} />
            <span className="font-['Inter:Medium',sans-serif] text-[13px]">
              Sair
            </span>
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
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
                      ? "bg-[#1a1a1a] text-[#14E9BC] border border-[#14E9BC]/30"
                      : "text-[#bdbdbd] hover:bg-[#1a1a1a] hover:text-[#eee]"
                  }`}
                >
                  <div className="relative">
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
        <div className="p-4 border-t border-[#333] space-y-1">
          {usuario && <NotificacoesBell userId={usuario.id} />}
          <Link
            to="/perfil"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/perfil")
                ? "bg-[#1a1a1a] text-[#14E9BC] border border-[#14E9BC]/30"
                : "text-[#bdbdbd] hover:bg-[#1a1a1a] hover:text-[#eee]"
            }`}
          >
            <UserCircle size={20} />
            <span className="font-['Inter:Medium',sans-serif] font-medium text-[14px]">Meu Perfil</span>
          </Link>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#bdbdbd] hover:bg-[#1a1a1a] hover:text-[#eee] transition-colors"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            <span className="font-['Inter:Medium',sans-serif] font-medium text-[14px]">
              {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}