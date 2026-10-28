import { db, doc, setDoc, collection, getDocs, OperationType, handleFirestoreError } from '../lib/firebase';
import { AuditLogItem, AuditActionType, AuditTargetType, AdminUser } from '../types';

const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'log-init-1',
    timestamp: '2026-09-09T10:15:00.000Z',
    dateFormatted: '09/09/2026 às 10:15',
    authorName: 'Prof. Giuli Pereira',
    authorEmail: 'giuli.pereira@gmail.com',
    authorRole: 'Super Admin',
    action: 'Edição',
    targetType: 'Atleta',
    targetId: 'atleta-1',
    targetName: 'Lucas Gabriel Alves',
    details: 'Atualizou tempo oficial de 50m Livre para 00:31.40 (RP alcançado no Centro Paralímpico).',
  },
  {
    id: 'log-init-2',
    timestamp: '2026-09-08T16:30:00.000Z',
    dateFormatted: '08/09/2026 às 16:30',
    authorName: 'Profª. Amanda Soares',
    authorEmail: 'amanda.coach@acedep.org.br',
    authorRole: 'Treinadora',
    action: 'Criação',
    targetType: 'Evento',
    targetId: 'event-paulista-1',
    targetName: '1ª Etapa Campeonato Paulista Paralímpico',
    details: 'Cadastrou evento oficial no calendário anual com convocação das classes S14 e S21.',
  },
  {
    id: 'log-init-3',
    timestamp: '2026-09-08T14:20:00.000Z',
    dateFormatted: '08/09/2026 às 14:20',
    authorName: 'Prof. Giuli Pereira',
    authorEmail: 'giuli.pereira@gmail.com',
    authorRole: 'Super Admin',
    action: 'Edição',
    targetType: 'Recado',
    targetId: 'cheer-1',
    targetName: 'Mural da Família - Mensagem de Apoio',
    details: 'Revisou e aprovou mensagem de apoio enviada por familiares de atletas no mural.',
  },
  {
    id: 'log-init-4',
    timestamp: '2026-09-07T09:00:00.000Z',
    dateFormatted: '07/09/2026 às 09:00',
    authorName: 'Prof. Gabriel Santos',
    authorEmail: 'gabriel.coach@acedep.org.br',
    authorRole: 'Técnico de Natação',
    action: 'Presença',
    targetType: 'Presença',
    targetId: 'session-1',
    targetName: 'Treino Foco Crawl/Viradas - CPB Raia 3',
    details: 'Registrou chamada com 18 atletas presentes e 2 faltas justificadas.',
  },
  {
    id: 'log-init-5',
    timestamp: '2026-09-06T11:45:00.000Z',
    dateFormatted: '06/09/2026 às 11:45',
    authorName: 'Prof. Giuli Pereira',
    authorEmail: 'giuli.pereira@gmail.com',
    authorRole: 'Super Admin',
    action: 'Backup',
    targetType: 'Sistema',
    targetName: 'Base de Dados Firestore',
    details: 'Exportou backup de segurança completo em JSON para armazenamento offline.',
  }
];

export const formatAuditDate = (date: Date): string => {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${d}/${m}/${y} às ${h}:${min}`;
};

export const getStoredCurrentAdmin = (): { name: string; email: string; role: string } => {
  try {
    const raw = localStorage.getItem('acedep_current_admin_profile');
    if (raw) {
      const parsed: AdminUser = JSON.parse(raw);
      if (parsed.name) {
        return {
          name: parsed.name,
          email: parsed.email || '',
          role: parsed.role || 'Administrador',
        };
      }
    }
  } catch {}

  return {
    name: 'Coordenação ACEDEP',
    email: 'contato@acedep.org.br',
    role: 'Administrador',
  };
};

export interface RecordAuditParams {
  action: AuditActionType;
  targetType: AuditTargetType;
  targetName: string;
  details: string;
  targetId?: string;
  authorName?: string;
  authorEmail?: string;
  authorRole?: string;
}

/**
 * Registra um evento de auditoria imutável no Firestore
 */
export const recordAuditLog = async (params: RecordAuditParams): Promise<AuditLogItem> => {
  const currentAdmin = getStoredCurrentAdmin();
  const authorName = params.authorName || currentAdmin.name;
  const authorEmail = params.authorEmail || currentAdmin.email;
  const authorRole = params.authorRole || currentAdmin.role;

  const now = new Date();
  const logId = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const dateFormatted = formatAuditDate(now);

  const logItem: AuditLogItem = {
    id: logId,
    timestamp: now.toISOString(),
    dateFormatted,
    authorName,
    authorEmail,
    authorRole,
    action: params.action,
    targetType: params.targetType,
    targetId: params.targetId || '',
    targetName: params.targetName,
    details: params.details,
  };

  try {
    await setDoc(doc(db, 'audit_logs', logId), logItem);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `audit_logs/${logId}`);
  }

  return logItem;
};

/**
 * Carrega a lista de logs de auditoria do Firestore
 */
export const fetchAuditLogsFromFirestore = async (): Promise<AuditLogItem[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'audit_logs'));
    if (!snapshot.empty) {
      const list: AuditLogItem[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as AuditLogItem);
      });
      // Ordena decrescente pelo timestamp
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return list;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'audit_logs');
  }

  return INITIAL_AUDIT_LOGS;
};
