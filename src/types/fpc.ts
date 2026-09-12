export type MultimeterModel = 'fluke_15b' | 'sunshine_dt17n' | 'qianli_mega';

export interface MultimeterConfig {
  id: MultimeterModel;
  name: string;
  factor: number; // Fator de calibração em relação ao Fluke 15B+
  brandColor: string;
}

export interface FpcPinReading {
  pinNumber: number;
  netName: string;
  signalType: 'PWR' | 'GND' | 'DATA' | 'CLK' | 'RST' | 'NC';
  activeVoltage?: string; // Ex: '1.8V'
  normalMvFluke: number; // Valor de referência em mV (0 = GND, -1 = OL / Aberto)
  description: string;
  connectedComponent?: string; // Ex: 'Resistor R201', 'Filtro EMI FL10'
}

export interface FpcConnectorData {
  id: string;
  boardId: string;
  name: string; // Ex: 'FPC Subplaca de Carga / Main'
  fpcCode: string; // Ex: 'HD01'
  side: 'A' | 'B';
  totalPins: number;
  pitchMm?: number;
  pins: FpcPinReading[];
  notes?: string;
}
