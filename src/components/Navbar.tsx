import React from 'react';
import { Cpu, Tv, PlusCircle, Bell, UserCheck, ShieldAlert, Search, ShoppingBag, Calculator, Key } from 'lucide-react';
import type { BoardProject } from '../types/board';
import type { UserRole } from '../types/news';

export type MainNavTab = 'catalog' | 'store';

interface NavbarProps {
  currentView: 'catalog' | 'projector';
  onViewChange: (view: 'catalog' | 'projector') => void;
  activeNavTab: MainNavTab;
  onNavTabChange: (tab: MainNavTab) => void;
  selectedBoard: BoardProject | null;
  onOpenCreateModal: () => void;
  userRole: UserRole;
  onToggleRole: () => void;
  onOpenNews: () => void;
  unreadNews: boolean;
  onOpenSearch: () => void;
  onOpenCalculator: () => void;
  onOpenLicense: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  activeNavTab,
  onNavTabChange,
  selectedBoard,
  onOpenCreateModal,
  userRole,
  onToggleRole,
  onOpenNews,
  unreadNews,
  onOpenSearch,
  onOpenCalculator,
  onOpenLicense
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-md px-3 sm:px-6 py-2.5 select-none no-copy-shield font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Logo & Marca */}
        <div className="flex items-center gap-4">
          <div 
            onClick={() => {
              onNavTabChange('catalog');
              onViewChange('catalog');
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-900/30 group-hover:scale-105 transition">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white">Safe<span className="text-cyan-400">Placa</span></span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono font-bold">PRO</span>
              </div>
            </div>
          </div>

          {/* Abas Principais: Esquemas vs Loja */}
          <nav className="hidden sm:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                onNavTabChange('catalog');
                if (currentView === 'projector') onViewChange('catalog');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeNavTab === 'catalog'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" /> Esquemas & Bancada
            </button>
            <button
              onClick={() => {
                onNavTabChange('store');
                if (currentView === 'projector') onViewChange('catalog');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeNavTab === 'store'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" /> SafePlaca Store
            </button>
          </nav>
        </div>

        {/* Barra Central de Busca Rápida (Ctrl+K) */}
        <button
          onClick={onOpenSearch}
          className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 text-xs transition max-w-xs flex-1 cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-indigo-400" />
          <span className="truncate">Buscar CI, Placa, Malha (Ctrl+K)...</span>
          <kbd className="ml-auto px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded font-mono text-[10px] text-slate-400">
            Ctrl+K
          </kbd>
        </button>

        {/* Ações e Navegação */}
        <div className="flex items-center gap-2">
          {/* Busca Mobile */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800"
            title="Buscar"
          >
            <Search className="w-4 h-4 text-indigo-400" />
          </button>

          {/* Calculadora SMD */}
          <button
            onClick={onOpenCalculator}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 transition text-xs font-bold flex items-center gap-1"
            title="Calculadora SMD & Diode Mode"
          >
            <Calculator className="w-4 h-4 text-cyan-400" />
            <span className="hidden xl:inline">Calculadora</span>
          </button>

          {/* Licença */}
          <button
            onClick={onOpenLicense}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 transition text-xs font-bold flex items-center gap-1"
            title="Assinatura & Licença"
          >
            <Key className="w-4 h-4 text-emerald-400" />
            <span className="hidden xl:inline">Licença</span>
          </button>

          {/* Botão de Novidades / Sininho */}
          <button
            onClick={onOpenNews}
            className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition text-xs font-bold flex items-center gap-1"
            title="Ver Mural de Novidades"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            {unreadNews && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
            )}
          </button>

          {/* Alternador de Perfil: Admin vs Usuário */}
          <button
            onClick={onToggleRole}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 shadow-md ${
              userRole === 'admin'
                ? 'bg-purple-950/80 text-purple-300 border-purple-600/50 hover:bg-purple-900'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-800'
            }`}
            title={userRole === 'admin' ? 'Você é Administrador (Pode editar tudo)' : 'Entrar como Administrador'}
          >
            {userRole === 'admin' ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">👑 Admin</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">👤 Cliente</span>
              </>
            )}
          </button>

          {/* Modo Projetor se placa selecionada */}
          {selectedBoard && (
            <button
              onClick={() => onViewChange(currentView === 'projector' ? 'catalog' : 'projector')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow-lg ${
                currentView === 'projector'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/50'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/50'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{currentView === 'projector' ? 'Sair' : 'Projetor'}</span>
            </button>
          )}

          {/* Nova Placa (Apenas Admin) */}
          {userRole === 'admin' && activeNavTab === 'catalog' && (
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-950 transition"
              title="Cadastrar Nova Placa"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Nova Placa</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
