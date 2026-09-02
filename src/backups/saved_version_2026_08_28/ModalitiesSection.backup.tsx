import React from 'react';
import { 
  Trophy, 
  Waves, 
  CheckCircle2, 
  CalendarCheck,
  Info,
  Sparkles,
  MapPin,
  Clock,
  Navigation,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { MODALITIES_DATA, NUCLEOS_DATA } from '../../data/mockData';
import { usePhotos } from '../../context/PhotosContext';

interface ModalitiesSectionProps {
  onOpenEnrollModal: () => void;
}

export const ModalitiesSectionBackup: React.FC<ModalitiesSectionProps> = ({ onOpenEnrollModal }) => {
  const { photos } = usePhotos();
  const defaultFallbackIniciacao = '/IMG_2382.jpeg';
  const defaultFallbackAltoRendimento = '/IMG_5625.jpeg';
  const cpbData = NUCLEOS_DATA[0];

  const candidatePaths: Record<string, string[]> = {
    'natacao-iniciacao': [
      photos['modality_iniciacao'] || '/IMG_2382.jpeg',
      '/IMG_2382.jpeg',
      '/IMG_2382.jpg',
      '/iniciacao_esportiva.jpeg',
      'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80',
    ],
    'natacao-alto-rendimento': [
      photos['modality_alto_rendimento'] || '/IMG_5625.jpeg',
      '/IMG_5625.jpeg',
      '/IMG_5625.jpg',
      '/alto_rendimento.jpeg',
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
    ],
  };

  return (
    <section id="modalidades" className="py-20 bg-[#0a192f] text-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-3">
            <span className="h-[2px] w-6 bg-[#d4af37]" />
            Nossos Programas de Treino
            <span className="h-[2px] w-6 bg-[#d4af37]" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Natação para Deficientes Intelectuais
          </h2>
          <p className="mt-4 text-base text-slate-300 font-light leading-relaxed">
            Atendemos exclusivamente pessoas com <strong className="text-white font-semibold">Deficiência Intelectual</strong> (Autismo, DI e Síndrome de Down), com idade a partir de <strong className="text-[#f3e5ab] font-semibold">12 anos</strong> e que já possuam <strong className="text-white font-semibold">experiência prévia básica na natação</strong>.
          </p>
        </div>

        {/* Clean Criteria & Categories Badge Banner */}
        <div className="mb-10 max-w-4xl mx-auto p-4 rounded-xl bg-[#0f2744]/70 border border-[#d4af37]/40 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2.5 rounded-lg bg-[#d4af37]/20 text-[#d4af37] shrink-0 border border-[#d4af37]/30">
              <Info className="w-5 h-5" />
            </div>
            <div className="text-xs sm:text-sm text-slate-200">
              <strong className="text-white font-semibold block">Requisitos de Entrada:</strong>
              Mínimo de 12 anos e experiência prévia básica (saber flutuar e se locomover na água).
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold text-[#f3e5ab] bg-[#060e1c] px-3 py-1.5 rounded-md border border-[#d4af37]/30">
              Iniciação Esportiva
            </span>
            <span className="text-[11px] font-bold text-white bg-[#060e1c] px-3 py-1.5 rounded-md border border-[#d4af37]/30">
              Alto Rendimento (S14 e S21)
            </span>
          </div>
        </div>

        {/* 2 Modality Cards (Iniciação Esportiva & Alto Rendimento) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {MODALITIES_DATA.map((modality) => {
            const photoKey = modality.id === 'natacao-iniciacao' ? 'modality_iniciacao' : 'modality_alto_rendimento';
            const currentImg = photos[photoKey] || modality.image;

            return (
              <div
                key={modality.id}
                className="flex flex-col justify-between rounded-2xl bg-gradient-to-b from-[#0f2744] to-[#060e1c] border border-[#1e3a5f] overflow-hidden shadow-xl hover:border-[#d4af37]/60 transition-all duration-300 group"
              >
                <div>
                  {/* Modality Image banner */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={currentImg}
                      alt={modality.title}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                        modality.id === 'natacao-alto-rendimento' ? 'object-[center_20%]' : 'object-center'
                      }`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const candidates = candidatePaths[modality.id] || [];
                        const currentSrc = target.getAttribute('src') || '';
                        
                        const currentIndex = candidates.findIndex((c) => currentSrc.endsWith(c));
                        if (currentIndex !== -1 && currentIndex + 1 < candidates.length) {
                          target.src = candidates[currentIndex + 1];
                          return;
                        }

                        if (modality.id === 'natacao-alto-rendimento') {
                          target.src = defaultFallbackAltoRendimento;
                        } else if (modality.id === 'natacao-iniciacao') {
                          target.src = defaultFallbackIniciacao;
                        }
                      }}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f2744] via-black/30 to-transparent pointer-events-none" />

                    <div className="absolute top-3 left-3 px-3 py-1 rounded bg-[#060e1c]/85 border border-[#d4af37]/50 backdrop-blur-md z-10 pointer-events-none">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
                        {modality.category}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 z-10 pointer-events-none">
                      <div className="flex items-center gap-2 text-white font-bold text-lg drop-shadow">
                        <Waves className="w-5 h-5 text-[#d4af37]" />
                        <span>{modality.title}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                      {modality.description}
                    </p>

                    <div className="p-3.5 rounded-lg bg-black/40 border border-white/5 text-xs text-slate-300">
                      <strong className="text-white block mb-0.5 font-semibold">Público-Alvo:</strong>
                      {modality.targetAudience}
                    </div>

                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-bold text-[#d4af37] uppercase tracking-wider block">
                        Diferenciais do Treinamento:
                      </span>
                      {modality.benefits.map((b, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={onOpenEnrollModal}
                    className="w-full py-3 px-4 rounded-lg bg-white/5 hover:bg-[#d4af37] text-slate-200 hover:text-[#060e1c] font-bold text-xs uppercase tracking-wider transition-all duration-200 border border-white/10 hover:border-[#d4af37] flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Agendar Avaliação Aquática</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* COMPACT & DISCREET VISUAL TIMETABLE & LOCATION BAR */}
        <div className="mt-10 max-w-4xl mx-auto rounded-2xl bg-[#08172c]/90 border border-[#1e3a5f] p-4 sm:p-5 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
                <MapPin className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Local & Horários de Treino</span>
                  <span className="hidden sm:inline text-slate-500">•</span>
                  <span className="text-xs font-semibold text-[#f3e5ab]">Centro Paralímpico Brasileiro (CPB)</span>
                </h4>
              </div>
            </div>

            <a
              href={cpbData?.mapUrl || "https://maps.google.com/?q=Centro+Paralimpico+Brasileiro"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#d4af37] hover:text-[#f3e5ab] transition-colors self-start sm:self-auto"
            >
              <span>Rod. dos Imigrantes, km 11,5 - SP</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
              <div className="p-2 rounded-lg bg-[#d4af37]/15 text-[#d4af37] shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Seg, Qua e Sex</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#d4af37]/20 text-[#f3e5ab]">
                    18:00 às 19:30
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  Rendimento & Base • Piscina Olímpica (50m)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
              <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-300 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Ter e Qui</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                    15:00 às 16:30
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  Iniciação & Aperfeiçoamento • Piscina Semiolímpica (25m)
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              Presença e frequência acompanhadas em tempo real pela comissão técnica.
            </span>

            <button
              onClick={onOpenEnrollModal}
              className="text-[11px] font-bold text-[#d4af37] hover:underline cursor-pointer flex items-center gap-1"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Agendar Avaliação Aquática</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
