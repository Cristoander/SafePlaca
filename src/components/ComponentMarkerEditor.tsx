import React, { useState, useRef } from 'react';
import type { BoardProject, BoardComponentMarker, VisualStyle, ComponentKind } from '../types/board';
import { WatermarkOverlay } from './WatermarkOverlay';
import { Sparkles, Plus, X, Upload } from 'lucide-react';

interface ComponentMarkerEditorProps {
  board: BoardProject;
  onUpdateMarkers?: (markers: BoardComponentMarker[]) => void;
  onUpdatePhoto?: (photoUrl: string) => void;
}

export const ComponentMarkerEditor: React.FC<ComponentMarkerEditorProps> = ({
  board,
  onUpdateMarkers,
  onUpdatePhoto,
}) => {
  const [style, setStyle] = useState<VisualStyle>('normal');
  const [markers, setMarkers] = useState<BoardComponentMarker[]>(board.markers || []);
  const [selectedMarker, setSelectedMarker] = useState<BoardComponentMarker | null>(
    board.markers && board.markers[0] ? board.markers[0] : null
  );
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [newKind, setNewKind] = useState<ComponentKind>('bobina');
  const [newRef, setNewRef] = useState('L3002');
  const [newName, setNewName] = useState('Bobina de Alimentação');
  const [newDiodeMv, setNewDiodeMv] = useState<number>(510);
  const [newVoltage, setNewVoltage] = useState('5.0V');
  const [newTip, setNewTip] = useState('Testar continuidade (0 ohms)');

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingMarker || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const created: BoardComponentMarker = {
      id: 'marker-' + Date.now(),
      kind: newKind,
      reference: newRef || 'COMP1',
      name: newName || 'Componente Mapeado',
      xPercent: Math.max(2, Math.min(98, x)),
      yPercent: Math.max(2, Math.min(98, y)),
      functionDesc: 'Mapeado na bancada de testes.',
      diodeScaleMv: Number(newDiodeMv) || undefined,
      voltage: newVoltage || undefined,
      repairTip: newTip || undefined,
    };

    const updated = [...markers, created];
    setMarkers(updated);
    setSelectedMarker(created);
    setIsAddingMarker(false);
    if (onUpdateMarkers) onUpdateMarkers(updated);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result && onUpdatePhoto) {
        onUpdatePhoto(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Cores por tipo de componente
  const getKindColor = (kind: ComponentKind) => {
    switch (kind) {
      case 'bobina':
        return { bg: 'bg-indigo-600', border: 'border-indigo-400', text: 'text-indigo-300' };
      case 'conector':
        return { bg: 'bg-amber-600', border: 'border-amber-400', text: 'text-amber-300' };
      case 'diodo':
        return { bg: 'bg-rose-600', border: 'border-rose-400', text: 'text-rose-300' };
      case 'ci':
        return { bg: 'bg-emerald-600', border: 'border-emerald-400', text: 'text-emerald-300' };
      case 'termistor':
        return { bg: 'bg-red-600', border: 'border-red-400', text: 'text-red-300' };
      default:
        return { bg: 'bg-cyan-600', border: 'border-cyan-400', text: 'text-cyan-300' };
    }
  };

  // Classes de estilo visual
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

  return (
    <div className="space-y-4 no-copy-shield font-mono">
      {/* Barra Superior de Estilos & Ações */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
        {/* Alternador de Estilo Visual */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            VISUALIZAÇÃO:
          </span>
          {(['normal', 'blueprint', 'xray', 'edges'] as VisualStyle[]).map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                style === s
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {s === 'normal' && 'Foto Original'}
              {s === 'blueprint' && 'Blueprint'}
              {s === 'xray' && 'Raio-X PCB'}
              {s === 'edges' && 'Bordas'}
            </button>
          ))}
        </div>

        {/* Upload de Foto da Bancada & Adicionar Marcador */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 flex items-center gap-1.5 transition"
            title="Carregar foto da placa do celular ou microscópio"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Subir Foto Placa</span>
          </button>

          <button
            onClick={() => setIsAddingMarker(!isAddingMarker)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              isAddingMarker
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingMarker ? 'Clique na Placa...' : '+ Marcar Componente'}</span>
          </button>
        </div>
      </div>

      {/* Formulário rápido de marcador se ativo */}
      {isAddingMarker && (
        <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-4 text-xs space-y-3">
          <div className="flex items-center justify-between text-amber-300 font-bold">
            <span>Passo 1: Configure o componente e DEPOIS clique na placa para posicionar:</span>
            <button onClick={() => setIsAddingMarker(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">Tipo:</label>
              <select
                value={newKind}
                onChange={(e) => setNewKind(e.target.value as ComponentKind)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-white"
              >
                <option value="bobina">Bobina</option>
                <option value="conector">Conector</option>
                <option value="diodo">Diodo / TVS</option>
                <option value="ci">CI / OVP</option>
                <option value="termistor">Termistor NTC</option>
                <option value="capacitor">Capacitor</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-slate-400 block mb-1">Dica de Reparo / Sintoma:</label>
              <input
                type="text"
                value={newTip}
                onChange={(e) => setNewTip(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Ref (Ex: L3001):</label>
              <input
                type="text"
                value={newRef}
                onChange={(e) => setNewRef(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Nome:</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Escala Diodo (mV):</label>
              <input
                type="number"
                value={newDiodeMv}
                onChange={(e) => setNewDiodeMv(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-amber-400"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Tensão (V):</label>
              <input
                type="text"
                value={newVoltage}
                onChange={(e) => setNewVoltage(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-cyan-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* Workspace Visual com a Placa e os Marcadores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Imagem da Placa com Marcadores Hotspot */}
        <div className="lg:col-span-2 relative bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-2 flex flex-col justify-center items-center min-h-[380px]">
          {/* MARCA D'ÁGUA OBRIGATÓRIA DA SAFEPLACA */}
          <WatermarkOverlay boardCode={board.modelCode} intensity="normal" />

          <div
            ref={containerRef}
            onClick={handleContainerClick}
            className={`relative w-full max-w-[880px] overflow-hidden rounded-2xl cursor-${
              isAddingMarker ? 'crosshair' : 'default'
            } transition duration-300 ${getStyleFilterClass()}`}
          >
            {/* Foto Real ou Vetor da Placa */}
            {board.realPhotoUrl ? (
              <img
                src={board.realPhotoUrl}
                alt={board.title}
                draggable={false}
                className="w-full h-auto object-contain rounded-xl select-none protected-media"
              />
            ) : (
              <div
                className="w-full h-auto select-none pointer-events-none"
                dangerouslySetInnerHTML={{ __html: board.schematicSvg }}
              />
            )}

            {/* MARCADORES INTERATIVOS SOBRE A PLACA */}
            {markers.map((marker) => {
              const colors = getKindColor(marker.kind);
              const isSelected = selectedMarker?.id === marker.id;
              return (
                <div
                  key={marker.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMarker(marker);
                  }}
                  style={{
                    left: `${marker.xPercent}%`,
                    top: `${marker.yPercent}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20 transition-transform ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full ${colors.bg} border-2 ${
                      isSelected ? 'border-white ring-4 ring-cyan-400/50' : colors.border
                    } flex items-center justify-center text-[9px] font-black text-white shadow-xl`}
                  >
                    {marker.reference.slice(0, 2)}
                  </div>
                  {/* Etiqueta flutuante */}
                  <span className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 backdrop-blur-sm border border-slate-700 px-1.5 py-0.5 rounded text-[9px] font-bold text-white opacity-90">
                    {marker.reference}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Painel Lateral de Detalhes do Componente Selecionado */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between shadow-xl">
          {selectedMarker ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg uppercase ${getKindColor(selectedMarker.kind).bg} text-white`}>
                  {selectedMarker.kind.toUpperCase()}
                </span>
                <span className="text-sm font-black text-cyan-400 font-mono">
                  {selectedMarker.reference}
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-white mb-1">{selectedMarker.name}</h4>
                <p className="text-xs text-slate-400">{selectedMarker.functionDesc}</p>
              </div>

              {/* Display de Medição */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Escala de Diodo</span>
                  <span className="text-lg font-black text-amber-400">
                    {selectedMarker.diodeScaleMv ? `${selectedMarker.diodeScaleMv} mV` : 'N/A'}
                  </span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Tensão Nominal</span>
                  <span className="text-lg font-black text-cyan-400">
                    {selectedMarker.voltage || 'N/A'}
                  </span>
                </div>
              </div>

              {selectedMarker.faultSymptom && (
                <div className="bg-red-950/40 border border-red-800/40 p-3 rounded-xl text-xs space-y-1 text-red-300">
                  <span className="font-bold text-[10px] text-red-400 block uppercase">Sintoma se Danificado:</span>
                  <p>{selectedMarker.faultSymptom}</p>
                </div>
              )}

              {selectedMarker.repairTip && (
                <div className="bg-emerald-950/40 border border-emerald-800/40 p-3 rounded-xl text-xs space-y-1 text-emerald-300">
                  <span className="font-bold text-[10px] text-emerald-400 block uppercase">Ação Recomendada de Bancada:</span>
                  <p>{selectedMarker.repairTip}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Selecione um componente na placa para inspecionar valores de escala de diodo e instruções de reparo.
            </div>
          )}

          {/* Lista rápida de componentes mapeados */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block mb-2 font-bold">
              Todos os Componentes ({markers.length}):
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
              {markers.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMarker(m)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                    selectedMarker?.id === m.id
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {m.reference}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
