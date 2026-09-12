import React, { useEffect, useState } from 'react';
import { ShieldAlert, Lock } from 'lucide-react';


interface WatermarkOverlayProps {
  boardCode?: string;
  intensity?: 'normal' | 'subtle' | 'high';
  showBadge?: boolean;
}

export const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({
  boardCode = 'SAFE-PLACA',
  intensity = 'normal',
  showBadge = true,
}) => {
  const [timestamp, setTimestamp] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimestamp(`${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const opacityClass =
    intensity === 'high'
      ? 'opacity-25'
      : intensity === 'subtle'
      ? 'opacity-10'
      : 'opacity-16';

  const watermarkText = `SAFEPLACA • NÃO BAIXAR • ${boardCode} • ${timestamp} • USO DE BANCADA`;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden select-none select-none no-copy-shield">
      {/* Padrão diagonal de marcas d água repetidas */}
      <div
        className={`absolute inset-[-100%] w-[300%] h-[300%] flex flex-col justify-around rotate-[-30deg] ${opacityClass} font-mono font-bold tracking-widest text-xs md:text-sm text-red-400`}
      >
        {Array.from({ length: 24 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex whitespace-nowrap justify-around transform translate-x-4 space-x-12"
          >
            {Array.from({ length: 8 }).map((_, colIndex) => (
              <span key={colIndex} className="inline-flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 inline text-amber-400" />
                <span>{watermarkText}</span>
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* Selo central semitransparente */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="border border-red-500/20 bg-black/40 backdrop-blur-[1px] px-6 py-3 rounded-xl flex items-center gap-3 text-red-400/30 text-xs font-mono tracking-widest">
          <ShieldAlert className="w-4 h-4" />
          <span>DOCUMENTO ELETRÔNICO PROTEGIDO • SAFEPLACA HARDWARE</span>
        </div>
      </div>

      {/* Badge flutuante indicativa de proteção ativa */}
      {showBadge && (
        <div className="absolute bottom-3 right-3 bg-red-950/80 border border-red-500/40 text-red-300 text-[10px] font-mono px-2.5 py-1 rounded-full shadow-lg backdrop-blur-md flex items-center gap-1.5 z-40">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
          <span>MARCA D'ÁGUA ATIVA • CÓPIA BLOQUEADA</span>
        </div>
      )}
    </div>
  );
};
