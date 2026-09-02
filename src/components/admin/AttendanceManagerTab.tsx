import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Calendar as CalendarIcon, 
  Users, 
  Trophy, 
  Waves, 
  Plus, 
  Trash2, 
  Search, 
  Percent, 
  Check, 
  X, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  MapPin,
  Clock,
  Filter,
  BarChart3,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCheck,
  CalendarDays,
  Grid,
  ListFilter,
  Save,
  HelpCircle,
  FileDown,
  Printer
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { AttendanceSession, AttendanceStatus, AttendanceRecordItem, AthleteRecord } from '../../types';
import { ExportReportModal, ReportType } from '../ExportReportModal';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const AttendanceManagerTab: React.FC = () => {
  const { 
    athletes, 
    attendanceSessions, 
    addAttendanceSession, 
    updateAttendanceSession, 
    deleteAttendanceSession,
    toggleAthletePresence,
    setAthleteDayPresence,
    batchSetAthleteMonthAttendance,
    annualEvents,
    addAnnualEvent
  } = useCommunity();

  // Tab View Mode: 'calendar' (Ficha Mensal por Atleta), 'matrix' (Grade Geral de Treinos), 'championships_matrix' (Grade Geral de Campeonatos), 'sessions' (Histórico de Sessões)
  const [viewMode, setViewMode] = useState<'calendar' | 'matrix' | 'championships_matrix' | 'sessions'>('matrix');

  // Month & Year state
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());

  // Export report modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportInitialType, setExportInitialType] = useState<ReportType>('attendance_monthly');

  // Selected Athlete for individual calendar view
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(() => athletes[0]?.id || '');
  const [athleteSearchTerm, setAthleteSearchTerm] = useState('');

  // Auto-save feedback state
  const [autoSaveFeedback, setAutoSaveFeedback] = useState<{ visible: boolean; time: string; text: string }>({
    visible: false,
    time: '',
    text: '',
  });

  // Sessions Tab Filter
  const [activeFilter, setActiveFilter] = useState<'all' | 'treino' | 'campeonato'>('all');
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  // New Session Form State
  const [sessionType, setSessionType] = useState<'treino' | 'campeonato'>('treino');
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [sessionLocation, setSessionLocation] = useState('Piscina 50m - Centro Paralímpico Brasileiro');
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionAthleteChecks, setSessionAthleteChecks] = useState<Record<string, AttendanceStatus>>(() => {
    const initial: Record<string, AttendanceStatus> = {};
    athletes.forEach((a) => {
      initial[a.id] = 'presente';
    });
    return initial;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Selected Athlete Object
  const currentAthlete = athletes.find((a) => a.id === selectedAthleteId) || athletes[0];

  // Navigate Months
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleSetCurrentMonth = () => {
    const now = new Date();
    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
  };

  // Trigger brief auto-save indicator
  const triggerAutoSaveFeedback = (msg = 'Salvo automaticamente') => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setAutoSaveFeedback({
      visible: true,
      time: timeStr,
      text: msg,
    });
    setTimeout(() => {
      setAutoSaveFeedback((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Calendar Calculation Helpers
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const firstDayWeekday = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 1).getDay(); // 0 = Dom, 1 = Seg, ...
  }, [selectedYear, selectedMonth]);

  // Format Day Date String (DD/MM/YYYY)
  const formatDayDate = (dayNum: number): string => {
    const d = String(dayNum).padStart(2, '0');
    const m = String(selectedMonth + 1).padStart(2, '0');
    return `${d}/${m}/${selectedYear}`;
  };

  // Helper to determine if a day of the week matches athlete's regular training days
  const isAthleteScheduledDay = (athlete: AthleteRecord | undefined, dayNum: number): boolean => {
    if (!athlete || !athlete.trainingSchedule?.days) return false;
    const date = new Date(selectedYear, selectedMonth, dayNum);
    const dayOfWeek = date.getDay(); // 0 = Dom, 1 = Seg, 2 = Ter, 3 = Qua, 4 = Qui, 5 = Sex, 6 = Sáb

    const dayMap: Record<number, string[]> = {
      0: ['Domingo'],
      1: ['Segunda-feira', 'Segunda', 'Seg'],
      2: ['Terça-feira', 'Terça', 'Ter'],
      3: ['Quarta-feira', 'Quarta', 'Qua'],
      4: ['Quinta-feira', 'Quinta', 'Qui'],
      5: ['Sexta-feira', 'Sexta', 'Sex'],
      6: ['Sábado', 'Sabado', 'Sáb'],
    };

    const targetNames = dayMap[dayOfWeek] || [];
    return athlete.trainingSchedule.days.some((schedDay) =>
      targetNames.some((n) => schedDay.toLowerCase().includes(n.toLowerCase()))
    );
  };

  // Get status of an athlete on a specific date (DD/MM/YYYY)
  const getAthleteDayStatus = (athlete: AthleteRecord | undefined, dateStr: string): 'presente' | 'falta' | 'falta_justificada' | 'sem_registro' => {
    if (!athlete) return 'sem_registro';

    // 1. Check in athlete's recentAttendance
    const directRec = (athlete.recentAttendance || []).find((r) => r.date === dateStr);
    if (directRec) {
      if (directRec.status === 'presente' || directRec.status === 'treino_extra') return 'presente';
      if (directRec.status === 'falta_justificada') return 'falta_justificada';
      if (directRec.status === 'falta') return 'falta';
    }

    // 2. Check in attendanceSessions
    const session = attendanceSessions.find((s) => s.date === dateStr);
    if (session) {
      const rec = session.records.find((r) => r.athleteId === athlete.id);
      if (rec) {
        if (rec.status === 'presente') return 'presente';
        if (rec.status === 'justificado') return 'falta_justificada';
        if (rec.status === 'ausente') return 'falta';
      }
    }

    return 'sem_registro';
  };

  // Toggle Day Check for an athlete (cycles: sem_registro -> presente -> falta -> falta_justificada -> sem_registro)
  const handleToggleDay = async (athleteId: string, dayNum: number) => {
    const targetAthlete = athletes.find((a) => a.id === athleteId);
    if (!targetAthlete) return;

    const dateStr = formatDayDate(dayNum);
    const currentStatus = getAthleteDayStatus(targetAthlete, dateStr);

    let nextStatus: 'presente' | 'falta' | 'falta_justificada' | 'remover' = 'presente';
    if (currentStatus === 'sem_registro') {
      nextStatus = 'presente';
    } else if (currentStatus === 'presente') {
      nextStatus = 'falta';
    } else if (currentStatus === 'falta') {
      nextStatus = 'falta_justificada';
    } else if (currentStatus === 'falta_justificada') {
      nextStatus = 'remover';
    }

    await setAthleteDayPresence(athleteId, dateStr, nextStatus);
    triggerAutoSaveFeedback(`Dia ${String(dayNum).padStart(2, '0')}/${String(selectedMonth + 1).padStart(2, '0')}: ${nextStatus === 'remover' ? 'Livre' : nextStatus.toUpperCase()}`);
  };

  // Set explicit status for a day
  const handleSetDayExplicit = async (athleteId: string, dayNum: number, status: 'presente' | 'falta' | 'falta_justificada' | 'remover') => {
    const dateStr = formatDayDate(dayNum);
    await setAthleteDayPresence(athleteId, dateStr, status);
    triggerAutoSaveFeedback(`Dia ${String(dayNum).padStart(2, '0')}/${String(selectedMonth + 1).padStart(2, '0')} atualizado!`);
  };

  // Bulk: Mark all scheduled training days of the month as Present
  const handleMarkAllScheduledDaysPresent = async (athlete: AthleteRecord) => {
    const recordsToSet: { date: string; status: 'presente' | 'falta' | 'falta_justificada' }[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      if (isAthleteScheduledDay(athlete, day)) {
        recordsToSet.push({
          date: formatDayDate(day),
          status: 'presente',
        });
      }
    }

    if (recordsToSet.length > 0) {
      await batchSetAthleteMonthAttendance(athlete.id, recordsToSet);
      triggerAutoSaveFeedback(`${recordsToSet.length} treinos marcados com presença!`);
    }
  };

  // Bulk: Clear month attendance for an athlete
  const handleClearMonthAttendance = async (athlete: AthleteRecord) => {
    if (!confirm(`Deseja limpar todos os registros de presença de ${athlete.name} no mês de ${MONTH_NAMES[selectedMonth]} de ${selectedYear}?`)) {
      return;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDayDate(day);
      await setAthleteDayPresence(athlete.id, dateStr, 'remover');
    }
    triggerAutoSaveFeedback(`Mês de ${MONTH_NAMES[selectedMonth]} resetado!`);
  };

  // Calculate Monthly Statistics for a Specific Athlete
  const getAthleteMonthStats = (athlete: AthleteRecord | undefined) => {
    if (!athlete) {
      return { totalMarked: 0, presentCount: 0, justifiedCount: 0, absentCount: 0, percentage: 0, scheduledTotal: 0 };
    }

    let presentCount = 0;
    let justifiedCount = 0;
    let absentCount = 0;
    let scheduledTotal = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDayDate(day);
      const status = getAthleteDayStatus(athlete, dateStr);

      if (isAthleteScheduledDay(athlete, day)) {
        scheduledTotal++;
      }

      if (status === 'presente') presentCount++;
      else if (status === 'falta_justificada') justifiedCount++;
      else if (status === 'falta') absentCount++;
    }

    const totalMarked = presentCount + justifiedCount + absentCount;
    // Percentage based on marked sessions (or scheduled days if higher)
    const effectiveTotal = totalMarked > 0 ? totalMarked : scheduledTotal;
    const effectiveAttended = presentCount + (justifiedCount * 0.5); // justified counts partially or fully
    const percentage = effectiveTotal > 0 ? Math.min(100, Math.round(((presentCount + justifiedCount) / effectiveTotal) * 100)) : 100;

    return {
      totalMarked,
      presentCount,
      justifiedCount,
      absentCount,
      percentage: totalMarked === 0 ? athlete.attendanceRate || 100 : percentage,
      scheduledTotal,
    };
  };

  // Filtered Athletes
  const filteredAthletes = athletes.filter((a) =>
    a.name.toLowerCase().includes(athleteSearchTerm.toLowerCase()) ||
    (a.guardianName || '').toLowerCase().includes(athleteSearchTerm.toLowerCase()) ||
    (a.paralympicClass || '').toLowerCase().includes(athleteSearchTerm.toLowerCase())
  );

  // Selected athlete month stats
  const currentMonthStats = getAthleteMonthStats(currentAthlete);

  // Overall Global Statistics
  const totalTreinos = attendanceSessions.filter((s) => s.type === 'treino').length;
  const totalCampeonatos = attendanceSessions.filter((s) => s.type === 'campeonato').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* TOP HEADER: View Selector & Month Navigation */}
      <div className="p-5 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-serif flex items-center gap-2">
                <span>Ficha de Presença dos Treinos</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono font-bold">
                  Auto-Save Ativo 💾
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Calendário mensal interativo por atleta: dê 1 clique no dia para dar o check de presença.
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-black/50 rounded-xl border border-[#1e3a5f] self-start lg:self-center">
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'matrix'
                ? 'bg-[#d4af37] text-[#060e1c] shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Grade Geral de Treinos (Mês)</span>
          </button>

          <button
            onClick={() => setViewMode('championships_matrix')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'championships_matrix'
                ? 'bg-[#d4af37] text-[#060e1c] shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Grade Geral de Campeonatos</span>
          </button>

          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'calendar'
                ? 'bg-[#d4af37] text-[#060e1c] shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Ficha Individual</span>
          </button>

          <button
            onClick={() => setViewMode('sessions')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'sessions'
                ? 'bg-[#d4af37] text-[#060e1c] shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>Histórico ({attendanceSessions.length})</span>
          </button>
        </div>
      </div>

      {/* MONTH & YEAR SELECTOR BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#081528] border border-[#1e3a5f]">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-black/40 hover:bg-[#1e3a5f] text-slate-300 hover:text-white border border-[#1e3a5f] transition-all cursor-pointer shadow"
            title="Mês Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-[#d4af37]/40 shadow-inner">
            <span className="text-sm font-bold text-white font-serif">
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </span>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-black/40 hover:bg-[#1e3a5f] text-slate-300 hover:text-white border border-[#1e3a5f] transition-all cursor-pointer shadow"
            title="Próximo Mês"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleSetCurrentMonth}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
          >
            Mês Atual
          </button>
        </div>

        {/* Live Auto-save feedback badge & Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {autoSaveFeedback.visible ? (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>{autoSaveFeedback.text}</span>
              <span className="text-[10px] text-slate-400 font-mono">({autoSaveFeedback.time})</span>
            </div>
          ) : (
            <div className="text-xs text-slate-400 flex items-center gap-1 hidden sm:flex">
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>Auto-save ativo</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setExportInitialType(
                  viewMode === 'championships_matrix' ? 'attendance_championships' : 'attendance_monthly'
                );
                setExportModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8952b] text-[#060e1c] font-bold text-xs shadow-md hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
              title="Exportar Lista de Chamada e Frequência em PDF ou Word"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Exportar Chamada (PDF / Word)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setExportInitialType('attendance_blank_sheet');
                setExportModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Gerar Folha em Branco para Borda de Piscina"
            >
              <Printer className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="hidden md:inline">Folha em Branco</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: INDIVIDUAL ATHLETE MONTHLY CALENDAR SHEET (USER'S PRIMARY REQUEST) */}
      {/* ========================================================================= */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Athlete Selector List (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#d4af37]" />
                  <span>Selecionar Atleta ({athletes.length})</span>
                </h4>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={athleteSearchTerm}
                  onChange={(e) => setAthleteSearchTerm(e.target.value)}
                  placeholder="Buscar atleta pelo nome..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-[#1e3a5f] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              {/* Athletes Scrollable Card List */}
              <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
                {filteredAthletes.map((ath) => {
                  const isSelected = ath.id === (currentAthlete?.id || '');
                  const stats = getAthleteMonthStats(ath);

                  return (
                    <div
                      key={ath.id}
                      onClick={() => setSelectedAthleteId(ath.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                        isSelected
                          ? 'bg-[#d4af37]/15 border-[#d4af37] shadow-md ring-1 ring-[#d4af37]/30'
                          : 'bg-black/30 border-white/5 hover:border-white/20 hover:bg-black/40 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={ath.photoUrl}
                          alt={ath.name}
                          className={`w-9 h-9 rounded-full object-cover shrink-0 border ${
                            isSelected ? 'border-[#d4af37]' : 'border-white/10'
                          }`}
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-white font-serif' : 'text-slate-200'}`}>
                            {ath.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {ath.paralympicClass || 'Classe S14'}
                          </p>
                        </div>
                      </div>

                      {/* Percentage Badge */}
                      <div className="text-right shrink-0">
                        <div className={`text-xs font-black font-mono px-2 py-0.5 rounded-full border ${
                          stats.percentage >= 85
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : stats.percentage >= 70
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-red-500/20 text-red-300 border-red-500/30'
                        }`}>
                          {stats.percentage}%
                        </div>
                        <span className="text-[9px] text-slate-400 block mt-0.5">no mês</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Monthly Calendar & Quick Actions (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {currentAthlete ? (
              <div className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] shadow-xl space-y-6">
                
                {/* Athlete Top Profile Summary Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-black/40 border border-[#1e3a5f]">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentAthlete.photoUrl}
                      alt={currentAthlete.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-[#d4af37] shadow"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white font-serif">
                          {currentAthlete.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f3e5ab] border border-[#d4af37]/40 text-[10px] font-bold">
                          {currentAthlete.paralympicClass}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                        <span>Dias de Treino: <strong>{currentAthlete.trainingSchedule?.days.join(', ')}</strong></span>
                        <span>•</span>
                        <span>{currentAthlete.trainingSchedule?.time}</span>
                      </p>
                    </div>
                  </div>

                  {/* Live Big Stats Highlight */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Presença em {MONTH_NAMES[selectedMonth]}</div>
                      <div className={`text-2xl font-black font-mono ${
                        currentMonthStats.percentage >= 85 ? 'text-emerald-400' : currentMonthStats.percentage >= 70 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {currentMonthStats.percentage}%
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Percent className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Legend & Instructions */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#1e3a5f] pb-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-black text-[9px] font-black">✓</span>
                      <span className="text-slate-300 font-medium">Presente (1 clique)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-red-500 flex items-center justify-center text-white text-[9px] font-black">✕</span>
                      <span className="text-slate-300 font-medium">Falta</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-amber-400 flex items-center justify-center text-black text-[9px] font-black">!</span>
                      <span className="text-slate-300 font-medium">Justificada</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full border border-dashed border-cyan-400/80 bg-cyan-500/10"></span>
                      <span className="text-cyan-300 font-medium">Dia de Treino</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#d4af37] font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Clique em qualquer dia para alterar</span>
                  </div>
                </div>

                {/* MONTHLY CALENDAR GRID */}
                <div className="space-y-2">
                  {/* Days of Week Header */}
                  <div className="grid grid-cols-7 gap-1.5 text-center">
                    {WEEK_DAYS.map((wd, i) => (
                      <div
                        key={wd}
                        className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${
                          i === 0 || i === 6 ? 'text-slate-500 bg-black/20' : 'text-[#f3e5ab] bg-[#0c1f38] border border-[#1e3a5f]/40'
                        }`}
                      >
                        {wd}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days Grid */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {/* Blank offset padding boxes before the 1st day of month */}
                    {Array.from({ length: firstDayWeekday }).map((_, idx) => (
                      <div key={`blank-${idx}`} className="h-20 rounded-xl bg-black/10 border border-white/5 opacity-30" />
                    ))}

                    {/* Active Month Days 1..daysInMonth */}
                    {Array.from({ length: daysInMonth }).map((_, idx) => {
                      const dayNum = idx + 1;
                      const dateStr = formatDayDate(dayNum);
                      const status = getAthleteDayStatus(currentAthlete, dateStr);
                      const isScheduled = isAthleteScheduledDay(currentAthlete, dayNum);

                      const isPresent = status === 'presente';
                      const isAbsent = status === 'falta';
                      const isJustified = status === 'falta_justificada';

                      return (
                        <div
                          key={dayNum}
                          onClick={() => handleToggleDay(currentAthlete.id, dayNum)}
                          className={`h-20 p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between select-none relative group ${
                            isPresent
                              ? 'bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-950/40 text-white'
                              : isAbsent
                              ? 'bg-red-950/60 border-red-500/80 text-white'
                              : isJustified
                              ? 'bg-amber-950/60 border-amber-400 text-white'
                              : isScheduled
                              ? 'bg-[#08172c] border-cyan-500/40 hover:border-cyan-400 text-slate-300 hover:bg-[#0c2240]'
                              : 'bg-black/30 border-white/5 hover:border-white/20 text-slate-400 hover:bg-black/50'
                          }`}
                        >
                          {/* Day Number and Pool Tag */}
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold ${
                              isPresent ? 'text-emerald-300' : isAbsent ? 'text-red-300' : isJustified ? 'text-amber-300' : isScheduled ? 'text-cyan-300 font-black' : 'text-slate-400'
                            }`}>
                              {String(dayNum).padStart(2, '0')}
                            </span>

                            {isScheduled && (
                              <span className="p-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" title="Dia oficial de treino na grade">
                                <Waves className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>

                          {/* Center Status Badge / Icon */}
                          <div className="flex items-center justify-center my-auto">
                            {isPresent && (
                              <div className="px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-black flex items-center gap-1 shadow">
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>CHECK</span>
                              </div>
                            )}
                            {isAbsent && (
                              <div className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center gap-1 shadow">
                                <X className="w-3 h-3 stroke-[3]" />
                                <span>FALTA</span>
                              </div>
                            )}
                            {isJustified && (
                              <div className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black flex items-center gap-1 shadow">
                                <AlertCircle className="w-3 h-3" />
                                <span>JUSTIF.</span>
                              </div>
                            )}
                            {status === 'sem_registro' && isScheduled && (
                              <span className="text-[10px] text-cyan-400/60 font-semibold group-hover:text-cyan-300">
                                Treino
                              </span>
                            )}
                          </div>

                          {/* Bottom hover hint */}
                          <div className="text-[8px] text-slate-500 group-hover:text-slate-300 truncate text-right">
                            {status === 'sem_registro' ? 'Clique p/ marcar' : 'Clique p/ mudar'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* MONTH SUMMARY METRICS BOX */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-black/40 border border-[#1e3a5f]">
                  <div className="p-2.5 rounded-lg bg-black/30">
                    <span className="text-[10px] text-slate-400 block font-medium">Treinos com Presença</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">
                      {currentMonthStats.presentCount} {currentMonthStats.presentCount === 1 ? 'dia' : 'dias'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/30">
                    <span className="text-[10px] text-slate-400 block font-medium">Faltas Justificadas</span>
                    <span className="text-base font-bold text-amber-400 font-mono">
                      {currentMonthStats.justifiedCount} {currentMonthStats.justifiedCount === 1 ? 'dia' : 'dias'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/30">
                    <span className="text-[10px] text-slate-400 block font-medium">Faltas Não Justificadas</span>
                    <span className="text-base font-bold text-red-400 font-mono">
                      {currentMonthStats.absentCount} {currentMonthStats.absentCount === 1 ? 'dia' : 'dias'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/30">
                    <span className="text-[10px] text-slate-400 block font-medium">Taxa do Mês</span>
                    <span className="text-base font-bold text-[#d4af37] font-mono">
                      {currentMonthStats.percentage}% Assiduidade
                    </span>
                  </div>
                </div>

                {/* QUICK BATCH ACTIONS FOR THE COACH */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1e3a5f]">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMarkAllScheduledDaysPresent(currentAthlete)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/50 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow"
                      title="Marca todos os dias de treino previstos na grade como presente"
                    >
                      <CheckCheck className="w-4 h-4 text-emerald-400" />
                      <span>Dar Check em Todos os Treinos do Mês</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleClearMonthAttendance(currentAthlete)}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-300 border border-white/10 hover:border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Limpa todas as presenças marcadas neste mês para este atleta"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Limpar Mês</span>
                    </button>
                  </div>

                  <span className="text-xs text-slate-400 font-medium">
                    Atleta: <strong className="text-white">{currentAthlete.name}</strong>
                  </span>
                </div>

              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#0a192f] border border-[#1e3a5f] text-slate-400 text-sm">
                Selecione um atleta na lista ao lado para abrir a ficha de presença mensal.
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: TEAM FULL MONTH MATRIX (GRADE GERAL DE TREINOS DO MÊS) */}
      {/* ========================================================================= */}
      {viewMode === 'matrix' && (
        <div className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e3a5f] pb-4">
            <div>
              <h4 className="text-base font-bold text-white font-serif flex items-center gap-2">
                <Grid className="w-4 h-4 text-[#d4af37]" />
                <span>Grade Geral de Presença: {MONTH_NAMES[selectedMonth]} de {selectedYear}</span>
              </h4>
              <p className="text-xs text-slate-400">
                Visão panorâmica de todos os atletas x todos os dias do mês. Clique em qualquer célula para alternar o check do dia.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Presente (✓)
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> Justificada (!)
              </span>
              <span className="flex items-center gap-1 text-red-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> Falta (✕)
              </span>
            </div>
          </div>

          {/* Matrix Scrollable Table */}
          <div className="overflow-x-auto rounded-xl border border-[#1e3a5f] bg-black/40">
            <table className="w-full text-xs text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[#071326] border-b border-[#1e3a5f] text-slate-300">
                  <th className="p-3 sticky left-0 bg-[#071326] z-10 min-w-[180px] font-bold text-white">
                    Atleta
                  </th>
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const date = new Date(selectedYear, selectedMonth, dayNum);
                    const weekDayLetter = WEEK_DAYS[date.getDay()].charAt(0);
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                    return (
                      <th
                        key={dayNum}
                        className={`p-1.5 text-center min-w-[28px] font-bold border-l border-white/5 ${
                          isWeekend ? 'bg-black/30 text-slate-500' : 'text-[#f3e5ab]'
                        }`}
                      >
                        <div className="text-[10px] leading-tight">{dayNum}</div>
                        <div className="text-[8px] text-slate-400 font-normal">{weekDayLetter}</div>
                      </th>
                    );
                  })}
                  <th className="p-3 text-center min-w-[90px] font-bold text-[#d4af37] border-l border-[#1e3a5f]">
                    % Mês
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {athletes.map((ath) => {
                  const stats = getAthleteMonthStats(ath);

                  return (
                    <tr key={ath.id} className="hover:bg-white/5 transition-colors">
                      {/* Athlete sticky name cell */}
                      <td className="p-2.5 sticky left-0 bg-[#0c1f38] z-10 border-r border-[#1e3a5f] flex items-center gap-2">
                        <img
                          src={ath.photoUrl}
                          alt={ath.name}
                          className="w-6 h-6 rounded-full object-cover shrink-0 border border-white/10"
                          referrerPolicy="no-referrer"
                        />
                        <span className="font-bold text-white truncate max-w-[130px]">{ath.name}</span>
                      </td>

                      {/* Days cells */}
                      {Array.from({ length: daysInMonth }).map((_, idx) => {
                        const dayNum = idx + 1;
                        const dateStr = formatDayDate(dayNum);
                        const status = getAthleteDayStatus(ath, dateStr);
                        const isScheduled = isAthleteScheduledDay(ath, dayNum);

                        return (
                          <td
                            key={dayNum}
                            onClick={() => handleToggleDay(ath.id, dayNum)}
                            className={`p-1 text-center border-l border-white/5 cursor-pointer select-none transition-all ${
                              status === 'presente'
                                ? 'bg-emerald-950/80 text-emerald-300 font-black'
                                : status === 'falta'
                                ? 'bg-red-950/80 text-red-300 font-black'
                                : status === 'falta_justificada'
                                ? 'bg-amber-950/80 text-amber-300 font-black'
                                : isScheduled
                                ? 'bg-cyan-950/20 hover:bg-cyan-950/40 text-slate-500'
                                : 'hover:bg-white/10 text-slate-600'
                            }`}
                            title={`Atleta: ${ath.name} - Dia ${dayNum}/${selectedMonth + 1}`}
                          >
                            {status === 'presente' && '✓'}
                            {status === 'falta' && '✕'}
                            {status === 'falta_justificada' && '!'}
                            {status === 'sem_registro' && isScheduled && '·'}
                          </td>
                        );
                      })}

                      {/* Percentage Cell */}
                      <td className="p-2.5 text-center font-mono font-bold text-xs border-l border-[#1e3a5f]">
                        <span className={`px-2 py-0.5 rounded-full border ${
                          stats.percentage >= 85
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : stats.percentage >= 70
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-red-500/20 text-red-300 border-red-500/30'
                        }`}>
                          {stats.percentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2.5: TEAM FULL CHAMPIONSHIPS MATRIX (GRADE GERAL DE CAMPEONATOS) */}
      {/* ========================================================================= */}
      {viewMode === 'championships_matrix' && (
        <div className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] shadow-xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e3a5f] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40">
                  <Trophy className="w-4 h-4" />
                </span>
                <h4 className="text-base font-bold text-white font-serif">
                  Grade Geral de Campeonatos & Torneios (Temporada 2026)
                </h4>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Visão geral completa com todos os atletas da ACEDEP e todos os campeonatos do ano. Clique em qualquer célula para alternar o status ou registrar medalhas.
              </p>
            </div>

            {/* Quick Status Legend */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] bg-black/40 p-2 rounded-xl border border-white/5">
              <span className="flex items-center gap-1 text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                <span>✓</span> Presente / Disputou
              </span>
              <span className="flex items-center gap-1 text-amber-300 font-bold px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">
                <span>🥇</span> Ouro
              </span>
              <span className="flex items-center gap-1 text-slate-300 font-bold px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-400/30">
                <span>🥈</span> Prata
              </span>
              <span className="flex items-center gap-1 text-amber-600 font-bold px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-700/30">
                <span>🥉</span> Bronze
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">
                <span>!</span> Justificada
              </span>
              <span className="flex items-center gap-1 text-red-400 font-bold px-1.5 py-0.5 rounded bg-red-950/60 border border-red-500/30">
                <span>✕</span> Falta
              </span>
            </div>
          </div>

          {/* Championships Table */}
          {(() => {
            // Collect unified championships
            const existingChampSessions = attendanceSessions.filter((s) => s.type === 'campeonato');
            const annualChampionships = (annualEvents || []).filter((e) => 
              e.category === 'Campeonato Nacional' || 
              e.category === 'Campeonato Estadual' || 
              e.category === 'Torneio Regional' ||
              e.category === 'Seletiva & Avaliação'
            );

            // Combine unique list
            const unifiedChamps: { id: string; title: string; date: string; location: string; sessionId?: string; eventId?: string }[] = [];

            existingChampSessions.forEach((sess) => {
              unifiedChamps.push({
                id: sess.id,
                title: sess.title,
                date: sess.date,
                location: sess.location || 'Centro Paralímpico Brasileiro',
                sessionId: sess.id,
              });
            });

            annualChampionships.forEach((evt) => {
              const alreadyExists = unifiedChamps.some((c) => 
                c.title.toLowerCase().trim() === evt.title.toLowerCase().trim() ||
                c.date === evt.date
              );
              if (!alreadyExists) {
                unifiedChamps.push({
                  id: evt.id,
                  title: evt.title,
                  date: evt.date,
                  location: evt.location,
                  eventId: evt.id,
                });
              }
            });

            // If empty, provide placeholder demo championships
            if (unifiedChamps.length === 0) {
              unifiedChamps.push(
                { id: 'c1', title: 'Paulista FAP - 1ª Etapa', date: '21/03/2026', location: 'CPB - SP' },
                { id: 'c2', title: 'Troféu Brasil Paralímpico', date: '18/04/2026', location: 'CPB - SP' },
                { id: 'c3', title: 'Circuito Caixa Regional', date: '23/05/2026', location: 'São Paulo' }
              );
            }

            // Function to get status for athlete in champ
            const getAthleteChampStatus = (ath: AthleteRecord, champ: typeof unifiedChamps[0]): string => {
              // 1. Check in session records if matched
              if (champ.sessionId) {
                const sess = attendanceSessions.find((s) => s.id === champ.sessionId);
                const rec = sess?.records?.find((r) => r.athleteId === ath.id);
                if (rec) {
                  if (rec.notes?.toLowerCase().includes('ouro') || rec.notes?.toLowerCase().includes('1º')) return 'ouro';
                  if (rec.notes?.toLowerCase().includes('prata') || rec.notes?.toLowerCase().includes('2º')) return 'prata';
                  if (rec.notes?.toLowerCase().includes('bronze') || rec.notes?.toLowerCase().includes('3º')) return 'bronze';
                  if (rec.status === 'presente') return 'presente';
                  if (rec.status === 'justificado') return 'justificado';
                  if (rec.status === 'ausente') return 'ausente';
                }
              }

              // 2. Check in athlete's recentAttendance
              const matchRecent = (ath.recentAttendance || []).find((r) => 
                (champ.date && r.date === champ.date) || 
                (r.note && r.note.toLowerCase().includes(champ.title.toLowerCase()))
              );
              if (matchRecent) {
                if (matchRecent.note?.toLowerCase().includes('ouro')) return 'ouro';
                if (matchRecent.note?.toLowerCase().includes('prata')) return 'prata';
                if (matchRecent.note?.toLowerCase().includes('bronze')) return 'bronze';
                if (matchRecent.status === 'presente' || matchRecent.status === 'treino_extra') return 'presente';
                if (matchRecent.status === 'falta_justificada') return 'justificado';
                if (matchRecent.status === 'falta') return 'ausente';
              }

              return 'livre';
            };

            // Toggle Handler
            const handleToggleAthleteChamp = async (ath: AthleteRecord, champ: typeof unifiedChamps[0]) => {
              const currentStatus = getAthleteChampStatus(ath, champ);
              let nextStatus = 'presente';
              let note = '';

              if (currentStatus === 'livre') {
                nextStatus = 'presente';
              } else if (currentStatus === 'presente') {
                nextStatus = 'presente';
                note = 'Medalha de Ouro 🥇';
              } else if (currentStatus === 'ouro') {
                nextStatus = 'presente';
                note = 'Medalha de Prata 🥈';
              } else if (currentStatus === 'prata') {
                nextStatus = 'presente';
                note = 'Medalha de Bronze 🥉';
              } else if (currentStatus === 'bronze') {
                nextStatus = 'justificado';
              } else if (currentStatus === 'justificado') {
                nextStatus = 'ausente';
              } else if (currentStatus === 'ausente') {
                nextStatus = 'livre';
              }

              // Find or create session
              let targetSessionId = champ.sessionId;
              if (!targetSessionId) {
                // create session
                const newSessId = `camp-${Date.now()}`;
                const newSess: AttendanceSession = {
                  id: newSessId,
                  title: champ.title,
                  type: 'campeonato',
                  date: champ.date.includes('/') ? champ.date : new Date().toISOString().split('T')[0],
                  location: champ.location,
                  notes: 'Comissão Técnica ACEDEP',
                  createdAt: new Date().toISOString(),
                  records: [
                    {
                      athleteId: ath.id,
                      athleteName: ath.name,
                      status: nextStatus === 'livre' ? 'ausente' : (nextStatus as any),
                      notes: note || undefined,
                    }
                  ],
                };
                await addAttendanceSession(newSess);
                triggerAutoSaveFeedback(`${ath.name}: ${champ.title} atualizado!`);
                return;
              }

              // Update existing session
              const existingSess = attendanceSessions.find((s) => s.id === targetSessionId);
              if (existingSess) {
                const currentRecs = existingSess.records || [];
                let updatedRecs = [...currentRecs];
                const recIdx = updatedRecs.findIndex((r) => r.athleteId === ath.id);

                if (nextStatus === 'livre') {
                  updatedRecs = updatedRecs.filter((r) => r.athleteId !== ath.id);
                } else if (recIdx >= 0) {
                  updatedRecs[recIdx] = {
                    ...updatedRecs[recIdx],
                    status: (nextStatus === 'ouro' || nextStatus === 'prata' || nextStatus === 'bronze') ? 'presente' : (nextStatus as any),
                    notes: note || undefined,
                  };
                } else {
                  updatedRecs.push({
                    athleteId: ath.id,
                    athleteName: ath.name,
                    status: (nextStatus === 'ouro' || nextStatus === 'prata' || nextStatus === 'bronze') ? 'presente' : (nextStatus as any),
                    notes: note || undefined,
                  });
                }

                await updateAttendanceSession(targetSessionId, { records: updatedRecs });
                triggerAutoSaveFeedback(`${ath.name} no torneio ${champ.title}: ${note || nextStatus.toUpperCase()}`);
              }
            };

            return (
              <div className="overflow-x-auto rounded-xl border border-[#1e3a5f] bg-black/40 shadow-inner">
                <table className="w-full text-xs text-left border-collapse min-w-[850px]">
                  <thead>
                    <tr className="bg-[#071326] border-b border-[#1e3a5f] text-slate-300">
                      <th className="p-3 sticky left-0 bg-[#071326] z-10 min-w-[200px] font-bold text-white">
                        Atleta / Classe
                      </th>
                      {unifiedChamps.map((champ) => (
                        <th
                          key={champ.id}
                          className="p-2.5 text-center min-w-[140px] font-bold border-l border-white/5 text-[#f3e5ab]"
                        >
                          <div className="text-[11px] font-bold text-white leading-tight line-clamp-2">
                            {champ.title}
                          </div>
                          <div className="text-[9px] text-[#d4af37] font-semibold mt-0.5">
                            {champ.date}
                          </div>
                          <div className="text-[8px] text-slate-400 truncate max-w-[120px] mx-auto">
                            {champ.location}
                          </div>
                        </th>
                      ))}
                      <th className="p-3 text-center min-w-[100px] font-bold text-[#d4af37] border-l border-[#1e3a5f]">
                        Disputados
                      </th>
                      <th className="p-3 text-center min-w-[100px] font-bold text-amber-300 border-l border-white/5">
                        Medalhas 🏅
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {athletes.map((ath) => {
                      let participatedCount = 0;
                      let medalsCount = 0;

                      return (
                        <tr key={ath.id} className="hover:bg-white/5 transition-colors">
                          {/* Athlete Sticky Cell */}
                          <td className="p-2.5 sticky left-0 bg-[#0c1f38] z-10 border-r border-[#1e3a5f]">
                            <div className="flex items-center gap-2">
                              <img
                                src={ath.photoUrl}
                                alt={ath.name}
                                className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/10"
                                referrerPolicy="no-referrer"
                              />
                              <div className="truncate">
                                <div className="font-bold text-white truncate max-w-[130px]">{ath.name}</div>
                                <div className="text-[9px] text-[#d4af37] font-mono">
                                  Classe {ath.paralympicClass || 'S14'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Championship Status Cells */}
                          {unifiedChamps.map((champ) => {
                            const status = getAthleteChampStatus(ath, champ);
                            if (status === 'presente' || status === 'ouro' || status === 'prata' || status === 'bronze') {
                              participatedCount++;
                            }
                            if (status === 'ouro' || status === 'prata' || status === 'bronze') {
                              medalsCount++;
                            }

                            return (
                              <td
                                key={champ.id}
                                onClick={() => handleToggleAthleteChamp(ath, champ)}
                                className={`p-2 text-center border-l border-white/5 cursor-pointer select-none transition-all ${
                                  status === 'ouro'
                                    ? 'bg-amber-950/70 text-amber-300 font-black'
                                    : status === 'prata'
                                    ? 'bg-slate-800/80 text-slate-200 font-black'
                                    : status === 'bronze'
                                    ? 'bg-amber-950/80 text-amber-500 font-black'
                                    : status === 'presente'
                                    ? 'bg-emerald-950/80 text-emerald-300 font-black'
                                    : status === 'justificado'
                                    ? 'bg-amber-950/60 text-amber-300 font-bold'
                                    : status === 'ausente'
                                    ? 'bg-red-950/70 text-red-300 font-bold'
                                    : 'hover:bg-white/10 text-slate-600'
                                }`}
                                title={`Clique para alternar presença e medalhas de ${ath.name} em ${champ.title}`}
                              >
                                {status === 'ouro' && <span className="text-sm">🥇 1º</span>}
                                {status === 'prata' && <span className="text-sm">🥈 2º</span>}
                                {status === 'bronze' && <span className="text-sm">🥉 3º</span>}
                                {status === 'presente' && <span className="text-sm font-bold text-emerald-300">✓ Convocado</span>}
                                {status === 'justificado' && <span className="text-xs font-bold text-amber-300">! Justif.</span>}
                                {status === 'ausente' && <span className="text-xs font-bold text-red-400">✕ Ausente</span>}
                                {status === 'livre' && <span className="text-slate-600">-</span>}
                              </td>
                            );
                          })}

                          {/* Total Participations */}
                          <td className="p-2.5 text-center font-mono font-bold text-xs border-l border-[#1e3a5f]">
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              {participatedCount} / {unifiedChamps.length}
                            </span>
                          </td>

                          {/* Medals Count */}
                          <td className="p-2.5 text-center font-mono font-bold text-xs border-l border-white/5">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {medalsCount > 0 ? `🏅 ${medalsCount}` : '—'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: HISTORICAL SESSIONS & FAST BATCH SESSION CREATION */}
      {/* ========================================================================= */}
      {viewMode === 'sessions' && (
        <div className="space-y-6">
          
          {/* Header Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0a192f] border border-[#1e3a5f]">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-serif">
                <UserCheck className="w-5 h-5 text-[#d4af37]" />
                <span>Listas de Chamada por Sessão Específica</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Crie listas pontuais com notas do treinador e marcações em bloco para treinos ou torneios.
              </p>
            </div>

            <button
              onClick={() => {
                setShowNewSessionForm(!showNewSessionForm);
                if (!showNewSessionForm) {
                  const initial: Record<string, AttendanceStatus> = {};
                  athletes.forEach((a) => { initial[a.id] = 'presente'; });
                  setSessionAthleteChecks(initial);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8952b] text-[#060e1c] font-bold text-xs sm:text-sm hover:brightness-110 active:scale-[0.99] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{showNewSessionForm ? 'Fechar Formulário' : 'Nova Chamada de Sessão'}</span>
            </button>
          </div>

          {/* Collapsible New Session Form */}
          {showNewSessionForm && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!sessionTitle.trim() || athletes.length === 0) return;

              setIsSaving(true);
              const records: AttendanceRecordItem[] = athletes.map((a) => ({
                athleteId: a.id,
                athleteName: a.name,
                status: sessionAthleteChecks[a.id] || 'ausente',
              }));

              const formattedDate = sessionDate ? sessionDate.split('-').reverse().join('/') : new Date().toLocaleDateString('pt-BR');

              const success = await addAttendanceSession({
                title: sessionTitle.trim(),
                type: sessionType,
                date: formattedDate,
                location: sessionLocation.trim(),
                notes: sessionNotes.trim() || undefined,
                records,
              });

              setIsSaving(false);
              if (success) {
                setSuccessMsg(`Lista de presença para "${sessionTitle.trim()}" salva com sucesso!`);
                setSessionTitle('');
                setSessionNotes('');
                setShowNewSessionForm(false);
                setTimeout(() => setSuccessMsg(''), 5000);
              }
            }} className="p-6 rounded-2xl bg-[#081528] border-2 border-[#d4af37]/40 space-y-6 shadow-2xl animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#1e3a5f] pb-4">
                <div className="flex items-center gap-2 text-white font-bold text-base">
                  <Sparkles className="w-4 h-4 text-[#d4af37]" />
                  <span>Registrar Nova Sessão de Presença</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Tipo de Atividade *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSessionType('treino')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        sessionType === 'treino'
                          ? 'bg-blue-600/30 border-blue-400 text-blue-200 shadow'
                          : 'bg-black/40 border-[#1e3a5f] text-slate-400 hover:text-white'
                      }`}
                    >
                      <Waves className="w-3.5 h-3.5" />
                      <span>Treino</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSessionType('campeonato')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        sessionType === 'campeonato'
                          ? 'bg-[#d4af37]/30 border-[#d4af37] text-[#f3e5ab] shadow'
                          : 'bg-black/40 border-[#1e3a5f] text-slate-400 hover:text-white'
                      }`}
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Campeonato</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Título da Sessão *
                  </label>
                  <input
                    type="text"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    placeholder="Ex: Treino Técnico - Centro Paralímpico"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-[#1e3a5f] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-[#1e3a5f] text-white text-xs focus:outline-none focus:border-[#d4af37]"
                    required
                  />
                </div>
              </div>

              {/* Athletes Checklist */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Presença dos Atletas ({athletes.length}):</span>
                  </label>

                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        const updated: Record<string, AttendanceStatus> = {};
                        athletes.forEach((a) => { updated[a.id] = 'presente'; });
                        setSessionAthleteChecks(updated);
                      }}
                      className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-medium transition-colors cursor-pointer"
                    >
                      ✅ Todos Presentes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const updated: Record<string, AttendanceStatus> = {};
                        athletes.forEach((a) => { updated[a.id] = 'ausente'; });
                        setSessionAthleteChecks(updated);
                      }}
                      className="px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-medium transition-colors cursor-pointer"
                    >
                      ❌ Todos Ausentes
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-3 rounded-xl bg-black/40 border border-[#1e3a5f]">
                  {athletes.map((athlete) => {
                    const status = sessionAthleteChecks[athlete.id] || 'ausente';
                    const isPresent = status === 'presente';
                    const isJustified = status === 'justificado';

                    return (
                      <div
                        key={athlete.id}
                        onClick={() => {
                          setSessionAthleteChecks((prev) => {
                            const current = prev[athlete.id] || 'ausente';
                            const next: AttendanceStatus = current === 'presente' ? 'ausente' : current === 'ausente' ? 'justificado' : 'presente';
                            return { ...prev, [athlete.id]: next };
                          });
                        }}
                        className={`p-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer select-none ${
                          isPresent
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                            : isJustified
                            ? 'bg-amber-950/40 border-amber-500/50 text-white'
                            : 'bg-black/30 border-white/5 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <img
                            src={athlete.photoUrl}
                            alt={athlete.name}
                            className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/10"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-xs font-semibold truncate text-white">{athlete.name}</span>
                        </div>

                        <div className="shrink-0">
                          {isPresent && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-black flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Presente</span>
                            </span>
                          )}
                          {isJustified && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-black flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>Justificado</span>
                            </span>
                          )}
                          {!isPresent && !isJustified && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                              <X className="w-3 h-3" />
                              <span>Ausente</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1e3a5f]">
                <button
                  type="button"
                  onClick={() => setShowNewSessionForm(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !sessionTitle.trim()}
                  className="px-5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#e5c058] text-[#060e1c] font-bold text-xs shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Lista de Presença'}
                </button>
              </div>
            </form>
          )}

          {/* Filter Row */}
          <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-[#1e3a5f] w-fit">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'all' ? 'bg-[#d4af37] text-[#060e1c]' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas ({attendanceSessions.length})
            </button>
            <button
              onClick={() => setActiveFilter('treino')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'treino' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Waves className="w-3.5 h-3.5" />
              <span>Treinos ({totalTreinos})</span>
            </button>
            <button
              onClick={() => setActiveFilter('campeonato')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'campeonato' ? 'bg-[#d4af37] text-[#060e1c]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Campeonatos ({totalCampeonatos})</span>
            </button>
          </div>

          {/* Sessions List */}
          <div className="space-y-3">
            {attendanceSessions
              .filter((s) => activeFilter === 'all' ? true : s.type === activeFilter)
              .map((session) => {
                const isExpanded = expandedSessionId === session.id;
                const isTreino = session.type === 'treino';
                const presentCount = session.records.filter((r) => r.status === 'presente' || r.status === 'justificado').length;
                const totalCount = session.records.length || athletes.length;
                const percent = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

                return (
                  <div key={session.id} className="rounded-2xl bg-[#0a192f] border border-[#1e3a5f] overflow-hidden shadow-md">
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl shrink-0 ${isTreino ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30'}`}>
                          {isTreino ? <Waves className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isTreino ? 'bg-blue-500/20 text-blue-300' : 'bg-[#d4af37]/20 text-[#f3e5ab]'}`}>
                              {isTreino ? 'Treino' : 'Campeonato'}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">{session.date}</span>
                          </div>
                          <h5 className="text-sm sm:text-base font-bold text-white mt-0.5">{session.title}</h5>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="text-right">
                          <div className="text-xs font-bold text-white">
                            <span className="text-emerald-400">{presentCount}</span> / {totalCount} atletas
                          </div>
                          <div className="text-[11px] text-[#d4af37] font-mono font-bold">{percent}% de Presença</div>
                        </div>

                        <button
                          onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>{isExpanded ? 'Ocultar' : 'Ver / Dar Check'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Deseja realmente excluir a lista "${session.title}"?`)) {
                              deleteAttendanceSession(session.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                          title="Excluir Lista"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 sm:px-6 pb-5 pt-2 border-t border-[#1e3a5f]/60 bg-[#071326]/60">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1">
                          {athletes.map((ath) => {
                            const record = session.records.find((r) => r.athleteId === ath.id);
                            const status: AttendanceStatus = record ? record.status : 'ausente';
                            const isPresent = status === 'presente';
                            const isJustified = status === 'justificado';

                            return (
                              <div
                                key={ath.id}
                                onClick={() => toggleAthletePresence(session.id, ath.id)}
                                className={`p-2 rounded-lg border transition-all flex items-center justify-between cursor-pointer select-none ${
                                  isPresent
                                    ? 'bg-emerald-950/40 border-emerald-500/40 text-white'
                                    : isJustified
                                    ? 'bg-amber-950/40 border-amber-500/40 text-white'
                                    : 'bg-black/20 border-white/5 text-slate-400 hover:border-white/20'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0 pr-2">
                                  <img
                                    src={ath.photoUrl}
                                    alt={ath.name}
                                    className="w-6 h-6 rounded-full object-cover shrink-0 border border-white/10"
                                    referrerPolicy="no-referrer"
                                  />
                                  <span className="text-xs font-medium truncate text-white">{ath.name}</span>
                                </div>

                                <div className="shrink-0">
                                  {isPresent && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-black flex items-center gap-0.5">
                                      <Check className="w-2.5 h-2.5" />
                                      <span>Presente</span>
                                    </span>
                                  )}
                                  {isJustified && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-black flex items-center gap-0.5">
                                      <AlertCircle className="w-2.5 h-2.5" />
                                      <span>Justificado</span>
                                    </span>
                                  )}
                                  {!isPresent && !isJustified && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-0.5">
                                      <X className="w-2.5 h-2.5" />
                                      <span>Ausente</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

        </div>
      )}

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        athletes={athletes}
        attendanceSessions={attendanceSessions}
        initialReportType={exportInitialType}
        initialMonth={selectedMonth}
        initialYear={selectedYear}
        initialAthleteId={selectedAthleteId}
      />

    </div>
  );
};
