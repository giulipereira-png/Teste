export type EventCategory = 
  | 'Campeonato Nacional' 
  | 'Campeonato Estadual' 
  | 'Torneio Regional' 
  | 'Festival & Confraternização' 
  | 'Seletiva & Avaliação' 
  | 'Reunião de Pais';

export interface AnnualCalendarEvent {
  id: string;
  title: string;
  category: EventCategory;
  date: string; // e.g. "18/04/2026" or "18 a 20 de Abril de 2026"
  month: number; // 1-12
  year: number; // e.g. 2026
  location: string; // e.g. "Centro Paralímpico Brasileiro - São Paulo, SP"
  description?: string;
  targetCategory?: string; // e.g. "Classes S14 & S21", "Alto Rendimento", "Todos os Atletas"
  status: 'confirmado' | 'previsto' | 'concluido';
  highlight?: boolean;
  createdAt?: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface ImpactStat {
  id: string;
  number: string;
  label: string;
  description: string;
  iconName: string;
}

export interface Nucleo {
  id: string;
  name: string;
  fullName: string;
  type: string;
  address: string;
  neighborhood: string;
  city: string;
  description: string;
  highlights: string[];
  modalities: string[];
  schedule: string;
  badge: string;
  image: string;
  mapUrl: string;
}

export interface Modality {
  id: string;
  title: string;
  category: string;
  description: string;
  targetAudience: string;
  benefits: string[];
  features: string[];
  image: string;
}

export interface TeamMember {
  name: string;
  role: string;
  credentials: string;
  experience: string;
  image: string;
}

export interface AthleteStory {
  name: string;
  modality: string;
  category: string;
  achievement: string;
  quote: string;
  image: string;
}

export type NewsCategory = 
  | 'Resultados & Provas' 
  | 'Comunicados Oficiais' 
  | 'Treinos & Calendário' 
  | 'Eventos & Festivais' 
  | 'Histórias de Superação';

export interface NewsPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: NewsCategory;
  coverUrl: string;
  date: string;
  author: string;
  authorRole?: string;
  pinned?: boolean;
  likesCount: number;
  tags: string[];
  createdAt: string;
}

export interface CommunityCheer {
  id: string;
  authorName: string;
  relationship: string;
  message: string;
  avatarColor: string;
  likes: number;
  createdAt: string;
}

export type SwimmingStroke = 'Livre' | 'Costas' | 'Peito' | 'Borboleta' | 'Medley';

export type DisabilityCategory = 'Deficiente Intelectual' | 'Autista' | 'Síndrome de Down';

export interface SwimmingMetric {
  id: string;
  event: string; // ex: "50m Livre", "100m Livre", "50m Costas", "100m Peito", "50m Borboleta", "200m Medley"
  stroke?: SwimmingStroke;
  bestTime: string; // ex: "00:31.40"
  previousTime?: string; // ex: "00:32.15"
  evolution?: string; // ex: "-0.75s"
  dateRecorded: string;
  stageName: string;
  year?: string; // ex: "2026"
  laneType: '25m' | '50m';
  isPersonalBest?: boolean;
  comparedToChampionship?: string;
  timeDiffSeconds?: number;
}

export type DocumentCategory = 
  | 'Laudo Médico / Neurológico (S14)'
  | 'Laudo Psicológico / Neuropsicológico (WISC/WAIS)'
  | 'Classificação Funcional CBDI / CPB'
  | 'Atestado Médico / Liberação Piscina'
  | 'RG / Documento de Identidade do Atleta'
  | 'RG / CPF do Responsável Legal'
  | 'Comprovante de Residência'
  | 'Termo de Autorização & Imagem'
  | 'Exame Laboratorial / Cardiológico'
  | 'Outro Documento';

export interface AthleteDocumentItem {
  id: string;
  title: string; // ex: "Laudo Médico Elegibilidade S14", "RG Frente e Verso", "Atestado Cardiológico 2026"
  category: DocumentCategory;
  fileName: string; // ex: "laudo-medico-s14.pdf", "rg-frente-verso.jpg"
  fileUrl: string; // Data URL base64 ou link
  fileSize?: string; // ex: "1.2 MB"
  fileType?: string; // ex: "application/pdf" | "image/jpeg" | "image/png"
  uploadedBy: 'Responsável' | 'Técnico' | 'Administrador' | string;
  uploadedByName?: string;
  uploadedAt: string; // ex: "27/08/2026"
  expiryDate?: string; // ex: "15/12/2026" (para atestados e exames)
  status: 'Válido' | 'A vencer' | 'Em Análise' | 'Pendente';
  notes?: string;
  driveFileId?: string;
  driveViewLink?: string;
  driveFolderLink?: string;
  syncedToDrive?: boolean;
}

export interface MedicalDocument {
  id: string;
  name: string;
  status: 'Válido' | 'A vencer' | 'Pendente';
  expiryDate: string;
  notes?: string;
}

export interface CoachNote {
  id: string;
  date: string;
  title: string;
  text: string;
  coachName: string;
  importance: 'normal' | 'alta' | 'destaque';
}

export interface TrainingAttendanceDay {
  date: string;
  status: 'presente' | 'falta_justificada' | 'falta' | 'treino_extra';
  note?: string;
}

export interface AthleteRecord {
  id: string;
  name: string;
  photoUrl: string;
  birthDate: string;
  paralympicClass: string; // ex: "S14 / SB14 / SM14 - Deficiência Intelectual"
  disabilityCategory?: 'Deficiente Intelectual' | 'Autista' | 'Síndrome de Down' | string;
  clubRegistration: string;
  cbdiRegistration?: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  accessCode: string; // Senha ou PIN de acesso individual do responsável
  trainingSchedule: {
    pool: string;
    days: string[];
    time: string;
    lane: string;
    coachName: string;
  };
  attendanceRate: number; // Porcentagem de presença (ex: 94)
  recentAttendance: TrainingAttendanceDay[];
  swimmingMetrics: SwimmingMetric[];
  medicalDocuments: MedicalDocument[];
  documents?: AthleteDocumentItem[]; // Documentação completa com upload e download
  documentStatus?: 'completo' | 'pendente' | 'em_analise' | 'atencao';
  coachNotes: CoachNote[];
  createdAt: string;
}

export interface EmailNotificationLog {
  id: string;
  type: 'noticia' | 'tempo_rp' | 'recado_treinador' | 'credenciais' | 'boletim_geral';
  title: string;
  recipientSummary: string; // e.g. "Todos os 35 Pais/Responsáveis" or "Carlos Silva (gabriel@...)"
  recipientEmails: string[];
  sentAt: string;
  senderName: string;
  contentPreview: string;
  status: 'enviado' | 'pendente';
}

export type AttendanceStatus = 'presente' | 'ausente' | 'justificado';

export interface AttendanceRecordItem {
  athleteId: string;
  athleteName: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface AttendanceSession {
  id: string;
  type: 'treino' | 'campeonato';
  title: string; // ex: "Treino Foco Crawl/Viradas - CPB Raia 3" ou "Campeonato Paulista FAP - 1ª Etapa"
  date: string; // YYYY-MM-DD ou DD/MM/YYYY
  location?: string;
  records: AttendanceRecordItem[];
  presentAthleteIds?: string[];
  totalAthletesCount?: number;
  notes?: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Professor' | 'Coordenador Técnico' | 'Treinador' | 'Técnico de Natação' | 'Gestor de Comunicação' | 'Administrador' | string;
  pin: string;
  createdAt: string;
  isActive: boolean;
  lastLogin?: string;
}

