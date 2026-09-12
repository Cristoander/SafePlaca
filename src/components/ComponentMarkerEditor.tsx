import React, { useState, useRef, useEffect } from 'react';
import type { BoardProject, BoardComponentMarker, VisualStyle, ComponentKind } from '../types/board';
import { WatermarkOverlay } from './WatermarkOverlay';
import { compressImageFile } from '../utils/compressImage';
import { 
  Sparkles, 
  Plus, 
  Upload, 
  Trash2, 
  Crosshair,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

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
  const [currentPhoto, setCurrentPhoto] = useState<string | undefined>(board.realPhotoUrl);
  const [markers, setMarkers] = useState<BoardComponentMarker[]>(board.markers || []);
  const [selectedMarker, setSelectedMarker] = useState<BoardComponentMarker | null>(
    board.markers && board.markers[0] ? board.markers[0] : null
  );
  const [pendingKind, setPendingKind] = useState<ComponentKind | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincroniza se a placa mudar
  useEffect(() => {
    setCurrentPhoto(board.realPhotoUrl);
    setMarkers(board.markers || []);
    if (board.markers && board.markers.length > 0) {
      setSelectedMarker(board.markers[0]);
    }
  }, [board.id, board.realPhotoUrl]);

  // Suporte a colar imagem com Ctrl+V
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const compressed = await compressImageFile(blob);
            if (compressed) {
              setCurrentPhoto(compressed);
              if (onUpdatePhoto) onUpdatePhoto(compressed);
              setUploadSuccess(true);
              setTimeout(() => setUploadSuccess(false), 3000);
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onUpdatePhoto]);

  // Upload do arquivo PNG / JPG
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImageFile(file);
    if (compressed) {
      setCurrentPhoto(compressed);
      if (onUpdatePhoto) onUpdatePhoto(compressed);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }
  };

  // Drag & drop de foto sobre o container
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const compressed = await compressImageFile(file);
      if (compressed) {
        setCurrentPhoto(compressed);
        if (onUpdatePhoto) onUpdatePhoto(compressed);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    }
  };

  // Clique na placa para posicionar componente
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pendingKind || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const kindPrefix = 
      pendingKind === 'bobina' ? 'L' :
      pendingKind === 'conector' ? 'J' :
      pendingKind === 'diodo' ? 'D' :
      pendingKind === 'ci' ? 'U' :
      pendingKind === 'termistor' ? 'TH' : 'C';

    const existingCount = markers.filter(m => m.kind === pendingKind).length + 1;
    const refName = `${kindPrefix}${existingCount}`;

    const defaultNames: Record<ComponentKind, string> = {
      bobina: 'Bobina de Alimentação',
      conector: 'Conector / Conexão FPC',
      diodo: 'Diodo TVS / Retificador',
      ci: 'Circuito Integrado (CI / PMIC)',
      termistor: 'Termistor NTC de Temperatura',
      capacitor: 'Capacitor de Filtragem',
      resistor: 'Resistor de Amostragem',
    };

    const newMarker: BoardComponentMarker = {
      id: 'marker-' + Date.now(),
      kind: pendingKind,
      reference: refName,
      name: defaultNames[pendingKind] || 'Componente',
      xPercent: Math.max(2, Math.min(98, x)),
      yPercent: Math.max(2, Math.min(98, y)),
      functionDesc: 'Posicionado na bancada.',
      diodeScaleMv: pendingKind === 'bobina' ? 0 : 520,
      voltage: '5.0V',
      repairTip: 'Verificar solda e continuidade.',
    };

    const updated = [...markers, newMarker];
    setMarkers(updated);
    setSelectedMarker(newMarker);
    setPendingKind(null);
    if (onUpdateMarkers) onUpdateMarkers(updated);
  };

  const handleUpdateSelectedMarker = (field: keyof BoardComponentMarker, value: any) => {
    if (!selectedMarker) return;
    const updatedMarker = { ...selectedMarker, [field]: value };
    const updated = markers.map((m) => (m.id === selectedMarker.id ? updatedMarker : m));
    setMarkers(updated);
    setSelectedMarker(updatedMarker);
    if (onUpdateMarkers) onUpdateMarkers(updated);
  };

  const handleDeleteMarker = (id: string) => {
    const updated = markers.filter((m) => m.id !== id);
    setMarkers(updated);
    setSelectedMarker(updated.length > 0 ? updated[0] : null);
    if (onUpdateMarkers) onUpdateMarkers(updated);
  };

  const handleRemovePhoto = () => {
    setCurrentPhoto(undefined);
    if (onUpdatePhoto) onUpdatePhoto('');
  };

  const getKindColor = (kind: ComponentKind) => {
    switch (kind) {
      case 'bobina':
        return { bg: 'bg-indigo-600', border: 'border-indigo-400', badge: 'bg-indigo-950 text-indigo-300' };
      case 'conector':
        return { bg: 'bg-amber-600', border: 'border-amber-400', badge: 'bg-amber-950 text-amber-300' };
      case 'diodo':
        return { bg: 'bg-rose-600', border: 'border-rose-400', badge: 'bg-rose-950 text-rose-300' };
      case 'ci':
        return { bg: 'bg-emerald-600', border: 'border-emerald-400', badge: 'bg-emerald-950 text-emerald-300' };
      case 'termistor':
        return { bg: 'bg-red-600', border: 'border-red-400', badge: 'bg-red-950 text-red-300' };
      default:
        return { bg: 'bg-cyan-600', border: 'border-cyan-400', badge: 'bg-cyan-950 text-cyan-300' };
    }
  };

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
      {/* Barra de Ferramentas: Estilos & Adicionar Componentes */}
      <div className="bg-slate-950/95 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        {/* Estilos */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            ESTILO:
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

        {/* Botões Rápidos de Adicionar Componentes */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 mr-1">ADICIONAR:</span>
          <button
            onClick={() => setPendingKind(pendingKind === 'bobina' ? null : 'bobina')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition border flex items-center gap-1 ${
              pendingKind === 'bobina'
                ? 'bg-indigo-600 text-white border-white animate-pulse'
                : 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60 hover:bg-indigo-900'
            }`}
          >
            <Plus className="w-3 h-3" />
            <span>Bobina</span>
          </button>

          <button
            onClick={() => setPendingKind(pendingKind === 'conector' ? null : 'conector')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition border flex items-center gap-1 ${
              pendingKind === 'conector'
                ? 'bg-amber-600 text-white border-white animate-pulse'
                : 'bg-amber-950/80 text-amber-300 border-amber-800/60 hover:bg-amber-900'
            }`}
          >
            <Plus className="w-3 h-3" />
            <span>Conector</span>
          </button>

          <button
            onClick={() => setPendingKind(pendingKind === 'diodo' ? null : 'diodo')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition border flex items-center gap-1 ${
              pendingKind === 'diodo'
                ? 'bg-rose-600 text-white border-white animate-pulse'
                : 'bg-rose-950/80 text-rose-300 border-rose-800/60 hover:bg-rose-900'
            }`}
          >
            <Plus className="w-3 h-3" />
            <span>Diodo/TVS</span>
          </button>

          <button
            onClick={() => setPendingKind(pendingKind === 'termistor' ? null : 'termistor')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition border flex items-center gap-1 ${
              pendingKind === 'termistor'
                ? 'bg-red-600 text-white border-white animate-pulse'
                : 'bg-red-950/80 text-red-300 border-red-800/60 hover:bg-red-900'
            }`}
          >
            <Plus className="w-3 h-3" />
            <span>Termistor</span>
          </button>

          <button
            onClick={() => setPendingKind(pendingKind === 'ci' ? null : 'ci')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition border flex items-center gap-1 ${
              pendingKind === 'ci'
                ? 'bg-emerald-600 text-white border-white animate-pulse'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900'
            }`}
          >
            <Plus className="w-3 h-3" />
            <span>CI/OVP</span>
          </button>

          {/* Subir Foto / Trocar Foto */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
            accept="image/png, image/jpeg, image/webp, image/*"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ml-2 ${
              currentPhoto
                ? 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-500/40'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-950'
            }`}
            title="Escolha uma foto PNG ou JPG do seu computador ou cole com Ctrl+V"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{currentPhoto ? 'Trocar Foto PNG' : 'Subir Foto PNG / JPG'}</span>
          </button>

          {currentPhoto && (
            <button
              onClick={handleRemovePhoto}
              className="px-2 py-1 rounded-xl bg-red-950/70 hover:bg-red-900 text-red-300 text-xs border border-red-800/50 flex items-center gap-1 transition"
              title="Remover foto e voltar ao desenho vetorial"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Voltar a Vetor</span>
            </button>
          )}
        </div>
      </div>

      {/* Notificação de Sucesso */}
      {uploadSuccess && (
        <div className="bg-emerald-950/90 border border-emerald-500/60 rounded-xl p-2.5 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="font-bold">Foto da placa carregada e comprimida com sucesso na bancada!</span>
        </div>
      )}

      {/* Alerta de Modo de Posicionamento Ativo */}
      {pendingKind && (
        <div className="bg-amber-950/80 border border-amber-500/50 rounded-xl p-3 text-xs text-amber-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-amber-400 animate-spin" />
            <span className="font-bold">
              Modo Posicionamento: Clique em qualquer lugar na placa para fixar a {pendingKind.toUpperCase()}!
            </span>
          </div>
          <button
            onClick={() => setPendingKind(null)}
            className="text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-900"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Grid Principal: Imagem da Placa + Painel de Edição */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Visualizador da Placa com Marcadores */}
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
          onDragLeave={() => setIsDraggingFile(false)}
          onDrop={handleDrop}
          className={`lg:col-span-2 relative bg-slate-950 border ${
            isDraggingFile ? 'border-2 border-cyan-400 bg-cyan-950/20' : 'border-slate-800'
          } rounded-3xl overflow-hidden shadow-2xl p-3 flex flex-col justify-center items-center min-h-[400px] transition`}
        >
          {/* MARCA D'ÁGUA OBRIGATÓRIA DA SAFEPLACA */}
          <WatermarkOverlay boardCode={board.modelCode} intensity="normal" />

          <div
            ref={containerRef}
            onClick={handleContainerClick}
            className={`relative w-full max-w-[880px] overflow-hidden rounded-2xl cursor-${
              pendingKind ? 'crosshair ring-2 ring-amber-500' : 'default'
            } transition duration-300 ${getStyleFilterClass()}`}
          >
            {/* Foto Real ou Vetor */}
            {currentPhoto ? (
              <img
                src={currentPhoto}
                alt={board.title}
                draggable={false}
                className="w-full h-auto max-h-[550px] object-contain rounded-xl select-none mx-auto block shadow-2xl"
              />
            ) : (
              <div
                className="w-full h-auto select-none pointer-events-none"
                dangerouslySetInnerHTML={{ __html: board.schematicSvg }}
              />
            )}

            {/* MARCADORES SOBREPOSTOS */}
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
                      isSelected ? 'border-white ring-4 ring-cyan-400/60 shadow-lg' : colors.border
                    } flex items-center justify-center text-[9px] font-black text-white shadow-xl`}
                  >
                    {marker.reference.slice(0, 2)}
                  </div>
                  <span className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 border border-slate-700 px-1.5 py-0.5 rounded text-[9px] font-bold text-white shadow-lg">
                    {marker.reference}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-500 mt-2 font-mono flex items-center gap-3">
            <span>💡 Dica: Arraste e solte uma imagem PNG aqui ou aperte <strong className="text-cyan-300">Ctrl+V</strong>.</span>
            {currentPhoto && (
              <span className="text-emerald-400 font-bold">● Foto Ativa</span>
            )}
          </div>
        </div>

        {/* Painel Lateral: Edição do Componente Selecionado */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between shadow-xl">
          {selectedMarker ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg uppercase ${getKindColor(selectedMarker.kind).badge}`}>
                  {selectedMarker.kind.toUpperCase()}
                </span>
                <button
                  onClick={() => handleDeleteMarker(selectedMarker.id)}
                  className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition"
                  title="Excluir este componente"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Formulário de Edição em Tempo Real */}
              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Referência / Código:</label>
                  <input
                    type="text"
                    value={selectedMarker.reference}
                    onChange={(e) => handleUpdateSelectedMarker('reference', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-cyan-300 font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Nome do Componente:</label>
                  <input
                    type="text"
                    value={selectedMarker.name}
                    onChange={(e) => handleUpdateSelectedMarker('name', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Escala Diodo (mV):</label>
                    <input
                      type="number"
                      value={selectedMarker.diodeScaleMv || ''}
                      onChange={(e) => handleUpdateSelectedMarker('diodeScaleMv', Number(e.target.value))}
                      placeholder="Ex: 520"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-amber-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Tensão (V):</label>
                    <input
                      type="text"
                      value={selectedMarker.voltage || ''}
                      onChange={(e) => handleUpdateSelectedMarker('voltage', e.target.value)}
                      placeholder="Ex: 5.0V / 9.0V"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-cyan-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Função / Descrição:</label>
                  <textarea
                    rows={2}
                    value={selectedMarker.functionDesc}
                    onChange={(e) => handleUpdateSelectedMarker('functionDesc', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-300 text-[11px]"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Dica de Reparo de Bancada:</label>
                  <textarea
                    rows={2}
                    value={selectedMarker.repairTip || ''}
                    onChange={(e) => handleUpdateSelectedMarker('repairTip', e.target.value)}
                    placeholder="Ex: Se der 0 ohms, está em curto. Trocar..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-emerald-300 text-[11px]"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              <p>Nenhum componente selecionado.</p>
              <p className="mt-2 text-cyan-400">
                Clique nos botões acima (+ Bobina, + Conector...) e clique na placa para adicionar!
              </p>
            </div>
          )}

          {/* Lista de todos os componentes da placa */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block mb-2 font-bold">
              Componentes Mapeados ({markers.length}):
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
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
