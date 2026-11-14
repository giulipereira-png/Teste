import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface SubpageTopBarProps {
  currentLabel: string;
  onBackToHome: () => void;
  backLabel?: string;
}

export const SubpageTopBar: React.FC<SubpageTopBarProps> = ({
  currentLabel,
  onBackToHome,
  backLabel = 'Voltar para o Início',
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-[#1e3a5f]/60 mb-6">
      <button
        type="button"
        onClick={onBackToHome}
        className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-white/5 hover:bg-[#d4af37] active:bg-[#d4af37] border border-white/15 hover:border-[#d4af37] text-slate-100 hover:text-[#060e1c] active:text-[#060e1c] text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer active:scale-[0.98] group shrink-0 whitespace-nowrap"
      >
        <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform shrink-0" />
        <span>{backLabel}</span>
      </button>

      <nav aria-label="Navegação estrutural" className="flex items-center gap-2 text-xs text-slate-400 min-w-0">
        <button
          type="button"
          onClick={onBackToHome}
          className="hover:text-white transition-colors cursor-pointer py-1 px-1 shrink-0"
        >
          Início
        </button>
        <span aria-hidden="true">/</span>
        <span className="text-[#d4af37] font-medium truncate max-w-[180px] sm:max-w-none">
          {currentLabel}
        </span>
      </nav>
    </div>
  );
};
