import React, { useState, useEffect } from 'react';
import type { BoardComponentMarker, ComponentKind } from '../types/board';
import { detectBoardComponents, type DetectionResult } from '../utils/boardComponentDetector';
import { 
  Sparkles, 
  X, 
  Layers, 
  Zap, 
  Activity, 
  ShieldCheck, 
  Sliders,
  CheckSquare,
  Square,
  ArrowRight
} from 'lucide-react';

interface AutoComponentScannerModalProps {
  photoUrl: string;
  activeSide: 'A' | 'B';
  existingMarkers: BoardComponentMarker[];
  onApplyMarkers: (newMarkers: BoardComponentMarker[], mode: 'replace' | 'merge') => void;
  onClose: () => void;
}

export const AutoComponentScannerModal: React.FC<AutoComponentScannerModalProps> = ({
  photoUrl,
  activeSide,
  existingMarkers,
  onApplyMarkers,
  onClose,
}) => {
  const [isScanning, setIsScanning] = useState(true);
  const [density, setDensity] = useState<'essential' | 'balanced' | 'detailed'>('balanced');
  const [replaceMode, setReplaceMode] = useState<'replace' | 'merge'>('replace');
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [selectedKinds, setSelectedKinds] = useState<ComponentKind[]>([
    'ci', 
    'conector', 
    'bobina', 
    'capacitor', 
    'diodo', 
    'termistor', 
    'resistor'
  ]);

  // Executa o scanner de visão computacional
  useEffect(() => {
    let isCancelled = false;
    setIsScanning(true);

    detectBoardComponents(photoUrl, {
      density,
      side: activeSide,
      filterKinds: selectedKinds,
    }).then((res) => {
      if (!isCancelled) {
        setResult(res);
        // Pequeno atraso para a animação do radar laser ser visível
        setTimeout(() => setIsScanning(false), 450);
      }
    }).catch((err) => {
      console.error('Falha no scanner:', err);
      if (!isCancelled) setIsScanning(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [photoUrl, density, activeSide, selectedKinds]);

  const toggleKind = (kind: ComponentKind) => {
    setSelectedKinds((prev) =>
      prev.includes(kind) ? prev.filter((k) => k !== kind) : [...prev, kind]
    );
  };

  const handleApply = () => {
    if (!result || result.markers.length === 0) return;
    onApplyMarkers(result.markers, replaceMode);
    onClose();
  };

  const getKindColorClass = (kind: ComponentKind) => {
    switch (kind) {
      case 'ci':
        return 'bg-emerald-500 text-emerald-950 border-emerald-400';
      case 'conector':
        return 'bg-amber-500 text-amber-950 border-amber-400';
      case 'bobina':
        return 'bg-indigo-500 text-indigo-950 border-indigo-400';
      case 'capacitor':
        return 'bg-cyan-500 text-cyan-950 border-cyan-400';
      case 'diodo':
        return 'bg-rose-500 text-rose-950 border-rose-400';
      case 'termistor':
        return 'bg-red-500 text-red-950 border-red-400';
      default:
        return 'bg-slate-400 text-slate-950 border-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md font-mono select-none animate-in fade-in">
      <div className="bg-slate-950 border border-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Tecnológico */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/40 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">
                  Auto Scanner de Peças por Visão Computacional
                </h3>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full font-bold">
                  Face {activeSide}
                </span>
                {result && (
                  <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full font-bold">
                    {result.detectedBoardType === 'subboard' ? 'Subplaca / Carga' : 'Placa Principal'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Segmenta e separa os componentes da placa automaticamente na foto para você só linkar as malhas.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo: Painel Dividido (Visualizador com Bounding Boxes e Controles) */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Coluna Esquerda: Preview da Foto com Scanner Laser e Caixas Detectadas (7 colunas) */}
          <div className="lg:col-span-7 flex flex-col gap-2">
            <div className="relative w-full aspect-[4/3] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner group">
              
              {/* Foto da Placa */}
              <img
                src={photoUrl}
                alt="Placa Analisada"
                className="w-full h-full object-contain filter contrast-105"
              />

              {/* Linha de Scanner Laser Animada */}
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-pulse" 
                       style={{ 
                         animation: 'scanline 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                         position: 'absolute',
                         top: '0%'
                       }} 
                  />
                  <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="bg-slate-950/90 border border-cyan-500/60 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2">
                      <Activity className="w-4 h-4 text-cyan-400 animate-spin" />
                      <span className="text-xs font-extrabold text-cyan-300">Escaneando circuitos e pads...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bounding Boxes / Marcadores Detectados Sobre a Foto */}
              {!isScanning && result && (
                <div className="absolute inset-0 pointer-events-none">
                  {result.markers.map((marker) => (
                    <div
                      key={marker.id}
                      className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-auto cursor-pointer"
                      style={{
                        left: `${marker.xPercent}%`,
                        top: `${marker.yPercent}%`,
                      }}
                      title={`${marker.reference}: ${marker.name} (${marker.diodeScaleMv}mV / ${marker.voltage})`}
                    >
                      <div className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold border shadow-lg flex items-center gap-1 ${getKindColorClass(marker.kind)}`}>
                        <span className="truncate max-w-[70px]">{marker.reference}</span>
                      </div>
                      {/* Ponto central */}
                      <div className="w-1.5 h-1.5 rounded-full bg-white mx-auto mt-0.5 shadow-md" />
                    </div>
                  ))}
                </div>
              )}

              {/* Contador flutuante no canto inferior */}
              <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-2.5 py-1 rounded-xl text-[11px] text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {result ? `${result.markers.length} componentes encontrados` : 'Carregando...'}
                </span>
              </div>
            </div>

            {/* Dica de Bancada */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 text-[11px] text-slate-400 flex items-start gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Dica Pro:</strong> Após aplicar a separação, você só precisará usar a ferramenta <strong>"Ligar Malha"</strong> ou <strong>"Traçar Jumper"</strong> para unir os pinos do conector aos capacitores e CI OVP!
              </span>
            </div>
          </div>

          {/* Coluna Direita: Controles de Sensibilidade e Tipos (5 colunas) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3">
            
            <div className="space-y-3">
              {/* Densidade de Peças */}
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    Densidade de Detecção:
                  </span>
                  <span className="text-[10px] text-cyan-400 font-extrabold uppercase">
                    {density === 'essential' ? '10 peças' : density === 'balanced' ? '20 peças' : '35+ peças'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setDensity('essential')}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                      density === 'essential'
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Essenciais
                  </button>
                  <button
                    onClick={() => setDensity('balanced')}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                      density === 'balanced'
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Equilibrado
                  </button>
                  <button
                    onClick={() => setDensity('detailed')}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                      density === 'detailed'
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Completo
                  </button>
                </div>
              </div>

              {/* Filtro de Tipos de Peças */}
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  Filtrar Peças para Separar:
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => toggleKind('ci')}
                    className={`p-2 rounded-xl border flex items-center justify-between transition ${
                      selectedKinds.includes('ci')
                        ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span>CIs (OVP / PMIC)</span>
                    {selectedKinds.includes('ci') ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => toggleKind('conector')}
                    className={`p-2 rounded-xl border flex items-center justify-between transition ${
                      selectedKinds.includes('conector')
                        ? 'bg-amber-950/60 border-amber-700 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span>Conector FPC</span>
                    {selectedKinds.includes('conector') ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => toggleKind('bobina')}
                    className={`p-2 rounded-xl border flex items-center justify-between transition ${
                      selectedKinds.includes('bobina')
                        ? 'bg-indigo-950/60 border-indigo-700 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span>Bobinas / Indutores</span>
                    {selectedKinds.includes('bobina') ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => toggleKind('capacitor')}
                    className={`p-2 rounded-xl border flex items-center justify-between transition ${
                      selectedKinds.includes('capacitor')
                        ? 'bg-cyan-950/60 border-cyan-700 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span>Capacitores SMD</span>
                    {selectedKinds.includes('capacitor') ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => toggleKind('diodo')}
                    className={`p-2 rounded-xl border flex items-center justify-between transition ${
                      selectedKinds.includes('diodo')
                        ? 'bg-rose-950/60 border-rose-700 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span>Diodos / TVS</span>
                    {selectedKinds.includes('diodo') ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => toggleKind('termistor')}
                    className={`p-2 rounded-xl border flex items-center justify-between transition ${
                      selectedKinds.includes('termistor')
                        ? 'bg-red-950/60 border-red-700 text-red-300'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span>Termistor NTC</span>
                    {selectedKinds.includes('termistor') ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Modo de Aplicação: Substituir vs Mesclar */}
              {existingMarkers.length > 0 && (
                <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-2xl flex items-center justify-between text-xs">
                  <span className="text-slate-300">Peças existentes ({existingMarkers.length}):</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setReplaceMode('replace')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition ${
                        replaceMode === 'replace'
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      Substituir
                    </button>
                    <button
                      onClick={() => setReplaceMode('merge')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition ${
                        replaceMode === 'merge'
                          ? 'bg-cyan-600 text-white shadow-md'
                          : 'bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      Mesclar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Ações Inferiores */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition"
              >
                Cancelar
              </button>

              <button
                onClick={handleApply}
                disabled={!result || result.markers.length === 0}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-cyan-950/60 flex items-center gap-2 transition disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Aplicar {result?.markers.length || 0} Peças Separadas</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
