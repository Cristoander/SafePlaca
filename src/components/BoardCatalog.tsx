import React, { useState } from 'react';
import type { BoardProject } from '../types/board';
import { BoardCard } from './BoardCard';
import { Search, Cpu, Sparkles } from 'lucide-react';

interface BoardCatalogProps {
  boards: BoardProject[];
  onSelectBoard: (board: BoardProject) => void;
  onOpenProjector: (board: BoardProject) => void;
}

export const BoardCatalog: React.FC<BoardCatalogProps> = ({
  boards,
  onSelectBoard,
  onOpenProjector,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  const categories = ['Todas', 'Carga / Li-ion / BMS', 'Conversores DC-DC', 'Fontes & Alimentação'];

  const filteredBoards = boards.filter((board) => {
    const matchesCategory =
      selectedCategory === 'Todas' || board.category === selectedCategory;
    const matchesSearch =
      board.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      board.modelCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      board.keyChips.some((chip) => chip.toLowerCase().includes(searchTerm.toLowerCase())) ||
      board.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const chargeCount = boards.filter((b) => b.category.includes('Carga')).length;

  return (
    <div className="space-y-8 no-copy-shield">
      {/* Banner de Boas-vindas da Bancada */}
      <section className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/40 border border-slate-800/90 p-6 lg:p-8 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SISTEMA DE BANCADA SEGURO &bull; SAFEPLACA</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white m-0">
            Esquemas, Módulos de Carga &amp; Projetor de Bancada
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Organize esquemas de placas de carga (<span className="text-cyan-300 font-bold">TP4056</span>, <span className="text-cyan-300 font-bold">BMS</span>, conversores), inspecione pontos de teste com valores de multímetro e projete os diagramas em tela cheia com proteção contra download e marca d'água de bancada.
          </p>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block">PROJETOS NO CATÁLOGO</span>
            <span className="text-2xl font-black text-white">{boards.length} Placas</span>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block">MÓDULOS DE CARGA / BMS</span>
            <span className="text-2xl font-black text-emerald-400">{chargeCount} Módulos</span>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-mono text-slate-400 block">PROTEÇÃO DE ARQUIVOS</span>
            <span className="text-2xl font-black text-cyan-400">100% Blindado</span>
          </div>
        </div>
      </section>

      {/* Controles de Busca & Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Barra de Pesquisa */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por placa, chip (ex: TP4056), modelo ou pino..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 shadow-lg"
          />
        </div>

        {/* Abas de Categorias */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Placas */}
      {filteredBoards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBoards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              onSelect={onSelectBoard}
              onOpenProjector={onOpenProjector}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
          <Cpu className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Nenhuma placa encontrada</h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Tente buscar com outro termo ou limpe os filtros de pesquisa.
          </p>
        </div>
      )}
    </div>
  );
};
