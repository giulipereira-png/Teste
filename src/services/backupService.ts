import { AthleteRecord, AnnualCalendarEvent, CommunityCheer, AttendanceSession, NewsPost, EmailNotificationLog, AdminUser, AuditLogItem, FirestoreBackupPackage, SponsorItem } from '../types';
import { recordAuditLog } from './auditService';

export interface BackupGenerationOptions {
  athletes: AthleteRecord[];
  annualEvents: AnnualCalendarEvent[];
  communityCheers: CommunityCheer[];
  attendanceSessions: AttendanceSession[];
  newsPosts: NewsPost[];
  emailLogs: EmailNotificationLog[];
  adminUsers: AdminUser[];
  galleryPhotos?: any[];
  sitePhotos?: Record<string, string>;
  auditLogs?: AuditLogItem[];
  sponsors?: SponsorItem[];
  currentUser?: {
    name: string;
    email: string;
    role: string;
  };
}

/**
 * Triggers a direct browser file download for a string or object in JSON format
 */
export const triggerJsonDownload = (data: any, fileName: string): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Gera o backup completo de todas as coleções do Firestore da ACEDEP
 */
export const generateFullFirestoreBackup = async (
  options: BackupGenerationOptions
): Promise<{ success: boolean; fileName: string; totalRecords: number }> => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  const fileName = `backup-acedep-firestore-${dateStr}-${timeStr}.json`;

  const safeAdminUsers = (options.adminUsers || []).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    isActive: u.isActive,
    lastLogin: u.lastLogin,
  }));

  const totalRecords =
    (options.athletes?.length || 0) +
    (options.annualEvents?.length || 0) +
    (options.communityCheers?.length || 0) +
    (options.attendanceSessions?.length || 0) +
    (options.newsPosts?.length || 0) +
    (options.emailLogs?.length || 0) +
    safeAdminUsers.length +
    (options.galleryPhotos?.length || 0) +
    (options.auditLogs?.length || 0) +
    (options.sponsors?.length || 0);

  const backupPackage: FirestoreBackupPackage = {
    metadata: {
      institution: 'ACEDEP: Associação Cultural Especial Paradesportiva Paulista',
      system: 'Portal de Gestão e Natação Paralímpica ACEDEP',
      exportedAt: now.toISOString(),
      exportedDateFormatted: now.toLocaleString('pt-BR'),
      exportedBy: {
        name: options.currentUser?.name || 'Administrador ACEDEP',
        email: options.currentUser?.email || 'acedep@hotmail.com',
        role: options.currentUser?.role || 'Super Admin',
      },
      formatVersion: '1.0',
      totalRecords,
      collectionCounts: {
        athletes: options.athletes?.length || 0,
        annualEvents: options.annualEvents?.length || 0,
        communityCheers: options.communityCheers?.length || 0,
        attendanceSessions: options.attendanceSessions?.length || 0,
        newsPosts: options.newsPosts?.length || 0,
        emailLogs: options.emailLogs?.length || 0,
        adminUsers: safeAdminUsers.length,
        galleryPhotos: options.galleryPhotos?.length || 0,
        sitePhotosCount: Object.keys(options.sitePhotos || {}).length,
        auditLogs: options.auditLogs?.length || 0,
        sponsors: options.sponsors?.length || 0,
      },
    },
    data: {
      athletes: options.athletes || [],
      annualEvents: options.annualEvents || [],
      communityCheers: options.communityCheers || [],
      attendanceSessions: options.attendanceSessions || [],
      newsPosts: options.newsPosts || [],
      emailLogs: options.emailLogs || [],
      adminUsers: safeAdminUsers,
      galleryPhotos: options.galleryPhotos || [],
      sitePhotos: options.sitePhotos || {},
      auditLogs: options.auditLogs || [],
      sponsors: options.sponsors || [],
    },
  };

  // Dispara o download do arquivo JSON
  triggerJsonDownload(backupPackage, fileName);

  // Registra no log de auditoria
  await recordAuditLog({
    action: 'Backup',
    targetType: 'Sistema',
    targetName: 'Banco de Dados Firestore (Completo)',
    details: `Exportou backup geral em JSON com ${totalRecords} registros (incluindo ${options.athletes?.length || 0} atletas, ${options.annualEvents?.length || 0} eventos, ${options.communityCheers?.length || 0} recados) para custódia física/offline.`,
    authorName: options.currentUser?.name,
    authorEmail: options.currentUser?.email,
    authorRole: options.currentUser?.role,
  });

  return { success: true, fileName, totalRecords };
};

/**
 * Gera o backup exclusivo dos Atletas em JSON (Fichas completas, tempos, presença e laudos médicos)
 */
export const generateAthletesOnlyBackup = async (
  athletes: AthleteRecord[],
  currentUser?: { name: string; email: string; role: string }
): Promise<{ success: boolean; fileName: string; athleteCount: number }> => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const fileName = `backup-acedep-atletas-${dateStr}.json`;

  const athleteBackup = {
    metadata: {
      institution: 'ACEDEP: Associação Cultural Especial Paradesportiva Paulista',
      type: 'Cópia de Segurança Exclusiva de Atletas & Laudos',
      exportedAt: now.toISOString(),
      exportedDateFormatted: now.toLocaleString('pt-BR'),
      exportedBy: currentUser || { name: 'Administrador ACEDEP', email: '', role: 'Admin' },
      totalAthletes: athletes.length,
      description: 'Fichas cadastrais completas, tempos cronometrados (RPs), histórico de chamada e metadados de documentação médica/funcional.',
    },
    athletes,
  };

  triggerJsonDownload(athleteBackup, fileName);

  await recordAuditLog({
    action: 'Backup',
    targetType: 'Atleta',
    targetName: 'Fichas Cadastrais dos Atletas',
    details: `Exportou backup JSON dedicado contendo ${athletes.length} atletas com todas as métricas, tempos cronometrados e documentação médica para segurança fora da nuvem.`,
    authorName: currentUser?.name,
    authorEmail: currentUser?.email,
    authorRole: currentUser?.role,
  });

  return { success: true, fileName, athleteCount: athletes.length };
};

/**
 * Inspeciona e valida um arquivo de backup JSON selecionado pelo usuário
 */
export const inspectBackupJsonFile = async (
  file: File
): Promise<{
  isValid: boolean;
  isFullBackup: boolean;
  metadata?: any;
  counts?: Record<string, number>;
  error?: string;
}> => {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);

    if (parsed.metadata && parsed.data) {
      // Pacote completo oficial
      return {
        isValid: true,
        isFullBackup: true,
        metadata: parsed.metadata,
        counts: parsed.metadata.collectionCounts || {},
      };
    } else if (parsed.athletes && Array.isArray(parsed.athletes)) {
      // Backup de atletas
      return {
        isValid: true,
        isFullBackup: false,
        metadata: parsed.metadata || {},
        counts: { athletes: parsed.athletes.length },
      };
    } else if (Array.isArray(parsed)) {
      return {
        isValid: true,
        isFullBackup: false,
        metadata: { totalRecords: parsed.length },
        counts: { registros: parsed.length },
      };
    }

    return {
      isValid: false,
      isFullBackup: false,
      error: 'O arquivo JSON não possui o formato de estrutura reconhecido de backup da ACEDEP.',
    };
  } catch (err: any) {
    return {
      isValid: false,
      isFullBackup: false,
      error: `Arquivo JSON inválido ou corrompido: ${err.message}`,
    };
  }
};
