import React, { useState } from 'react';
import { Layers, Zap, ArrowRightLeft, Eye, Activity, Sparkles } from 'lucide-react';
import type { NetGroup, NetPoint } from '../types/netlist';
import type { BoardProject } from '../types/board';
import { WatermarkOverlay } from './WatermarkOverlay';

interface NetlistTracerViewProps {
  board: BoardProject;
  netGroups: NetGroup[];
}

export const NetlistTracerView: React.FC<NetlistTracerViewProps> = ({ board, netGroups }) => {
  const currentBoardNets = netGroups.filter(n => n.boardId === board.id);
  const [selectedNetId, setSelectedNetId] = useState<string>(currentBoardNets[0]?.id || '');
  const [activeSide, setActiveSide] = useState<'A' | 'B'>('A');
  const [selectedPoint, setSelectedPoint] = useState<NetPoint | null>(null);

  const activeNet = currentBoardNets.find(n => n.id === selectedNetId) || currentBoardNets[0];

  const sidePoints = activeNet ? activeNet.points.filter(p => p.side === activeSide) : [];
  const otherSidePoints = activeNet ? activeNet.points.filter(p => p.side !== activeSide) : [];

  // Alternar lado
  const toggleSide = () => {
    setActiveSide(prev => (prev === 'A' ? 'B' : 'A'));
    setSelectedPoint(null);
  };

  const currentPhoto = activeSide === 'A' ? (board.realPhotoUrl || '') : (board.realPhotoBackUrl || board.realPhotoUrl || '');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[750px]">
      {/* Top Header Controls */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/20 text-yellow-400 rounded-xl border border-yellow-500/30">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-bold flex items-center gap-2">
              Rastreamento de Malhas & Trilhas (Netlist Tracing)
              <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                {currentBoardNets.length} malhas disponíveis
              </span>
            </h3>
            <p className="text-xs text-slate-400">Clique em qualquer malha para acender todos os pontos conectados na placa</p>
          </div>
        </div>

        {/* Lado A / Lado B Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => { setActiveSide('A'); setSelectedPoint(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSide === 'A'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Lado A (Frente)
          </button>
          <button
            onClick={() => { setActiveSide('B'); setSelectedPoint(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSide === 'B'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Lado B (Verso)
          </button>
        </div>
      </div>

      {/* Main Workspace: Left Sidebar Nets List + Right Board View */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Lista Lateral de Malhas */}
        <div className="w-full md:w-80 bg-slate-950/80 border-r border-slate-800 p-3 flex flex-col gap-2 overflow-y-auto">
          <div className="text-xs uppercase font-bold text-slate-400 px-2 py-1 flex items-center justify-between">
            <span>Malhas Principais</span>
            <Layers className="w-3.5 h-3.5" />
          </div>

          {currentBoardNets.map(net => {
            const isSelected = net.id === activeNet?.id;
            const pointsSideA = net.points.filter(p => p.side === 'A').length;
            const pointsSideB = net.points.filter(p => p.side === 'B').length;

            return (
              <div
                key={net.id}
                onClick={() => {
                  setSelectedNetId(net.id);
                  setSelectedPoint(null);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition text-left relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-800 border-indigo-500 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: net.colorHex }}
                    />
                    <span className="font-mono font-bold text-sm text-white">{net.name}</span>
                  </div>
                  {net.voltage && (
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      {net.voltage}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{net.description}</p>

                <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                  <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    Lado A: <strong className="text-slate-200">{pointsSideA}</strong>
                  </span>
                  <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    Lado B: <strong className="text-slate-200">{pointsSideB}</strong>
                  </span>
                  {net.points.some(p => p.isVia) && (
                    <span className="text-amber-400 flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" /> Via
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Board View Canvas com Traçado de Malhas */}
        <div className="flex-1 bg-slate-950 relative flex flex-col overflow-hidden">
          {/* Alerta de Continuidade no outro lado */}
          {otherSidePoints.length > 0 && (
            <div className="absolute top-4 left-4 z-20 bg-slate-900/90 border border-indigo-500/40 backdrop-blur-md px-3 py-2 rounded-xl shadow-xl flex items-center gap-3">
              <div className="text-xs text-slate-300">
                Esta malha continua no <strong className="text-indigo-400">Lado {activeSide === 'A' ? 'B (Verso)' : 'A (Frente)'}</strong> ({otherSidePoints.length} conexões)
              </div>
              <button
                onClick={toggleSide}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition shadow"
              >
                <ArrowRightLeft className="w-3 h-3" /> Ver Lado {activeSide === 'A' ? 'B' : 'A'}
              </button>
            </div>
          )}

          {/* Canvas da Placa */}
          <div className="flex-1 relative flex items-center justify-center p-4 select-none overflow-hidden">
            {/* Imagem de Fundo da Placa */}
            <div className="relative max-w-full max-h-full aspect-video flex items-center justify-center">
              {currentPhoto ? (
                <img
                  src={currentPhoto}
                  alt={`Placa ${board.title} - Lado ${activeSide}`}
                  className="max-h-[560px] w-auto object-contain rounded-xl shadow-2xl border border-slate-800"
                  style={{
                    filter: board.visualStyle === 'blueprint' 
                      ? 'invert(1) hue-rotate(190deg) contrast(1.4)' 
                      : board.visualStyle === 'xray' 
                      ? 'invert(1) grayscale(1) contrast(2)' 
                      : 'none'
                  }}
                />
              ) : (
                <div 
                  className="w-[600px] h-[400px] bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500"
                  dangerouslySetInnerHTML={{ __html: board.schematicSvg }}
                />
              )}

              {/* Watermark de Proteção */}
              <WatermarkOverlay 
                boardCode={board.watermarkCode || board.modelCode}
                intensity="normal"
              />

              {/* SVG Overlay para Desenho das Linhas da Malha */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                {sidePoints.length > 1 && (
                  <path
                    d={`M ${sidePoints.map(p => `${p.xPercent}% ${p.yPercent}%`).join(' L ')}`}
                    fill="none"
                    stroke={activeNet?.colorHex || '#eab308'}
                    strokeWidth="3"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                    style={{
                      filter: `drop-shadow(0 0 8px ${activeNet?.colorHex || '#eab308'})`
                    }}
                  />
                )}
              </svg>

              {/* Marcadores Interativos na Placa */}
              {sidePoints.map((point) => {
                const isPointSelected = selectedPoint?.id === point.id;
                return (
                  <button
                    key={point.id}
                    onClick={() => setSelectedPoint(point)}
                    className={`absolute z-20 transition-all flex items-center justify-center ${
                      point.isVia
                        ? 'w-7 h-7 rounded-full border-2 border-amber-400 bg-amber-950/80 text-amber-300 shadow-lg animate-bounce'
                        : 'w-8 h-8 rounded-full border-2 text-white font-mono text-xs font-bold shadow-xl'
                    }`}
                    style={{
                      left: `${point.xPercent}%`,
                      top: `${point.yPercent}%`,
                      transform: 'translate(-50%, -50%)',
                      borderColor: activeNet?.colorHex || '#eab308',
                      backgroundColor: isPointSelected ? activeNet?.colorHex : 'rgba(15, 23, 42, 0.85)',
                      boxShadow: `0 0 15px ${activeNet?.colorHex || '#eab308'}`
                    }}
                  >
                    {point.isVia ? '⚡' : (point.componentRef?.substring(0, 2) || 'P')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Painel Inferior de Detalhes do Ponto Clicado */}
          {selectedPoint && (
            <div className="p-4 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md flex items-center justify-between animate-slideUp">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm flex items-center gap-2">
                    {selectedPoint.label}
                    {selectedPoint.componentRef && (
                      <span className="font-mono bg-slate-800 text-indigo-300 px-2 py-0.5 rounded text-xs">
                        Ref: {selectedPoint.componentRef} {selectedPoint.pinNumber && `(Pino ${selectedPoint.pinNumber})`}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Malha: <strong className="text-white font-mono">{activeNet?.name}</strong> • Tensão Ativa:{' '}
                    <span className="text-emerald-400 font-mono">{activeNet?.voltage || 'N/A'}</span> • Lado {selectedPoint.side}
                  </div>
                </div>
              </div>

              {selectedPoint.isVia && (
                <button
                  onClick={toggleSide}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
                >
                  <ArrowRightLeft className="w-4 h-4" /> Seguir Via para Lado {activeSide === 'A' ? 'B' : 'A'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
