import React, { useState } from 'react';
import { Columns, ZoomIn, ZoomOut, RotateCcw, Zap, X, Eye } from 'lucide-react';
import type { BoardProject, BoardComponentMarker } from '../types/board';
import { WatermarkOverlay } from './WatermarkOverlay';

interface DualViewSplitScreenProps {
  board: BoardProject;
  onClose: () => void;
}

export const DualViewSplitScreen: React.FC<DualViewSplitScreenProps> = ({ board, onClose }) => {
  const [selectedMarker, setSelectedMarker] = useState<BoardComponentMarker | null>(
    board.markers?.[0] || null
  );
  const [zoomLeft, setZoomLeft] = useState(1);
  const [zoomRight, setZoomRight] = useState(1);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-fadeIn select-none">
      {/* Top Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
            <Columns className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              Modo Tela Dividida Sincronizada (Dual-View)
              <span className="text-xs font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
                {board.deviceModel || board.title}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Foto Real da Placa à esquerda | Esquema Elétrico & Pontos de Teste à direita
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {selectedMarker && (
            <div className="hidden md:flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400">Selecionado:</span>
              <span className="font-mono font-bold text-purple-400">{selectedMarker.reference}</span>
              <span className="text-slate-200">({selectedMarker.name})</span>
              {selectedMarker.voltage && (
                <span className="text-emerald-400 font-mono">{selectedMarker.voltage}</span>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Split Workspaces */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Pane: Real Photo with Markers */}
        <div className="flex-1 bg-slate-950 border-r border-slate-800 relative flex flex-col overflow-hidden">
          {/* Header Painel Esquerdo */}
          <div className="p-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between px-4">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-400" /> Foto Real de Bancada
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomLeft(z => Math.max(0.8, z - 0.2))}
                className="p-1 text-slate-400 hover:text-white"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-slate-400 font-mono w-10 text-center">
                {Math.round(zoomLeft * 100)}%
              </span>
              <button
                onClick={() => setZoomLeft(z => Math.min(2.5, z + 0.2))}
                className="p-1 text-slate-400 hover:text-white"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLeft(1)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Canvas Foto */}
          <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
            <div
              className="relative max-w-full max-h-full transition-transform duration-150"
              style={{ transform: `scale(${zoomLeft})` }}
            >
              {board.realPhotoUrl ? (
                <img
                  src={board.realPhotoUrl}
                  alt={board.title}
                  className="max-h-[550px] w-auto object-contain rounded-xl shadow-2xl"
                  style={{
                    filter: board.visualStyle === 'blueprint' 
                      ? 'invert(1) hue-rotate(190deg) contrast(1.4)' 
                      : board.visualStyle === 'xray' 
                      ? 'invert(1) grayscale(1) contrast(2)' 
                      : 'none'
                  }}
                />
              ) : (
                <div
                  className="w-[500px] h-[350px] bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500"
                  dangerouslySetInnerHTML={{ __html: board.schematicSvg }}
                />
              )}

              <WatermarkOverlay
                boardCode={board.watermarkCode || board.modelCode}
                intensity="normal"
              />

              {/* Markers */}
              {board.markers?.map(m => {
                const isSelected = selectedMarker?.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMarker(m)}
                    style={{
                      left: `${m.xPercent}%`,
                      top: `${m.yPercent}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`absolute z-20 cursor-pointer transition-all flex items-center justify-center ${
                      isSelected
                        ? 'w-9 h-9 rounded-full bg-purple-600 border-2 border-white text-white font-bold text-xs shadow-2xl scale-125 animate-pulse'
                        : 'w-7 h-7 rounded-full bg-slate-900/80 border border-purple-400 text-purple-300 hover:scale-110 text-[10px] font-bold'
                    }`}
                  >
                    {m.reference.substring(0, 2)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Pane: Schematic & Technical Test Points */}
        <div className="flex-1 bg-slate-900/60 relative flex flex-col overflow-hidden">
          <div className="p-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between px-4">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-400" /> Esquema & Pontos de Teste Sincronizados
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomRight(z => Math.max(0.8, z - 0.2))}
                className="p-1 text-slate-400 hover:text-white"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-slate-400 font-mono w-10 text-center">
                {Math.round(zoomRight * 100)}%
              </span>
              <button
                onClick={() => setZoomRight(z => Math.min(2.5, z + 0.2))}
                className="p-1 text-slate-400 hover:text-white"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomRight(1)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
            {/* Detalhe do Componente Selecionado */}
            {selectedMarker ? (
              <div className="p-4 bg-purple-950/40 border border-purple-500/30 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-lg text-white bg-purple-600/30 px-2.5 py-1 rounded-lg border border-purple-500/40">
                      {selectedMarker.reference}
                    </span>
                    <div>
                      <div className="font-bold text-white text-sm">{selectedMarker.name}</div>
                      <div className="text-xs text-purple-300">{selectedMarker.functionDesc}</div>
                    </div>
                  </div>
                  {selectedMarker.diodeScaleMv !== undefined && (
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase">Queda Diode</div>
                      <div className="font-mono font-bold text-emerald-400 text-base">
                        {selectedMarker.diodeScaleMv} mV
                      </div>
                    </div>
                  )}
                </div>

                {selectedMarker.voltage && (
                  <div className="mt-3 text-xs text-slate-300">
                    Tensão Nominal:{' '}
                    <span className="font-mono font-bold text-emerald-400">{selectedMarker.voltage}</span>
                  </div>
                )}

                {selectedMarker.faultSymptom && (
                  <div className="mt-2 text-xs text-amber-300 bg-amber-950/30 p-2.5 rounded-xl border border-amber-500/20">
                    ⚠️ <strong>Sintoma se falhar:</strong> {selectedMarker.faultSymptom}
                  </div>
                )}
                {selectedMarker.repairTip && (
                  <div className="mt-2 text-xs text-emerald-300 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-500/20">
                    💡 <strong>Dica de Reparo:</strong> {selectedMarker.repairTip}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-800/40 rounded-xl text-xs text-slate-400 text-center">
                Clique em qualquer componente na placa à esquerda para sincronizar a análise técnica.
              </div>
            )}

            {/* Esquema Técnico Vetorial */}
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-center min-h-[300px] overflow-hidden">
              <div
                className="w-full max-w-[450px] transition-transform duration-150"
                style={{ transform: `scale(${zoomRight})` }}
                dangerouslySetInnerHTML={{ __html: board.schematicSvg }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
