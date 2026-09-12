import type { HardwareSolutionJumper } from '../types/jumpers';

export const initialJumpers: HardwareSolutionJumper[] = [
  {
    id: 'jmp-s20fe-vbus',
    boardId: 'samsung-s20-fe-main',
    title: 'Recuperação de Trilha VBUS 5V Rompida (Sem Carga / Não Reconhece Cabo)',
    category: 'carga',
    wireSpec: '0.02mm Isolado',
    symptom: 'Aparelho não carrega e conector USB-C não envia 5V para a placa mãe após queda ou umidade.',
    side: 'A',
    startPointDesc: 'Pino 1 do conector FPC da Subplaca (Ponto de solda da ilha)',
    endPointDesc: 'Lado positivo do Capacitor C1204 antes do CI OVP',
    points: [
      { xPercent: 22, yPercent: 82 },
      { xPercent: 25, yPercent: 78 },
      { xPercent: 28, yPercent: 74 }
    ],
    instructions: [
      'Raspe suavemente a máscara de solda da trilha rompida com lâmina de bisturi nº 11.',
      'Aplique fluxo pastoso e estanhe o pino 1 do FPC.',
      'Solde o fio de cobre esmaltado 0.02mm no pino 1.',
      'Conduza o fio contornando as blindagens até o lado positivo do capacitor C1204.',
      'Solde a outra extremidade no capacitor C1204 e aplique máscara UV verde/azul para curar com luz UV por 30 segundos.'
    ],
    warningTip: 'Não deixe o fio encostar na carcaça de aterramento GND para evitar curto de 5V.'
  },
  {
    id: 'jmp-s20fe-pwr',
    boardId: 'samsung-s20-fe-main',
    title: 'Reconstrução Linha Botão Power PWR_ON Rompida',
    category: 'power',
    wireSpec: '0.01mm Isolado',
    symptom: 'Aparelho só liga se colocar no carregador, mas não responde ao clique do botão Power lateral.',
    side: 'A',
    startPointDesc: 'Test Point TP_PWR_KEY no flex lateral',
    endPointDesc: 'Resistor de pull-up R2105 no circuito PMIC',
    points: [
      { xPercent: 88, yPercent: 32 },
      { xPercent: 70, yPercent: 34 },
      { xPercent: 58, yPercent: 36 }
    ],
    instructions: [
      'Meça a tensão no TP_PWR_KEY (deve ter 1.8V quando alimentado pela bateria).',
      'Se estiver 0V, a linha interna na camada intermediária rompeu.',
      'Puxe um jumper ultrafino de 0.01mm do pino do resistor R2105 até a ilha do botão.',
      'Fixe com máscara UV.'
    ],
    warningTip: 'Cuidado com a temperatura do ferro de solda (máximo 320°C) para não danificar o flex sensível.'
  },
  {
    id: 'jmp-s20fe-mic',
    boardId: 'samsung-s20-fe-main',
    title: 'Recuperação de Áudio do Microfone Principal de Ligação',
    category: 'audio',
    wireSpec: '0.02mm Isolado',
    symptom: 'Durante chamadas de áudio ou gravação de voz o som fica mudo ou com chiado intenso.',
    side: 'A',
    startPointDesc: 'Pino 10 do FPC Subplaca (MIC_IN_P)',
    endPointDesc: 'Bobina de filtro de áudio L104',
    points: [
      { xPercent: 22, yPercent: 84 },
      { xPercent: 26, yPercent: 86 },
      { xPercent: 30, yPercent: 88 }
    ],
    instructions: [
      'Verifique se a bobina L104 está com solda fria ou quebrada.',
      'Se a ilha estiver arrancada, execute o jumper direto do pino 10 do FPC para o capacitor de acoplamento C108.',
      'Isole com fita kapton ou máscara UV.'
    ]
  }
];
