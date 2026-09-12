export type ProductCategory = 
  | 'placas_desbloqueio' 
  | 'chips_cis' 
  | 'ferramentas_insumos' 
  | 'gravadoras_dongles';

export interface PhysicalProduct {
  id: string;
  title: string;
  code: string;
  category: ProductCategory;
  price: number; // Em Reais (R$)
  originalPrice?: number;
  inStock: boolean;
  stockQuantity?: number;
  imageUrl: string;
  badge?: string; // Ex: 'Mais Vendido', 'Lançamento', 'Pronta Entrega'
  description: string;
  specifications: string[];
  compatibility?: string[]; // Modelos de aparelhos compatíveis
  isFeatured?: boolean;
}

export interface StoreSettings {
  whatsappNumber: string; // Ex: '5511999999999'
  sellerName: string;
  shippingNotice: string;
}
