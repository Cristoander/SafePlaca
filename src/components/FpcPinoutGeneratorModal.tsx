import React, { useState } from 'react';
import type { BoardComponentMarker } from '../types/board';
import { Layers, X, Check, Smartphone } from 'lucide-react';

interface FpcPinoutGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSide: 'A' | 'B';
  onGeneratePins: (newPins: BoardComponentMarker[]) => void;
}

interface PinDraft {
  pinNumber: number;
  netName: string;
  diodeScaleMv: number;
  voltage: string;
  description: string;
}

export const FpcPinoutGeneratorModal: React.FC<FpcPinoutGeneratorModalProps> = ({
  isOpen,
  onClose,
  activeSide,
  onGeneratePins,
}) => {
  const [connectorRef, setConnectorRef] = useState('FPC_A15');
  const [totalPins, setTotalPins] = useState(30);
  const [layoutMode, setLayoutMode] = useState<'dual_row' | 'single_row'>('dual_row');
  const [centerX, setCenterX] = useState(50);
  const [centerY, setCenterY] = useState(50);
  const [pinSpacingX, setPinSpacingX] = useState(1.8);
  const [rowSpacingY, setRowSpacingY] = useState(4.5);

  // Lista de Pinos Rascunho
  const [pinsList, setPinsList] = useState<PinDraft[]>(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      pinNumber: i + 1,
      netName: (i + 1) === 1 || (i + 1) === 2 ? 'VBUS_5V' : (i + 1) % 5 === 0 ? 'GND' : `PIN_${i + 1}`,
      diodeScaleMv: (i + 1) % 5 === 0 ? 0 : 540,
      voltage: (i + 1) === 1 || (i + 1) === 2 ? '5.0V' : '1.8V',
      description: `Pino ${i + 1} do conector FPC`,
    }));
  });

  if (!isOpen) return null;

  // Ajustar quantidade de pinos
  const handleTotalPinsChange = (newTotal: number) => {
    const clamped = Math.max(4, Math.min(80, newTotal));
    setTotalPins(clamped);
    setPinsList((prev) => {
      const updated: PinDraft[] = [];
      for (let i = 1; i <= clamped; i++) {
        const existing = prev.find((p) => p.pinNumber === i);
        if (existing) {
          updated.push(existing);
        } else {
          updated.push({
            pinNumber: i,
            netName: i === 1 || i === 2 ? 'VBUS_5V' : i % 5 === 0 ? 'GND' : `PIN_${i}`,
            diodeScaleMv: i % 5 === 0 ? 0 : 540,
            voltage: i === 1 || i === 2 ? '5.0V' : '1.8V',
            description: `Pino ${i} do conector FPC`,
          });
        }
      }
      return updated;
    });
  };

  // Presets Prontos Universais para qualquer aparelho
  const applyPreset = (presetType: 'a15' | 'battery' | 'typec' | 'display' | 'iphone' | 'motog') => {
    switch (presetType) {
      case 'battery':
        setTotalPins(6);
        setConnectorRef('J_BATT');
        setPinsList([
          { pinNumber: 1, netName: 'VBAT_POS', diodeScaleMv: 460, voltage: '4.2V', description: 'Positivo Bateria Principal +' },
          { pinNumber: 2, netName: 'VBAT_POS', diodeScaleMv: 460, voltage: '4.2V', description: 'Positivo Bateria Principal +' },
          { pinNumber: 3, netName: 'BATT_ID', diodeScaleMv: 620, voltage: '1.8V', description: 'Linha de identificação/comunicação bateria' },
          { pinNumber: 4, netName: 'BATT_THERM_NTC', diodeScaleMv: 590, voltage: '1.2V', description: 'Termistor NTC de temperatura da bateria' },
          { pinNumber: 5, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Negativo / Terra comum (GND)' },
          { pinNumber: 6, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Negativo / Terra comum (GND)' },
        ]);
        break;

      case 'typec':
        setTotalPins(24);
        setConnectorRef('J_TYPE_C');
        setPinsList([
          { pinNumber: 1, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra A1/B12' },
          { pinNumber: 2, netName: 'SSTXp1', diodeScaleMv: 680, voltage: '0V', description: 'Transmissão alta velocidade TX+' },
          { pinNumber: 3, netName: 'SSTXn1', diodeScaleMv: 680, voltage: '0V', description: 'Transmissão alta velocidade TX-' },
          { pinNumber: 4, netName: 'VBUS_5V', diodeScaleMv: 520, voltage: '5.0V ~ 20V', description: 'VBUS Alimentação Carregador' },
          { pinNumber: 5, netName: 'CC1', diodeScaleMv: 580, voltage: '1.8V', description: 'Detecção de orientação cabo CC1' },
          { pinNumber: 6, netName: 'USB_DP1', diodeScaleMv: 650, voltage: '3.3V', description: 'Dados D+ Positivo' },
          { pinNumber: 7, netName: 'USB_DN1', diodeScaleMv: 650, voltage: '3.3V', description: 'Dados D- Negativo' },
          { pinNumber: 8, netName: 'SBU1', diodeScaleMv: 720, voltage: '0V', description: 'Banda lateral áudio/controle SBU1' },
          { pinNumber: 9, netName: 'VBUS_5V', diodeScaleMv: 520, voltage: '5.0V ~ 20V', description: 'VBUS Alimentação Carregador' },
          { pinNumber: 10, netName: 'SSRXn2', diodeScaleMv: 680, voltage: '0V', description: 'Recepção alta velocidade RX-' },
          { pinNumber: 11, netName: 'SSRXp2', diodeScaleMv: 680, voltage: '0V', description: 'Recepção alta velocidade RX+' },
          { pinNumber: 12, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra A12/B1' },
          { pinNumber: 13, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra B1' },
          { pinNumber: 14, netName: 'SSTXp2', diodeScaleMv: 680, voltage: '0V', description: 'Transmissão alta velocidade TX2+' },
          { pinNumber: 15, netName: 'SSTXn2', diodeScaleMv: 680, voltage: '0V', description: 'Transmissão alta velocidade TX2-' },
          { pinNumber: 16, netName: 'VBUS_5V', diodeScaleMv: 520, voltage: '5.0V ~ 20V', description: 'VBUS Alimentação Carregador' },
          { pinNumber: 17, netName: 'CC2', diodeScaleMv: 580, voltage: '1.8V', description: 'Detecção de orientação cabo CC2' },
          { pinNumber: 18, netName: 'USB_DP2', diodeScaleMv: 650, voltage: '3.3V', description: 'Dados D+ Positivo' },
          { pinNumber: 19, netName: 'USB_DN2', diodeScaleMv: 650, voltage: '3.3V', description: 'Dados D- Negativo' },
          { pinNumber: 20, netName: 'SBU2', diodeScaleMv: 720, voltage: '0V', description: 'Banda lateral áudio/controle SBU2' },
          { pinNumber: 21, netName: 'VBUS_5V', diodeScaleMv: 520, voltage: '5.0V ~ 20V', description: 'VBUS Alimentação Carregador' },
          { pinNumber: 22, netName: 'SSRXn1', diodeScaleMv: 680, voltage: '0V', description: 'Recepção alta velocidade RX1-' },
          { pinNumber: 23, netName: 'SSRXp1', diodeScaleMv: 680, voltage: '0V', description: 'Recepção alta velocidade RX1+' },
          { pinNumber: 24, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra B12' },
        ]);
        break;

      case 'display':
        setTotalPins(40);
        setConnectorRef('FPC_DISP');
        setPinsList([
          { pinNumber: 1, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra de blindagem' },
          { pinNumber: 2, netName: 'MIPI_CLK_P', diodeScaleMv: 490, voltage: '1.2V', description: 'Clock diferencial vídeo MIPI+' },
          { pinNumber: 3, netName: 'MIPI_CLK_N', diodeScaleMv: 490, voltage: '1.2V', description: 'Clock diferencial vídeo MIPI-' },
          { pinNumber: 4, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 5, netName: 'MIPI_D0_P', diodeScaleMv: 490, voltage: '1.2V', description: 'Dados vídeo Lane 0+' },
          { pinNumber: 6, netName: 'MIPI_D0_N', diodeScaleMv: 490, voltage: '1.2V', description: 'Dados vídeo Lane 0-' },
          { pinNumber: 7, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 8, netName: 'MIPI_D1_P', diodeScaleMv: 490, voltage: '1.2V', description: 'Dados vídeo Lane 1+' },
          { pinNumber: 9, netName: 'MIPI_D1_N', diodeScaleMv: 490, voltage: '1.2V', description: 'Dados vídeo Lane 1-' },
          { pinNumber: 10, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 11, netName: 'MIPI_D2_P', diodeScaleMv: 490, voltage: '1.2V', description: 'Dados vídeo Lane 2+' },
          { pinNumber: 12, netName: 'MIPI_D2_N', diodeScaleMv: 490, voltage: '1.2V', description: 'Dados vídeo Lane 2-' },
          { pinNumber: 13, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 14, netName: 'MIPI_D3_P', diodeScaleMv: 490, voltage: '1.2V', description: 'Dados vídeo Lane 3+' },
          { pinNumber: 15, netName: 'MIPI_D3_N', diodeScaleMv: 490, voltage: '1.2V', description: 'Dados vídeo Lane 3-' },
          { pinNumber: 16, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 17, netName: 'DISP_RESET_N', diodeScaleMv: 640, voltage: '1.8V', description: 'Reset do controlador da tela' },
          { pinNumber: 18, netName: 'DISP_TE_VSYNC', diodeScaleMv: 620, voltage: '1.8V', description: 'Sincronismo vertical Tearing Effect' },
          { pinNumber: 19, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 20, netName: 'VREG_1V8_IO', diodeScaleMv: 530, voltage: '1.8V', description: 'Alimentação lógica digital 1.8V' },
          { pinNumber: 21, netName: 'VREG_3V3_AVDD', diodeScaleMv: 510, voltage: '3.3V', description: 'Alimentação analógica da tela' },
          { pinNumber: 22, netName: 'VREG_ELVDD_4V6', diodeScaleMv: 480, voltage: '4.6V', description: 'Tensão positiva painel OLED (+)' },
          { pinNumber: 23, netName: 'VREG_ELVSS_NEG', diodeScaleMv: 480, voltage: '-3.0V', description: 'Tensão negativa painel OLED (-)' },
          { pinNumber: 24, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 25, netName: 'TOUCH_SDA', diodeScaleMv: 610, voltage: '1.8V', description: 'Comunicação I2C Touch Dados' },
          { pinNumber: 26, netName: 'TOUCH_SCL', diodeScaleMv: 610, voltage: '1.8V', description: 'Comunicação I2C Touch Clock' },
          { pinNumber: 27, netName: 'TOUCH_INT_N', diodeScaleMv: 630, voltage: '1.8V', description: 'Interrupção de toque Touch' },
          { pinNumber: 28, netName: 'TOUCH_RESET_N', diodeScaleMv: 640, voltage: '1.8V', description: 'Reset do Touch Screen' },
          { pinNumber: 29, netName: 'VREG_TOUCH_3V3', diodeScaleMv: 520, voltage: '3.3V', description: 'Alimentação do CI de Toque' },
          { pinNumber: 30, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 31, netName: 'LED_ANODE_POS', diodeScaleMv: 580, voltage: '18V ~ 24V', description: 'Backlight LED+ (positivo iluminação)' },
          { pinNumber: 32, netName: 'LED_ANODE_POS', diodeScaleMv: 580, voltage: '18V ~ 24V', description: 'Backlight LED+ (positivo iluminação)' },
          { pinNumber: 33, netName: 'LED_CATHODE_1', diodeScaleMv: 620, voltage: '0V ~ 3V', description: 'Retorno Backlight LED K1' },
          { pinNumber: 34, netName: 'LED_CATHODE_2', diodeScaleMv: 620, voltage: '0V ~ 3V', description: 'Retorno Backlight LED K2' },
          { pinNumber: 35, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 36, netName: 'DISP_ID0', diodeScaleMv: 680, voltage: '1.8V', description: 'Identificação fabricante LCD' },
          { pinNumber: 37, netName: 'DISP_ID1', diodeScaleMv: 680, voltage: '1.8V', description: 'Identificação fabricante LCD' },
          { pinNumber: 38, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 39, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Carcaça blindagem' },
          { pinNumber: 40, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Carcaça blindagem' },
        ]);
        break;

      case 'iphone':
        setTotalPins(28);
        setConnectorRef('J_IPHONE_DOCK');
        setPinsList([
          { pinNumber: 1, netName: 'PP_VBUS_E75', diodeScaleMv: 510, voltage: '5.0V', description: 'Alimentação entrada de carga' },
          { pinNumber: 2, netName: 'PP_VBUS_E75', diodeScaleMv: 510, voltage: '5.0V', description: 'Alimentação entrada de carga' },
          { pinNumber: 3, netName: 'TRISTAR_CC1', diodeScaleMv: 590, voltage: '1.8V', description: 'Linha Tristar / Hydra de detecção' },
          { pinNumber: 4, netName: 'TRISTAR_CC2', diodeScaleMv: 590, voltage: '1.8V', description: 'Linha Tristar / Hydra de detecção' },
          { pinNumber: 5, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 6, netName: 'USB_HS_DP', diodeScaleMv: 670, voltage: '3.3V', description: 'USB High Speed Data+' },
          { pinNumber: 7, netName: 'USB_HS_DN', diodeScaleMv: 670, voltage: '3.3V', description: 'USB High Speed Data-' },
          { pinNumber: 8, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 9, netName: 'MIC1_TO_CODEC_P', diodeScaleMv: 630, voltage: '1.8V', description: 'Microfone inferior canal +' },
          { pinNumber: 10, netName: 'MIC1_TO_CODEC_N', diodeScaleMv: 630, voltage: '1.8V', description: 'Microfone inferior canal -' },
          { pinNumber: 11, netName: 'PP_MIC_BIAS', diodeScaleMv: 580, voltage: '2.4V', description: 'Tensão Bias microfone' },
          { pinNumber: 12, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 13, netName: 'SPKR_AMP_OUT_P', diodeScaleMv: 490, voltage: '4.2V', description: 'Alto-falante inferior +' },
          { pinNumber: 14, netName: 'SPKR_AMP_OUT_N', diodeScaleMv: 490, voltage: '4.2V', description: 'Alto-falante inferior -' },
          { pinNumber: 15, netName: 'TAPTIC_DRV_P', diodeScaleMv: 520, voltage: '3.7V', description: 'Motor Taptic Engine +' },
          { pinNumber: 16, netName: 'TAPTIC_DRV_N', diodeScaleMv: 520, voltage: '0V', description: 'Motor Taptic Engine -' },
          { pinNumber: 17, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 18, netName: 'PP_BATT_VCC', diodeScaleMv: 440, voltage: '4.2V', description: 'Linha positiva da bateria' },
          { pinNumber: 19, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 20, netName: 'ANT_FEED_CELL', diodeScaleMv: 740, voltage: '0V', description: 'Antena celular inferior' },
          { pinNumber: 21, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 22, netName: 'BARO_I2C_SDA', diodeScaleMv: 610, voltage: '1.8V', description: 'Sensor barômetro SDA' },
          { pinNumber: 23, netName: 'BARO_I2C_SCL', diodeScaleMv: 610, voltage: '1.8V', description: 'Sensor barômetro SCL' },
          { pinNumber: 24, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 25, netName: 'PP1V8_S2', diodeScaleMv: 540, voltage: '1.8V', description: 'Alimentação Always-On' },
          { pinNumber: 26, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 27, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Carcaça blindagem' },
          { pinNumber: 28, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Carcaça blindagem' },
        ]);
        break;

      case 'motog':
        setTotalPins(30);
        setConnectorRef('FPC_MOTO_SUB');
        setPinsList([
          { pinNumber: 1, netName: 'VBUS_5V', diodeScaleMv: 520, voltage: '5.0V', description: 'VBUS Entrada Carga' },
          { pinNumber: 2, netName: 'VBUS_5V', diodeScaleMv: 520, voltage: '5.0V', description: 'VBUS Entrada Carga' },
          { pinNumber: 3, netName: 'CC1_DET', diodeScaleMv: 590, voltage: '1.8V', description: 'Type-C CC1' },
          { pinNumber: 4, netName: 'CC2_DET', diodeScaleMv: 590, voltage: '1.8V', description: 'Type-C CC2' },
          { pinNumber: 5, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 6, netName: 'USB_HS_DP', diodeScaleMv: 640, voltage: '3.3V', description: 'Dados D+' },
          { pinNumber: 7, netName: 'USB_HS_DM', diodeScaleMv: 640, voltage: '3.3V', description: 'Dados D-' },
          { pinNumber: 8, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 9, netName: 'MIC_IN_P', diodeScaleMv: 620, voltage: '1.8V', description: 'Microfone de ligação' },
          { pinNumber: 10, netName: 'MIC_BIAS', diodeScaleMv: 590, voltage: '2.0V', description: 'Tensão do microfone' },
          { pinNumber: 11, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 12, netName: 'SPK_OUT_P', diodeScaleMv: 480, voltage: '4.2V', description: 'Campainha +' },
          { pinNumber: 13, netName: 'SPK_OUT_N', diodeScaleMv: 480, voltage: '4.2V', description: 'Campainha -' },
          { pinNumber: 14, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 15, netName: 'SUB_THERM_DET', diodeScaleMv: 580, voltage: '1.2V', description: 'Termistor NTC de temperatura' },
          { pinNumber: 16, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 17, netName: 'VBAT_SENSE', diodeScaleMv: 460, voltage: '4.2V', description: 'Monitoramento bateria' },
          { pinNumber: 18, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 19, netName: 'VREG_L18_SUB', diodeScaleMv: 530, voltage: '1.8V', description: 'Alimentação lógica subplaca' },
          { pinNumber: 20, netName: 'VIB_MOTOR_P', diodeScaleMv: 500, voltage: '3.3V', description: 'Vibracall +' },
          { pinNumber: 21, netName: 'VIB_MOTOR_N', diodeScaleMv: 500, voltage: '0V', description: 'Vibracall -' },
          { pinNumber: 22, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 23, netName: 'ANT_SW_RF', diodeScaleMv: 720, voltage: '0V', description: 'Linha RF Antena' },
          { pinNumber: 24, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 25, netName: 'JACK_DET_L', diodeScaleMv: 650, voltage: '1.8V', description: 'Fone de ouvido' },
          { pinNumber: 26, netName: 'JACK_DET_R', diodeScaleMv: 650, voltage: '1.8V', description: 'Fone de ouvido' },
          { pinNumber: 27, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 28, netName: 'VBUS_5V', diodeScaleMv: 520, voltage: '5.0V', description: 'Pino reforçado VBUS' },
          { pinNumber: 29, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra' },
          { pinNumber: 30, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Carcaça' },
        ]);
        break;

      default:
        // Galaxy A15 / Linha A Samsung
        setTotalPins(34);
        setConnectorRef('FPC_SUB_A15');
        setPinsList([
          { pinNumber: 1, netName: 'VBUS_5V', diodeScaleMv: 520, voltage: '5.0V', description: 'Entrada USB 5V VBUS Alimentação' },
          { pinNumber: 2, netName: 'VBUS_5V', diodeScaleMv: 520, voltage: '5.0V', description: 'Entrada USB 5V VBUS Alimentação' },
          { pinNumber: 3, netName: 'USB_CC1', diodeScaleMv: 580, voltage: '1.8V', description: 'Linha de detecção cabo Type-C CC1' },
          { pinNumber: 4, netName: 'USB_CC2', diodeScaleMv: 580, voltage: '1.8V', description: 'Linha de detecção cabo Type-C CC2' },
          { pinNumber: 5, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra / Massa comum (GND)' },
          { pinNumber: 6, netName: 'USB_DP', diodeScaleMv: 650, voltage: '3.3V', description: 'Dados USB D+ (Positivo)' },
          { pinNumber: 7, netName: 'USB_DM', diodeScaleMv: 650, voltage: '3.3V', description: 'Dados USB D- (Negativo)' },
          { pinNumber: 8, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra / Massa comum (GND)' },
          { pinNumber: 9, netName: 'MIC_MAIN_POS', diodeScaleMv: 610, voltage: '1.8V', description: 'Microfone principal de chamada Mic+' },
          { pinNumber: 10, netName: 'MIC_BIAS_2V', diodeScaleMv: 590, voltage: '2.0V', description: 'Alimentação Bias do microfone' },
          { pinNumber: 11, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra / Massa comum (GND)' },
          { pinNumber: 12, netName: 'SPK_OUT_P', diodeScaleMv: 490, voltage: '4.2V', description: 'Campainha / Viva-voz Speaker+' },
          { pinNumber: 13, netName: 'SPK_OUT_N', diodeScaleMv: 490, voltage: '4.2V', description: 'Campainha / Viva-voz Speaker-' },
          { pinNumber: 14, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra / Massa comum (GND)' },
          { pinNumber: 15, netName: 'TH_SUB_DET', diodeScaleMv: 590, voltage: '1.2V', description: 'Sensor térmico Termistor Subplaca' },
          { pinNumber: 16, netName: 'ANT_RX_DET', diodeScaleMv: 720, voltage: '0V', description: 'Linha coaxial RF Antena' },
          { pinNumber: 17, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra / Massa comum (GND)' },
          { pinNumber: 18, netName: 'VBAT_SENSE', diodeScaleMv: 460, voltage: '4.2V', description: 'Monitoramento da bateria' },
          { pinNumber: 19, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra / Massa comum (GND)' },
          { pinNumber: 20, netName: 'OVP_OUT_5V', diodeScaleMv: 520, voltage: '5.0V', description: 'Saída do CI OVP para a placa principal' },
          { pinNumber: 21, netName: 'OVP_OUT_5V', diodeScaleMv: 520, voltage: '5.0V', description: 'Saída do CI OVP para a placa principal' },
          { pinNumber: 22, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra / Massa comum (GND)' },
          { pinNumber: 23, netName: 'EAR_JACK_L', diodeScaleMv: 640, voltage: '1.8V', description: 'Canal esquerdo fone de ouvido' },
          { pinNumber: 24, netName: 'EAR_JACK_R', diodeScaleMv: 640, voltage: '1.8V', description: 'Canal direito fone de ouvido' },
          { pinNumber: 25, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra / Massa comum (GND)' },
          { pinNumber: 26, netName: 'MOTOR_VIB_P', diodeScaleMv: 510, voltage: '3.3V', description: 'Motor Vibracall+' },
          { pinNumber: 27, netName: 'MOTOR_VIB_N', diodeScaleMv: 510, voltage: '0V', description: 'Motor Vibracall-' },
          { pinNumber: 28, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra / Massa comum (GND)' },
          { pinNumber: 29, netName: 'ID_BOARD_SUB', diodeScaleMv: 680, voltage: '1.8V', description: 'Detecção de versão da subplaca' },
          { pinNumber: 30, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Terra / Massa comum (GND)' },
          { pinNumber: 31, netName: 'VBUS_5V', diodeScaleMv: 520, voltage: '5.0V', description: 'Pino reforçado VBUS Carga rápida' },
          { pinNumber: 32, netName: 'VBUS_5V', diodeScaleMv: 520, voltage: '5.0V', description: 'Pino reforçado VBUS Carga rápida' },
          { pinNumber: 33, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Carcaça / Terra blindado' },
          { pinNumber: 34, netName: 'GND', diodeScaleMv: 0, voltage: '0V', description: 'Carcaça / Terra blindado' },
        ]);
        break;
    }
  };

  // Gerar e Inserir Marcadores na Placa
  const handleGenerate = () => {
    const generatedMarkers: BoardComponentMarker[] = [];
    const pinsPerRow = layoutMode === 'dual_row' ? Math.ceil(totalPins / 2) : totalPins;

    pinsList.forEach((pin, index) => {
      let x = centerX;
      let y = centerY;

      if (layoutMode === 'dual_row') {
        const isTopRow = index < pinsPerRow;
        const colIndex = isTopRow ? index : (index - pinsPerRow);
        const startX = centerX - ((pinsPerRow - 1) * pinSpacingX) / 2;

        x = startX + colIndex * pinSpacingX;
        y = isTopRow ? centerY - rowSpacingY / 2 : centerY + rowSpacingY / 2;
      } else {
        const startX = centerX - ((totalPins - 1) * pinSpacingX) / 2;
        x = startX + index * pinSpacingX;
        y = centerY;
      }

      generatedMarkers.push({
        id: `marker-fpc-${Date.now()}-${pin.pinNumber}`,
        kind: 'conector',
        packageCode: 'PIN_FPC',
        reference: `${connectorRef}_P${pin.pinNumber}`,
        name: `Pino ${pin.pinNumber} (${pin.netName})`,
        side: activeSide,
        xPercent: Math.max(1, Math.min(99, Math.round(x * 10) / 10)),
        yPercent: Math.max(1, Math.min(99, Math.round(y * 10) / 10)),
        rotation: 0,
        widthPx: 18,
        heightPx: 26,
        functionDesc: pin.description,
        diodeScaleMv: pin.diodeScaleMv,
        voltage: pin.voltage,
        netName: pin.netName,
        faultSymptom: pin.netName.includes('VBUS') 
          ? 'Não carrega / Mostra raio mas não sobe carga.'
          : pin.netName.includes('CC')
          ? 'Não reconhece carregador ou só carrega de um lado do cabo Type-C.'
          : 'Falha no circuito correspondente.',
        repairTip: pin.diodeScaleMv === 0 
          ? 'Pino GND normal deve ter 0 ohms para a carcaça.'
          : 'Se der OL, verificar se a trilha ou o resistor/bobina em série rompeu.',
      });
    });

    onGeneratePins(generatedMarkers);
    onClose();
  };

  const updatePinField = (pinNumber: number, field: keyof PinDraft, value: any) => {
    setPinsList((prev) =>
      prev.map((p) => (p.pinNumber === pinNumber ? { ...p, [field]: value } : p))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md font-mono animate-in fade-in select-none">
      <div className="bg-slate-950 border border-slate-700 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/40">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                Gerador de Conector FPC Virtual (Em Grade / Pinos Separados)
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full">
                  Face {activeSide}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Gera todos os pinos individuais perfeitamente alinhados na foto da placa com valores de diodo e voltagem.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Seletor de Presets Universais */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-purple-500/40 px-2 py-1 rounded-xl shadow-inner">
              <Smartphone className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="text-[11px] font-bold text-slate-300 shrink-0">Modelos Prontos:</span>
              <select
                onChange={(e) => applyPreset(e.target.value as any)}
                defaultValue="a15"
                className="bg-slate-900 text-purple-300 font-bold text-xs rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="a15">Samsung Galaxy A15 Subplaca (34 Pinos)</option>
                <option value="battery">Bateria Universal 6 Pinos (VBAT / ID / NTC)</option>
                <option value="typec">Conector USB Type-C 24 Pinos Completo</option>
                <option value="display">Tela Display OLED + Touch (40 Pinos)</option>
                <option value="iphone">Apple iPhone Dock / Lightning (28 Pinos)</option>
                <option value="motog">Motorola Moto G Subplaca (30 Pinos)</option>
              </select>
            </div>

            <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Configurações de Geometria do Conector */}
        <div className="p-3 bg-slate-900/60 border-b border-slate-800 grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1 font-bold">Referência:</label>
            <input
              type="text"
              value={connectorRef}
              onChange={(e) => setConnectorRef(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-cyan-300 font-bold"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-bold">Qtd. de Pinos:</label>
            <input
              type="number"
              min={4}
              max={80}
              value={totalPins}
              onChange={(e) => handleTotalPinsChange(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-bold"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-bold">Disposição:</label>
            <select
              value={layoutMode}
              onChange={(e) => setLayoutMode(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-amber-300 font-bold"
            >
              <option value="dual_row">2 Fileiras (Superior / Inferior)</option>
              <option value="single_row">1 Fileira Linear</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-bold">Centro X (%):</label>
            <input
              type="number"
              min={5}
              max={95}
              value={centerX}
              onChange={(e) => setCenterX(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-bold">Centro Y (%):</label>
            <input
              type="number"
              min={5}
              max={95}
              value={centerY}
              onChange={(e) => setCenterY(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-bold">Espaçamento X:</label>
            <input
              type="number"
              step="0.2"
              value={pinSpacingX}
              onChange={(e) => setPinSpacingX(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200"
            />
          </div>

          {layoutMode === 'dual_row' && (
            <div>
              <label className="text-slate-400 block mb-1 font-bold">Distância Fileiras Y:</label>
              <input
                type="number"
                step="0.5"
                value={rowSpacingY}
                onChange={(e) => setRowSpacingY(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200"
              />
            </div>
          )}
        </div>

        {/* Tabela Interativa de Pinos (Planilha Rápida) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
            <span>Preencha os valores de cada pino abaixo (você também pode editar na bancada depois):</span>
            <span className="text-cyan-400 font-bold">{pinsList.length} pinos configurados</span>
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-300 border-b border-slate-800">
                <tr>
                  <th className="p-2.5 w-16 text-center">Pino</th>
                  <th className="p-2.5">Nome da Linha / Malha (Net)</th>
                  <th className="p-2.5 w-32">Diodo (mV)</th>
                  <th className="p-2.5 w-28">Tensão (V)</th>
                  <th className="p-2.5">Descrição / Função</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 bg-slate-950">
                {pinsList.map((pin) => (
                  <tr key={pin.pinNumber} className="hover:bg-slate-900/50 transition">
                    {/* Número do Pino com mini pad dourado */}
                    <td className="p-2 text-center">
                      <div className="w-6 h-7 rounded-sm bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-black font-black text-[10px] flex items-center justify-center shadow mx-auto">
                        {pin.pinNumber}
                      </div>
                    </td>

                    {/* Malha (Net) */}
                    <td className="p-2">
                      <input
                        type="text"
                        value={pin.netName}
                        onChange={(e) => updatePinField(pin.pinNumber, 'netName', e.target.value)}
                        placeholder="Ex: VBUS_5V"
                        className={`w-full bg-slate-900 border rounded-lg px-2 py-1 text-xs font-bold font-mono ${
                          pin.netName.includes('VBUS') ? 'text-amber-300 border-amber-600/50' :
                          pin.netName.includes('GND') ? 'text-slate-400 border-slate-700' :
                          pin.netName.includes('CC') ? 'text-purple-300 border-purple-600/50' :
                          pin.netName.includes('DP') || pin.netName.includes('DM') ? 'text-blue-300 border-blue-600/50' :
                          'text-cyan-300 border-slate-700'
                        }`}
                      />
                    </td>

                    {/* Condução Reversa Diodo mV */}
                    <td className="p-2">
                      <input
                        type="number"
                        value={pin.diodeScaleMv}
                        onChange={(e) => updatePinField(pin.pinNumber, 'diodeScaleMv', Number(e.target.value))}
                        className={`w-full bg-slate-900 border rounded-lg px-2 py-1 text-xs font-mono font-bold ${
                          pin.diodeScaleMv === 0 ? 'text-slate-500 border-slate-700' : 'text-rose-400 border-rose-800/60'
                        }`}
                      />
                    </td>

                    {/* Voltagem */}
                    <td className="p-2">
                      <input
                        type="text"
                        value={pin.voltage}
                        onChange={(e) => updatePinField(pin.pinNumber, 'voltage', e.target.value)}
                        placeholder="Ex: 5.0V"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-cyan-300 text-xs font-mono"
                      />
                    </td>

                    {/* Descrição */}
                    <td className="p-2">
                      <input
                        type="text"
                        value={pin.description}
                        onChange={(e) => updatePinField(pin.pinNumber, 'description', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 text-[11px]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer com Ações */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            💡 Dica: Na bancada, você poderá arrastar cada pino individualmente com o mouse ou mover o grupo.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-bold transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleGenerate}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-xl shadow-cyan-950 flex items-center gap-1.5 transition"
            >
              <Check className="w-4 h-4" />
              <span>Gerar {pinsList.length} Pinos na Placa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
