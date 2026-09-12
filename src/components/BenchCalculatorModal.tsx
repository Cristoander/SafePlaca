import React, { useState } from 'react';
import { Calculator, Zap, Cpu, Sparkles, X, Info } from 'lucide-react';

interface BenchCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BenchCalculatorModal: React.FC<BenchCalculatorModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'smd' | 'capacitor' | 'diode_ref'>('smd');

  // SMD Resistor State
  const [smdCode, setSmdCode] = useState('103');
  const [smdResult, setSmdResult] = useState<{ ohms: number; formatted: string; tolerance: string } | null>(null);

  // Capacitor Code State
  const [capCode, setCapCode] = useState('104');
  const [capResult, setCapResult] = useState<{ pf: number; nf: number; uf: number } | null>(null);

  if (!isOpen) return null;

  // Calculadora SMD Resistor
  const calculateSmd = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setSmdResult(null);
      return;
    }

    // 3 dígitos (ex: 103 = 10 * 10^3 = 10k)
    if (/^\d{3}$/.test(clean)) {
      const base = parseInt(clean.substring(0, 2), 10);
      const mult = parseInt(clean.substring(2, 3), 10);
      const ohms = base * Math.pow(10, mult);
      setSmdResult({
        ohms,
        formatted: formatOhms(ohms),
        tolerance: '±5% (Padrão SMD 3 Dígitos)'
      });
      return;
    }

    // 4 dígitos (ex: 1002 = 100 * 10^2 = 10k)
    if (/^\d{4}$/.test(clean)) {
      const base = parseInt(clean.substring(0, 3), 10);
      const mult = parseInt(clean.substring(3, 4), 10);
      const ohms = base * Math.pow(10, mult);
      setSmdResult({
        ohms,
        formatted: formatOhms(ohms),
        tolerance: '±1% (Precisão SMD 4 Dígitos)'
      });
      return;
    }

    // Notação com R (ex: 4R7 = 4.7 ohms, R22 = 0.22 ohms)
    if (clean.includes('R')) {
      const parts = clean.split('R');
      const integerPart = parts[0] === '' ? '0' : parts[0];
      const decimalPart = parts[1] || '0';
      const ohms = parseFloat(`${integerPart}.${decimalPart}`);
      setSmdResult({
        ohms,
        formatted: `${ohms} Ω`,
        tolerance: '±1% ou ±5%'
      });
      return;
    }

    setSmdResult(null);
  };

  const formatOhms = (ohms: number) => {
    if (ohms >= 1_000_000) {
      return `${(ohms / 1_000_000).toFixed(2).replace(/\.00$/, '')} MΩ (Megaohms)`;
    }
    if (ohms >= 1_000) {
      return `${(ohms / 1_000).toFixed(2).replace(/\.00$/, '')} kΩ (Kilohms)`;
    }
    return `${ohms} Ω (Ohms)`;
  };

  // Calculadora Capacitor Cerâmico
  const calculateCap = (code: string) => {
    const clean = code.trim();
    if (!/^\d{3}$/.test(clean)) {
      setCapResult(null);
      return;
    }
    const base = parseInt(clean.substring(0, 2), 10);
    const mult = parseInt(clean.substring(2, 3), 10);
    const pf = base * Math.pow(10, mult);
    const nf = pf / 1000;
    const uf = pf / 1_000_000;
    setCapResult({ pf, nf, uf });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Calculadora & Referência de Bancada</h3>
              <p className="text-xs text-slate-400">Decodificador SMD, capacitores e valores de condução reversa</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('smd')}
            className={`px-4 py-2.5 rounded-t-lg font-semibold text-sm transition flex items-center gap-2 border-b-2 ${
              activeTab === 'smd'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" /> Resistor SMD
          </button>
          <button
            onClick={() => setActiveTab('capacitor')}
            className={`px-4 py-2.5 rounded-t-lg font-semibold text-sm transition flex items-center gap-2 border-b-2 ${
              activeTab === 'capacitor'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" /> Capacitor Cerâmico
          </button>
          <button
            onClick={() => setActiveTab('diode_ref')}
            className={`px-4 py-2.5 rounded-t-lg font-semibold text-sm transition flex items-center gap-2 border-b-2 ${
              activeTab === 'diode_ref'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-4 h-4" /> Guia de Queda Diode (mV)
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'smd' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Digite o Código Marcado no Resistor SMD:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={smdCode}
                    onChange={(e) => {
                      setSmdCode(e.target.value);
                      calculateSmd(e.target.value);
                    }}
                    placeholder="Ex: 103, 472, 1002, 4R7, R22"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-lg font-mono text-indigo-400 tracking-wider focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => calculateSmd(smdCode)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition"
                  >
                    Calcular
                  </button>
                </div>
              </div>

              {smdResult ? (
                <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex flex-col gap-2">
                  <div className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">Valor Decodificado</div>
                  <div className="text-2xl font-bold text-white font-mono">{smdResult.formatted}</div>
                  <div className="text-sm text-slate-300">Resistência Exata: <span className="font-mono text-emerald-400">{smdResult.ohms} Ohms</span></div>
                  <div className="text-xs text-slate-400">Tolerância: {smdResult.tolerance}</div>
                </div>
              ) : (
                <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl text-xs text-slate-400">
                  💡 Exemplos comuns: <span className="text-slate-300 font-mono">102 = 1kΩ</span> | <span className="text-slate-300 font-mono">103 = 10kΩ</span> | <span className="text-slate-300 font-mono">473 = 47kΩ</span> | <span className="text-slate-300 font-mono">104 = 100kΩ</span> | <span className="text-slate-300 font-mono">4R7 = 4.7Ω</span> | <span className="text-slate-300 font-mono">000 = Jumper (0Ω)</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'capacitor' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Código de 3 Dígitos do Capacitor (ex: 104, 225, 473):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={capCode}
                    onChange={(e) => {
                      setCapCode(e.target.value);
                      calculateCap(e.target.value);
                    }}
                    placeholder="Ex: 104"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-lg font-mono text-cyan-400 tracking-wider focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={() => calculateCap(capCode)}
                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl transition"
                  >
                    Converter
                  </button>
                </div>
              </div>

              {capResult && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-800/60 border border-slate-700 rounded-xl text-center">
                    <div className="text-xs text-slate-400">Picofarads (pF)</div>
                    <div className="text-lg font-bold text-white font-mono mt-1">{capResult.pf.toLocaleString()} pF</div>
                  </div>
                  <div className="p-3 bg-cyan-950/50 border border-cyan-500/30 rounded-xl text-center">
                    <div className="text-xs text-cyan-300">Nanofarads (nF)</div>
                    <div className="text-lg font-bold text-cyan-300 font-mono mt-1">{capResult.nf} nF</div>
                  </div>
                  <div className="p-3 bg-indigo-950/50 border border-indigo-500/30 rounded-xl text-center">
                    <div className="text-xs text-indigo-300">Microfarads (µF)</div>
                    <div className="text-lg font-bold text-indigo-300 font-mono mt-1">{capResult.uf} µF</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'diode_ref' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                Dica de Bancada: Meça na escala de diodo com ponta <span className="font-bold underline">VERMELHA no terra (GND)</span> e ponta <span className="font-bold underline">PRETA na linha a ser testada</span>.
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-800 text-slate-300">
                    <tr>
                      <th className="p-2.5">Tipo de Linha</th>
                      <th className="p-2.5">Queda Normal (Fluke 15B+)</th>
                      <th className="p-2.5">Diagnóstico Rápido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr>
                      <td className="p-2.5 font-bold text-amber-400">Linha VBUS (Carga 5V)</td>
                      <td className="p-2.5 font-mono">480 mV ~ 580 mV</td>
                      <td className="p-2.5">Abaixo de 100mV = curto no CI OVP ou Diodo TVS.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-red-400">Linha VBAT / VDD_MAIN</td>
                      <td className="p-2.5 font-mono">350 mV ~ 480 mV</td>
                      <td className="p-2.5">Zero (000mV) = curto direto na bateria / capacitor primário.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-cyan-400">Dados USB (D+ / D-)</td>
                      <td className="p-2.5 font-mono">600 mV ~ 750 mV</td>
                      <td className="p-2.5">Ambas as linhas devem ter valores idênticos (diferença máx 10mV).</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-emerald-400">Barramento I2C (SDA / SCL)</td>
                      <td className="p-2.5 font-mono">550 mV ~ 700 mV</td>
                      <td className="p-2.5">Se marcar OL = resistor pull-up ou CI desconectado.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-purple-400">Bobinas BUCK de CPU / GPU</td>
                      <td className="p-2.5 font-mono">015 mV ~ 090 mV</td>
                      <td className="p-2.5">Atenção: baixa resistência é NORMAL para núcleos de processador!</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
