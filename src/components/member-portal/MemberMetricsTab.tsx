import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Award, 
  Trophy, 
  Calendar, 
  Layers, 
  Sparkles,
  ChevronRight,
  Filter,
  Flame,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  FileDown
} from 'lucide-react';
import { AthleteRecord, SwimmingStroke } from '../../types';
import { groupAndRankMetrics, STROKE_OPTIONS, RankedMetric } from '../../utils/swimmingMetricsHelper';
import { exportReport } from '../../utils/exportReportsHelper';

interface MemberMetricsTabProps {
  athlete: AthleteRecord;
}

export const MemberMetricsTab: React.FC<MemberMetricsTabProps> = ({ athlete }) => {
  const [selectedStrokeFilter, setSelectedStrokeFilter] = useState<string>('all');

  const { byStroke, allEventGroups, totalRecordsCount } = useMemo(() => {
    return groupAndRankMetrics(athlete.swimmingMetrics || []);
  }, [athlete.swimmingMetrics]);

  const filteredGroups = useMemo(() => {
    if (selectedStrokeFilter === 'all') {
      return allEventGroups;
    }
    return byStroke[selectedStrokeFilter as SwimmingStroke] || [];
  }, [selectedStrokeFilter, allEventGroups, byStroke]);

  // Total unique personal records (RPs)
  const personalRecordsCount = allEventGroups.length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0a192f] via-[#0d233e] to-[#0a192f] border border-[#1e3a5f] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
                <Trophy className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white font-serif flex items-center gap-2">
                  <span>Recordes Pessoais (RP) & Ranking por Prova</span>
                </h4>
                <p className="text-xs text-slate-300">
                  Melhores marcas oficiais de {athlete.name} organizadas por estilo, prova, campeonato e ano.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="px-3.5 py-2 rounded-2xl bg-black/40 border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Provas com RP</span>
              <span className="text-base font-bold text-[#f3e5ab] font-mono">{personalRecordsCount}</span>
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-black/40 border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Total de Marcas</span>
              <span className="text-base font-bold text-cyan-400 font-mono">{totalRecordsCount}</span>
            </div>

            <div className="flex items-center gap-1.5 ml-1">
              <button
                type="button"
                onClick={() => {
                  exportReport({
                    reportType: 'athlete_individual',
                    format: 'pdf',
                    athletes: [athlete],
                    selectedAthleteId: athlete.id,
                  });
                }}
                className="px-3 py-2 rounded-xl bg-[#d4af37]/20 hover:bg-[#d4af37] text-[#f3e5ab] hover:text-[#060e1c] border border-[#d4af37]/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Baixar Relatório Completo de Tempos & RP em PDF"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  exportReport({
                    reportType: 'athlete_individual',
                    format: 'word',
                    athletes: [athlete],
                    selectedAthleteId: athlete.id,
                  });
                }}
                className="px-3 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white border border-blue-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Baixar Relatório de Tempos & RP em Word (.doc)"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Word</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stroke Navigation Filter Pills */}
        <div className="pt-2 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-white/5">
          <button
            type="button"
            onClick={() => setSelectedStrokeFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              selectedStrokeFilter === 'all'
                ? 'bg-[#d4af37] text-[#060e1c] shadow-lg shadow-[#d4af37]/20 font-black'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Todos os Estilos ({totalRecordsCount})</span>
          </button>

          {STROKE_OPTIONS.map((stroke) => {
            const count = byStroke[stroke]?.reduce((acc, g) => acc + g.allMetrics.length, 0) || 0;
            return (
              <button
                key={stroke}
                type="button"
                onClick={() => setSelectedStrokeFilter(stroke)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  selectedStrokeFilter === stroke
                    ? 'bg-[#d4af37] text-[#060e1c] shadow-lg shadow-[#d4af37]/20 font-black'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                <span>{stroke === 'Livre' ? '🏊' : stroke === 'Costas' ? '🌊' : stroke === 'Peito' ? '🏊‍♂️' : stroke === 'Borboleta' ? '🦋' : '🏅'}</span>
                <span>{stroke}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedStrokeFilter === stroke ? 'bg-black/30 text-black' : 'bg-white/10 text-slate-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content: Grouped by Event / Style with Ranking */}
      {filteredGroups.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#0a192f] border border-[#1e3a5f] text-center space-y-3 shadow-lg">
          <TrendingUp className="w-10 h-10 mx-auto text-slate-600" />
          <h5 className="text-sm font-bold text-white">Nenhum registro encontrado</h5>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Não há cronometragens ou recordes cadastrados para o filtro selecionado. Os tempos oficiais serão lançados pelo técnico após cada competição.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredGroups.map((group) => {
            const best = group.bestMetric;
            const otherMarks = group.allMetrics.filter((m) => m.id !== best.id);

            return (
              <div
                key={group.event}
                className="p-6 rounded-3xl bg-[#0a192f] border border-[#1e3a5f] hover:border-[#d4af37]/40 transition-all space-y-4 shadow-xl"
              >
                {/* Event Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold text-sm">
                      {group.stroke === 'Livre' ? 'CR' : group.stroke === 'Costas' ? 'CO' : group.stroke === 'Peito' ? 'PE' : group.stroke === 'Borboleta' ? 'BO' : 'ME'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-base font-bold text-white font-serif">{group.event}</h5>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-medium">
                          Nado {group.stroke}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {group.allMetrics.length} {group.allMetrics.length === 1 ? 'marca registrada' : 'marcas registradas no histórico'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#f3e5ab] text-xs font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>RP Oficial: {best.bestTime}</span>
                    </span>
                  </div>
                </div>

                {/* Ranking Card: Best Time (🥇 #1 Ouro / Recorde Pessoal) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#14233c] to-[#0c1a2e] border-2 border-[#d4af37]/60 shadow-lg relative overflow-hidden space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#b8952b] text-[#060e1c] flex items-center justify-center font-black text-lg shadow-md shrink-0">
                        🥇
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold text-[#f3e5ab] uppercase tracking-wider bg-[#d4af37]/20 px-2 py-0.5 rounded-md border border-[#d4af37]/40">
                            ⭐ Melhor Marca Histórica (Recorde Pessoal - RP)
                          </span>
                          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                            Piscina {best.laneType}
                          </span>
                        </div>
                        <h6 className="text-xl sm:text-2xl font-mono font-black text-white mt-1">
                          {best.bestTime}
                        </h6>
                      </div>
                    </div>

                    {/* Stage & Year Details */}
                    <div className="text-left sm:text-right space-y-1">
                      <div className="flex items-center sm:justify-end gap-1.5 text-xs text-[#f3e5ab] font-bold">
                        <Trophy className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>{best.stageName}</span>
                      </div>
                      <div className="flex items-center sm:justify-end gap-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>Ano {best.year || best.dateRecorded?.split('/')[2] || '2026'} ({best.dateRecorded})</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Evolution / Time Difference Note */}
                  {(best.evolution || best.comparedToChampionship || best.previousTime) && (
                    <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <ArrowDownRight className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-bold">
                          {best.evolution || 'Evolução expressiva com novo recorde pessoal'}
                        </span>
                      </div>

                      {best.comparedToChampionship && (
                        <div className="text-[11px] text-slate-300 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
                          <span className="text-slate-400">Diferença vs anterior: </span>
                          <span className="text-white font-medium">{best.comparedToChampionship}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Secondary Marks / Other Championships History (Ranking #2, #3...) */}
                {otherMarks.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Histórico em Outros Campeonatos & Anos:
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {otherMarks.map((mark) => (
                        <div
                          key={mark.id}
                          className="p-3.5 rounded-2xl bg-black/40 border border-white/5 hover:border-white/15 transition-all flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-slate-300 text-xs">
                              {mark.rank === 2 ? '🥈' : mark.rank === 3 ? '🥉' : `#${mark.rank}`}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-white text-sm">{mark.bestTime}</span>
                                {mark.differenceFromBest && (
                                  <span className="text-[10px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded font-mono">
                                    {mark.differenceFromBest} vs RP
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                                {mark.stageName} • {mark.year || mark.dateRecorded?.split('/')[2] || '2025'}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[10px] text-slate-500 block">Piscina {mark.laneType}</span>
                            <span className="text-[10px] text-slate-400">{mark.dateRecorded}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
