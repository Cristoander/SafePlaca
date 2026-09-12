import { useState, useEffect } from 'react';
import type { BoardProject } from './types/board';
import type { NewsAnnouncement, UserRole } from './types/news';
import type { PhysicalProduct, StoreSettings } from './types/store';
import type { LicenseData } from './types/license';
import { DEFAULT_BOARDS } from './data/defaultBoards';
import { DEFAULT_NEWS } from './data/defaultNews';
import { initialProducts, initialStoreSettings } from './data/defaultProducts';
import { Navbar, type MainNavTab } from './components/Navbar';
import { BoardCatalog } from './components/BoardCatalog';
import { BoardDetailModal } from './components/BoardDetailModal';
import { BoardEditorModal } from './components/BoardEditorModal';
import { ProjectorView } from './components/ProjectorView';
import { SecurityAlertModal } from './components/SecurityAlertModal';
import { NewsModal } from './components/NewsModal';
import { GlobalSearchBar } from './components/GlobalSearchBar';
import { BenchCalculatorModal } from './components/BenchCalculatorModal';
import { LicenseManagerModal } from './components/LicenseManagerModal';
import { SafePlacaStoreView } from './components/SafePlacaStoreView';
import { initWorkbenchProtection } from './utils/security';

const STORAGE_BOARDS_KEY = 'safeplaca_boards_v1';
const STORAGE_NEWS_KEY = 'safeplaca_news_v1';
const STORAGE_LAST_SEEN_KEY = 'safeplaca_last_seen_news_v1';
const STORAGE_ROLE_KEY = 'safeplaca_user_role_v1';
const STORAGE_PRODUCTS_KEY = 'safeplaca_products_v1';
const STORAGE_LICENSE_KEY = 'safeplaca_license_v1';

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

  const [products, setProducts] = useState<PhysicalProduct[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignora
    }
    return initialProducts;
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(initialStoreSettings);

  const [license, setLicense] = useState<LicenseData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LICENSE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {
      // Ignora
    }
    return {
      plan: 'pro_anual',
      isActive: true,
      licenseKey: 'SAFE-PRO-2026',
      clientName: 'Bancada do Técnico',
      hardwareId: 'HWID-9821-BANCADA-BR',
      activatedAt: new Date().toISOString(),
      expiresAt: '2027-12-31',
      daysRemaining: 365
    };
  });

  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ROLE_KEY);
      if (saved === 'admin' || saved === 'user') return saved;
    } catch {
      // Ignora erro
    }
    return 'admin';
  });

  const [activeNavTab, setActiveNavTab] = useState<MainNavTab>('catalog');
  const [currentView, setCurrentView] = useState<'catalog' | 'projector'>('catalog');
  const [selectedBoard, setSelectedBoard] = useState<BoardProject | null>(null);
  const [projectorBoard, setProjectorBoard] = useState<BoardProject | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [targetFolderForNewBoard, setTargetFolderForNewBoard] = useState<string | undefined>(undefined);
  const [isNewsOpen, setIsNewsOpen] = useState<boolean>(false);
  const [hasUnreadNews, setHasUnreadNews] = useState<boolean>(false);

  // Modais de ferramentas
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [isLicenseOpen, setIsLicenseOpen] = useState<boolean>(false);

  // Inicializa blindagem de bancada
  useEffect(() => {
    const cleanupProtection = initWorkbenchProtection();
    return cleanupProtection;
  }, []);

  // Atalho de Teclado Global: Ctrl + K para abrir a Busca Universal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Verifica se há novidades não lidas
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
        alert('Acesso Administrador concedido! Agora você pode criar pastas, placas, subir fotos e cadastrar produtos.');
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

  // Salva nova placa
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

  // Adicionar produto na loja
  const handleAddProduct = (newProd: PhysicalProduct) => {
    const updated = [newProd, ...products];
    setProducts(updated);
    try {
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Erro ao salvar produto:', err);
    }
  };

  // Ativar chave de licença
  const handleActivateLicense = (key: string): boolean => {
    if (key === 'SAFE-PRO-2026' || key.startsWith('SAFE-VIP')) {
      const updated: LicenseData = {
        ...license,
        plan: 'pro_anual',
        isActive: true,
        licenseKey: key,
        daysRemaining: 365,
        expiresAt: '2027-12-31'
      };
      setLicense(updated);
      try {
        localStorage.setItem(STORAGE_LICENSE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return true;
    }
    return false;
  };

  // Exportar Backup JSON
  const handleExportBackup = () => {
    const backupData = {
      version: '3.0',
      exportedAt: new Date().toISOString(),
      boards,
      newsList,
      products,
      storeSettings,
      license
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safeplaca_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Importar Backup JSON
  const handleImportBackup = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.boards && Array.isArray(parsed.boards)) {
        setBoards(parsed.boards);
        localStorage.setItem(STORAGE_BOARDS_KEY, JSON.stringify(parsed.boards));
      }
      if (parsed.products && Array.isArray(parsed.products)) {
        setProducts(parsed.products);
        localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(parsed.products));
      }
      if (parsed.newsList && Array.isArray(parsed.newsList)) {
        setNewsList(parsed.newsList);
        localStorage.setItem(STORAGE_NEWS_KEY, JSON.stringify(parsed.newsList));
      }
      return true;
    } catch {
      return false;
    }
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

      {/* Modal de Busca Universal Ctrl+K */}
      <GlobalSearchBar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        boards={boards}
        products={products}
        onSelectBoard={(board) => {
          setActiveNavTab('catalog');
          setSelectedBoard(board);
        }}
        onSelectProduct={() => {
          setActiveNavTab('store');
        }}
      />

      {/* Modal Calculadora SMD & Diode Mode */}
      <BenchCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* Modal Licença & Backup */}
      <LicenseManagerModal
        isOpen={isLicenseOpen}
        onClose={() => setIsLicenseOpen(false)}
        license={license}
        onActivate={handleActivateLicense}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
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
        activeNavTab={activeNavTab}
        onNavTabChange={(tab) => setActiveNavTab(tab)}
        selectedBoard={selectedBoard || boards[0]}
        onOpenCreateModal={() => {
          setTargetFolderForNewBoard(undefined);
          setIsEditorOpen(true);
        }}
        userRole={userRole}
        onToggleRole={handleToggleRole}
        onOpenNews={() => setIsNewsOpen(true)}
        unreadNews={hasUnreadNews}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenLicense={() => setIsLicenseOpen(true)}
      />

      {/* Área Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeNavTab === 'catalog' ? (
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
        ) : (
          <SafePlacaStoreView
            products={products}
            storeSettings={storeSettings}
            userRole={userRole}
            onAddProduct={handleAddProduct}
            onUpdateSettings={(s) => setStoreSettings(s)}
          />
        )}
      </main>

      {/* Rodapé Seguro */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 py-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>SafePlaca PRO &bull; Suíte de Esquemas, Bancada &amp; Hardware Store</span>
          <span className="text-red-400/80 font-bold">🔒 Proteção de Bancada Ativa &bull; Marca d'água dinâmica</span>
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
