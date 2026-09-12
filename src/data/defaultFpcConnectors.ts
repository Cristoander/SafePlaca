import type { FpcConnectorData, MultimeterConfig } from '../types/fpc';

export const multimeterConfigs: MultimeterConfig[] = [
  { id: 'fluke_15b', name: 'Fluke 15B+ / 17B (Padrão Ouro)', factor: 1.0, brandColor: '#eab308' },
  { id: 'sunshine_dt17n', name: 'Sunshine DT-17N / Qianli', factor: 0.94, brandColor: '#3b82f6' },
  { id: 'qianli_mega', name: 'QianLi Mega-Idea / Mechanic', factor: 1.05, brandColor: '#10b981' },
];

export const initialFpcConnectors: FpcConnectorData[] = [
  {
    id: 'fpc-s20fe-sub',
    boardId: 'samsung-s20-fe-main',
    name: 'FPC Conector Subplaca / Carga Principal (HD01)',
    fpcCode: 'FPC_MAIN_40P',
    side: 'A',
    totalPins: 20,
    pitchMm: 0.35,
    notes: 'Conector de comunicação e transporte de carga da subplaca inferior até a placa mãe. Testar com ponta vermelha no GND.',
    pins: [
      { pinNumber: 1, netName: 'VBUS_5V_MAIN', signalType: 'PWR', activeVoltage: '5.0V / 9.0V', normalMvFluke: 512, description: 'Alimentação positiva de carga do conector USB-C' },
      { pinNumber: 2, netName: 'VBUS_5V_MAIN', signalType: 'PWR', activeVoltage: '5.0V / 9.0V', normalMvFluke: 512, description: 'Alimentação positiva secundária de carga' },
      { pinNumber: 3, netName: 'USB_HS_DP (D+)', signalType: 'DATA', activeVoltage: '3.3V pico', normalMvFluke: 685, description: 'Linha positiva de dados USB 2.0 / Carregamento QC' },
      { pinNumber: 4, netName: 'USB_HS_DM (D-)', signalType: 'DATA', activeVoltage: '3.3V pico', normalMvFluke: 687, description: 'Linha negativa de dados USB 2.0 / Carregamento QC' },
      { pinNumber: 5, netName: 'CC1_TYPE_C', signalType: 'DATA', activeVoltage: '1.8V / 5V', normalMvFluke: 580, description: 'Linha de configuração do conector Type-C lado 1' },
      { pinNumber: 6, netName: 'CC2_TYPE_C', signalType: 'DATA', activeVoltage: '1.8V / 5V', normalMvFluke: 582, description: 'Linha de configuração do conector Type-C lado 2' },
      { pinNumber: 7, netName: 'GND_GROUND', signalType: 'GND', activeVoltage: '0.0V', normalMvFluke: 0, description: 'Terra / Blindagem negativa da placa' },
      { pinNumber: 8, netName: 'GND_GROUND', signalType: 'GND', activeVoltage: '0.0V', normalMvFluke: 0, description: 'Terra de sinal' },
      { pinNumber: 9, netName: 'MIC_MAIN_BIAS', signalType: 'PWR', activeVoltage: '2.8V', normalMvFluke: 620, description: 'Alimentação de polarização do microfone inferior' },
      { pinNumber: 10, netName: 'MIC_MAIN_IN_P', signalType: 'DATA', activeVoltage: 'Sinal analógico', normalMvFluke: 710, description: 'Sinal de áudio do microfone inferior de ligação' },
      { pinNumber: 11, netName: 'SPK_OUT_P', signalType: 'PWR', activeVoltage: 'Áudio AC', normalMvFluke: 430, description: 'Saída positiva para o alto-falante campainha' },
      { pinNumber: 12, netName: 'SPK_OUT_N', signalType: 'PWR', activeVoltage: 'Áudio AC', normalMvFluke: 430, description: 'Saída negativa para o alto-falante campainha' },
      { pinNumber: 13, netName: 'TH_SUB_DET', signalType: 'DATA', activeVoltage: '1.2V', normalMvFluke: 590, description: 'Linha do termistor de temperatura da subplaca' },
      { pinNumber: 14, netName: 'VIB_MOTOR_PWM', signalType: 'DATA', activeVoltage: '3.0V', normalMvFluke: 640, description: 'Controle de vibração háptica do motor' },
      { pinNumber: 15, netName: 'ANT_DET_SUB', signalType: 'DATA', activeVoltage: '0.0V', normalMvFluke: 740, description: 'Detecção de acoplamento da antena inferior' },
      { pinNumber: 16, netName: 'GND_GROUND', signalType: 'GND', activeVoltage: '0.0V', normalMvFluke: 0, description: 'Terra de proteção RF' },
      { pinNumber: 17, netName: 'IF_PMIC_INT_N', signalType: 'DATA', activeVoltage: '1.8V', normalMvFluke: 655, description: 'Linha de interrupção da subplaca para o IF-PMIC' },
      { pinNumber: 18, netName: 'I2C_SUB_SDA', signalType: 'DATA', activeVoltage: '1.8V', normalMvFluke: 670, description: 'Barramento I2C Dados' },
      { pinNumber: 19, netName: 'I2C_SUB_SCL', signalType: 'CLK', activeVoltage: '1.8V', normalMvFluke: 672, description: 'Barramento I2C Clock' },
      { pinNumber: 20, netName: 'NC_NO_CONNECT', signalType: 'NC', activeVoltage: 'N/A', normalMvFluke: -1, description: 'Pino não conectado (deve marcar OL no multímetro)' }
    ]
  },
  {
    id: 'fpc-s20fe-screen',
    boardId: 'samsung-s20-fe-main',
    name: 'FPC Conector Tela OLED / Touch (DISP01)',
    fpcCode: 'FPC_OLED_30P',
    side: 'A',
    totalPins: 16,
    pitchMm: 0.35,
    notes: 'Conector da tela Super AMOLED 120Hz. Verifique se as linhas MIPI possuem valores próximos entre si.',
    pins: [
      { pinNumber: 1, netName: 'VDD_AMOLED_4V6', signalType: 'PWR', activeVoltage: '4.6V', normalMvFluke: 410, description: 'Tensão positiva de alimentação do display' },
      { pinNumber: 2, netName: 'VEE_AMOLED_NEG_4V4', signalType: 'PWR', activeVoltage: '-4.4V', normalMvFluke: 415, description: 'Tensão negativa do painel AMOLED' },
      { pinNumber: 3, netName: 'VDD_IO_1V8', signalType: 'PWR', activeVoltage: '1.8V', normalMvFluke: 490, description: 'Alimentação lógica do controlador de touch' },
      { pinNumber: 4, netName: 'GND_GROUND', signalType: 'GND', activeVoltage: '0.0V', normalMvFluke: 0, description: 'Terra' },
      { pinNumber: 5, netName: 'MIPI_DSI_CLK_P', signalType: 'CLK', activeVoltage: '0.2V ~ 1.2V', normalMvFluke: 380, description: 'Par diferencial MIPI Clock +' },
      { pinNumber: 6, netName: 'MIPI_DSI_CLK_N', signalType: 'CLK', activeVoltage: '0.2V ~ 1.2V', normalMvFluke: 382, description: 'Par diferencial MIPI Clock -' },
      { pinNumber: 7, netName: 'MIPI_DSI_D0_P', signalType: 'DATA', activeVoltage: '0.2V ~ 1.2V', normalMvFluke: 379, description: 'Par diferencial MIPI Dados 0 +' },
      { pinNumber: 8, netName: 'MIPI_DSI_D0_N', signalType: 'DATA', activeVoltage: '0.2V ~ 1.2V', normalMvFluke: 381, description: 'Par diferencial MIPI Dados 0 -' },
      { pinNumber: 9, netName: 'GND_GROUND', signalType: 'GND', activeVoltage: '0.0V', normalMvFluke: 0, description: 'Terra blindagem MIPI' },
      { pinNumber: 10, netName: 'TOUCH_RST_N', signalType: 'RST', activeVoltage: '1.8V', normalMvFluke: 620, description: 'Reset do touch screen' },
      { pinNumber: 11, netName: 'TOUCH_INT_N', signalType: 'DATA', activeVoltage: '1.8V', normalMvFluke: 615, description: 'Interrupção do touch screen' },
      { pinNumber: 12, netName: 'TOUCH_I2C_SDA', signalType: 'DATA', activeVoltage: '1.8V', normalMvFluke: 630, description: 'Dados I2C do Touch' },
      { pinNumber: 13, netName: 'TOUCH_I2C_SCL', signalType: 'CLK', activeVoltage: '1.8V', normalMvFluke: 632, description: 'Clock I2C do Touch' },
      { pinNumber: 14, netName: 'DISP_TE_SYNC', signalType: 'DATA', activeVoltage: '1.8V', normalMvFluke: 650, description: 'Sinal de sincronismo Tearing Effect 120Hz' },
      { pinNumber: 15, netName: 'PWM_BL_ENABLE', signalType: 'DATA', activeVoltage: '1.8V', normalMvFluke: 640, description: 'Habilitação do brilho da tela' },
      { pinNumber: 16, netName: 'GND_GROUND', signalType: 'GND', activeVoltage: '0.0V', normalMvFluke: 0, description: 'Terra' },
    ]
  }
];
