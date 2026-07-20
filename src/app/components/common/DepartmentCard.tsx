import { Link } from "react-router";
import { Megaphone, Settings, TrendingUp, Package, Users, CheckSquare, FileText, DollarSign, Briefcase, Lightbulb, HeadphonesIcon, Lock } from "lucide-react";

interface DepartmentCardProps {
  id: string;
  nome: string;
  cor: string;
  icon: string;
  membros: number;
  tarefasAbertas: number;
  documentos: number;
  locked?: boolean;
  isOwn?: boolean;
}

// Suporta kebab-case (novos) e PascalCase (departamentos existentes no banco)
const iconMap: Record<string, React.ElementType> = {
  megaphone: Megaphone,
  Megaphone: Megaphone,
  settings: Settings,
  Settings: Settings,
  "trending-up": TrendingUp,
  TrendingUp: TrendingUp,
  package: Package,
  Package: Package,
  "dollar-sign": DollarSign,
  DollarSign: DollarSign,
  briefcase: Briefcase,
  Briefcase: Briefcase,
  lightbulb: Lightbulb,
  Lightbulb: Lightbulb,
  headphones: HeadphonesIcon,
  HeadphonesIcon: HeadphonesIcon,
  users: Users,
  Users: Users,
};

export function DepartmentCard({ id, nome, cor, icon, membros, tarefasAbertas, documentos, locked = false, isOwn = false }: DepartmentCardProps) {
  const Icon = iconMap[icon as keyof typeof iconMap] || Settings;
  const destino = `/departamentos/${id}`;

  const inner = (
    <>
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: locked ? "var(--rise-raised)" : `${cor}20` }}
        >
          {locked
            ? <Lock size={20} className="text-rise-fg-4" />
            : <Icon size={24} style={{ color: cor }} />
          }
        </div>
        <div className="flex items-center gap-2">
          {isOwn && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#14E9BC]/15 text-[#14E9BC] border border-[#14E9BC]/30">
              Meu dept
            </span>
          )}
          <div className="flex items-center gap-1.5 text-rise-fg-2">
            <Users size={16} />
            <span className="font-['Inter:Medium',sans-serif] text-[14px]">{membros}</span>
          </div>
        </div>
      </div>

      <h3 className={`font-['Inter:Semi_Bold',sans-serif] font-semibold text-[18px] mb-4 ${locked ? "text-rise-fg-4" : "text-rise-fg"}`}>
        {nome}
      </h3>

      <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${locked ? "text-rise-fg-4" : "text-rise-fg-2"}`}>
        <div className="flex items-center gap-1.5">
          <CheckSquare size={14} />
          <span className="font-['Inter:Regular',sans-serif] text-[13px]">{tarefasAbertas} tarefas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FileText size={14} />
          <span className="font-['Inter:Regular',sans-serif] text-[13px]">{documentos} docs</span>
        </div>
      </div>

      {locked && (
        <p className="text-rise-fg-4 text-[11px] mt-3">Acesso restrito</p>
      )}
    </>
  );

  if (locked) {
    return (
      <div className="w-full bg-rise-bg border border-rise-line-2 rounded-lg p-4 sm:p-6 cursor-not-allowed opacity-60">
        {inner}
      </div>
    );
  }

  return (
    <Link
      to={destino}
      className={`w-full block bg-rise-surface border rounded-lg p-4 sm:p-6 hover:border-rise-fg-4 transition-all hover:shadow-lg group ${
        isOwn ? "border-[#14E9BC]/30" : "border-rise-line"
      }`}
    >
      {inner}
    </Link>
  );
}
