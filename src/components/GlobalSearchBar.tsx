import React, { useState, useEffect } from 'react';
import { Search, Cpu, Zap, ShoppingBag, ArrowRight, X, Layers } from 'lucide-react';
import type { BoardProject } from '../types/board';
import type { PhysicalProduct } from '../types/store';

interface GlobalSearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  boards: BoardProject[];
  products: PhysicalProduct[];
  onSelectBoard: (board: BoardProject) => void;
  onSelectProduct?: (product: PhysicalProduct) => void;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  isOpen,
  onClose,
  boards,
  products,
  onSelectBoard,
  onSelectProduct
}) => {
  const [query, setQuery] = useState('');

  // Fechar com ESC e focar automático
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  // 1. Filtrar Placas e Dispositivos
  const matchedBoards = cleanQuery
    ? boards.filter(
        b =>
          b.title.toLowerCase().includes(cleanQuery) ||
          b.deviceModel?.toLowerCase().includes(cleanQuery) ||
          b.modelCode.toLowerCase().includes(cleanQuery) ||
          b.keyChips.some(chip => chip.toLowerCase().includes(cleanQuery))
      )
    : [];

  // 2. Filtrar Componentes e CIs
  interface MatchedComponent {
    board: BoardProject;
    markerRef: string;
    markerName: string;
    kind: string;
    voltage?: string;
    diodeMv?: number;
  }
  const matchedComponents: MatchedComponent[] = [];
  if (cleanQuery) {
    boards.forEach(b => {
      b.markers?.forEach(m => {
        if (
          m.reference.toLowerCase().includes(cleanQuery) ||
          m.name.toLowerCase().includes(cleanQuery) ||
          m.functionDesc.toLowerCase().includes(cleanQuery) ||
          m.netName?.toLowerCase().includes(cleanQuery)
        ) {
          matchedComponents.push({
            board: b,
            markerRef: m.reference,
            markerName: m.name,
            kind: m.kind,
            voltage: m.voltage,
            diodeMv: m.diodeScaleMv
          });
        }
      });
    });
  }

  // 3. Matriz de Compatibilidade de CIs (Sucata de Bancada)
  const icMatches: { chipName: string; compatibleBoards: BoardProject[] }[] = [];
  if (cleanQuery.length >= 2) {
    const allChips = Array.from(new Set(boards.flatMap(b => b.keyChips)));
    allChips.forEach(chip => {
      if (chip.toLowerCase().includes(cleanQuery)) {
        const matchingBoards = boards.filter(b => b.keyChips.includes(chip));
        icMatches.push({ chipName: chip, compatibleBoards: matchingBoards });
      }
    });
  }

  // 4. Filtrar Produtos da Loja Física
  const matchedProducts = cleanQuery
    ? products.filter(
        p =>
          p.title.toLowerCase().includes(cleanQuery) ||
          p.code.toLowerCase().includes(cleanQuery) ||
          p.description.toLowerCase().includes(cleanQuery) ||
          p.compatibility?.some(c => c.toLowerCase().includes(cleanQuery))
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Barra de Busca Input */}
        <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por CI (ex: PM7150), Placa, Linha (VBUS), Componente ou Peça..."
            className="flex-1 bg-transparent text-white placeholder-slate-400 text-base focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-slate-400 bg-slate-950 border border-slate-700 rounded font-mono">
            ESC
          </kbd>
        </div>

        {/* Resultados */}
        <div className="p-4 overflow-y-auto space-y-6">
          {!cleanQuery && (
            <div className="py-8 text-center text-slate-400 text-sm">
              <div className="p-3 bg-slate-800/50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-indigo-400">
                <Search className="w-6 h-6" />
              </div>
              <p className="font-medium text-slate-300">O que você está procurando na bancada hoje?</p>
              <p className="text-xs text-slate-500 mt-1">
                Exemplos de busca rápida: <span className="text-indigo-400 cursor-pointer" onClick={() => setQuery('S20 FE')}>S20 FE</span> • <span className="text-indigo-400 cursor-pointer" onClick={() => setQuery('PM7150')}>PM7150</span> • <span className="text-indigo-400 cursor-pointer" onClick={() => setQuery('VBUS')}>VBUS</span> • <span className="text-indigo-400 cursor-pointer" onClick={() => setQuery('Bypass')}>Bypass</span>
              </p>
            </div>
          )}

          {/* Matriz de Compatibilidade de CIs (Sucata) */}
          {icMatches.length > 0 && (
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Cpu className="w-4 h-4" /> Matriz de Compatibilidade de CIs (Sucatas Compatíveis)
              </div>
              <div className="space-y-2">
                {icMatches.map((match, idx) => (
                  <div key={idx} className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white font-mono">{match.chipName}</span>
                      <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                        Encontrado em {match.compatibleBoards.length} placa(s)
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">Placas doadoras para sucata:</div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {match.compatibleBoards.map(b => (
                        <button
                          key={b.id}
                          onClick={() => {
                            onSelectBoard(b);
                            onClose();
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-lg text-xs font-medium transition flex items-center gap-1"
                        >
                          {b.deviceModel || b.title}
                          <ArrowRight className="w-3 h-3 opacity-60" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Placas Encontradas */}
          {matchedBoards.length > 0 && (
            <div>
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> Placas e Dispositivos ({matchedBoards.length})
              </div>
              <div className="space-y-1.5">
                {matchedBoards.map(board => (
                  <div
                    key={board.id}
                    onClick={() => {
                      onSelectBoard(board);
                      onClose();
                    }}
                    className="p-3 bg-slate-800/60 hover:bg-indigo-950/50 hover:border-indigo-500/50 border border-slate-700/60 rounded-xl cursor-pointer transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-white text-sm group-hover:text-indigo-300 transition">
                        {board.deviceModel ? `${board.deviceModel} — ${board.title}` : board.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {board.brand} • Cód: <span className="font-mono">{board.modelCode}</span> • CIs: {board.keyChips.slice(0, 3).join(', ')}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-1 transition" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Componentes / Pinos Encontrados */}
          {matchedComponents.length > 0 && (
            <div>
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> Componentes & Pontos Mapeados ({matchedComponents.length})
              </div>
              <div className="space-y-1.5">
                {matchedComponents.slice(0, 8).map((c, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      onSelectBoard(c.board);
                      onClose();
                    }}
                    className="p-2.5 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 rounded-xl cursor-pointer transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                        {c.markerRef}
                      </span>
                      <span className="text-xs text-slate-200">{c.markerName}</span>
                      <span className="text-[10px] text-slate-400">em {c.board.deviceModel || c.board.title}</span>
                    </div>
                    {c.diodeMv !== undefined && (
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded">
                        {c.diodeMv} mV
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Produtos Físicos da Loja */}
          {matchedProducts.length > 0 && (
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4" /> Produtos Físicos na SafePlaca Store ({matchedProducts.length})
              </div>
              <div className="space-y-1.5">
                {matchedProducts.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (onSelectProduct) onSelectProduct(p);
                      onClose();
                    }}
                    className="p-3 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/30 rounded-xl cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white text-sm">{p.title}</div>
                      <div className="text-xs text-slate-400">Cód: {p.code} • R$ {p.price.toFixed(2)}</div>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold">
                      Ver Produto
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
