import React, { useState } from 'react';
import type { CommonFault } from '../types/board';
import { AlertTriangle, Wrench, Search, CheckCircle2, Plus, X, Trash2 } from 'lucide-react';

interface FaultsTroubleshootingViewProps {
  faults: CommonFault[];
  onAddFault?: (fault: CommonFault) => void;
  onDeleteFault?: (faultId: string) => void;
}

export const FaultsTroubleshootingView: React.FC<FaultsTroubleshootingViewProps> = ({
  faults,
  onAddFault,
  onDeleteFault,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [symptom, setSymptom] = useState('');
  const [cause, setCause] = useState('');
  const [testProcedure, setTestProcedure] = useState('');
  const [solution, setSolution] = useState('');
  const [related, setRelated] = useState('');
  const [difficulty, setDifficulty] = useState<'facil' | 'medio' | 'avancado'>('medio');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddFault) return;

    const newFault: CommonFault = {
      id: 'fault-' + Date.now(),
      title: title || 'Novo Defeito Mapeado',
      symptom: symptom || 'Apresenta falha no funcionamento.',
      cause: cause || 'Desgaste ou curto de componente.',
      testProcedure: testProcedure || 'Medição na escala de diodo / continuidade.',
      solution: solution || 'Ressoldar ou substituir componente danificado.',
      relatedComponents: related.split(',').map((s) => s.trim()).filter(Boolean),
      difficulty,
    };

    onAddFault(newFault);
    setIsAdding(false);
    setTitle('');
    setSymptom('');
    setCause('');
    setTestProcedure('');
    setSolution('');
    setRelated('');
  };

  return (
    <div className="space-y-4 font-mono no-copy-shield">
      {/* Header com botão de adicionar */}
      <div className="flex items-center justify-between bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-xs text-white uppercase">
            Guia de Defeitos de Bancada &amp; Reparos Passo a Passo
          </span>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-amber-950/50"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cadastrar Defeito</span>
        </button>
      </div>

      {/* Formulário de Novo Defeito */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-amber-400 font-bold text-xs pb-2 border-b border-slate-800">
            <span>Novo Defeito para esta Placa:</span>
            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="text-slate-400 block mb-1">Título do Defeito / Problema:</label>
              <input
                type="text"
                required
                placeholder="Ex: Carga pausada por temperatura / Triângulo amarelo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Dificuldade de Reparo:</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
              >
                <option value="facil">Fácil</option>
                <option value="medio">Médio</option>
                <option value="avancado">Avançado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Sintoma Apresentado:</label>
              <textarea
                rows={2}
                placeholder="Ex: Conecta o cabo e o detector USB trava em 0.00A..."
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Causa Mais Provável:</label>
              <textarea
                rows={2}
                placeholder="Ex: Diodo TVS em curto ou conector oxidado..."
                value={cause}
                onChange={(e) => setCause(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="text-slate-400 block mb-1">Procedimento de Teste no Multímetro:</label>
            <input
              type="text"
              placeholder="Ex: Medir na escala de diodo: ponta vermelha no terra e preta no VBUS deve dar ~520mV."
              value={testProcedure}
              onChange={(e) => setTestProcedure(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
            />
          </div>

          <div className="text-xs">
            <label className="text-slate-400 block mb-1">Como Arrumar / Solução de Bancada:</label>
            <textarea
              rows={2}
              placeholder="Ex: 1. Remover diodo em curto. 2. Substituir por novo. 3. Testar se o consumo sobe para 1.8A."
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
            />
          </div>

          <div className="text-xs">
            <label className="text-slate-400 block mb-1">Componentes Envolvidos (separados por vírgula):</label>
            <input
              type="text"
              placeholder="Ex: D3001, USB-C, U3001"
              value={related}
              onChange={(e) => setRelated(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Salvar Defeito
            </button>
          </div>
        </form>
      )}

      {/* Lista de Defeitos Cadastrados */}
      {faults.length === 0 ? (
        <div className="text-center py-10 bg-slate-950/60 rounded-2xl border border-slate-800 p-6 text-xs text-slate-400">
          Nenhum defeito cadastrado ainda para esta placa. Clique em <span className="text-amber-300 font-bold">"Cadastrar Defeito"</span> acima para adicionar!
        </div>
      ) : (
        <div className="space-y-3">
          {faults.map((fault) => (
            <div
              key={fault.id}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-amber-500/40 transition space-y-3 shadow-lg relative group"
            >
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

                {onDeleteFault && (
                  <button
                    onClick={() => onDeleteFault(fault.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/50 transition opacity-0 group-hover:opacity-100"
                    title="Excluir defeito"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

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

              <div className="bg-cyan-950/30 border border-cyan-800/40 p-3 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px]">
                  <Search className="w-3.5 h-3.5" />
                  <span>PROCEDIMENTO DE TESTE NO MULTÍMETRO:</span>
                </div>
                <p className="text-slate-300 text-[11px] font-sans">{fault.testProcedure}</p>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-800/40 p-3 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>COMO ARRUMAR / PROCEDIMENTO DE REPARO:</span>
                </div>
                <p className="text-slate-200 text-[11px] font-sans whitespace-pre-line">{fault.solution}</p>
              </div>

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
      )}
    </div>
  );
};
