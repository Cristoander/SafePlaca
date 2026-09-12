import React, { useState } from 'react';
import type { BoardProject } from '../types/board';
import { WatermarkOverlay } from './WatermarkOverlay';
import { notifySecurityViolation } from '../utils/security';
import { ComponentMarkerEditor } from './ComponentMarkerEditor';
import { FaultsTroubleshootingView } from './FaultsTroubleshootingView';
import { 
  X, 
  Tv, 
  Lock, 
  Activity, 
  Layers, 
  ListOrdered, 
  AlertTriangle, 
  CheckCircle2, 
  Flame,
  Wrench,
  Smartphone,
  Cpu
} from 'lucide-react';

interface BoardDetailModalProps {
  board: BoardProject;
  onClose: () => void;
  onOpenProjector: (board: BoardProject) => void;
}

export const BoardDetailModal: React.FC<BoardDetailModalProps> = ({
  board,
  onClose,
  onOpenProjector,
}) => {
  const [activeTab, setActiveTab] = useState<'components' | 'faults' | 'schematic' | 'pinout' | 'bom' | 'notes'>('components');

  const handleDownloadAttempt = (type: 'pdf' | 'image') => {
    notifySecurityViolation(
      `download_${type}`,
      `O download de ${type.toUpperCase()} e diagramas foi bloqueado pelo sistema SafePlaca. Os esquemas e mapas de placas são protegidos com marca d'água para visualização em bancada.`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto select-none no-copy-shield">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                {board.modelCode}
              </span>
              {board.deviceModel && (
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800/60 flex items-center gap-1 font-bold">
                  <Smartphone className="w-3 h-3 text-indigo-400" />
                  {board.deviceModel}
                </span>
              )}
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {board.category}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {board.status.toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {board.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              {board.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenProjector(board)}
              className="py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-950"
            >
              <Tv className="w-4 h-4" />
              <span className="hidden sm:inline">Modo Projetor</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="px-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex gap-2 py-2">
            <button
              onClick={() => setActiveTab('components')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition flex items-center gap-2 ${
                activeTab === 'components'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/50 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Placa &amp; Componentes</span>
            </button>

            <button
              onClick={() => setActiveTab('faults')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition flex items-center gap-2 ${
                activeTab === 'faults'
                  ? 'bg-amber-950 text-amber-300 border border-amber-700/50 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Defeitos &amp; Como Arrumar</span>
            </button>

            <button
              onClick={() => setActiveTab('schematic')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition flex items-center gap-2 ${
                activeTab === 'schematic'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/50 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Esquema Geral</span>
            </button>

            <button
              onClick={() => setActiveTab('pinout')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition flex items-center gap-2 ${
                activeTab === 'pinout'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Pinagem ({board.pinouts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('bom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition flex items-center gap-2 ${
                activeTab === 'bom'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>BOM ({board.bom.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition flex items-center gap-2 ${
                activeTab === 'notes'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Alertas</span>
            </button>
          </div>

          {/* Botões protegidos de download */}
          <div className="flex items-center gap-2 py-2">
            <button
              onClick={() => handleDownloadAttempt('pdf')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 border border-slate-800 text-xs font-mono flex items-center gap-1.5 transition"
              title="Download em PDF protegido"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Baixar PDF</span>
            </button>
            <button
              onClick={() => handleDownloadAttempt('image')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 border border-slate-800 text-xs font-mono flex items-center gap-1.5 transition"
              title="Download de Imagem protegido"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Baixar PNG</span>
            </button>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB: Mapeamento de Componentes (Foto / Blueprint / Raio-X) */}
          {activeTab === 'components' && (
            <ComponentMarkerEditor board={board} />
          )}

          {/* TAB: Defeitos Comuns & Soluções */}
          {activeTab === 'faults' && (
            <FaultsTroubleshootingView
              faults={board.commonFaults || []}
              
            />
          )}

          {/* TAB: Esquema Elétrico */}
          {activeTab === 'schematic' && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl p-4">
                <WatermarkOverlay boardCode={board.modelCode} intensity="normal" />
                <div 
                  className="w-full flex items-center justify-center pointer-events-none"
                  dangerouslySetInnerHTML={{ __html: board.schematicSvg }}
                />
              </div>

              {/* Pontos de Teste */}
              <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-4">
                <h4 className="text-sm font-bold text-white mb-3 font-mono flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  PONTOS DE TESTE EM BANCADA (COM MULTÍMETRO):
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {board.testPoints.map((tp) => (
                    <div key={tp.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-cyan-400">{tp.id}: {tp.label}</span>
                        <div className="flex items-center gap-2">
                          {tp.diodeScaleMv && (
                            <span className="text-[10px] text-amber-300 font-bold bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
                              {tp.diodeScaleMv} mV
                            </span>
                          )}
                          <span className="text-cyan-300 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                            {tp.expectedVoltage}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-400 text-[11px] mb-1">{tp.description}</p>
                      <p className="text-emerald-400/90 text-[10px]">Normal: {tp.normalBehavior}</p>
                      <p className="text-red-400/90 text-[10px]">Defeito: {tp.faultSymptom}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Pinagem & Conexões */}
          {activeTab === 'pinout' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {board.pinouts.map((pin, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full ring-2 ring-slate-800 shadow"
                          style={{ backgroundColor: pin.wireColorHex || '#38bdf8' }}
                        />
                        <span className="font-mono font-bold text-white text-sm">{pin.name}</span>
                      </div>
                      {pin.diodeScaleMv && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold border border-amber-800/40">
                          {pin.diodeScaleMv} mV
                        </span>
                      )}
                    </div>

                    <div className="bg-slate-900 p-2 rounded-lg font-mono text-xs text-cyan-300 font-bold">
                      Tensão Nominal: {pin.voltage}
                    </div>

                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      {pin.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Componentes BOM */}
          {activeTab === 'bom' && (
            <div className="space-y-4">
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden font-mono text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Ref</th>
                      <th className="p-3.5">Part Number / CI</th>
                      <th className="p-3.5">Encapsulamento</th>
                      <th className="p-3.5">Função no Circuito</th>
                      <th className="p-3.5">Especificação Crítica</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {board.bom.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40 transition">
                        <td className="p-3.5 font-bold text-cyan-400">{item.reference}</td>
                        <td className="p-3.5 font-bold text-white">{item.partNumber}</td>
                        <td className="p-3.5 text-slate-300">{item.package}</td>
                        <td className="p-3.5 text-slate-400 font-sans text-xs">{item.description}</td>
                        <td className="p-3.5 text-amber-400">{item.criticalSpec || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: Notas e Alertas de Bancada */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="space-y-2.5">
                {board.benchNotes.map((note, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 text-xs text-slate-300 flex items-start gap-3"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>

              {board.progTable && (
                <div className="mt-6 bg-slate-950 rounded-2xl border border-slate-800 p-4">
                  <h4 className="text-sm font-bold text-white mb-2 font-mono text-amber-400">
                    TABELA DE PROGRAMAÇÃO DE CORRENTE (Rprog):
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
                    {board.progTable.map((pt, idx) => (
                      <div key={idx} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-cyan-300 font-bold block">{pt.resistor}</span>
                        <span className="text-amber-400 font-bold block">{pt.current}</span>
                        {pt.notes && <span className="text-[10px] text-slate-400 block mt-1">{pt.notes}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer com Aviso de Segurança */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Marca d'Água Ativa • Arquivo Criptografado no Navegador</span>
          </div>
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
