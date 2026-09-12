import type { NewsAnnouncement } from '../types/news';

export const DEFAULT_NEWS: NewsAnnouncement[] = [
  {
    id: 'news-1',
    title: '🔥 Subplaca do Samsung Galaxy S20 FE Disponível!',
    content: 'Já está disponível na pasta Samsung o mapa completo da subplaca de carga do Galaxy S20 FE com conector Type-C, CI OVP, bobinas e o termistor TH3000 de 100k com medição em escala de diodo (610 mV).',
    badge: 'esquema_novo',
    date: '11/09/2026',
    author: 'Administrador SafePlaca',
    linkModel: 'samsung-s20fe-subcarga',
  },
  {
    id: 'news-2',
    title: '⚡ SafePlaca 3.0: Pastas de Aparelhos e Diagnóstico de Defeitos',
    content: 'O sistema agora é 100% organizado por pastas de marcas e aparelhos. Você entra na pasta do modelo e acessa os esquemas específicos, além do novo guia passo a passo de como reparar defeitos comuns de bancada.',
    badge: 'novidade',
    date: '11/09/2026',
    author: 'Equipe Técnica',
  },
  {
    id: 'news-3',
    title: '💡 Dica de Ouro: Triângulo Amarelo no S20 FE',
    content: 'Mais de 80% das falhas de carga pausada por temperatura no S20 FE são causadas por solda trincada no conector FPC ou quebra do termistor TH3000. Confira o procedimento de teste detalhado na aba "Defeitos".',
    badge: 'dica_reparo',
    date: '10/09/2026',
    author: 'Instrutor de Bancada',
  },
];
