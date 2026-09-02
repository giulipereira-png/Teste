import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  MessageSquare, 
  Sparkles, 
  Heart, 
  ShieldCheck, 
  Send,
  Newspaper,
  Calendar,
  Waves
} from 'lucide-react';
import { CommunitySection } from '../components/CommunitySection';

interface CommunityPageProps {
  onBackToHome: () => void;
  onOpenSupportModal: () => void;
  onNavigateToPage?: (page: string) => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({
  onBackToHome,
  onOpenSupportModal,
  onNavigateToPage
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-[#060e1c] text-slate-100 selection:bg-[#d4af37] selection:text-[#060e1c] pt-24 pb-20">
      
      {/* Top Navigation & Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-b border-[#1e3a5f]/60 mb-6">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-[#d4af37] border border-white/10 hover:border-[#d4af37] text-slate-200 hover:text-[#060e1c] text-xs font-semibold transition-all shadow-sm cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform" />
            <span>Voltar para o Início</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span 
              onClick={onBackToHome} 
              className="hover:text-white cursor-pointer transition-colors"
            >
              Início
            </span>
            <span>/</span>
            <span className="text-[#d4af37] font-medium">Mural da Torcida & Notícias</span>
          </div>
        </div>

        {/* Clean, Non-Bloated Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
                <MessageSquare className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Mural da Torcida & Notícias
              </h1>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 font-normal">
              Mensagens da torcida, novidades dos treinos e comunicados oficiais da ACEDEP.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenSupportModal}
              className="px-3.5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#b8952b] text-[#060e1c] text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Apoiar Nadadores</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CommunitySection />

        {/* Back to Home bottom bar */}
        <div className="mt-14 p-6 rounded-3xl bg-[#0a192f] border border-[#1e3a5f] flex items-center justify-between">
          <p className="text-xs sm:text-sm text-slate-300">
            Deseja retornar para a página principal?
          </p>
          <button
            onClick={onBackToHome}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Voltar ao Início
          </button>
        </div>
      </main>

    </div>
  );
};
