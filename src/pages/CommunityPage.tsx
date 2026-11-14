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
import { SubpageTopBar } from '../components/SubpageTopBar';

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
    <div className="min-h-screen bg-[#060e1c] text-slate-100 selection:bg-[#d4af37] selection:text-[#060e1c] subpage-top-offset pb-28 md:pb-20">
      
      {/* Top Navigation & Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <SubpageTopBar currentLabel="Mural da Torcida & Notícias" onBackToHome={onBackToHome} />

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
        <div className="mt-12 sm:mt-14 p-6 rounded-3xl bg-[#0a192f] border border-[#1e3a5f] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-slate-300">
            Deseja retornar para a página principal?
          </p>
          <button
            onClick={onBackToHome}
            className="min-h-[44px] w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
          >
            Voltar ao Início
          </button>
        </div>
      </main>

    </div>
  );
};
