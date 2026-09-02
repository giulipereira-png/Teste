import React from 'react';
import { 
  MapPin, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  Waves, 
  Navigation,
  CalendarCheck,
  Award,
  Sparkles
} from 'lucide-react';
import { NUCLEOS_DATA } from '../data/mockData';

interface NucleosSectionProps {
  onOpenEnrollModal: () => void;
}

export const NucleosSection: React.FC<NucleosSectionProps> = ({ onOpenEnrollModal }) => {
  const cpbNucleo = NUCLEOS_DATA[0];

  return (
    <section id="nucleos" className="py-20 bg-[#060e1c] text-slate-100 relative border-t border-[#1e3a5f]/80">
      
      {/* Background Subtle Ambience */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#102544]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-3">
            <span className="h-[2px] w-6 bg-[#d4af37]" />
            Nosso Núcleo de Treinamento em São Paulo
            <span className="h-[2px] w-6 bg-[#d4af37]" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Centro Paralímpico Brasileiro
          </h2>
          <p className="mt-4 text-base text-slate-300 font-light leading-relaxed">
            Nossa atuação concentra-se integralmente na cidade de São Paulo, utilizando a infraestrutura de padrão internacional do <strong className="text-white font-semibold">Centro Paralímpico Brasileiro</strong> para atender tanto a <strong className="text-[#d4af37] font-semibold">Iniciação Esportiva</strong> quanto o <strong className="text-[#d4af37] font-semibold">Alto Rendimento</strong>.
          </p>
        </div>

        {/* Highlighted Banner for Modalities inside CPB */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="p-5 rounded-xl bg-[#0f2744]/80 border border-[#d4af37]/40 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-[#d4af37]/20 text-[#d4af37] shrink-0 border border-[#d4af37]/30">
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#d4af37]">Treinamento de Base</span>
              <h3 className="text-base font-bold text-white">Iniciação Esportiva</h3>
              <p className="text-xs text-slate-300">Aprimoramento motor, correção de nados e ganho de resistência.</p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#0f2744]/80 border border-[#d4af37]/40 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-[#d4af37]/20 text-[#d4af37] shrink-0 border border-[#d4af37]/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#d4af37]">Equipe Competitiva</span>
              <h3 className="text-base font-bold text-white">Natação de Alto Rendimento</h3>
              <p className="text-xs text-slate-300">Treinamento intensivo para Campeonatos Brasileiros e torneios oficiais.</p>
            </div>
          </div>
        </div>

        {/* CPB Detailed Showcase Box */}
        <div className="rounded-2xl bg-gradient-to-b from-[#0f2744] to-[#0a192f] border border-[#1e3a5f] overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            
            {/* Left Image & Map Trigger */}
            <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-[500px]">
              <img
                src={cpbNucleo.image}
                alt="Piscinas do Centro Paralímpico Brasileiro"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] via-[#0a192f]/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#0f2744]" />
              
              {/* Badge on Image */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-md bg-[#060e1c]/85 border border-[#d4af37]/50 backdrop-blur-md">
                <span className="text-xs font-bold text-[#d4af37] tracking-wider uppercase">
                  {cpbNucleo.type}
                </span>
              </div>

              {/* Bottom Quick Directions Trigger */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-lg bg-[#060e1c]/90 border border-white/10 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <MapPin className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span className="truncate">{cpbNucleo.address}</span>
                </div>
                <a
                  href={cpbNucleo.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#d4af37] text-[#060e1c] text-xs font-bold rounded hover:bg-[#f3e5ab] transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <span>Ver Rota</span>
                  <Navigation className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Right Information Details */}
            <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#d4af37] tracking-widest uppercase">
                  <Waves className="w-4 h-4" />
                  <span>Uso Exclusivo do Espaço das Piscinas</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {cpbNucleo.fullName}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                  {cpbNucleo.description}
                </p>

                {/* Highlights List */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Destaques da Estrutura Aquática:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {cpbNucleo.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modalities at CPB */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Foco dos Treinos Aquáticos:
                  </h4>
                  <div className="space-y-1.5">
                    {cpbNucleo.modalities.map((mod, i) => (
                      <div
                        key={i}
                        className="px-3.5 py-2 rounded-md bg-white/5 border border-white/10 text-xs font-medium text-slate-200 flex items-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>{mod}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Schedule info */}
                <div className="p-4 rounded-xl bg-black/40 border border-[#d4af37]/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-[#d4af37]" />
                    <span>Dias e Horários Oficiais de Treino</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-[#f3e5ab] font-bold block">Segunda, Quarta e Sexta</span>
                      <span className="text-white text-sm font-semibold">18:00 às 19:30</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-[#f3e5ab] font-bold block">Terça e Quinta</span>
                      <span className="text-white text-sm font-semibold">15:00 às 16:30</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-4">
                <button
                  onClick={onOpenEnrollModal}
                  className="px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#c49e29] text-[#060e1c] text-sm font-bold rounded-md hover:shadow-lg hover:shadow-[#d4af37]/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Agendar Avaliação Aquática</span>
                </button>

                <a
                  href={cpbNucleo.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-semibold rounded-md border border-white/10 transition-colors flex items-center gap-2"
                >
                  <span>Abrir no Google Maps</span>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>
              </div>

            </div>

          </div>
        </div>

        {/* Note about pool space */}
        <div className="mt-8 max-w-3xl mx-auto p-4 rounded-xl bg-[#0a192f] border border-[#1e3a5f] text-center text-xs text-slate-400">
          <p>
            <strong className="text-slate-200">Aviso Institucional:</strong> A ACEDEP utiliza o espaço das piscinas do Centro Paralímpico Brasileiro para seus treinamentos aquáticos técnicos. As avaliações de novos atletas com deficiência intelectual ocorrem mediante agendamento prévio com a comissão técnica.
          </p>
        </div>

      </div>
    </section>
  );
};
