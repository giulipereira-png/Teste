import React, { useState } from 'react';
import { 
  Target, 
  Eye, 
  Heart, 
  Award, 
  CheckCircle2, 
  Waves,
  ChevronLeft,
  ChevronRight,
  Camera
} from 'lucide-react';
import { Logo } from '../../components/Logo';
import { usePhotos } from '../../context/PhotosContext';

export const AboutSectionBackup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'missao' | 'visao' | 'valores'>('missao');
  const { photos, openAdminModal, isAdminAuthenticated } = usePhotos();
  
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselItems = [
    {
      id: 'about_team',
      title: 'Equipe ACEDEP Oficial',
      caption: 'Nossa equipe de nadadores reunida no Centro Paralímpico Brasileiro.',
      src: photos['about_team'] || '/IMG_4378.jpeg',
      fallbacks: ['/IMG_4378.jpeg', '/IMG_4378.jpg', 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1200&q=85'],
    },
    {
      id: 'about_team_2',
      title: 'Treinos Técnicos & Piscinas',
      caption: 'Desenvolvimento diário de técnica, resistência e espírito de equipe.',
      src: photos['about_team_2'] || '/IMG_2382.jpeg',
      fallbacks: ['/IMG_2382.jpeg', '/IMG_2382.jpg', 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80'],
    },
    {
      id: 'about_team_3',
      title: 'Pódios, Conquistas & Premiações',
      caption: 'Celebração das vitórias nos campeonatos estaduais e nacionais.',
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

  const pillars = {
    missao: {
      title: 'Nossa Missão',
      icon: <Target className="w-5 h-5 text-[#d4af37]" />,
      text: 'Promover a inclusão dando visibilidade às pessoas com deficiência através do paradesporto, articulando ações sociais e culturais pela qualidade de vida.',
      points: [
        'Inclusão e acolhimento através do esporte',
        'Visibilidade e destaque para nossos atletas',
        'Ações sociais e culturais para melhorar a qualidade de vida',
      ],
    },
    visao: {
      title: 'Nossa Visão',
      icon: <Eye className="w-5 h-5 text-[#d4af37]" />,
      text: 'Ser uma associação de referência, e estar presente em competições Nacionais e Internacionais para pessoas com Deficiência.',
      points: [
        'Referência na natação para pessoas com deficiência',
        'Presença em competições em todo o Brasil e no exterior',
        'Treinos de qualidade e desenvolvimento de cada atleta',
      ],
    },
    valores: {
      title: 'Nossos Valores',
      icon: <Heart className="w-5 h-5 text-[#d4af37]" />,
      text: 'Visibilidade, transparência, respeito e defesa do direito das pessoas com deficiência.',
      points: [
        'Dar visibilidade ao talento e esforço de cada atleta',
        'Transparência e honestidade em tudo o que fazemos',
        'Respeito e carinho por cada atleta e sua família',
        'Defesa firme dos direitos das pessoas com deficiência',
      ],
    },
  };

  return (
    <section id="sobre" className="py-20 bg-[#0a192f] text-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-3">
            <span className="h-[2px] w-6 bg-[#d4af37]" />
            Quem Somos
            <span className="h-[2px] w-6 bg-[#d4af37]" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Transformando Vidas Através da Natação Adaptada
          </h2>
          <p className="mt-4 text-base text-slate-300 font-light leading-relaxed">
            Uma instituição sem fins lucrativos que acolhe, desenvolve a autonomia e potencializa o talento de nadadores com deficiência intelectual dentro e fora das piscinas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="relative rounded-2xl overflow-hidden border border-[#1e3a5f] shadow-2xl bg-[#060e1c]">
              <div className="relative h-[380px] sm:h-[440px] overflow-hidden group">
                <img
                  key={activePhoto.id}
                  src={activePhoto.src}
                  alt={activePhoto.title}
                  className="w-full h-full object-cover object-top sm:object-center transition-all duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const candidates = [
                      ...activePhoto.fallbacks,
                      '/IMG_4378.jpeg',
                      '/IMG_2382.jpeg',
                      '/IMG_5625.jpeg',
                      'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1200&q=85',
                    ];
                    const currentSrc = target.getAttribute('src') || '';
                    const currentIndex = candidates.findIndex((c) => currentSrc.endsWith(c));
                    if (currentIndex !== -1 && currentIndex + 1 < candidates.length) {
                      target.src = candidates[currentIndex + 1];
                    } else if (!currentSrc.includes('unsplash.com')) {
                      target.src = 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1200&q=85';
                    }
                  }}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-[#060e1c]/90 border border-[#d4af37]/50 backdrop-blur-md flex items-center gap-2 shadow-lg pointer-events-none z-10">
                  <Logo variant="emblem" className="h-7" />
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-[#d4af37]">Desde 1990</div>
                    <div className="text-[11px] font-bold text-white leading-tight">Natação Paradesportiva</div>
                  </div>
                </div>

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

                <div className="absolute bottom-3 left-3 right-3 px-3.5 py-2.5 rounded-xl bg-black/75 border border-white/10 backdrop-blur-md transition-all duration-300 z-10">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#f3e5ab]">
                      <Award className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                      <span>Equipe ACEDEP • Garra, foco e determinação nas piscinas.</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {carouselItems.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentSlide(idx)}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            idx === currentSlide ? 'w-5 bg-[#d4af37]' : 'w-2 bg-white/40 hover:bg-white/70'
                          }`}
                          aria-label={`Foto ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-200/90 leading-relaxed mt-1 font-light">
                    Nossa equipe de cerca de 35 atletas com deficiência intelectual participa ativamente de Campeonatos Regionais, Nacionais e Internacionais.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg bg-[#0f2744]/60 border border-white/5 text-center">
                <div className="text-xl font-extrabold text-[#d4af37] font-serif">1990</div>
                <div className="text-[11px] text-slate-300 font-medium">Ano de Fundação</div>
              </div>
              <div className="p-3.5 rounded-lg bg-[#0f2744]/60 border border-white/5 text-center">
                <div className="text-xl font-extrabold text-white font-serif">~35</div>
                <div className="text-[11px] text-slate-300 font-medium">Atletas na Equipe</div>
              </div>
              <div className="p-3.5 rounded-lg bg-[#0f2744]/60 border border-white/5 text-center">
                <div className="text-xl font-extrabold text-[#d4af37] font-serif">12+</div>
                <div className="text-[11px] text-slate-300 font-medium">Idade Mínima (anos)</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Nossa História
              </h3>
              <p className="text-sm text-slate-200 font-medium leading-relaxed">
                Somos uma organização sem fins lucrativos, que promove a saúde das pessoas com Deficiência Intelectual, apoiando sua inclusão social através do esporte.
              </p>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                A ACEDEP nasceu em 1990, quando um grupo de pais viu na natação uma grande oportunidade de cuidar da saúde, fazer novos amigos e incluir seus filhos na sociedade.
              </p>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Nosso objetivo é acolher, treinar e desenvolver atletas de natação, preparando a equipe para participar com alegria e dedicação de competições regionais, estaduais, nacionais e internacionais.
              </p>
            </div>

            <div className="pt-2">
              <div className="flex border-b border-white/10 gap-2 mb-4">
                {(['missao', 'visao', 'valores'] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`pb-3 px-4 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 border-b-2 flex items-center gap-2 cursor-pointer ${
                      activeTab === key
                        ? 'border-[#d4af37] text-[#d4af37] bg-white/5 rounded-t-md'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {pillars[key].icon}
                    <span>{pillars[key].title}</span>
                  </button>
                ))}
              </div>

              <div className="p-6 rounded-xl bg-[#0f2744]/70 border border-white/10 shadow-lg min-h-[210px] flex flex-col justify-between">
                <div>
                  <p className="text-sm text-slate-200 leading-relaxed font-normal mb-4">
                    {pillars[activeTab].text}
                  </p>
                  <ul className="space-y-2">
                    {pillars[activeTab].points.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
