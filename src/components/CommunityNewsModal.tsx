import React from 'react';
import { X, Calendar, User, Heart, Share2, Award, ArrowLeft } from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';

export const CommunityNewsModal: React.FC = () => {
  const { selectedNewsForModal, setSelectedNewsForModal, likeNewsPost } = useCommunity();

  if (!selectedNewsForModal) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: selectedNewsForModal.title,
        text: selectedNewsForModal.summary,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setSelectedNewsForModal(null)}
    >
      <div 
        className="relative w-full max-w-3xl h-[100dvh] sm:h-auto sm:max-h-[90vh] bg-[#0c1f38] border-0 sm:border border-[#1e3a5f] rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Action Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 pt-[max(0.75rem,env(safe-area-inset-top))] border-b border-[#1e3a5f] bg-[#071326]/95 shrink-0">
          <button
            onClick={() => setSelectedNewsForModal(null)}
            className="min-h-[44px] px-2 flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#d4af37]" />
            <span>Voltar ao Mural</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => likeNewsPost(selectedNewsForModal.id)}
              className="min-h-[40px] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-rose-500/20 text-rose-300 border border-white/10 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
              <span>{selectedNewsForModal.likesCount || 0}</span>
              <span className="hidden sm:inline">Curtidas</span>
            </button>

            <button
              onClick={handleShare}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Compartilhar notícia"
              aria-label="Compartilhar notícia"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSelectedNewsForModal(null)}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Fechar notícia"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-8 space-y-6 flex-1 touch-scroll overscroll-y-contain pb-[max(2rem,env(safe-area-inset-bottom))]">
          {/* Category & Date */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f3e5ab] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#d4af37]" />
              {selectedNewsForModal.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              {selectedNewsForModal.date}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight font-serif">
            {selectedNewsForModal.title}
          </h2>

          {/* Author Badge */}
          <div className="flex items-center gap-3 py-2 border-y border-[#1e3a5f]/60">
            <div className="w-9 h-9 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">{selectedNewsForModal.author}</p>
              <p className="text-[11px] text-slate-400">{selectedNewsForModal.authorRole || 'ACEDEP Paradesporto'}</p>
            </div>
          </div>

          {/* Cover Image */}
          {selectedNewsForModal.coverUrl && (
            <div className="rounded-2xl overflow-hidden border border-[#1e3a5f] shadow-lg max-h-80 bg-black/40">
              <img
                src={selectedNewsForModal.coverUrl}
                alt={selectedNewsForModal.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Content Body */}
          <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line font-normal">
            {selectedNewsForModal.content}
          </div>
        </div>
      </div>
    </div>
  );
};
