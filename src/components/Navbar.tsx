import React from 'react';
import { Cpu, ShieldCheck, Tv, PlusCircle } from 'lucide-react';
import type { BoardProject } from '../types/board';

interface NavbarProps {
  currentView: 'catalog' | 'projector';
  onViewChange: (view: 'catalog' | 'projector') => void;
  selectedBoard: BoardProject | null;
  onOpenCreateModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  selectedBoard,
  onOpenCreateModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md px-4 lg:px-8 py-3 select-none no-copy-shield">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Marca */}
        <div 
          onClick={() => onViewChange('catalog')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-900/30 group-hover:scale-105 transition">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">Safe<span className="text-cyan-400">Placa</span></span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-semibold">BANCADA v2.4</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">Gestão de Esquemas &amp; Módulos de Carga</p>
          </div>
        </div>

        {/* Status de Segurança Ativo */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Proteção Ativa: Marca d'Água &amp; Anti-Download</span>
        </div>

        {/* Ações e Navegação */}
        <div className="flex items-center gap-2 sm:gap-3">
          {selectedBoard && (
            <button
              onClick={() => onViewChange(currentView === 'projector' ? 'catalog' : 'projector')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shadow-lg ${
                currentView === 'projector'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/50'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/50'
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>{currentView === 'projector' ? 'Sair do Projetor' : 'Modo Projetor'}</span>
            </button>
          )}

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition"
          >
            <PlusCircle className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Nova Placa</span>
          </button>
        </div>
      </div>
    </header>
  );
};
