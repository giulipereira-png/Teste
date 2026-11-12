import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  HeartHandshake, 
  Building2, 
  Award, 
  Globe, 
  ExternalLink, 
  Mail, 
  Phone, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Heart,
  ArrowRight
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { SponsorItem } from '../types';

interface SponsorsPageProps {
  onBackToHome: () => void;
  onOpenSupportModal: () => void;
  onOpenContactModal: () => void;
  onOpenAdminPortal?: () => void;
}

const CATEGORY_ORDER: SponsorItem['category'][] = [
  'Patrocinador Master',
  'Apoiador Institucional',
  'Parceiro Técnico',
  'Apoio Alimentar & Saúde',
  'Empresa Amiga do Paradesporto'
];

export const SponsorsPage: React.FC<SponsorsPageProps> = ({
  onBackToHome,
  onOpenSupportModal,
  onOpenContactModal,
  onOpenAdminPortal
}) => {
  const { sponsors } = useCommunity();
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const activeSponsors = sponsors.filter((s) => s.isActive);

  const filteredSponsors = activeCategoryFilter === 'all'
    ? activeSponsors
    : activeSponsors.filter((s) => s.category === activeCategoryFilter);

  return (
    <div className="min-h-screen bg-[#060e1c] text-slate-100 selection:bg-[#d4af37] selection:text-[#060e1c] pt-24 pb-20">
      
      {/* Top Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
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
            <span className="text-[#d4af37] font-medium">Apoiadores & Parceiros</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#0a1b35] via-[#0d2242] to-[#071324] border border-[#d4af37]/30 p-8 sm:p-12 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f3e5ab] text-xs font-bold uppercase tracking-wider">
              <HeartHandshake className="w-4 h-4 text-[#d4af37]" />
              <span>Gratidão & Responsabilidade Social</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-white tracking-tight leading-tight">
              Apoiadores e Patrocinadores Oficiais
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
              Empresas, instituições e marcas comprometidas com a inclusão e o desenvolvimento da natação paralímpica paulista. Graças a essas parcerias, nossos atletas com deficiência intelectual (S14 e S21) contam com infraestrutura de ponta no Centro Paralímpico Brasileiro, uniformes oficiais, materiais e suporte em competições nacionais e internacionais.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onOpenSupportModal}
                className="px-5 py-3 rounded-xl bg-[#d4af37] hover:bg-[#b8952b] text-[#060e1c] text-xs sm:text-sm font-bold transition-all shadow-lg shadow-[#d4af37]/20 cursor-pointer flex items-center gap-2"
              >
                <Heart className="w-4 h-4 fill-current" />
                <span>Seja uma Empresa Apoiadora</span>
              </button>

              <button
                type="button"
                onClick={onOpenContactModal}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Falar com a Presidência</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategoryFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategoryFilter === 'all'
                ? 'bg-[#d4af37] text-[#060e1c] font-bold shadow-md shadow-[#d4af37]/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            Todos os Apoiadores ({activeSponsors.length})
          </button>

          {CATEGORY_ORDER.map((cat) => {
            const count = activeSponsors.filter((s) => s.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategoryFilter === cat
                    ? 'bg-[#d4af37] text-[#060e1c] font-bold shadow-md shadow-[#d4af37]/20'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Sponsors Display Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSponsors.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-gradient-to-b from-[#0a1a33] to-[#071324] border border-[#d4af37]/20 hover:border-[#d4af37]/60 transition-all shadow-xl hover:shadow-2xl flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Category badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f3e5ab] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                    {item.category}
                  </span>

                  {item.sinceYear && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      Desde {item.sinceYear}
                    </span>
                  )}
                </div>

                {/* Logo Box */}
                <div className="w-full h-32 rounded-2xl bg-white/95 flex items-center justify-center p-4 shadow-inner border border-white/40 overflow-hidden group-hover:scale-[1.02] transition-transform">
                  {item.logoUrl ? (
                    <img
                      src={item.logoUrl}
                      alt={`Logotipo da ${item.name}`}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-widest block">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Espaço para Logotipo da Empresa
                      </span>
                    </div>
                  )}
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-serif">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer / Action Link */}
              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                {item.websiteUrl ? (
                  <a
                    href={item.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#d4af37] hover:text-[#f3e5ab] font-bold transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Visitar Site Oficial</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Parceiro da ACEDEP
                  </span>
                )}

                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Apoiador Verificado
                </span>
              </div>
            </div>
          ))}

          {/* Reserved / Invitation Card for New Sponsors */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0d2244]/60 to-[#071324]/80 border-2 border-dashed border-[#d4af37]/40 flex flex-col justify-between space-y-4 hover:border-[#d4af37] transition-all">
            <div className="space-y-3">
              <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-[10px] font-bold uppercase tracking-wider inline-block">
                Espaço Aberto
              </span>

              <div className="w-full h-32 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center justify-center p-4 text-center">
                <Building2 className="w-8 h-8 text-[#d4af37] mb-1 stroke-1" />
                <span className="text-xs font-bold text-white">
                  O Logotipo da Sua Marca Aqui
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Visibilidade em eventos, site e redes sociais
                </span>
              </div>

              <h3 className="text-base font-bold text-white font-serif">
                Associe sua Empresa ao Paradesporto
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Contribua para o transporte, alimentação e preparação técnica de nadadores paralímpicos. Oferecemos contrapartidas institucionais e presença de marca.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenSupportModal}
              className="w-full py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#b8952b] text-[#060e1c] text-xs font-bold transition-all shadow cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Quero ser Apoiador</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Benefits & How to Support Section */}
        <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#0a182e] via-[#0d213f] to-[#0a182e] border border-white/10 shadow-2xl space-y-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-[#d4af37] uppercase tracking-wider block mb-1">
              Como Sua Empresa Pode Ajudar
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              Modalidades de Apoio & Parceria
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              A ACEDEP é uma entidade sem fins lucrativos comprometida com a transparência e o impacto real na vida de atletas e suas famílias.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-2.5">
              <div className="p-2.5 rounded-xl bg-[#d4af37]/20 text-[#d4af37] w-fit">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">
                Patrocínio Master & Uniformes
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Aplicação do logotipo da empresa em toucas de competição, agasalhos oficiais, banners em eventos e destaque na capa do portal.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-2.5">
              <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 w-fit">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">
                Materiais Esportivos & Viagens
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Auxílio para aquisição de trajes tecnológicos, óculos de natação, cronômetros ou custeio de van e passagens para campeonatos.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-2.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 w-fit">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">
                Apoio Nutricional & Saúde
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Doação de frutas, suplementação alimentar adequada para alta intensidade aquática e parcerias com fisioterapia e psicologia esportiva.
              </p>
            </div>
          </div>
        </section>

        {/* Direct Institutional Contacts Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#091528] border border-[#d4af37]/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="text-lg font-bold text-white font-serif">
              Quer apresentar uma proposta de patrocínio para a ACEDEP?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Nossa presidência e diretoria estão à disposição para agendar uma reunião ou visita aos treinos no Centro Paralímpico Brasileiro.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a
              href="mailto:acedep@hotmail.com?subject=Interesse%20em%20Patroc%C3%ADnio%20-%20ACEDEP"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 border border-white/15"
            >
              <Mail className="w-4 h-4 text-[#d4af37]" />
              <span>acedep@hotmail.com</span>
            </a>

            <a
              href="https://wa.me/5511981047553?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20como%20apoiar%20a%20ACEDEP."
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow"
            >
              <Phone className="w-4 h-4" />
              <span>(11) 98104-7553</span>
            </a>

            <a
              href="https://wa.me/5511988231504?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20como%20apoiar%20a%20ACEDEP."
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center gap-2 shadow"
            >
              <Phone className="w-4 h-4" />
              <span>(11) 98823-1504</span>
            </a>
          </div>
        </div>

      </main>

    </div>
  );
};
