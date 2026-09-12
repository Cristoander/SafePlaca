import React, { useState } from 'react';
import { Gauge, Search, Filter, ShieldCheck } from 'lucide-react';
import type { FpcConnectorData, MultimeterModel } from '../types/fpc';
import { multimeterConfigs } from '../data/defaultFpcConnectors';

interface FpcDiodeGuideViewProps {
  connectors: FpcConnectorData[];
}

export const FpcDiodeGuideView: React.FC<FpcDiodeGuideViewProps> = ({ connectors }) => {
  const [selectedConnectorId, setSelectedConnectorId] = useState<string>(connectors[0]?.id || '');
  const [selectedMeter, setSelectedMeter] = useState<MultimeterModel>('fluke_15b');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'PWR' | 'DATA' | 'GND'>('ALL');

  const activeConnector = connectors.find(c => c.id === selectedConnectorId) || connectors[0];
  const activeMeterConfig = multimeterConfigs.find(m => m.id === selectedMeter) || multimeterConfigs[0];

  if (!activeConnector) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
        Nenhum conector FPC cadastrado para esta placa.
      </div>
    );
  }

  // Filtragem de Pinos
  const filteredPins = activeConnector.pins.filter(pin => {
    const matchesSearch =
      pin.netName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pin.pinNumber.toString().includes(searchQuery) ||
      pin.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'ALL' || pin.signalType === filterType;
    return matchesSearch && matchesType;
  });

  const getCalibratedMv = (baseMv: number) => {
    if (baseMv <= 0) return baseMv; // 0 = GND, -1 = OL
    return Math.round(baseMv * activeMeterConfig.factor);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Header com Seletor de Conector e Seletor de Multímetro */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-bold flex items-center gap-2">
              Guia de Condução Reversa de Conectores FPC (Diode Mode)
            </h3>
            <p className="text-xs text-slate-400">
              Valores reais de referência medidos com a ponta vermelha no GND
            </p>
          </div>
        </div>

        {/* Multimeter Selector */}
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
          <span className="text-xs text-slate-400 font-semibold">Multímetro de Referência:</span>
          <select
            value={selectedMeter}
            onChange={(e) => setSelectedMeter(e.target.value as MultimeterModel)}
            className="bg-slate-950 text-white font-bold text-xs px-2.5 py-1 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500"
          >
            {multimeterConfigs.map(m => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Seletor de FPC tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 gap-2 overflow-x-auto">
        {connectors.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedConnectorId(c.id)}
            className={`px-4 py-2.5 rounded-t-lg font-semibold text-xs transition whitespace-nowrap border-b-2 ${
              c.id === activeConnector.id
                ? 'border-blue-500 text-blue-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {c.name} ({c.totalPins} Pinos)
          </button>
        ))}
      </div>

      {/* Barra de Filtros e Busca de Pinos */}
      <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por pino (ex: 1, VBUS, MIPI, GND)..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filtrar:
          </span>
          {(['ALL', 'PWR', 'DATA', 'GND'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                filterType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {type === 'ALL' ? 'Todos' : type === 'PWR' ? 'Alimentação' : type === 'DATA' ? 'Dados / MIPI' : 'GND (Terra)'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Pinos FPC */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
            <tr>
              <th className="p-3 w-16 text-center">Pino #</th>
              <th className="p-3">Nome da Malha / Sinal</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Queda de Tensão ({activeMeterConfig.name.split(' ')[0]})</th>
              <th className="p-3">Tensão Ativa</th>
              <th className="p-3">Função & Dicas de Reparo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-mono">
            {filteredPins.map(pin => {
              const val = getCalibratedMv(pin.normalMvFluke);
              const isGnd = pin.signalType === 'GND' || val === 0;
              const isOl = val === -1;

              return (
                <tr key={pin.pinNumber} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 text-center font-bold text-white bg-slate-950/40">
                    {pin.pinNumber}
                  </td>
                  <td className="p-3 font-bold text-white">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      pin.signalType === 'PWR' ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30' :
                      pin.signalType === 'DATA' ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30' :
                      pin.signalType === 'GND' ? 'bg-slate-800 text-slate-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {pin.netName}
                    </span>
                  </td>
                  <td className="p-3 text-[11px] font-sans">
                    <span className="font-semibold text-slate-300">{pin.signalType}</span>
                  </td>
                  <td className="p-3 font-bold text-sm">
                    {isGnd ? (
                      <span className="text-slate-400 font-bold">000 mV (GND)</span>
                    ) : isOl ? (
                      <span className="text-purple-400 font-bold">O.L (Aberto)</span>
                    ) : (
                      <span className="text-emerald-400 font-bold">{val} mV</span>
                    )}
                  </td>
                  <td className="p-3 text-slate-300">
                    {pin.activeVoltage || '—'}
                  </td>
                  <td className="p-3 font-sans text-slate-400 text-xs">
                    {pin.description}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {activeConnector.notes && (
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
          <span>Nota técnica: {activeConnector.notes}</span>
        </div>
      )}
    </div>
  );
};
