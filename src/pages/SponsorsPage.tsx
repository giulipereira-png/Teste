import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  HeartHandshake, 
  Building2, 
  Award, 
  Globe, 
  ExternalLink, 
  Mail, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  Heart,
  ArrowRight
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { SubpageTopBar } from '../components/SubpageTopBar';

interface SponsorsPageProps {
  onBackToHome: () => void;
  onOpenSupportModal: () => void;
  onOpenContactModal: () => void;
  onOpenAdminPortal?: () => void;
}

export const SponsorsPage: React.FC<SponsorsPageProps> = ({
  onBackToHome,
  onOpenSupportModal,
  onOpenContactModal,
  onOpenAdminPortal
}) => {
  const { sponsors } = useCommunity();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const activeSponsors = sponsors.filter((s) => s.isActive);

  return (
    <div className="min-h-screen bg-[#060e1c] text-slate-100 selection:bg-[#d4af37] selection:text-[#060e1c] subpage-top-offset pb-28 md:pb-20">
      
      {/* Top Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <SubpageTopBar currentLabel="Apoiadores & Parceiros" onBackToHome={onBackToHome} />

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
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-white flex items-center gap-2.5">
              <span>Empresas e Parceiros que Fazem Acontecer</span>
              <span className="text-xs font-sans font-semibold text-[#d4af37] bg-[#d4af37]/15 px-2.5 py-0.5 rounded-full border border-[#d4af37]/30">
                {activeSponsors.length}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Gratidão a cada parceiro pelo investimento contínuo na formação e vitórias dos nossos paratletas.
            </p>
          </div>
        </div>

        {/* Sponsors Display Cards - Compact & Elegant Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {activeSponsors.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#0a1a33] to-[#071324] border border-[#d4af37]/20 hover:border-[#d4af37]/60 transition-all shadow-md hover:shadow-xl flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Compact Logo Container */}
                <div className="w-full h-20 rounded-xl bg-white/95 flex items-center justify-center px-4 py-2 shadow-inner border border-white/30 overflow-hidden group-hover:scale-[1.02] transition-transform">
                  {item.logoUrl ? (
                    <img
                      src={item.logoUrl}
                      alt={`Logotipo da ${item.name}`}
                      className="max-h-12 max-w-[140px] object-contain"
                    />
                  ) : (
                    <div className="text-center px-2">
                      <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block truncate">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Parceiro Oficial
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white font-serif leading-snug truncate">
                      {item.name}
                    </h3>
                  </div>

                  {item.sinceYear && (
                    <p className="text-[11px] text-[#d4af37] font-medium mt-0.5">
                      Parceiro desde {item.sinceYear}
                    </p>
                  )}

                  {item.description && (
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer / Action Link */}
              <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-xs">
                {item.websiteUrl ? (
                  <a
                    href={item.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[#d4af37] hover:text-[#f3e5ab] font-bold transition-colors"
                  >
                    <Globe className="w-3 h-3" />
                    <span>Visitar Site</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Apoiador ACEDEP
                  </span>
                )}

                <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verificado
                </span>
              </div>
            </div>
          ))}

          {/* Reserved / Invitation Card for New Sponsors (Compact) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0d2244]/40 to-[#071324]/60 border-2 border-dashed border-[#d4af37]/35 flex flex-col justify-between space-y-3 hover:border-[#d4af37] transition-all">
            <div className="space-y-2.5">
              <div className="w-full h-20 rounded-xl bg-black/40 border border-white/10 flex flex-col items-center justify-center p-2 text-center">
                <Building2 className="w-6 h-6 text-[#d4af37] mb-0.5 stroke-1" />
                <span className="text-xs font-bold text-white leading-tight">
                  Sua Marca Aqui
                </span>
                <span className="text-[10px] text-slate-400">
                  Espaço para Novo Parceiro
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white font-serif">
                  Apoie Nossos Atletas
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Conecte sua empresa ao paradesporto paulista com visibilidade em eventos e site.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenSupportModal}
              className="w-full py-2 rounded-xl bg-[#d4af37] hover:bg-[#b8952b] text-[#060e1c] text-xs font-bold transition-all shadow cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Quero Apoiar</span>
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

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 w-full md:w-auto shrink-0">
            <a
              href="mailto:acedep@hotmail.com?subject=Interesse%20em%20Patroc%C3%ADnio%20-%20ACEDEP"
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-white/15"
            >
              <Mail className="w-4 h-4 text-[#d4af37]" />
              <span>acedep@hotmail.com</span>
            </a>

            <a
              href="https://wa.me/5511981047553?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20como%20apoiar%20a%20ACEDEP."
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow"
            >
              <Phone className="w-4 h-4" />
              <span>(11) 98104-7553</span>
            </a>

            <a
              href="https://wa.me/5511988231504?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20como%20apoiar%20a%20ACEDEP."
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow"
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
