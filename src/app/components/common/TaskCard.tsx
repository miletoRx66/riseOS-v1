import { Calendar, User, AlertCircle } from "lucide-react";
import { Link } from "react-router";

interface TaskCardProps {
  id: string;
  titulo: string;
  departamento: string;
  status: string;
  prioridade: string;
  responsavel: string;
  prazo: string;
  descricao?: string;
}

const statusColors = {
  "planejamento": "#6B8AFF",
  "em-andamento": "#28d939",
  "concluido": "#bdbdbd",
  "pausado": "#ec5d5e",
};

const prioridadeColors = {
  "alta": "#ec5d5e",
  "media": "#f59e0b",
  "baixa": "#6B8AFF",
};

const statusLabels = {
  "planejamento": "Planejamento",
  "em-andamento": "Em Andamento",
  "concluido": "Concluído",
  "pausado": "Pausado",
};

export function TaskCard({ id, titulo, departamento, status, prioridade, responsavel, prazo, descricao }: TaskCardProps) {
  const statusColor = statusColors[status as keyof typeof statusColors] || "#6B8AFF";
  const prioridadeColor = prioridadeColors[prioridade as keyof typeof prioridadeColors] || "#6B8AFF";
  const statusLabel = statusLabels[status as keyof typeof statusLabels] || status;
  const departamentoLabel = departamento;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <Link to={`/tarefas/${id}`}>
      <div className="bg-rise-surface border border-rise-line rounded-lg p-4 hover:border-[#14E9BC] transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-rise-fg text-[16px] mb-2">
              {titulo}
            </h4>
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-1 rounded text-[12px] font-['Inter:Medium',sans-serif]"
                style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
              >
                {statusLabel}
              </span>
              <span className="px-2 py-1 rounded bg-rise-raised text-rise-fg-2 text-[12px] font-['Inter:Regular',sans-serif]">
                {departamentoLabel}
              </span>
            </div>
          </div>
          {prioridade === "alta" && (
            <AlertCircle size={20} style={{ color: prioridadeColor }} />
          )}
        </div>

        {descricao && (
          <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[14px] mb-3 line-clamp-2">
            {descricao}
          </p>
        )}

        <div className="flex items-center justify-between text-rise-fg-2 text-[13px]">
          <div className="flex items-center gap-2">
            <User size={14} />
            <span className="font-['Inter:Regular',sans-serif]">{responsavel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span className="font-['Inter:Regular',sans-serif]">{formatDate(prazo)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}