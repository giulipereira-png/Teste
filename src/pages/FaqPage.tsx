import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  HelpCircle, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MessageSquare,
  UserPlus,
  HeartHandshake
} from 'lucide-react';
import { FaqSection } from '../components/FaqSection';

interface FaqPageProps {
  onBackToHome: () => void;
  onOpenContactModal: () => void;
  onOpenEnrollModal: () => void;
  onNavigateToPage?: (page: string) => void;
}

export const FaqPage: React.FC<FaqPageProps> = ({
  onBackToHome,
  onOpenContactModal,
  onOpenEnrollModal,
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
            <span className="text-[#d4af37] font-medium">Perguntas Frequentes (FAQ)</span>
          </div>
        </div>

        {/* Clean, Non-Bloated Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
                <HelpCircle className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Perguntas Frequentes (FAQ)
              </h1>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 font-normal">
              Dúvidas sobre matrículas, classe funcional S14/S21, laudos de elegibilidade, rotina de treinos e famílias.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenEnrollModal}
              className="px-3.5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#b8952b] text-[#060e1c] text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Matricular Atleta
            </button>
            <button
              type="button"
              onClick={onOpenContactModal}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 text-xs font-semibold border border-white/10 transition-all cursor-pointer"
            >
              Falar Conosco
            </button>
          </div>
        </div>
      </div>

      {/* Main FAQ Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FaqSection 
          onOpenContactModal={onOpenContactModal}
          onOpenEnrollModal={onOpenEnrollModal}
        />

        {/* Contact Help Box */}
        <div className="mt-14 p-8 rounded-3xl bg-gradient-to-br from-[#0a192f] via-[#10243e] to-[#0a192f] border border-[#d4af37]/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white font-serif">
              Ainda tem alguma dúvida específica?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Nossa comissão técnica e coordenação de pais estão disponíveis para tirar dúvidas pelo WhatsApp ou e-mail.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="https://wa.me/5511998809708"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp (11) 99880-9708</span>
            </a>

            <button
              onClick={onBackToHome}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </main>

    </div>
  );
};
