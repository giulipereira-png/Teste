import React, { useEffect } from 'react';
import { X, HelpCircle, ShieldCheck } from 'lucide-react';
import { FaqSection } from './FaqSection';

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContactModal?: () => void;
  onOpenEnrollModal?: () => void;
}

export const FaqModal: React.FC<FaqModalProps> = ({ 
  isOpen, 
  onClose,
  onOpenContactModal,
  onOpenEnrollModal 
}) => {
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
        className="relative w-full max-w-4xl my-auto rounded-3xl bg-[#08172c] border border-[#1e3a5f] shadow-2xl shadow-black/80 flex flex-col max-h-[92vh] overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 bg-[#060e1c] border-b border-[#1e3a5f] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 shadow-inner">
              <HelpCircle className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-white font-serif tracking-tight">
                  Perguntas & Dúvidas Frequentes
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f3e5ab] text-[11px] font-bold border border-[#d4af37]/30">
                  FAQ Oficial
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Esclareça dúvidas sobre classificação funcional, horários, matrícula e parcerias
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
          <FaqSection 
            onOpenContactModal={() => {
              onClose();
              onOpenContactModal?.();
            }}
            onOpenEnrollModal={() => {
              onClose();
              onOpenEnrollModal?.();
            }}
          />
        </div>

        {/* Modal Footer Bar */}
        <div className="p-4 bg-[#060e1c] border-t border-[#1e3a5f] flex items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Precisa de mais informações? Fale com a coordenação</span>
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
