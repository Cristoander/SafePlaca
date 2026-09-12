import React, { useState } from 'react';
import type { BoardProject } from '../types/board';
import { WatermarkOverlay } from './WatermarkOverlay';
import { notifySecurityViolation } from '../utils/security';
import { ComponentMarkerEditor } from './ComponentMarkerEditor';
import { FaultsTroubleshootingView } from './FaultsTroubleshootingView';
import { NetlistTracerView } from './NetlistTracerView';
import { FpcDiodeGuideView } from './FpcDiodeGuideView';
import { HardwareSolutionsView } from './HardwareSolutionsView';
import { DualViewSplitScreen } from './DualViewSplitScreen';
import { initialNetGroups } from '../data/defaultNets';
import { initialFpcConnectors } from '../data/defaultFpcConnectors';
import { initialJumpers } from '../data/defaultJumpers';
import { 
  X, 
  Tv, 
  Lock, 
  Activity, 
  Layers, 
  ListOrdered, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench,
  Smartphone,
  Cpu,
  Zap,
  Gauge,
  Columns
} from 'lucide-react';

interface BoardDetailModalProps {
  board: BoardProject;
  onClose: () => void;
  onOpenProjector: (board: BoardProject) => void;
  onUpdateBoard?: (board: BoardProject) => void;
}

