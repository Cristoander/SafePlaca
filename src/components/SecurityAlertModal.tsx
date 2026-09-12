import React, { useEffect, useState } from 'react';
import { ShieldX, Lock, AlertTriangle, X } from 'lucide-react';
import { subscribeSecurityAlert } from '../utils/security';
import type { SecurityEventDetail } from '../utils/security';

export const SecurityAlertModal: React.FC = () => {
  const [alertData, setAlertData] = useState<SecurityEventDetail | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeSecurityAlert((detail) => {
      setAlertData(detail);
    });
    return unsubscribe;
  }, []);

  if (!alertData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative max-w-md w-full bg-slate-900 border-2 border-red-500/60 rounded-2xl p-6 shadow-2xl shadow-red-950/60 text-slate-100">
        <button
          onClick={() => setAlertData(null)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-red-400 mb-4">
          <div className="p-3 bg-red-950/60 rounded-xl border border-red-500/40">
            <ShieldX className="w-8 h-8 text-red-500 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Ação Bloqueada</h3>
            <p className="text-xs text-red-300 font-mono">POLÍTICA DE PROTEÇÃO SAFEPLACA</p>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-red-900/40 rounded-xl p-4 mb-4 text-sm text-slate-300 space-y-2">
          <div className="flex items-start gap-2 text-amber-300 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Tentativa de download ou cópia interceptada:</span>
          </div>
          <p className="text-xs text-slate-400 font-mono bg-black/40 p-2 rounded border border-slate-800">
            {alertData.message}
          </p>
          <div className="text-xs text-slate-400">
            Horário registrado: <span className="text-slate-200 font-mono">{alertData.timestamp}</span>
          </div>
        </div>

        <div className="text-xs text-slate-400 mb-6 space-y-1.5 border-l-2 border-amber-500/40 pl-3">
          <p className="text-slate-300 font-semibold">Diretrizes de Segurança:</p>
          <p>• Os esquemas e fotos das placas possuem marca d'água automática e não podem ser baixados em PDF ou imagem.</p>
          <p>• O acesso está habilitado exclusivamente para inspeção visual e **Modo Projetor de Bancada** em tempo real.</p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setAlertData(null)}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-red-900/40 flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Entendido / Retornar à Bancada</span>
          </button>
        </div>
      </div>
    </div>
  );
};
