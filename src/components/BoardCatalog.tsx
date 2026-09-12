import React, { useState } from 'react';
import type { BoardProject, DeviceFolder } from '../types/board';
import { BoardCard } from './BoardCard';
import { DeviceFolderTree } from './DeviceFolderTree';
import { DEFAULT_FOLDERS } from '../data/folders';
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
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [folders, setFolders] = useState<DeviceFolder[]>(DEFAULT_FOLDERS);

  // Contagem de placas por pasta
  const folderCounts: Record<string, number> = {
    all: boards.length,
    samsung: boards.filter((b) => b.folderId === 'samsung' || b.brand?.toLowerCase() === 'samsung').length,
    motorola: boards.filter((b) => b.folderId === 'motorola' || b.brand?.toLowerCase() === 'motorola').length,
    xiaomi: boards.filter((b) => b.folderId === 'xiaomi' || b.brand?.toLowerCase() === 'xiaomi').length,
    apple: boards.filter((b) => b.folderId === 'apple' || b.brand?.toLowerCase() === 'apple').length,
    modules: boards.filter((b) => b.folderId === 'modules' || b.category.includes('Carga')).length,
    converters: boards.filter((b) => b.folderId === 'converters' || b.category.includes('Conversores')).length,
  };

  const filteredBoards = boards.filter((board) => {
    let matchesFolder = true;
    if (selectedFolderId !== 'all') {
      if (selectedFolderId === 'samsung') matchesFolder = board.folderId === 'samsung' || board.brand?.toLowerCase() === 'samsung';
      else if (selectedFolderId === 'motorola') matchesFolder = board.folderId === 'motorola' || board.brand?.toLowerCase() === 'motorola';
      else if (selectedFolderId === 'xiaomi') matchesFolder = board.folderId === 'xiaomi' || board.brand?.toLowerCase() === 'xiaomi';
      else if (selectedFolderId === 'apple') matchesFolder = board.folderId === 'apple' || board.brand?.toLowerCase() === 'apple';
      else if (selectedFolderId === 'modules') matchesFolder = board.folderId === 'modules' || board.category.includes('Carga');
      else if (selectedFolderId === 'converters') matchesFolder = board.folderId === 'converters' || board.category.includes('Conversores');
      else matchesFolder = board.folderId === selectedFolderId;
    }

    const matchesSearch =
      board.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      board.modelCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (board.deviceModel && board.deviceModel.toLowerCase().includes(searchTerm.toLowerCase())) ||
      board.keyChips.some((chip) => chip.toLowerCase().includes(searchTerm.toLowerCase())) ||
      board.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFolder && matchesSearch;
  });

  const handleCreateNewFolder = () => {
    const folderName = prompt('Nome da nova pasta ou modelo de aparelho (Ex: Motorola Moto G52):');
    if (!folderName) return;
    const newF: DeviceFolder = {
      id: 'custom-' + Date.now(),
      name: folderName,
      brand: folderName,
    };
    setFolders([...folders, newF]);
    setSelectedFolderId(newF.id);
  };

  return (
    <div className="space-y-6 no-copy-shield">
      {/* Banner de Bancada */}
      <section className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/40 border border-slate-800/90 p-6 lg:p-8 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SISTEMA DE BANCADA &bull; SAFEPLACA 2.0</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white m-0">
            Placas de Celulares, Módulos &amp; Diagnóstico de Defeitos
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Organize por pastas de aparelhos (<span className="text-cyan-300 font-bold">Samsung S20 FE</span>, Motorola, Xiaomi), transforme fotos em estilo <span className="text-amber-300 font-bold">Blueprint</span> com 1 clique, mapeie bobinas, conectores e veja como reparar defeitos comuns (condução reversa em mV).
          </p>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block">TOTAL DE PROJETOS</span>
            <span className="text-2xl font-black text-white">{boards.length} Placas</span>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block">PASTAS DE APARELHOS</span>
            <span className="text-2xl font-black text-indigo-400">{folders.length - 1} Marcas</span>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block">MAPA DE COMPONENTES</span>
            <span className="text-2xl font-black text-emerald-400">Ativo</span>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block">ANTI-DOWNLOAD</span>
            <span className="text-2xl font-black text-cyan-400">Blindado</span>
          </div>
        </div>
      </section>

      {/* Árvore de Pastas de Aparelhos */}
      <DeviceFolderTree
        folders={folders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={(id) => setSelectedFolderId(id)}
        onNewFolder={handleCreateNewFolder}
        counts={folderCounts}
      />

      {/* Controles de Busca */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por placa, aparelho (ex: S20 FE), bobina, chip ou modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 shadow-lg"
          />
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
          <h3 className="text-base font-bold text-white">Nenhuma placa encontrada nesta pasta</h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Selecione "Todas as Placas" ou cadastre um novo projeto nesta pasta.
          </p>
        </div>
      )}
    </div>
  );
};
