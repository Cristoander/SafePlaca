import React from 'react';
import type { DeviceFolder } from '../types/board';
import { Folder, Smartphone, Cpu, Layers, Plus } from 'lucide-react';

interface DeviceFolderTreeProps {
  folders: DeviceFolder[];
  selectedFolderId: string;
  onSelectFolder: (id: string) => void;
  onNewFolder: () => void;
  counts: Record<string, number>;
}

export const DeviceFolderTree: React.FC<DeviceFolderTreeProps> = ({
  folders,
  selectedFolderId,
  onSelectFolder,
  onNewFolder,
  counts,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-xl flex items-center gap-1.5 overflow-x-auto no-copy-shield">
      <div className="flex items-center gap-1 text-slate-400 text-xs font-mono px-2 shrink-0">
        <Folder className="w-3.5 h-3.5 text-cyan-400" />
        <span>PASTAS:</span>
      </div>

      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {folders.map((f) => {
          const count = counts[f.id] || 0;
          const isSelected = selectedFolderId === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onSelectFolder(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition flex items-center gap-2 border ${
                isSelected
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60 font-bold shadow-md shadow-cyan-950/50'
                  : 'bg-slate-950/70 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800'
              }`}
            >
              {f.id === 'all' ? (
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
              ) : f.brand === 'Módulos Avulsos' || f.brand === 'Fontes & Conversores' ? (
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>{f.name}</span>
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={onNewFolder}
        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1 shrink-0 border border-slate-700 transition"
        title="Criar nova pasta de modelo"
      >
        <Plus className="w-3.5 h-3.5 text-cyan-400" />
        <span className="hidden sm:inline">Nova Pasta</span>
      </button>
    </div>
  );
};
