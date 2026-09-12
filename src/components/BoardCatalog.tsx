import React, { useState } from 'react';
import type { BoardProject, DeviceFolder } from '../types/board';
import type { UserRole } from '../types/news';
import { BoardCard } from './BoardCard';
import { DEFAULT_FOLDERS } from '../data/folders';
import { 
  Folder, 
  FolderPlus, 
  ArrowLeft, 
  Plus, 
  Smartphone, 
  Cpu, 
  Search, 
  Sparkles, 
  ChevronRight
} from 'lucide-react';

interface BoardCatalogProps {
  boards: BoardProject[];
  onSelectBoard: (board: BoardProject) => void;
  onOpenProjector: (board: BoardProject) => void;
  userRole: UserRole;
  onOpenCreateBoardInFolder: (folderId: string) => void;
}

export const BoardCatalog: React.FC<BoardCatalogProps> = ({
  boards,
  onSelectBoard,
  onOpenProjector,
  userRole,
  onOpenCreateBoardInFolder,
}) => {
  const [folders, setFolders] = useState<DeviceFolder[]>(DEFAULT_FOLDERS.filter(f => f.id !== 'all'));
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Contador de placas por pasta
  const getFolderCount = (folderId: string) => {
    if (folderId === 'samsung') return boards.filter(b => b.folderId === 'samsung' || b.brand?.toLowerCase() === 'samsung').length;
    if (folderId === 'motorola') return boards.filter(b => b.folderId === 'motorola' || b.brand?.toLowerCase() === 'motorola').length;
    if (folderId === 'xiaomi') return boards.filter(b => b.folderId === 'xiaomi' || b.brand?.toLowerCase() === 'xiaomi').length;
    if (folderId === 'apple') return boards.filter(b => b.folderId === 'apple' || b.brand?.toLowerCase() === 'apple').length;
    if (folderId === 'modules') return boards.filter(b => b.folderId === 'modules' || b.category.includes('Carga')).length;
    if (folderId === 'converters') return boards.filter(b => b.folderId === 'converters' || b.category.includes('Conversores')).length;
    return boards.filter(b => b.folderId === folderId).length;
  };

  const handleCreateFolder = () => {
    const name = prompt('Nome da Pasta ou Modelo do Aparelho (Ex: Samsung Galaxy A54 ou Motorola Edge 30):');
    if (!name) return;
    const newFolder: DeviceFolder = {
      id: 'folder-' + Date.now(),
      name,
      brand: name.split(' ')[0] || 'Geral',
    };
    const updated = [...folders, newFolder];
    setFolders(updated);
    setActiveFolderId(newFolder.id);
  };

  const currentFolder = folders.find(f => f.id === activeFolderId);

  // Placas filtradas dentro da pasta
  const folderBoards = activeFolderId
    ? boards.filter(b => {
        let matches = false;
        if (activeFolderId === 'samsung') matches = b.folderId === 'samsung' || b.brand?.toLowerCase() === 'samsung';
        else if (activeFolderId === 'motorola') matches = b.folderId === 'motorola' || b.brand?.toLowerCase() === 'motorola';
        else if (activeFolderId === 'xiaomi') matches = b.folderId === 'xiaomi' || b.brand?.toLowerCase() === 'xiaomi';
        else if (activeFolderId === 'apple') matches = b.folderId === 'apple' || b.brand?.toLowerCase() === 'apple';
        else if (activeFolderId === 'modules') matches = b.folderId === 'modules' || b.category.includes('Carga');
        else if (activeFolderId === 'converters') matches = b.folderId === 'converters' || b.category.includes('Conversores');
        else matches = b.folderId === activeFolderId;

        const matchesSearch = !searchTerm || 
          b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.modelCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.keyChips.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));

        return matches && matchesSearch;
      })
    : [];

  return (
    <div className="space-y-6 no-copy-shield font-mono">
      {/* Banner de Boas-Vindas */}
      <section className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/40 border border-slate-800/90 p-6 lg:p-8 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ORGANIZAÇÃO HIERÁRQUICA DE BANCADA</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white m-0 font-sans">
            Pastas de Aparelhos &amp; Esquemas Técnicos
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Selecione a pasta do modelo desejado (<span className="text-cyan-300 font-bold">Samsung</span>, <span className="text-cyan-300 font-bold">Motorola</span>, <span className="text-cyan-300 font-bold">Xiaomi</span>) para acessar ou cadastrar os projetos de subplacas e placas principais.
          </p>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">PASTAS CRIADAS</span>
            <span className="text-xl font-black text-indigo-400">{folders.length} Pastas</span>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">TOTAL DE PROJETOS</span>
            <span className="text-xl font-black text-white">{boards.length} Placas</span>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">SEU PERFIL ATUAL</span>
            <span className="text-xl font-black text-cyan-400">
              {userRole === 'admin' ? '👑 Admin' : '👤 Cliente'}
            </span>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">BLINDAGEM</span>
            <span className="text-xl font-black text-emerald-400">Ativa</span>
          </div>
        </div>
      </section>

      {/* TELA 1: VISÃO GERAL DAS PASTAS DE APARELHOS (Se nenhuma pasta estiver aberta) */}
      {!activeFolderId ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                Selecione uma Pasta de Aparelho:
              </h2>
            </div>

            {userRole === 'admin' && (
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-950 transition"
              >
                <FolderPlus className="w-4 h-4" />
                <span>+ Nova Pasta de Aparelho</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map((folder) => {
              const count = getFolderCount(folder.id);
              const isModules = folder.id === 'modules' || folder.id === 'converters';
              return (
                <div
                  key={folder.id}
                  onClick={() => setActiveFolderId(folder.id)}
                  className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/60 rounded-3xl p-5 shadow-xl hover:shadow-cyan-950/40 cursor-pointer transition duration-300 hover:-translate-y-1 flex flex-col justify-between group"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 group-hover:border-cyan-500/40 group-hover:bg-cyan-950/30 transition">
                      {isModules ? (
                        <Cpu className="w-7 h-7 text-amber-400 group-hover:scale-110 transition" />
                      ) : (
                        <Smartphone className="w-7 h-7 text-cyan-400 group-hover:scale-110 transition" />
                      )}
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
                      {count} {count === 1 ? 'Projeto' : 'Projetos'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">
                      {folder.brand}
                    </span>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition">
                      {folder.name}
                    </h3>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-cyan-400 font-bold">
                    <span>Abrir pasta de esquemas</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* TELA 2: DENTRO DA PASTA SELECIONADA */
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Barra de Navegação / Breadcrumb */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveFolderId(null);
                  setSearchTerm('');
                }}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition flex items-center gap-1.5 text-xs font-bold"
                title="Voltar para a lista de pastas"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Todas as Pastas</span>
              </button>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">/</span>
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Folder className="w-4 h-4 text-cyan-400" />
                  {currentFolder?.name}
                </span>
                <span className="text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                  {folderBoards.length} {folderBoards.length === 1 ? 'placa' : 'placas'}
                </span>
              </div>
            </div>

            {/* Ações da Pasta */}
            <div className="flex items-center gap-2">
              <div className="relative w-48 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrar nesta pasta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {userRole === 'admin' && (
                <button
                  onClick={() => onOpenCreateBoardInFolder(activeFolderId)}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-950 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Nova Placa Nesta Pasta</span>
                </button>
              )}
            </div>
          </div>

          {/* Grid de Placas da Pasta */}
          {folderBoards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {folderBoards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  onSelect={onSelectBoard}
                  onOpenProjector={onOpenProjector}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-950/60 border border-slate-800 rounded-3xl p-8 space-y-3">
              <Folder className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Nenhum projeto nesta pasta ainda</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {userRole === 'admin'
                  ? 'Como Administrador, você pode criar um novo projeto clicando no botão "+ Nova Placa Nesta Pasta" acima!'
                  : 'Nenhum esquema publicado nesta pasta por enquanto.'}
              </p>
              {userRole === 'admin' && (
                <button
                  onClick={() => onOpenCreateBoardInFolder(activeFolderId)}
                  className="px-4 py-2 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-cyan-950 transition mt-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Criar Primeira Placa Nesta Pasta</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
