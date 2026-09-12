import React, { useState } from 'react';
import type { NewsAnnouncement, NewsBadge, UserRole } from '../types/news';
import { 
  CheckCircle2, 
  X, 
  Plus, 
  Megaphone
} from 'lucide-react';

interface NewsModalProps {
  newsList: NewsAnnouncement[];
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  onAddNews?: (news: NewsAnnouncement) => void;
}

export const NewsModal: React.FC<NewsModalProps> = ({
  newsList,
  isOpen,
  onClose,
  userRole,
  onAddNews,
}) => {
  const [isPosting, setIsPosting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [badge, setBadge] = useState<NewsBadge>('novidade');

  if (!isOpen) return null;

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddNews) return;

    const newNews: NewsAnnouncement = {
      id: 'news-' + Date.now(),
      title: title || 'Comunicado Técnico',
      content: content || 'Novidades adicionadas no SafePlaca.',
      badge,
      date: new Date().toLocaleDateString('pt-BR'),
      author: 'Administrador SafePlaca',
    };

    onAddNews(newNews);
    setIsPosting(false);
    setTitle('');
    setContent('');
  };

  const getBadgeStyle = (b: NewsBadge) => {
    switch (b) {
      case 'esquema_novo':
        return { text: 'NOVO ESQUEMA', bg: 'bg-cyan-950 text-cyan-300 border-cyan-700/50' };
      case 'novidade':
        return { text: 'ATUALIZAÇÃO', bg: 'bg-indigo-950 text-indigo-300 border-indigo-700/50' };
      case 'dica_reparo':
        return { text: 'DICA DE BANCADA', bg: 'bg-emerald-950 text-emerald-300 border-emerald-700/50' };
      case 'aviso':
        return { text: 'AVISO IMPORTANTE', bg: 'bg-amber-950 text-amber-300 border-amber-700/50' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto select-none no-copy-shield font-mono">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-6 shadow-2xl shadow-cyan-950/60 text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-950/70 border border-cyan-500/40 rounded-2xl text-cyan-400">
              <Megaphone className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">Mural de Novidades &amp; Avisos</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/40 font-bold">
                  BANCADA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Atualizações recentes de esquemas, placas e procedimentos de reparo.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Botão de Postar Novidade (Exclusivo Admin) */}
        {userRole === 'admin' && (
          <div className="mb-4">
            {!isPosting ? (
              <button
                onClick={() => setIsPosting(true)}
                className="w-full py-2 px-3 rounded-xl bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 text-xs font-bold border border-cyan-600/40 flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Publicar Novo Comunicado / Notícia para os Clientes</span>
              </button>
            ) : (
              <form onSubmit={handlePostSubmit} className="bg-slate-950 p-4 rounded-2xl border border-cyan-500/40 space-y-3">
                <div className="flex items-center justify-between text-xs text-cyan-300 font-bold">
                  <span>Escrever Novo Comunicado:</span>
                  <button type="button" onClick={() => setIsPosting(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="sm:col-span-2">
                    <label className="text-slate-400 block mb-1">Título:</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Liberada Subplaca Moto G52 com Test Points"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Tipo:</label>
                    <select
                      value={badge}
                      onChange={(e) => setBadge(e.target.value as NewsBadge)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                    >
                      <option value="novidade">Atualização</option>
                      <option value="esquema_novo">Novo Esquema</option>
                      <option value="dica_reparo">Dica de Bancada</option>
                      <option value="aviso">Aviso</option>
                    </select>
                  </div>
                </div>

                <div className="text-xs">
                  <label className="text-slate-400 block mb-1">Descrição do Comunicado:</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Explique o que foi adicionado ou a orientação técnica para o cliente..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPosting(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                  >
                    Publicar Agora
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Lista de Notícias */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {newsList.map((item) => {
            const bStyle = getBadgeStyle(item.badge);
            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition space-y-2 shadow-lg"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${bStyle.bg}`}>
                    {bStyle.text}
                  </span>
                  <span className="text-[11px] text-slate-500">{item.date}</span>
                </div>

                <h4 className="font-bold text-white text-sm">{item.title}</h4>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">{item.content}</p>

                {item.author && (
                  <span className="text-[10px] text-cyan-400/80 block pt-1">
                    Publicado por: {item.author}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">SafePlaca Notificações de Bancada</span>
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition shadow-lg shadow-cyan-950 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Entendido / Continuar para a Bancada</span>
          </button>
        </div>
      </div>
    </div>
  );
};
