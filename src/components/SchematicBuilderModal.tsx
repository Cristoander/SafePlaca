import React, { useState } from 'react';
import { 
  Zap, 
  Save, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  X, 
  Activity, 
  Plus, 
  Move
} from 'lucide-react';
import type { BoardProject } from '../types/board';

interface SchematicBuilderModalProps {
  board: BoardProject;
  isOpen: boolean;
  onClose: () => void;
  onSaveSchematic: (newSvg: string) => void;
}

export interface SchematicComponentItem {
  id: string;
  type: 'battery' | 'gnd' | 'resistor' | 'capacitor' | 'inductor' | 'diode' | 'thermistor' | 'ic' | 'fuse' | 'testpoint';
  label: string;
  value: string;
  x: number;
  y: number;
  color: string;
}

export interface SchematicWireItem {
  id: string;
  fromId: string;
  toId: string;
  netName: string;
  color: string;
}

export const SchematicBuilderModal: React.FC<SchematicBuilderModalProps> = ({
  board,
  isOpen,
  onClose,
  onSaveSchematic
}) => {
  const [components, setComponents] = useState<SchematicComponentItem[]>([
    { id: 'c1', type: 'battery', label: 'VBAT', value: '4.2V', x: 80, y: 180, color: '#ef4444' },
    { id: 'c2', type: 'fuse', label: 'F101', value: '3A', x: 200, y: 180, color: '#f59e0b' },
    { id: 'c3', type: 'inductor', label: 'L3001', value: '2.2µH', x: 320, y: 180, color: '#eab308' },
    { id: 'c4', type: 'ic', label: 'U3001 (IF-PMIC)', value: 'SM5713', x: 480, y: 180, color: '#8b5cf6' },
    { id: 'c5', type: 'capacitor', label: 'C1204', value: '10µF', x: 320, y: 300, color: '#06b6d4' },
    { id: 'c6', type: 'thermistor', label: 'TH3000', value: '100kΩ', x: 480, y: 300, color: '#10b981' },
    { id: 'c7', type: 'gnd', label: 'GND', value: '0V', x: 320, y: 380, color: '#64748b' },
  ]);

  const [wires, setWires] = useState<SchematicWireItem[]>([
    { id: 'w1', fromId: 'c1', toId: 'c2', netName: 'VBAT', color: '#ef4444' },
    { id: 'w2', fromId: 'c2', toId: 'c3', netName: 'VBAT_FUSED', color: '#ef4444' },
    { id: 'w3', fromId: 'c3', toId: 'c4', netName: 'VPH_PWR', color: '#eab308' },
    { id: 'w4', fromId: 'c3', toId: 'c5', netName: 'VPH_FILTER', color: '#06b6d4' },
    { id: 'w5', fromId: 'c5', toId: 'c7', netName: 'GND', color: '#64748b' },
    { id: 'w6', fromId: 'c4', toId: 'c6', netName: 'TH_SENSE', color: '#10b981' }
  ]);

  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [wireStartId, setWireStartId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [activeWireColor, setActiveWireColor] = useState('#eab308');

  if (!isOpen) return null;

  const selectedComp = components.find(c => c.id === selectedCompId);

  // Adicionar novo componente ao centro
  const handleAddComponent = (type: SchematicComponentItem['type']) => {
    const defaultLabels: Record<SchematicComponentItem['type'], { label: string; value: string; color: string }> = {
      battery: { label: 'VBUS / IN', value: '5.0V', color: '#eab308' },
      gnd: { label: 'GND', value: '0V', color: '#64748b' },
      resistor: { label: 'R' + (components.length + 1), value: '10kΩ', color: '#38bdf8' },
      capacitor: { label: 'C' + (components.length + 1), value: '100nF', color: '#06b6d4' },
      inductor: { label: 'L' + (components.length + 1), value: '1.0µH', color: '#eab308' },
      diode: { label: 'D' + (components.length + 1), value: 'TVS 5V', color: '#f43f5e' },
      thermistor: { label: 'TH' + (components.length + 1), value: '100kΩ NTC', color: '#10b981' },
      ic: { label: 'U' + (components.length + 1), value: 'PMIC / CI', color: '#a855f7' },
      fuse: { label: 'F' + (components.length + 1), value: '2A', color: '#f59e0b' },
      testpoint: { label: 'TP' + (components.length + 1), value: 'Check 1.8V', color: '#ec4899' },
    };

    const def = defaultLabels[type];
    const newComp: SchematicComponentItem = {
      id: 'comp-' + Date.now(),
      type,
      label: def.label,
      value: def.value,
      x: 200 + Math.random() * 200,
      y: 150 + Math.random() * 150,
      color: def.color
    };

    setComponents([...components, newComp]);
    setSelectedCompId(newComp.id);
  };

  // Clique para iniciar ou conectar fio
  const handleComponentClick = (comp: SchematicComponentItem) => {
    if (!wireStartId) {
      // Inicia fio
      setWireStartId(comp.id);
    } else {
      // Finaliza fio
      if (wireStartId !== comp.id) {
        const newWire: SchematicWireItem = {
          id: 'wire-' + Date.now(),
          fromId: wireStartId,
          toId: comp.id,
          netName: comp.label,
          color: activeWireColor
        };
        setWires([...wires, newWire]);
      }
      setWireStartId(null);
    }
  };

  // Mover componente por setas
  const handleMoveComp = (dx: number, dy: number) => {
    if (!selectedCompId) return;
    setComponents(components.map(c => {
      if (c.id === selectedCompId) {
        return { ...c, x: Math.max(30, c.x + dx), y: Math.max(30, c.y + dy) };
      }
      return c;
    }));
  };

  const handleDeleteComponent = (id: string) => {
    setComponents(components.filter(c => c.id !== id));
    setWires(wires.filter(w => w.fromId !== id && w.toId !== id));
    if (selectedCompId === id) setSelectedCompId(null);
  };

  // Gera o código SVG final renderizável e salva na placa
  const handleExportAndSave = () => {
    // Monta o SVG
    const svgContent = `
      <svg viewBox="0 0 800 500" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.05)" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="#070b14"/>
        <rect width="100%" height="100%" fill="url(#grid)"/>

        <!-- Fios / Conexoes -->
        ${wires.map(w => {
          const from = components.find(c => c.id === w.fromId);
          const to = components.find(c => c.id === w.toId);
          if (!from || !to) return '';
          return `
            <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${w.color}" stroke-width="3" stroke-linecap="round" />
            <circle cx="${from.x}" cy="${from.y}" r="4" fill="${w.color}" />
            <circle cx="${to.x}" cy="${to.y}" r="4" fill="${w.color}" />
          `;
        }).join('')}

        <!-- Componentes -->
        ${components.map(c => {
          if (c.type === 'gnd') {
            return `
              <g transform="translate(${c.x}, ${c.y})">
                <line x1="0" y1="-15" x2="0" y2="0" stroke="#64748b" stroke-width="3"/>
                <line x1="-12" y1="0" x2="12" y2="0" stroke="#64748b" stroke-width="3"/>
                <line x1="-8" y1="5" x2="8" y2="5" stroke="#64748b" stroke-width="2"/>
                <line x1="-4" y1="10" x2="4" y2="10" stroke="#64748b" stroke-width="1.5"/>
                <text x="0" y="24" fill="#94a3b8" font-size="10" text-anchor="middle" font-family="monospace">GND</text>
              </g>
            `;
          }
          if (c.type === 'ic') {
            return `
              <g transform="translate(${c.x}, ${c.y})">
                <rect x="-45" y="-30" width="90" height="60" rx="8" fill="#1e1b4b" stroke="${c.color}" stroke-width="2" />
                <text x="0" y="-8" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle" font-family="sans-serif">${c.label}</text>
                <text x="0" y="12" fill="${c.color}" font-size="10" text-anchor="middle" font-family="monospace">${c.value}</text>
              </g>
            `;
          }
          return `
            <g transform="translate(${c.x}, ${c.y})">
              <circle cx="0" cy="0" r="22" fill="#0f172a" stroke="${c.color}" stroke-width="2" />
              <text x="0" y="4" fill="#ffffff" font-size="9" font-weight="bold" text-anchor="middle" font-family="monospace">${c.type.substring(0, 3).toUpperCase()}</text>
              <text x="0" y="-28" fill="#e2e8f0" font-size="10" font-weight="bold" text-anchor="middle" font-family="sans-serif">${c.label}</text>
              <text x="0" y="36" fill="${c.color}" font-size="10" text-anchor="middle" font-family="monospace">${c.value}</text>
            </g>
          `;
        }).join('')}
      </svg>
    `;

    onSaveSchematic(svgContent.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn select-none font-sans">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[92vh]">
        {/* Top Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                Criador &amp; Editor Visual de Esquema Elétrico
                <span className="text-xs bg-indigo-950 border border-indigo-500/40 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                  {board.deviceModel || board.title}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Monte circuitos interativos com bateria, bobinas, CIs, termistores e conexões elétricas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAndSave}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950 flex items-center gap-1.5 transition"
            >
              <Save className="w-4 h-4" /> Salvar Esquema na Placa
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar Superior: Paleta de Peças Elétricas */}
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3 overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Adicionar Símbolo:
            </span>
            <button
              onClick={() => handleAddComponent('battery')}
              className="px-2.5 py-1.5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 font-bold hover:bg-red-900 transition"
            >
              + Bateria / VBUS
            </button>
            <button
              onClick={() => handleAddComponent('inductor')}
              className="px-2.5 py-1.5 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-300 font-bold hover:bg-amber-900 transition"
            >
              + Bobina (L)
            </button>
            <button
              onClick={() => handleAddComponent('diode')}
              className="px-2.5 py-1.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 font-bold hover:bg-rose-900 transition"
            >
              + Diodo (D)
            </button>
            <button
              onClick={() => handleAddComponent('thermistor')}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-bold hover:bg-emerald-900 transition"
            >
              + Termistor (TH)
            </button>
            <button
              onClick={() => handleAddComponent('ic')}
              className="px-2.5 py-1.5 rounded-xl bg-purple-950/70 border border-purple-500/40 text-purple-300 font-bold hover:bg-purple-900 transition"
            >
              + CI / PMIC (U)
            </button>
            <button
              onClick={() => handleAddComponent('capacitor')}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-bold hover:bg-cyan-900 transition"
            >
              + Capacitor (C)
            </button>
            <button
              onClick={() => handleAddComponent('resistor')}
              className="px-2.5 py-1.5 rounded-xl bg-sky-950/70 border border-sky-500/40 text-sky-300 font-bold hover:bg-sky-900 transition"
            >
              + Resistor (R)
            </button>
            <button
              onClick={() => handleAddComponent('fuse')}
              className="px-2.5 py-1.5 rounded-xl bg-orange-950/70 border border-orange-500/40 text-orange-300 font-bold hover:bg-orange-900 transition"
            >
              + Fusível (F)
            </button>
            <button
              onClick={() => handleAddComponent('gnd')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold hover:bg-slate-700 transition"
            >
              + Terra GND
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400">Cor do Fio:</span>
            {['#ef4444', '#eab308', '#06b6d4', '#10b981', '#64748b'].map(c => (
              <button
                key={c}
                onClick={() => setActiveWireColor(c)}
                style={{ backgroundColor: c }}
                className={`w-5 h-5 rounded-full border-2 transition ${
                  activeWireColor === c ? 'border-white scale-125' : 'border-transparent'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Workspace Central */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Canvas SVG Interativo */}
          <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center p-4">
            {/* Aviso de conexao ativa de fio */}
            {wireStartId && (
              <div className="absolute top-4 left-4 z-30 bg-amber-500/20 border border-amber-500 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold animate-pulse">
                ⚡ Modo Conexão: Clique no segundo componente para ligar o fio!
              </div>
            )}

            <div 
              className="w-full h-full max-w-[900px] max-h-[580px] bg-[#050811] border border-slate-800 rounded-2xl relative shadow-2xl overflow-hidden transition-transform"
              style={{ transform: `scale(${zoom})` }}
            >
              {/* Grade de Fundo */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <pattern id="builder-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#builder-grid)"/>

                {/* Fios traçados */}
                {wires.map(w => {
                  const from = components.find(c => c.id === w.fromId);
                  const to = components.find(c => c.id === w.toId);
                  if (!from || !to) return null;
                  return (
                    <g key={w.id} className="cursor-pointer">
                      <line
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        stroke={w.color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="hover:stroke-white transition"
                      />
                      <circle cx={from.x} cy={from.y} r="4" fill={w.color} />
                      <circle cx={to.x} cy={to.y} r="4" fill={w.color} />
                    </g>
                  );
                })}
              </svg>

              {/* Componentes Interativos Renderizados na Tela */}
              {components.map(comp => {
                const isSelected = selectedCompId === comp.id;
                const isWireSource = wireStartId === comp.id;

                return (
                  <div
                    key={comp.id}
                    onClick={() => {
                      setSelectedCompId(comp.id);
                      handleComponentClick(comp);
                    }}
                    style={{
                      left: `${comp.x}px`,
                      top: `${comp.y}px`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`absolute z-20 cursor-pointer transition-all flex flex-col items-center group ${
                      isSelected ? 'scale-110 z-30' : 'hover:scale-105'
                    }`}
                  >
                    {comp.type === 'ic' ? (
                      <div className={`px-4 py-2.5 rounded-xl bg-slate-900 border-2 text-center shadow-xl ${
                        isWireSource ? 'border-amber-400 animate-pulse ring-4 ring-amber-500/40' :
                        isSelected ? 'border-white ring-4 ring-indigo-500/40' : 'border-purple-500/60'
                      }`}>
                        <div className="font-bold text-white text-xs">{comp.label}</div>
                        <div className="text-[10px] font-mono text-purple-400">{comp.value}</div>
                      </div>
                    ) : comp.type === 'gnd' ? (
                      <div className="flex flex-col items-center">
                        <div className="w-0.5 h-3 bg-slate-400" />
                        <div className="w-6 h-0.5 bg-slate-400" />
                        <div className="w-4 h-0.5 bg-slate-400 mt-1" />
                        <div className="w-2 h-0.5 bg-slate-400 mt-1" />
                        <span className="text-[9px] font-mono text-slate-400 mt-1">GND</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-white whitespace-nowrap mb-1">
                          {comp.label}
                        </span>
                        <div className={`w-11 h-11 rounded-full bg-slate-900 border-2 flex items-center justify-center font-mono text-xs font-black text-white shadow-xl ${
                          isWireSource ? 'border-amber-400 animate-pulse ring-4 ring-amber-500/50' :
                          isSelected ? 'border-white ring-4 ring-indigo-500/50' : ''
                        }`} style={{ borderColor: comp.color }}>
                          {comp.type.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[10px] font-mono font-bold mt-1" style={{ color: comp.color }}>
                          {comp.value}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Painel Lateral: Edição de Propriedades e Movimentação */}
          <div className="w-full md:w-80 bg-slate-950 border-l border-slate-800 p-4 flex flex-col justify-between overflow-y-auto">
            {selectedComp ? (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-white uppercase flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-indigo-400" /> {selectedComp.type.toUpperCase()}
                  </span>
                  <button
                    onClick={() => handleDeleteComponent(selectedComp.id)}
                    className="text-slate-400 hover:text-red-400 transition"
                    title="Excluir peça"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Nome / Referência:</label>
                  <input
                    type="text"
                    value={selectedComp.label}
                    onChange={(e) => {
                      const val = e.target.value;
                      setComponents(components.map(c => c.id === selectedComp.id ? { ...c, label: val } : c));
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Valor / Especificação:</label>
                  <input
                    type="text"
                    value={selectedComp.value}
                    onChange={(e) => {
                      const val = e.target.value;
                      setComponents(components.map(c => c.id === selectedComp.id ? { ...c, value: val } : c));
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-indigo-300 font-mono font-bold"
                  />
                </div>

                {/* Movimentação com D-Pad */}
                <div>
                  <label className="text-slate-400 block mb-2 flex items-center gap-1">
                    <Move className="w-3.5 h-3.5" /> Ajustar Posição na Grade:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 max-w-[150px] mx-auto text-center font-bold">
                    <div />
                    <button
                      onClick={() => handleMoveComp(0, -20)}
                      className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-white"
                    >
                      ▲
                    </button>
                    <div />
                    <button
                      onClick={() => handleMoveComp(-20, 0)}
                      className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-white"
                    >
                      ◀
                    </button>
                    <button
                      onClick={() => handleMoveComp(0, 20)}
                      className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-white"
                    >
                      ▼
                    </button>
                    <button
                      onClick={() => handleMoveComp(20, 0)}
                      className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-white"
                    >
                      ▶
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setWireStartId(selectedComp.id)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Zap className="w-4 h-4" /> Puxar Fio Deste Ponto
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                <p>Nenhum componente selecionado.</p>
                <p className="mt-2 text-indigo-400">
                  Clique em um componente na tela para editar, mover ou ligar fios elétricos.
                </p>
              </div>
            )}

            {/* Controle de Zoom */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-slate-400 text-xs">
              <span>Zoom:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoom(z => Math.max(0.7, z - 0.15))}
                  className="p-1 hover:text-white"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-mono text-white text-[11px] w-8 text-center">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom(z => Math.min(1.8, z + 0.15))}
                  className="p-1 hover:text-white"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button onClick={() => setZoom(1)} className="p-1 hover:text-white ml-1">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
