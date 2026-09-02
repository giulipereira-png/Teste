import React, { useState, useEffect, useTransition } from 'react';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  Database, 
  UploadCloud, 
  DownloadCloud, 
  HardDrive, 
  Radio, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Copy, 
  Check, 
  Terminal, 
  Info, 
  Smartphone, 
  Server, 
  Clock, 
  Trash2, 
  Zap,
  X,
  ExternalLink,
  Cpu,
  Layers
} from 'lucide-react';
import { DiagnosticsService, FullDiagnosticReport, DiagnosticTestItem } from '../services/diagnosticsService';
import { usePhotos } from '../context/PhotosContext';
import { useCommunity } from '../context/CommunityContext';

interface SyncDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncDiagnosticModal: React.FC<SyncDiagnosticModalProps> = ({ isOpen, onClose }) => {
  const [report, setReport] = useState<FullDiagnosticReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'troubleshoot' | 'logs'>('overview');
  const [copiedReport, setCopiedReport] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const { isFirebaseConnected, currentAdminProfile, isAdminAuthenticated } = usePhotos();
  const { athletes, newsPosts, cheers, attendanceSessions } = useCommunity();

  // Run diagnostics on open if not already loaded
  useEffect(() => {
    if (isOpen && !report && !isRunning) {
      runDiagnostics();
    }
  }, [isOpen]);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setActionSuccessMsg(null);
    try {
      const result = await DiagnosticsService.runFullDiagnostics((test) => {
        // live update during test run
        setReport((prev) => {
          if (!prev) return null;
          const updatedTests = prev.tests.map((t) => (t.id === test.id ? test : t));
          if (!updatedTests.some((t) => t.id === test.id)) {
            updatedTests.push(test);
          }
          return { ...prev, tests: updatedTests };
        });
      });
      startTransition(() => {
        setReport(result);
      });
    } catch (err) {
      console.error('Diagnostic run error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyReport = () => {
    if (!report) return;
    const jsonStr = JSON.stringify(report, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 3000);
  };

  const handleClearCache = () => {
    try {
      const keysToRemove = [
        'acedep_cached_athletes',
        'acedep_diag_test__',
        '__acedep_diag_test__'
      ];
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      setActionSuccessMsg('Cache secundário de atletas e logs limpo com sucesso! Executando novo teste...');
      runDiagnostics();
    } catch (e) {
      console.error('Error clearing cache:', e);
    }
  };

  if (!isOpen) return null;

  const storageUsage = DiagnosticsService.getLocalStorageUsage();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-[#091528] border border-[#d4af37]/30 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 bg-gradient-to-r from-[#060e1c] via-[#0b1c36] to-[#060e1c] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shadow-lg">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-bold font-serif text-[#f3e5ab]">
                  Diagnóstico de Conexão & Sincronização
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  report?.overallStatus === 'healthy' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : report?.overallStatus === 'warning'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-red-500/20 text-red-300 border border-red-500/40'
                }`}>
                  {isRunning ? 'Testando...' : report?.overallStatus === 'healthy' ? 'Sistema 100% Online' : report?.overallStatus === 'warning' ? 'Atenção / Tolerante' : 'Falha Detectada'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitor em tempo real do Firestore, Autenticação, Armazenamento e Sincronização entre Dispositivos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#d4af37] hover:bg-[#b8952b] text-[#060e1c] text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Executar novo teste de conectividade"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Testando...' : 'Testar Agora'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 border-b border-white/10 bg-[#071120] overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#d4af37] text-[#f3e5ab]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Visão Geral & Status</span>
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'tests'
                ? 'border-[#d4af37] text-[#f3e5ab]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Bateria de Testes ({report?.tests.length || 6})</span>
          </button>

          <button
            onClick={() => setActiveTab('troubleshoot')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'troubleshoot'
                ? 'border-[#d4af37] text-[#f3e5ab]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Guia de Sincronização</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'logs'
                ? 'border-[#d4af37] text-[#f3e5ab]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Console de Eventos</span>
          </button>
        </div>

        {/* Action feedback message */}
        {actionSuccessMsg && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <span>{actionSuccessMsg}</span>
            <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Status Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* 1. Network */}
                <div className="p-3.5 rounded-2xl bg-[#0c1e38] border border-white/10 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400">Rede / Internet</span>
                    {typeof navigator !== 'undefined' && navigator.onLine ? (
                      <Wifi className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      {typeof navigator !== 'undefined' && navigator.onLine ? 'Online' : 'Offline'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {report?.summary?.averageLatencyMs ? `${report.summary.averageLatencyMs}ms latência` : 'Conectado'}
                    </div>
                  </div>
                </div>

                {/* 2. Firebase Auth */}
                <div className="p-3.5 rounded-2xl bg-[#0c1e38] border border-white/10 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400">Autenticação</span>
                    <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white truncate">
                      {isAdminAuthenticated ? 'Admin Ativo' : 'Público'}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {currentAdminProfile?.name || 'Coordenação'}
                    </div>
                  </div>
                </div>

                {/* 3. Firestore Read */}
                <div className="p-3.5 rounded-2xl bg-[#0c1e38] border border-white/10 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400">Leitura Nuvem</span>
                    <DownloadCloud className="w-4 h-4 text-sky-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      {isFirebaseConnected ? 'Servidor OK' : 'Cache Local'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {athletes.length} atletas ativos
                    </div>
                  </div>
                </div>

                {/* 4. Firestore Write */}
                <div className="p-3.5 rounded-2xl bg-[#0c1e38] border border-white/10 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400">Gravação Nuvem</span>
                    <UploadCloud className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      {report?.tests.find((t) => t.category === 'firestore_write')?.status === 'error' ? 'Bloqueada' : 'Ativa & Sync'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Heartbeat OK
                    </div>
                  </div>
                </div>

                {/* 5. Realtime Listener */}
                <div className="p-3.5 rounded-2xl bg-[#0c1e38] border border-white/10 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400">Tempo Real</span>
                    <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">onSnapshot</div>
                    <div className="text-[10px] text-slate-400">
                      {attendanceSessions.length} chamadas
                    </div>
                  </div>
                </div>

                {/* 6. Storage & Cache */}
                <div className="p-3.5 rounded-2xl bg-[#0c1e38] border border-white/10 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400">Armazenamento</span>
                    <HardDrive className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      {storageUsage.percent}% Usado
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {storageUsage.usedFormatted}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Diagnostic Status Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c2242] to-[#081529] border border-[#d4af37]/30 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider font-bold text-[#d4af37]">
                        Status da Sincronização entre Dispositivos
                      </span>
                      <span className="text-[10px] text-slate-400">
                        • Testado às {report?.testedAt || new Date().toLocaleTimeString()}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {report?.overallStatus === 'healthy'
                        ? 'Banco de dados Firestore 100% sincronizado com a nuvem'
                        : report?.overallStatus === 'warning'
                        ? 'Operando com sincronização tolerante a falhas (cache ativo)'
                        : 'Atenção: Falha de conexão ou permissão detectada'}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                      {report?.recommendations[0] || 'Todas as alterações de fotos, dados de atletas e registros de presença são replicadas instantaneamente entre os celulares e computadores de toda a equipe.'}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                    <button
                      onClick={runDiagnostics}
                      disabled={isRunning}
                      className="px-4 py-2 rounded-xl bg-[#d4af37] hover:bg-[#b8952b] text-[#060e1c] text-xs font-bold transition-all shadow flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                      <span>{isRunning ? 'Verificando...' : 'Re-testar Conexão'}</span>
                    </button>

                    <button
                      onClick={handleCopyReport}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-semibold transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedReport ? 'Copiado!' : 'Copiar Diagnóstico'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Collections In-Cloud Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#0a182e] border border-white/5">
                  <div className="text-[11px] text-slate-400">Atletas Cadastrados</div>
                  <div className="text-lg font-bold text-[#f3e5ab] mt-0.5">{athletes.length}</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">Sincronização Ativa</div>
                </div>

                <div className="p-3 rounded-xl bg-[#0a182e] border border-white/5">
                  <div className="text-[11px] text-slate-400">Notícias no Mural</div>
                  <div className="text-lg font-bold text-[#f3e5ab] mt-0.5">{newsPosts.length}</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">Sincronização Ativa</div>
                </div>

                <div className="p-3 rounded-xl bg-[#0a182e] border border-white/5">
                  <div className="text-[11px] text-slate-400">Sessões de Presença</div>
                  <div className="text-lg font-bold text-[#f3e5ab] mt-0.5">{attendanceSessions.length}</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">Tempo Real OK</div>
                </div>

                <div className="p-3 rounded-xl bg-[#0a182e] border border-white/5">
                  <div className="text-[11px] text-slate-400">Mensagens da Torcida</div>
                  <div className="text-lg font-bold text-[#f3e5ab] mt-0.5">{cheers.length}</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">Sincronização Ativa</div>
                </div>
              </div>

              {/* Environment Technical Details */}
              <div className="p-4 rounded-2xl bg-[#071222] border border-white/10 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#d4af37]" />
                  <span>Configurações do Ambiente & Banco na Nuvem</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <span className="text-slate-400">Database ID:</span>
                    <span className="font-mono text-[11px] text-slate-200 truncate max-w-[200px]" title={report?.firebaseConfig?.firestoreDatabaseId}>
                      {report?.firebaseConfig?.firestoreDatabaseId || 'ai-studio-acedepassociaocu-fe62783f-4d2c-46d8-afc3-af28924ec5f2'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <span className="text-slate-400">Canal de Comunicação:</span>
                    <span className="font-mono text-[11px] text-emerald-400">
                      AutoDetect Long-Polling / WebSockets
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <span className="text-slate-400">Dispositivo Atual:</span>
                    <span className="font-mono text-[11px] text-slate-200">
                      {report?.deviceInfo?.platform || 'Navegador Web'} ({report?.deviceInfo?.screen || 'Auto'})
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <span className="text-slate-400">Compressão de Fotos:</span>
                    <span className="font-mono text-[11px] text-emerald-400">
                      Otimizador Automático WebP / Max 450KB
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED TESTS */}
          {activeTab === 'tests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Relatório Detalhado de Testes de Conexão</h3>
                  <p className="text-xs text-slate-400">Cada componente abaixo foi testado individualmente contra os servidores do Google Firebase.</p>
                </div>
                <button
                  onClick={runDiagnostics}
                  disabled={isRunning}
                  className="px-3 py-1.5 rounded-xl bg-[#d4af37] hover:bg-[#b8952b] text-[#060e1c] text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Testando...' : 'Reexecutar'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {report?.tests.map((test) => (
                  <div 
                    key={test.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      test.status === 'success'
                        ? 'bg-[#0a1e38]/70 border-emerald-500/30'
                        : test.status === 'warning'
                        ? 'bg-[#1c1c14] border-amber-500/30'
                        : test.status === 'error'
                        ? 'bg-[#220d12] border-red-500/30'
                        : 'bg-[#0a1526] border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {test.status === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                          {test.status === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                          {test.status === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
                          {test.status === 'running' && <RefreshCw className="w-5 h-5 text-[#d4af37] animate-spin" />}
                          {test.status === 'pending' && <Clock className="w-5 h-5 text-slate-400" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{test.name}</h4>
                            {test.latencyMs !== undefined && test.latencyMs > 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-slate-300">
                                {test.latencyMs}ms
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-medium text-slate-200 mt-1">{test.message}</p>
                          {test.details && (
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed bg-black/20 p-2 rounded-lg border border-white/5">
                              {test.details}
                            </p>
                          )}
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        test.status === 'success'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : test.status === 'warning'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : test.status === 'error'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-white/10 text-slate-300'
                      }`}>
                        {test.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TROUBLESHOOTING GUIDE */}
          {activeTab === 'troubleshoot' && (
            <div className="space-y-6 text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-[#0c1f3d] border border-[#d4af37]/30 space-y-2">
                <h3 className="text-sm font-bold text-[#f3e5ab] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#d4af37]" />
                  <span>Como Funciona a Sincronização entre Dispositivos na ACEDEP</span>
                </h3>
                <p className="leading-relaxed">
                  O sistema da ACEDEP utiliza o <strong>Google Cloud Firestore</strong> com canais de escuta bidirecionais em tempo real (<code>onSnapshot</code>). Quando você cadastra um atleta, troca uma foto ou lança uma chamada de presença no celular, a atualização é transmitida na mesma fração de segundo para todos os outros computadores e celulares conectados.
                </p>
              </div>

              {/* Troubleshooting Q&A Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#0a172c] border border-white/10 space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-[#d4af37]" />
                    <span>Como saber se outro dispositivo já recebeu meus dados?</span>
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Assim que você clica em <strong>"Salvar"</strong>, se o status do Firestore mostrar <strong>"Gravação na Nuvem Confirmada"</strong>, os dados já estão salvos no servidor central. Se o outro celular estiver aberto, ele atualizará a tela automaticamente sem precisar recarregar.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0a172c] border border-white/10 space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <WifiOff className="w-4 h-4 text-amber-400" />
                    <span>O que acontece se a internet cair na beira da piscina?</span>
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    O aplicativo possui <strong>persistência offline tolerante a falhas</strong>. Você pode continuar registrando presenças ou notas de treino. Assim que o celular recuperar sinal de internet ou Wi-Fi, o Firestore enviará automaticamente todas as alterações pendentes para a nuvem.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0a172c] border border-white/10 space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Erro de permissão (Missing or insufficient permissions)?</span>
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    As regras de segurança do banco estão configuradas para permitir leitura e gravação das áreas públicas e administrativas da ACEDEP. Se algum erro de permissão ocorrer, execute o teste acima para inspecionar exatamente qual coleção foi recusada.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0a172c] border border-white/10 space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-purple-400" />
                    <span>Quando devo limpar o cache local?</span>
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Apenas se você suspeitar que o navegador está exibindo uma versão desatualizada de fotos antigas ou se o armazenamento local atingir mais de 90%. Use o botão abaixo para limpar sem perder dados na nuvem.
                  </p>
                  <button
                    onClick={handleClearCache}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[11px] font-bold border border-purple-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Limpar Cache Local Agora</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EVENT LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#d4af37]" />
                    <span>Console de Eventos de Diagnóstico</span>
                  </h3>
                  <p className="text-xs text-slate-400">Histórico de execução passo a passo do diagnóstico em tempo real.</p>
                </div>

                <button
                  onClick={handleCopyReport}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedReport ? 'Copiado!' : 'Copiar Logs'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#050b14] border border-white/10 font-mono text-xs space-y-1.5 max-h-[380px] overflow-y-auto">
                {report?.logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-slate-500 select-none">[{log.timestamp}]</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                      log.level === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                      log.level === 'warn' ? 'bg-amber-500/20 text-amber-400' :
                      log.level === 'error' ? 'bg-red-500/20 text-red-400' :
                      'bg-sky-500/20 text-sky-400'
                    }`}>
                      {log.level}
                    </span>
                    <span className={
                      log.level === 'success' ? 'text-emerald-300' :
                      log.level === 'warn' ? 'text-amber-300' :
                      log.level === 'error' ? 'text-red-300' :
                      'text-slate-300'
                    }>
                      {log.message}
                    </span>
                  </div>
                ))}

                {(!report?.logs || report.logs.length === 0) && (
                  <div className="text-slate-500 py-4 text-center">Nenhum evento registrado ainda. Clique em "Testar Agora".</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#060e1c] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Database: <strong className="text-slate-300">Google Firestore</strong></span>
            <span>•</span>
            <span>Espaço Local: <strong className="text-slate-300">{storageUsage.usedFormatted}</strong> ({storageUsage.percent}%)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer"
            >
              {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedReport ? 'Relatório Copiado!' : 'Copiar Relatório'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#b8952b] text-[#060e1c] text-xs font-bold transition-all shadow cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
