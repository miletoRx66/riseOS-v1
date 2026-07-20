import { ExternalLink, Globe, Monitor, TrendingUp, BookOpen, PieChart, HardDrive, Search, Clock, Archive } from "lucide-react";

interface LinkItem {
  id: string;
  nome: string;
  descricao: string;
  url?: string;
  icon: typeof Globe;
  cor: string;
  tag?: string;
}

const LINKS_CORPORATIVOS: LinkItem[] = [
  {
    id: "cockpit",
    nome: "Cockpit",
    descricao: "Painel de gestão e monitoramento da plataforma Rise Finance.",
    url: "https://cockpit.risefinance.com.br/",
    icon: Monitor,
    cor: "#14E9BC",
    tag: "Operações",
  },
  {
    id: "rise-v2",
    nome: "Rise v2",
    descricao: "Plataforma de produtos e captação de clientes da Rise Finance.",
    url: "https://v2.risefinance.com.br/?redirect=%2Fprodutos",
    icon: TrendingUp,
    cor: "#6B8AFF",
    tag: "Comercial",
  },
  {
    id: "rise-v1",
    nome: "Rise v1",
    descricao: "Versão anterior da plataforma Rise Finance (acesso privado).",
    url: "https://private.risefinance.com.br/login",
    icon: Archive,
    cor: "#f97316",
    tag: "Plataforma",
  },
  {
    id: "site",
    nome: "Site Institucional",
    descricao: "Site oficial da Rise Finance com apresentação da empresa.",
    url: "https://www.risefinance.com.br/",
    icon: Globe,
    cor: "#28d939",
    tag: "Marketing",
  },
  {
    id: "gitbook",
    nome: "Gitbook",
    descricao: "Documentação técnica, guias e base de conhecimento interna.",
    url: "https://rise-finance-2.gitbook.io/rise-docs-l-institucional",
    icon: BookOpen,
    cor: "#f59e0b",
    tag: "Produto",
  },
  {
    id: "cap-table",
    nome: "Cap Table",
    descricao: "Estrutura de capital, participações e histórico de rodadas.",
    icon: PieChart,
    cor: "#E879F9",
    tag: "Financeiro",
  },
  {
    id: "drive",
    nome: "Google Drive",
    descricao: "Repositório central de documentos, apresentações e planilhas.",
    icon: HardDrive,
    cor: "#ec5d5e",
    tag: "Geral",
  },
];

const TAG_CORES: Record<string, string> = {
  Operações: "#14E9BC",
  Comercial: "#6B8AFF",
  Marketing: "#28d939",
  Produto: "#f59e0b",
  Financeiro: "#E879F9",
  Geral: "#bdbdbd",
};

export default function Hub() {
  const ativos = LINKS_CORPORATIVOS.filter((l) => l.url);
  const emBreve = LINKS_CORPORATIVOS.filter((l) => !l.url);

  return (
    <div className="min-h-screen bg-rise-bg p-8">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14E9BC] to-[#6B8AFF] flex items-center justify-center flex-shrink-0">
              <Globe size={22} className="text-[#000]" />
            </div>
            <div>
              <h1 className="font-bold text-rise-fg text-[32px] leading-tight">Hub de Links</h1>
              <p className="text-rise-fg-4 text-[14px]">O escritório central da Rise Finance</p>
            </div>
          </div>
          <p className="text-rise-fg-2 text-[16px] max-w-[600px]">
            Todos os sistemas, plataformas e ferramentas da Rise em um único lugar.
            Acesse rapidamente o que precisa sem sair do Rise OS.
          </p>
        </div>

        {/* Search — preparado para expansão futura */}
        <div className="relative mb-10 max-w-[480px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-rise-fg-4" />
          <input
            type="text"
            placeholder="Buscar links..."
            readOnly
            className="w-full bg-rise-surface border border-rise-line rounded-xl pl-11 pr-4 py-3 text-rise-fg-4 text-[14px] cursor-not-allowed focus:outline-none"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-rise-fg-4 text-[11px] font-medium">
            Em breve
          </span>
        </div>

        {/* Links ativos */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-rise-fg text-[18px] font-semibold">Links Corporativos</h2>
            <span className="bg-[#14E9BC]/10 text-[#14E9BC] text-[11px] font-semibold px-2 py-0.5 rounded-full">
              {ativos.length} ativos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ativos.map((link) => {
              const Icon = link.icon;
              const tagCor = TAG_CORES[link.tag ?? "Geral"] ?? "#bdbdbd";
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-rise-surface border border-rise-line rounded-xl p-6 flex flex-col gap-4 hover:border-rise-line-3 hover:bg-rise-surface transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${link.cor}18`, color: link.cor }}
                    >
                      <Icon size={22} />
                    </div>
                    <ExternalLink
                      size={16}
                      className="text-rise-fg-4 group-hover:text-rise-fg-4 transition-colors mt-0.5"
                    />
                  </div>

                  <div className="flex-1">
                    <p className="text-rise-fg text-[16px] font-semibold mb-1">{link.nome}</p>
                    <p className="text-rise-fg-3 text-[13px] leading-relaxed">{link.descricao}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${tagCor}15`, color: tagCor }}
                    >
                      {link.tag}
                    </span>
                    <span className="text-rise-fg-4 text-[11px] truncate max-w-[160px] group-hover:text-rise-fg-4 transition-colors">
                      {link.url?.replace(/^https?:\/\//, "").split("?")[0]}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* Em breve */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-rise-fg-4 text-[18px] font-semibold">Em Breve</h2>
            <span className="bg-rise-line text-rise-fg-4 text-[11px] font-semibold px-2 py-0.5 rounded-full">
              {emBreve.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emBreve.map((link) => {
              const Icon = link.icon;
              return (
                <div
                  key={link.id}
                  className="bg-rise-surface border border-rise-line-2 rounded-xl p-6 flex flex-col gap-4 opacity-60 cursor-not-allowed"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${link.cor}10`, color: `${link.cor}60` }}
                    >
                      <Icon size={22} />
                    </div>
                    <div className="flex items-center gap-1.5 bg-rise-raised border border-rise-line-2 rounded-full px-2.5 py-1">
                      <Clock size={10} className="text-rise-fg-4" />
                      <span className="text-rise-fg-4 text-[10px] font-semibold">Em breve</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className="text-rise-fg-4 text-[16px] font-semibold mb-1">{link.nome}</p>
                    <p className="text-rise-fg-4 text-[13px] leading-relaxed">{link.descricao}</p>
                  </div>

                  <div>
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full opacity-40"
                      style={{ backgroundColor: `${link.cor}10`, color: link.cor }}
                    >
                      {link.tag}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Banner: Atalhos por departamento */}
        <section>
          <div className="bg-rise-surface border border-rise-line-2 border-dashed rounded-xl p-8 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rise-raised flex items-center justify-center">
              <Globe size={22} className="text-rise-fg-4" />
            </div>
            <div>
              <p className="text-rise-fg-4 text-[15px] font-semibold mb-1">Atalhos por Departamento</p>
              <p className="text-rise-fg-4 text-[13px]">
                Cada departamento poderá manter seus próprios links e ferramentas específicas aqui.
              </p>
            </div>
            <span className="bg-rise-raised border border-rise-line-2 text-rise-fg-4 text-[11px] font-semibold px-3 py-1 rounded-full">
              Roadmap
            </span>
          </div>
        </section>

      </div>
    </div>
  );
}
