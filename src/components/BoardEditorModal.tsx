import React, { useState } from 'react';
import type { BoardProject, BoardCategory } from '../types/board';
import { X, Save } from 'lucide-react';

interface BoardEditorModalProps {
  onClose: () => void;
  onSave: (newBoard: BoardProject) => void;
  initialFolderId?: string;
}

export const BoardEditorModal: React.FC<BoardEditorModalProps> = ({ onClose, onSave, initialFolderId }) => {
  const [title, setTitle] = useState('');
  const [modelCode, setModelCode] = useState('MOD-CHRG-');
  const [category, setCategory] = useState<BoardCategory>('Carga / Li-ion / BMS');
  const [description, setDescription] = useState('');
  const [vinMin, setVinMin] = useState(4.5);
  const [vinMax, setVinMax] = useState(5.5);
  const [iMax, setIMax] = useState(1.0);
  const [chips, setChips] = useState('TP4056, DW01A');
  const [benchNote, setBenchNote] = useState('Atenção com a polaridade da bateria.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanChips = chips.split(',').map(c => c.trim()).filter(Boolean);

    // SVG Padrão personalizado com os dados da placa
    const customSvg = `<svg viewBox="0 0 920 480" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto text-slate-200 select-none">
      <rect width="100%" height="100%" fill="#070b14" />
      <text x="30" y="40" fill="#38bdf8" font-family="monospace" font-size="18" font-weight="bold">${title.toUpperCase()}</text>
      <text x="30" y="65" fill="#94a3b8" font-family="monospace" font-size="12">CÓDIGO: ${modelCode} | ENTRADA: ${vinMin}V - ${vinMax}V | IMAX: ${iMax}A</text>
      <g transform="translate(60, 120)">
        <rect x="0" y="0" width="800" height="260" rx="12" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
        <text x="400" y="100" fill="#6ee7b7" font-family="monospace" font-size="20" font-weight="bold" text-anchor="middle">ESQUEMA TÉCNICO REGISTRADO</text>
        <text x="400" y="140" fill="#94a3b8" font-family="monospace" font-size="14" text-anchor="middle">CHIPS: ${cleanChips.join(' • ')}</text>
        <text x="400" y="180" fill="#ef4444" font-family="monospace" font-size="13" text-anchor="middle">SAFEPLACA • PROPRIEDADE TÉCNICA DE BANCADA</text>
      </g>
    </svg>`;

    const newBoard: BoardProject = {
      id: 'custom-' + Date.now(),
      title: title || 'Nova Placa de Carga',
      modelCode: modelCode || 'MOD-CUSTOM',
      category,
      folderId: initialFolderId,
      description: description || 'Projeto de placa de carga cadastrado na bancada.',
      status: 'em_bancada',
      vinMin: Number(vinMin),
      vinMax: Number(vinMax),
      iMax: Number(iMax),
      protections: {
        overcharge: true,
        shortCircuit: true,
      },
      keyChips: cleanChips,
      schematicSvg: customSvg,
      pinouts: [
        { name: 'IN+', pinType: 'power_in', voltage: `${vinMin}V - ${vinMax}V`, description: 'Alimentação positiva' },
        { name: 'GND', pinType: 'ground', voltage: '0V', description: 'Referência comum' },
        { name: 'BAT+', pinType: 'battery', voltage: '4.2V', description: 'Polo positivo da bateria' },
        { name: 'BAT-', pinType: 'battery', voltage: '0V', description: 'Polo negativo da bateria' },
      ],
      testPoints: [
        { id: 'TP1', label: 'Tensão de Entrada', expectedVoltage: `${vinMin}V`, tolerance: '±5%', description: 'Tensão no borne de entrada', normalBehavior: 'Estável', faultSymptom: '0V se fusível romper', signalType: 'DC' }
      ],
      bom: cleanChips.map((chip, idx) => ({
        reference: `U${idx + 1}`,
        partNumber: chip,
        package: 'SMD',
        description: 'Componente principal do projeto',
      })),
      benchNotes: [benchNote],
      tags: ['Custom', category],
      isProtected: true,
      watermarkCode: 'SAFE-CUSTOM-' + Date.now().toString().slice(-4),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onSave(newBoard);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto select-none no-copy-shield">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Cadastrar Nova Placa / Esquema</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="text-slate-400 block mb-1">Nome do Projeto / Placa:</label>
            <input
              type="text"
              required
              placeholder="Ex: Módulo Carga Type-C Rápido IP5306"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Código Modelo:</label>
              <input
                type="text"
                required
                value={modelCode}
                onChange={(e) => setModelCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Categoria:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BoardCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="Carga / Li-ion / BMS">Carga / Li-ion / BMS</option>
                <option value="Conversores DC-DC">Conversores DC-DC</option>
                <option value="Fontes & Alimentação">Fontes &amp; Alimentação</option>
                <option value="Microcontroladores & Shields">Microcontroladores</option>
                <option value="Personalizado">Personalizado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">Vin Mín (V):</label>
              <input
                type="number"
                step="0.1"
                value={vinMin}
                onChange={(e) => setVinMin(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Vin Máx (V):</label>
              <input
                type="number"
                step="0.1"
                value={vinMax}
                onChange={(e) => setVinMax(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Imax (A):</label>
              <input
                type="number"
                step="0.1"
                value={iMax}
                onChange={(e) => setIMax(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">CIs Principais (separados por vírgula):</label>
            <input
              type="text"
              value={chips}
              onChange={(e) => setChips(e.target.value)}
              placeholder="Ex: TP4056, DW01A, FS8205A"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Descrição Técnica:</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Finalidade da placa, tipo de bateria ou saída..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Alerta de Bancada:</label>
            <input
              type="text"
              value={benchNote}
              onChange={(e) => setBenchNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Salvar Placa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
