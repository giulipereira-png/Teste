import React, { useEffect } from 'react';
import { X, MessageSquare, Heart, ShieldCheck } from 'lucide-react';
import { CommunitySection } from './CommunitySection';

interface CommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommunityModal: React.FC<CommunityModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-6xl my-auto rounded-3xl bg-[#08172c] border border-[#1e3a5f] shadow-2xl shadow-black/80 flex flex-col max-h-[92vh] overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 bg-[#060e1c] border-b border-[#1e3a5f] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 shadow-inner">
              <MessageSquare className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-white font-serif tracking-tight">
                  Comunidade & Notícias da ACEDEP
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-400 fill-red-400" />
                  Mural Interativo
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Notícias oficiais, recados de apoio aos nossos nadadores e artigos esportivos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1">
          <CommunitySection />
        </div>

        {/* Modal Footer Bar */}
        <div className="p-4 bg-[#060e1c] border-t border-[#1e3a5f] flex items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Espaço colaborativo para atletas, familiares e apoiadores</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#1e3a5f] hover:bg-[#d4af37] text-white hover:text-black font-bold text-xs transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
