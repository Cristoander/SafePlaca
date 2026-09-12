import type { PhysicalProduct, StoreSettings } from '../types/store';

export const initialStoreSettings: StoreSettings = {
  whatsappNumber: '5511999999999', // Número configurável pelo Admin
  sellerName: 'SafePlaca Hardware & Chips',
  shippingNotice: 'Envio para todo o Brasil via Sedex ou PAC. Despacho no mesmo dia útil para pedidos até as 14h.'
};

export const initialProducts: PhysicalProduct[] = [
  {
    id: 'prod-bypass-s20',
    title: 'Placa / Adaptador Hardware Bypass & Test Point V2',
    code: 'PLK-BYPASS-01',
    category: 'placas_desbloqueio',
    price: 189.90,
    originalPrice: 249.00,
    inStock: true,
    stockQuantity: 14,
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60',
    badge: 'Mais Vendido',
    description: 'Placa auxiliar de bancada para injeção de pulsos de clock e aterramento de test point para reparos avançados e recuperação de bootloader.',
    specifications: [
      'Compatível com Qualcomm EDL 9008 e Mediatek BROM',
      'Chave seletora comutadora de resistor pull-down de 1K a 100K',
      'LEDs indicadores de presença de VBUS e VDDIO',
      'Conector banhado a ouro de alta durabilidade'
    ],
    compatibility: ['Samsung S20 / S21', 'Xiaomi Note Series', 'Motorola G Series'],
    isFeatured: true
  },
  {
    id: 'prod-ci-sm5713',
    title: 'CI Gerenciador de Carga IF-PMIC SM5713 (Original Novo)',
    code: 'CHIP-SM5713-ORG',
    category: 'chips_cis',
    price: 48.50,
    inStock: true,
    stockQuantity: 28,
    imageUrl: 'https://images.unsplash.com/photo-1597733336794-12d05021d510?w=500&auto=format&fit=crop&q=60',
    badge: 'Pronta Entrega',
    description: 'Circuito integrado original virgem já com esferas de solda lead-free prontas para reballing e aplicação imediata.',
    specifications: [
      'Encapsulamento BGA 42-ball',
      'Esferas de solda 0.25mm instaladas de fábrica',
      'Testado 100% de qualidade e controle térmico'
    ],
    compatibility: ['Samsung Galaxy S20 FE', 'Galaxy A51', 'Galaxy A71', 'Galaxy Note 10 Lite'],
    isFeatured: true
  },
  {
    id: 'prod-ci-pm7150',
    title: 'CI PMIC Principal PM7150 002 (Qualcomm Original)',
    code: 'CHIP-PM7150-002',
    category: 'chips_cis',
    price: 79.00,
    originalPrice: 95.00,
    inStock: true,
    stockQuantity: 9,
    imageUrl: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=500&auto=format&fit=crop&q=60',
    badge: 'Destaque',
    description: 'Power Management IC principal para processadores Snapdragon. Essencial para solucionar aparelhos em consumo de 0.08A a 0.22A travado.',
    specifications: [
      'Encapsulamento BGA alta densidade',
      'Original lacrado no blister anti-estático'
    ],
    compatibility: ['Samsung S20 FE (Snapdragon)', 'Poco X3 Pro', 'Redmi Note 9 Pro', 'Moto G60']
  },
  {
    id: 'prod-fio-jumper-001',
    title: 'Fio de Jumper Ultrafino Isolado 0.01mm (Bobina 200 Metros)',
    code: 'INS-JMP-001MM',
    category: 'ferramentas_insumos',
    price: 32.00,
    inStock: true,
    stockQuantity: 45,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60',
    badge: 'Essencial',
    description: 'Fio de cobre esmaltado ultrafino de alta condutividade para reconstrução de trilhas sob microscópio e pads arrancados de BGA.',
    specifications: [
      'Diâmetro: 0.01 milímetro',
      'Esmalte isolante resistente até 400°C',
      'Estanhagem instantânea na ponta sem precisar raspar'
    ],
    isFeatured: true
  },
  {
    id: 'prod-stencil-black',
    title: 'Estêncil BGA Black Master Qualcomm & Exynos 0.12mm',
    code: 'STN-BGA-BLK',
    category: 'ferramentas_insumos',
    price: 55.00,
    inStock: true,
    stockQuantity: 18,
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=60',
    description: 'Estêncil de alta precisão cortado a laser com tratamento térmico anti-abaulamento, perfeito para reballing de CPU e memória.',
    specifications: [
      'Espessura: 0.12mm',
      'Furos chanfrados anti-aderentes para esferas perfeitas',
      'Aço japonês temperado de alta longevidade'
    ]
  },
  {
    id: 'prod-dongle-box',
    title: 'Adaptador Gravador eMMC / UFS ISP Socket Box Pro',
    code: 'TOOL-ISP-UFS-01',
    category: 'gravadoras_dongles',
    price: 490.00,
    originalPrice: 580.00,
    inStock: false,
    stockQuantity: 0,
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60',
    badge: 'Esgotado',
    description: 'Equipamento de bancada para leitura e gravação direta de memórias flash via conexão ISP ou socket BGA 153/254.',
    specifications: [
      'Suporte a UFS 2.1, 3.0 e eMMC 5.1',
      'Velocidade de leitura de até 150 MB/s',
      'Proteção contra sobretensão em VCC e VCCQ'
    ]
  }
];
