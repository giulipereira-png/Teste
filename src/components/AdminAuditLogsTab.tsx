import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  RotateCw, 
  Download, 
  Calendar, 
  User, 
  MessageSquare, 
  Database, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  Lock,
  Layers,
  Sparkles,
  ChevronRight,
  Info,
  HeartHandshake
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { AuditLogItem, AuditActionType, AuditTargetType } from '../types';

export const AdminAuditLogsTab: React.FC = () => {
  const { auditLogs, refreshAuditLogs } = useCommunity();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedTarget, setSelectedTarget] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLogForDetail, setSelectedLogForDetail] = useState<AuditLogItem | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAuditLogs();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Filter and sort logs (newest first)
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesAuthor = (log.authorName || '').toLowerCase().includes(term);
        const matchesTarget = (log.targetName || '').toLowerCase().includes(term);
        const matchesDetails = (log.details || '').toLowerCase().includes(term);
        const matchesRole = (log.authorRole || '').toLowerCase().includes(term);
        if (!matchesAuthor && !matchesTarget && !matchesDetails && !matchesRole) {
          return false;
        }
      }

      // Action filter
      if (selectedAction !== 'all' && log.action !== selectedAction) {
        return false;
      }

      // Target filter
      if (selectedTarget !== 'all' && log.targetType !== selectedTarget) {
        return false;
      }

      return true;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [auditLogs, searchTerm, selectedAction, selectedTarget]);

  // Statistics
  const stats = useMemo(() => {
    const total = auditLogs.length;
    const athletesCount = auditLogs.filter((l) => l.targetType === 'Atleta').length;
    const eventsCount = auditLogs.filter((l) => l.targetType === 'Evento').length;
    const cheersCount = auditLogs.filter((l) => l.targetType === 'Recado').length;
    const backupsCount = auditLogs.filter((l) => l.targetType === 'Backup' || l.action === 'Backup').length;
    return { total, athletesCount, eventsCount, cheersCount, backupsCount };
  }, [auditLogs]);

  // Export filtered logs to CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = ['Data e Hora', 'Autor', 'Cargo/Função', 'Ação', 'Entidade', 'Registro Alvo', 'Detalhes das Alterações'];
    const rows = filteredLogs.map((log) => [
      `"${log.formattedDate || log.timestamp}"`,
      `"${(log.authorName || '').replace(/"/g, '""')}"`,
      `"${(log.authorRole || '').replace(/"/g, '""')}"`,
      `"${log.action}"`,
      `"${log.targetType}"`,
      `"${(log.targetName || '').replace(/"/g, '""')}"`,
      `"${(log.details || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `acedep_log_auditoria_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export filtered logs to JSON
  const handleExportJSON = () => {
    if (filteredLogs.length === 0) return;
    const exportPackage = {
      institution: 'Associação Cultural Especial Paradesportiva Paulista - ACEDEP',
      exportedAt: new Date().toISOString(),
      recordCount: filteredLogs.length,
      auditLogs: filteredLogs,
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPackage, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `acedep_log_auditoria_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadge = (action: AuditActionType) => {
    switch (action) {
      case 'Criação':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Criação
          </span>
        );
      case 'Edição':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            Edição
          </span>
        );
      case 'Exclusão':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            Exclusão
          </span>
        );
      case 'Backup':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Backup
          </span>
        );
      case 'Presença':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            Presença
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/15 text-slate-300 border border-slate-500/30">
            {action}
          </span>
        );
    }
  };

  const getTargetIcon = (targetType: AuditTargetType) => {
    switch (targetType) {
      case 'Atleta':
        return <User className="w-3.5 h-3.5 text-[#d4af37]" />;
      case 'Evento':
        return <Calendar className="w-3.5 h-3.5 text-sky-400" />;
      case 'Recado':
        return <MessageSquare className="w-3.5 h-3.5 text-pink-400" />;
      case 'Backup':
        return <Database className="w-3.5 h-3.5 text-amber-400" />;
      case 'Apoiador':
        return <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div id="admin-audit-logs-tab" className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#0a182e] via-[#0d2242] to-[#0a182e] border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f3e5ab] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                Segurança & Rastreabilidade LGPD
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Imutabilidade Ativa
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
              Log de Auditoria Administrativa
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Registro cronológico completo de todas as alterações realizadas no portal da ACEDEP (atletas, tempos, eventos e recados), garantindo transparência, integridade e conformidade regulatória.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              title="Atualizar registros do Firestore"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#d4af37]' : ''}`} />
              <span>{isRefreshing ? 'Sincronizando...' : 'Atualizar'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={filteredLogs.length === 0}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              title="Exportar registros filtrados em planilha CSV"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>

            <button
              onClick={handleExportJSON}
              disabled={filteredLogs.length === 0}
              className="px-3.5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#b8952b] text-[#060e1c] text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer disabled:opacity-50"
              title="Exportar registros filtrados em JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-[#0a192f]/70 border border-white/5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 block">Total de Operações</span>
          <div className="text-2xl font-bold font-mono text-white flex items-baseline gap-1.5">
            <span>{stats.total}</span>
            <span className="text-[10px] text-slate-400 font-sans">logs</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a192f]/70 border border-white/5 space-y-1">
          <span className="text-[11px] font-semibold text-[#d4af37] block flex items-center gap-1">
            <User className="w-3 h-3" />
            Atletas & Tempos
          </span>
          <div className="text-2xl font-bold font-mono text-[#f3e5ab]">
            {stats.athletesCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a192f]/70 border border-white/5 space-y-1">
          <span className="text-[11px] font-semibold text-sky-400 block flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Calendário & Eventos
          </span>
          <div className="text-2xl font-bold font-mono text-sky-300">
            {stats.eventsCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a192f]/70 border border-white/5 space-y-1">
          <span className="text-[11px] font-semibold text-pink-400 block flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            Mural & Recados
          </span>
          <div className="text-2xl font-bold font-mono text-pink-300">
            {stats.cheersCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a192f]/70 border border-white/5 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-amber-400 block flex items-center gap-1">
            <Database className="w-3 h-3" />
            Backups Realizados
          </span>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {stats.backupsCount}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0a182e] border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por autor, atleta, evento ou descrição da alteração..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#d4af37] transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Target Type Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Tipo:
            </span>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-[#d4af37]"
            >
              <option value="all">Todas as Entidades</option>
              <option value="Atleta">Atletas & Métricas</option>
              <option value="Evento">Calendário & Competições</option>
              <option value="Apoiador">Apoiadores & Patrocinadores</option>
              <option value="Recado">Mural da Família</option>
              <option value="Backup">Backups do Sistema</option>
              <option value="Presença">Listas de Treino</option>
              <option value="Sistema">Sistema Geral</option>
            </select>
          </div>

          {/* Action Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400">Ação:</span>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-[#d4af37]"
            >
              <option value="all">Todas as Ações</option>
              <option value="Criação">Criação (Novos)</option>
              <option value="Edição">Edição (Atualizações)</option>
              <option value="Exclusão">Exclusão (Remoções)</option>
              <option value="Backup">Backups (JSON)</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5 text-xs text-slate-400">
          <span>Atalhos:</span>
          <button
            onClick={() => { setSelectedAction('all'); setSelectedTarget('Atleta'); }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              selectedTarget === 'Atleta' && selectedAction === 'all'
                ? 'bg-[#d4af37] text-[#060e1c]'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            Edições de Atletas
          </button>
          <button
            onClick={() => { setSelectedAction('all'); setSelectedTarget('Evento'); }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              selectedTarget === 'Evento'
                ? 'bg-sky-500 text-white'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            Eventos & Competições
          </button>
          <button
            onClick={() => { setSelectedAction('all'); setSelectedTarget('Recado'); }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              selectedTarget === 'Recado'
                ? 'bg-pink-500 text-white'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            Moderação do Mural
          </button>
          <button
            onClick={() => { setSelectedAction('Exclusão'); setSelectedTarget('all'); }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              selectedAction === 'Exclusão'
                ? 'bg-rose-500 text-white'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            Apenas Exclusões
          </button>
          <button
            onClick={() => { setSelectedAction('all'); setSelectedTarget('all'); setSearchTerm(''); }}
            className="ml-auto text-[11px] text-[#d4af37] hover:underline cursor-pointer"
          >
            Redefinir Filtros
          </button>
        </div>
      </div>

      {/* Logs Table / Stream */}
      <div className="rounded-2xl bg-[#0a182e] border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#d4af37]" />
            <h4 className="text-xs sm:text-sm font-bold text-white">
              Histórico de Eventos ({filteredLogs.length} exibidos)
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            Ordenado do mais recente para o mais antigo
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h5 className="text-sm font-bold text-white">Nenhum registro encontrado</h5>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Nenhuma ação de auditoria corresponde aos filtros atuais. Tente buscar por outros termos ou redefinir os filtros.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                onClick={() => setSelectedLogForDetail(log)}
                className="p-4 sm:p-4.5 hover:bg-white/[0.03] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer group"
              >
                {/* Left side: Action, Entity, Details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {getActionBadge(log.action)}

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/40 border border-white/10 text-slate-300 text-[11px] font-semibold">
                      {getTargetIcon(log.targetType)}
                      <span>{log.targetType}</span>
                    </span>

                    <span className="font-semibold text-white text-xs truncate max-w-md">
                      {log.targetName}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed break-words">
                    {log.details}
                  </p>
                </div>

                {/* Right side: Author & Timestamp */}
                <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-1 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5 text-right">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-200">
                      {log.authorName || 'Administrador'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-[#f3e5ab] font-mono">
                      {log.authorRole || 'Coordenação'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{log.formattedDate || new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#d4af37] transition-colors ml-1 hidden md:inline-block" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security & Immutability Notice */}
      <div className="p-4 rounded-2xl bg-[#06101e] border border-white/5 flex items-start gap-3 text-xs text-slate-400">
        <div className="p-1.5 rounded-lg bg-[#d4af37]/10 text-[#d4af37] shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1 leading-relaxed">
          <strong className="text-slate-200 block font-semibold">
            Garantia de Não-Repúdio e Conformidade com a LGPD
          </strong>
          <p>
            As regras de segurança do Firestore (<code className="text-amber-300 font-mono text-[11px]">firestore.rules</code>) proíbem expressamente que qualquer usuário ou cliente execute operações de <code className="text-rose-300 font-mono text-[11px]">update</code> ou <code className="text-rose-300 font-mono text-[11px]">delete</code> sobre a coleção de auditoria. Cada evento é registrado de forma definitiva, impossibilitando a alteração posterior do histórico de auditoria.
          </p>
        </div>
      </div>

      {/* Detail Modal for Selected Log */}
      {selectedLogForDetail && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0c1f38] border border-[#d4af37]/50 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
                <h4 className="text-sm font-bold text-white font-serif">
                  Detalhes do Registro de Auditoria
                </h4>
              </div>
              <button
                onClick={() => setSelectedLogForDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[#f3e5ab]">ID do Evento</span>
                <p className="font-mono text-slate-300 text-[11px] break-all select-all">
                  {selectedLogForDetail.id}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Ação Executada</span>
                  <div>{getActionBadge(selectedLogForDetail.action)}</div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Entidade Alvo</span>
                  <div className="flex items-center gap-1.5 text-white font-semibold">
                    {getTargetIcon(selectedLogForDetail.targetType)}
                    <span>{selectedLogForDetail.targetType}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Registro Alvo</span>
                <p className="text-white font-semibold">
                  {selectedLogForDetail.targetName}
                </p>
                {selectedLogForDetail.targetId && (
                  <p className="text-[10px] text-slate-400 font-mono">
                    ID: {selectedLogForDetail.targetId}
                  </p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Descrição das Alterações</span>
                <p className="text-slate-200 leading-relaxed">
                  {selectedLogForDetail.details}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Autor Responsável</span>
                  <p className="text-white font-semibold">
                    {selectedLogForDetail.authorName}
                  </p>
                  <p className="text-[10px] text-[#d4af37]">
                    {selectedLogForDetail.authorRole || 'Administrador'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Data e Horário</span>
                  <p className="text-white font-mono text-[11px]">
                    {selectedLogForDetail.formattedDate || new Date(selectedLogForDetail.timestamp).toLocaleString('pt-BR')}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {selectedLogForDetail.timestamp}
                  </p>
                </div>
              </div>

              {selectedLogForDetail.metadata && Object.keys(selectedLogForDetail.metadata).length > 0 && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Metadados Técnicos</span>
                  <pre className="text-[10px] font-mono text-slate-300 p-2 rounded bg-black/60 overflow-x-auto">
                    {JSON.stringify(selectedLogForDetail.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLogForDetail(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
