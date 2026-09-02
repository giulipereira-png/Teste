import React from 'react';
import { 
  Trophy, 
  ChevronRight, 
  Waves, 
  ShieldCheck, 
  MapPin,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { Logo } from '../../components/Logo';

interface HeroProps {
  onOpenSupportModal: () => void;
  onOpenContactModal: () => void;
  onOpenEnrollModal: () => void;
}

export const HeroBackup: React.FC<HeroProps> = ({
  onOpenSupportModal,
  onOpenContactModal,
  onOpenEnrollModal,
}) => {
  return (
    <section 
      id="home" 
      className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 overflow-hidden bg-[#0a192f]"
    >
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=2000&q=85"
          alt="Atleta em nado de alta performance nas piscinas da ACEDEP"
          className="w-full h-full object-cover object-center scale-105 transform motion-safe:animate-pulse [animation-duration:12s]"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060e1c]/95 via-[#0a192f]/90 to-[#0a192f]/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] via-transparent to-[#060e1c]/70" />
        <div 
          className="absolute inset-0 opacity-10" 
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, #d4af37 2%, transparent 0%), radial-gradient(circle at 75px 75px, #ffffff 1.5%, transparent 0%)`,
            backgroundSize: '100px 100px',
          }}
        />
      </div>

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#d4af37]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-8 text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-[#d4af37]/40 text-[#f3e5ab] text-xs font-semibold backdrop-blur-md shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#d4af37] animate-ping" />
              <span className="uppercase tracking-widest text-[11px] text-[#d4af37]">
                Associação Cultural Especial Paradesportiva Paulista
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-200">Desde 1990</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
              Apoiando a inclusão social através da{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37]">
                Natação
              </span>
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl font-light text-slate-200 leading-relaxed max-w-3xl">
              Transformando vidas através do paradesporto aquático desde 1990.
            </p>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
              Natação especializada para pessoas com <strong className="text-white font-semibold">Deficiência Intelectual</strong> (Autismo, DI e Síndrome de Down), a partir de <strong className="text-[#f3e5ab] font-semibold">12 anos de idade</strong> e com <strong className="text-white font-semibold">experiência prévia básica na água</strong>, nas piscinas do <strong className="text-white font-semibold">Centro Paralímpico Brasileiro</strong>.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-4">
              <a
                href="#modalidades"
                id="btn-hero-projetos"
                className="group inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-md bg-gradient-to-r from-[#d4af37] via-[#e5c058] to-[#c49e29] text-[#060e1c] font-bold text-sm sm:text-base tracking-wide shadow-xl shadow-[#d4af37]/20 hover:shadow-[#d4af37]/40 transition-all duration-200 active:scale-95"
              >
                <span>Conheça Nossos Projetos</span>
                <ChevronRight className="w-5 h-5 text-[#060e1c] group-hover:translate-x-1 transition-transform" />
              </a>

              <button
                onClick={onOpenContactModal}
                id="btn-hero-contato"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 rounded-md bg-white/5 hover:bg-white/10 text-white font-semibold text-sm sm:text-base border border-slate-600 hover:border-[#d4af37] transition-all duration-200 backdrop-blur-sm cursor-pointer"
              >
                <span>Entre em Contato</span>
              </button>

              <button
                onClick={onOpenEnrollModal}
                id="btn-hero-peneira"
                className="group inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-md bg-[#0e2547] hover:bg-[#153460] text-[#f3e5ab] hover:text-white font-bold text-sm sm:text-base border-2 border-[#d4af37] shadow-lg shadow-black/40 hover:shadow-[#d4af37]/25 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <Waves className="w-5 h-5 text-[#d4af37] group-hover:scale-110 transition-transform" />
                <span>Avaliação de Novos Atletas</span>
              </button>
            </div>

            <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-white/5 border border-white/10 text-[#d4af37]">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">+30 Anos</div>
                  <div className="text-[11px] text-slate-400">História e Dedicação</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-white/5 border border-white/10 text-[#d4af37]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">Centro Paralímpico Brasileiro</div>
                  <div className="text-[11px] text-slate-400">Rodovia dos Imigrantes, km 11,5 - SP</div>
                </div>
              </div>

              <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
                <div className="p-2 rounded bg-white/5 border border-white/10 text-[#d4af37]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">Deficiência Intelectual</div>
                  <div className="text-[11px] text-slate-400">Autismo, DI e Síndrome de Down</div>
                </div>
              </div>
            </div>

          </div>

          <div className="lg:col-span-4 hidden lg:block">
            <div className="relative rounded-2xl bg-gradient-to-b from-[#132f52]/90 to-[#0a192f]/95 border border-[#d4af37]/30 p-6 shadow-2xl backdrop-blur-xl">

              <div className="text-center pb-5 border-b border-white/10">
                <Logo variant="emblem" className="h-24 mx-auto drop-shadow-md mb-2" />
                <h3 className="font-serif text-2xl font-black text-white tracking-wide">
                  ACEDEP
                </h3>
                <p className="text-xs text-[#d4af37] font-semibold tracking-wider uppercase mt-0.5">
                  São Paulo • Brasil • Desde 1990
                </p>
              </div>

              <div className="py-4 space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#d4af37] mt-0.5 shrink-0" />
                  <span><strong>Público-Alvo:</strong> Pessoas com deficiência intelectual (Autismo, DI e Síndrome de Down).</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#d4af37] mt-0.5 shrink-0" />
                  <span><strong>Requisitos:</strong> A partir de 12 anos e com experiência prévia básica em natação.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#d4af37] mt-0.5 shrink-0" />
                  <span><strong>Alto Rendimento:</strong> Atletas das categorias <strong>S14</strong> e <strong>S21 (Síndrome de Down)</strong>.</span>
                </div>
              </div>

              <div className="mt-2 p-3.5 rounded-lg bg-black/40 border border-[#d4af37]/20 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">Quer participar dos testes?</div>
                  <div className="text-xs font-bold text-white">Iniciação & Alto Rendimento</div>
                </div>
                <button
                  onClick={onOpenEnrollModal}
                  className="px-3.5 py-1.5 rounded bg-[#d4af37] text-[#060e1c] text-xs font-bold hover:bg-[#e5c058] transition-colors cursor-pointer"
                >
                  Agendar
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
