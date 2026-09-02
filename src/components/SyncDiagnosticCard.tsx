import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  UploadCloud, 
  DownloadCloud, 
  HardDrive, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { DiagnosticsService, FullDiagnosticReport } from '../services/diagnosticsService';
import { usePhotos } from '../context/PhotosContext';
import { useCommunity } from '../context/CommunityContext';

interface SyncDiagnosticCardProps {
  onOpenFullDiagnostic?: () => void;
  compact?: boolean;
}

export const SyncDiagnosticCard: React.FC<SyncDiagnosticCardProps> = ({ 
  onOpenFullDiagnostic, 
  compact = false 
}) => {
  const [report, setReport] = useState<FullDiagnosticReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { isFirebaseConnected, isAdminAuthenticated, currentAdminProfile } = usePhotos();
  const { athletes, newsPosts, attendanceSessions } = useCommunity();

  useEffect(() => {
    // Quick startup test
    runQuickTest();
  }, []);

  const runQuickTest = async () => {
    setIsRunning(true);
    try {
      const res = await DiagnosticsService.runFullDiagnostics();
      setReport(res);
    } catch (e) {
      console.warn('Quick diagnostic failed:', e);
    } finally {
      setIsRunning(false);
    }
  };

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const storageUsage = DiagnosticsService.getLocalStorageUsage();

  if (compact) {
    return (
      <div 
        onClick={onOpenFullDiagnostic}
        className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-[#0a182d] border border-white/10 hover:border-[#d4af37]/40 transition-all cursor-pointer group shadow-md"
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className={`w-2.5 h-2.5 rounded-full ${
              report?.overallStatus === 'healthy' 
                ? 'bg-emerald-400' 
                : report?.overallStatus === 'warning'
                ? 'bg-amber-400'
                : 'bg-red-400'
            }`} />
            <div className={`absolute -inset-0.5 rounded-full animate-ping opacity-75 ${
              report?.overallStatus === 'healthy' 
                ? 'bg-emerald-400' 
                : report?.overallStatus === 'warning'
                ? 'bg-amber-400'
                : 'bg-red-400'
            }`} />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white group-hover:text-[#f3e5ab] transition-colors">
                Status de Sincronização
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {report?.summary?.averageLatencyMs ? `${report.summary.averageLatencyMs}ms` : 'Online'}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              {athletes.length} atletas • {attendanceSessions.length} presenças • Nuvem Firestore
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-[#d4af37] transition-colors">
          <span className="hidden sm:inline text-[11px] font-semibold">Diagnóstico</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#0a1b33] to-[#071324] border border-[#d4af37]/30 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-serif text-[#f3e5ab]">
              Saúde do Banco & Sincronização Multi-Dispositivo
            </h4>
            <p className="text-[11px] text-slate-400">
              Verificação visual da leitura, gravação e permissões do Google Firestore
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={runQuickTest}
            disabled={isRunning}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
            title="Executar novo teste de conectividade"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
          </button>

          {onOpenFullDiagnostic && (
            <button
              onClick={onOpenFullDiagnostic}
              className="px-3 py-1.5 rounded-xl bg-[#d4af37] hover:bg-[#b8952b] text-[#060e1c] text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <span>Abrir Diagnóstico</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of micro-status badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        {/* Network status */}
        <div className="p-2.5 rounded-xl bg-[#061120] border border-white/5 flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400">Rede</div>
            <div className="text-xs font-bold text-white truncate">{isOnline ? 'Online' : 'Sem Internet'}</div>
          </div>
        </div>

        {/* Read status */}
        <div className="p-2.5 rounded-xl bg-[#061120] border border-white/5 flex items-center gap-2">
          <DownloadCloud className="w-4 h-4 text-sky-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400">Leitura Nuvem</div>
            <div className="text-xs font-bold text-white truncate">
              {isFirebaseConnected ? 'Servidor OK' : 'Cache Local'}
            </div>
          </div>
        </div>

        {/* Write status */}
        <div className="p-2.5 rounded-xl bg-[#061120] border border-white/5 flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400">Gravação Nuvem</div>
            <div className="text-xs font-bold text-white truncate">
              {report?.tests.find(t => t.category === 'firestore_write')?.status === 'error' ? 'Bloqueada' : 'Confirmada'}
            </div>
          </div>
        </div>

        {/* Storage status */}
        <div className="p-2.5 rounded-xl bg-[#061120] border border-white/5 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-purple-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400">Armazenamento</div>
            <div className="text-xs font-bold text-white truncate">{storageUsage.percent}% Usado</div>
          </div>
        </div>
      </div>

      {/* Summary message */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-[#060e1a]/80 border border-white/5 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          {report?.overallStatus === 'healthy' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : report?.overallStatus === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span className="text-[11px] leading-tight">
            {report?.overallStatus === 'healthy'
              ? 'Todos os registros de atletas, treinos e fotos estão replicando perfeitamente.'
              : report?.overallStatus === 'warning'
              ? 'Conexão ativa com tolerância a falhas e cache offline local.'
              : 'Possível bloqueio de permissão ou rede detectado. Abra o diagnóstico para detalhes.'}
          </span>
        </div>

        {report?.summary?.averageLatencyMs !== undefined && report.summary.averageLatencyMs > 0 && (
          <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
            Ping: {report.summary.averageLatencyMs}ms
          </span>
        )}
      </div>
    </div>
  );
};
