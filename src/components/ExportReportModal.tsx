import React, { useState } from 'react';
import { 
  X, 
  FileDown, 
  FileText, 
  Printer, 
  Calendar, 
  Users, 
  Timer, 
  User, 
  Check, 
  Layers, 
  Sparkles,
  Award,
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import { AthleteRecord, AttendanceSession, SwimmingStroke, DisabilityCategory } from '../types';
import { STROKE_OPTIONS } from '../utils/swimmingMetricsHelper';
import { exportReport, ReportType, ExportFormat, INSTITUTION_INFO } from '../utils/exportReportsHelper';

export type { ReportType };

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  athletes: AthleteRecord[];
  attendanceSessions?: AttendanceSession[];
  initialReportType?: ReportType;
  initialAthleteId?: string;
  isMemberPortal?: boolean; // When opened from Athlete/Family portal, restricts/tailors to that athlete
  fixedAthlete?: AthleteRecord;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  athletes,
  attendanceSessions = [],
  initialReportType = 'athletes_general',
  initialAthleteId,
  isMemberPortal = false,
  fixedAthlete,
}) => {
  const [reportType, setReportType] = useState<ReportType>(() => {
    if (isMemberPortal && fixedAthlete) return 'athlete_individual';
    return initialReportType;
  });

  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(() => {
    if (fixedAthlete) return fixedAthlete.id;
    if (initialAthleteId) return initialAthleteId;
    return athletes[0]?.id || '';
  });

  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());
  const [selectedStroke, setSelectedStroke] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [successFeedback, setSuccessFeedback] = useState<string>('');

  if (!isOpen) return null;

  const targetAthletes = fixedAthlete ? [fixedAthlete] : athletes;
  const currentSelectedAthlete = targetAthletes.find(a => a.id === selectedAthleteId) || targetAthletes[0];

  const handleExport = (format: ExportFormat) => {
    setIsExporting(true);
    try {
      exportReport({
        reportType,
        format,
        athletes: targetAthletes,
        attendanceSessions,
        selectedAthleteId: isMemberPortal && fixedAthlete ? fixedAthlete.id : selectedAthleteId,
        selectedMonth,
        selectedYear,
        selectedStroke,
        filterCategory: isMemberPortal ? 'all' : filterCategory,
      });

      setSuccessFeedback(
        format === 'pdf' 
          ? 'Relatório em PDF gerado e baixado com sucesso!'
          : format === 'word'
          ? 'Documento Word (.doc) baixado com sucesso!'
          : 'Janela de impressão e visualização aberta com sucesso!'
      );

      setTimeout(() => setSuccessFeedback(''), 4000);
    } catch (err) {
      console.error('Erro ao exportar relatório:', err);
      alert('Ocorreu um erro ao gerar o relatório. Por favor, tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#0c1f38] border border-[#1e3a5f] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e3a5f] bg-[#071326]/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
                <span>Exportar Relatórios Oficiais</span>
                <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f3e5ab] text-[10px] font-mono font-bold">
                  PDF & Word (.doc)
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isMemberPortal && fixedAthlete 
                  ? `Relatório do atleta: ${fixedAthlete.name} • CNPJ ${INSTITUTION_INFO.cnpj}`
                  : `Emissão de documentos oficiais da ACEDEP • CNPJ ${INSTITUTION_INFO.cnpj}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          
          {/* Feedback message */}
          {successFeedback && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{successFeedback}</span>
            </div>
          )}

          {/* 1. SELEÇÃO DO TIPO DE RELATÓRIO */}
          <div>
            <label className="block text-slate-300 font-bold mb-2 uppercase tracking-wider text-[11px]">
              1. Selecione o Tipo de Relatório
            </label>

            {!isMemberPortal ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setReportType('athletes_general')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                    reportType === 'athletes_general'
                      ? 'bg-[#d4af37]/20 border-[#d4af37] text-white shadow-lg'
                      : 'bg-black/40 border-[#1e3a5f] text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-[#d4af37]/20 text-[#d4af37] shrink-0 mt-0.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Quadro Geral de Atletas</span>
                    <span className="text-[10px] text-slate-400">
                      Cadastros, Reg. CBDI, categorias, responsáveis e contatos.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setReportType('attendance_monthly')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                    reportType === 'attendance_monthly'
                      ? 'bg-[#d4af37]/20 border-[#d4af37] text-white shadow-lg'
                      : 'bg-black/40 border-[#1e3a5f] text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Frequência / Chamada Mensal</span>
                    <span className="text-[10px] text-slate-400">
                      Assiduidade em treinos e campeonatos por mês e ano.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setReportType('swimming_times_ranking')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                    reportType === 'swimming_times_ranking'
                      ? 'bg-[#d4af37]/20 border-[#d4af37] text-white shadow-lg'
                      : 'bg-black/40 border-[#1e3a5f] text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                    <Timer className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Tempos, Ranking & RP</span>
                    <span className="text-[10px] text-slate-400">
                      Recordes Pessoais, evolução cronometrada e campeonatos.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setReportType('athlete_individual')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                    reportType === 'athlete_individual'
                      ? 'bg-[#d4af37]/20 border-[#d4af37] text-white shadow-lg'
                      : 'bg-black/40 border-[#1e3a5f] text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Ficha Individual do Atleta</span>
                    <span className="text-[10px] text-slate-400">
                      Dossiê completo com dados, RPs e histórico de presença.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setReportType('attendance_blank_sheet')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 sm:col-span-2 ${
                    reportType === 'attendance_blank_sheet'
                      ? 'bg-[#d4af37]/20 border-[#d4af37] text-white shadow-lg'
                      : 'bg-black/40 border-[#1e3a5f] text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Lista de Chamada em Branco (Borda de Piscina / Viagens)</span>
                    <span className="text-[10px] text-slate-400">
                      Folha oficial pronta para imprimir e preencher manualmente à caneta nos campeonatos e treinos.
                    </span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setReportType('athlete_individual')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                    reportType === 'athlete_individual'
                      ? 'bg-[#d4af37]/20 border-[#d4af37] text-white shadow-lg'
                      : 'bg-black/40 border-[#1e3a5f] text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Ficha & Dossiê do Atleta</span>
                    <span className="text-[10px] text-slate-400">
                      Dados cadastrais, registro CBDI, RPs e frequência geral.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setReportType('swimming_times_ranking')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                    reportType === 'swimming_times_ranking'
                      ? 'bg-[#d4af37]/20 border-[#d4af37] text-white shadow-lg'
                      : 'bg-black/40 border-[#1e3a5f] text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                    <Timer className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Quadro de Tempos e RP</span>
                    <span className="text-[10px] text-slate-400">
                      Melhores marcas oficiais por estilo e campeonato.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setReportType('attendance_monthly')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 sm:col-span-2 ${
                    reportType === 'attendance_monthly'
                      ? 'bg-[#d4af37]/20 border-[#d4af37] text-white shadow-lg'
                      : 'bg-black/40 border-[#1e3a5f] text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Histórico de Presença em Treinos & Campeonatos</span>
                    <span className="text-[10px] text-slate-400">
                      Relatório de frequência mensal do nadador.
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* 2. FILTROS CONDICIONAIS */}
          <div className="p-4 rounded-2xl bg-black/30 border border-[#1e3a5f] space-y-3">
            <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Opções & Filtros do Relatório</span>
            </label>

            {/* Atleta Selector (When individual) */}
            {reportType === 'athlete_individual' && !isMemberPortal && (
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Selecionar Atleta:</label>
                <select
                  value={selectedAthleteId}
                  onChange={(e) => setSelectedAthleteId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                >
                  {athletes.map((ath) => (
                    <option key={ath.id} value={ath.id}>
                      {ath.name} — {ath.disabilityCategory || 'S14'} ({ath.cbdiRegistration || 'CBDI'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Month & Year (When Attendance) */}
            {reportType === 'attendance_monthly' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Mês de Referência:</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    {MONTH_NAMES.map((m, idx) => (
                      <option key={m} value={idx}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Ano:</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    {[2025, 2026, 2027].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Stroke Selector (When Times Ranking) */}
            {reportType === 'swimming_times_ranking' && (
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Filtrar por Estilo:</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedStroke('all')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      selectedStroke === 'all'
                        ? 'bg-[#d4af37] text-black font-bold'
                        : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    Todos os Estilos
                  </button>
                  {STROKE_OPTIONS.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSelectedStroke(st)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        selectedStroke === st
                          ? 'bg-[#d4af37] text-black font-bold'
                          : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Disability Category Filter (When not member portal) */}
            {!isMemberPortal && (reportType === 'athletes_general' || reportType === 'attendance_blank_sheet') && (
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Filtrar por Condição / Categoria:</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFilterCategory('all')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      filterCategory === 'all'
                        ? 'bg-[#d4af37] text-black font-bold'
                        : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    Todas ({athletes.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterCategory('Deficiente Intelectual')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      filterCategory === 'Deficiente Intelectual'
                        ? 'bg-[#d4af37] text-black font-bold'
                        : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    🧠 Def. Intelectual
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterCategory('Autista')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      filterCategory === 'Autista'
                        ? 'bg-[#d4af37] text-black font-bold'
                        : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    🧩 Autismo / TEA
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterCategory('Síndrome de Down')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      filterCategory === 'Síndrome de Down'
                        ? 'bg-[#d4af37] text-black font-bold'
                        : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    💛 Síndrome de Down
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. BOTÕES DE EXPORTAÇÃO (PDF, WORD, IMPRIMIR) */}
          <div className="pt-2">
            <label className="block text-slate-300 font-bold mb-2 uppercase tracking-wider text-[11px]">
              3. Escolha o Formato de Baixa / Impressão
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* PDF Button */}
              <button
                type="button"
                disabled={isExporting}
                onClick={() => handleExport('pdf')}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold transition-all shadow-lg hover:shadow-red-600/30 flex flex-col items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <FileDown className="w-5 h-5" />
                <span className="text-sm">Baixar em PDF</span>
                <span className="text-[10px] text-red-200 font-normal">Arquivo .pdf oficial</span>
              </button>

              {/* Word Button */}
              <button
                type="button"
                disabled={isExporting}
                onClick={() => handleExport('word')}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-bold transition-all shadow-lg hover:shadow-blue-700/30 flex flex-col items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <FileText className="w-5 h-5" />
                <span className="text-sm">Baixar em Word</span>
                <span className="text-[10px] text-blue-200 font-normal">Arquivo .doc editável</span>
              </button>

              {/* Print / Save PDF Button */}
              <button
                type="button"
                disabled={isExporting}
                onClick={() => handleExport('print')}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-bold transition-all shadow-lg flex flex-col items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Printer className="w-5 h-5" />
                <span className="text-sm">Imprimir / Visualizar</span>
                <span className="text-[10px] text-slate-300 font-normal">Diálogo de impressão</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1e3a5f] bg-[#071326]/90 flex items-center justify-between text-slate-400 text-[11px]">
          <span>ACEDEP • CNPJ: {INSTITUTION_INFO.cnpj}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
