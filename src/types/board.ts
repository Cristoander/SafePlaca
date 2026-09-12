export type PinType = 'power_in' | 'power_out' | 'battery' | 'signal' | 'ground' | 'test_point';

export interface PinoutItem {
  name: string;
  pinType: PinType;
  voltage: string;
  description: string;
  terminal?: string;
  wireColorHex?: string;
}

export interface TestPoint {
  id: string;
  label: string;
  expectedVoltage: string;
  tolerance: string;
  description: string;
  normalBehavior: string;
  faultSymptom: string;
  signalType: 'DC' | 'PWM' | 'Analog' | 'Digital';
}

export interface ComponentBOM {
  reference: string;
  partNumber: string;
  package: string;
  description: string;
  criticalSpec?: string;
}

export type BoardCategory = 
  | 'Carga / Li-ion / BMS' 
  | 'Conversores DC-DC' 
  | 'Fontes & Alimentação' 
  | 'Microcontroladores & Shields' 
  | 'Áudio & Potência'
  | 'Personalizado';

export type BoardStatus = 'homologado' | 'em_bancada' | 'em_analise' | 'alerta_defeito';

export interface BoardProject {
  id: string;
  title: string;
  modelCode: string;
  category: BoardCategory;
  description: string;
  status: BoardStatus;
  vinMin: number;
  vinMax: number;
  voutMin?: number;
  voutMax?: number;
  iMax: number;
  chargeCutoff?: number;
  efficiency?: number;
  protections: {
    overcharge?: boolean;
    overdischarge?: boolean;
    shortCircuit?: boolean;
    reversePolarity?: boolean;
    overtemp?: boolean;
  };
  keyChips: string[];
  schematicSvg: string; // Vetor SVG renderizável de alta resolução
  pinouts: PinoutItem[];
  testPoints: TestPoint[];
  bom: ComponentBOM[];
  benchNotes: string[];
  progTable?: { resistor: string; current: string; notes?: string }[];
  tags: string[];
  isProtected: boolean;
  watermarkCode: string;
  createdAt: string;
  updatedAt: string;
}
