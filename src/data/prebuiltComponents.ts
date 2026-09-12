import type { ComponentKind } from '../types/board';

export interface PrebuiltComponentTemplate {
  id: string;
  kind: ComponentKind;
  category: string;
  referencePrefix: string; // Ex: 'TH', 'L', 'D', 'U', 'J'
  name: string;
  functionDesc: string;
  diodeScaleMv: number;
  voltage: string;
  netName?: string;
  faultSymptom: string;
  repairTip: string;
  badge: string;
}

export const PREBUILT_COMPONENTS_LIBRARY: PrebuiltComponentTemplate[] = [
  // 1. Termistores NTC
  {
    id: 'tpl-th-100k-cpu',
    kind: 'termistor',
    category: 'Termistores & Sensores',
    referencePrefix: 'TH',
    name: 'Termistor NTC 100kΩ Sensor CPU / AP',
    functionDesc: 'Divisor de tensão resistivo para monitoramento térmico do processador principal.',
    diodeScaleMv: 590,
    voltage: '0.9V ~ 1.2V ADC',
    netName: 'TH_AP_DET',
    faultSymptom: 'Alerta de "Temperatura muito alta. O aparelho será desligado" ou travamento na inicialização.',
    repairTip: 'Substitua por um termistor NTC SMD 0201/0402 de 100kΩ (tirado de sucata próximo à CPU).',
    badge: 'Mais Comum'
  },
  {
    id: 'tpl-th-47k-sub',
    kind: 'termistor',
    category: 'Termistores & Sensores',
    referencePrefix: 'TH',
    name: 'Termistor NTC 47kΩ Subplaca Carga',
    functionDesc: 'Sensor de temperatura da porta USB Type-C na placa inferior.',
    diodeScaleMv: 620,
    voltage: '1.8V Pull-up',
    netName: 'TH_USB_DET',
    faultSymptom: 'Aparelho mostra triângulo amarelo de temperatura e não aceita carga.',
    repairTip: 'Verifique se houve oxidação na subplaca ou troque o termistor de 47kΩ.',
    badge: 'Defeito Carga'
  },

  // 2. Bobinas de Potência
  {
    id: 'tpl-l-vph-buck',
    kind: 'bobina',
    category: 'Bobinas & Indutores',
    referencePrefix: 'L',
    name: 'Bobina BUCK de Chaveamento VPH / VBAT 2.2µH',
    functionDesc: 'Indutor de chaveamento do conversor DC-DC de alimentação primária do sistema.',
    diodeScaleMv: 380,
    voltage: '3.7V ~ 4.2V',
    netName: 'VPH_PWR',
    faultSymptom: 'Aparelho totalmente inerte, não liga na fonte e trava em 0.05A a 0.08A.',
    repairTip: 'Teste continuidade dos dois lados (deve dar 0 ohms entre terminais). Se trincada, substitua.',
    badge: 'Crítica'
  },
  {
    id: 'tpl-l-cpu-core',
    kind: 'bobina',
    category: 'Bobinas & Indutores',
    referencePrefix: 'L',
    name: 'Bobina BUCK Alimentação CPU Núcleo 0.47µH',
    functionDesc: 'Linha de alta corrente e baixa impedância para núcleos da CPU Snapdragon / Exynos.',
    diodeScaleMv: 35,
    voltage: '0.85V',
    netName: 'VDD_CPU_CORE',
    faultSymptom: 'Aparelho esquenta na região da CPU e desliga após alguns segundos.',
    repairTip: 'Atenção: Queda de 30mV a 70mV na escala de diodo é NORMAL devido à baixa impedância.',
    badge: 'Baixa Impedância'
  },

  // 3. Diodos & Proteções
  {
    id: 'tpl-d-tvs-vbus',
    kind: 'diodo',
    category: 'Diodos & Proteção',
    referencePrefix: 'D',
    name: 'Diodo TVS Proteção ESD Linha VBUS 5V',
    functionDesc: 'Diodo de grampeamento contra surtos de tensão e descargas eletrostáticas do carregador.',
    diodeScaleMv: 520,
    voltage: '5.0V / 9.0V Max',
    netName: 'VBUS_5V_IN',
    faultSymptom: 'Linha VBUS em curto total (000 mV) aterrando os 5V do carregador.',
    repairTip: 'Remova o diodo para testar se o curto na linha de 5V some. Se sumir, reponha um novo diodo TVS.',
    badge: 'Curto Comum'
  },
  {
    id: 'tpl-d-schottky-bl',
    kind: 'diodo',
    category: 'Diodos & Proteção',
    referencePrefix: 'D',
    name: 'Diodo Schottky Elevador de Backlight 40V',
    functionDesc: 'Retificação de alta velocidade do conversor boost de iluminação da tela LCD.',
    diodeScaleMv: 215,
    voltage: '22V ~ 35V Elevado',
    netName: 'LED_BL_ANODE',
    faultSymptom: 'Tela escura sem luz de fundo (imagem visível apenas com lanterna contra a tela).',
    repairTip: 'Meça a condução do anodo para o catodo (deve dar ~200mV e invertido OL).',
    badge: 'Backlight'
  },

  // 4. Circuitos Integrados (CIs)
  {
    id: 'tpl-u-ifpmic-sm5713',
    kind: 'ci',
    category: 'Circuitos Integrados (CIs)',
    referencePrefix: 'U',
    name: 'IF-PMIC Gerenciador de Carga SM5713',
    functionDesc: 'Gerenciador secundário de carga USB-C, detecção de cabo e carregamento wireless.',
    diodeScaleMv: 480,
    voltage: '5.0V / 4.2V',
    netName: 'VBUS_TO_VBAT',
    faultSymptom: 'Não sobe carga, não reconhece cabo ou fica em consumo de 0.45A sem sair de 0%.',
    repairTip: 'Trocar o CI SM5713 por um novo com esferas 0.25mm ou fazer reballing.',
    badge: 'Samsung Clássico'
  },
  {
    id: 'tpl-u-pm7150-pmic',
    kind: 'ci',
    category: 'Circuitos Integrados (CIs)',
    referencePrefix: 'U',
    name: 'PMIC Principal Qualcomm PM7150',
    functionDesc: 'Gerenciador mestre de energização com múltiplos reguladores LDO e BUCK.',
    diodeScaleMv: 450,
    voltage: 'Multi-Rail (0.8V a 3.3V)',
    faultSymptom: 'Aparelho não liga, consumo oscila de 0.08A a 0.22A e cai para zero na bancada.',
    repairTip: 'Verifique se há curto em algum capacitor ao redor antes de sacar o CI com 360°C.',
    badge: 'PMIC Mestre'
  },
  {
    id: 'tpl-u-ovp-protection',
    kind: 'ci',
    category: 'Circuitos Integrados (CIs)',
    referencePrefix: 'U',
    name: 'CI OVP (Over-Voltage Protection Switch)',
    functionDesc: 'Chave MOSFET inteligente de corte se o carregador ultrapassar 5.8V ou 10V.',
    diodeScaleMv: 510,
    voltage: '5.0V',
    netName: 'VBUS_5V',
    faultSymptom: 'Chegam 5V no conector mas nada chega ao CI de carga (0V após o OVP).',
    repairTip: 'Pode-se fazer um jumper de teste unindo os pinos de entrada e saída.',
    badge: 'Bypass Fácil'
  },

  // 5. Conectores FPC
  {
    id: 'tpl-j-fpc-carga-40p',
    kind: 'conector',
    category: 'Conectores FPC',
    referencePrefix: 'FPC',
    name: 'Conector FPC Subplaca de Carga (40 Pinos)',
    functionDesc: 'Interligação entre subplaca de conector USB, microfone, antena e placa-mãe.',
    diodeScaleMv: 512,
    voltage: '5.0V / 1.8V',
    faultSymptom: 'Oxidação, pinos amassados causando falta de carregamento ou microfone mudo.',
    repairTip: 'Limpar com álcool isopropílico ou trocar conector com fluxo e ar quente a 300°C.',
    badge: 'FPC Carga'
  },
  {
    id: 'tpl-j-fpc-display-30p',
    kind: 'conector',
    category: 'Conectores FPC',
    referencePrefix: 'FPC',
    name: 'Conector FPC Tela OLED / Touch (30 Pinos)',
    functionDesc: 'Conexão dos pares diferenciais MIPI de imagem, sincronismo e barramento de touch.',
    diodeScaleMv: 380,
    voltage: '4.6V / -4.4V / 1.8V',
    faultSymptom: 'Sem imagem, touch falhando ou tela piscando em verde.',
    repairTip: 'Verifique alinhamento das travas plásticas e condução reversa dos pares MIPI.',
    badge: 'FPC Tela'
  }
];
