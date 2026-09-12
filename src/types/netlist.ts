export interface NetPoint {
  id: string;
  markerId?: string;
  label: string;
  side: 'A' | 'B';
  xPercent: number; // 0-100%
  yPercent: number; // 0-100%
  componentRef?: string;
  pinNumber?: string;
  isVia?: boolean; // Via passante para o outro lado
}

export interface NetGroup {
  id: string;
  boardId: string;
  name: string; // Ex: 'VBUS_5V', 'VBAT', 'PMIC_VDD', 'I2C_SDA'
  voltage?: string; // Ex: '5.0V', '4.2V'
  colorHex: string; // Ex: '#eab308' (amarelo), '#ef4444' (vermelho), '#06b6d4' (ciano)
  description: string;
  points: NetPoint[];
}
