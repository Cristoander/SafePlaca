export type PinType = 'power_in' | 'power_out' | 'battery' | 'signal' | 'ground' | 'test_point';

export interface PinoutItem {
  name: string;
  pinType: PinType;
  voltage: string;
  description: string;
  terminal?: string;
  wireColorHex?: string;
  diodeScaleMv?: number; // Condução reversa em mV (escala de diodo)
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
  diodeScaleMv?: number; // Valor em escala de diodo (ponta vermelha no GND)
}

export interface ComponentBOM {
  reference: string;
  partNumber: string;
  package: string;
  description: string;
  criticalSpec?: string;
}

export type BoardCategory = 
  | 'Smartphones & Subplacas'
  | 'Carga / Li-ion / BMS' 
  | 'Conversores DC-DC' 
  | 'Fontes & Alimentação' 
  | 'Microcontroladores & Shields' 
  | 'Áudio & Potência'
  | 'Personalizado';

export type BoardStatus = 'homologado' | 'em_bancada' | 'em_analise' | 'alerta_defeito';

export type ComponentKind = 'conector' | 'bobina' | 'diodo' | 'ci' | 'termistor' | 'capacitor' | 'resistor';

export interface BoardComponentMarker {
  id: string;
  kind: ComponentKind;
  reference: string; // Ex: L3001, TH3000, FPC_MAIN, U3001
  name: string;
  xPercent: number; // 0 a 100 na imagem
  yPercent: number; // 0 a 100 na imagem
  functionDesc: string;
  diodeScaleMv?: number;
  voltage?: string;
  faultSymptom?: string;
  repairTip?: string;
}

export interface CommonFault {
  id: string;
  title: string;
  symptom: string;
  cause: string;
  testProcedure: string;
  solution: string;
  relatedComponents: string[];
  difficulty: 'facil' | 'medio' | 'avancado';
}

export type VisualStyle = 'normal' | 'blueprint' | 'xray' | 'edges';

export interface DeviceFolder {
  id: string;
  name: string;
  brand: string;
  icon?: string;
}

export interface BoardProject {
  id: string;
  title: string;
  modelCode: string;
  category: BoardCategory;
  folderId?: string;
  brand?: string; // Ex: Samsung, Motorola, Xiaomi, Apple, Genérico
  deviceModel?: string; // Ex: Galaxy S20 FE, Moto G52, etc.
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
  schematicSvg: string; // Vetor SVG renderizável
  realPhotoUrl?: string; // Foto real de bancada (opcional ou base64)
  visualStyle?: VisualStyle;
  markers?: BoardComponentMarker[]; // Bobinas, conectores, CIs mapeados
  commonFaults?: CommonFault[]; // Defeitos comuns e soluções
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
