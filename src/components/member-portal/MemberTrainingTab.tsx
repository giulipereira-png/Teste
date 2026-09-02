import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Calendar as CalendarIcon, 
  Trophy, 
  Waves, 
  Filter, 
  Lock,
  UserCheck,
  TrendingUp,
  FileDown,
  Printer
} from 'lucide-react';
import { AthleteRecord, AttendanceSession } from '../../types';
import { useCommunity } from '../../context/CommunityContext';
import { exportReport } from '../../utils/exportReportsHelper';

interface MemberTrainingTabProps {
  athlete: AthleteRecord;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const MemberTrainingTab: React.FC<MemberTrainingTabProps> = ({ athlete }) => {
  const { attendanceSessions, getAthleteAttendanceStats } = useCommunity();
  const [filterType, setFilterType] = useState<'all' | 'treino' | 'campeonato'>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');

  // Compute overall attendance stats from Firestore
  const stats = useMemo(() => {
    return getAthleteAttendanceStats(athlete.id);
  }, [attendanceSessions, athlete.id, getAthleteAttendanceStats]);

  // Extract all sessions where this athlete has a record or is tracked
  const athleteSessions = useMemo(() => {
    const list: {
      session: AttendanceSession;
      status: 'presente' | 'ausente' | 'justificado';
      notes?: string;
    }[] = [];

    attendanceSessions.forEach((sess) => {
      const rec = sess.records?.find((r) => r.athleteId === athlete.id);
      if (rec) {
        list.push({
          session: sess,
          status: rec.status,
          notes: rec.notes || sess.notes,
        });
      }
    });

    // Sort by session date descending
    list.sort((a, b) => (b.session.date || '').localeCompare(a.session.date || ''));
    return list;
  }, [attendanceSessions, athlete.id]);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return athleteSessions.filter((item) => {
      if (filterType !== 'all' && item.session.type !== filterType) {
        return false;
      }
      if (filterMonth !== 'all') {
        const itemMonth = new Date(item.session.date).getMonth();
        if (!isNaN(itemMonth) && itemMonth !== Number(filterMonth)) {
          return false;
        }
      }
      return true;
    });
  }, [athleteSessions, filterType, filterMonth]);

  const effectiveAttendanceRate = stats.totalSessions > 0 ? stats.percentage : (athlete.attendanceRate || 100);

  return (
    <div className="space-y-6">
      {/* Schedule Card */}
      <div className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4">
        <h4 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Grade Oficial de Treinos Aquáticos
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
            <span className="text-xs text-slate-400 block">Local dos Treinos</span>
            <p className="text-sm font-bold text-white">
              {athlete.trainingSchedule?.pool || 'Piscina Olímpica 50m - CPB'}
            </p>
            <p className="text-xs text-[#f3e5ab]">
              {athlete.trainingSchedule?.lane || 'Raia 3 - Rendimento S14'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
            <span className="text-xs text-slate-400 block">Dias & Horários</span>
            <p className="text-sm font-bold text-white">
              {Array.isArray(athlete.trainingSchedule?.days)
                ? athlete.trainingSchedule.days.join(', ')
                : (athlete.trainingSchedule?.days || 'Segunda, Quarta, Sexta')}
            </p>
            <p className="text-xs text-cyan-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {athlete.trainingSchedule?.time || '14:00 às 15:30'}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#f3e5ab]">
          <span className="font-semibold">
            Treinador Responsável: {athlete.trainingSchedule?.coachName || 'Prof. Leonardo Ramos'}
          </span>
          <span className="text-slate-400">Padrão de Alto Rendimento Paralímpico</span>
        </div>
      </div>

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-1 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-slate-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Assiduidade Geral</span>
          </div>
          <div className="text-2xl font-black text-[#d4af37]">
            {effectiveAttendanceRate}%
          </div>
          <p className="text-[10px] text-slate-400">
            {stats.totalPresent} de {stats.totalSessions} chamadas realizadas
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-1 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-slate-400 font-semibold">
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span>Treinos na Piscina</span>
          </div>
          <div className="text-2xl font-black text-cyan-400">
            {stats.treinosCount > 0 ? `${stats.treinosPercentage}%` : '100%'}
          </div>
          <p className="text-[10px] text-slate-400">
            {stats.treinosPresent} de {stats.treinosCount} treinos registrados
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-1 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-slate-400 font-semibold">
            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            <span>Campeonatos & Etapas</span>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {stats.campeonatosCount > 0 ? `${stats.campeonatosPercentage}%` : '100%'}
          </div>
          <p className="text-[10px] text-slate-400">
            {stats.campeonatosPresent} de {stats.campeonatosCount} competições oficiais
          </p>
        </div>
      </div>

      {/* Official Read-only Attendance Ledger */}
      <div className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Lista Oficial de Presença & Chamada (Somente Leitura)</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-[#d4af37]" />
              <span>Sincronizada em tempo real com os registros dos professores e comissão técnica.</span>
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterType === 'all' ? 'bg-[#d4af37] text-[#060e1c]' : 'text-slate-300 hover:text-white'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setFilterType('treino')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  filterType === 'treino' ? 'bg-[#d4af37] text-[#060e1c]' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Waves className="w-3 h-3" />
                Treinos
              </button>
              <button
                type="button"
                onClick={() => setFilterType('campeonato')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  filterType === 'campeonato' ? 'bg-[#d4af37] text-[#060e1c]' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Trophy className="w-3 h-3" />
                Campeonatos
              </button>
            </div>

            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-black/50 border border-white/10 text-slate-200 focus:outline-none focus:border-[#d4af37]"
            >
              <option value="all">Todos os Meses</option>
              {MONTH_NAMES.map((name, idx) => (
                <option key={idx} value={String(idx)}>
                  {name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  exportReport({
                    reportType: 'attendance_monthly',
                    format: 'pdf',
                    athletes: [athlete],
                    attendanceSessions,
                    selectedAthleteId: athlete.id,
                    selectedMonth: filterMonth !== 'all' ? Number(filterMonth) : new Date().getMonth(),
                    selectedYear: new Date().getFullYear(),
                  });
                }}
                className="px-2.5 py-1.5 rounded-xl bg-[#d4af37]/15 hover:bg-[#d4af37] text-[#f3e5ab] hover:text-[#060e1c] border border-[#d4af37]/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Baixar Relatório de Presença em PDF"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  exportReport({
                    reportType: 'attendance_monthly',
                    format: 'word',
                    athletes: [athlete],
                    attendanceSessions,
                    selectedAthleteId: athlete.id,
                    selectedMonth: filterMonth !== 'all' ? Number(filterMonth) : new Date().getMonth(),
                    selectedYear: new Date().getFullYear(),
                  });
                }}
                className="px-2.5 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Baixar Relatório de Presença em Word (.doc)"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Word</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-2.5">
          {filteredSessions.length === 0 ? (
            <div className="p-8 rounded-xl bg-black/30 border border-white/5 text-center space-y-2">
              <CalendarIcon className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-300 font-semibold">Nenhuma chamada encontrada para os filtros selecionados.</p>
              <p className="text-[11px] text-slate-500">Assim que a comissão técnica realizar as chamadas nas raias, elas serão exibidas aqui.</p>
            </div>
          ) : (
            filteredSessions.map(({ session, status, notes }, idx) => (
              <div
                key={session.id || idx}
                className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#1e3a5f]/40 border border-white/5 text-[#d4af37] shrink-0 mt-0.5">
                    {session.type === 'campeonato' ? (
                      <Trophy className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Waves className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-sm">{session.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        session.type === 'campeonato' 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {session.type === 'campeonato' ? 'Campeonato Oficial' : 'Treino Aquático'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span className="font-mono text-[#f3e5ab] font-medium flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3 text-[#d4af37]" />
                        {session.date}
                      </span>
                      {session.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {session.location}
                        </span>
                      )}
                    </div>

                    {notes && (
                      <p className="text-[11px] text-slate-300 bg-white/5 p-2 rounded-lg mt-1 border border-white/5">
                        <strong className="text-[#f3e5ab]">Obs. do Treinador:</strong> {notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Read-only badge */}
                <div className="shrink-0 self-start sm:self-center">
                  {status === 'presente' ? (
                    <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-1.5 shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>PRESENTE</span>
                    </span>
                  ) : status === 'justificado' ? (
                    <span className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center gap-1.5 shadow-sm">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>JUSTIFICADO</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-bold text-xs flex items-center gap-1.5 shadow-sm">
                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                      <span>AUSENTE</span>
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Security & Integrity Note */}
        <div className="p-3.5 rounded-xl bg-blue-900/20 border border-blue-500/30 flex items-start gap-2.5 text-xs text-slate-300">
          <Lock className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Controle de Assiduidade ACEDEP:</strong> Esta lista de presença reflete os registros oficiais dos treinos e competições. Para justificar faltas ou solicitar informações adicionais, entre em contato diretamente com a comissão técnica ou envie uma mensagem no portal.
          </p>
        </div>
      </div>
    </div>
  );
};
