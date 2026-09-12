import { useState, useEffect } from 'react';
import type { BoardProject } from './types/board';
import { DEFAULT_BOARDS } from './data/defaultBoards';
import { Navbar } from './components/Navbar';
import { BoardCatalog } from './components/BoardCatalog';
import { BoardDetailModal } from './components/BoardDetailModal';
import { BoardEditorModal } from './components/BoardEditorModal';
import { ProjectorView } from './components/ProjectorView';
import { SecurityAlertModal } from './components/SecurityAlertModal';
import { initWorkbenchProtection } from './utils/security';

const STORAGE_KEY = 'safeplaca_boards_v1';

export function App() {
  const [boards, setBoards] = useState<BoardProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignora erro de parse
    }
    return DEFAULT_BOARDS;
  });

  const [selectedBoard, setSelectedBoard] = useState<BoardProject | null>(null);
  const [projectorBoard, setProjectorBoard] = useState<BoardProject | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'catalog' | 'projector'>('catalog');

  // Inicializa blindagem de bancada (anti-download, bloqueio de contextmenu e atalhos)
  useEffect(() => {
    const cleanupProtection = initWorkbenchProtection();
    return cleanupProtection;
  }, []);

  // Salva no LocalStorage
  const handleSaveBoard = (newBoard: BoardProject) => {
    const updated = [newBoard, ...boards];
    setBoards(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Erro ao salvar no storage:', err);
    }
    setSelectedBoard(newBoard);
  };

  const handleOpenProjector = (board: BoardProject) => {
    setProjectorBoard(board);
    setCurrentView('projector');
  };

  const handleCloseProjector = () => {
    setCurrentView('catalog');
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col no-copy-shield selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Alerta de Segurança e Bloqueio Global */}
      <SecurityAlertModal />

      {/* Navbar Superior */}
      <Navbar
        currentView={currentView}
        onViewChange={(view) => {
          if (view === 'projector') {
            setProjectorBoard(selectedBoard || boards[0]);
          }
          setCurrentView(view);
        }}
        selectedBoard={selectedBoard || boards[0]}
        onOpenCreateModal={() => setIsEditorOpen(true)}
      />

      {/* Área Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <BoardCatalog
          boards={boards}
          onSelectBoard={(board) => setSelectedBoard(board)}
          onOpenProjector={handleOpenProjector}
        />
      </main>

      {/* Rodapé Seguro */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 py-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>SafePlaca &bull; Sistema de Gestão de Módulos &amp; Esquemas Elétricos</span>
          <span className="text-red-400/80 font-bold">🔒 Marca d'água permanente ativa. Download de PDF e esquemas bloqueado.</span>
        </div>
      </footer>

      {/* Modal de Detalhes da Placa */}
      {selectedBoard && (
        <BoardDetailModal
          board={selectedBoard}
          onClose={() => setSelectedBoard(null)}
          onOpenProjector={(board) => {
            setSelectedBoard(null);
            handleOpenProjector(board);
          }}
        />
      )}

      {/* Modal de Cadastro de Nova Placa */}
      {isEditorOpen && (
        <BoardEditorModal
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveBoard}
        />
      )}

      {/* Modo Projetor em Tela Cheia */}
      {currentView === 'projector' && projectorBoard && (
        <ProjectorView
          board={projectorBoard}
          onClose={handleCloseProjector}
        />
      )}
    </div>
  );
}

export default App;
