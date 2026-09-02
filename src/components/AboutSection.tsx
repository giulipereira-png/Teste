import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  Waves,
  ChevronLeft,
  ChevronRight,
  Camera,
  MapPin,
  Users,
  ShieldCheck,
  Trophy,
  HeartHandshake
} from 'lucide-react';
import { Logo } from './Logo';
import { usePhotos } from '../context/PhotosContext';

export const AboutSection: React.FC = () => {
  const { photos, openAdminModal, isAdminAuthenticated } = usePhotos();
  
  // Carousel State for authentic photography
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselItems = [
    {
      id: 'about_team',
      title: 'Equipe ACEDEP no Centro Paralímpico Brasileiro',
      caption: 'Nossos nadadores e comissão técnica reunidos à beira da piscina olímpica do CPB (Imigrantes - SP).',
      src: photos['about_team'] || '/IMG_4378.jpeg',
      fallbacks: ['/IMG_4378.jpeg', '/IMG_4378.jpg', 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1200&q=85'],
    },
    {
      id: 'about_team_2',
      title: 'Treinos Técnicos de Nado & Autonomia',
      caption: 'Aperfeiçoamento dos quatro estilos, viradas e saídas de bloco com foco na disciplina e evolução individual.',
      src: photos['about_team_2'] || '/IMG_2382.jpeg',
      fallbacks: ['/IMG_2382.jpeg', '/IMG_2382.jpg', 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80'],
    },
    {
      id: 'about_team_3',
      title: 'Presença e Conquistas em Competições',
      caption: 'Representação do paradesporto paulista no Campeonato Brasileiro CBDI, Campeonato Paulista FAP, escolares, universitários e mais.',
      src: photos['about_team_3'] || '/IMG_5625.jpeg',
      fallbacks: ['/IMG_5625.jpeg', '/IMG_5625.jpg', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80'],
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
    <section id="sobre" className="py-16 sm:py-20 bg-[#08172c] text-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-3">
            <span className="h-[2px] w-6 bg-[#d4af37]" />
            Desde 1990
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Nossa História
          </h2>
          <p className="mt-3 text-base text-slate-300 font-light leading-relaxed">
            Fundada por iniciativa de pais e educadores em 1990, a ACEDEP construiu uma história sólida no paradesporto paulista, oferecendo treinamento esportivo contínuo para pessoas com deficiência intelectual.
          </p>
        </div>

        {/* Asymmetrical Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Large Authentic Photography Showcase (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-[#1e3a5f] shadow-2xl bg-[#060e1c]">
              
              {/* Image Frame */}
              <div className="relative h-[360px] sm:h-[460px] overflow-hidden group">
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

                {/* Historic Badge */}
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-[#060e1c]/90 border border-[#d4af37]/50 backdrop-blur-md flex items-center gap-2 shadow-lg pointer-events-none z-10">
                  <Logo variant="emblem" className="h-6" />
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-[#d4af37]">Trabalho Contínuo</div>
                    <div className="text-[11px] font-bold text-white leading-tight">Desde 1990 em São Paulo</div>
                  </div>
                </div>

                {/* Admin Quick Upload / Edit Button */}
                {isAdminAuthenticated && (
                  <button
                    onClick={() => openAdminModal()}
                    className="absolute top-4 right-4 z-20 px-2.5 py-1.5 rounded-lg bg-[#d4af37] hover:bg-[#b8952b] text-[#060e1c] text-[11px] font-bold shadow-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    title="Alterar esta foto no Painel Administrativo"
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-[#d4af37] text-white hover:text-[#060e1c] border border-white/20 hover:border-[#d4af37] flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer shadow-lg active:scale-90"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleNextSlide}
                  aria-label="Próxima foto"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-[#d4af37] text-white hover:text-[#060e1c] border border-white/20 hover:border-[#d4af37] flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer shadow-lg active:scale-90"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Bottom Caption & Indicators */}
                <div className="absolute bottom-3 left-3 right-3 px-3.5 py-2.5 rounded-xl bg-black/80 border border-white/10 backdrop-blur-md z-10">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-[#f3e5ab] truncate">
                      {activePhoto.title}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {carouselItems.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentSlide(idx)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            idx === currentSlide ? 'w-5 bg-[#d4af37]' : 'w-2 bg-white/40 hover:bg-white/70'
                          }`}
                          aria-label={`Foto ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-200/90 leading-relaxed font-light">
                    {activePhoto.caption}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Narrative & Practical Behaviors (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Story Text */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Como Tudo Começou</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Somos uma organização sem fins lucrativos, que promove a saúde das pessoas com Deficiência Intelectual, apoiando sua inclusão social através do esporte.
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                A ACEDEP nasceu em 1990, quando um grupo de pais viu na natação uma grande oportunidade de cuidar da saúde, fazer novos amigos e incluir seus filhos na sociedade.
              </p>
            </div>

            {/* Short Mission Line */}
            <div className="p-3.5 rounded-xl bg-[#0f2744]/70 border-l-4 border-[#d4af37] border-y border-r border-white/5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#d4af37] block mb-1">
                Nossa Missão
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                Desenvolver o potencial esportivo, a disciplina e a autonomia de nadadores com deficiência intelectual, promovendo sua inclusão social e presença ativa em competições oficiais.
              </p>
            </div>

            {/* Practical Signs & Behaviors (Without description as requested) */}
            <div className="space-y-3 pt-1">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Nossa Prática no Dia a Dia:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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

          </div>

        </div>

      </div>
    </section>
  );
};
