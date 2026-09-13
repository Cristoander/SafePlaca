import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { BoardProject, BoardComponentMarker, VisualStyle, ComponentKind, BoardJumperWire } from '../types/board';
import { ComponentFootprintView } from './ComponentFootprintView';
import { WireTracerOverlay } from './WireTracerOverlay';
import { WatermarkOverlay } from './WatermarkOverlay';
import { FpcPinoutGeneratorModal } from './FpcPinoutGeneratorModal';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Move, 
  MousePointer, 
  GitCommit, 
  Layers, 
  Sliders, 
  Undo2, 
  Redo2, 
  Trash2, 
  RotateCw, 
  Compass, 
  Activity, 
  Check, 
  X, 
  Sparkles,
  Tag,
  Zap,
  SplitSquareVertical,
  Link2,
  Grid
} from 'lucide-react';

interface ProfessionalBoardWorkbenchProps {
  board: BoardProject;
  markers: BoardComponentMarker[];
  onUpdateMarkers: (markers: BoardComponentMarker[]) => void;
  wires?: BoardJumperWire[];
  onUpdateWires?: (wires: BoardJumperWire[]) => void;
  selectedMarker: BoardComponentMarker | null;
  onSelectMarker: (marker: BoardComponentMarker | null) => void;
  pendingKind: ComponentKind | null;
  onAddMarkerAt: (kind: ComponentKind, x: number, y: number) => void;
  onCancelPendingKind: () => void;
  currentPhoto?: string;
  activeSide: 'A' | 'B';
  onToggleSide: (side: 'A' | 'B') => void;
  style: VisualStyle;
  onOpenAutoScanner?: () => void;
}

type WorkbenchTool = 'select' | 'pan' | 'jumper';

