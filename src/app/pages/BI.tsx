import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import {
  Activity, TrendingUp, TrendingDown, Users, CheckCircle2,
  Target, DollarSign, RefreshCw,
} from "lucide-react";

import { getDepartamentosComStats, type DepartamentoComStats } from "../../lib/services/departamentos";
import { getTarefas, type TarefaDB } from "../../lib/services/tarefas";
import { getOkrs, type OkrDB } from "../../lib/services/okrs";
import {
  getSnapshots, getAUMEvolution, getProdutos, computarMetricas,
  type FinSnapshot, type FinProduto,
} from "../../lib/services/financeiro";

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtBRL(v: number): string {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}K`;
  return `R$ ${v.toFixed(0)}`;
}

function fmtPct(v: number): string {
  return `${v.toFixed(1)}%`;
}

// ── Custom Tooltip AUM ────────────────────────────────────────────────────────

function TooltipAUM({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-[12px]">
      <p className="text-[#bdbdbd] mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {fmtBRL(p.value)}</p>
      ))}
    </div>
  );
}

function TooltipPct({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-[12px]">
      <p className="text-[#bdbdbd] mb-1">{label}</p>
      <p style={{ color: payload[0]?.color }}>{fmtPct(payload[0]?.value ?? 0)}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BI() {
  const [loading, setLoading] = useState(true);
  const [departamentos, setDepartamentos] = useState<DepartamentoComStats[]>([]);
  const [tarefas, setTarefas] = useState<TarefaDB[]>([]);
  const [okrs, setOkrs] = useState<OkrDB[]>([]);
  const [snapshots, setSnapshots] = useState<FinSnapshot[]>([]);
  const [produtos, setProdutos] = useState<FinProduto[]>([]);
  const [aumEvolution, setAumEvolution] = useState<
    { competencia: string; label: string; aum_total: number; total_aportes: number; total_resgates: number }[]
  >([]);
  const [atualizadoEm, setAtualizadoEm] = useState("");

  useEffect(() => {
    Promise.all([
      getDepartamentosComStats(),
      getTarefas(),
      getOkrs(),
      getSnapshots(),
      getProdutos(),
      getAUMEvolution(),
    ]).then(([d, t, o, s, p, ae]) => {
      setDepartamentos(d);
      setTarefas(t);
      setOkrs(o);
      setSnapshots(s);
      setProdutos(p);
      setAumEvolution(ae);
      setAtualizadoEm(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // ── Derived metrics ──────────────────────────────────────────────────────────

  // AUM: latest competencia snapshots only
  const latestComp = [...new Set(snapshots.map((s) => s.competencia))].sort().at(-1) ?? "";
  const latestSnaps = snapshots.filter((s) => s.competencia === latestComp);
  const aumConsolidado = latestSnaps.reduce((sum, s) => sum + Number(s.aum_total), 0);
  const totalInvestido = latestSnaps.reduce((sum, s) => sum + computarMetricas(s).total_investido, 0);
  const feesConsolidados = aumConsolidado - totalInvestido;
  const feeRatioConsolidado = aumConsolidado > 0 ? (feesConsolidados / aumConsolidado) * 100 : 0;

  // Produtos por AUM (current competencia)
  const produtosMap: Record<string, string> = {};
  produtos.forEach((p) => { produtosMap[p.id] = p.nome; });
  const produtosAUM = latestSnaps
    .map((s) => ({
      nome: produtosMap[s.produto_id] ?? s.produto_id.slice(0, 8),
      aum: Number(s.aum_total),
      cor: produtos.find((p) => p.id === s.produto_id)?.cor ?? "#14E9BC",
    }))
    .sort((a, b) => b.aum - a.aum)
    .slice(0, 5);

  // Tarefas
  const totalTarefas = tarefas.length;
  const tarefasConcluidas = tarefas.filter((t) => t.status === "concluido").length;
  const eficienciaOps = totalTarefas > 0 ? (tarefasConcluidas / totalTarefas) * 100 : 0;

  // OKRs
  const okrScore = okrs.length > 0
    ? okrs.reduce((sum, o) => sum + (o.progresso ?? 0), 0) / okrs.length
    : 0;

  // ── Por departamento ──────────────────────────────────────────────────────────

  const deptData = departamentos.map((dept) => {
    const deptTarefas = tarefas.filter((t) => t.departamento_id === dept.id);
    const deptConcluidas = deptTarefas.filter((t) => t.status === "concluido").length;
    const taskPct = deptTarefas.length > 0 ? (deptConcluidas / deptTarefas.length) * 100 : 0;

    const deptOkrs = okrs.filter((o) => o.departamento_id === dept.id);
    const okrPct = deptOkrs.length > 0
      ? deptOkrs.reduce((s, o) => s + (o.progresso ?? 0), 0) / deptOkrs.length
      : 0;

    const score = Math.round(okrPct * 0.55 + taskPct * 0.45);

    return {
      id: dept.id,
      nome: dept.nome.length > 10 ? dept.nome.slice(0, 10) : dept.nome,
      nomeCompleto: dept.nome,
      cor: dept.cor,
      membros: dept.membros,
      taskPct,
      okrPct,
      score,
      tarefasTotal: deptTarefas.length,
      tarefasConcluidas: deptConcluidas,
      okrsTotal: okrs.filter((o) => o.departamento_id === dept.id).length,
    };
  }).sort((a, b) => b.score - a.score);

  // AUM evolution — prepend placeholder if only 1 point (chart needs 2+ to be useful)
  const aumChartData = aumEvolution.length === 1
    ? [{ ...aumEvolution[0], label: "Anterior", aum_total: 0 }, aumEvolution[0]]
    : aumEvolution;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#14E9BC] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#bdbdbd] text-[14px]">Carregando painel executivo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#14E9BC] to-[#6B8AFF] flex items-center justify-center">
                <Activity size={20} className="text-[#000]" />
              </div>
              <h1 className="font-bold text-[#eee] text-[32px] leading-tight">BI Integrado</h1>
            </div>
            <p className="text-[#bdbdbd] text-[15px] ml-[52px]">
              Painel executivo — cruzamento de AUM, OKRs e operações
            </p>
          </div>
          <div className="flex items-center gap-2 text-[#555] text-[13px] mt-2">
            <RefreshCw size={14} />
            <span>Atualizado às {atualizadoEm}</span>
          </div>
        </div>

        {/* KPI Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* AUM Consolidado */}
          <div className="bg-[#0f0f0f] border border-[#333] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#14E9BC]/10 flex items-center justify-center">
                <DollarSign size={20} className="text-[#14E9BC]" />
              </div>
              {feeRatioConsolidado >= 0
                ? <span className="flex items-center gap-1 text-[#28d939] text-[12px]"><TrendingUp size={12} />{fmtPct(feeRatioConsolidado)} fee</span>
                : <span className="flex items-center gap-1 text-[#ec5d5e] text-[12px]"><TrendingDown size={12} />{fmtPct(Math.abs(feeRatioConsolidado))} fee</span>
              }
            </div>
            <p className="text-[#777] text-[12px] mb-1">AUM Consolidado</p>
            <p className="text-[#eee] text-[28px] font-bold leading-tight">{fmtBRL(aumConsolidado)}</p>
            <p className="text-[#555] text-[11px] mt-1">{latestSnaps.length} produtos ativos</p>
          </div>

          {/* Fee Ratio */}
          <div className="bg-[#0f0f0f] border border-[#333] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#6B8AFF]/10 flex items-center justify-center">
                <TrendingUp size={20} className="text-[#6B8AFF]" />
              </div>
            </div>
            <p className="text-[#777] text-[12px] mb-1">Fees Gerados</p>
            <p className={`text-[28px] font-bold leading-tight ${feesConsolidados >= 0 ? "text-[#28d939]" : "text-[#ec5d5e]"}`}>
              {fmtBRL(Math.abs(feesConsolidados))}
            </p>
            <p className="text-[#555] text-[11px] mt-1">Rentabilidade acumulada</p>
          </div>

          {/* Eficiência Ops */}
          <div className="bg-[#0f0f0f] border border-[#333] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#28d939]/10 flex items-center justify-center">
                <CheckCircle2 size={20} className="text-[#28d939]" />
              </div>
            </div>
            <p className="text-[#777] text-[12px] mb-1">Eficiência Operacional</p>
            <p className="text-[#eee] text-[28px] font-bold leading-tight">{fmtPct(eficienciaOps)}</p>
            <p className="text-[#555] text-[11px] mt-1">{tarefasConcluidas}/{totalTarefas} tarefas concluídas</p>
          </div>

          {/* OKR Score */}
          <div className="bg-[#0f0f0f] border border-[#333] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#E879F9]/10 flex items-center justify-center">
                <Target size={20} className="text-[#E879F9]" />
              </div>
            </div>
            <p className="text-[#777] text-[12px] mb-1">OKR Score Médio</p>
            <p className="text-[#eee] text-[28px] font-bold leading-tight">{fmtPct(okrScore)}</p>
            <p className="text-[#555] text-[11px] mt-1">{okrs.length} OKRs cadastrados</p>
          </div>
        </div>

        {/* Row 1: AUM Evolution + Top Produtos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* AUM Evolution — ocupa 2/3 */}
          <div className="lg:col-span-2 bg-[#0f0f0f] border border-[#333] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-[#eee] text-[16px] font-semibold">Evolução do AUM</h2>
                <p className="text-[#555] text-[12px] mt-0.5">Total consolidado por competência</p>
              </div>
              <span className="text-[#14E9BC] text-[12px] font-semibold bg-[#14E9BC]/10 px-2.5 py-1 rounded-full">
                {aumEvolution.length} período{aumEvolution.length !== 1 ? "s" : ""}
              </span>
            </div>
            {aumChartData.length >= 2 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={aumChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradAUM" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14E9BC" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#14E9BC" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradAportes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6B8AFF" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6B8AFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                  <XAxis dataKey="label" tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => fmtBRL(v)} tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<TooltipAUM />} />
                  <Area type="monotone" dataKey="total_aportes" name="Aportes" stroke="#6B8AFF" strokeWidth={1.5} fill="url(#gradAportes)" dot={false} />
                  <Area type="monotone" dataKey="aum_total" name="AUM" stroke="#14E9BC" strokeWidth={2} fill="url(#gradAUM)" dot={{ fill: "#14E9BC", r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex flex-col items-center justify-center gap-3 text-center">
                <p className="text-[#555] text-[14px]">Lançar AUM em mais de uma competência para visualizar a evolução.</p>
                <span className="text-[#333] text-[12px]">Dados insuficientes para série temporal</span>
              </div>
            )}
          </div>

          {/* Top 5 Produtos por AUM */}
          <div className="bg-[#0f0f0f] border border-[#333] rounded-xl p-6">
            <h2 className="text-[#eee] text-[16px] font-semibold mb-1">Top Produtos</h2>
            <p className="text-[#555] text-[12px] mb-5">Por AUM — {latestComp || "sem dados"}</p>
            {produtosAUM.length === 0 ? (
              <p className="text-[#555] text-[13px] text-center mt-8">Nenhum dado disponível</p>
            ) : (
              <div className="space-y-4">
                {produtosAUM.map((p, i) => {
                  const pct = aumConsolidado > 0 ? (p.aum / aumConsolidado) * 100 : 0;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[#555] text-[11px] w-4">{i + 1}.</span>
                          <span className="text-[#eee] text-[13px] font-medium truncate max-w-[120px]">{p.nome}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[#eee] text-[12px] font-semibold">{fmtBRL(p.aum)}</span>
                          <span className="text-[#555] text-[10px] ml-1.5">{fmtPct(pct)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-[#1a1a1a] rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: p.cor }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Row 2: OKR por Depto + Task Completion por Depto */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* OKR Progress por Departamento */}
          <div className="bg-[#0f0f0f] border border-[#333] rounded-xl p-6">
            <h2 className="text-[#eee] text-[16px] font-semibold mb-1">OKR Progress por Departamento</h2>
            <p className="text-[#555] text-[12px] mb-5">Média de progresso dos objetivos</p>
            {deptData.every((d) => d.okrPct === 0) ? (
              <p className="text-[#555] text-[13px] text-center mt-8">Nenhum OKR cadastrado</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptData} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="nome" tick={{ fill: "#bdbdbd", fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip content={<TooltipPct />} />
                  <Bar dataKey="okrPct" name="OKR %" radius={[0, 4, 4, 0]} maxBarSize={16}>
                    {deptData.map((d, i) => (
                      <Cell key={i} fill={d.cor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Eficiência de Tarefas por Departamento */}
          <div className="bg-[#0f0f0f] border border-[#333] rounded-xl p-6">
            <h2 className="text-[#eee] text-[16px] font-semibold mb-1">Eficiência de Tarefas</h2>
            <p className="text-[#555] text-[12px] mb-5">% de conclusão por departamento</p>
            {deptData.every((d) => d.tarefasTotal === 0) ? (
              <p className="text-[#555] text-[13px] text-center mt-8">Nenhuma tarefa cadastrada</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptData} margin={{ top: 0, right: 8, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                  <XAxis dataKey="nome" tick={{ fill: "#bdbdbd", fontSize: 10 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" interval={0} />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<TooltipPct />} />
                  <Bar dataKey="taskPct" name="Tarefas %" radius={[4, 4, 0, 0]} maxBarSize={32}>
                    {deptData.map((d, i) => (
                      <Cell key={i} fill={d.cor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Ranking Executivo Consolidado */}
        <div className="bg-[#0f0f0f] border border-[#333] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[#eee] text-[16px] font-semibold">Ranking Executivo Consolidado</h2>
              <p className="text-[#555] text-[12px] mt-0.5">Score composto: 55% OKR + 45% eficiência operacional</p>
            </div>
            <div className="flex items-center gap-1.5 text-[#555] text-[11px]">
              <Users size={13} />
              <span>{departamentos.reduce((s, d) => s + d.membros, 0)} membros no total</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#222]">
                  <th className="text-left text-[#555] font-medium pb-3 pr-4 w-6">#</th>
                  <th className="text-left text-[#555] font-medium pb-3 pr-6">Departamento</th>
                  <th className="text-center text-[#555] font-medium pb-3 px-4">Membros</th>
                  <th className="text-center text-[#555] font-medium pb-3 px-4">Tarefas</th>
                  <th className="text-center text-[#555] font-medium pb-3 px-4">OKR %</th>
                  <th className="text-center text-[#555] font-medium pb-3 px-4">Tarefas %</th>
                  <th className="text-right text-[#555] font-medium pb-3 pl-4">Score</th>
                </tr>
              </thead>
              <tbody>
                {deptData.map((d, i) => {
                  const scoreColor = d.score >= 70 ? "#28d939" : d.score >= 40 ? "#f59e0b" : "#ec5d5e";
                  return (
                    <tr key={d.id} className="border-b border-[#1a1a1a] hover:bg-[#111] transition-colors">
                      <td className="py-3 pr-4 text-[#555]">{i + 1}</td>
                      <td className="py-3 pr-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                            style={{ backgroundColor: `${d.cor}20`, color: d.cor }}>
                            {d.nomeCompleto[0]}
                          </div>
                          <span className="text-[#eee] font-medium">{d.nomeCompleto}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-[#bdbdbd]">
                          <Users size={12} className="text-[#555]" />
                          {d.membros}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-[#bdbdbd]">
                        {d.tarefasConcluidas}/{d.tarefasTotal}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-[#1a1a1a] rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-[#E879F9]" style={{ width: `${d.okrPct}%` }} />
                          </div>
                          <span className="text-[#bdbdbd] text-[11px] w-10 text-right">{fmtPct(d.okrPct)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-[#1a1a1a] rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-[#28d939]" style={{ width: `${d.taskPct}%` }} />
                          </div>
                          <span className="text-[#bdbdbd] text-[11px] w-10 text-right">{fmtPct(d.taskPct)}</span>
                        </div>
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <span className="font-bold text-[15px] px-2.5 py-0.5 rounded-lg text-[#000]"
                          style={{ backgroundColor: scoreColor }}>
                          {d.score}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
