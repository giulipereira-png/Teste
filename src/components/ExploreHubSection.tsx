import React from 'react';
import { 
  Users, 
  Calendar as CalendarIcon, 
  Images, 
  MessageSquare, 
  HelpCircle, 
  ChevronRight, 
  Sparkles,
  Trophy,
  HeartHandshake,
  Compass
} from 'lucide-react';

interface ExploreHubSectionProps {
  onNavigateToPage: (page: 'sobre' | 'equipe' | 'calendario' | 'galeria' | 'faq' | 'comunidade') => void;
  onOpenSupportModal: () => void;
}

export const ExploreHubSection: React.FC<ExploreHubSectionProps> = ({
  onNavigateToPage,
  onOpenSupportModal
}) => {
  const exploreCards = [
    {
      id: 'equipe',
      title: 'Nossa Equipe & Atletas',
      badge: '35 Nadadores & Comissão',
      description: 'Conheça nossos atletas da natação paralímpica S14/S21 e a equipe técnica multidisciplinar.',
      icon: Users,
      color: 'from-blue-600/20 to-blue-900/40 border-blue-500/30 text-blue-300 hover:border-blue-400',
      iconBg: 'bg-blue-500/20 text-blue-300',
      action: () => onNavigateToPage('equipe'),
    },
    {
      id: 'calendario',
      title: 'Calendário Oficial 2026',
      badge: 'Competições & Seletivas',
      description: 'Datas de torneios estaduais FAP, etapas nacionais do CPB e eventos esportivos.',
      icon: CalendarIcon,
      color: 'from-amber-600/20 to-amber-900/40 border-[#d4af37]/30 text-[#f3e5ab] hover:border-[#d4af37]',
      iconBg: 'bg-[#d4af37]/20 text-[#d4af37]',
      action: () => onNavigateToPage('calendario'),
    },
    {
      id: 'galeria',
      title: 'Galeria de Fotos',
      badge: 'Momentos & Pódios',
      description: 'Registros fotográficos dos treinos no Centro Paralímpico, viagens e premiações.',
      icon: Images,
      color: 'from-cyan-600/20 to-cyan-900/40 border-cyan-500/30 text-cyan-300 hover:border-cyan-400',
      iconBg: 'bg-cyan-500/20 text-cyan-300',
      action: () => onNavigateToPage('galeria'),
    },
    {
      id: 'faq',
      title: 'Perguntas Frequentes',
      badge: 'FAQ & Dúvidas',
      description: 'Tire dúvidas sobre requisitos para novos atletas, laudo de elegibilidade e matrícula.',
      icon: HelpCircle,
      color: 'from-purple-600/20 to-purple-900/40 border-purple-500/30 text-purple-300 hover:border-purple-400',
      iconBg: 'bg-purple-500/20 text-purple-300',
      action: () => onNavigateToPage('faq'),
    },
  ];

  return (
    <section id="explorar" className="py-14 sm:py-16 bg-[#060e1c] text-slate-100 relative border-t border-[#1e3a5f]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-2.5">
            <Compass className="w-4 h-4" />
            <span>Navegação Rápida</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Explore as Páginas Oficiais da ACEDEP
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-300">
            Acesse as páginas dedicadas de cada área da associação com um clique:
          </p>
        </div>

        {/* 5 Compact Visual Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exploreCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.id}
                onClick={card.action}
                className={`group p-5 rounded-2xl bg-gradient-to-br ${card.color} border shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`p-2.5 rounded-xl ${card.iconBg} shadow-inner`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-black/40 border border-white/10 text-white">
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-white group-hover:text-[#f3e5ab] transition-colors flex items-center gap-1.5">
                      <span>{card.title}</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-white group-hover:text-[#d4af37] transition-colors">
                  <span>Acessar Página Completa</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}

          {/* 6th Card: Seja um Patrocinador / Apoiador */}
          <div
            onClick={onOpenSupportModal}
            className="group p-5 rounded-2xl bg-gradient-to-br from-[#d4af37]/20 via-[#1e3a5f]/40 to-black/60 border border-[#d4af37]/40 shadow-lg hover:shadow-[#d4af37]/20 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1 sm:col-span-2 lg:col-span-1"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-[#d4af37] text-[#060e1c] font-black shadow">
                  <HeartHandshake className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#d4af37]/30 text-[#f3e5ab] border border-[#d4af37]/40">
                  Faça Parte
                </span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white group-hover:text-[#f3e5ab] transition-colors">
                  Apoie a Natação Paralímpica
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Conheça os canais de doação via PIX, parcerias corporativas e leis de incentivo ao esporte.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-[#f3e5ab] group-hover:text-white transition-colors">
              <span>Como Apoiar</span>
              <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-[#d4af37]" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
