import React, { useState, useRef } from 'react';
import type { BoardProject, TestPoint } from '../types/board';
import { WatermarkOverlay } from './WatermarkOverlay';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, X, Tv, Sliders, Activity, Layers } from 'lucide-react';

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
  const [showPinout, setShowPinout] = useState<boolean>(true);
  const [highContrast, setHighContrast] = useState<boolean>(false);

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

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col text-slate-100 overflow-hidden select-none no-copy-shield">
      {/* Top Bar Projetor */}
      <header className="h-14 bg-slate-950/95 border-b border-slate-800 px-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-950/70 border border-amber-500/40 rounded-lg text-amber-400 font-mono text-xs">
            <Tv className="w-4 h-4 animate-pulse" />
            <span className="font-bold">MODO PROJETOR ATIVO</span>
          </div>
          <span className="font-mono text-xs text-slate-400">|</span>
          <div>
            <h2 className="text-sm font-bold text-white leading-none">{board.title}</h2>
            <p className="text-[10px] text-cyan-400 font-mono mt-0.5">{board.modelCode} • {board.category}</p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
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

          {/* Toggle contrast */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition flex items-center gap-1.5 ${
              highContrast
                ? 'bg-amber-500 text-black border-amber-400 font-bold'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Alto Contraste</span>
          </button>

          {/* Toggle pinout side */}
          <button
            onClick={() => setShowPinout(!showPinout)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition flex items-center gap-1.5 ${
              showPinout
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Pinagem</span>
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
          className={`flex-1 relative overflow-hidden cursor-${isDragging ? 'grabbing' : 'grab'} ${
            highContrast ? 'contrast-150 brightness-110' : ''
          }`}
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
              className="w-[920px] max-w-none shadow-2xl rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950"
              dangerouslySetInnerHTML={{ __html: board.schematicSvg }}
            />
          </div>

          {/* Dica flutuante de navegação */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none bg-slate-950/70 backdrop-blur-sm border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] font-mono text-slate-400">
            Use a roda do mouse para <span className="text-cyan-300 font-bold">Zoom</span> ou arraste para movimentar a bancada.
          </div>
        </div>

        {/* Drawer Lateral de Pinagem & Multímetro */}
        {showPinout && (
          <aside className="w-80 lg:w-96 bg-slate-950/95 border-l border-slate-800 flex flex-col shrink-0 z-30 shadow-2xl overflow-hidden">
            {/* Header Lateral */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">Inspeção &amp; Medições</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                PROJETOR BANCADA
              </span>
            </div>

            {/* Conteúdo com rolagem */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Simulador de Medição de Multímetro */}
              {selectedTP && (
                <div className="bg-slate-900/90 border-2 border-cyan-500/50 rounded-2xl p-4 shadow-lg shadow-cyan-950/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-xs font-bold border border-cyan-700/50">
                      {selectedTP.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      Sinal: {selectedTP.signalType}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-sm mb-1">{selectedTP.label}</h4>
                  <p className="text-xs text-slate-400 mb-3">{selectedTP.description}</p>

                  {/* Display Digital do Multímetro Virtual */}
                  <div className="bg-black/80 border border-slate-700 rounded-xl p-3 font-mono text-center mb-3">
                    <span className="text-[10px] text-slate-400 block">VALOR ESPERADO NO MULTÍMETRO</span>
                    <span className="text-2xl font-black text-amber-400 tracking-wider">
                      {selectedTP.expectedVoltage}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Tolerância: {selectedTP.tolerance}</span>
                  </div>

                  {/* Sintomas de Falha */}
                  <div className="space-y-1.5 text-xs">
                    <div className="bg-emerald-950/40 border border-emerald-800/40 p-2 rounded-lg text-emerald-300">
                      <span className="font-bold block text-[10px] uppercase text-emerald-400">Comportamento Normal:</span>
                      {selectedTP.normalBehavior}
                    </div>
                    <div className="bg-red-950/40 border border-red-800/40 p-2 rounded-lg text-red-300">
                      <span className="font-bold block text-[10px] uppercase text-red-400">Se apresentar defeito:</span>
                      {selectedTP.faultSymptom}
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de Pontos de Teste (Clicáveis) */}
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-2 uppercase tracking-wide">
                  Pontos de Teste na Placa:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {board.testPoints.map((tp) => (
                    <button
                      key={tp.id}
                      onClick={() => setSelectedTP(tp)}
                      className={`p-2 rounded-xl text-left font-mono text-xs border transition flex items-center justify-between ${
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

              {/* Pinagem de Conexão Rápida */}
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-2 uppercase tracking-wide">
                  Tabela de Pinos &amp; Ligações:
                </label>
                <div className="space-y-1.5">
                  {board.pinouts.map((pin, index) => (
                    <div
                      key={index}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: pin.wireColorHex || '#38bdf8' }}
                        />
                        <span className="font-bold text-white">{pin.name}</span>
                      </div>
                      <span className="text-cyan-300 font-semibold">{pin.voltage}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabela de Programação Rprog se existir */}
              {board.progTable && board.progTable.length > 0 && (
                <div>
                  <label className="text-[11px] font-mono text-amber-400 block mb-2 uppercase tracking-wide font-bold">
                    Resistor Rprog • Ajuste de Corrente:
                  </label>
                  <div className="bg-slate-900 rounded-xl border border-amber-500/30 overflow-hidden text-[11px] font-mono">
                    <table className="w-full text-left">
                      <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
                        <tr>
                          <th className="p-2">Resistor</th>
                          <th className="p-2">Corrente</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {board.progTable.map((p, i) => (
                          <tr key={i} className="hover:bg-slate-800/40">
                            <td className="p-2 font-bold text-cyan-300">{p.resistor}</td>
                            <td className="p-2 text-amber-300">{p.current}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
