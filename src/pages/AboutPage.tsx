import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Waves, 
  Trophy, 
  HeartHandshake, 
  Users, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  MapPin, 
  Calendar,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { usePhotos } from '../context/PhotosContext';

interface AboutPageProps {
  onBackToHome: () => void;
  onOpenEnrollModal: () => void;
  onOpenSupportModal: () => void;
  onNavigateToPage?: (page: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onBackToHome,
  onOpenEnrollModal,
  onOpenSupportModal,
  onNavigateToPage,
}) => {
  const { photos, openAdminModal, isAdminAuthenticated } = usePhotos();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const carouselItems = [
    {
      id: 'about_team',
      title: 'Equipe ACEDEP no Centro Paralímpico Brasileiro',
      caption: 'Nossos nadadores e comissão técnica reunidos à beira da piscina olímpica do CPB (Imigrantes - SP).',
      src: photos['about_team'] || '/IMG_4378.jpeg',
      fallbacks: ['/IMG_4378.jpeg', 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1200&q=85'],
    },
    {
      id: 'about_team_2',
      title: 'Treinos Técnicos de Nado & Autonomia',
      caption: 'Aperfeiçoamento dos quatro estilos, viradas e saídas de bloco com foco na disciplina e evolução individual.',
      src: photos['about_team_2'] || 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1200&q=80',
      fallbacks: ['https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1200&q=80', '/IMG_4378.jpeg'],
    },
    {
      id: 'about_team_3',
      title: 'Presença e Conquistas em Competições',
      caption: 'Representação do paradesporto paulista no Campeonato Brasileiro CBDI, Campeonato Paulista FAP, escolares, universitários e mais.',
      src: photos['about_team_3'] || 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80',
      fallbacks: ['https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80', '/IMG_4378.jpeg'],
    },
  ];

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? carouselItems.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === carouselItems.length - 1 ? 0 : prev + 1));
  };

  const activePhoto = carouselItems[currentSlide];

  const practicalBehaviors = [
    {
      title: 'Acolhimento de atletas e famílias',
      desc: 'Convivência acolhedora e integração direta com pais e responsáveis na rotina de treinos e viagens.',
    },
    {
      title: 'Treinamento com disciplina e continuidade',
      desc: 'Presença semanal regular nas raias do CPB, desenvolvendo técnica, fôlego e autonomia aquática.',
    },
    {
      title: 'Participação em competições',
      desc: 'Incentivo à participação no Campeonato Brasileiro CBDI, Campeonato Paulista FAP, escolares, universitários e mais.',
    },
    {
      title: 'Transparência com apoiadores',
      desc: 'Prestação de contas clara para famílias, voluntários e empresas parceiras que viabilizam o projeto.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#060e1c] text-slate-100 selection:bg-[#d4af37] selection:text-[#060e1c] pt-24 pb-20">
      
      {/* Header & Breadcrumb */}
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
            <span className="text-[#d4af37] font-medium">Sobre Nós</span>
          </div>
        </div>

        {/* Header Title */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>Associação Fundada em 1990 • São Paulo - SP</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Nossa História
          </h1>
          <p className="mt-3 text-base text-slate-300 font-light leading-relaxed">
            Conheça as raízes, os propósitos e o compromisso diário da ACEDEP com a natação paralímpica e o desenvolvimento de pessoas com deficiência intelectual.
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Photo Showcase & Gallery (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-[#1e3a5f] shadow-2xl bg-[#060e1c]">
              
              <div className="relative h-[360px] sm:h-[480px] overflow-hidden group">
                <img
                  key={activePhoto.id}
                  src={activePhoto.src}
                  alt={activePhoto.title}
                  className="w-full h-full object-cover object-center transition-all duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const candidates = [
                      ...activePhoto.fallbacks,
                      '/IMG_4378.jpeg',
                      '/IMG_2382.jpeg',
                      '/IMG_5625.jpeg',
                    ];
                    const currentSrc = target.getAttribute('src') || '';
                    const currentIndex = candidates.findIndex((c) => currentSrc.endsWith(c));
                    if (currentIndex !== -1 && currentIndex + 1 < candidates.length) {
                      target.src = candidates[currentIndex + 1];
                    }
                  }}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-[#060e1c]/90 border border-[#d4af37]/50 backdrop-blur-md flex items-center gap-2 shadow-lg pointer-events-none z-10">
                  <Logo variant="emblem" className="h-6" />
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-[#d4af37]">Trabalho Contínuo</div>
                    <div className="text-[11px] font-bold text-white leading-tight">Desde 1990 em São Paulo</div>
                  </div>
                </div>

                {isAdminAuthenticated && (
                  <button
                    onClick={() => openAdminModal()}
                    className="absolute top-4 right-4 z-20 px-2.5 py-1.5 rounded-lg bg-[#d4af37] hover:bg-[#b8952b] text-[#060e1c] text-[11px] font-bold shadow-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    title="Alterar fotos no Painel Administrativo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Gerenciar Fotos</span>
                  </button>
                )}

                {/* Carousel Controls */}
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  aria-label="Foto anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-[#d4af37] text-white hover:text-[#060e1c] border border-white/20 hover:border-[#d4af37] flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer shadow-lg active:scale-90"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleNextSlide}
                  aria-label="Próxima foto"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-[#d4af37] text-white hover:text-[#060e1c] border border-white/20 hover:border-[#d4af37] flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer shadow-lg active:scale-90"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Bottom Caption Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#060e1c] via-[#060e1c]/80 to-transparent">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded border border-[#d4af37]/30">
                      Registro {currentSlide + 1} de {carouselItems.length}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                    {activePhoto.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 font-light leading-relaxed">
                    {activePhoto.caption}
                  </p>
                </div>
              </div>

              {/* Slide Indicators */}
              <div className="p-3 bg-[#0a192f] border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {carouselItems.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        currentSlide === idx ? 'w-8 bg-[#d4af37]' : 'w-2 bg-white/20 hover:bg-white/40'
                      }`}
                      aria-label={`Ver foto ${idx + 1}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Polo CPB • São Paulo - SP</span>
                </div>
              </div>
            </div>

            {/* Quick Action buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={onOpenEnrollModal}
                className="flex-1 min-w-[200px] px-4 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8952b] text-[#060e1c] font-bold text-xs sm:text-sm shadow-lg hover:shadow-[#d4af37]/20 transition-all hover:scale-[1.01] active:scale-95 text-center cursor-pointer"
              >
                Solicitar Avaliação de Natação
              </button>
              <button
                onClick={onOpenSupportModal}
                className="flex-1 min-w-[200px] px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs sm:text-sm border border-white/10 transition-all text-center cursor-pointer"
              >
                Apoiar a Associação
              </button>
            </div>
          </div>

          {/* Right Column: Editorial Narrative & Practical Behaviors (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Como tudo começou */}
            <div className="p-6 rounded-2xl bg-[#0c1f38] border border-[#1e3a5f] shadow-lg space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#d4af37]" />
                <span>Como Tudo Começou</span>
              </h2>
              
              <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
                <p>
                  Somos uma organização sem fins lucrativos, que promove a saúde das pessoas com Deficiência Intelectual, apoiando sua inclusão social através do esporte.
                </p>
                <p>
                  A ACEDEP nasceu em 1990, quando um grupo de pais viu na natação uma grande oportunidade de cuidar da saúde, fazer novos amigos e incluir seus filhos na sociedade.
                </p>
                <p>
                  Hoje, nossos atletas treinam semanalmente nas dependências do <strong className="text-white">Centro Paralímpico Brasileiro</strong>, disputando o Campeonato Brasileiro CBDI, Campeonato Paulista FAP, escolares, universitários e mais.
                </p>
              </div>
            </div>

            {/* Nossa Prática no Dia a Dia */}
            <div className="p-6 rounded-2xl bg-[#0c1f38] border border-[#1e3a5f] shadow-lg space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#d4af37]" />
                <span>Nossa Prática no Dia a Dia</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {practicalBehaviors.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-3 rounded-xl bg-black/30 border border-white/5 hover:border-[#d4af37]/30 transition-colors flex items-center gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0" />
                    <span className="text-xs font-bold text-white">
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Missão e Propósito */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0e2747] to-[#08172c] border border-[#d4af37]/30 shadow-lg space-y-3">
              <h3 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
                <HeartHandshake className="w-4 h-4" />
                <span>Nosso Compromisso</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
                Manter as portas sempre abertas para novos talentos, incentivar a independência dos nadadores e acolher cada família com dignidade, compromisso e seriedade.
              </p>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