export const BoardDetailModal: React.FC<BoardDetailModalProps> = ({
  board,
  onClose,
  onOpenProjector,
  onUpdateBoard,
}) => {
  const [activeTab, setActiveTab] = useState<
    'components' | 'netlist' | 'fpc' | 'jumpers' | 'faults' | 'schematic' | 'pinout' | 'bom' | 'notes'
  >('components');
  const [isDualViewOpen, setIsDualViewOpen] = useState(false);

  const handleDownloadAttempt = (type: 'pdf' | 'image') => {
    notifySecurityViolation(
      `download_${type}`,
      `O download de ${type.toUpperCase()} e diagramas foi bloqueado pelo sistema SafePlaca. Os esquemas e mapas de placas são protegidos com marca d'água para visualização em bancada.`
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto select-none no-copy-shield">
        <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
          {/* Header Modal */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-start justify-between gap-4">
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
              {/* Botão Dual-View */}
              <button
                onClick={() => setIsDualViewOpen(true)}
                className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-purple-950"
                title="Abrir Tela Dividida (Foto + Esquema)"
              >
                <Columns className="w-4 h-4" />
                <span className="hidden sm:inline">Dual-View</span>
              </button>

              {/* Botão Projetor */}
              <button
                onClick={() => onOpenProjector(board)}
                className="py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-950"
              >
                <Tv className="w-4 h-4" />
                <span className="hidden sm:inline">Projetor</span>
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
          <div className="px-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex gap-1.5 py-2">
              <button
                onClick={() => setActiveTab('components')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'components'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/50 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Placa &amp; Componentes</span>
              </button>

              <button
                onClick={() => setActiveTab('netlist')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'netlist'
                    ? 'bg-yellow-950 text-yellow-300 border border-yellow-700/50 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span>Malhas Lado A/B</span>
              </button>

              <button
                onClick={() => setActiveTab('fpc')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'fpc'
                    ? 'bg-blue-950 text-blue-300 border border-blue-700/50 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Gauge className="w-3.5 h-3.5 text-blue-400" />
                <span>Conectores FPC (Diode)</span>
              </button>

              <button
                onClick={() => setActiveTab('jumpers')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'jumpers'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                <span>Jumpers &amp; Soluções</span>
              </button>

              <button
                onClick={() => setActiveTab('faults')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'faults'
                    ? 'bg-amber-950 text-amber-300 border border-amber-700/50 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Defeitos Comuns</span>
              </button>

              <button
                onClick={() => setActiveTab('schematic')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'schematic'
                    ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/50 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Esquema Geral</span>
              </button>

              <button
                onClick={() => setActiveTab('pinout')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'pinout'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Pinagem ({board.pinouts.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('bom')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'bom'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>BOM ({board.bom.length})</span>
              </button>
            </div>

            {/* Download Buttons */}
            <div className="hidden lg:flex items-center gap-2 py-2">
              <button
                onClick={() => handleDownloadAttempt('pdf')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-red-400 border border-slate-800 text-xs flex items-center gap-1.5 transition"
                title="Download em PDF protegido"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => handleDownloadAttempt('image')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-red-400 border border-slate-800 text-xs flex items-center gap-1.5 transition"
                title="Download de Imagem protegido"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>PNG</span>
              </button>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
            {/* TAB: Mapeamento de Componentes */}
            {activeTab === 'components' && (
              <ComponentMarkerEditor
                board={board}
                onUpdateMarkers={(markers) => onUpdateBoard && onUpdateBoard({ ...board, markers })}
                onUpdatePhoto={(photoUrl) => onUpdateBoard && onUpdateBoard({ ...board, realPhotoUrl: photoUrl })}
                onUpdateSchematic={(newSvg) => onUpdateBoard && onUpdateBoard({ ...board, schematicSvg: newSvg })}
              />
            )}

            {/* TAB: Malhas Lado A/B */}
            {activeTab === 'netlist' && (
              <NetlistTracerView board={board} netGroups={initialNetGroups} />
            )}

            {/* TAB: Conectores FPC */}
            {activeTab === 'fpc' && (
              <FpcDiodeGuideView connectors={initialFpcConnectors} />
            )}

            {/* TAB: Jumpers & Soluções */}
            {activeTab === 'jumpers' && (
              <HardwareSolutionsView board={board} jumpers={initialJumpers} />
            )}

            {/* TAB: Defeitos Comuns */}
            {activeTab === 'faults' && (
              <FaultsTroubleshootingView
                faults={board.commonFaults || []}
                onAddFault={(fault) => {
                  const updatedFaults = [...(board.commonFaults || []), fault];
                  if (onUpdateBoard) onUpdateBoard({ ...board, commonFaults: updatedFaults });
                }}
                onDeleteFault={(faultId) => {
                  const updatedFaults = (board.commonFaults || []).filter((f) => f.id !== faultId);
                  if (onUpdateBoard) onUpdateBoard({ ...board, commonFaults: updatedFaults });
                }}
              />
            )}

            {/* TAB: Esquema Geral */}
            {activeTab === 'schematic' && (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl p-4">
                  <WatermarkOverlay
                    boardCode={board.watermarkCode || board.modelCode}
                    intensity="normal"
                  />
                  <div 
                    className="w-full flex items-center justify-center pointer-events-none"
                    dangerouslySetInnerHTML={{ __html: board.schematicSvg }}
                  />
                </div>

                {/* Pontos de Teste */}
                <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-4">
                  <h4 className="text-sm font-bold text-white mb-3 font-mono flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Pontos de Teste Chave (Checkpoints de Tensão)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {board.testPoints.map((tp) => (
                      <div key={tp.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-cyan-300 text-xs">{tp.label}</span>
                          <span className="font-mono font-bold text-emerald-400 text-xs bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/60">
                            {tp.expectedVoltage} (±{tp.tolerance})
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">{tp.description}</p>
                        <div className="text-[11px] text-slate-400 mt-1 font-mono">
                          Normal: <span className="text-slate-300">{tp.normalBehavior}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Pinagem */}
            {activeTab === 'pinout' && (
              <div className="border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-mono">
                    <tr>
                      <th className="p-3">Nome</th>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Tensão</th>
                      <th className="p-3">Queda Diode (mV)</th>
                      <th className="p-3">Descrição</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                    {board.pinouts.map((p, i) => (
                      <tr key={i} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-white">{p.name}</td>
                        <td className="p-3">{p.pinType}</td>
                        <td className="p-3 text-emerald-400">{p.voltage}</td>
                        <td className="p-3 text-amber-400">{p.diodeScaleMv ? `${p.diodeScaleMv} mV` : '—'}</td>
                        <td className="p-3 font-sans text-slate-400">{p.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: BOM */}
            {activeTab === 'bom' && (
              <div className="border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-mono">
                    <tr>
                      <th className="p-3">Ref</th>
                      <th className="p-3">Part Number</th>
                      <th className="p-3">Package</th>
                      <th className="p-3">Descrição</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                    {board.bom.map((b, i) => (
                      <tr key={i} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-cyan-400">{b.reference}</td>
                        <td className="p-3 font-bold text-white">{b.partNumber}</td>
                        <td className="p-3">{b.package}</td>
                        <td className="p-3 font-sans text-slate-400">{b.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dual View Split Screen Modal */}
      {isDualViewOpen && (
        <DualViewSplitScreen
          board={board}
          onClose={() => setIsDualViewOpen(false)}
        />
      )}
    </>
  );
};
