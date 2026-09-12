import type { NetGroup } from '../types/netlist';

export const initialNetGroups: NetGroup[] = [
  {
    id: 'net-s20fe-vbus',
    boardId: 'samsung-s20-fe-main',
    name: 'VBUS_5V_IN',
    voltage: '5.0V ~ 9.0V (QC/PD)',
    colorHex: '#eab308', // Amarelo Dourado
    description: 'Linha principal de alimentação do carregador vinda do conector FPC até o OVP e CI de Carga (PMIC/IF-PMIC).',
    points: [
      { id: 'p1', label: 'FPC Subplaca Pino 1 e 2', side: 'A', xPercent: 22, yPercent: 82, componentRef: 'FPC_MAIN', pinNumber: '1-2' },
      { id: 'p2', label: 'Capacitor de Filtro C1204', side: 'A', xPercent: 28, yPercent: 74, componentRef: 'C1204' },
      { id: 'p3', label: 'Diodo de Proteção TVS D101', side: 'A', xPercent: 32, yPercent: 71, componentRef: 'D101' },
      { id: 'p4', label: 'Via Passante Lado A -> Lado B', side: 'A', xPercent: 36, yPercent: 68, isVia: true },
      { id: 'p5', label: 'Entrada CI OVP (Proteção contra Sobretensão)', side: 'B', xPercent: 36, yPercent: 68, componentRef: 'U1102' },
      { id: 'p6', label: 'Entrada IF-PMIC SM5713 Pino A4', side: 'B', xPercent: 52, yPercent: 44, componentRef: 'U3001', pinNumber: 'A4' },
    ]
  },
  {
    id: 'net-s20fe-vbat',
    boardId: 'samsung-s20-fe-main',
    name: 'VBAT_MAIN / VPH_PWR',
    voltage: '3.7V ~ 4.35V',
    colorHex: '#ef4444', // Vermelho Neon
    description: 'Linha de alimentação primária de potência da bateria conectada ao conector da bateria, IF-PMIC e amplificador de áudio.',
    points: [
      { id: 'p10', label: 'Conector da Bateria Pino Positivo', side: 'A', xPercent: 72, yPercent: 84, componentRef: 'BAT_CON', pinNumber: '1' },
      { id: 'p11', label: 'Capacitores de desacoplamento C2001/C2002', side: 'A', xPercent: 68, yPercent: 76, componentRef: 'C2001' },
      { id: 'p12', label: 'Bobina de Chaveamento de Carga L3001', side: 'A', xPercent: 54, yPercent: 52, componentRef: 'L3001' },
      { id: 'p13', label: 'Via Passante para Lado B', side: 'A', xPercent: 58, yPercent: 49, isVia: true },
      { id: 'p14', label: 'Alimentação Amplificador de Áudio U5001', side: 'B', xPercent: 62, yPercent: 38, componentRef: 'U5001' }
    ]
  },
  {
    id: 'net-s20fe-i2c-sda',
    boardId: 'samsung-s20-fe-main',
    name: 'I2C_MAIN_SDA',
    voltage: '1.8V Pull-up',
    colorHex: '#06b6d4', // Ciano Neon
    description: 'Barramento de dados serial I2C de comunicação entre CPU e gerenciador de carga/bateria.',
    points: [
      { id: 'p20', label: 'Pull-up Resistor R401 (1.8V)', side: 'A', xPercent: 44, yPercent: 38, componentRef: 'R401' },
      { id: 'p21', label: 'IF-PMIC SM5713 Pino SDA', side: 'B', xPercent: 50, yPercent: 46, componentRef: 'U3001' },
      { id: 'p22', label: 'CPU Qualcomm SD865 Ball B14', side: 'B', xPercent: 48, yPercent: 28, componentRef: 'U1001' }
    ]
  },
  {
    id: 'net-s20fe-therm',
    boardId: 'samsung-s20-fe-main',
    name: 'TH_AP_DET (Sensor Temperatura)',
    voltage: '0.8V ~ 1.2V ADC',
    colorHex: '#10b981', // Verde Esmeralda
    description: 'Linha do divisor resistivo com Termistor NTC para monitoramento de temperatura do processador.',
    points: [
      { id: 'p30', label: 'Termistor NTC TH3000 (100k)', side: 'A', xPercent: 38, yPercent: 42, componentRef: 'TH3000' },
      { id: 'p31', label: 'Resistor R3012 Divisor de Tensão', side: 'A', xPercent: 40, yPercent: 42, componentRef: 'R3012' },
      { id: 'p32', label: 'Entrada ADC no PMIC PM7150', side: 'B', xPercent: 45, yPercent: 35, componentRef: 'U2001' }
    ]
  }
];
