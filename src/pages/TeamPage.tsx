import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  Users, 
  ShieldCheck, 
  Waves, 
  Trophy, 
  Sparkles, 
  Calendar, 
  MapPin, 
  HeartHandshake,
  UserCheck
} from 'lucide-react';
import { AthletesShowcase } from '../components/AthletesShowcase';
import { SubpageTopBar } from '../components/SubpageTopBar';

interface TeamPageProps {
  onBackToHome: () => void;
  onOpenSupportModal: () => void;
  onNavigateToPage?: (page: string) => void;
}

export const TeamPage: React.FC<TeamPageProps> = ({ 
  onBackToHome, 
  onOpenSupportModal,
  onNavigateToPage
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-[#060e1c] text-slate-100 selection:bg-[#d4af37] selection:text-[#060e1c] subpage-top-offset pb-28 md:pb-20">
      
      {/* Top Breadcrumb & Clean Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <SubpageTopBar currentLabel="Nossa Equipe & Atletas" onBackToHome={onBackToHome} />

        {/* Clean, Non-Bloated Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
                <Users className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Nossa Equipe & Atletas
              </h1>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 font-normal">
              Conheça nossos 35 atletas da natação adaptada, comissão técnica e diretoria da ACEDEP.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenSupportModal}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 text-xs font-semibold border border-white/10 transition-all cursor-pointer"
            >
              Apoiar Equipe
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Full Athletes & Staff Showcase */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AthletesShowcase />

        {/* Quick Navigation Footer on Page */}
        <div className="mt-12 sm:mt-16 p-6 sm:p-8 rounded-3xl bg-[#0a192f] border border-[#1e3a5f] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <h4 className="text-lg font-bold text-white font-serif">
              Quer conferir os próximos campeonatos da equipe?
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Veja as etapas estaduais da FAP e campeonatos nacionais do CPB no calendário 2026.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
            {onNavigateToPage && (
              <button
                onClick={() => onNavigateToPage('calendario')}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#0f284a] hover:bg-[#d4af37] text-[#f3e5ab] hover:text-[#060e1c] border border-[#d4af37]/40 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Ver Calendário 2026</span>
              </button>
            )}

            <button
              onClick={onBackToHome}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </main>

    </div>
  );
};
