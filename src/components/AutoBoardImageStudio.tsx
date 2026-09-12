import React, { useState } from 'react';
import { 
  rotateImage90, 
  flipImageHorizontal, 
  cropImage, 
  applyAutoXRay, 
  applyAutoBlueprint, 
  applyAutoEdgeEnhancement,
  applyMicroscopeOptimization,
  applyCustomAdjustments
} from '../utils/imageProcessors';
import { 
  Wand2, 
  RotateCw, 
  FlipHorizontal, 
  Crop, 
  Check, 
  X, 
  Sparkles, 
  History, 
  Zap, 
  Layers,
  Sliders,
  Sun,
  Contrast
} from 'lucide-react';

interface AutoBoardImageStudioProps {
  initialPhotoUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onApplyPhoto: (newPhotoUrl: string) => void;
}

export const AutoBoardImageStudio: React.FC<AutoBoardImageStudioProps> = ({
  initialPhotoUrl,
  isOpen,
  onClose,
  onApplyPhoto,
}) => {
  const [currentPreview, setCurrentPreview] = useState(initialPhotoUrl);
  const [history, setHistory] = useState<string[]>([initialPhotoUrl]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sliders Manuais
  const [showSliders, setShowSliders] = useState(false);
  const [brightnessVal, setBrightnessVal] = useState(1.0);
  const [contrastVal, setContrastVal] = useState(1.0);
  const [sharpnessActive, setSharpnessActive] = useState(false);

  if (!isOpen) return null;

  const pushState = (newUrl: string) => {
    setCurrentPreview(newUrl);
    setHistory((prev) => [...prev, newUrl]);
  };

  const handleRotate = async () => {
    setIsProcessing(true);
    const res = await rotateImage90(currentPreview);
    pushState(res);
    setIsProcessing(false);
  };

  const handleFlip = async () => {
    setIsProcessing(true);
    const res = await flipImageHorizontal(currentPreview);
    pushState(res);
    setIsProcessing(false);
  };

  const handleCropMargins = async (marginPercent: number) => {
    setIsProcessing(true);
    const img = new Image();
    img.onload = async () => {
      const cropX = Math.round(img.width * (marginPercent / 100));
      const cropY = Math.round(img.height * (marginPercent / 100));
      const cropW = img.width - cropX * 2;
      const cropH = img.height - cropY * 2;
      const res = await cropImage(currentPreview, cropX, cropY, cropW, cropH);
      pushState(res);
      setIsProcessing(false);
    };
    img.src = currentPreview;
  };

  const handleAutoXRay = async () => {
    setIsProcessing(true);
    const res = await applyAutoXRay(currentPreview);
    pushState(res);
    setIsProcessing(false);
  };

  const handleAutoBlueprint = async () => {
    setIsProcessing(true);
    const res = await applyAutoBlueprint(currentPreview);
    pushState(res);
    setIsProcessing(false);
  };

  const handleAutoEdges = async () => {
    setIsProcessing(true);
    const res = await applyAutoEdgeEnhancement(currentPreview);
    pushState(res);
    setIsProcessing(false);
  };

  const handleMicroscopeFix = async () => {
    setIsProcessing(true);
    const res = await applyMicroscopeOptimization(currentPreview);
    pushState(res);
    setIsProcessing(false);
  };

  const handleApplySliders = async () => {
    setIsProcessing(true);
    const res = await applyCustomAdjustments(currentPreview, brightnessVal, contrastVal, sharpnessActive);
    pushState(res);
    setIsProcessing(false);
  };

  const handleUndo = () => {
    if (history.length > 1) {
      const newHist = [...history];
      newHist.pop();
      setHistory(newHist);
      setCurrentPreview(newHist[newHist.length - 1]);
    }
  };

  const handleReset = () => {
    setCurrentPreview(initialPhotoUrl);
    setHistory([initialPhotoUrl]);
    setBrightnessVal(1.0);
    setContrastVal(1.0);
    setSharpnessActive(false);
  };

  const handleSaveAndApply = () => {
    onApplyPhoto(currentPreview);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 select-none no-copy-shield font-mono">
      <div className="relative w-full max-w-5xl bg-slate-900 border-2 border-cyan-500/60 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[94vh] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-950 rounded-xl border border-cyan-500/40 text-cyan-400">
              <Wand2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Estúdio de Imagem Profissional de Bancada
              </h3>
              <p className="text-[11px] text-slate-400">
                Otimização de fotos de microscópio, Raio-X PCB, Blueprint técnico e rotação
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar de Ações Automáticas */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Transformações de Modo */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400 mr-1 uppercase font-bold">Modos Pro:</span>

            <button
              onClick={handleMicroscopeFix}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300 font-bold border border-purple-700/50 flex items-center gap-1 transition shadow-sm"
              title="Reduz estouro de LED do microscópio e destaca serigrafia"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Otimizar Microscópio</span>
            </button>

            <button
              onClick={handleAutoXRay}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-bold border border-emerald-700/50 flex items-center gap-1 transition shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Auto Raio-X</span>
            </button>

            <button
              onClick={handleAutoBlueprint}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 font-bold border border-cyan-700/50 flex items-center gap-1 transition shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Auto Blueprint</span>
            </button>

            <button
              onClick={handleAutoEdges}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-xl bg-amber-950 hover:bg-amber-900 text-amber-300 font-bold border border-amber-700/50 flex items-center gap-1 transition shadow-sm"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Realce Trilhas</span>
            </button>
          </div>

          {/* Ferramentas de Enquadramento */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setShowSliders(s => !s)}
              className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1 text-xs font-semibold ${
                showSliders ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-900 text-slate-300 border-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Ajustes Manuais</span>
            </button>

            <button
              onClick={handleRotate}
              disabled={isProcessing}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1"
              title="Girar 90 graus"
            >
              <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Girar 90°</span>
            </button>

            <button
              onClick={handleFlip}
              disabled={isProcessing}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1"
              title="Espelhar verso"
            >
              <FlipHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Espelhar</span>
            </button>

            <button
              onClick={() => handleCropMargins(8)}
              disabled={isProcessing}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1"
              title="Aparar 8% das bordas da mesa de bancada"
            >
              <Crop className="w-3.5 h-3.5 text-amber-400" />
              <span>Cortar Bordas</span>
            </button>
          </div>
        </div>

        {/* Painel Expansível de Sliders Manuais */}
        {showSliders && (
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center text-xs">
            <div>
              <label className="text-slate-400 flex items-center gap-1 mb-1">
                <Sun className="w-3 h-3 text-amber-400" /> Brilho ({Math.round(brightnessVal * 100)}%)
              </label>
              <input
                type="range"
                min="0.5"
                max="1.8"
                step="0.05"
                value={brightnessVal}
                onChange={(e) => setBrightnessVal(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-slate-400 flex items-center gap-1 mb-1">
                <Contrast className="w-3 h-3 text-cyan-400" /> Contraste ({Math.round(contrastVal * 100)}%)
              </label>
              <input
                type="range"
                min="0.6"
                max="2.2"
                step="0.05"
                value={contrastVal}
                onChange={(e) => setContrastVal(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <label className="text-slate-300 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sharpnessActive}
                  onChange={(e) => setSharpnessActive(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700"
                />
                Nitidez Alta (Sharpen)
              </label>
            </div>

            <div className="pt-2">
              <button
                onClick={handleApplySliders}
                disabled={isProcessing}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow transition"
              >
                Aplicar Ajustes
              </button>
            </div>
          </div>
        )}

        {/* Área de Visualização com a Foto em Tempo Real */}
        <div className="flex-1 min-h-[350px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center p-4 relative">
          <img
            src={currentPreview}
            alt="Preview da Placa"
            className="max-h-[500px] max-w-full object-contain rounded-xl shadow-2xl"
          />

          {isProcessing && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center gap-2 text-cyan-300 font-bold text-xs">
              <Wand2 className="w-5 h-5 animate-spin text-cyan-400" />
              <span>Processando Imagem com IA de Bancada...</span>
            </div>
          )}
        </div>

        {/* Footer com Ações e Salvar */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={history.length <= 1}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5" />
              <span>Desfazer ({history.length - 1})</span>
            </button>

            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs"
            >
              Restaurar Original
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveAndApply}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950 transition"
            >
              <Check className="w-4 h-4" />
              <span>Aplicar Esta Versão na Placa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
