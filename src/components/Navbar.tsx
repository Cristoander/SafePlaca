import React from 'react';
import { Cpu, ShieldCheck, Tv, PlusCircle, Bell, UserCheck, ShieldAlert } from 'lucide-react';
import type { BoardProject } from '../types/board';
import type { UserRole } from '../types/news';

interface NavbarProps {
  currentView: 'catalog' | 'projector';
  onViewChange: (view: 'catalog' | 'projector') => void;
  selectedBoard: BoardProject | null;
  onOpenCreateModal: () => void;
  userRole: UserRole;
  onToggleRole: () => void;
  onOpenNews: () => void;
  unreadNews: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  selectedBoard,
  onOpenCreateModal,
  userRole,
  onToggleRole,
  onOpenNews,
  unreadNews,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-md px-4 lg:px-8 py-3 select-none no-copy-shield font-mono">
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
              <span className="font-extrabold text-xl tracking-tight text-white font-sans">Safe<span className="text-cyan-400">Placa</span></span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-semibold">3.0 BANCADA</span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Pastas de Aparelhos &bull; Esquemas Protegidos</p>
          </div>
        </div>

        {/* Status de Segurança Ativo */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Blindagem Ativa: Anti-Download &amp; Marca d'Água</span>
        </div>

        {/* Ações e Navegação */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botão de Novidades / Sininho */}
          <button
            onClick={onOpenNews}
            className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition flex items-center gap-1.5 text-xs font-bold"
            title="Ver Mural de Novidades e Avisos"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Novidades</span>
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
            title={userRole === 'admin' ? 'Você é Administrador (Pode editar tudo)' : 'Clique para entrar como Administrador'}
          >
            {userRole === 'admin' ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                <span>👑 Modo Admin</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>👤 Modo Cliente</span>
              </>
            )}
          </button>

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
              <span>{currentView === 'projector' ? 'Sair' : 'Projetor'}</span>
            </button>
          )}

          {/* Nova Placa (Apenas Admin pode criar) */}
          {userRole === 'admin' && (
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-950 transition"
              title="Cadastrar Nova Placa nesta Pasta"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nova Placa</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
