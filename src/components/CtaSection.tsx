import React from 'react';
import { 
  HeartHandshake, 
  Trophy, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  UserCheck 
} from 'lucide-react';

interface CtaSectionProps {
  onOpenSupportModal: () => void;
  onOpenEnrollModal: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({
  onOpenSupportModal,
  onOpenEnrollModal,
}) => {
  return (
    <section className="py-20 bg-gradient-to-b from-[#0a192f] via-[#060e1c] to-[#0a192f] text-slate-100 relative overflow-hidden border-t border-[#1e3a5f]/80">
      
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#d4af37]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main CTA Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-3">
            <span className="h-[2px] w-6 bg-[#d4af37]" />
            Junte-se à ACEDEP
            <span className="h-[2px] w-6 bg-[#d4af37]" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Faça parte da nossa história ou apoie o nosso projeto
          </h2>
          <p className="mt-4 text-base text-slate-300 font-light leading-relaxed">
            Seja você um atleta em busca de treinos nas piscinas do Centro Paralímpico, uma família ou um apoiador querendo ajudar nossa equipe com patrocínio ou doação.
          </p>
        </div>

        {/* Dual Card Choice: Atletas vs Patrocinadores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Card 1: Para Atletas & Famílias */}
          <div className="rounded-2xl bg-[#0f2744]/90 border border-white/10 p-8 flex flex-col justify-between hover:border-[#d4af37]/60 transition-all duration-300 shadow-xl group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[#d4af37]">
                  <UserCheck className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded bg-white/5 text-[#f3e5ab] border border-white/10">
                  Novos Atletas
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-[#f3e5ab] transition-colors">
                Para Atletas & Famílias
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Deseja integrar a equipe de Natação da ACEDEP nas piscinas do Centro Paralímpico Brasileiro? Agende uma avaliação técnica com nossos especialistas.
              </p>

              <ul className="space-y-2 pt-2">
                <li className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span>Deficiência Intelectual (Autismo, DI e Síndrome de Down)</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span>A partir de 12 anos com experiência prévia básica na natação</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span>Iniciação Esportiva e Alto Rendimento (Classes S14 e S21)</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={onOpenEnrollModal}
                id="btn-cta-atleta"
                className="w-full py-3.5 px-6 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-sm tracking-wide border border-white/20 hover:border-[#d4af37] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-[#d4af37]" />
                <span>Solicitar Avaliação</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: Para Empresas & Patrocinadores */}
          <div className="rounded-2xl bg-gradient-to-b from-[#132f52] to-[#0a192f] border border-[#d4af37]/50 p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            
            {/* Top Badge */}
            <div className="absolute top-0 right-0 bg-[#d4af37] text-[#060e1c] text-[10px] font-extrabold uppercase px-4 py-1 rounded-bl-lg">
              Apoio & Parceria
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white tracking-tight">
                Para Empresas & Apoiadores
              </h3>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                Associe sua marca ou apoie pessoalmente os valores de superação, inclusão e excelência esportiva dos nossos cerca de 35 atletas.
              </p>

              <ul className="space-y-2 pt-2">
                <li className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span><strong>Patrocínio Direto:</strong> Apoio a uniformes, materiais e competições</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span><strong>Doação Institucional Espontânea:</strong> Contribuição direta para a equipe</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span>Mais de 30 anos de trabalho sério, honesto e com contas abertas</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={onOpenSupportModal}
                id="btn-cta-apoiador"
                className="w-full py-3.5 px-6 rounded-lg bg-gradient-to-r from-[#d4af37] via-[#e5c058] to-[#c49e29] text-[#060e1c] font-bold text-sm tracking-wide shadow-lg shadow-[#d4af37]/30 hover:shadow-[#d4af37]/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <HeartHandshake className="w-5 h-5 text-[#060e1c]" />
                <span>Seja um Apoiador / Patrocinador</span>
                <ArrowRight className="w-4 h-4 text-[#060e1c]" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
