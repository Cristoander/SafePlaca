import React from 'react';
import type { CommonFault } from '../types/board';
import { AlertTriangle, Wrench, Search, CheckCircle2 } from 'lucide-react';

interface FaultsTroubleshootingViewProps {
  faults: CommonFault[];
  
}

export const FaultsTroubleshootingView: React.FC<FaultsTroubleshootingViewProps> = ({
  faults,
  }) => {
  if (!faults || faults.length === 0) {
    return (
      <div className="text-center py-10 bg-slate-950/60 rounded-2xl border border-slate-800 p-6 font-mono text-xs text-slate-400">
        Nenhum defeito cadastrado ainda para esta placa.
      </div>
    );
  }

  return (
    <div className="space-y-4 font-mono no-copy-shield">
      <div className="flex items-center justify-between bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-xs text-white uppercase">
            Guia de Defeitos de Bancada &amp; Reparos Passo a Passo
          </span>
        </div>
        <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
          {faults.length} DEFEITOS MAPEADOS
        </span>
      </div>

      <div className="space-y-3">
        {faults.map((fault) => (
          <div
            key={fault.id}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-amber-500/40 transition space-y-3 shadow-lg"
          >
            {/* Header do Defeito */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-amber-950/80 text-amber-300 border border-amber-800/40 inline-block mb-1">
                  DIFICULDADE: {fault.difficulty.toUpperCase()}
                </span>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  {fault.title}
                </h4>
              </div>
            </div>

            {/* Sintoma & Causa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold text-red-400">
                  Sintoma Apresentado:
                </span>
                <p className="text-slate-300 text-[11px] mt-0.5">{fault.symptom}</p>
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold text-amber-400">
                  Causa Mais Provável:
                </span>
                <p className="text-slate-300 text-[11px] mt-0.5">{fault.cause}</p>
              </div>
            </div>

            {/* Teste com Multímetro */}
            <div className="bg-cyan-950/30 border border-cyan-800/40 p-3 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px]">
                <Search className="w-3.5 h-3.5" />
                <span>PROCEDIMENTO DE TESTE NO MULTÍMETRO:</span>
              </div>
              <p className="text-slate-300 text-[11px] font-sans">{fault.testProcedure}</p>
            </div>

            {/* Solução Passo a Passo */}
            <div className="bg-emerald-950/30 border border-emerald-800/40 p-3 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>COMO AR RUMAR / PROCEDIMENTO DE REPARO:</span>
              </div>
              <p className="text-slate-200 text-[11px] font-sans whitespace-pre-line">{fault.solution}</p>
            </div>

            {/* Componentes Envolvidos */}
            {fault.relatedComponents && fault.relatedComponents.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] text-slate-400 uppercase">Componentes a Inspecionar:</span>
                <div className="flex flex-wrap gap-1">
                  {fault.relatedComponents.map((comp, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 text-[10px] font-bold border border-slate-700"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
