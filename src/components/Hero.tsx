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
import { Logo } from './Logo';

interface HeroProps {
  onOpenSupportModal: () => void;
  onOpenContactModal: () => void;
  onOpenEnrollModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenSupportModal,
  onOpenContactModal,
  onOpenEnrollModal,
}) => {
  return (
    <section 
      id="home" 
      className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 overflow-hidden bg-[#0a192f]"
    >
      {/* Background Image with Darkened Cinematic Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=2000&q=85"
          alt="Atleta em nado de alta performance nas piscinas da ACEDEP"
          className="w-full h-full object-cover object-center scale-105 transform motion-safe:animate-pulse [animation-duration:12s]"
          loading="eager"
        />
        {/* Layered Rich Gradients to ensure exceptional legibility and deep athletic mood */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#060e1c]/95 via-[#0a192f]/90 to-[#0a192f]/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] via-transparent to-[#060e1c]/70" />
        {/* Subtle geometric grid background */}
        <div 
          className="absolute inset-0 opacity-10" 
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, #d4af37 2%, transparent 0%), radial-gradient(circle at 75px 75px, #ffffff 1.5%, transparent 0%)`,
            backgroundSize: '100px 100px',
          }}
        />
      </div>

      {/* Decorative Gold Light Beam Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#d4af37]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Main Institutional Copy */}
          <div className="lg:col-span-8 text-left space-y-6">
            
            {/* Top Eyebrow Tag / Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-[#d4af37]/40 text-[#f3e5ab] text-xs font-semibold backdrop-blur-md shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#d4af37] animate-ping" />
              <span className="uppercase tracking-widest text-[11px] text-[#d4af37]">
                Associação Cultural Especial Paradesportiva Paulista
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-200">Desde 1990</span>
            </div>

            {/* Main Punchy Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
              Apoiando a inclusão social através da{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37]">
                Natação
              </span>
            </h1>

            {/* Subtitle - Concrete and Verifiable */}
            <p className="text-lg sm:text-xl lg:text-2xl font-light text-slate-200 leading-relaxed max-w-3xl">
              Treinamento, acolhimento e competição para atletas com deficiência intelectual desde 1990.
            </p>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
              Atendemos nadadores a partir de <strong className="text-[#f3e5ab] font-semibold">12 anos</strong> com diagnóstico de <strong className="text-white font-semibold">Deficiência Intelectual</strong> (Autismo, DI e Síndrome de Down — classes <strong className="text-white font-semibold">S14 e S21</strong>) com vivência prévia na água, em treinos no <strong className="text-white font-semibold">Centro Paralímpico Brasileiro</strong>.
            </p>

            {/* CTA Buttons */}
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

          </div>

          {/* Right Column: Concrete Data Card */}
          <div className="lg:col-span-4 hidden lg:block">
            <div className="relative rounded-2xl bg-gradient-to-b from-[#132f52]/90 to-[#0a192f]/95 border border-[#d4af37]/30 p-6 shadow-2xl backdrop-blur-xl">

              <div className="text-center pb-4 border-b border-white/10">
                <Logo variant="emblem" className="h-20 mx-auto drop-shadow-md mb-2" />
                <h3 className="font-serif text-2xl font-black text-white tracking-wide">
                  ACEDEP
                </h3>
                <p className="text-[11px] text-[#d4af37] font-semibold tracking-wider uppercase">
                  São Paulo • Desde 1990
                </p>
              </div>

              <div className="py-3.5 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37] mt-0.5 shrink-0" />
                  <span><strong>Quem pode participar:</strong> Nadadores com deficiência intelectual (S14 e S21) a partir de 12 anos.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37] mt-0.5 shrink-0" />
                  <span><strong>Como funciona o teste:</strong> Avaliação técnica de 25m na piscina do CPB para verificar autonomia aquática.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37] mt-0.5 shrink-0" />
                  <span><strong>Competições disputadas:</strong> Campeonato Brasileiro CBDI, Campeonato Paulista FAP, escolares, universitários e mais.</span>
                </div>
              </div>

              <div className="mt-2 p-3 rounded-lg bg-black/40 border border-[#d4af37]/20 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">Quer agendar o teste?</div>
                  <div className="text-xs font-bold text-white">Iniciação & Alto Rendimento</div>
                </div>
                <button
                  onClick={onOpenEnrollModal}
                  className="px-3 py-1.5 rounded bg-[#d4af37] text-[#060e1c] text-xs font-bold hover:bg-[#e5c058] transition-colors cursor-pointer"
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
