import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Download, 
  ShieldCheck, 
  FileJson, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  HardDrive, 
  Users, 
  Calendar, 
  MessageSquare, 
  Mail, 
  Upload, 
  FileCheck, 
  Info,
  RefreshCw,
  FolderArchive,
  Lock
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { usePhotos } from '../context/PhotosContext';
import { 
  generateFullFirestoreBackup, 
  generateAthletesOnlyBackup, 
  inspectBackupJsonFile 
} from '../services/backupService';
import { FirestoreBackupPackage } from '../types';

export const AdminBackupTab: React.FC = () => {
  const { athletes, annualEvents, cheers, newsPosts, emailLogs, attendanceSessions, auditLogs } = useCommunity();
  const { photos, galleryPhotos, adminUsers, currentAdminProfile } = usePhotos();

  const [isExportingFull, setIsExportingFull] = useState(false);
  const [isExportingAthletes, setIsExportingAthletes] = useState(false);
  const [lastDownloadMessage, setLastDownloadMessage] = useState<string | null>(null);

  // Inspector State
  const [inspectedFile, setInspectedFile] = useState<{
    valid: boolean;
    isFullBackup?: boolean;
    metadata?: any;
    counts?: Record<string, number>;
    error?: string;
    fileName?: string;
  } | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);

  // Estimated stats
  const totalLocalDocuments = useMemo(() => {
    return (
      athletes.length +
      annualEvents.length +
      cheers.length +
      newsPosts.length +
      emailLogs.length +
      attendanceSessions.length +
      auditLogs.length
    );
  }, [athletes, annualEvents, cheers, newsPosts, emailLogs, attendanceSessions, auditLogs]);

  // Past backups from audit log
  const pastBackups = useMemo(() => {
    return auditLogs.filter(
      (log) => log.action === 'Backup' || log.targetType === 'Backup'
    );
  }, [auditLogs]);

  // Handler: Full Backup
  const handleDownloadFullBackup = async () => {
    setIsExportingFull(true);
    setLastDownloadMessage(null);
    try {
      const result = await generateFullFirestoreBackup({
        athletes,
        annualEvents,
        communityCheers: cheers,
        attendanceSessions,
        newsPosts,
        emailLogs,
        adminUsers,
        galleryPhotos,
        sitePhotos: photos,
        auditLogs,
        currentUser: currentAdminProfile ? {
          name: currentAdminProfile.name,
          email: currentAdminProfile.email,
          role: currentAdminProfile.role,
        } : undefined,
      });
      setLastDownloadMessage(
        `Backup completo gerado com sucesso! Arquivo: ${result.fileName}. Foram exportados ${result.totalRecords} registros em formato JSON.`
      );
    } catch (err: any) {
      console.error('Erro ao gerar backup completo:', err);
      setLastDownloadMessage(`Erro ao exportar: ${err?.message || 'Falha na conexão com o Firestore'}`);
    } finally {
      setIsExportingFull(false);
    }
  };

  // Handler: Athletes Only Backup
  const handleDownloadAthletesBackup = async () => {
    setIsExportingAthletes(true);
    setLastDownloadMessage(null);
    try {
      const result = await generateAthletesOnlyBackup(
        athletes,
        currentAdminProfile ? {
          name: currentAdminProfile.name,
          email: currentAdminProfile.email,
          role: currentAdminProfile.role,
        } : undefined
      );
      setLastDownloadMessage(
        `Cópia de segurança dos atletas gerada! Arquivo: ${result.fileName}. ${result.athleteCount} cadastros exportados com sucesso em JSON.`
      );
    } catch (err: any) {
      console.error('Erro ao gerar backup dos atletas:', err);
      setLastDownloadMessage(`Erro ao exportar: ${err?.message || 'Falha na conexão com o Firestore'}`);
    } finally {
      setIsExportingAthletes(false);
    }
  };

  // Handler: Inspect Local File
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsInspecting(true);
    try {
      const result = await inspectBackupJsonFile(file);
      setInspectedFile({
        valid: result.isValid,
        isFullBackup: result.isFullBackup,
        metadata: result.metadata,
        counts: result.counts,
        error: result.error,
        fileName: file.name,
      });
    } catch (err: any) {
      setInspectedFile({
        valid: false,
        error: err?.message || 'Não foi possível ler o arquivo JSON.',
        fileName: file.name,
      });
    } finally {
      setIsInspecting(false);
      // Reset input value so same file can be selected again
      e.target.value = '';
    }
  };

  return (
    <div id="admin-backup-tab" className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#0a182e] via-[#0d2242] to-[#0a182e] border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f3e5ab] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#d4af37]" />
                Salvaguarda de Dados Firestore
              </span>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                Cópia Fora da Nuvem
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
              Backup & Cópia de Segurança em JSON
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Exporte todos os prontuários dos atletas, histórico de tempos, listas de presença, notícias e configurações em formato JSON estruturado. Permite que a administração mantenha cópias de contingência físicas e locais fora dos servidores da nuvem.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 text-right shrink-0">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
              Volume Atual Estimado
            </span>
            <div className="text-xl font-bold font-mono text-[#f3e5ab] flex items-baseline justify-end gap-1">
              <span>{totalLocalDocuments}</span>
              <span className="text-xs text-slate-400 font-sans">documentos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Download Alert Notification */}
      {lastDownloadMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-fade-in shadow-lg">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-medium leading-relaxed">{lastDownloadMessage}</span>
          </div>
          <button
            onClick={() => setLastDownloadMessage(null)}
            className="text-emerald-400 hover:text-white text-xs underline cursor-pointer shrink-0"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Action Cards: Full vs Athletes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Full Backup */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#0a182e] border border-[#d4af37]/30 flex flex-col justify-between space-y-4 hover:border-[#d4af37]/60 transition-all shadow-xl group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 group-hover:scale-105 transition-transform">
                <FolderArchive className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#d4af37]/20 text-[#f3e5ab] text-[10px] font-bold uppercase tracking-wider">
                Recomendado • Global
              </span>
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-bold text-white font-serif">
                Backup Completo do Firestore (JSON)
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Empacota todas as 10 coleções do banco em um único arquivo JSON íntegro, com metadados de identificação da ACEDEP e carimbo de data/hora oficial.
              </p>
            </div>

            {/* Included Collections Pill Grid */}
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-[11px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Coleções Incluídas:
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-slate-300">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#d4af37]" /> Atletas ({athletes.length})
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-sky-400" /> Eventos ({annualEvents.length})
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Presenças ({attendanceSessions.length})
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-pink-400" /> Mural ({cheers.length})
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-indigo-400" /> E-mails ({emailLogs.length})
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-teal-400" /> Auditoria ({auditLogs.length})
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadFullBackup}
            disabled={isExportingFull}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] text-[#060e1c] font-bold text-xs hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
          >
            {isExportingFull ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Gerando Cópia de Segurança...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Baixar Backup Completo em JSON</span>
              </>
            )}
          </button>
        </div>

        {/* Card 2: Athletes Only Backup */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#0a182e] border border-white/10 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all shadow-xl group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold uppercase tracking-wider">
                Prontuários & Laudos
              </span>
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-bold text-white font-serif">
                Backup Exclusivo dos Atletas (JSON)
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Exporta exclusivamente a base cadastral de atletas: dados pessoais, responsáveis, classe funcional, tempos cronometrados (RPs), notas de treino e metadados de laudos médicos.
              </p>
            </div>

            {/* Summary List */}
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-[11px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Conteúdo da Exportação:
              </span>
              <ul className="space-y-1 text-slate-300 list-disc list-inside">
                <li>{athletes.length} atletas paralímpicos cadastrados</li>
                <li>Métricas de evolução e recordes pessoais (RPs)</li>
                <li>Orientações técnicas registradas pelos treinadores</li>
                <li>Histórico recente de presenças nas raias</li>
                <li>Metadados e referências dos laudos e atestados</li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleDownloadAthletesBackup}
            disabled={isExportingAthletes}
            className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow cursor-pointer disabled:opacity-50"
          >
            {isExportingAthletes ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Exportando Prontuários...</span>
              </>
            ) : (
              <>
                <FileJson className="w-4 h-4 text-sky-400" />
                <span>Baixar Apenas Dados dos Atletas (JSON)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Card 3: Backup File Inspector & Validator */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0a182e] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div>
            <h4 className="text-base font-bold text-white font-serif flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#d4af37]" />
              <span>Validador & Inspetor de Arquivo de Backup</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Selecione um arquivo <code className="text-amber-300 font-mono">.json</code> salvo anteriormente para auditar seu conteúdo e validar sua integridade, sem fazer alterações no banco.
            </p>
          </div>

          <label className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0">
            <Upload className="w-3.5 h-3.5" />
            <span>Selecionar Arquivo JSON</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </label>
        </div>

        {isInspecting && (
          <div className="p-6 text-center text-xs text-slate-300 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#d4af37]" />
            <span>Analisando estrutura e metadados do arquivo...</span>
          </div>
        )}

        {inspectedFile && (
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {inspectedFile.valid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                )}
                <div>
                  <h5 className="text-xs font-bold text-white">
                    Arquivo: {inspectedFile.fileName}
                  </h5>
                  <span className={`text-[11px] ${inspectedFile.valid ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {inspectedFile.valid ? 'Estrutura JSON válida e íntegra' : inspectedFile.error}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setInspectedFile(null)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Limpar
              </button>
            </div>

            {inspectedFile.valid && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs border-t border-white/5">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Data da Exportação</span>
                  <span className="font-mono text-white text-[11px]">
                    {inspectedFile.metadata?.exportedDateFormatted || 
                     (inspectedFile.metadata?.exportedAt ? new Date(inspectedFile.metadata.exportedAt).toLocaleString('pt-BR') : 'Informada no arquivo')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Responsável</span>
                  <span className="text-white text-[11px] truncate block">
                    {inspectedFile.metadata?.exportedBy?.name || inspectedFile.metadata?.exportedBy || 'Administração ACEDEP'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total de Atletas</span>
                  <span className="font-mono text-[#f3e5ab] text-[11px] font-bold">
                    {inspectedFile.counts?.athletes ?? inspectedFile.metadata?.totalAthletes ?? '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total de Documentos</span>
                  <span className="font-mono text-sky-300 text-[11px] font-bold">
                    {inspectedFile.metadata?.totalRecords ?? inspectedFile.metadata?.totalDocuments ?? Object.values(inspectedFile.counts || {}).reduce((a: number, b) => a + Number(b), 0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card 4: Historical Backups from Audit Logs */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0a182e] border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#d4af37]" />
            <h4 className="text-sm font-bold text-white font-serif">
              Histórico de Cópias de Segurança Geradas
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            {pastBackups.length} registro(s) no log de auditoria
          </span>
        </div>

        {pastBackups.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            Nenhuma exportação de backup registrada anteriormente neste dispositivo ou banco.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {pastBackups.map((log) => (
              <div
                key={log.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Backup JSON
                    </span>
                    <strong className="text-white">{log.targetName}</strong>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    {log.details}
                  </p>
                </div>

                <div className="text-right shrink-0 font-mono text-[11px] text-slate-400">
                  <span className="block text-slate-300">{log.authorName}</span>
                  <span>{log.formattedDate || new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LGPD & Off-Cloud Storage Guideline Notice */}
      <div className="p-4 rounded-2xl bg-[#06101e] border border-white/5 flex items-start gap-3 text-xs text-slate-400">
        <div className="p-1.5 rounded-lg bg-[#d4af37]/10 text-[#d4af37] shrink-0 mt-0.5">
          <Lock className="w-4 h-4" />
        </div>
        <div className="space-y-1 leading-relaxed">
          <strong className="text-slate-200 block font-semibold">
            Recomendações da ACEDEP para Armazenamento Seguro
          </strong>
          <p>
            Ao realizar o download dos arquivos JSON de backup, certifique-se de armazená-los em discos criptografados ou unidades seguras com controle estrito de acesso. Por conterem dados de identificação e laudos médicos de atletas paralímpicos, os arquivos devem ser tratados em total conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
          </p>
        </div>
      </div>
    </div>
  );
};
