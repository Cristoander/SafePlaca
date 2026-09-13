import React from 'react';
import type { BoardComponentMarker } from '../types/board';

interface ComponentFootprintViewProps {
  marker: BoardComponentMarker;
  isSelected?: boolean;
}

export const ComponentFootprintView: React.FC<ComponentFootprintViewProps> = ({
  marker,
  isSelected = false,
}) => {
  const rotation = marker.rotation || 0;
  const width = marker.widthPx || (marker.kind === 'ci' ? 70 : marker.kind === 'conector' ? 80 : 36);
  const height = marker.heightPx || (marker.kind === 'ci' ? 50 : marker.kind === 'conector' ? 26 : 22);

  // Renderizador específico por tipo de componente da indústria
  const renderFootprintGraphic = () => {
    switch (marker.kind) {
      case 'resistor':
        // Resistor SMD 2-pin: Corpo preto com terminais de solda prateados
        return (
          <div 
            className="w-full h-full relative rounded flex items-center justify-between overflow-hidden shadow-lg border border-slate-600 bg-slate-900"
            style={{ minWidth: 32, minHeight: 18 }}
          >
            {/* Terminal de solda esquerdo */}
            <div className="w-2.5 h-full bg-gradient-to-r from-slate-300 to-slate-400 border-r border-slate-500 shrink-0" />
            
            {/* Corpo central preto com código */}
            <div className="flex-1 h-full bg-black flex items-center justify-center px-1">
              <span className="text-[8px] font-mono font-bold text-amber-300 tracking-tighter truncate">
                {marker.reference}
              </span>
            </div>

            {/* Terminal de solda direito */}
            <div className="w-2.5 h-full bg-gradient-to-l from-slate-300 to-slate-400 border-l border-slate-500 shrink-0" />
          </div>
        );

      case 'capacitor':
        // Capacitor Cerâmico SMD: Corpo marrom/bege característico sem polaridade
        return (
          <div 
            className="w-full h-full relative rounded flex items-center justify-between overflow-hidden shadow-lg border border-amber-900/60 bg-[#9c6644]"
            style={{ minWidth: 32, minHeight: 18 }}
          >
            <div className="w-2.5 h-full bg-gradient-to-r from-slate-300 to-slate-400 border-r border-slate-600 shrink-0" />
            <div className="flex-1 h-full bg-[#7f4f24] flex items-center justify-center px-1">
              <span className="text-[8px] font-mono font-bold text-amber-100 tracking-tighter truncate">
                {marker.reference}
              </span>
            </div>
            <div className="w-2.5 h-full bg-gradient-to-l from-slate-300 to-slate-400 border-l border-slate-600 shrink-0" />
          </div>
        );

      case 'bobina':
        // Bobina / Indutor Blindado BUCK: Corpo grafite escuro com ponto do pino 1
        return (
          <div 
            className="w-full h-full relative rounded-lg bg-gradient-to-br from-slate-800 to-slate-950 border-2 border-slate-600 shadow-xl flex flex-col items-center justify-center p-1"
            style={{ minWidth: 36, minHeight: 32 }}
          >
            {/* Ponto / Dot Pino 1 */}
            <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm" />
            <span className="text-[9px] font-mono font-extrabold text-white truncate">
              {marker.reference}
            </span>
            <span className="text-[7px] font-mono text-amber-400 -mt-0.5 truncate">
              {marker.name.includes('µH') ? marker.name.split(' ').pop() : 'BUCK'}
            </span>
          </div>
        );

      case 'diodo':
        // Diodo TVS / Retificador: Corpo preto com faixa branca no catodo
        return (
          <div 
            className="w-full h-full relative rounded flex items-center justify-between overflow-hidden shadow-lg border border-rose-900 bg-black"
            style={{ minWidth: 34, minHeight: 18 }}
          >
            <div className="w-2 h-full bg-gradient-to-r from-slate-300 to-slate-400 shrink-0" />
            {/* Faixa branca de catodo */}
            <div className="w-1.5 h-full bg-white shrink-0 ml-0.5" />
            <div className="flex-1 h-full flex items-center justify-center px-0.5">
              <span className="text-[8px] font-mono font-bold text-rose-300 truncate">
                {marker.reference}
              </span>
            </div>
            <div className="w-2 h-full bg-gradient-to-l from-slate-300 to-slate-400 shrink-0" />
          </div>
        );

      case 'termistor':
        // Termistor NTC: Corpo verde esmeralda com símbolo térmico
        return (
          <div 
            className="w-full h-full relative rounded flex items-center justify-between overflow-hidden shadow-lg border border-emerald-500/60 bg-emerald-950"
            style={{ minWidth: 34, minHeight: 18 }}
          >
            <div className="w-2.5 h-full bg-gradient-to-r from-slate-300 to-slate-400 shrink-0" />
            <div className="flex-1 h-full bg-emerald-900/90 flex items-center justify-center px-1">
              <span className="text-[8px] font-mono font-bold text-emerald-200 truncate">
                {marker.reference}
              </span>
            </div>
            <div className="w-2.5 h-full bg-gradient-to-l from-slate-300 to-slate-400 shrink-0" />
          </div>
        );

      case 'ci':
        // CI / Chip BGA / QFN: Encapsulamento com chanfro no Pino 1, bordas e serigrafia
        return (
          <div 
            className="w-full h-full relative rounded-md bg-gradient-to-br from-slate-900 via-purple-950/80 to-slate-950 border-2 border-purple-500/70 shadow-2xl flex flex-col items-center justify-center p-1"
            style={{ minWidth: 50, minHeight: 40 }}
          >
            {/* Ponto / Chanfro Pino 1 */}
            <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-yellow-400 shadow-md border border-yellow-200" />
            <span className="text-[10px] font-mono font-black text-white truncate max-w-full">
              {marker.reference}
            </span>
            <span className="text-[8px] font-mono text-purple-300 font-bold truncate max-w-full">
              {marker.name.split(' ')[0] || 'IC'}
            </span>
          </div>
        );

      case 'conector':
        if (marker.packageCode === 'PIN_FPC') {
          // Pad individual de pino FPC de conector (Borneo/ZXW style)
          return (
            <div 
              className="w-full h-full relative rounded-sm bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 border border-amber-200 shadow-md flex items-center justify-center overflow-hidden"
              style={{ minWidth: 16, minHeight: 22 }}
              title={`Pino ${marker.reference} - ${marker.name}`}
            >
              <span className="text-[9px] font-black text-slate-950 font-mono tracking-tighter">
                {marker.reference.replace(/[^0-9]/g, '') || marker.reference.slice(0, 3)}
              </span>
            </div>
          );
        }

        // Conector FPC completo: Pente de pinos dourados com carcaça plástica
        return (
          <div 
            className="w-full h-full relative rounded bg-slate-900 border-2 border-amber-600/80 shadow-2xl flex items-center justify-between px-1"
            style={{ minWidth: 60, minHeight: 22 }}
          >
            {/* Travas laterais plásticas */}
            <div className="w-1.5 h-full bg-slate-700 rounded-l-sm shrink-0" />
            
            {/* Pinos metálicos dourados */}
            <div className="flex-1 h-3/4 flex items-center justify-around px-1 overflow-hidden bg-black/70 rounded">
              <div className="w-1 h-full bg-amber-400" />
              <div className="w-1 h-full bg-amber-400" />
              <span className="text-[8px] font-mono font-extrabold text-amber-300 px-1 truncate">
                {marker.reference}
              </span>
              <div className="w-1 h-full bg-amber-400" />
              <div className="w-1 h-full bg-amber-400" />
            </div>

            <div className="w-1.5 h-full bg-slate-700 rounded-r-sm shrink-0" />
          </div>
        );

      default:
        // Test Point / Padrão circular
        return (
          <div className="w-7 h-7 rounded-full bg-slate-950 border-2 border-cyan-400 shadow-xl flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-sm" />
          </div>
        );
    }
  };

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: `rotate(${rotation}deg)`,
      }}
      className={`relative transition-all select-none ${
        isSelected
          ? 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-105 z-30'
          : 'hover:scale-105 hover:ring-2 hover:ring-white/60'
      }`}
    >
      {renderFootprintGraphic()}

      {/* Rótulo de Referência Flutuante */}
      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 border border-slate-700 px-1.5 py-0.5 rounded text-[8px] font-bold text-white shadow-lg pointer-events-none">
        {marker.reference}
      </span>
    </div>
  );
};
