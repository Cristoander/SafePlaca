import React, { useState } from 'react';
import { ShieldCheck, Key, Download, Upload, CheckCircle2, Clock, X, AlertTriangle } from 'lucide-react';
import type { LicenseData } from '../types/license';

interface LicenseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  license: LicenseData;
  onActivate: (key: string) => boolean;
  onExportBackup: () => void;
  onImportBackup: (jsonContent: string) => boolean;
}

export const LicenseManagerModal: React.FC<LicenseManagerModalProps> = ({
  isOpen,
  onClose,
  license,
  onActivate,
  onExportBackup,
  onImportBackup
}) => {
  const [inputKey, setInputKey] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleApplyKey = () => {
    if (!inputKey.trim()) return;
    const success = onActivate(inputKey.trim());
    if (success) {
      setStatusMsg({ type: 'success', text: '🎉 Licença SafePlaca PRO ativada com sucesso!' });
      setInputKey('');
    } else {
      setStatusMsg({ type: 'error', text: 'Chave de ativação inválida ou expirada. Tente SAFE-PRO-2026' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const ok = onImportBackup(text);
        if (ok) {
          setStatusMsg({ type: 'success', text: 'Backup restaurado com sucesso!' });
        } else {
          setStatusMsg({ type: 'error', text: 'Arquivo de backup inválido.' });
        }
      } catch (err) {
        setStatusMsg({ type: 'error', text: 'Falha ao ler arquivo de backup.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${
              license.isActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Central de Assinatura & Licença</h3>
              <p className="text-xs text-slate-400">Status de ativação do software e backup de dados</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Card de Status da Licença */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            license.isActive
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
          }`}>
            <div>
              <div className="text-xs uppercase font-semibold tracking-wider">Status Atual</div>
              <div className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
                {license.isActive ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    SafePlaca PRO (Ativo)
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    Versão Demonstração
                  </>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Validade: {license.expiresAt === 'lifetime' ? 'Acesso Vitalício' : `${license.daysRemaining} dias restantes`}
              </div>
            </div>
            <div className="text-right font-mono text-xs text-slate-400">
              <div>HWID Seguro:</div>
              <div className="text-indigo-400">{license.hardwareId}</div>
            </div>
          </div>

          {/* Form de Ativação de Chave */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-400" />
              Ativar Chave de Licença:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value.toUpperCase())}
                placeholder="Ex: SAFE-PRO-2026"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-indigo-400 uppercase tracking-wider focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleApplyKey}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition"
              >
                Ativar
              </button>
            </div>
            <p className="text-xs text-slate-400">
              💡 Chave de demonstração liberada: <span className="font-mono text-indigo-300">SAFE-PRO-2026</span>
            </p>
          </div>

          {statusMsg && (
            <div className={`p-3 rounded-xl text-xs font-semibold ${
              statusMsg.type === 'success' ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300' : 'bg-red-950/60 border border-red-500/40 text-red-300'
            }`}>
              {statusMsg.text}
            </div>
          )}

          <hr className="border-slate-800" />

          {/* Backup e Restauração de Dados */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-300">Backup & Portabilidade da Bancada</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onExportBackup}
                className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-white transition"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                Exportar Backup (JSON)
              </button>
              <label className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-white transition cursor-pointer">
                <Upload className="w-4 h-4 text-emerald-400" />
                Restaurar Backup
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
