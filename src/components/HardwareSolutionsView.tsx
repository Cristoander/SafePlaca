import React, { useState } from 'react';
import { Wrench, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { HardwareSolutionJumper } from '../types/jumpers';
import type { BoardProject } from '../types/board';
import { WatermarkOverlay } from './WatermarkOverlay';

interface HardwareSolutionsViewProps {
  board: BoardProject;
  jumpers: HardwareSolutionJumper[];
}

export const HardwareSolutionsView: React.FC<HardwareSolutionsViewProps> = ({ board, jumpers }) => {
  const currentBoardJumpers = jumpers.filter(j => j.boardId === board.id);
  const [selectedJumperId, setSelectedJumperId] = useState<string>(currentBoardJumpers[0]?.id || '');

  const activeJumper = currentBoardJumpers.find(j => j.id === selectedJumperId) || currentBoardJumpers[0];

  if (!activeJumper) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
        Nenhum jumper ou solução de hardware cadastrada para este modelo ainda.
      </div>
    );
  }

  const currentPhoto = activeJumper.side === 'A' 
    ? (board.realPhotoUrl || '') 
    : (board.realPhotoBackUrl || board.realPhotoUrl || '');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[750px]">
      {/* Top Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-bold flex items-center gap-2">
              Soluções de Hardware & Reconstrução de Trilhas (Jumpers)
            </h3>
            <p className="text-xs text-slate-400">
              Guias ilustrados de recuperação de ilhas arrancadas e linhas rompidas
            </p>
          </div>
        </div>
        <span className="text-xs font-mono bg-slate-800 text-emerald-400 px-3 py-1 rounded-full border border-slate-700">
          {currentBoardJumpers.length} Soluções Disponíveis
        </span>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left List of Solutions */}
        <div className="w-full md:w-80 bg-slate-950/80 border-r border-slate-800 p-3 flex flex-col gap-2 overflow-y-auto">
          <div className="text-xs uppercase font-bold text-slate-400 px-2 py-1">Soluções Mapeadas</div>
          {currentBoardJumpers.map(j => {
            const isSelected = j.id === activeJumper.id;
            return (
              <div
                key={j.id}
                onClick={() => setSelectedJumperId(j.id)}
                className={`p-3 rounded-xl border cursor-pointer transition text-left ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    j.category === 'carga' ? 'bg-amber-950 text-amber-300' :
                    j.category === 'audio' ? 'bg-cyan-950 text-cyan-300' :
                    j.category === 'power' ? 'bg-red-950 text-red-300' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {j.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">Lado {j.side}</span>
                </div>
                <div className="font-bold text-white text-xs mt-1.5 line-clamp-2">{j.title}</div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <span>Fio: {j.wireSpec}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center/Right Board Canvas with Jumper Wire Draw & Step-by-Step */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {/* Top Info Banner of the Active Jumper */}
          <div className="p-4 bg-slate-900/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="text-white font-bold text-sm">{activeJumper.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5">Sintoma: {activeJumper.symptom}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-lg">
                Fio recomendado: {activeJumper.wireSpec}
              </span>
            </div>
          </div>

          {/* Placa com Jumper Traçado */}
          <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden select-none">
            <div className="relative max-w-full max-h-full aspect-video flex items-center justify-center">
              {currentPhoto ? (
                <img
                  src={currentPhoto}
                  alt={`Placa ${board.title} - Jumper`}
                  className="max-h-[460px] w-auto object-contain rounded-xl shadow-2xl border border-slate-800"
                />
              ) : (
                <div 
                  className="w-[500px] h-[350px] bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500"
                  dangerouslySetInnerHTML={{ __html: board.schematicSvg }}
                />
              )}

              {/* Watermark */}
              <WatermarkOverlay
                boardCode={board.watermarkCode || board.modelCode}
                intensity="normal"
              />

              {/* SVG Jumper Wire Overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                {activeJumper.points.length > 1 && (
                  <path
                    d={`M ${activeJumper.points.map(p => `${p.xPercent}% ${p.yPercent}%`).join(' L ')}`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      filter: 'drop-shadow(0 0 10px #10b981)'
                    }}
                  />
                )}
              </svg>

              {/* Pontos Inicial e Final */}
              {activeJumper.points.map((pt, idx) => (
                <div
                  key={idx}
                  style={{
                    left: `${pt.xPercent}%`,
                    top: `${pt.yPercent}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute z-20 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xl border-2 ${
                    idx === 0
                      ? 'bg-amber-500 border-white text-black animate-pulse'
                      : idx === activeJumper.points.length - 1
                      ? 'bg-emerald-500 border-white text-black animate-pulse'
                      : 'bg-slate-900 border-emerald-400 text-white w-4 h-4'
                  }`}
                >
                  {idx === 0 ? 'A' : idx === activeJumper.points.length - 1 ? 'B' : ''}
                </div>
              ))}
            </div>
          </div>

          {/* Painel Inferior: Instruções Passo a Passo */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 max-h-48 overflow-y-auto">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Instruções de Execução na Bancada:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
              {activeJumper.instructions.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px] border border-emerald-500/30">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            {activeJumper.warningTip && (
              <div className="mt-2.5 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Atenção: {activeJumper.warningTip}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
