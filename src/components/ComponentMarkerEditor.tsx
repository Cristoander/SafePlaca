import React, { useState, useRef, useEffect } from 'react';
import type { BoardProject, BoardComponentMarker, VisualStyle, ComponentKind, BoardJumperWire } from '../types/board';
import { ProfessionalBoardWorkbench } from './ProfessionalBoardWorkbench';
import { AutoBoardImageStudio } from './AutoBoardImageStudio';
import { SchematicBuilderModal } from './SchematicBuilderModal';
import { compressImageFile } from '../utils/compressImage';
import { PREBUILT_COMPONENTS_LIBRARY, type PrebuiltComponentTemplate } from '../data/prebuiltComponents';
import { 
  Sparkles, 
  Plus, 
  Upload, 
  Trash2, 
  Crosshair, 
  CheckCircle2, 
  RefreshCw, 
  Wand2, 
  Package, 
  Activity, 
  ChevronRight, 
  Check, 
  X,
  RotateCw
} from 'lucide-react';

interface ComponentMarkerEditorProps {
  board: BoardProject;
  onUpdateMarkers?: (markers: BoardComponentMarker[]) => void;
  onUpdatePhoto?: (photoUrl: string) => void;
  onUpdateSchematic?: (newSvg: string) => void;
  onUpdateWires?: (wires: BoardJumperWire[]) => void;
}

