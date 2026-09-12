import { useState, useEffect } from 'react';
import type { BoardProject } from './types/board';
import type { NewsAnnouncement, UserRole } from './types/news';
import { DEFAULT_BOARDS } from './data/defaultBoards';
import { DEFAULT_NEWS } from './data/defaultNews';
import { Navbar } from './components/Navbar';
import { BoardCatalog } from './components/BoardCatalog';
import { BoardDetailModal } from './components/BoardDetailModal';
import { BoardEditorModal } from './components/BoardEditorModal';
import { ProjectorView } from './components/ProjectorView';
import { SecurityAlertModal } from './components/SecurityAlertModal';
import { NewsModal } from './components/NewsModal';
import { initWorkbenchProtection } from './utils/security';

const STORAGE_BOARDS_KEY = 'safeplaca_boards_v1';
const STORAGE_NEWS_KEY = 'safeplaca_news_v1';
const STORAGE_LAST_SEEN_KEY = 'safeplaca_last_seen_news_v1';
const STORAGE_ROLE_KEY = 'safeplaca_user_role_v1';

export function App() {
  const [boards, setBoards] = useState<BoardProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BOARDS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignora erro
    }
    return DEFAULT_BOARDS;
  });

  const [newsList, setNewsList] = useState<NewsAnnouncement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_NEWS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignora erro
    }
    return DEFAULT_NEWS;
  });

  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ROLE_KEY);
      if (saved === 'admin' || saved === 'user') return saved;
    } catch {
      // Ignora erro
    }
    return 'admin'; // Padrão admin inicial para o criador
  });

  const [selectedBoard, setSelectedBoard] = useState<BoardProject | null>(null);
  const [projectorBoard, setProjectorBoard] = useState<BoardProject | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [targetFolderForNewBoard, setTargetFolderForNewBoard] = useState<string | undefined>(undefined);
  const [currentView, setCurrentView] = useState<'catalog' | 'projector'>('catalog');
  const [isNewsOpen, setIsNewsOpen] = useState<boolean>(false);
  const [hasUnreadNews, setHasUnreadNews] = useState<boolean>(false);

  // Inicializa blindagem de bancada
  useEffect(() => {
    const cleanupProtection = initWorkbenchProtection();
    return cleanupProtection;
  }, []);

  // Verifica se há novidades não lidas e abre pop-up automaticamente
  useEffect(() => {
    try {
      const lastSeenId = localStorage.getItem(STORAGE_LAST_SEEN_KEY);
      const latestNewsId = newsList[0]?.id;
      if (latestNewsId && lastSeenId !== latestNewsId) {
        setIsNewsOpen(true);
        setHasUnreadNews(true);
      }
    } catch {
      // Ignora
    }
  }, [newsList]);

  // Alternador de Perfil (Admin vs Usuário)
  const handleToggleRole = () => {
    if (userRole === 'admin') {
      setUserRole('user');
      localStorage.setItem(STORAGE_ROLE_KEY, 'user');
      alert('Você entrou no Modo Cliente / Usuário (apenas visualização segura da bancada).');
    } else {
      const pin = prompt('Digite o PIN de Administrador (Padrão: 1234):');
      if (pin === '1234') {
        setUserRole('admin');
        localStorage.setItem(STORAGE_ROLE_KEY, 'admin');
        alert('Acesso Administrador concedido! Agora você pode criar pastas, placas, subir fotos e cadastrar defeitos.');
      } else if (pin !== null) {
        alert('PIN incorreto! Acesso de administrador negado.');
      }
    }
  };

  // Atualiza placa no LocalStorage
  const handleUpdateBoard = (updatedBoard: BoardProject) => {
    const updated = boards.map((b) => (b.id === updatedBoard.id ? updatedBoard : b));
    setBoards(updated);
    try {
      localStorage.setItem(STORAGE_BOARDS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Erro ao salvar:', err);
    }
    setSelectedBoard(updatedBoard);
    if (projectorBoard?.id === updatedBoard.id) {
      setProjectorBoard(updatedBoard);
    }
  };

  // Salva nova placa no LocalStorage
  const handleSaveBoard = (newBoard: BoardProject) => {
    const updated = [newBoard, ...boards];
    setBoards(updated);
    try {
      localStorage.setItem(STORAGE_BOARDS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Erro ao salvar:', err);
    }
    setSelectedBoard(newBoard);
  };

  // Salva nova notícia
  const handleAddNews = (newNews: NewsAnnouncement) => {
    const updated = [newNews, ...newsList];
    setNewsList(updated);
    try {
      localStorage.setItem(STORAGE_NEWS_KEY, JSON.stringify(updated));
      localStorage.setItem(STORAGE_LAST_SEEN_KEY, newNews.id);
    } catch (err) {
      console.warn('Erro ao salvar notícia:', err);
    }
    setHasUnreadNews(false);
  };

  const handleCloseNews = () => {
    setIsNewsOpen(false);
    setHasUnreadNews(false);
    if (newsList[0]?.id) {
      localStorage.setItem(STORAGE_LAST_SEEN_KEY, newsList[0].id);
    }
  };

  const handleOpenCreateInFolder = (folderId: string) => {
    setTargetFolderForNewBoard(folderId);
    setIsEditorOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col no-copy-shield selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Alerta de Segurança e Bloqueio Global */}
      <SecurityAlertModal />

      {/* Mural de Novidades Automático */}
      <NewsModal
        isOpen={isNewsOpen}
        onClose={handleCloseNews}
        newsList={newsList}
        userRole={userRole}
        onAddNews={handleAddNews}
      />

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
        onOpenCreateModal={() => {
          setTargetFolderForNewBoard(undefined);
          setIsEditorOpen(true);
        }}
        userRole={userRole}
        onToggleRole={handleToggleRole}
        onOpenNews={() => setIsNewsOpen(true)}
        unreadNews={hasUnreadNews}
      />

      {/* Área Principal: Navegação Hierárquica por Pastas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <BoardCatalog
          boards={boards}
          onSelectBoard={(board) => setSelectedBoard(board)}
          onOpenProjector={(board) => {
            setProjectorBoard(board);
            setCurrentView('projector');
          }}
          userRole={userRole}
          onOpenCreateBoardInFolder={handleOpenCreateInFolder}
        />
      </main>

      {/* Rodapé Seguro */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 py-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>SafePlaca 3.0 &bull; Sistema de Gestão de Módulos &amp; Bancada de Celulares</span>
          <span className="text-red-400/80 font-bold">🔒 Marca d'água permanente ativa. Download de PDF e esquemas bloqueado.</span>
        </div>
      </footer>

      {/* Modal de Detalhes da Placa */}
      {selectedBoard && (
        <BoardDetailModal
          board={selectedBoard}
          onClose={() => setSelectedBoard(null)}
          onUpdateBoard={handleUpdateBoard}
          onOpenProjector={(board) => {
            setSelectedBoard(null);
            setProjectorBoard(board);
            setCurrentView('projector');
          }}
        />
      )}

      {/* Modal de Cadastro de Nova Placa */}
      {isEditorOpen && (
        <BoardEditorModal
          initialFolderId={targetFolderForNewBoard}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveBoard}
        />
      )}

      {/* Modo Projetor em Tela Cheia */}
      {currentView === 'projector' && projectorBoard && (
        <ProjectorView
          board={projectorBoard}
          onClose={() => setCurrentView('catalog')}
        />
      )}
    </div>
  );
}

export default App;
