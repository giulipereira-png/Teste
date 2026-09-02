import React from 'react';
import { Award, Users, MapPin, Trophy, Shield, Waves, ArrowUpRight } from 'lucide-react';
import { IMPACT_STATS } from '../data/mockData';

interface StatsImpactProps {
  onOpenNucleos: () => void;
}

export const StatsImpact: React.FC<StatsImpactProps> = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Award':
        return <Award className="w-6 h-6 text-[#d4af37]" />;
      case 'Users':
        return <Users className="w-6 h-6 text-[#d4af37]" />;
      case 'MapPin':
        return <MapPin className="w-6 h-6 text-[#d4af37]" />;
      case 'Trophy':
        return <Trophy className="w-6 h-6 text-[#d4af37]" />;
      case 'Waves':
        return <Waves className="w-6 h-6 text-[#d4af37]" />;
      default:
        return <Shield className="w-6 h-6 text-[#d4af37]" />;
    }
  };

  return (
    <section id="impacto" className="relative py-16 bg-[#060e1c] border-y border-[#1e3a5f]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-2">
              <span className="h-[2px] w-6 bg-[#d4af37]" />
              Excelência & Conquistas
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Pilares do Nosso Trabalho nas Piscinas
            </h2>
          </div>
          <p className="text-sm text-slate-300 max-w-md font-light">
            Metodologia técnica adaptada que desenvolve a autonomia, aprimora os nados e conduz nossos atletas com segurança até as principais competições oficiais.
          </p>
        </div>

        {/* 4 Impact Stat / Pillars Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {IMPACT_STATS.map((stat) => (
            <div
              key={stat.id}
              id={`stat-card-${stat.id}`}
              className="relative group p-6 rounded-2xl bg-gradient-to-b from-[#0f2744]/80 to-[#0a192f]/95 border border-white/10 hover:border-[#d4af37]/60 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl hover:shadow-[#d4af37]/5 flex flex-col justify-between"
            >
              <div>
                {/* Top Accent Line */}
                <div className="h-1 w-10 bg-[#d4af37] rounded-full mb-5 group-hover:w-16 transition-all duration-300" />
                
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-[#d4af37]/15 group-hover:border-[#d4af37]/40 transition-colors">
                    {getIcon(stat.iconName)}
                  </div>
                  {stat.number && (
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif group-hover:text-[#f3e5ab] transition-colors">
                      {stat.number}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white mb-2 tracking-wide font-serif">
                  {stat.label}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {stat.description}
                </p>
              </div>

              {stat.id === 'polo' && (
                <a
                  href="#modalidades"
                  className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#d4af37] hover:text-[#f3e5ab] transition-colors"
                >
                  <span>Conhecer Nossos Treinos</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