export const ProfessionalBoardWorkbench: React.FC<ProfessionalBoardWorkbenchProps> = ({
  board,
  markers,
  onUpdateMarkers,
  wires = [],
  onUpdateWires,
  selectedMarker,
  onSelectMarker,
  pendingKind,
  onAddMarkerAt,
  onCancelPendingKind,
  currentPhoto,
  activeSide,
  onToggleSide,
  style,
  onOpenAutoScanner,
}) => {
  // Pan & Zoom State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState<WorkbenchTool>('select');

  // Display & Layer States
  const [showMinimap, setShowMinimap] = useState(true);
  const [boardOpacity, setBoardOpacity] = useState(100);
  const [showFootprints, setShowFootprints] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showDiodeValues, setShowDiodeValues] = useState(true);
  const [showWires, setShowWires] = useState(true);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);

  // Dragging Marker State
  const [draggingMarkerId, setDraggingMarkerId] = useState<string | null>(null);
  const [dragStartMouse, setDragStartMouse] = useState({ x: 0, y: 0 });
  const [dragStartMarkerPos, setDragStartMarkerPos] = useState({ x: 0, y: 0 });

  // Jumper Drawing State
  const [drawingWirePoints, setDrawingWirePoints] = useState<{ xPercent: number; yPercent: number }[]>([]);
  const [currentWireColor, setCurrentWireColor] = useState('#eab308');
  const [wireNetName, setWireNetName] = useState('JUMPER_SOLUCAO');
  const [wireUvMasks, setWireUvMasks] = useState<{ xPercent: number; yPercent: number }[]>([]);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);

  // Net Linking & FPC Generator State
  const [linkingSourceMarker, setLinkingSourceMarker] = useState<BoardComponentMarker | null>(null);
  const [isFpcModalOpen, setIsFpcModalOpen] = useState(false);

  // Undo / Redo History
  const [history, setHistory] = useState<{ markers: BoardComponentMarker[]; wires: BoardJumperWire[] }[]>([
    { markers, wires }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const boardImageRef = useRef<HTMLDivElement>(null);

  // Registrar estado no histórico de Undo/Redo
  const pushHistory = useCallback((newMarkers: BoardComponentMarker[], newWires: BoardJumperWire[]) => {
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, { markers: newMarkers, wires: newWires }];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const state = history[prevIndex];
      setHistoryIndex(prevIndex);
      onUpdateMarkers(state.markers);
      if (onUpdateWires) onUpdateWires(state.wires);
    }
  }, [historyIndex, history, onUpdateMarkers, onUpdateWires]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const state = history[nextIndex];
      setHistoryIndex(nextIndex);
      onUpdateMarkers(state.markers);
      if (onUpdateWires) onUpdateWires(state.wires);
    }
  }, [historyIndex, history, onUpdateMarkers, onUpdateWires]);

  // Atalhos de Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Escape') {
        if (drawingWirePoints.length > 0) {
          setDrawingWirePoints([]);
        } else if (pendingKind) {
          onCancelPendingKind();
        } else if (selectedMarker) {
          onSelectMarker(null);
        }
      } else if (e.key === ' ' && !e.repeat) {
        setActiveTool((prev) => (prev === 'pan' ? 'select' : 'pan'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, drawingWirePoints.length, pendingKind, onCancelPendingKind, selectedMarker, onSelectMarker]);

  // Reset de Zoom e Centralização
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.3, 4.0));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.3, 0.5));
  };

  // Zoom via Scroll do Mouse
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = -e.deltaY * 0.0015;
    setZoom((prev) => Math.min(Math.max(prev + zoomDelta, 0.5), 4.0));
  };

  // Panning por Arraste no Container
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if (activeTool === 'pan' || e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    // Arraste de Componente Marcador
    if (draggingMarkerId && boardImageRef.current) {
      const rect = boardImageRef.current.getBoundingClientRect();
      const deltaXPx = (e.clientX - dragStartMouse.x) / zoom;
      const deltaYPx = (e.clientY - dragStartMouse.y) / zoom;

      const deltaXPercent = (deltaXPx / rect.width) * 100;
      const deltaYPercent = (deltaYPx / rect.height) * 100;

      const newX = Math.max(1, Math.min(99, Math.round((dragStartMarkerPos.x + deltaXPercent) * 10) / 10));
      const newY = Math.max(1, Math.min(99, Math.round((dragStartMarkerPos.y + deltaYPercent) * 10) / 10));

      const updated = markers.map((m) =>
        m.id === draggingMarkerId ? { ...m, xPercent: newX, yPercent: newY } : m
      );
      onUpdateMarkers(updated);
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }
    if (draggingMarkerId) {
      setDraggingMarkerId(null);
      pushHistory(markers, wires);
    }
  };

  // Iniciar Arraste de Marcador ou Ligar Malha a Outro Componente
  const handleMarkerMouseDown = (e: React.MouseEvent, marker: BoardComponentMarker) => {
    if (activeTool !== 'select') return;
    e.stopPropagation();

    // Se estiver no modo de Ligar Malha a outro componente
    if (linkingSourceMarker) {
      if (linkingSourceMarker.id === marker.id) {
        setLinkingSourceMarker(null);
        return;
      }
      const commonNet = linkingSourceMarker.netName || marker.netName || `${linkingSourceMarker.reference}_LINE`;
      const commonVoltage = linkingSourceMarker.voltage || marker.voltage;
      const commonDiode = linkingSourceMarker.diodeScaleMv !== undefined ? linkingSourceMarker.diodeScaleMv : marker.diodeScaleMv;

      const updated = markers.map((m) => {
        if (m.id === linkingSourceMarker.id || m.id === marker.id) {
          return {
            ...m,
            netName: commonNet,
            voltage: m.voltage || commonVoltage,
            diodeScaleMv: m.diodeScaleMv !== undefined ? m.diodeScaleMv : commonDiode,
          };
        }
        return m;
      });

      onUpdateMarkers(updated);
      pushHistory(updated, wires);
      setLinkingSourceMarker(null);
      const updatedTarget = updated.find((m) => m.id === marker.id) || marker;
      onSelectMarker(updatedTarget);
      return;
    }

    onSelectMarker(marker);
    setDraggingMarkerId(marker.id);
    setDragStartMouse({ x: e.clientX, y: e.clientY });
    setDragStartMarkerPos({ x: marker.xPercent, y: marker.yPercent });
  };

  // Clique na Placa: Posicionar Marcador ou Adicionar Ponto de Jumper
  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!boardImageRef.current) return;
    const rect = boardImageRef.current.getBoundingClientRect();
    const xPercent = Math.max(1, Math.min(99, Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10));
    const yPercent = Math.max(1, Math.min(99, Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 10));

    // Modo 1: Inserir Componente Pendente
    if (pendingKind) {
      onAddMarkerAt(pendingKind, xPercent, yPercent);
      return;
    }

    // Modo 2: Desenhando Fio Jumper
    if (activeTool === 'jumper') {
      const newPoints = [...drawingWirePoints, { xPercent, yPercent }];
      setDrawingWirePoints(newPoints);
      return;
    }

    // Modo 3: Desmarcar se clicou no vazio
    onSelectMarker(null);
    setSelectedWireId(null);
  };

  // Finalizar e Salvar Jumper
  const handleFinishJumper = () => {
    if (drawingWirePoints.length < 2) return;
    const newWire: BoardJumperWire = {
      id: 'wire-' + Date.now(),
      title: wireNetName,
      netName: wireNetName,
      wireColorHex: currentWireColor,
      wireDiameter: '0.02mm',
      points: drawingWirePoints,
      uvMaskPoints: wireUvMasks,
      side: activeSide,
    };
    const updatedWires = [...wires, newWire];
    if (onUpdateWires) onUpdateWires(updatedWires);
    pushHistory(markers, updatedWires);
    setDrawingWirePoints([]);
    setWireUvMasks([]);
    setSelectedWireId(newWire.id);
  };

  // Cancelar Desenho de Jumper
  const handleCancelJumper = () => {
    setDrawingWirePoints([]);
    setWireUvMasks([]);
  };

  // Excluir Jumper Selecionado
  const handleDeleteWire = (wireId: string) => {
    const updated = wires.filter((w) => w.id !== wireId);
    if (onUpdateWires) onUpdateWires(updated);
    pushHistory(markers, updated);
    setSelectedWireId(null);
  };

  // Rotação rápida do marcador selecionado (+90°)
  const handleRotateSelected = (direction: 'cw' | 'ccw' = 'cw') => {
    if (!selectedMarker) return;
    const currentRot = selectedMarker.rotation || 0;
    const delta = direction === 'cw' ? 90 : -90;
    const newRot = (currentRot + delta + 360) % 360;
    const updatedMarker = { ...selectedMarker, rotation: newRot };
    const updated = markers.map((m) => (m.id === selectedMarker.id ? updatedMarker : m));
    onUpdateMarkers(updated);
    onSelectMarker(updatedMarker);
    pushHistory(updated, wires);
  };

  // Filtros Visuais de Estilo
  const getStyleFilterClass = () => {
    switch (style) {
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

  // Filtragem de marcadores por Lado A ou Lado B
  const visibleMarkers = markers.filter((m) => {
    if (activeSide === 'A') return !m.side || m.side === 'A';
    return m.side === 'B';
  });

  const visibleWires = wires.filter((w) => {
    if (activeSide === 'A') return !w.side || w.side === 'A';
    return w.side === 'B';
  });

  // Malha do componente selecionado (para iluminar peças conectadas e desenhar trilhas laser)
  const netPeers = selectedMarker?.netName
    ? visibleMarkers.filter(
        (m) => m.netName && m.netName.toUpperCase() === selectedMarker.netName?.toUpperCase()
      )
    : [];

  // Minimap Navigation: clicar para centralizar
  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickXRatio = (e.clientX - rect.left) / rect.width;
    const clickYRatio = (e.clientY - rect.top) / rect.height;

    if (containerRef.current && boardImageRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const boardRect = boardImageRef.current.getBoundingClientRect();

      const targetX = -(clickXRatio * boardRect.width - containerRect.width / 2);
      const targetY = -(clickYRatio * boardRect.height - containerRect.height / 2);
      setPan({ x: targetX, y: targetY });
    }
  };

  return (
    <div className="flex flex-col gap-3 font-mono select-none">
      {/* BARRA SUPERIOR DE COMANDOS PROFISSIONAL (Estilo Borneo / ZXW) */}
      <div className="bg-slate-950/95 border border-slate-800 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-md">
        {/* Ferramentas de Modo (Cursor, Mão/Pan, Jumper Tracer) */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => { setActiveTool('select'); setDrawingWirePoints([]); }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTool === 'select' && !pendingKind
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Modo Seleção e Movimento de Peças"
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Seleção</span>
          </button>

          <button
            onClick={() => { setActiveTool('pan'); setDrawingWirePoints([]); }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTool === 'pan'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Modo Mover Tela / Pan (Segure Espaço para ativar temporariamente)"
          >
            <Move className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Arrastar Tela</span>
          </button>

          <button
            onClick={() => { setActiveTool('jumper'); onSelectMarker(null); }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTool === 'jumper'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950 animate-pulse'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Traçar Fio de Jumper / Recuperação de Malha"
          >
            <GitCommit className="w-3.5 h-3.5 text-amber-400" />
            <span>Traçar Jumper</span>
          </button>
        </div>

        {/* Alternador de Face (Lado A / Lado B) & Gerador FPC */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => onToggleSide('A')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeSide === 'A'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>Face A (Top)</span>
            </button>
            <button
              onClick={() => onToggleSide('B')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeSide === 'B'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>Face B (Bottom)</span>
            </button>
          </div>

          {/* Botão Gerador de Conector FPC (Pinos em Grade) */}
          <button
            onClick={() => setIsFpcModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black font-extrabold text-xs shadow-md shadow-amber-950 flex items-center gap-1.5 transition"
            title="Gerar grade de pinos de conector FPC com valores de diodo e voltagem (ex: Subplaca Galaxy A15)"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>+ Conector FPC</span>
          </button>

          {/* Botão Auto Separar Peças (Scanner IA) */}
          {currentPhoto && onOpenAutoScanner && (
            <button
              onClick={onOpenAutoScanner}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-cyan-950 flex items-center gap-1.5 transition"
              title="Detectar e separar automaticamente todos os componentes na foto da placa"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>⚡ Auto Separar Peças</span>
            </button>
          )}
        </div>

        {/* Zoom & Visão */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-xs font-bold text-cyan-400 min-w-[50px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
            title="Redefinir Zoom (100% Centro)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Botão de Menu de Camadas / Opacidade */}
          <div className="relative">
            <button
              onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
              className={`p-1.5 rounded-xl border transition flex items-center gap-1 text-xs font-bold ${
                isLayerMenuOpen
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
              }`}
              title="Configurações de Camadas e Visibilidade"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Camadas</span>
            </button>

            {/* Dropdown de Camadas */}
            {isLayerMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-slate-950 border border-slate-800 rounded-2xl p-3 shadow-2xl z-50 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Camadas & Opacidade
                  </span>
                  <button onClick={() => setIsLayerMenuOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Slider de Opacidade da Placa */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Opacidade da Placa:</span>
                    <span className="text-cyan-400 font-bold">{boardOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={boardOpacity}
                    onChange={(e) => setBoardOpacity(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                {/* Toggles de Exibição */}
                <div className="space-y-1.5 text-xs">
                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer">
                    <span className="flex items-center gap-2 text-slate-300">
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> Footprints Reais
                    </span>
                    <input
                      type="checkbox"
                      checked={showFootprints}
                      onChange={(e) => setShowFootprints(e.target.checked)}
                      className="rounded accent-cyan-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer">
                    <span className="flex items-center gap-2 text-slate-300">
                      <Tag className="w-3.5 h-3.5 text-cyan-400" /> Etiquetas / Códigos
                    </span>
                    <input
                      type="checkbox"
                      checked={showLabels}
                      onChange={(e) => setShowLabels(e.target.checked)}
                      className="rounded accent-cyan-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer">
                    <span className="flex items-center gap-2 text-slate-300">
                      <Activity className="w-3.5 h-3.5 text-rose-400" /> Valores Diodo (mV)
                    </span>
                    <input
                      type="checkbox"
                      checked={showDiodeValues}
                      onChange={(e) => setShowDiodeValues(e.target.checked)}
                      className="rounded accent-cyan-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer">
                    <span className="flex items-center gap-2 text-slate-300">
                      <GitCommit className="w-3.5 h-3.5 text-amber-400" /> Fios Jumper
                    </span>
                    <input
                      type="checkbox"
                      checked={showWires}
                      onChange={(e) => setShowWires(e.target.checked)}
                      className="rounded accent-cyan-500"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Desfazer (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Refazer (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* BARRA DE DESENHO DE JUMPER (Aparece quando a ferramenta Jumper está ativa) */}
      {activeTool === 'jumper' && (
        <div className="bg-amber-950/90 border border-amber-500/70 rounded-2xl p-3 shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs text-amber-300">
            <GitCommit className="w-4 h-4 text-amber-400 animate-spin" />
            <span className="font-bold text-white">Modo Jumper Tracer Ativo:</span>
            <span>Clique nos pontos da placa para traçar a rota do fio de cobre.</span>
            <span className="bg-black/60 px-2 py-0.5 rounded text-amber-400 font-bold">
              Pontos: {drawingWirePoints.length}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Seletor de Malha / Nome */}
            <input
              type="text"
              value={wireNetName}
              onChange={(e) => setWireNetName(e.target.value)}
              placeholder="Nome da Malha (ex: VBUS)"
              className="bg-black/70 border border-amber-600/60 rounded-xl px-2.5 py-1 text-xs text-amber-200 font-bold w-36"
            />

            {/* Paleta de Cores de Fio Esmaltado */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-amber-600/40">
              {[
                { hex: '#eab308', title: 'Cobre Esmaltado Dourado' },
                { hex: '#22c55e', title: 'Verde Máscara UV' },
                { hex: '#3b82f6', title: 'Azul Isolado' },
                { hex: '#ef4444', title: 'Vermelho VCC' },
                { hex: '#94a3b8', title: 'Prata Solda' },
              ].map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setCurrentWireColor(c.hex)}
                  className={`w-5 h-5 rounded-full border-2 transition ${
                    currentWireColor === c.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.title}
                />
              ))}
            </div>

            {/* Botão Ponto de Máscara UV */}
            <button
              onClick={() => {
                if (drawingWirePoints.length > 0) {
                  const lastPoint = drawingWirePoints[drawingWirePoints.length - 1];
                  setWireUvMasks([...wireUvMasks, lastPoint]);
                }
              }}
              disabled={drawingWirePoints.length === 0}
              className="px-2.5 py-1 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 disabled:opacity-40 text-emerald-300 text-xs font-bold border border-emerald-600/50 flex items-center gap-1"
              title="Fixar último ponto com gota de máscara UV verde"
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Fixar UV</span>
            </button>

            {/* Finalizar Fio */}
            <button
              onClick={handleFinishJumper}
              disabled={drawingWirePoints.length < 2}
              className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-extrabold text-xs transition flex items-center gap-1 shadow-lg"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Salvar Fio</span>
            </button>

            <button
              onClick={handleCancelJumper}
              className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs border border-slate-700"
            >
              Limpar
            </button>
          </div>
        </div>
      )}

      {/* BARRA DE LIGAÇÃO DE MALHA ENTRE COMPONENTES */}
      {linkingSourceMarker && (
        <div className="bg-cyan-950/95 border-2 border-cyan-400 rounded-2xl p-3 shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2 text-xs text-cyan-300">
            <Link2 className="w-4 h-4 text-cyan-400 animate-spin" />
            <span className="font-extrabold text-white">Modo Ligar Malha Ativo:</span>
            <span>
              Clique no outro componente ou pino para ligar com <strong className="text-cyan-300 underline">{linkingSourceMarker.reference}</strong> (Malha: <strong className="text-amber-300">{linkingSourceMarker.netName || 'Nova Linha'}</strong>)
            </span>
          </div>
          <button
            onClick={() => setLinkingSourceMarker(null)}
            className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* ÁREA PRINCIPAL DO CANVAS PROFISSIONAL COM PAN E ZOOM */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDownCanvas}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`relative w-full h-[580px] bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl select-none ${
          activeTool === 'pan' || isPanning ? 'cursor-grab active:cursor-grabbing' : pendingKind ? 'cursor-crosshair' : 'cursor-default'
        }`}
      >
        {/* Grid de Fundo Milimetrado Técnico */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#06b6d4 1px, transparent 1px), radial-gradient(#1e293b 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px',
          }}
        />

        {/* CONTAINER TRANSFORMÁVEL (PAN + ZOOM) */}
        <div
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isPanning || draggingMarkerId ? 'none' : 'transform 0.08s ease-out',
          }}
          className="w-full h-full flex items-center justify-center p-8 pointer-events-none"
        >
          {/* Caixa da Imagem da Placa */}
          <div
            ref={boardImageRef}
            onClick={handleBoardClick}
            className={`relative max-w-[900px] w-full rounded-2xl overflow-hidden shadow-2xl border border-cyan-950/60 transition pointer-events-auto ${getStyleFilterClass()}`}
            style={{ opacity: boardOpacity / 100 }}
          >
            {/* Marca D'água Anti-Cópia Protegida */}
            <WatermarkOverlay boardCode={board.modelCode} intensity="normal" />

            {/* Foto Real da Placa ou Vetor SVG */}
            {currentPhoto ? (
              <img
                src={currentPhoto}
                alt={board.title}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                className="w-full h-auto max-h-[500px] object-contain rounded-xl select-none mx-auto block shadow-2xl pointer-events-auto"
              />
            ) : (
              <div
                className="w-full h-auto select-none pointer-events-auto"
                dangerouslySetInnerHTML={{ __html: board.schematicSvg }}
              />
            )}

            {/* CAMADA VETORIAL DE FIOS DE JUMPER */}
            {showWires && (
              <WireTracerOverlay
                wires={visibleWires}
                activeDrawingWire={drawingWirePoints}
                currentDrawingColor={currentWireColor}
                onSelectWire={(w) => setSelectedWireId(w.id)}
                selectedWireId={selectedWireId || undefined}
              />
            )}

            {/* TRILHAS LASER VIRTUAIS ENTRE COMPONENTES DA MESMA MALHA (RATSNEST) */}
            {netPeers.length > 1 && selectedMarker && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                {netPeers.map((peer) => {
                  if (peer.id === selectedMarker.id) return null;
                  return (
                    <g key={`net-line-${peer.id}`}>
                      {/* Linha externa de brilho neon */}
                      <line
                        x1={`${selectedMarker.xPercent}%`}
                        y1={`${selectedMarker.yPercent}%`}
                        x2={`${peer.xPercent}%`}
                        y2={`${peer.yPercent}%`}
                        stroke="#06b6d4"
                        strokeWidth="3.5"
                        strokeDasharray="6 4"
                        strokeLinecap="round"
                        className="animate-pulse drop-shadow-[0_0_10px_rgba(6,182,212,0.95)] opacity-90"
                      />
                      {/* Linha interna branca de centro */}
                      <line
                        x1={`${selectedMarker.xPercent}%`}
                        y1={`${selectedMarker.yPercent}%`}
                        x2={`${peer.xPercent}%`}
                        y2={`${peer.yPercent}%`}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        strokeDasharray="6 4"
                        strokeLinecap="round"
                        className="opacity-70"
                      />
                    </g>
                  );
                })}
              </svg>
            )}

            {/* MARCADORES / COMPONENTES ELETRÔNICOS REALISTAS */}
            {visibleMarkers.map((marker) => {
              const isSelected = selectedMarker?.id === marker.id;
              const isDragging = draggingMarkerId === marker.id;
              const isInSameNet = Boolean(
                selectedMarker?.netName &&
                marker.netName &&
                marker.netName.toUpperCase() === selectedMarker.netName.toUpperCase() &&
                marker.id !== selectedMarker.id
              );
              const isLinkingTargetCandidate = Boolean(
                linkingSourceMarker && linkingSourceMarker.id !== marker.id
              );

              return (
                <div
                  key={marker.id}
                  onMouseDown={(e) => handleMarkerMouseDown(e, marker)}
                  style={{
                    left: `${marker.xPercent}%`,
                    top: `${marker.yPercent}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing z-30 transition-all ${
                    isDragging ? 'opacity-80 scale-110 z-40' : ''
                  } ${isInSameNet ? 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-slate-950 animate-pulse z-35 scale-110 shadow-lg shadow-cyan-500/50' : ''} ${
                    isLinkingTargetCandidate ? 'ring-4 ring-amber-400 animate-bounce cursor-pointer' : ''
                  }`}
                >
                  {/* Renderizador de Footprint Realista */}
                  {showFootprints ? (
                    <ComponentFootprintView marker={marker} isSelected={isSelected} />
                  ) : (
                    /* Modo Ponto Simples */
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[9px] font-black text-white shadow-xl ${
                        marker.kind === 'bobina' ? 'bg-indigo-600 border-indigo-400' :
                        marker.kind === 'conector' ? 'bg-amber-600 border-amber-400' :
                        marker.kind === 'diodo' ? 'bg-rose-600 border-rose-400' :
                        marker.kind === 'ci' ? 'bg-emerald-600 border-emerald-400' :
                        marker.kind === 'termistor' ? 'bg-red-600 border-red-400' :
                        'bg-cyan-600 border-cyan-400'
                      } ${isSelected ? 'ring-4 ring-cyan-400/80' : ''}`}
                    >
                      {marker.reference.slice(0, 2)}
                    </div>
                  )}

                  {/* Etiqueta Flutuante de Referência */}
                  {showLabels && (
                    <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 border border-slate-700 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold text-white shadow-lg pointer-events-none">
                      {marker.reference}
                    </span>
                  )}

                  {/* Valor de Condução Reversa (mV) */}
                  {showDiodeValues && marker.diodeScaleMv !== undefined && (
                    <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-rose-950/95 border border-rose-700/80 px-1 py-0.2 rounded text-[7px] font-mono font-bold text-rose-300 shadow pointer-events-none">
                      {marker.diodeScaleMv}mV
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RADAR MINIMAP (Canto Inferior Direito) */}
        {showMinimap && (
          <div className="absolute bottom-4 right-4 z-40 bg-slate-950/90 border border-slate-800 rounded-2xl p-2 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
              <span className="flex items-center gap-1">
                <Compass className="w-3 h-3 text-cyan-400" />
                RADAR MINIMAP
              </span>
              <button
                onClick={() => setShowMinimap(false)}
                className="text-slate-500 hover:text-white"
                title="Minimizar Radar"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div
              onClick={handleMinimapClick}
              className="relative w-36 h-24 bg-slate-900 rounded-xl overflow-hidden border border-slate-700/60 cursor-pointer group"
            >
              {currentPhoto ? (
                <img
                  src={currentPhoto}
                  alt="Minimap"
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600 font-bold">
                  PLACA
                </div>
              )}

              {/* Retângulo de Visualização do Viewport */}
              <div
                style={{
                  width: `${Math.max(20, Math.min(100, 100 / zoom))}%`,
                  height: `${Math.max(20, Math.min(100, 100 / zoom))}%`,
                  left: `${Math.max(0, Math.min(80, 50 - pan.x * 0.05))}%`,
                  top: `${Math.max(0, Math.min(80, 50 - pan.y * 0.05))}%`,
                }}
                className="absolute border-2 border-cyan-400 bg-cyan-400/20 rounded pointer-events-none shadow"
              />
            </div>
          </div>
        )}

        {/* Botão para reabrir minimap se fechado */}
        {!showMinimap && (
          <button
            onClick={() => setShowMinimap(true)}
            className="absolute bottom-4 right-4 z-40 p-2 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-400 hover:text-white shadow-xl"
            title="Abrir Radar Minimap"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
          </button>
        )}

        {/* HUD FLUTUANTE RÁPIDO DO COMPONENTE SELECIONADO (Estilo ZXW / Borneo) */}
        {selectedMarker && (
          <div className="absolute top-4 left-4 z-40 bg-slate-950/95 border border-cyan-500/50 rounded-2xl p-3 shadow-2xl backdrop-blur-md max-w-xs animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-extrabold text-white text-xs tracking-wider">
                  {selectedMarker.reference}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {selectedMarker.kind.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => onSelectMarker(null)}
                className="text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-slate-300 font-medium truncate">
                {selectedMarker.name}
              </div>

              {/* Malha associada */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Malha:</span>
                <span className="text-cyan-300 font-bold font-mono text-[11px] truncate max-w-[160px]">
                  {selectedMarker.netName || 'Sem Malha'}
                </span>
              </div>

              {/* Quantidade de componentes interligados */}
              {netPeers.length > 1 && (
                <div className="text-[10px] text-emerald-300 font-bold flex items-center gap-1 bg-emerald-950/60 p-1.5 rounded-lg border border-emerald-700/60 animate-in fade-in">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>{netPeers.length} pontos ligados nesta malha!</span>
                </div>
              )}

              {/* Valores rápidos */}
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-center">
                  <span className="text-[10px] text-slate-400 block">Diodo (mV)</span>
                  <span className="text-rose-400 font-bold font-mono">
                    {selectedMarker.diodeScaleMv !== undefined ? `${selectedMarker.diodeScaleMv} mV` : 'N/A'}
                  </span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-center">
                  <span className="text-[10px] text-slate-400 block">Tensão</span>
                  <span className="text-cyan-300 font-bold font-mono">
                    {selectedMarker.voltage || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Rotação e Ações Rápidas */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-1.5">
                <button
                  onClick={() => setLinkingSourceMarker(linkingSourceMarker?.id === selectedMarker.id ? null : selectedMarker)}
                  className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition ${
                    linkingSourceMarker?.id === selectedMarker.id
                      ? 'bg-amber-500 text-black shadow-lg animate-pulse'
                      : 'bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60'
                  }`}
                  title="Ligar e conectar este componente a outro (compartilhar mesma malha elétrica)"
                >
                  <Link2 className="w-3 h-3" />
                  <span>{linkingSourceMarker?.id === selectedMarker.id ? 'Cancel. Ligação' : 'Ligar Malha'}</span>
                </button>

                <button
                  onClick={() => handleRotateSelected('cw')}
                  className="py-1 px-2 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-bold flex items-center justify-center gap-1 transition"
                  title="Girar Footprint +90 Graus"
                >
                  <RotateCw className="w-3 h-3 text-cyan-400" />
                  <span>90°</span>
                </button>

                <button
                  onClick={() => {
                    const updated = markers.filter((m) => m.id !== selectedMarker.id);
                    onUpdateMarkers(updated);
                    onSelectMarker(null);
                    pushHistory(updated, wires);
                  }}
                  className="py-1 px-2 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800/60 text-[11px] font-bold flex items-center justify-center gap-1 transition"
                  title="Excluir este componente"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HUD FLUTUANTE DO FIO JUMPER SELECIONADO */}
        {selectedWireId && (
          <div className="absolute top-4 right-4 z-40 bg-slate-950/95 border border-amber-500/50 rounded-2xl p-3 shadow-2xl backdrop-blur-md max-w-xs animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <span className="font-extrabold text-amber-300 text-xs flex items-center gap-1.5">
                <GitCommit className="w-3.5 h-3.5 text-amber-400" />
                FIO JUMPER
              </span>
              <button
                onClick={() => setSelectedWireId(null)}
                className="text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {(() => {
              const wire = wires.find((w) => w.id === selectedWireId);
              if (!wire) return null;
              return (
                <div className="space-y-2 text-xs">
                  <div className="text-white font-bold">{wire.title || wire.netName}</div>
                  <div className="text-slate-400 text-[11px]">
                    Pontos de Traçado: <span className="text-amber-400">{wire.points.length} nós</span>
                  </div>
                  <button
                    onClick={() => handleDeleteWire(wire.id)}
                    className="w-full py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800/60 font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Excluir Jumper
                  </button>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* MODAL GERADOR DE CONECTOR FPC VIRTUAL */}
      {isFpcModalOpen && (
        <FpcPinoutGeneratorModal
          isOpen={isFpcModalOpen}
          onClose={() => setIsFpcModalOpen(false)}
          activeSide={activeSide}
          onGeneratePins={(newPins) => {
            const updated = [...markers, ...newPins];
            onUpdateMarkers(updated);
            pushHistory(updated, wires);
            if (newPins[0]) onSelectMarker(newPins[0]);
          }}
        />
      )}
    </div>
  );
};
