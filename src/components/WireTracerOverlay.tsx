import React from 'react';
import type { BoardJumperWire } from '../types/board';
export type { BoardJumperWire };

interface WireTracerOverlayProps {
  wires: BoardJumperWire[];
  activeDrawingWire?: { xPercent: number; yPercent: number }[];
  currentDrawingColor?: string;
  onSelectWire?: (wire: BoardJumperWire) => void;
  selectedWireId?: string;
}

export const WireTracerOverlay: React.FC<WireTracerOverlayProps> = ({
  wires,
  activeDrawingWire = [],
  currentDrawingColor = '#eab308',
  onSelectWire,
  selectedWireId
}) => {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
      <defs>
        {/* Filtro Glow Neon para os fios */}
        <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Fios Já Desenhados */}
      {wires.map((w) => {
        if (w.points.length < 2) return null;
        const isSelected = selectedWireId === w.id;
        const pathData = `M ${w.points.map(p => `${p.xPercent}% ${p.yPercent}%`).join(' L ')}`;

        return (
          <g key={w.id} className="pointer-events-auto cursor-pointer" onClick={() => onSelectWire && onSelectWire(w)}>
            {/* Linha externa de clique/destaque */}
            <path
              d={pathData}
              fill="none"
              stroke={isSelected ? '#ffffff' : 'transparent'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-40 hover:opacity-60"
            />

            {/* Fio de cobre real */}
            <path
              d={pathData}
              fill="none"
              stroke={w.wireColorHex}
              strokeWidth={isSelected ? '4' : '3'}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: isSelected ? 'url(#neon-glow)' : 'drop-shadow(0 0 4px rgba(0,0,0,0.8))'
              }}
            />

            {/* Pontos extremos (Pads A e B) */}
            {w.points.map((p, idx) => (
              <circle
                key={idx}
                cx={`${p.xPercent}%`}
                cy={`${p.yPercent}%`}
                r={idx === 0 || idx === w.points.length - 1 ? '5' : '3'}
                fill={idx === 0 ? '#22c55e' : idx === w.points.length - 1 ? '#ef4444' : w.wireColorHex}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            ))}

            {/* Pingos de Máscara UV (Cura UV verde translúcida) */}
            {w.uvMaskPoints?.map((uv, idx) => (
              <g key={idx}>
                <circle
                  cx={`${uv.xPercent}%`}
                  cy={`${uv.yPercent}%`}
                  r="7"
                  fill="rgba(34, 197, 94, 0.4)"
                  stroke="#22c55e"
                  strokeWidth="1.5"
                />
                <circle
                  cx={`${uv.xPercent}%`}
                  cy={`${uv.yPercent}%`}
                  r="3"
                  fill="#86efac"
                />
              </g>
            ))}
          </g>
        );
      })}

      {/* Fio Sendo Desenhado no Momento */}
      {activeDrawingWire.length > 0 && (
        <g>
          <path
            d={`M ${activeDrawingWire.map(p => `${p.xPercent}% ${p.yPercent}%`).join(' L ')}`}
            fill="none"
            stroke={currentDrawingColor}
            strokeWidth="3.5"
            strokeDasharray="6 3"
            strokeLinecap="round"
            className="animate-pulse"
            style={{ filter: 'url(#neon-glow)' }}
          />
          {activeDrawingWire.map((p, idx) => (
            <circle
              key={idx}
              cx={`${p.xPercent}%`}
              cy={`${p.yPercent}%`}
              r="4.5"
              fill={currentDrawingColor}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          ))}
        </g>
      )}
    </svg>
  );
};
