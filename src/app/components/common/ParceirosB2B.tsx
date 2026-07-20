import { useState } from "react";
import { Users, LayoutGrid, Columns3 } from "lucide-react";

export function ParceirosB2B() {
  const [view, setView] = useState<'grid' | 'kanban'>('grid');

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-rise-fg text-[20px]">
          Parceiros B2B
        </h2>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-rise-surface border border-rise-line rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all font-['Inter:Medium',sans-serif] text-[13px] ${
                view === 'grid'
                  ? 'bg-[#14E9BC] text-[#0a0a0a]'
                  : 'text-rise-fg-2 hover:text-rise-fg'
              }`}
            >
              <LayoutGrid size={14} />
              Grid
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all font-['Inter:Medium',sans-serif] text-[13px] ${
                view === 'kanban'
                  ? 'bg-[#14E9BC] text-[#0a0a0a]'
                  : 'text-rise-fg-2 hover:text-rise-fg'
              }`}
            >
              <Columns3 size={14} />
              Kanban
            </button>
          </div>
          
          <button className="flex items-center gap-2 bg-[#14E9BC] text-[#0a0a0a] px-4 py-2 rounded-lg hover:bg-[#12d4a8] transition-all font-['Inter:Medium',sans-serif] text-[14px]">
            <Users size={16} />
            Adicionar Parceiro
          </button>
        </div>
      </div>
      
      {/* Grid View */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Parceiro 1 - Parceria fechada */}
          <div className="bg-rise-surface border border-rise-line rounded-lg p-5 hover:border-[#14E9BC] transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#14E9BC] to-[#28d939] rounded-lg flex items-center justify-center text-[#0a0a0a] font-['Inter:Bold',sans-serif] text-[16px]">
                  TI
                </div>
                <div>
                  <h3 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[16px]">
                    Tech Innovations Ltda
                  </h3>
                  <span className="inline-flex items-center gap-1 bg-[#28d93920] text-[#28d939] px-2 py-0.5 rounded text-[12px] font-['Inter:Medium',sans-serif] mt-1">
                    <div className="w-1.5 h-1.5 bg-[#28d939] rounded-full"></div>
                    Parceria fechada
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-rise-fg-2 font-['Inter:Regular',sans-serif]">Contrato desde</span>
                <span className="text-rise-fg font-['Inter:Medium',sans-serif]">Jan 2024</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-rise-fg-2 font-['Inter:Regular',sans-serif]">Receita Mensal</span>
                <span className="text-[#14E9BC] font-['Inter:Semi_Bold',sans-serif]">R$ 45.000</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-rise-fg-2 font-['Inter:Regular',sans-serif]">Próxima Renovação</span>
                <span className="text-rise-fg font-['Inter:Medium',sans-serif]">Jan 2026</span>
              </div>
            </div>

            <div className="pt-4 border-t border-rise-line">
              <div className="flex items-center justify-between mb-2">
                <span className="text-rise-fg-2 text-[12px] font-['Inter:Regular',sans-serif]">Health Score</span>
                <span className="text-[#28d939] text-[12px] font-['Inter:Semi_Bold',sans-serif]">92%</span>
              </div>
              <div className="w-full h-2 bg-rise-raised rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#28d939] to-[#14E9BC]" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>

          {/* Parceiro 2 - Parceria fechada */}
          <div className="bg-rise-surface border border-rise-line rounded-lg p-5 hover:border-[#14E9BC] transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#14E9BC] to-[#28d939] rounded-lg flex items-center justify-center text-[#0a0a0a] font-['Inter:Bold',sans-serif] text-[16px]">
                  GS
                </div>
                <div>
                  <h3 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[16px]">
                    Global Solutions Inc
                  </h3>
                  <span className="inline-flex items-center gap-1 bg-[#28d93920] text-[#28d939] px-2 py-0.5 rounded text-[12px] font-['Inter:Medium',sans-serif] mt-1">
                    <div className="w-1.5 h-1.5 bg-[#28d939] rounded-full"></div>
                    Parceria fechada
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-rise-fg-2 font-['Inter:Regular',sans-serif]">Contrato desde</span>
                <span className="text-rise-fg font-['Inter:Medium',sans-serif]">Mar 2023</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-rise-fg-2 font-['Inter:Regular',sans-serif]">Receita Mensal</span>
                <span className="text-[#14E9BC] font-['Inter:Semi_Bold',sans-serif]">R$ 78.500</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-rise-fg-2 font-['Inter:Regular',sans-serif]">Próxima Renovação</span>
                <span className="text-rise-fg font-['Inter:Medium',sans-serif]">Mar 2026</span>
              </div>
            </div>

            <div className="pt-4 border-t border-rise-line">
              <div className="flex items-center justify-between mb-2">
                <span className="text-rise-fg-2 text-[12px] font-['Inter:Regular',sans-serif]">Health Score</span>
                <span className="text-[#28d939] text-[12px] font-['Inter:Semi_Bold',sans-serif]">88%</span>
              </div>
              <div className="w-full h-2 bg-rise-raised rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#28d939] to-[#14E9BC]" style={{ width: '88%' }}></div>
              </div>
            </div>
          </div>

          {/* Parceiro 3 - Parceria fechada */}
          <div className="bg-rise-surface border border-rise-line rounded-lg p-5 hover:border-[#14E9BC] transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#14E9BC] to-[#28d939] rounded-lg flex items-center justify-center text-[#0a0a0a] font-['Inter:Bold',sans-serif] text-[16px]">
                  MC
                </div>
                <div>
                  <h3 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[16px]">
                    Mega Corp Brasil
                  </h3>
                  <span className="inline-flex items-center gap-1 bg-[#28d93920] text-[#28d939] px-2 py-0.5 rounded text-[12px] font-['Inter:Medium',sans-serif] mt-1">
                    <div className="w-1.5 h-1.5 bg-[#28d939] rounded-full"></div>
                    Parceria fechada
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-rise-fg-2 font-['Inter:Regular',sans-serif]">Contrato desde</span>
                <span className="text-rise-fg font-['Inter:Medium',sans-serif]">Jun 2022</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-rise-fg-2 font-['Inter:Regular',sans-serif]">Receita Mensal</span>
                <span className="text-[#14E9BC] font-['Inter:Semi_Bold',sans-serif]">R$ 125.000</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-rise-fg-2 font-['Inter:Regular',sans-serif]">Próxima Renovação</span>
                <span className="text-rise-fg font-['Inter:Medium',sans-serif]">Jun 2026</span>
              </div>
            </div>

            <div className="pt-4 border-t border-rise-line">
              <div className="flex items-center justify-between mb-2">
                <span className="text-rise-fg-2 text-[12px] font-['Inter:Regular',sans-serif]">Health Score</span>
                <span className="text-[#28d939] text-[12px] font-['Inter:Semi_Bold',sans-serif]">95%</span>
              </div>
              <div className="w-full h-2 bg-rise-raised rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#28d939] to-[#14E9BC]" style={{ width: '95%' }}></div>
              </div>
            </div>
          </div>

          {/* Parceiro 4 - Em Avanço */}
          <div className="bg-rise-surface border border-rise-line rounded-lg p-5 hover:border-[#14E9BC] transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#14E9BC] to-[#28d939] rounded-lg flex items-center justify-center text-[#0a0a0a] font-['Inter:Bold',sans-serif] text-[16px]">
                  DS
                </div>
                <div>
                  <h3 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[16px]">
                    Digital Systems SA
                  </h3>
                  <span className="inline-flex items-center gap-1 bg-[#7c3aed20] text-[#a78bfa] px-2 py-0.5 rounded text-[12px] font-['Inter:Medium',sans-serif] mt-1">
                    <div className="w-1.5 h-1.5 bg-[#a78bfa] rounded-full"></div>
                    Em Avanço
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-rise-fg-2 font-['Inter:Regular',sans-serif]">Primeiro contato</span>
                <span className="text-rise-fg font-['Inter:Medium',sans-serif]">Out 2024</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-rise-fg-2 font-['Inter:Regular',sans-serif]">Receita Estimada</span>
                <span className="text-[#14E9BC] font-['Inter:Semi_Bold',sans-serif]">R$ 32.000</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-rise-fg-2 font-['Inter:Regular',sans-serif]">Próximo Follow-up</span>
                <span className="text-rise-fg font-['Inter:Medium',sans-serif]">20 Fev 2025</span>
              </div>
            </div>

            <div className="pt-4 border-t border-rise-line">
              <div className="flex items-center justify-between mb-2">
                <span className="text-rise-fg-2 text-[12px] font-['Inter:Regular',sans-serif]">Interesse</span>
                <span className="text-[#a78bfa] text-[12px] font-['Inter:Semi_Bold',sans-serif]">Alto</span>
              </div>
              <div className="w-full h-2 bg-rise-raised rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa]" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>

          {/* Parceiro 5 - Conversa iniciada */}
          <div className="bg-rise-surface border border-rise-line rounded-lg p-5 hover:border-[#14E9BC] transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#14E9BC] to-[#28d939] rounded-lg flex items-center justify-center text-[#0a0a0a] font-['Inter:Bold',sans-serif] text-[16px]">
                  EP
                </div>
                <div>
                  <h3 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[16px]">
                    Enterprise Partners
                  </h3>
                  <span className="inline-flex items-center gap-1 bg-[#3b82f620] text-[#60a5fa] px-2 py-0.5 rounded text-[12px] font-['Inter:Medium',sans-serif] mt-1">
                    <div className="w-1.5 h-1.5 bg-[#60a5fa] rounded-full"></div>
                    Conversa iniciada
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-rise-fg-2 font-['Inter:Regular',sans-serif]">Primeiro contato</span>
                <span className="text-rise-fg font-['Inter:Medium',sans-serif]">Ago 2024</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-rise-fg-2 font-['Inter:Regular',sans-serif]">Receita Estimada</span>
                <span className="text-[#14E9BC] font-['Inter:Semi_Bold',sans-serif]">R$ 56.800</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-rise-fg-2 font-['Inter:Regular',sans-serif]">Próximo Follow-up</span>
                <span className="text-rise-fg font-['Inter:Medium',sans-serif]">18 Fev 2025</span>
              </div>
            </div>

            <div className="pt-4 border-t border-rise-line">
              <div className="flex items-center justify-between mb-2">
                <span className="text-rise-fg-2 text-[12px] font-['Inter:Regular',sans-serif]">Interesse</span>
                <span className="text-[#60a5fa] text-[12px] font-['Inter:Semi_Bold',sans-serif]">Médio</span>
              </div>
              <div className="w-full h-2 bg-rise-raised rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#3b82f6] to-[#60a5fa]" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>

          {/* Parceiro 6 - Solicitação de contato */}
          <div className="bg-rise-surface border border-rise-line rounded-lg p-5 hover:border-[#14E9BC] transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#14E9BC] to-[#28d939] rounded-lg flex items-center justify-center text-[#0a0a0a] font-['Inter:Bold',sans-serif] text-[16px]">
                  NS
                </div>
                <div>
                  <h3 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[16px]">
                    Nova Sistemas Ltda
                  </h3>
                  <span className="inline-flex items-center gap-1 bg-[#ffa50020] text-[#ffa500] px-2 py-0.5 rounded text-[12px] font-['Inter:Medium',sans-serif] mt-1">
                    <div className="w-1.5 h-1.5 bg-[#ffa500] rounded-full"></div>
                    Solicitação de contato
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-rise-fg-2 font-['Inter:Regular',sans-serif]">Solicitação em</span>
                <span className="text-rise-fg font-['Inter:Medium',sans-serif]">Fev 2025</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-rise-fg-2 font-['Inter:Regular',sans-serif]">Receita Estimada</span>
                <span className="text-[#14E9BC] font-['Inter:Semi_Bold',sans-serif]">R$ 28.500</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-rise-fg-2 font-['Inter:Regular',sans-serif]">Responsável</span>
                <span className="text-rise-fg font-['Inter:Medium',sans-serif]">Carlos Silva</span>
              </div>
            </div>

            <div className="pt-4 border-t border-rise-line">
              <div className="flex items-center justify-between mb-2">
                <span className="text-rise-fg-2 text-[12px] font-['Inter:Regular',sans-serif]">Prioridade</span>
                <span className="text-[#ffa500] text-[12px] font-['Inter:Semi_Bold',sans-serif]">Média</span>
              </div>
              <div className="w-full h-2 bg-rise-raised rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#ffa500] to-[#ff8c00]" style={{ width: '50%' }}></div>
              </div>
            </div>
          </div>

          {/* Parceiro 7 - Stand by */}
          <div className="bg-rise-surface border border-rise-line rounded-lg p-5 hover:border-[#14E9BC] transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#14E9BC] to-[#28d939] rounded-lg flex items-center justify-center text-[#0a0a0a] font-['Inter:Bold',sans-serif] text-[16px]">
                  AI
                </div>
                <div>
                  <h3 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[16px]">
                    Alpha Industries
                  </h3>
                  <span className="inline-flex items-center gap-1 bg-[#6b728020] text-[#9ca3af] px-2 py-0.5 rounded text-[12px] font-['Inter:Medium',sans-serif] mt-1">
                    <div className="w-1.5 h-1.5 bg-[#9ca3af] rounded-full"></div>
                    Stand by
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-rise-fg-2 font-['Inter:Regular',sans-serif]">Adicionado em</span>
                <span className="text-rise-fg font-['Inter:Medium',sans-serif]">Jan 2025</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-rise-fg-2 font-['Inter:Regular',sans-serif]">Receita Estimada</span>
                <span className="text-[#14E9BC] font-['Inter:Semi_Bold',sans-serif]">R$ 65.000</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-rise-fg-2 font-['Inter:Regular',sans-serif]">Status</span>
                <span className="text-rise-fg font-['Inter:Medium',sans-serif]">Aguardando</span>
              </div>
            </div>

            <div className="pt-4 border-t border-rise-line">
              <div className="flex items-center justify-between mb-2">
                <span className="text-rise-fg-2 text-[12px] font-['Inter:Regular',sans-serif]">Prioridade</span>
                <span className="text-[#9ca3af] text-[12px] font-['Inter:Semi_Bold',sans-serif]">Baixa</span>
              </div>
              <div className="w-full h-2 bg-rise-raised rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#6b7280] to-[#9ca3af]" style={{ width: '30%' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {/* Stand by Column */}
          <div className="flex-shrink-0 w-[300px]">
            <div className="bg-rise-surface border border-rise-line rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[15px]">
                  Stand by
                </h3>
                <span className="bg-[#6b728020] text-[#9ca3af] px-2 py-0.5 rounded text-[12px] font-['Inter:Semi_Bold',sans-serif]">
                  1
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="bg-rise-raised border border-rise-line rounded-lg p-4 hover:border-[#9ca3af] transition-all cursor-pointer">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#14E9BC] to-[#28d939] rounded flex items-center justify-center text-[#0a0a0a] font-['Inter:Bold',sans-serif] text-[14px]">
                      AI
                    </div>
                    <div className="flex-1">
                      <h4 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[14px]">
                        Alpha Industries
                      </h4>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-[12px]">
                    <div className="flex justify-between">
                      <span className="text-rise-fg-2">Receita Est.</span>
                      <span className="text-[#14E9BC] font-['Inter:Semi_Bold',sans-serif]">R$ 65k</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rise-fg-2">Adicionado</span>
                      <span className="text-rise-fg">Jan 2025</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Solicitação de contato Column */}
          <div className="flex-shrink-0 w-[300px]">
            <div className="bg-rise-surface border border-rise-line rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[15px]">
                  Solicitação de contato
                </h3>
                <span className="bg-[#ffa50020] text-[#ffa500] px-2 py-0.5 rounded text-[12px] font-['Inter:Semi_Bold',sans-serif]">
                  1
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="bg-rise-raised border border-rise-line rounded-lg p-4 hover:border-[#ffa500] transition-all cursor-pointer">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#14E9BC] to-[#28d939] rounded flex items-center justify-center text-[#0a0a0a] font-['Inter:Bold',sans-serif] text-[14px]">
                      NS
                    </div>
                    <div className="flex-1">
                      <h4 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[14px]">
                        Nova Sistemas Ltda
                      </h4>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-[12px]">
                    <div className="flex justify-between">
                      <span className="text-rise-fg-2">Receita Est.</span>
                      <span className="text-[#14E9BC] font-['Inter:Semi_Bold',sans-serif]">R$ 28.5k</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rise-fg-2">Responsável</span>
                      <span className="text-rise-fg">Carlos Silva</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conversa iniciada Column */}
          <div className="flex-shrink-0 w-[300px]">
            <div className="bg-rise-surface border border-rise-line rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[15px]">
                  Conversa iniciada
                </h3>
                <span className="bg-[#3b82f620] text-[#60a5fa] px-2 py-0.5 rounded text-[12px] font-['Inter:Semi_Bold',sans-serif]">
                  1
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="bg-rise-raised border border-rise-line rounded-lg p-4 hover:border-[#60a5fa] transition-all cursor-pointer">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#14E9BC] to-[#28d939] rounded flex items-center justify-center text-[#0a0a0a] font-['Inter:Bold',sans-serif] text-[14px]">
                      EP
                    </div>
                    <div className="flex-1">
                      <h4 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[14px]">
                        Enterprise Partners
                      </h4>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-[12px]">
                    <div className="flex justify-between">
                      <span className="text-rise-fg-2">Receita Est.</span>
                      <span className="text-[#14E9BC] font-['Inter:Semi_Bold',sans-serif]">R$ 56.8k</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rise-fg-2">Follow-up</span>
                      <span className="text-rise-fg">18 Fev</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Em Avanço Column */}
          <div className="flex-shrink-0 w-[300px]">
            <div className="bg-rise-surface border border-rise-line rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[15px]">
                  Em Avanço
                </h3>
                <span className="bg-[#7c3aed20] text-[#a78bfa] px-2 py-0.5 rounded text-[12px] font-['Inter:Semi_Bold',sans-serif]">
                  1
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="bg-rise-raised border border-rise-line rounded-lg p-4 hover:border-[#a78bfa] transition-all cursor-pointer">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#14E9BC] to-[#28d939] rounded flex items-center justify-center text-[#0a0a0a] font-['Inter:Bold',sans-serif] text-[14px]">
                      DS
                    </div>
                    <div className="flex-1">
                      <h4 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[14px]">
                        Digital Systems SA
                      </h4>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-[12px]">
                    <div className="flex justify-between">
                      <span className="text-rise-fg-2">Receita Est.</span>
                      <span className="text-[#14E9BC] font-['Inter:Semi_Bold',sans-serif]">R$ 32k</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rise-fg-2">Interesse</span>
                      <span className="text-[#a78bfa] font-['Inter:Semi_Bold',sans-serif]">Alto</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Parceria fechada Column */}
          <div className="flex-shrink-0 w-[300px]">
            <div className="bg-rise-surface border border-rise-line rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[15px]">
                  Parceria fechada
                </h3>
                <span className="bg-[#28d93920] text-[#28d939] px-2 py-0.5 rounded text-[12px] font-['Inter:Semi_Bold',sans-serif]">
                  3
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="bg-rise-raised border border-rise-line rounded-lg p-4 hover:border-[#28d939] transition-all cursor-pointer">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#14E9BC] to-[#28d939] rounded flex items-center justify-center text-[#0a0a0a] font-['Inter:Bold',sans-serif] text-[14px]">
                      MC
                    </div>
                    <div className="flex-1">
                      <h4 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[14px]">
                        Mega Corp Brasil
                      </h4>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-[12px]">
                    <div className="flex justify-between">
                      <span className="text-rise-fg-2">Receita/mês</span>
                      <span className="text-[#14E9BC] font-['Inter:Semi_Bold',sans-serif]">R$ 125k</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rise-fg-2">Health Score</span>
                      <span className="text-[#28d939] font-['Inter:Semi_Bold',sans-serif]">95%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-rise-raised border border-rise-line rounded-lg p-4 hover:border-[#28d939] transition-all cursor-pointer">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#14E9BC] to-[#28d939] rounded flex items-center justify-center text-[#0a0a0a] font-['Inter:Bold',sans-serif] text-[14px]">
                      GS
                    </div>
                    <div className="flex-1">
                      <h4 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[14px]">
                        Global Solutions Inc
                      </h4>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-[12px]">
                    <div className="flex justify-between">
                      <span className="text-rise-fg-2">Receita/mês</span>
                      <span className="text-[#14E9BC] font-['Inter:Semi_Bold',sans-serif]">R$ 78.5k</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rise-fg-2">Health Score</span>
                      <span className="text-[#28d939] font-['Inter:Semi_Bold',sans-serif]">88%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-rise-raised border border-rise-line rounded-lg p-4 hover:border-[#28d939] transition-all cursor-pointer">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#14E9BC] to-[#28d939] rounded flex items-center justify-center text-[#0a0a0a] font-['Inter:Bold',sans-serif] text-[14px]">
                      TI
                    </div>
                    <div className="flex-1">
                      <h4 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[14px]">
                        Tech Innovations Ltda
                      </h4>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-[12px]">
                    <div className="flex justify-between">
                      <span className="text-rise-fg-2">Receita/mês</span>
                      <span className="text-[#14E9BC] font-['Inter:Semi_Bold',sans-serif]">R$ 45k</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rise-fg-2">Health Score</span>
                      <span className="text-[#28d939] font-['Inter:Semi_Bold',sans-serif]">92%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
