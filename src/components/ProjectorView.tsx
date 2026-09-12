import React, { useState, useRef } from 'react';
import type { BoardProject, TestPoint, BoardComponentMarker, VisualStyle } from '../types/board';
import { WatermarkOverlay } from './WatermarkOverlay';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  X, 
  Tv, 
  Activity, 
  Layers,
  Wrench,
  Cpu
} from 'lucide-react';

interface ProjectorViewProps {
  board: BoardProject;
  onClose: () => void;
}

export const ProjectorView: React.FC<ProjectorViewProps> = ({ board, onClose }) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedTP, setSelectedTP] = useState<TestPoint | null>(board.testPoints[0] || null);
  const [selectedMarker, setSelectedMarker] = useState<BoardComponentMarker | null>(
    board.markers && board.markers[0] ? board.markers[0] : null
  );
  const [showSidePanel, setShowSidePanel] = useState<boolean>(true);
  const [sidebarTab, setSidebarTab] = useState<'multimeter' | 'markers' | 'faults' | 'pinout'>('multimeter');
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('normal');

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.5), 3.5));
  };

  const resetTransform = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const getStyleFilterClass = () => {
    switch (visualStyle) {
      case 'blueprint':
        return 'invert hue-rotate-180 brightness-90 saturate-150 contrast-125';
      case 'xray':
        return 'invert hue-rotate-90 brightness-110 contrast-200';
      case 'edges':
        return 'contrast-200 brightness-125 sepia';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col text-slate-100 overflow-hidden select-none no-copy-shield">
      {/* Top Bar Projetor */}
      <header className="h-14 bg-slate-950/95 border-b border-slate-800 px-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-950/70 border border-amber-500/40 rounded-lg text-amber-400 font-mono text-xs">
            <Tv className="w-4 h-4 animate-pulse" />
            <span className="font-bold">PROJETOR BANCADA</span>
          </div>
          <span className="font-mono text-xs text-slate-400">|</span>
          <div>
            <h2 className="text-sm font-bold text-white leading-none">{board.title}</h2>
            <p className="text-[10px] text-cyan-400 font-mono mt-0.5">{board.modelCode}</p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Alternador de Estilo */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-0.5 text-xs font-mono">
            {(['normal', 'blueprint', 'xray'] as VisualStyle[]).map((s) => (
              <button
                key={s}
                onClick={() => setVisualStyle(s)}
                className={`px-2 py-1 rounded-lg transition ${
                  visualStyle === s
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s === 'normal' && 'Normal'}
                {s === 'blueprint' && 'Blueprint'}
                {s === 'xray' && 'Raio-X'}
              </button>
            ))}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-0.5 text-xs font-mono">
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white"
              title="Zoom Menos"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 font-bold text-cyan-300 min-w-[50px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.2, 3.5))}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white"
              title="Zoom Mais"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={resetTransform}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white border-l border-slate-800 ml-1"
              title="Resetar Posição"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toggle sidebar */}
          <button
            onClick={() => setShowSidePanel(!showSidePanel)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition flex items-center gap-1.5 ${
              showSidePanel
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Painel</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
            title="Alternar Tela Cheia"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Exit */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 hover:bg-red-900 hover:text-white ml-2 transition"
            title="Sair do Modo Projetor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex relative overflow-hidden bg-[#03060f]">
        {/* Canvas de Projeção */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          className={`flex-1 relative overflow-hidden cursor-${isDragging ? 'grabbing' : 'grab'}`}
        >
          {/* MARCA D'ÁGUA OBRIGATÓRIA DA SAFEPLACA */}
          <WatermarkOverlay boardCode={board.modelCode} intensity="normal" showBadge={true} />

          {/* Esquema Escalável */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.08s ease-out',
            }}
            className="w-full h-full flex items-center justify-center p-8 pointer-events-none"
          >
            <div 
              className={`relative w-[960px] max-w-none shadow-2xl rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950 transition duration-300 ${getStyleFilterClass()}`}
            >
              <div dangerouslySetInnerHTML={{ __html: board.schematicSvg }} />

              {/* Marcadores sobrepostos se existirem */}
              {board.markers && board.markers.map((marker) => (
                <div
                  key={marker.id}
                  style={{
                    left: `${marker.xPercent}%`,
                    top: `${marker.yPercent}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer"
                  onClick={() => {
                    setSelectedMarker(marker);
                    setSidebarTab('markers');
                    setShowSidePanel(true);
                  }}
                >
                  <div className="w-6 h-6 rounded-full bg-cyan-600 border-2 border-white flex items-center justify-center text-[9px] font-black text-white shadow-xl hover:scale-125 transition">
                    {marker.reference.slice(0, 2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Lateral de Diagnóstico & Medição */}
        {showSidePanel && (
          <aside className="w-80 lg:w-96 bg-slate-950/95 border-l border-slate-800 flex flex-col shrink-0 z-30 shadow-2xl overflow-hidden font-mono">
            {/* Header Lateral com Abas */}
            <div className="p-2 border-b border-slate-800 bg-slate-900/60 flex items-center justify-around gap-1 text-[11px]">
              <button
                onClick={() => setSidebarTab('multimeter')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                  sidebarTab === 'multimeter'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Multímetro</span>
              </button>

              {board.markers && board.markers.length > 0 && (
                <button
                  onClick={() => setSidebarTab('markers')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                    sidebarTab === 'markers'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Componentes</span>
                </button>
              )}

              {board.commonFaults && board.commonFaults.length > 0 && (
                <button
                  onClick={() => setSidebarTab('faults')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                    sidebarTab === 'faults'
                      ? 'bg-amber-950 text-amber-300 border border-amber-700/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Defeitos</span>
                </button>
              )}
            </div>

            {/* Conteúdo com rolagem */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* ABA MULTÍMETRO */}
              {sidebarTab === 'multimeter' && (
                <>
                  {selectedTP && (
                    <div className="bg-slate-900/90 border-2 border-cyan-500/50 rounded-2xl p-4 shadow-lg shadow-cyan-950/40">
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-xs font-bold border border-cyan-700/50">
                          {selectedTP.id}
                        </span>
                        {selectedTP.diodeScaleMv && (
                          <span className="text-[10px] text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded">
                            DIODO: {selectedTP.diodeScaleMv} mV
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-white text-sm mb-1">{selectedTP.label}</h4>
                      <p className="text-xs text-slate-400 mb-3">{selectedTP.description}</p>

                      <div className="bg-black/80 border border-slate-700 rounded-xl p-3 text-center mb-3">
                        <span className="text-[10px] text-slate-400 block">VALOR ESPERADO NO MULTÍMETRO</span>
                        <span className="text-2xl font-black text-amber-400 tracking-wider">
                          {selectedTP.expectedVoltage}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Tolerância: {selectedTP.tolerance}</span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="bg-emerald-950/40 border border-emerald-800/40 p-2 rounded-lg text-emerald-300">
                          <span className="font-bold block text-[10px] uppercase text-emerald-400">Normal:</span>
                          {selectedTP.normalBehavior}
                        </div>
                        <div className="bg-red-950/40 border border-red-800/40 p-2 rounded-lg text-red-300">
                          <span className="font-bold block text-[10px] uppercase text-red-400">Se com Defeito:</span>
                          {selectedTP.faultSymptom}
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-2 uppercase tracking-wide">
                      Pontos de Teste na Placa:
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {board.testPoints.map((tp) => (
                        <button
                          key={tp.id}
                          onClick={() => setSelectedTP(tp)}
                          className={`p-2 rounded-xl text-left text-xs border transition flex items-center justify-between ${
                            selectedTP?.id === tp.id
                              ? 'bg-cyan-950 text-cyan-200 border-cyan-500 shadow-md shadow-cyan-950/50'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          <span className="font-bold">{tp.id}</span>
                          <span className="text-[10px] text-amber-400">{tp.expectedVoltage.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ABA COMPONENTES */}
              {sidebarTab === 'markers' && (
                <div className="space-y-3">
                  {selectedMarker ? (
                    <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-bold text-white text-sm">{selectedMarker.name}</span>
                        <span className="text-cyan-400 font-bold text-xs">{selectedMarker.reference}</span>
                      </div>
                      <p className="text-xs text-slate-400">{selectedMarker.functionDesc}</p>
                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Diodo (mV)</span>
                          <span className="font-black text-amber-400">{selectedMarker.diodeScaleMv || 'N/A'}</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Tensão</span>
                          <span className="font-black text-cyan-400">{selectedMarker.voltage || 'N/A'}</span>
                        </div>
                      </div>
                      {selectedMarker.repairTip && (
                        <div className="bg-emerald-950/40 p-2 rounded-xl border border-emerald-800/40 text-xs text-emerald-300">
                          <span className="font-bold block text-[10px] uppercase text-emerald-400">Dica Bancada:</span>
                          {selectedMarker.repairTip}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Selecione um componente abaixo.</p>
                  )}

                  <div className="space-y-1.5">
                    {board.markers && board.markers.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMarker(m)}
                        className={`w-full p-2 rounded-xl text-left text-xs border transition flex items-center justify-between ${
                          selectedMarker?.id === m.id
                            ? 'bg-cyan-950 text-cyan-200 border-cyan-500'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        <span className="font-bold">{m.reference}</span>
                        <span className="text-[10px] text-slate-400">{m.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ABA DEFEITOS RÁPIDOS */}
              {sidebarTab === 'faults' && (
                <div className="space-y-3">
                  {board.commonFaults && board.commonFaults.map((f) => (
                    <div key={f.id} className="bg-slate-900 p-3 rounded-2xl border border-amber-500/30 text-xs space-y-2">
                      <span className="font-bold text-amber-400 block text-xs">{f.title}</span>
                      <p className="text-slate-300 text-[11px] font-sans">{f.symptom}</p>
                      <div className="bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/40 text-emerald-300 text-[11px] font-sans">
                        <span className="font-bold text-[10px] text-emerald-400 block uppercase">Solução:</span>
                        {f.solution}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
