import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { kpisDepartamento } from "../data/mockData";
import type { DepartamentoComStats } from "../../lib/services/departamentos";
import type { TarefaDB } from "../../lib/services/tarefas";
import type { OkrDB } from "../../lib/services/okrs";

// Função auxiliar para adicionar header no PDF
const addPDFHeader = (doc: jsPDF, title: string) => {
  doc.setFillColor(20, 233, 188);
  doc.roundedRect(20, 15, 10, 10, 2, 2, "F");
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(238, 238, 238);
  doc.text("R", 22.5, 23);

  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(238, 238, 238);
  doc.text(title, 35, 23);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(189, 189, 189);
  const dataAtual = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(`Gerado em: ${dataAtual}`, 35, 29);

  doc.setDrawColor(51, 51, 51);
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);

  return 45;
};

// Função para adicionar footer
const addPDFFooter = (doc: jsPDF) => {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(189, 189, 189);
    doc.text(
      `Rise Admin System - Página ${i} de ${pageCount}`,
      105,
      285,
      { align: "center" }
    );
  }
};

// Exportar Relatório Geral (Consolidado)
export const exportarRelatorioGeral = (
  departamentos: DepartamentoComStats[],
  tarefas: TarefaDB[],
  okrs: OkrDB[]
) => {
  const doc = new jsPDF();

  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, 210, 297, "F");

  let yPosition = addPDFHeader(doc, "Relatório Consolidado");

  // Seção 1: Métricas Gerais
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 233, 188);
  doc.text("Métricas Gerais", 20, yPosition);
  yPosition += 10;

  const totalTarefas = tarefas.length;
  const tarefasConcluidas = tarefas.filter((t) => t.status === "concluido").length;
  const tarefasAtivas = totalTarefas - tarefasConcluidas;
  const taxaConclusao = totalTarefas > 0 ? ((tarefasConcluidas / totalTarefas) * 100).toFixed(1) : "0";
  const totalDocumentos = departamentos.reduce((acc, d) => acc + d.documentos, 0);
  const totalMembros = departamentos.reduce((acc, d) => acc + d.membros, 0);

  autoTable(doc, {
    startY: yPosition,
    head: [["Métrica", "Valor", "Tendência"]],
    body: [
      ["Taxa de Conclusão", `${taxaConclusao}%`, "+12% vs período anterior"],
      ["Tarefas Ativas", `${tarefasAtivas}`, `Em ${departamentos.length} departamentos`],
      ["Total de Membros", `${totalMembros}`, departamentos.length > 0 ? `Média: ${(totalMembros / departamentos.length).toFixed(0)}/dept` : "—"],
      ["Documentos Totais", `${totalDocumentos}`, "+8% vs período anterior"],
    ],
    theme: "grid",
    styles: { fillColor: [26, 26, 26], textColor: [238, 238, 238], fontSize: 10, cellPadding: 5 },
    headStyles: { fillColor: [20, 233, 188], textColor: [0, 0, 0], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [15, 15, 15] },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Seção 2: Performance por Departamento
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 233, 188);
  doc.text("Performance por Departamento", 20, yPosition);
  yPosition += 10;

  const deptData = departamentos.map((dept) => {
    const deptTasks = tarefas.filter((t) => t.departamento_id === dept.id);
    const completed = deptTasks.filter((t) => t.status === "concluido").length;
    const total = deptTasks.length;
    const completion = total > 0 ? ((completed / total) * 100).toFixed(1) : "0";
    return [dept.nome, `${completion}%`, `${dept.membros} membros`, `${dept.tarefasAbertas} abertas`];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [["Departamento", "Conclusão", "Membros", "Tarefas Abertas"]],
    body: deptData,
    theme: "grid",
    styles: { fillColor: [26, 26, 26], textColor: [238, 238, 238], fontSize: 10, cellPadding: 5 },
    headStyles: { fillColor: [20, 233, 188], textColor: [0, 0, 0], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [15, 15, 15] },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Seção 3: OKRs Consolidados
  if (yPosition > 220) {
    doc.addPage();
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, 210, 297, "F");
    yPosition = 20;
  }

  if (okrs.length > 0) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 233, 188);
    doc.text("OKRs", 20, yPosition);
    yPosition += 10;

    const okrData = okrs.map((okr) => {
      const dept = departamentos.find((d) => d.id === okr.departamento_id);
      return [dept?.nome || "—", okr.titulo, `${okr.progresso}%`, okr.responsavel?.nome ?? "—"];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [["Departamento", "Objetivo", "Progresso", "Responsável"]],
      body: okrData,
      theme: "grid",
      styles: { fillColor: [26, 26, 26], textColor: [238, 238, 238], fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [20, 233, 188], textColor: [0, 0, 0], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [15, 15, 15] },
      columnStyles: { 1: { cellWidth: 70 } },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Seção 4: Insights e Recomendações
  if (yPosition > 220) {
    doc.addPage();
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, 210, 297, "F");
    yPosition = 20;
  }

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 233, 188);
  doc.text("Insights e Recomendações", 20, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(238, 238, 238);

  const insights = [
    "• Taxa de conclusão geral está acima do período anterior, indicando melhora na produtividade.",
    "• Acompanhe o progresso dos OKRs para garantir o atingimento das metas departamentais.",
    "• Mantenha o foco na execução de tarefas críticas e na atualização dos indicadores.",
  ];

  insights.forEach((insight) => {
    doc.text(insight, 20, yPosition, { maxWidth: 170 });
    yPosition += 8;
  });

  addPDFFooter(doc);
  doc.save(`Relatorio_Geral_Rise_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`);
};

// Exportar Relatório de Departamento Específico
export const exportarRelatorioDepartamento = (
  departamentoId: string,
  dept?: DepartamentoComStats,
  tarefas?: TarefaDB[],
  okrs?: OkrDB[]
) => {
  if (!dept) return;

  const deptTasks = tarefas ?? [];
  const deptOkrs = okrs ?? [];

  const doc = new jsPDF();

  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, 210, 297, "F");

  let yPosition = addPDFHeader(doc, `Relatório - ${dept.nome}`);

  const corRGB = dept.cor.replace("#", "").match(/\w\w/g)?.map((x) => parseInt(x, 16)) || [20, 233, 188];
  doc.setFillColor(corRGB[0], corRGB[1], corRGB[2]);
  doc.roundedRect(20, yPosition - 5, 15, 15, 2, 2, "F");
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(corRGB[0], corRGB[1], corRGB[2]);
  doc.text(dept.nome[0], 24, yPosition + 5);

  doc.setFontSize(12);
  doc.setTextColor(189, 189, 189);
  doc.text("Período: Último mês", 40, yPosition + 5);
  yPosition += 20;

  // Seção 1: Métricas Principais
  const completedTasks = deptTasks.filter((t) => t.status === "concluido").length;
  const inProgressTasks = deptTasks.filter((t) => t.status === "em-andamento").length;
  const plannedTasks = deptTasks.filter((t) => t.status === "planejamento").length;
  const completionRate = deptTasks.length > 0 ? ((completedTasks / deptTasks.length) * 100).toFixed(1) : "0";

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 233, 188);
  doc.text("Métricas Principais", 20, yPosition);
  yPosition += 10;

  autoTable(doc, {
    startY: yPosition,
    head: [["Métrica", "Valor"]],
    body: [
      ["Membros do Time", `${dept.membros}`],
      ["Taxa de Conclusão", `${completionRate}%`],
      ["Tarefas Ativas", `${deptTasks.length - completedTasks}`],
      ["Documentos", `${dept.documentos}`],
    ],
    theme: "grid",
    styles: { fillColor: [26, 26, 26], textColor: [238, 238, 238], fontSize: 10, cellPadding: 5 },
    headStyles: { fillColor: [corRGB[0], corRGB[1], corRGB[2]], textColor: [0, 0, 0], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [15, 15, 15] },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Seção 2: KPIs (mock — sem tabela no DB)
  const kpis = kpisDepartamento[dept.id as keyof typeof kpisDepartamento];
  if (kpis) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 233, 188);
    doc.text("KPIs Específicos do Departamento", 20, yPosition);
    yPosition += 10;

    const kpiData = Object.entries(kpis).map(([key, value]) => [key, String(value)]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Indicador", "Valor Atual"]],
      body: kpiData,
      theme: "grid",
      styles: { fillColor: [26, 26, 26], textColor: [238, 238, 238], fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [corRGB[0], corRGB[1], corRGB[2]], textColor: [0, 0, 0], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [15, 15, 15] },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Seção 3: OKR Principal
  const okr = deptOkrs[0];
  if (okr) {
    if (yPosition > 220) {
      doc.addPage();
      doc.setFillColor(10, 10, 10);
      doc.rect(0, 0, 210, 297, "F");
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 233, 188);
    doc.text("OKR Principal", 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(238, 238, 238);
    doc.text(`Objetivo: ${okr.titulo}`, 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(189, 189, 189);
    doc.text(`Progresso Geral: ${okr.progresso}% | Responsável: ${okr.responsavel?.nome ?? "—"}`, 20, yPosition);
    yPosition += 10;

    if (okr.key_results && okr.key_results.length > 0) {
      const krData = okr.key_results.map((kr) => [
        kr.descricao,
        `${kr.valor_atual} / ${kr.valor_meta} ${kr.unidade}`,
        `${kr.progresso}%`,
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Key Result", "Atual / Meta", "Progresso"]],
        body: krData,
        theme: "grid",
        styles: { fillColor: [26, 26, 26], textColor: [238, 238, 238], fontSize: 9, cellPadding: 5 },
        headStyles: { fillColor: [corRGB[0], corRGB[1], corRGB[2]], textColor: [0, 0, 0], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [15, 15, 15] },
        columnStyles: { 0: { cellWidth: 90 } },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }
  }

  // Seção 4: Distribuição de Tarefas
  if (yPosition > 220) {
    doc.addPage();
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, 210, 297, "F");
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 233, 188);
  doc.text("Distribuição de Tarefas", 20, yPosition);
  yPosition += 10;

  autoTable(doc, {
    startY: yPosition,
    head: [["Status", "Quantidade", "Percentual"]],
    body: [
      ["Planejamento", `${plannedTasks}`, `${deptTasks.length > 0 ? ((plannedTasks / deptTasks.length) * 100).toFixed(1) : 0}%`],
      ["Em Andamento", `${inProgressTasks}`, `${deptTasks.length > 0 ? ((inProgressTasks / deptTasks.length) * 100).toFixed(1) : 0}%`],
      ["Concluído", `${completedTasks}`, `${deptTasks.length > 0 ? ((completedTasks / deptTasks.length) * 100).toFixed(1) : 0}%`],
    ],
    theme: "grid",
    styles: { fillColor: [26, 26, 26], textColor: [238, 238, 238], fontSize: 10, cellPadding: 5 },
    headStyles: { fillColor: [corRGB[0], corRGB[1], corRGB[2]], textColor: [0, 0, 0], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [15, 15, 15] },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Seção 5: Tarefas Recentes
  if (yPosition > 220) {
    doc.addPage();
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, 210, 297, "F");
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 233, 188);
  doc.text("Tarefas Recentes", 20, yPosition);
  yPosition += 10;

  const tarefasRecentes = deptTasks.slice(0, 8).map((t) => [
    t.titulo,
    t.responsavel?.nome ?? "—",
    t.status === "concluido" ? "Concluído" : t.status === "em-andamento" ? "Em Andamento" : "Planejamento",
    `${t.progresso ?? 0}%`,
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Tarefa", "Responsável", "Status", "Progresso"]],
    body: tarefasRecentes,
    theme: "grid",
    styles: { fillColor: [26, 26, 26], textColor: [238, 238, 238], fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [corRGB[0], corRGB[1], corRGB[2]], textColor: [0, 0, 0], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [15, 15, 15] },
    columnStyles: { 0: { cellWidth: 70 } },
  });

  addPDFFooter(doc);
  doc.save(`Relatorio_${dept.nome}_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`);
};