export const ComponentMarkerEditor: React.FC<ComponentMarkerEditorProps> = ({
  board,
  onUpdateMarkers,
  onUpdatePhoto,
  onUpdateSchematic,
  onUpdateWires,
}) => {
  const [style, setStyle] = useState<VisualStyle>('normal');
  const [activeSide, setActiveSide] = useState<'A' | 'B'>('A');
  const [currentPhoto, setCurrentPhoto] = useState<string | undefined>(board.realPhotoUrl);
  const [currentPhotoBack, setCurrentPhotoBack] = useState<string | undefined>(board.realPhotoBackUrl);
  const [markers, setMarkers] = useState<BoardComponentMarker[]>(board.markers || []);
  const [wires, setWires] = useState<BoardJumperWire[]>(board.wires || []);
  const [selectedMarker, setSelectedMarker] = useState<BoardComponentMarker | null>(
    board.markers && board.markers[0] ? board.markers[0] : null
  );
  const [pendingKind, setPendingKind] = useState<ComponentKind | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isPrebuiltOpen, setIsPrebuiltOpen] = useState(false);
  const [isSchematicBuilderOpen, setIsSchematicBuilderOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincroniza se a placa mudar
  useEffect(() => {
    setCurrentPhoto(board.realPhotoUrl);
    setCurrentPhotoBack(board.realPhotoBackUrl);
    setMarkers(board.markers || []);
    setWires(board.wires || []);
    if (board.markers && board.markers.length > 0) {
      setSelectedMarker(board.markers[0]);
    }
  }, [board.id, board.realPhotoUrl, board.realPhotoBackUrl]);

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
      if (activeSide === 'A') {
        setCurrentPhoto(compressed);
      } else {
        setCurrentPhotoBack(compressed);
      }
      if (onUpdatePhoto) onUpdatePhoto(compressed);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }
  };

  // Adicionar marcador em posição específica com validação
  const addMarkerAt = (
    kind: ComponentKind, 
    xPercent: number, 
    yPercent: number, 
    templateData?: Partial<BoardComponentMarker>
  ) => {
    const kindPrefix = 
      kind === 'bobina' ? 'L' :
      kind === 'conector' ? 'J' :
      kind === 'diodo' ? 'D' :
      kind === 'ci' ? 'U' :
      kind === 'termistor' ? 'TH' : 'C';

    const existingCount = markers.filter(m => m.kind === kind).length + 1;
    const refName = templateData?.reference || `${kindPrefix}${existingCount}`;

    const defaultNames: Record<ComponentKind, string> = {
      bobina: 'Bobina de Alimentação BUCK',
      conector: 'Conector / Conexão FPC',
      diodo: 'Diodo TVS / Retificador',
      ci: 'Circuito Integrado (CI / PMIC)',
      termistor: 'Termistor NTC Sensor Térmico',
      capacitor: 'Capacitor de Filtragem SMD',
      resistor: 'Resistor de Amostragem',
    };

    const newMarker: BoardComponentMarker = {
      id: 'marker-' + Date.now(),
      kind,
      reference: refName,
      name: templateData?.name || defaultNames[kind] || 'Componente',
      side: activeSide,
      xPercent: Math.max(2, Math.min(98, xPercent)),
      yPercent: Math.max(2, Math.min(98, yPercent)),
      rotation: templateData?.rotation || 0,
      widthPx: templateData?.widthPx,
      heightPx: templateData?.heightPx,
      packageCode: templateData?.packageCode,
      functionDesc: templateData?.functionDesc || 'Posicionado na bancada.',
      diodeScaleMv: templateData?.diodeScaleMv !== undefined ? templateData.diodeScaleMv : (kind === 'bobina' ? 0 : 520),
      voltage: templateData?.voltage || '5.0V',
      netName: templateData?.netName,
      faultSymptom: templateData?.faultSymptom || 'Verificar se há curto para o terra (GND).',
      repairTip: templateData?.repairTip || 'Testar continuidade e escala de diodo.',
    };

    const updated = [...markers, newMarker];
    setMarkers(updated);
    setSelectedMarker(newMarker);
    setPendingKind(null);
    if (onUpdateMarkers) onUpdateMarkers(updated);
  };

  // Inserir peça pré-montada da biblioteca
  const handleInsertPrebuilt = (tpl: PrebuiltComponentTemplate) => {
    addMarkerAt(tpl.kind, 50, 50, {
      reference: `${tpl.referencePrefix}${markers.filter(m => m.kind === tpl.kind).length + 1}`,
      name: tpl.name,
      rotation: tpl.rotation || 0,
      widthPx: tpl.widthPx,
      heightPx: tpl.heightPx,
      packageCode: tpl.packageCode,
      functionDesc: tpl.functionDesc,
      diodeScaleMv: tpl.diodeScaleMv,
      voltage: tpl.voltage,
      netName: tpl.netName,
      faultSymptom: tpl.faultSymptom,
      repairTip: tpl.repairTip
    });
    setIsPrebuiltOpen(false);
  };

  const handleUpdateSelectedMarker = (field: keyof BoardComponentMarker, value: any) => {
    if (!selectedMarker) return;
    const updatedMarker = { ...selectedMarker, [field]: value };
    const updated = markers.map((m) => (m.id === selectedMarker.id ? updatedMarker : m));
    setMarkers(updated);
    setSelectedMarker(updatedMarker);
    if (onUpdateMarkers) onUpdateMarkers(updated);
  };

  const handleNudgeSelected = (dx: number, dy: number) => {
    if (!selectedMarker) return;
    const newX = Math.max(2, Math.min(98, selectedMarker.xPercent + dx));
    const newY = Math.max(2, Math.min(98, selectedMarker.yPercent + dy));
    const updatedMarker = { ...selectedMarker, xPercent: newX, yPercent: newY };
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

          {/* Botão de Peças Pré-Montadas */}
          <button
            onClick={() => setIsPrebuiltOpen(true)}
            className="px-3 py-1 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300 text-xs font-bold border border-purple-700/60 flex items-center gap-1.5 transition ml-1"
            title="Abrir catálogo com mais de 10 peças pré-configuradas com valores reais"
          >
            <Package className="w-3.5 h-3.5 text-purple-400" />
            <span>Peças Prontas</span>
          </button>

          {/* Botão Desenhar Esquema Elétrico */}
          <button
            onClick={() => setIsSchematicBuilderOpen(true)}
            className="px-3 py-1 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-indigo-300 text-xs font-bold border border-indigo-700/60 flex items-center gap-1.5 transition"
            title="Desenhar esquema elétrico vetorial interativo"
          >
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Desenhar Esquema</span>
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
            <span>{currentPhoto ? 'Trocar Foto' : 'Subir Foto PNG / JPG'}</span>
          </button>

          {currentPhoto && (
            <>
              <button
                onClick={handleRemovePhoto}
                className="px-2 py-1 rounded-xl bg-red-950/70 hover:bg-red-900 text-red-300 text-xs border border-red-800/50 flex items-center gap-1 transition"
                title="Remover foto e voltar ao desenho vetorial"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Vetor</span>
              </button>

              <button
                onClick={() => setIsStudioOpen(true)}
                className="px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs border border-cyan-400/50 shadow-md shadow-cyan-950 flex items-center gap-1.5 transition ml-1"
                title="Abrir estúdio de imagem"
              >
                <Wand2 className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Estúdio IA</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notificação de Sucesso */}
      {uploadSuccess && (
        <div className="bg-emerald-950/90 border border-emerald-500/60 rounded-xl p-2.5 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="font-bold">Foto da placa carregada com sucesso na bancada!</span>
        </div>
      )}

      {/* Alerta de Modo de Posicionamento Ativo com botão de Inserir no Centro */}
      {pendingKind && (
        <div className="bg-amber-950/90 border border-amber-500/60 rounded-2xl p-3 text-xs text-amber-300 flex flex-wrap items-center justify-between gap-3 shadow-xl animate-pulse">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-amber-400 animate-spin" />
            <span className="font-bold text-white">
              Modo Posicionamento Ativo: Clique em qualquer lugar na placa para fixar a {pendingKind.toUpperCase()}!
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => addMarkerAt(pendingKind, 50, 50)}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs transition shadow-md flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Inserir no Centro (50%, 50%)
            </button>
            <button
              onClick={() => setPendingKind(null)}
              className="text-slate-400 hover:text-white px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Grid Principal: Imagem da Placa + Painel de Edição */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bancada Profissional de Trabalho da Placa */}
        <div className="lg:col-span-2">
          <ProfessionalBoardWorkbench
            board={board}
            markers={markers}
            onUpdateMarkers={(newMarkers) => {
              setMarkers(newMarkers);
              if (onUpdateMarkers) onUpdateMarkers(newMarkers);
            }}
            wires={wires}
            onUpdateWires={(newWires) => {
              setWires(newWires);
              if (onUpdateWires) onUpdateWires(newWires);
            }}
            selectedMarker={selectedMarker}
            onSelectMarker={setSelectedMarker}
            pendingKind={pendingKind}
            onAddMarkerAt={addMarkerAt}
            onCancelPendingKind={() => setPendingKind(null)}
            currentPhoto={activeSide === 'A' ? currentPhoto : (currentPhotoBack || currentPhoto)}
            activeSide={activeSide}
            onToggleSide={setActiveSide}
            style={style}
          />
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
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-cyan-300 font-bold font-mono"
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

                {/* Face & Encapsulamento */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Face da Placa:</label>
                    <select
                      value={selectedMarker.side || 'A'}
                      onChange={(e) => handleUpdateSelectedMarker('side', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-cyan-400 font-bold"
                    >
                      <option value="A">Face A (Top)</option>
                      <option value="B">Face B (Bottom)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Encapsulamento:</label>
                    <select
                      value={selectedMarker.packageCode || ''}
                      onChange={(e) => handleUpdateSelectedMarker('packageCode', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200"
                    >
                      <option value="">Padrão SMD</option>
                      <option value="0201">SMD 0201 (Ultra-micro)</option>
                      <option value="0402">SMD 0402 (Micro)</option>
                      <option value="0603">SMD 0603</option>
                      <option value="0805">SMD 0805</option>
                      <option value="BGA">BGA (Solda em esferas)</option>
                      <option value="QFN">QFN (Pinos laterais)</option>
                      <option value="FPC">Conector FPC</option>
                      <option value="TP">Test Point (Ponto de Teste)</option>
                    </select>
                  </div>
                </div>

                {/* Rotação rápida */}
                <div>
                  <label className="text-slate-400 block mb-1">Rotação do Footprint:</label>
                  <div className="flex items-center gap-1.5">
                    {[0, 90, 180, 270].map((deg) => (
                      <button
                        key={deg}
                        type="button"
                        onClick={() => handleUpdateSelectedMarker('rotation', deg)}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold border transition ${
                          (selectedMarker.rotation || 0) === deg
                            ? 'bg-cyan-600 text-white border-cyan-400'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleUpdateSelectedMarker('rotation', ((selectedMarker.rotation || 0) + 90) % 360)}
                      className="p-1 rounded-lg bg-slate-900 text-cyan-400 border border-slate-800 hover:bg-slate-850"
                      title="Girar +90°"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Ajuste Fino de Posição X / Y com D-Pad */}
                <div>
                  <label className="text-slate-400 block mb-1 flex items-center justify-between">
                    <span>Posição na Placa:</span>
                    <span className="font-mono text-cyan-300">X: {selectedMarker.xPercent}% | Y: {selectedMarker.yPercent}%</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="grid grid-cols-3 gap-1 max-w-[110px] text-center font-bold">
                      <div />
                      <button
                        onClick={() => handleNudgeSelected(0, -2)}
                        className="p-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-200"
                        title="Mover para cima"
                      >
                        ▲
                      </button>
                      <div />
                      <button
                        onClick={() => handleNudgeSelected(-2, 0)}
                        className="p-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-200"
                        title="Mover para esquerda"
                      >
                        ◀
                      </button>
                      <button
                        onClick={() => handleNudgeSelected(0, 2)}
                        className="p-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-200"
                        title="Mover para baixo"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => handleNudgeSelected(2, 0)}
                        className="p-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-200"
                        title="Mover para direita"
                      >
                        ▶
                      </button>
                    </div>

                    <div className="flex-1 space-y-1">
                      <input
                        type="range"
                        min="2"
                        max="98"
                        value={selectedMarker.xPercent}
                        onChange={(e) => handleUpdateSelectedMarker('xPercent', Number(e.target.value))}
                        className="w-full"
                        title="Posição Horizontal X"
                      />
                      <input
                        type="range"
                        min="2"
                        max="98"
                        value={selectedMarker.yPercent}
                        onChange={(e) => handleUpdateSelectedMarker('yPercent', Number(e.target.value))}
                        className="w-full"
                        title="Posição Vertical Y"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Escala Diodo (mV):</label>
                    <input
                      type="number"
                      value={selectedMarker.diodeScaleMv || ''}
                      onChange={(e) => handleUpdateSelectedMarker('diodeScaleMv', Number(e.target.value))}
                      placeholder="Ex: 520"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-amber-400 font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Tensão (V):</label>
                    <input
                      type="text"
                      value={selectedMarker.voltage || ''}
                      onChange={(e) => handleUpdateSelectedMarker('voltage', e.target.value)}
                      placeholder="Ex: 5.0V / 9.0V"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-cyan-300 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Malha Associada (Net):</label>
                  <input
                    type="text"
                    value={selectedMarker.netName || ''}
                    onChange={(e) => handleUpdateSelectedMarker('netName', e.target.value)}
                    placeholder="Ex: VBUS_5V, VBAT_4V2, VREG_L18"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-cyan-300 font-mono text-xs"
                  />
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
                Clique nos botões acima (+ Termistor, + Bobina...) e clique na placa para posicionar!
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

      {/* Modal de Peças Pré-Montadas */}
      {isPrebuiltOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
            <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">Biblioteca de Peças Pré-Montadas de Bancada</h3>
              </div>
              <button onClick={() => setIsPrebuiltOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              <p className="text-xs text-slate-400">
                Escolha uma peça pré-configurada abaixo. Todos os valores de diodo, voltagem e sintomas já virão prontos:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PREBUILT_COMPONENTS_LIBRARY.map(tpl => (
                  <div
                    key={tpl.id}
                    onClick={() => handleInsertPrebuilt(tpl)}
                    className="p-3 bg-slate-950/80 hover:bg-purple-950/30 border border-slate-800 hover:border-purple-500/50 rounded-2xl cursor-pointer transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm group-hover:text-purple-300 transition">
                          {tpl.name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                          {tpl.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{tpl.functionDesc}</p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] font-mono">
                        <span className="text-emerald-400 font-bold">{tpl.diodeScaleMv} mV</span>
                        <span className="text-slate-400">{tpl.voltage}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-purple-400 font-semibold">
                      <span>Inserir na Placa</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estúdio Automático de Imagem */}
      {isStudioOpen && currentPhoto && (
        <AutoBoardImageStudio
          initialPhotoUrl={currentPhoto}
          isOpen={isStudioOpen}
          onClose={() => setIsStudioOpen(false)}
          onApplyPhoto={(newUrl) => {
            setCurrentPhoto(newUrl);
            if (onUpdatePhoto) onUpdatePhoto(newUrl);
          }}
        />
      )}

      {/* Editor e Desenhador de Esquema Elétrico */}
      {isSchematicBuilderOpen && (
        <SchematicBuilderModal
          board={board}
          isOpen={isSchematicBuilderOpen}
          onClose={() => setIsSchematicBuilderOpen(false)}
          onSaveSchematic={(newSvg) => {
            if (onUpdateSchematic) onUpdateSchematic(newSvg);
          }}
        />
      )}
    </div>
  );
};
