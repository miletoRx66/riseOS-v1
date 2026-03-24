import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Upload,
  Download,
  X,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
  Package,
} from "lucide-react";
import {
  produtosFinanceiros,
  categoriasFinanceiras,
  transacoesFinanceiras as initialTransacoes,
  fluxoCaixaMensal,
  kpisFinanceiros,
} from "../data/mockData";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Papa from "papaparse";

interface CSVTransacao {
  tipo: string;
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  produto?: string;
  competencia: string;
}

export default function DepartamentoFinanceiro() {
  const [transacoes, setTransacoes] = useState(initialTransacoes);
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "receita" | "despesa">("todos");
  const [filtroProduto, setFiltroProduto] = useState<string>("todos");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<CSVTransacao[]>([]);
  const [importStep, setImportStep] = useState<"upload" | "preview" | "success">("upload");
  const [importErrors, setImportErrors] = useState<string[]>([]);

  // Filtrar transações
  const transacoesFiltradas = transacoes.filter((t) => {
    if (filtroTipo !== "todos" && t.tipo !== filtroTipo) return false;
    if (filtroProduto !== "todos" && t.produto !== filtroProduto) return false;
    return true;
  });

  // Calcular totais por categoria
  const receitasPorCategoria = categoriasFinanceiras.receitas.map((cat) => {
    const total = transacoes
      .filter((t) => t.tipo === "receita" && t.categoria === cat.id)
      .reduce((sum, t) => sum + t.valor, 0);
    return { ...cat, total };
  });

  const despesasPorCategoria = categoriasFinanceiras.despesas.map((cat) => {
    const total = transacoes
      .filter((t) => t.tipo === "despesa" && t.categoria === cat.id)
      .reduce((sum, t) => sum + t.valor, 0);
    return { ...cat, total };
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  // Funções de Import
  const handleOpenImportModal = () => {
    setIsImportModalOpen(true);
    setImportStep("upload");
    setCsvFile(null);
    setParsedData([]);
    setImportErrors([]);
  };

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
    setIsDragging(false);
    setCsvFile(null);
    setParsedData([]);
    setImportErrors([]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === "text/csv") {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    setCsvFile(file);
    setImportErrors([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: string[] = [];
        const validData: CSVTransacao[] = [];

        results.data.forEach((row: any, index) => {
          // Validação de campos obrigatórios
          if (!row.tipo || !row.tipo.trim()) {
            errors.push(`Linha ${index + 2}: Tipo é obrigatório`);
            return;
          }
          if (!row.descricao || !row.descricao.trim()) {
            errors.push(`Linha ${index + 2}: Descrição é obrigatória`);
            return;
          }
          if (!row.valor || isNaN(parseFloat(row.valor))) {
            errors.push(`Linha ${index + 2}: Valor deve ser um número válido`);
            return;
          }
          if (!row.data || !row.data.trim()) {
            errors.push(`Linha ${index + 2}: Data é obrigatória`);
            return;
          }
          if (!row.competencia || !row.competencia.trim()) {
            errors.push(`Linha ${index + 2}: Competência é obrigatória`);
            return;
          }

          // Validação de tipo
          const tipo = row.tipo.toLowerCase().trim();
          if (tipo !== "receita" && tipo !== "despesa") {
            errors.push(`Linha ${index + 2}: Tipo deve ser "receita" ou "despesa"`);
            return;
          }

          // Validação de categoria
          const categoriasValidas =
            tipo === "receita"
              ? categoriasFinanceiras.receitas.map((c) => c.id)
              : categoriasFinanceiras.despesas.map((c) => c.id);

          if (!row.categoria || !categoriasValidas.includes(row.categoria.trim())) {
            errors.push(`Linha ${index + 2}: Categoria inválida para o tipo ${tipo}`);
            return;
          }

          // Validação de produto (opcional)
          const produtosValidos = produtosFinanceiros.map((p) => p.id);
          if (row.produto && row.produto.trim() && !produtosValidos.includes(row.produto.trim())) {
            errors.push(`Linha ${index + 2}: Produto inválido`);
            return;
          }

          validData.push({
            tipo: tipo as "receita" | "despesa",
            categoria: row.categoria.trim(),
            descricao: row.descricao.trim(),
            valor: parseFloat(row.valor),
            data: row.data.trim(),
            produto: row.produto && row.produto.trim() ? row.produto.trim() : undefined,
            competencia: row.competencia.trim(),
          });
        });

        if (errors.length > 0) {
          setImportErrors(errors);
        } else if (validData.length > 0) {
          setParsedData(validData);
          setImportStep("preview");
        } else {
          setImportErrors(["Nenhuma transação válida encontrada no arquivo CSV"]);
        }
      },
      error: (error) => {
        setImportErrors([`Erro ao processar arquivo: ${error.message}`]);
      },
    });
  };

  const handleConfirmImport = () => {
    const novasTransacoes = parsedData.map((trans, index) => ({
      id: `trans-imported-${Date.now()}-${index}`,
      tipo: trans.tipo as "receita" | "despesa",
      categoria: trans.categoria,
      descricao: trans.descricao,
      valor: trans.valor,
      data: trans.data,
      produto: trans.produto || null,
      competencia: trans.competencia,
      status: trans.tipo === "receita" ? "confirmado" : "pago",
    }));

    setTransacoes([...novasTransacoes, ...transacoes]);
    setImportStep("success");

    setTimeout(() => {
      handleCloseImportModal();
    }, 2500);
  };

  const downloadExemploCSV = () => {
    const csvContent = `tipo,categoria,descricao,valor,data,produto,competencia
receita,rec-assinaturas,Assinaturas mensais,125000.50,2026-02-01,prod-rfy,2026-02
despesa,desp-tecnologia,Serviços de nuvem,45000.00,2026-02-05,,2026-02
receita,rec-onboarding,Taxa de novos clientes,8500.00,2026-02-10,prod-rly,2026-02
despesa,desp-marketing,Anúncios digitais,12500.00,2026-02-12,,2026-02`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "exemplo-transacoes-financeiras.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[#eee] text-[32px] mb-2">
              Departamento Financeiro
            </h1>
            <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[16px]">
              Controle financeiro consolidado e gestão de produtos
            </p>
          </div>
          <button
            onClick={handleOpenImportModal}
            className="bg-[#f59e0b] text-[#000] px-6 py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] flex items-center gap-2 hover:bg-[#d97706] transition-colors"
          >
            <Upload size={20} />
            Importar Dados CSV
          </button>
        </div>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[14px]">
                Receita Total
              </p>
              <div className="w-10 h-10 rounded-lg bg-[#28d939]/20 flex items-center justify-center">
                <TrendingUp size={20} className="text-[#28d939]" />
              </div>
            </div>
            <p className="font-['Inter:Bold',sans-serif] text-[#eee] text-[28px] mb-2">
              {formatCurrency(kpisFinanceiros.receitaTotal)}
            </p>
            <div className="flex items-center gap-1">
              <ArrowUpRight size={16} className="text-[#28d939]" />
              <span className="text-[#28d939] font-['Inter:Semi_Bold',sans-serif] text-[13px]">
                {formatPercent(kpisFinanceiros.crescimentoReceita)}
              </span>
              <span className="text-[#666] font-['Inter:Regular',sans-serif] text-[12px] ml-1">
                vs mês anterior
              </span>
            </div>
          </div>

          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[14px]">
                Despesas
              </p>
              <div className="w-10 h-10 rounded-lg bg-[#ec5d5e]/20 flex items-center justify-center">
                <TrendingDown size={20} className="text-[#ec5d5e]" />
              </div>
            </div>
            <p className="font-['Inter:Bold',sans-serif] text-[#eee] text-[28px] mb-2">
              {formatCurrency(kpisFinanceiros.despesaTotal)}
            </p>
            <div className="flex items-center gap-1">
              <ArrowDownRight size={16} className="text-[#28d939]" />
              <span className="text-[#28d939] font-['Inter:Semi_Bold',sans-serif] text-[13px]">
                {formatPercent(kpisFinanceiros.crescimentoDespesa)}
              </span>
              <span className="text-[#666] font-['Inter:Regular',sans-serif] text-[12px] ml-1">
                redução
              </span>
            </div>
          </div>

          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[14px]">
                Lucro Líquido
              </p>
              <div className="w-10 h-10 rounded-lg bg-[#14E9BC]/20 flex items-center justify-center">
                <DollarSign size={20} className="text-[#14E9BC]" />
              </div>
            </div>
            <p className="font-['Inter:Bold',sans-serif] text-[#eee] text-[28px] mb-2">
              {formatCurrency(kpisFinanceiros.lucroLiquido)}
            </p>
            <div className="flex items-center gap-1">
              <ArrowUpRight size={16} className="text-[#28d939]" />
              <span className="text-[#28d939] font-['Inter:Semi_Bold',sans-serif] text-[13px]">
                {formatPercent(kpisFinanceiros.crescimentoLucro)}
              </span>
              <span className="text-[#666] font-['Inter:Regular',sans-serif] text-[12px] ml-1">
                crescimento
              </span>
            </div>
          </div>

          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[14px]">
                Margem de Lucro
              </p>
              <div className="w-10 h-10 rounded-lg bg-[#f59e0b]/20 flex items-center justify-center">
                <TrendingUp size={20} className="text-[#f59e0b]" />
              </div>
            </div>
            <p className="font-['Inter:Bold',sans-serif] text-[#eee] text-[28px] mb-2">
              {kpisFinanceiros.margemLucro.toFixed(1)}%
            </p>
            <div className="flex items-center gap-1">
              <ArrowUpRight size={16} className="text-[#28d939]" />
              <span className="text-[#28d939] font-['Inter:Semi_Bold',sans-serif] text-[13px]">
                +{(kpisFinanceiros.margemLucro - kpisFinanceiros.margemMesAnterior).toFixed(1)}pp
              </span>
              <span className="text-[#666] font-['Inter:Regular',sans-serif] text-[12px] ml-1">
                vs mês anterior
              </span>
            </div>
          </div>
        </div>

        {/* Produtos */}
        <div className="mb-8">
          <h2 className="font-['Inter:Bold',sans-serif] text-[#eee] text-[20px] mb-4">
            Produtos Rise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {produtosFinanceiros.map((produto) => (
              <div
                key={produto.id}
                className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6 hover:border-[#444] transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${produto.cor}20` }}
                    >
                      <Package size={24} style={{ color: produto.cor }} />
                    </div>
                    <div>
                      <h3 className="font-['Inter:Bold',sans-serif] text-[#eee] text-[18px]">
                        {produto.nome}
                      </h3>
                      <p className="font-['Inter:Regular',sans-serif] text-[#666] text-[12px]">
                        {produto.descricao}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-[11px] font-['Inter:Semi_Bold',sans-serif] ${
                      produto.status === "ativo"
                        ? "bg-[#28d939]/20 text-[#28d939]"
                        : "bg-[#f59e0b]/20 text-[#f59e0b]"
                    }`}
                  >
                    {produto.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-['Inter:Regular',sans-serif] text-[#666] text-[12px] mb-1">
                      Receita Total
                    </p>
                    <p className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[16px]">
                      {formatCurrency(produto.receitaTotal)}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Inter:Regular',sans-serif] text-[#666] text-[12px] mb-1">
                      Crescimento
                    </p>
                    <p
                      className="font-['Inter:Semi_Bold',sans-serif] text-[16px]"
                      style={{ color: produto.crescimento > 0 ? "#28d939" : "#666" }}
                    >
                      {produto.crescimento > 0 ? "+" : ""}
                      {produto.crescimento.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="font-['Inter:Regular',sans-serif] text-[#666] text-[12px] mb-1">
                      Clientes
                    </p>
                    <p className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[16px]">
                      {produto.clientes.toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Inter:Regular',sans-serif] text-[#666] text-[12px] mb-1">
                      Ticket Médio
                    </p>
                    <p className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[16px]">
                      {produto.ticketMedio > 0
                        ? formatCurrency(produto.ticketMedio)
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de Fluxo de Caixa */}
        <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6 mb-8">
          <h2 className="font-['Inter:Bold',sans-serif] text-[#eee] text-[20px] mb-6">
            Fluxo de Caixa Mensal
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={fluxoCaixaMensal}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="mesNome"
                stroke="#666"
                style={{ fontSize: "12px", fontFamily: "Inter" }}
              />
              <YAxis
                stroke="#666"
                style={{ fontSize: "12px", fontFamily: "Inter" }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "8px",
                  fontFamily: "Inter",
                }}
                formatter={(value: any) => formatCurrency(value)}
              />
              <Legend
                wrapperStyle={{
                  fontFamily: "Inter",
                  fontSize: "13px",
                }}
              />
              <Line
                type="monotone"
                dataKey="receitas"
                name="Receitas"
                stroke="#28d939"
                strokeWidth={2}
                dot={{ fill: "#28d939", r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="despesas"
                name="Despesas"
                stroke="#ec5d5e"
                strokeWidth={2}
                dot={{ fill: "#ec5d5e", r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="lucro"
                name="Lucro"
                stroke="#14E9BC"
                strokeWidth={2}
                dot={{ fill: "#14E9BC", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Categorias de Receitas e Despesas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Receitas por Categoria */}
          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
            <h3 className="font-['Inter:Bold',sans-serif] text-[#eee] text-[18px] mb-4">
              Receitas por Categoria
            </h3>
            <div className="space-y-3">
              {receitasPorCategoria.map((cat) => (
                <div key={cat.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-['Inter:Medium',sans-serif] text-[#eee] text-[13px]">
                      {cat.nome}
                    </span>
                    <span className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[14px]">
                      {formatCurrency(cat.total)}
                    </span>
                  </div>
                  <div className="w-full bg-[#1a1a1a] rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          (cat.total /
                            Math.max(...receitasPorCategoria.map((c) => c.total))) *
                          100
                        }%`,
                        backgroundColor: cat.cor,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Despesas por Categoria */}
          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
            <h3 className="font-['Inter:Bold',sans-serif] text-[#eee] text-[18px] mb-4">
              Despesas por Categoria
            </h3>
            <div className="space-y-3">
              {despesasPorCategoria.map((cat) => (
                <div key={cat.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-['Inter:Medium',sans-serif] text-[#eee] text-[13px]">
                      {cat.nome}
                    </span>
                    <span className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[14px]">
                      {formatCurrency(cat.total)}
                    </span>
                  </div>
                  <div className="w-full bg-[#1a1a1a] rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          (cat.total /
                            Math.max(...despesasPorCategoria.map((c) => c.total))) *
                          100
                        }%`,
                        backgroundColor: cat.cor,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transações */}
        <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-['Inter:Bold',sans-serif] text-[#eee] text-[20px]">
              Transações Recentes
            </h2>
            <div className="flex items-center gap-3">
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as any)}
                className="bg-[#1a1a1a] border border-[#333] rounded px-4 py-2 text-[#eee] font-['Inter:Regular',sans-serif] text-[13px] focus:border-[#f59e0b] focus:outline-none"
              >
                <option value="todos">Todos os Tipos</option>
                <option value="receita">Receitas</option>
                <option value="despesa">Despesas</option>
              </select>
              <select
                value={filtroProduto}
                onChange={(e) => setFiltroProduto(e.target.value)}
                className="bg-[#1a1a1a] border border-[#333] rounded px-4 py-2 text-[#eee] font-['Inter:Regular',sans-serif] text-[13px] focus:border-[#f59e0b] focus:outline-none"
              >
                <option value="todos">Todos os Produtos</option>
                {produtosFinanceiros.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0a0a] border-b border-[#333]">
                <tr>
                  <th className="px-4 py-3 text-left font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[13px]">
                    Data
                  </th>
                  <th className="px-4 py-3 text-left font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[13px]">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[13px]">
                    Descrição
                  </th>
                  <th className="px-4 py-3 text-left font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[13px]">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-left font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[13px]">
                    Produto
                  </th>
                  <th className="px-4 py-3 text-right font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[13px]">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                {transacoesFiltradas.slice(0, 15).map((trans) => {
                  const categoria =
                    trans.tipo === "receita"
                      ? categoriasFinanceiras.receitas.find((c) => c.id === trans.categoria)
                      : categoriasFinanceiras.despesas.find((c) => c.id === trans.categoria);
                  const produto = produtosFinanceiros.find((p) => p.id === trans.produto);

                  return (
                    <tr key={trans.id} className="border-b border-[#222] hover:bg-[#1a1a1a]">
                      <td className="px-4 py-3 font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[13px]">
                        {new Date(trans.data).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-[11px] font-['Inter:Semi_Bold',sans-serif] ${
                            trans.tipo === "receita"
                              ? "bg-[#28d939]/20 text-[#28d939]"
                              : "bg-[#ec5d5e]/20 text-[#ec5d5e]"
                          }`}
                        >
                          {trans.tipo === "receita" ? "RECEITA" : "DESPESA"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-['Inter:Regular',sans-serif] text-[#eee] text-[13px]">
                        {trans.descricao}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-1 rounded text-[11px] font-['Inter:Medium',sans-serif]"
                          style={{
                            backgroundColor: `${categoria?.cor}20`,
                            color: categoria?.cor,
                          }}
                        >
                          {categoria?.nome}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[13px]">
                        {produto ? produto.nome : "-"}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-['Inter:Semi_Bold',sans-serif] text-[14px] ${
                          trans.tipo === "receita" ? "text-[#28d939]" : "text-[#ec5d5e]"
                        }`}
                      >
                        {trans.tipo === "receita" ? "+" : "-"}
                        {formatCurrency(trans.valor)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Importação */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f0f] border border-[#333] rounded-xl max-w-[900px] w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#333]">
              <div>
                <h2 className="font-['Inter:Bold',sans-serif] text-[#eee] text-[24px]">
                  Importar Dados Financeiros
                </h2>
                <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px] mt-1">
                  {importStep === "upload" && "Faça upload do arquivo CSV com as transações"}
                  {importStep === "preview" &&
                    `${parsedData.length} transações encontradas - Revise antes de importar`}
                  {importStep === "success" && "Importação concluída com sucesso!"}
                </p>
              </div>
              <button
                onClick={handleCloseImportModal}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#1a1a1a] transition-colors"
              >
                <X size={20} className="text-[#bdbdbd]" />
              </button>
            </div>

            {/* Step: Upload */}
            {importStep === "upload" && (
              <div className="p-6">
                {/* Instruções */}
                <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 mb-6">
                  <h3 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[14px] mb-3">
                    Formato do arquivo CSV
                  </h3>
                  <div className="space-y-2 text-[13px] font-['Inter:Regular',sans-serif] text-[#bdbdbd]">
                    <p>
                      • <strong className="text-[#eee]">Colunas obrigatórias:</strong> tipo,
                      descricao, valor, data, competencia, categoria
                    </p>
                    <p>
                      • <strong className="text-[#eee]">Coluna opcional:</strong> produto (prod-rfy,
                      prod-rly, prod-rpa)
                    </p>
                    <p>
                      • <strong className="text-[#eee]">Tipo:</strong> receita ou despesa
                    </p>
                    <p>
                      • <strong className="text-[#eee]">Categorias de receita:</strong>{" "}
                      {categoriasFinanceiras.receitas.map((c) => c.id).join(", ")}
                    </p>
                    <p>
                      • <strong className="text-[#eee]">Categorias de despesa:</strong>{" "}
                      {categoriasFinanceiras.despesas.map((c) => c.id).join(", ")}
                    </p>
                    <p>
                      • <strong className="text-[#eee]">Formato de data:</strong> AAAA-MM-DD (ex:
                      2026-02-15)
                    </p>
                    <p>
                      • <strong className="text-[#eee]">Formato de competência:</strong> AAAA-MM
                      (ex: 2026-02)
                    </p>
                  </div>
                  <button
                    onClick={downloadExemploCSV}
                    className="mt-4 text-[#f59e0b] hover:underline font-['Inter:Medium',sans-serif] text-[13px] flex items-center gap-2"
                  >
                    <FileSpreadsheet size={16} />
                    Baixar arquivo CSV de exemplo
                  </button>
                </div>

                {/* Upload Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-10 text-center transition-all cursor-pointer ${
                    isDragging
                      ? "border-[#f59e0b] bg-[#f59e0b]/10"
                      : "border-[#333] hover:border-[#555] hover:bg-[#1a1a1a]"
                  }`}
                >
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="csv-upload-financeiro"
                  />
                  <label htmlFor="csv-upload-financeiro" className="cursor-pointer">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: "#f59e0b20" }}
                    >
                      <FileSpreadsheet size={40} className="text-[#f59e0b]" />
                    </div>
                    {csvFile ? (
                      <div>
                        <p className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[16px] mb-1">
                          {csvFile.name}
                        </p>
                        <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px]">
                          {(csvFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[18px] mb-2">
                          Arraste e solte seu arquivo CSV aqui
                        </p>
                        <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px] mb-3">
                          ou clique para selecionar
                        </p>
                        <p className="font-['Inter:Regular',sans-serif] text-[#555] text-[12px]">
                          Apenas arquivos .csv
                        </p>
                      </>
                    )}
                  </label>
                </div>

                {/* Erros */}
                {importErrors.length > 0 && (
                  <div className="mt-6 bg-[#ec5d5e]/10 border border-[#ec5d5e]/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={20} className="text-[#ec5d5e] flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-['Inter:Semi_Bold',sans-serif] text-[#ec5d5e] text-[14px] mb-2">
                          Erros encontrados no arquivo:
                        </h4>
                        <ul className="space-y-1 max-h-[200px] overflow-y-auto">
                          {importErrors.map((error, index) => (
                            <li
                              key={index}
                              className="font-['Inter:Regular',sans-serif] text-[#ec5d5e] text-[13px]"
                            >
                              • {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step: Preview */}
            {importStep === "preview" && (
              <div className="p-6">
                <div className="bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden mb-6">
                  <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-[#0f0f0f] sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[13px] border-b border-[#333]">
                            Data
                          </th>
                          <th className="px-4 py-3 text-left font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[13px] border-b border-[#333]">
                            Tipo
                          </th>
                          <th className="px-4 py-3 text-left font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[13px] border-b border-[#333]">
                            Descrição
                          </th>
                          <th className="px-4 py-3 text-left font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[13px] border-b border-[#333]">
                            Categoria
                          </th>
                          <th className="px-4 py-3 text-left font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[13px] border-b border-[#333]">
                            Produto
                          </th>
                          <th className="px-4 py-3 text-right font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[13px] border-b border-[#333]">
                            Valor
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.map((trans, index) => {
                          const categoria =
                            trans.tipo === "receita"
                              ? categoriasFinanceiras.receitas.find((c) => c.id === trans.categoria)
                              : categoriasFinanceiras.despesas.find(
                                  (c) => c.id === trans.categoria
                                );
                          const produto = produtosFinanceiros.find((p) => p.id === trans.produto);

                          return (
                            <tr key={index} className="border-b border-[#333] hover:bg-[#1a1a1a]">
                              <td className="px-4 py-3 font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[13px]">
                                {new Date(trans.data).toLocaleDateString("pt-BR")}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 rounded text-[11px] font-['Inter:Semi_Bold',sans-serif] ${
                                    trans.tipo === "receita"
                                      ? "bg-[#28d939]/20 text-[#28d939]"
                                      : "bg-[#ec5d5e]/20 text-[#ec5d5e]"
                                  }`}
                                >
                                  {trans.tipo === "receita" ? "REC" : "DESP"}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-['Inter:Regular',sans-serif] text-[#eee] text-[13px]">
                                {trans.descricao}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className="px-2 py-1 rounded text-[11px] font-['Inter:Medium',sans-serif]"
                                  style={{
                                    backgroundColor: `${categoria?.cor}20`,
                                    color: categoria?.cor,
                                  }}
                                >
                                  {categoria?.nome}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[13px]">
                                {produto ? produto.nome : "-"}
                              </td>
                              <td
                                className={`px-4 py-3 text-right font-['Inter:Semi_Bold',sans-serif] text-[13px] ${
                                  trans.tipo === "receita" ? "text-[#28d939]" : "text-[#ec5d5e]"
                                }`}
                              >
                                {formatCurrency(trans.valor)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-[#f59e0b]" />
                    <p className="font-['Inter:Medium',sans-serif] text-[#eee] text-[14px]">
                      {parsedData.length}{" "}
                      {parsedData.length === 1 ? "transação pronta" : "transações prontas"} para
                      importação
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step: Success */}
            {importStep === "success" && (
              <div className="p-10 text-center">
                <div className="w-20 h-20 bg-[#28d939]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={40} className="text-[#28d939]" />
                </div>
                <h3 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[24px] mb-3">
                  {parsedData.length}{" "}
                  {parsedData.length === 1 ? "Transação Importada" : "Transações Importadas"}!
                </h3>
                <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[15px]">
                  Os dados financeiros foram adicionados com sucesso.
                </p>
              </div>
            )}

            {/* Modal Footer */}
            {importStep !== "success" && (
              <div className="flex items-center justify-end gap-3 p-6 border-t border-[#333]">
                <button
                  onClick={handleCloseImportModal}
                  className="px-5 py-2.5 rounded-lg bg-[#1a1a1a] text-[#bdbdbd] font-['Inter:Semi_Bold',sans-serif] text-[14px] hover:bg-[#292929] transition-colors"
                >
                  Cancelar
                </button>
                {importStep === "preview" && (
                  <button
                    onClick={handleConfirmImport}
                    className="px-5 py-2.5 rounded-lg bg-[#f59e0b] text-[#000] font-['Inter:Semi_Bold',sans-serif] text-[14px] hover:bg-[#d97706] transition-colors"
                  >
                    Confirmar Importação
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
