import React, { useState } from 'react';
import { 
  rotateImage90, 
  flipImageHorizontal, 
  cropImage, 
  applyAutoXRay, 
  applyAutoBlueprint, 
  applyAutoEdgeEnhancement 
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
  Layers
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
  };

  const handleSaveAndApply = () => {
    onApplyPhoto(currentPreview);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 select-none no-copy-shield font-mono">
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-cyan-500/60 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[92vh] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-950 rounded-xl border border-cyan-500/40 text-cyan-400">
              <Wand2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Estúdio Automático de Imagem da Placa
              </h3>
              <p className="text-[11px] text-slate-400">
                Cortar sobras, girar e transformar em Raio-X ou Blueprint com 1 clique.
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
            <span className="text-[10px] text-slate-400 mr-1 uppercase">Modos Automáticos:</span>

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
              <span>Realce de Trilhas</span>
            </button>
          </div>

          {/* Ferramentas de Enquadramento */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400 mr-1 uppercase">Ajustes:</span>

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

        {/* Área de Visualização com a Foto em Tempo Real */}
        <div className="flex-1 min-h-[300px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center p-4 relative">
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
