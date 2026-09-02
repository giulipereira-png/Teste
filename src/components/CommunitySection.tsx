import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Heart, 
  MessageSquare, 
  Plus, 
  Send, 
  CheckCircle2, 
  Waves,
  ArrowRight,
  TrendingUp,
  UserPlus,
  Edit3,
  Trash2,
  X,
  Check,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { usePhotos } from '../context/PhotosContext';
import { NewsCategory, CommunityCheer } from '../types';

export const CommunitySection: React.FC = () => {
  const { 
    newsPosts, 
    cheers, 
    addCheer, 
    updateCheer,
    deleteCheer,
    likeCheer, 
    likeNewsPost, 
    setSelectedNewsForModal,
    setCoachManagerModalOpen
  } = useCommunity();
  const { isAdminAuthenticated, openAdminModal } = usePhotos();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Cheer Form State & Carousel State
  const [showCheerForm, setShowCheerForm] = useState(false);
  const [cheerAuthor, setCheerAuthor] = useState('');
  const [cheerRelation, setCheerRelation] = useState('');
  const [cheerMsg, setCheerMsg] = useState('');
  const [isSubmittingCheer, setIsSubmittingCheer] = useState(false);
  const [cheerSuccess, setCheerSuccess] = useState(false);

  // Carousel Pagination & Autoplay State
  const [cheerPage, setCheerPage] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(true);
  const cardsPerPage = 2; // 2 cards side by side on desktop, 1 on mobile
  const totalPages = Math.max(1, Math.ceil(cheers.length / cardsPerPage));

  // Admin In-place Cheer Management
  const [editingCheer, setEditingCheer] = useState<CommunityCheer | null>(null);
  const [editAuthor, setEditAuthor] = useState('');
  const [editRelation, setEditRelation] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [adminActionMsg, setAdminActionMsg] = useState('');

  // Auto-play timer for community cheers carousel
  useEffect(() => {
    if (!isAutoPlayEnabled || isCarouselPaused || showCheerForm || editingCheer || totalPages <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCheerPage((prev) => (prev + 1) % totalPages);
    }, 5000); // Transitions every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlayEnabled, isCarouselPaused, showCheerForm, editingCheer, totalPages]);

  // Keep cheerPage in bounds if cheers count changes
  useEffect(() => {
    if (cheerPage >= totalPages && totalPages > 0) {
      setCheerPage(Math.max(0, totalPages - 1));
    }
  }, [cheers.length, totalPages, cheerPage]);

  const categories: { label: string; value: string }[] = [
    { label: 'Todas as Novidades', value: 'all' },
    { label: 'Resultados & Provas', value: 'Resultados & Provas' },
    { label: 'Comunicados Oficiais', value: 'Comunicados Oficiais' },
    { label: 'Treinos & Calendário', value: 'Treinos & Calendário' },
    { label: 'Eventos & Festivais', value: 'Eventos & Festivais' },
  ];

  const filteredPosts = selectedCategory === 'all'
    ? newsPosts
    : newsPosts.filter((p) => p.category === selectedCategory);

  const pinnedPost = newsPosts.find((p) => p.pinned) || newsPosts[0];

  const handleCheerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cheerAuthor.trim() || !cheerMsg.trim()) return;

    setIsSubmittingCheer(true);
    const success = await addCheer({
      authorName: cheerAuthor,
      relationship: cheerRelation || 'Comunidade ACEDEP',
      message: cheerMsg,
    });
    setIsSubmittingCheer(false);

    if (success) {
      setCheerAuthor('');
      setCheerRelation('');
      setCheerMsg('');
      setCheerSuccess(true);
      setTimeout(() => setCheerSuccess(false), 4000);
    }
  };

  const handleStartEdit = (cheer: CommunityCheer) => {
    setEditingCheer(cheer);
    setEditAuthor(cheer.authorName);
    setEditRelation(cheer.relationship || '');
    setEditMessage(cheer.message);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCheer || !editAuthor.trim() || !editMessage.trim()) return;

    setIsSavingEdit(true);
    const success = await updateCheer(editingCheer.id, {
      authorName: editAuthor,
      relationship: editRelation,
      message: editMessage,
    });
    setIsSavingEdit(false);

    if (success) {
      setEditingCheer(null);
      setAdminActionMsg('Recado atualizado com sucesso!');
      setTimeout(() => setAdminActionMsg(''), 4000);
    }
  };

  const handleDeleteCheer = async (id: string) => {
    setIsDeletingId(id);
    await deleteCheer(id);
    setIsDeletingId(null);
    setConfirmDeleteId(null);
    setAdminActionMsg('Recado removido com sucesso!');
    setTimeout(() => setAdminActionMsg(''), 4000);
  };

  return (
    <section id="comunidade" className="py-20 bg-[#071326] relative overflow-hidden border-t border-[#1e3a5f]/80">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#f3e5ab] text-xs font-bold tracking-wider uppercase">
            <Waves className="w-4 h-4 text-[#d4af37]" />
            <span>Comunidade & Notícias da Natação</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-serif">
            Mural de Novidades & Conquistas
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Acompanhe o dia a dia dos nossos nadadores com deficiência intelectual (Classe S14), comunicados da comissão técnica e resultados de competições no Centro Paralímpico Brasileiro.
          </p>
        </div>

        {/* 1. PINNED / FEATURED HERO NEWS CARD */}
        {pinnedPost && (
          <div 
            onClick={() => setSelectedNewsForModal(pinnedPost)}
            className="group relative rounded-3xl bg-[#0c1f38] border border-[#1e3a5f] hover:border-[#d4af37]/60 transition-all duration-300 overflow-hidden shadow-xl cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-0"
          >
            <div className="lg:col-span-7 h-64 lg:h-auto min-h-[280px] relative overflow-hidden bg-black/40">
              <img
                src={pinnedPost.coverUrl}
                alt={pinnedPost.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c1f38] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#0c1f38]" />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full bg-[#d4af37] text-[#060e1c] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow">
                  <Sparkles className="w-3.5 h-3.5" />
                  Destaque
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-[#d4af37] font-semibold">{pinnedPost.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {pinnedPost.date}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-[#d4af37] transition-colors font-serif leading-snug">
                  {pinnedPost.title}
                </h3>

                <p className="text-slate-300 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                  {pinnedPost.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-[#1e3a5f]/60 flex items-center justify-between">
                <span className="text-xs font-bold text-[#f3e5ab] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                  Ler notícia completa
                  <ArrowRight className="w-4 h-4 text-[#d4af37]" />
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    likeNewsPost(pinnedPost.id);
                  }}
                  className="flex items-center gap-1.5 text-xs text-rose-300 hover:text-rose-200 transition-colors px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                  <span>{pinnedPost.likesCount || 0}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. FILTER PILLS */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.value
                  ? 'bg-[#d4af37] text-[#060e1c] shadow-md scale-105'
                  : 'bg-[#0c1f38] text-slate-300 border border-[#1e3a5f] hover:border-[#d4af37]/40 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 3. NEWS CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedNewsForModal(post)}
              className="group rounded-2xl bg-[#0c1f38] border border-[#1e3a5f] hover:border-[#d4af37]/50 transition-all duration-300 overflow-hidden shadow-lg flex flex-col justify-between cursor-pointer hover:-translate-y-1"
            >
              <div>
                {/* Image */}
                <div className="h-44 w-full relative overflow-hidden bg-black/40">
                  <img
                    src={post.coverUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/20 text-[#f3e5ab] text-[10px] font-bold uppercase tracking-wider">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>{post.date}</span>
                  </div>

                  <h4 className="text-base font-bold text-white group-hover:text-[#d4af37] transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h4>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {post.summary}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-5 pt-0 flex items-center justify-between border-t border-[#1e3a5f]/40 mt-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1 group-hover:text-[#d4af37] transition-colors">
                  Ver detalhes
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    likeNewsPost(post.id);
                  }}
                  className="flex items-center gap-1 text-xs text-rose-300 hover:text-rose-200 transition-colors px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20"
                >
                  <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
                  <span>{post.likesCount || 0}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 4. MURAL DE APOIO DA FAMÍLIA & TORCIDA ACEDEP (CARROSSEL COMPACTO) */}
        <div className="pt-8 border-t border-[#1e3a5f]/80">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Header with Title + Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0a192f]/70 border border-[#1e3a5f] p-4 sm:p-5 rounded-2xl">
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] font-bold text-[#d4af37] uppercase tracking-wider mb-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Mural da Família & Torcida</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white font-serif">
                  Recados de Carinho aos Nossos Atletas
                </h3>
                <p className="text-xs text-slate-300">
                  Mensagens de incentivo e apoio da família ACEDEP aos nadadores.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCheerForm(!showCheerForm)}
                  className="px-3.5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#e5c058] text-[#060e1c] text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  {showCheerForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{showCheerForm ? 'Fechar Formulário' : 'Deixar Recado'}</span>
                </button>

                {isAdminAuthenticated && (
                  <button
                    type="button"
                    onClick={() => {
                      setCoachManagerModalOpen(true);
                      openAdminModal();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#f3e5ab] text-xs font-bold hover:bg-[#d4af37]/25 transition-colors cursor-pointer"
                    title="Moderar recados no painel administrativo"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span className="hidden sm:inline">Moderação</span>
                  </button>
                )}
              </div>
            </div>

            {/* Expandable / Collapsible Form to leave a cheer */}
            {showCheerForm && (
              <div className="p-5 rounded-2xl bg-[#0c1f38] border border-[#d4af37]/50 space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-[#1e3a5f] pb-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span>Publicar Mensagem de Incentivo</span>
                  </h4>
                  <button 
                    type="button" 
                    onClick={() => setShowCheerForm(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCheerSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Seu Nome *
                      </label>
                      <input
                        type="text"
                        required
                        value={cheerAuthor}
                        onChange={(e) => setCheerAuthor(e.target.value)}
                        placeholder="Ex: Mariana Silva"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Vínculo com a ACEDEP
                      </label>
                      <input
                        type="text"
                        value={cheerRelation}
                        onChange={(e) => setCheerRelation(e.target.value)}
                        placeholder="Ex: Mãe do atleta Lucas (S14), Amiga..."
                        className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Sua Mensagem de Incentivo *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={cheerMsg}
                      onChange={(e) => setCheerMsg(e.target.value)}
                      placeholder="Escreva palavras de ânimo e carinho para os nadadores..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] resize-none"
                    />
                  </div>

                  {cheerSuccess && (
                    <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Recado publicado com sucesso no mural!</span>
                    </p>
                  )}

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCheerForm(false)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingCheer}
                      className="py-1.5 px-4 rounded-lg bg-[#d4af37] text-[#060e1c] text-xs font-bold hover:bg-[#b8952b] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />
                      <span>{isSubmittingCheer ? 'Publicando...' : 'Publicar'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Admin Action Message */}
            {adminActionMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{adminActionMsg}</span>
              </div>
            )}

            {/* Carousel Display with Autoplay */}
            {cheers.length === 0 ? (
              <div className="text-center py-8 rounded-2xl bg-[#0a192f]/40 border border-[#1e3a5f] text-slate-400 text-xs">
                Nenhum recado publicado ainda. Seja o primeiro a deixar uma mensagem de incentivo!
              </div>
            ) : (
              <div 
                className="relative"
                onMouseEnter={() => setIsCarouselPaused(true)}
                onMouseLeave={() => setIsCarouselPaused(false)}
                onTouchStart={() => setIsCarouselPaused(true)}
                onTouchEnd={() => setIsCarouselPaused(false)}
              >
                {/* Carousel Card Track */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cheers
                    .slice(cheerPage * cardsPerPage, cheerPage * cardsPerPage + cardsPerPage)
                    .map((c) => {
                      const isConfirming = confirmDeleteId === c.id;
                      const isDeleting = isDeletingId === c.id;

                      return (
                        <div
                          key={c.id}
                          className="p-4 rounded-2xl bg-[#0c1f38] border border-[#1e3a5f] hover:border-[#d4af37]/50 transition-all flex flex-col justify-between shadow-md space-y-3 min-h-[140px]"
                        >
                          <div className="space-y-2">
                            {/* Card Top: Author & Admin Buttons */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div 
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-[#060e1c] text-[11px] font-bold shrink-0 shadow"
                                  style={{ backgroundColor: c.avatarColor || '#d4af37' }}
                                >
                                  {c.authorName.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white leading-tight truncate">{c.authorName}</p>
                                  <p className="text-[10px] text-slate-400 truncate">{c.relationship || 'Torcida ACEDEP'}</p>
                                </div>
                              </div>

                              {/* Admin action buttons if logged in */}
                              {isAdminAuthenticated && (
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(c)}
                                    className="p-1 rounded-md bg-white/5 hover:bg-[#d4af37]/20 text-slate-400 hover:text-[#f3e5ab] border border-white/10 transition-colors cursor-pointer"
                                    title="Editar recado (Admin)"
                                  >
                                    <Edit3 className="w-3 h-3 text-[#d4af37]" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(c.id)}
                                    className="p-1 rounded-md bg-red-500/10 hover:bg-red-500/25 text-red-400 hover:text-red-300 border border-red-500/20 transition-colors cursor-pointer"
                                    title="Excluir recado (Admin)"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Message text */}
                            <p className="text-xs text-slate-200 leading-relaxed italic line-clamp-3">
                              "{c.message}"
                            </p>
                          </div>

                          {/* Confirmation Prompt when deleting */}
                          {isConfirming && (
                            <div className="p-2 rounded-xl bg-red-950/90 border border-red-500/60 flex items-center justify-between gap-2 text-xs">
                              <span className="text-[10px] text-red-200 font-bold">Excluir recado?</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={isDeleting}
                                  onClick={() => handleDeleteCheer(c.id)}
                                  className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold cursor-pointer transition-colors shadow"
                                >
                                  {isDeleting ? '...' : 'Sim'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-2 py-0.5 bg-white/10 hover:bg-white/20 text-slate-300 rounded text-[10px] font-semibold cursor-pointer transition-colors"
                                >
                                  Não
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Footer: Date & Like Counter */}
                          <div className="pt-2 border-t border-[#1e3a5f]/40 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">
                              {c.createdAt ? new Date(c.createdAt).toLocaleDateString('pt-BR') : ''}
                            </span>

                            <button
                              onClick={() => likeCheer(c.id)}
                              className="flex items-center gap-1.5 text-[11px] text-rose-300 hover:text-rose-200 px-2 py-0.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 transition-colors cursor-pointer"
                            >
                              <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
                              <span>{c.likes || 0}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Carousel Controls & Dots & Autoplay Status */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCheerPage((p) => (p === 0 ? totalPages - 1 : p - 1))}
                        className="p-2 rounded-xl bg-[#0c1f38] border border-[#1e3a5f] text-slate-300 hover:text-white hover:border-[#d4af37] transition-all cursor-pointer shadow"
                        title="Página Anterior"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {/* Autoplay Play/Pause Toggle */}
                      <button
                        type="button"
                        onClick={() => setIsAutoPlayEnabled(!isAutoPlayEnabled)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          isAutoPlayEnabled 
                            ? 'bg-[#d4af37]/15 border-[#d4af37]/40 text-[#f3e5ab] hover:bg-[#d4af37]/25' 
                            : 'bg-[#0c1f38] border-[#1e3a5f] text-slate-400 hover:text-white'
                        }`}
                        title={isAutoPlayEnabled ? 'Pausar rotação automática' : 'Ativar rotação automática'}
                      >
                        {isAutoPlayEnabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Dots indicator with progress animation */}
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCheerPage(idx)}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            idx === cheerPage 
                              ? 'w-7 bg-[#d4af37]' 
                              : 'w-2 bg-white/20 hover:bg-white/40'
                          }`}
                          title={`Ir para página ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                        {isAutoPlayEnabled && !isCarouselPaused ? 'Auto 5s' : isCarouselPaused ? 'Pausado' : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCheerPage((p) => (p + 1) % totalPages)}
                        className="p-2 rounded-xl bg-[#0c1f38] border border-[#1e3a5f] text-slate-300 hover:text-white hover:border-[#d4af37] transition-all cursor-pointer shadow"
                        title="Próxima Página"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Admin Quick Edit Modal for Cheer */}
      {editingCheer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0c1f38] border border-[#d4af37]/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e3a5f] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h5 className="font-bold text-white text-sm font-serif">Editar Recado (Admin)</h5>
              </div>
              <button 
                onClick={() => setEditingCheer(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Nome do Autor *</label>
                <input
                  type="text"
                  required
                  value={editAuthor}
                  onChange={(e) => setEditAuthor(e.target.value)}
                  placeholder="Nome do autor"
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Vínculo com a ACEDEP / Atleta</label>
                <input
                  type="text"
                  value={editRelation}
                  onChange={(e) => setEditRelation(e.target.value)}
                  placeholder="Vínculo ou relação"
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Mensagem de Incentivo *</label>
                <textarea
                  required
                  rows={4}
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  placeholder="Texto do recado..."
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e3a5f]/60">
                <button
                  type="button"
                  onClick={() => setEditingCheer(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-1.5 rounded-lg bg-[#d4af37] text-[#060e1c] font-bold hover:bg-[#b8952b] cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSavingEdit ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Salvar Alterações</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
