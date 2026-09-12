import React from 'react';
import type { BoardProject } from '../types/board';
import { Zap, Tv, Eye, BatteryCharging } from 'lucide-react';

interface BoardCardProps {
  board: BoardProject;
  onSelect: (board: BoardProject) => void;
  onOpenProjector: (board: BoardProject) => void;
}

export const BoardCard: React.FC<BoardCardProps> = ({
  board,
  onSelect,
  onOpenProjector,
}) => {
  const isChargeBoard = board.category.toLowerCase().includes('carga') || board.tags.some(t => t.toLowerCase().includes('li-ion'));

  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-cyan-950/40 hover:-translate-y-1 flex flex-col no-copy-shield">
      {/* Top Banner & Category */}
      <div className="p-5 pb-4 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 to-slate-950 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
              {board.modelCode}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {board.category}
            </span>
          </div>
          <h3 className="font-bold text-white text-base leading-snug line-clamp-2">
            {board.title}
          </h3>
        </div>

        {isChargeBoard ? (
          <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 shrink-0">
            <BatteryCharging className="w-5 h-5" />
          </div>
        ) : (
          <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Miniatura com Marca d'Água */}
      <div 
        onClick={() => onSelect(board)}
        className="relative h-44 bg-slate-950 overflow-hidden cursor-pointer group border-b border-slate-800/60"
      >
        {/* SVG Renderizado */}
        <div 
          className="w-full h-full flex items-center justify-center p-2 opacity-90 group-hover:scale-105 group-hover:opacity-100 transition duration-300 pointer-events-none"
          dangerouslySetInnerHTML={{ __html: board.schematicSvg }}
        />

        {/* Marca d'água sutil no card */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25">
          <span className="font-mono text-xs text-red-400 tracking-widest rotate-[-25deg] font-black border border-red-500/30 px-3 py-1 bg-black/40">
            SAFEPLACA PROTECTED
          </span>
        </div>

        {/* Overlay hover */}
        <div className="absolute inset-0 bg-cyan-950/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center backdrop-blur-[1px]">
          <span className="px-3 py-1.5 rounded-lg bg-slate-900/90 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 shadow-lg border border-cyan-500/30">
            <Eye className="w-3.5 h-3.5" />
            Inspecionar Esquema
          </span>
        </div>
      </div>

      {/* Especificações Técnicas */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] block">TENSÃO ENTRADA</span>
            <span className="font-bold text-white">{board.vinMin}V - {board.vinMax}V</span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] block">CORRENTE MÁX</span>
            <span className="font-bold text-amber-400">{board.iMax} A</span>
          </div>
        </div>

        {/* Chips Principais */}
        <div>
          <span className="text-[10px] text-slate-400 font-mono block mb-1.5">CIs E COMPONENTES-CHAVE:</span>
          <div className="flex flex-wrap gap-1.5">
            {board.keyChips.map((chip, idx) => (
              <span key={idx} className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-cyan-300 border border-slate-700">
                {chip}
              </span>
            ))}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="pt-2 flex items-center gap-2 border-t border-slate-800/80">
          <button
            onClick={() => onSelect(board)}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5 border border-slate-700"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Detalhes &amp; Pinagem</span>
          </button>
          <button
            onClick={() => onOpenProjector(board)}
            className="py-2 px-3 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-950/50"
            title="Abrir no Projetor de Bancada"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Projetor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
