import React, { useState } from 'react';
import { ShoppingBag, MessageCircle, Plus, Check, Search, Tag, Truck, ShieldCheck, Cpu, Wrench, X } from 'lucide-react';
import type { PhysicalProduct, ProductCategory, StoreSettings } from '../types/store';
import type { UserRole } from '../types/news';

interface SafePlacaStoreViewProps {
  products: PhysicalProduct[];
  storeSettings: StoreSettings;
  userRole: UserRole;
  onAddProduct?: (product: PhysicalProduct) => void;
  onUpdateSettings?: (settings: StoreSettings) => void;
}

export const SafePlacaStoreView: React.FC<SafePlacaStoreViewProps> = ({
  products,
  storeSettings,
  userRole,
  onAddProduct
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State para Novo Produto (Admin)
  const [newProdTitle, setNewProdTitle] = useState('');
  const [newProdCode, setNewProdCode] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<ProductCategory>('placas_desbloqueio');
  const [newProdPrice, setNewProdPrice] = useState('149.90');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdSpecs, setNewProdSpecs] = useState('');

  // Filtragem
  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const generateWhatsAppLink = (product: PhysicalProduct) => {
    const msg = `Olá! Gostaria de comprar o produto no SafePlaca Store:
📦 *${product.title}*
🏷️ Código: ${product.code}
💰 Valor: R$ ${product.price.toFixed(2)}
Por favor, informe as opções de frete para o meu CEP.`;
    return `https://wa.me/${storeSettings.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdTitle.trim() || !newProdCode.trim()) return;

    const newProd: PhysicalProduct = {
      id: `prod-custom-${Date.now()}`,
      title: newProdTitle.trim(),
      code: newProdCode.trim().toUpperCase(),
      category: newProdCategory,
      price: parseFloat(newProdPrice) || 99,
      inStock: true,
      imageUrl: newProdImage.trim(),
      description: newProdDesc.trim() || 'Produto técnico para reparo avançado.',
      specifications: newProdSpecs.split('\n').filter(s => s.trim().length > 0),
      isFeatured: true
    };

    if (onAddProduct) onAddProduct(newProd);
    setIsAddModalOpen(false);
    // Limpar form
    setNewProdTitle('');
    setNewProdCode('');
    setNewProdDesc('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Banner Principal da Loja */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border border-emerald-500/30 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
            <ShoppingBag className="w-3.5 h-3.5" /> SafePlaca Store Oficial
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Placas de Desbloqueio, CIs Originais & Insumos de Bancada
          </h2>
          <p className="text-sm text-slate-300">
            Compre direto com nossa equipe via WhatsApp com envio rápido e garantia de funcionamento para técnicos.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <Truck className="w-4 h-4" /> {storeSettings.shippingNotice}
            </span>
            <span className="flex items-center gap-1 text-indigo-400">
              <ShieldCheck className="w-4 h-4" /> Peças Originais Testadas
            </span>
          </div>
        </div>

        {userRole === 'admin' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="z-10 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 whitespace-nowrap text-sm"
          >
            <Plus className="w-4 h-4" /> Cadastrar Produto
          </button>
        )}
      </div>

      {/* Categorias & Busca */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              selectedCategory === 'ALL'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Todos os Produtos
          </button>
          <button
            onClick={() => setSelectedCategory('placas_desbloqueio')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === 'placas_desbloqueio'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> Placas Desbloqueio & Test Point
          </button>
          <button
            onClick={() => setSelectedCategory('chips_cis')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === 'chips_cis'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Tag className="w-3.5 h-3.5" /> CIs & Chips Virgens
          </button>
          <button
            onClick={() => setSelectedCategory('ferramentas_insumos')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === 'ferramentas_insumos'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" /> Insumos & Fios de Jumper
          </button>
        </div>

        {/* Campo de Busca */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar peças, chips, placas..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Grid de Produtos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-emerald-500/50 transition-all flex flex-col group"
          >
            {/* Imagem do Produto */}
            <div className="h-48 bg-slate-950 relative overflow-hidden flex items-center justify-center">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              {product.badge && (
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-emerald-600/90 backdrop-blur-md text-white font-bold text-[11px] rounded-lg shadow-md">
                  {product.badge}
                </span>
              )}
              <span className="absolute top-3 right-3 font-mono text-xs px-2 py-0.5 bg-slate-950/80 backdrop-blur-md text-slate-300 rounded border border-slate-800">
                {product.code}
              </span>
            </div>

            {/* Informações */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-white font-bold text-base line-clamp-1 group-hover:text-emerald-400 transition">
                  {product.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {product.description}
                </p>

                {/* Especificações Rápidas */}
                <div className="mt-3 space-y-1">
                  {product.specifications.slice(0, 2).map((spec, i) => (
                    <div key={i} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preço e Botão de Compra WhatsApp */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Preço à vista</div>
                  <div className="text-xl font-extrabold text-white font-mono flex items-baseline gap-1">
                    <span className="text-xs text-emerald-400 font-sans">R$</span>
                    {product.price.toFixed(2)}
                  </div>
                </div>

                {product.inStock ? (
                  <a
                    href={generateWhatsAppLink(product)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4" /> Comprar no Zap
                  </a>
                ) : (
                  <button
                    disabled
                    className="px-4 py-2 bg-slate-800 text-slate-500 font-bold text-xs rounded-xl cursor-not-allowed"
                  >
                    Esgotado
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Admin: Adicionar Produto */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" /> Cadastrar Novo Produto
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Título do Produto:</label>
                <input
                  type="text"
                  required
                  value={newProdTitle}
                  onChange={(e) => setNewProdTitle(e.target.value)}
                  placeholder="Ex: Placa Adaptadora EDL Qualcomm V2"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Código de Referência:</label>
                  <input
                    type="text"
                    required
                    value={newProdCode}
                    onChange={(e) => setNewProdCode(e.target.value)}
                    placeholder="Ex: PLK-EDL-02"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Categoria:</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as ProductCategory)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="placas_desbloqueio">Placas de Desbloqueio</option>
                    <option value="chips_cis">CIs & Chips</option>
                    <option value="ferramentas_insumos">Ferramentas & Insumos</option>
                    <option value="gravadoras_dongles">Gravadoras / Dongles</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Preço (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">URL da Imagem:</label>
                  <input
                    type="url"
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Descrição:</label>
                <textarea
                  rows={2}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Descrição técnica..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Especificações Técnicas (1 por linha):
                </label>
                <textarea
                  rows={3}
                  value={newProdSpecs}
                  onChange={(e) => setNewProdSpecs(e.target.value)}
                  placeholder="Ex: Encapsulamento BGA&#10;Resistor de pull-up integrado"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
