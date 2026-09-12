export interface JumperPoint {
  xPercent: number;
  yPercent: number;
}

export interface HardwareSolutionJumper {
  id: string;
  boardId: string;
  title: string;
  category: 'carga' | 'audio' | 'power' | 'backlight' | 'dados';
  wireSpec: '0.01mm Isolado' | '0.02mm Isolado' | '0.04mm Esmaltado';
  symptom: string;
  side: 'A' | 'B';
  startPointDesc: string;
  endPointDesc: string;
  points: JumperPoint[];
  instructions: string[];
  warningTip?: string;
}
