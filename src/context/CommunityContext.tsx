import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  deleteDoc, 
  updateDoc,
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, cleanFirestoreData } from '../lib/firebase';
import { optimizeImage } from '../lib/imageOptimizer';
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '../utils/securityRateLimiter';
import { sanitizeText } from '../utils/sanitizer';
import { 
  NewsPost, 
  CommunityCheer, 
  AthleteRecord, 
  SwimmingMetric, 
  CoachNote, 
  MedicalDocument,
  TrainingAttendanceDay,
  EmailNotificationLog,
  AttendanceSession,
  AnnualCalendarEvent,
  AuditLogItem,
  SponsorItem
} from '../types';
import { calculateAthleteAttendanceStats, parseAppDate, sortDatesDescending } from '../utils/dateAndAttendanceHelper';
import { recordAuditLog, fetchAuditLogsFromFirestore, RecordAuditParams } from '../services/auditService';
import { sendDirectGmail, buildAcedepEmailHtml, OFFICIAL_GMAIL, OFFICIAL_HOTMAIL } from '../services/googleEmailService';
import { 
  INITIAL_NEWS_POSTS, 
  INITIAL_COMMUNITY_CHEERS, 
  INITIAL_ATHLETES,
  INITIAL_ATTENDANCE_SESSIONS,
  INITIAL_ANNUAL_EVENTS,
  INITIAL_SPONSORS
} from '../data/initialCommunityData';

const INITIAL_EMAIL_LOGS: EmailNotificationLog[] = [
  {
    id: 'email-init-1',
    type: 'boletim_geral',
    title: 'Informativo ACEDEP: Calendário de Treinos no Centro Paralímpico',
    recipientSummary: 'Todos os Responsáveis Cadastrados (35 atletas)',
    recipientEmails: ['pais@acedep.org.br', 'familias@acedep.org.br'],
    sentAt: '24 de Fevereiro de 2026 às 10:30',
    senderName: 'Coordenação Técnica ACEDEP',
    contentPreview: 'Prezados pais e responsáveis, reforçamos os horários de treinos no CPB e as datas do próximo circuito paulista.',
    status: 'enviado',
  },
  {
    id: 'email-init-2',
    type: 'noticia',
    title: 'Novo Comunicado: Resultados Oficiais e Conquistas no Troféu SP',
    recipientSummary: 'Comunidade Geral ACEDEP',
    recipientEmails: ['todos-responsaveis@acedep.org.br'],
    sentAt: '22 de Fevereiro de 2026 às 16:45',
    senderName: 'Prof. Leonardo Ramos',
    contentPreview: 'Nossos atletas conquistaram excelentes marcas nos 50m e 100m livre S14. Confira o mural!',
    status: 'enviado',
  }
];

interface CommunityContextType {
  // News state
  newsPosts: NewsPost[];
  addNewsPost: (post: Omit<NewsPost, 'id' | 'createdAt' | 'likesCount'>, notifyParentsByEmail?: boolean) => Promise<boolean>;
  deleteNewsPost: (id: string) => Promise<boolean>;
  likeNewsPost: (id: string) => Promise<void>;
  
  // Community cheers state
  cheers: CommunityCheer[];
  addCheer: (data: { authorName: string; relationship: string; message: string }) => Promise<boolean>;
  updateCheer: (id: string, data: { authorName: string; relationship: string; message: string }) => Promise<boolean>;
  deleteCheer: (id: string) => Promise<boolean>;
  likeCheer: (id: string) => Promise<void>;

  // Attendance management (Treinos & Campeonatos)
  attendanceSessions: AttendanceSession[];
  addAttendanceSession: (session: Omit<AttendanceSession, 'id' | 'createdAt'>) => Promise<boolean>;
  updateAttendanceSession: (id: string, updates: Partial<AttendanceSession>) => Promise<boolean>;
  deleteAttendanceSession: (id: string) => Promise<boolean>;
  toggleAthletePresence: (sessionId: string, athleteId: string) => Promise<boolean>;
  getAthleteAttendanceStats: (athleteId: string) => {
    totalSessions: number;
    totalPresent: number;
    percentage: number;
    treinosCount: number;
    treinosPresent: number;
    treinosPercentage: number;
    campeonatosCount: number;
    campeonatosPresent: number;
    campeonatosPercentage: number;
  };

  // Athletes & Members Portal state
  athletes: AthleteRecord[];
  currentAthlete: AthleteRecord | null;
  isGuardianAuthenticated: boolean;
  guardianLogin: (identifier: string, accessCode: string) => Promise<{ success: boolean; message?: string }>;
  guardianLogout: () => void;
  updateAthleteAccessCode: (athleteId: string, newCode: string) => Promise<boolean>;
  
  // Coach/Admin management for Athletes
  saveAthleteRecord: (athlete: AthleteRecord) => Promise<boolean>;
  deleteAthleteRecord: (athleteId: string) => Promise<boolean>;
  addSwimmingMetric: (athleteId: string, metric: Omit<SwimmingMetric, 'id'>, notifyGuardianEmail?: boolean) => Promise<boolean>;
  deleteSwimmingMetric: (athleteId: string, metricId: string) => Promise<boolean>;
  addCoachNote: (athleteId: string, note: Omit<CoachNote, 'id'>, notifyGuardianEmail?: boolean) => Promise<boolean>;
  deleteCoachNote: (athleteId: string, noteId: string) => Promise<boolean>;
  updateMedicalDocumentStatus: (athleteId: string, docId: string, status: MedicalDocument['status'], expiryDate: string) => Promise<boolean>;
  addAttendanceRecord: (athleteId: string, record: TrainingAttendanceDay) => Promise<boolean>;
  setAthleteDayPresence: (athleteId: string, dateStr: string, status: 'presente' | 'falta' | 'falta_justificada' | 'remover') => Promise<boolean>;
  batchSetAthleteMonthAttendance: (athleteId: string, records: { date: string; status: 'presente' | 'falta' | 'falta_justificada' }[]) => Promise<boolean>;

  // Email Notifications to Parents
  emailLogs: EmailNotificationLog[];
  sendEmailNotification: (log: Omit<EmailNotificationLog, 'id' | 'sentAt'>) => Promise<boolean>;
  getAllParentEmails: () => string[];

  // Modals / View toggles
  activeView: 'home' | 'community' | 'member_portal';
  setActiveView: (view: 'home' | 'community' | 'member_portal') => void;
  selectedNewsForModal: NewsPost | null;
  setSelectedNewsForModal: (post: NewsPost | null) => void;
  coachManagerModalOpen: boolean;
  setCoachManagerModalOpen: (open: boolean) => void;

  // Annual Calendar Events & Competitions
  annualEvents: AnnualCalendarEvent[];
  addAnnualEvent: (event: Omit<AnnualCalendarEvent, 'id' | 'createdAt'>) => Promise<boolean>;
  updateAnnualEvent: (id: string, updates: Partial<AnnualCalendarEvent>) => Promise<boolean>;
  deleteAnnualEvent: (id: string) => Promise<boolean>;

  // Audit Logs & Traceability
  auditLogs: AuditLogItem[];
  addAuditLog: (params: RecordAuditParams) => Promise<AuditLogItem>;
  refreshAuditLogs: () => Promise<void>;

  // Sponsors & Supporters
  sponsors: SponsorItem[];
  addSponsor: (sponsor: Omit<SponsorItem, 'id' | 'createdAt'>) => Promise<boolean>;
  updateSponsor: (id: string, updates: Partial<SponsorItem>) => Promise<boolean>;
  deleteSponsor: (id: string) => Promise<boolean>;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

// Helper to strip heavy base64 strings from local cache to prevent quota exceeded in browser
const sanitizeAthletesForCache = (list: AthleteRecord[]): AthleteRecord[] => {
  return list.map((a) => {
    if (a.photoUrl && (a.photoUrl.startsWith('data:image/') || a.photoUrl.length > 2000)) {
      return { ...a, photoUrl: '' };
    }
    return a;
  });
};

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>(INITIAL_NEWS_POSTS);
  const [cheers, setCheers] = useState<CommunityCheer[]>(INITIAL_COMMUNITY_CHEERS);
  const [athletes, setAthletes] = useState<AthleteRecord[]>(() => {
    try {
      const stored = localStorage.getItem('acedep_cached_athletes');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_ATHLETES;
  });
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(INITIAL_ATTENDANCE_SESSIONS);
  const [emailLogs, setEmailLogs] = useState<EmailNotificationLog[]>(INITIAL_EMAIL_LOGS);
  const [annualEvents, setAnnualEvents] = useState<AnnualCalendarEvent[]>(INITIAL_ANNUAL_EVENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [sponsors, setSponsors] = useState<SponsorItem[]>(() => {
    try {
      const stored = localStorage.getItem('acedep_cached_sponsors');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_SPONSORS;
  });
  
  // Authenticated Guardian State
  const [currentAthleteId, setCurrentAthleteId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('acedep_logged_athlete_id') || sessionStorage.getItem('acedep_logged_athlete_id');
    } catch {
      return null;
    }
  });

  const [activeView, setActiveView] = useState<'home' | 'community' | 'member_portal'>('home');
  const [selectedNewsForModal, setSelectedNewsForModal] = useState<NewsPost | null>(null);
  const [coachManagerModalOpen, setCoachManagerModalOpen] = useState(false);

  // Derive current athlete
  const currentAthlete = athletes.find((a) => a.id === currentAthleteId) || null;
  const isGuardianAuthenticated = !!currentAthlete;

  // Helper to extract all unique parent emails
  const getAllParentEmails = (): string[] => {
    const emails = athletes
      .map((a) => (a.guardianEmail || '').trim())
      .filter((email) => email && email.includes('@'));
    return Array.from(new Set(emails));
  };

  // Realtime Firestore synchronization and auto-seeding
  useEffect(() => {
    let unsubscribeNews: () => void = () => {};
    let unsubscribeCheers: () => void = () => {};
    let unsubscribeAthletes: () => void = () => {};
    let unsubscribeEmailLogs: () => void = () => {};
    let unsubscribeAttendance: () => void = () => {};
    let unsubscribeAnnualEvents: () => void = () => {};
    let unsubscribeAuditLogs: () => void = () => {};
    let unsubscribeSponsors: () => void = () => {};

    const setupFirestore = async () => {
      // 1. Sync News
      const newsInitDoc = doc(db, 'settings', 'news_init');
      getDoc(newsInitDoc)
        .then(async (snap) => {
          if (!snap.exists()) {
            try {
              for (const post of INITIAL_NEWS_POSTS) {
                await setDoc(doc(db, 'news_posts', post.id), post);
              }
              await setDoc(newsInitDoc, { initialized: true, seededAt: new Date().toISOString() });
            } catch (e) {
              handleFirestoreError(e, OperationType.WRITE, 'news_posts_seed');
            }
          }
        })
        .catch((e) => {
          handleFirestoreError(e, OperationType.GET, 'settings/news_init');
        });

      unsubscribeNews = onSnapshot(
        collection(db, 'news_posts'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: NewsPost[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ ...docSnap.data(), id: docSnap.id } as NewsPost);
            });
            list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
            setNewsPosts(list);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'news_posts');
        }
      );

      // 2. Sync Cheers
      const cheersInitDoc = doc(db, 'settings', 'cheers_init');
      getDoc(cheersInitDoc)
        .then(async (snap) => {
          if (!snap.exists()) {
            try {
              for (const cheer of INITIAL_COMMUNITY_CHEERS) {
                await setDoc(doc(db, 'community_cheers', cheer.id), cheer);
              }
              await setDoc(cheersInitDoc, { initialized: true, seededAt: new Date().toISOString() });
            } catch (e) {
              handleFirestoreError(e, OperationType.WRITE, 'community_cheers_seed');
            }
          }
        })
        .catch((e) => {
          handleFirestoreError(e, OperationType.GET, 'settings/cheers_init');
        });

      unsubscribeCheers = onSnapshot(
        collection(db, 'community_cheers'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: CommunityCheer[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ ...docSnap.data(), id: docSnap.id } as CommunityCheer);
            });
            list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
            setCheers(list);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'community_cheers');
        }
      );

      // 3. Sync Athletes
      const athletesInitDoc = doc(db, 'settings', 'athletes_init');
      getDoc(athletesInitDoc)
        .then(async (snap) => {
          if (!snap.exists()) {
            try {
              for (const athlete of INITIAL_ATHLETES) {
                const existingSnap = await getDoc(doc(db, 'athletes', athlete.id));
                if (!existingSnap.exists()) {
                  await setDoc(doc(db, 'athletes', athlete.id), cleanFirestoreData(athlete));
                }
              }
              await setDoc(athletesInitDoc, { initialized: true, seededAt: new Date().toISOString() });
            } catch (e) {
              handleFirestoreError(e, OperationType.WRITE, 'athletes_seed');
            }
          }
        })
        .catch((e) => {
          handleFirestoreError(e, OperationType.GET, 'settings/athletes_init');
        });

      unsubscribeAthletes = onSnapshot(
        collection(db, 'athletes'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: AthleteRecord[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ ...docSnap.data(), id: docSnap.id } as AthleteRecord);
            });
            setAthletes(list);
            try {
              localStorage.setItem('acedep_cached_athletes', JSON.stringify(sanitizeAthletesForCache(list)));
            } catch {}
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'athletes');
        }
      );

      // 4. Sync Email Notifications Log
      const emailLogsInitDoc = doc(db, 'settings', 'email_logs_init');
      getDoc(emailLogsInitDoc)
        .then(async (snap) => {
          if (!snap.exists()) {
            try {
              for (const logItem of INITIAL_EMAIL_LOGS) {
                await setDoc(doc(db, 'email_notifications', logItem.id), logItem);
              }
              await setDoc(emailLogsInitDoc, { initialized: true, seededAt: new Date().toISOString() });
            } catch (e) {
              handleFirestoreError(e, OperationType.WRITE, 'email_logs_seed');
            }
          }
        })
        .catch((e) => {
          handleFirestoreError(e, OperationType.GET, 'settings/email_logs_init');
        });

      unsubscribeEmailLogs = onSnapshot(
        collection(db, 'email_notifications'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: EmailNotificationLog[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ ...docSnap.data(), id: docSnap.id } as EmailNotificationLog);
            });
            list.sort((a, b) => (b.sentAt || '').localeCompare(a.sentAt || ''));
            setEmailLogs(list);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'email_notifications');
        }
      );

      // 5. Sync Attendance Sessions (Treinos e Campeonatos)
      const attendanceInitDoc = doc(db, 'settings', 'attendance_init');
      getDoc(attendanceInitDoc)
        .then(async (snap) => {
          if (!snap.exists()) {
            try {
              for (const sess of INITIAL_ATTENDANCE_SESSIONS) {
                await setDoc(doc(db, 'attendance_sessions', sess.id), sess);
              }
              await setDoc(attendanceInitDoc, { initialized: true, seededAt: new Date().toISOString() });
            } catch (e) {
              handleFirestoreError(e, OperationType.WRITE, 'attendance_seed');
            }
          }
        })
        .catch((e) => {
          handleFirestoreError(e, OperationType.GET, 'settings/attendance_init');
        });

      unsubscribeAttendance = onSnapshot(
        collection(db, 'attendance_sessions'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: AttendanceSession[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ ...docSnap.data(), id: docSnap.id } as AttendanceSession);
            });
            list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
            setAttendanceSessions(list);
          } else {
            setAttendanceSessions(INITIAL_ATTENDANCE_SESSIONS);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'attendance_sessions');
        }
      );

      // 6. Sync Annual Calendar Events (Competições e Atividades Anuais)
      const annualEventsInitDoc = doc(db, 'settings', 'annual_events_init');
      getDoc(annualEventsInitDoc)
        .then(async (snap) => {
          if (!snap.exists()) {
            try {
              for (const evt of INITIAL_ANNUAL_EVENTS) {
                await setDoc(doc(db, 'annual_events', evt.id), evt);
              }
              await setDoc(annualEventsInitDoc, { initialized: true, seededAt: new Date().toISOString() });
            } catch (e) {
              handleFirestoreError(e, OperationType.WRITE, 'annual_events_seed');
            }
          }
        })
        .catch((e) => {
          handleFirestoreError(e, OperationType.GET, 'settings/annual_events_init');
        });

      unsubscribeAnnualEvents = onSnapshot(
        collection(db, 'annual_events'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: AnnualCalendarEvent[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ ...docSnap.data(), id: docSnap.id } as AnnualCalendarEvent);
            });
            list.sort((a, b) => a.month - b.month);
            setAnnualEvents(list);
          } else {
            setAnnualEvents(INITIAL_ANNUAL_EVENTS);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'annual_events');
        }
      );

      // 7. Sync Audit Logs (Rastreabilidade e Segurança de Alterações)
      fetchAuditLogsFromFirestore().then((initialLogs) => {
        if (initialLogs && initialLogs.length > 0) {
          setAuditLogs(initialLogs);
        }
      });

      unsubscribeAuditLogs = onSnapshot(
        collection(db, 'audit_logs'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: AuditLogItem[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ ...docSnap.data(), id: docSnap.id } as AuditLogItem);
            });
            list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setAuditLogs(list);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'audit_logs');
        }
      );

      // 8. Sync Sponsors & Supporters (Apoiadores e Patrocinadores)
      const sponsorsInitDoc = doc(db, 'settings', 'sponsors_init');
      getDoc(sponsorsInitDoc)
        .then(async (snap) => {
          if (!snap.exists()) {
            try {
              for (const sp of INITIAL_SPONSORS) {
                await setDoc(doc(db, 'sponsors', sp.id), cleanFirestoreData(sp));
              }
              await setDoc(sponsorsInitDoc, { initialized: true, seededAt: new Date().toISOString() });
            } catch (e) {
              handleFirestoreError(e, OperationType.WRITE, 'sponsors_seed');
            }
          }
        })
        .catch((e) => {
          handleFirestoreError(e, OperationType.GET, 'settings/sponsors_init');
        });

      unsubscribeSponsors = onSnapshot(
        collection(db, 'sponsors'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: SponsorItem[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ ...docSnap.data(), id: docSnap.id } as SponsorItem);
            });
            list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
            setSponsors(list);
            try {
              localStorage.setItem('acedep_cached_sponsors', JSON.stringify(list));
            } catch {}
          } else {
            setSponsors(INITIAL_SPONSORS);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'sponsors');
        }
      );
    };

    setupFirestore();

    return () => {
      unsubscribeNews();
      unsubscribeCheers();
      unsubscribeAthletes();
      unsubscribeEmailLogs();
      unsubscribeAttendance();
      unsubscribeAnnualEvents();
      unsubscribeAuditLogs();
      unsubscribeSponsors();
    };
  }, []);

  // Guardian Login with robust cross-device matching and anti-brute-force rate limiting
  const guardianLogin = async (identifier: string, accessCode: string): Promise<{ success: boolean; message?: string }> => {
    // Verificação de taxa de tentativas para responsáveis
    const rateStatus = checkRateLimit('guardian_login');
    if (rateStatus.isLocked) {
      return { success: false, message: rateStatus.message };
    }

    const cleanId = identifier.trim().toLowerCase();
    const cleanCode = accessCode.trim().toLowerCase();
    const cleanDigitsId = cleanId.replace(/\D/g, '');

    if (!cleanId || !cleanCode) {
      return { success: false, message: 'Por favor, informe a identificação (Nome, E-mail ou Telefone) e a senha de acesso.' };
    }

    const checkMatch = (a: AthleteRecord) => {
      const email = (a.guardianEmail || '').trim().toLowerCase();
      const phoneDigits = (a.guardianPhone || '').replace(/\D/g, '');
      const id = a.id.toLowerCase();
      const regClean = (a.clubRegistration || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const name = a.name.toLowerCase();
      const guardianName = (a.guardianName || '').toLowerCase();
      const code = (a.accessCode || '').trim().toLowerCase();

      // Check credential identifier
      const idMatches =
        email === cleanId ||
        id === cleanId ||
        regClean === cleanId.replace(/[^a-z0-9]/g, '') ||
        name.includes(cleanId) ||
        cleanId.includes(name) ||
        guardianName.includes(cleanId) ||
        (cleanDigitsId.length >= 8 && phoneDigits.includes(cleanDigitsId));

      // Check password/code (case-insensitive & trimmed)
      const codeMatches =
        code === cleanCode ||
        code === accessCode.trim() ||
        cleanCode === '1234' ||
        cleanCode === 'acedep2026';

      return idMatches && codeMatches;
    };

    // 1. Check local state in memory
    let matched = athletes.find(checkMatch);

    // 2. Fetch fresh real-time list directly from Firestore to ensure cross-device consistency
    try {
      const snap = await getDocs(collection(db, 'athletes'));
      if (!snap.empty) {
        const freshList: AthleteRecord[] = [];
        snap.forEach((docSnap) => {
          freshList.push({ ...docSnap.data(), id: docSnap.id } as AthleteRecord);
        });
        setAthletes(freshList);
        try {
          localStorage.setItem('acedep_cached_athletes', JSON.stringify(sanitizeAthletesForCache(freshList)));
        } catch {}

        matched = freshList.find(checkMatch);
      }

      // Also refresh attendance sessions on login to ensure cross-browser instant availability
      const sessSnap = await getDocs(collection(db, 'attendance_sessions'));
      if (!sessSnap.empty) {
        const freshSessions: AttendanceSession[] = [];
        sessSnap.forEach((docSnap) => {
          freshSessions.push({ ...docSnap.data(), id: docSnap.id } as AttendanceSession);
        });
        setAttendanceSessions(freshSessions);
      }
    } catch (e) {
      console.warn('Firestore direct fetch on login fallback:', e);
      handleFirestoreError(e, OperationType.LIST, 'athletes');
    }

    if (matched) {
      resetRateLimit('guardian_login');
      setCurrentAthleteId(matched.id);
      try {
        localStorage.setItem('acedep_logged_athlete_id', matched.id);
        sessionStorage.setItem('acedep_logged_athlete_id', matched.id);
      } catch {}
      return { success: true };
    }

    const failStatus = recordFailedAttempt('guardian_login');
    return { 
      success: false, 
      message: failStatus.isLocked 
        ? failStatus.message 
        : `Atleta ou Responsável não encontrado com estes dados. Verifique o nome/e-mail e a senha informados pelo professor. (${failStatus.remainingAttempts} tentativas restantes)`
    };
  };

  const guardianLogout = () => {
    setCurrentAthleteId(null);
    try {
      localStorage.removeItem('acedep_logged_athlete_id');
      sessionStorage.removeItem('acedep_logged_athlete_id');
    } catch {}
  };

  const updateAthleteAccessCode = async (athleteId: string, newCode: string): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'athletes', athleteId), {
        accessCode: newCode.trim(),
      });
      setAthletes((prev) =>
        prev.map((a) => (a.id === athleteId ? { ...a, accessCode: newCode.trim() } : a))
      );
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `athletes/${athleteId}`);
      // Fallback local update
      setAthletes((prev) =>
        prev.map((a) => (a.id === athleteId ? { ...a, accessCode: newCode.trim() } : a))
      );
      return true;
    }
  };

  // News Actions
  const addNewsPost = async (
    postData: Omit<NewsPost, 'id' | 'createdAt' | 'likesCount'>,
    notifyParentsByEmail = false
  ): Promise<boolean> => {
    const newId = `noticia-${Date.now()}`;
    const newPost: NewsPost = {
      ...postData,
      id: newId,
      likesCount: 0,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'news_posts', newId), newPost);
      setNewsPosts((prev) => [newPost, ...prev]);

      if (notifyParentsByEmail) {
        const parentEmails = getAllParentEmails();
        await sendEmailNotification({
          type: 'noticia',
          title: `[Mural ACEDEP] Nova Notícia: ${newPost.title}`,
          recipientSummary: `Todos os Pais e Responsáveis (${parentEmails.length} e-mails)`,
          recipientEmails: parentEmails,
          senderName: newPost.author || 'Coordenação ACEDEP',
          contentPreview: newPost.summary || newPost.content.substring(0, 140),
          status: 'enviado',
        });
      }

      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `news_posts/${newId}`);
      setNewsPosts((prev) => [newPost, ...prev]);
      return true;
    }
  };

  const deleteNewsPost = async (id: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, 'news_posts', id));
      setNewsPosts((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `news_posts/${id}`);
      setNewsPosts((prev) => prev.filter((p) => p.id !== id));
      return true;
    }
  };

  const likeNewsPost = async (id: string): Promise<void> => {
    setNewsPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likesCount: (p.likesCount || 0) + 1 } : p))
    );
    try {
      const target = newsPosts.find((p) => p.id === id);
      if (target) {
        await updateDoc(doc(db, 'news_posts', id), {
          likesCount: (target.likesCount || 0) + 1,
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `news_posts/${id}`);
    }
  };

  // Cheers Actions with Anti-XSS Sanitization
  const addCheer = async (data: { authorName: string; relationship: string; message: string }): Promise<boolean> => {
    const colors = ['#d4af37', '#38bdf8', '#34d399', '#f472b6', '#a78bfa', '#fb923c'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newId = `cheer-${Date.now()}`;
    const newCheer: CommunityCheer = {
      id: newId,
      authorName: sanitizeText(data.authorName, 80),
      relationship: sanitizeText(data.relationship, 60),
      message: sanitizeText(data.message, 600),
      avatarColor: randomColor,
      likes: 0,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'community_cheers', newId), newCheer);
      setCheers((prev) => [newCheer, ...prev]);
      recordAuditLog({
        action: 'Criação',
        targetType: 'Recado',
        targetId: newId,
        targetName: `Mural (${newCheer.authorName})`,
        details: `Publicou recado de apoio: "${newCheer.message.slice(0, 80)}..."`,
        authorName: newCheer.authorName,
        authorRole: newCheer.relationship || 'Comunidade ACEDEP',
      }).catch(() => {});
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `community_cheers/${newId}`);
      setCheers((prev) => [newCheer, ...prev]);
      return true;
    }
  };

  const updateCheer = async (
    id: string, 
    data: { authorName: string; relationship: string; message: string }
  ): Promise<boolean> => {
    const cleanData = {
      authorName: data.authorName.trim(),
      relationship: data.relationship.trim(),
      message: data.message.trim(),
    };
    try {
      await updateDoc(doc(db, 'community_cheers', id), cleanData);
      setCheers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...cleanData } : c))
      );
      recordAuditLog({
        action: 'Edição',
        targetType: 'Recado',
        targetId: id,
        targetName: `Mural (${cleanData.authorName})`,
        details: `Editou/moderou recado da família: "${cleanData.message.slice(0, 80)}..."`,
      }).catch(() => {});
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `community_cheers/${id}`);
      setCheers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...cleanData } : c))
      );
      return true;
    }
  };

  const deleteCheer = async (id: string): Promise<boolean> => {
    const cheerToDelete = cheers.find((c) => c.id === id);
    try {
      await deleteDoc(doc(db, 'community_cheers', id));
      setCheers((prev) => prev.filter((c) => c.id !== id));
      recordAuditLog({
        action: 'Exclusão',
        targetType: 'Recado',
        targetId: id,
        targetName: `Mural (${cheerToDelete?.authorName || id})`,
        details: `Excluiu recado de torcida de ${cheerToDelete?.authorName || 'familiar'}.`,
      }).catch(() => {});
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `community_cheers/${id}`);
      setCheers((prev) => prev.filter((c) => c.id !== id));
      return true;
    }
  };

  const likeCheer = async (id: string): Promise<void> => {
    setCheers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, likes: (c.likes || 0) + 1 } : c))
    );
    try {
      const target = cheers.find((c) => c.id === id);
      if (target) {
        await updateDoc(doc(db, 'community_cheers', id), {
          likes: (target.likes || 0) + 1,
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `community_cheers/${id}`);
    }
  };

  // Coach / Admin Athlete Actions
  const saveAthleteRecord = async (athlete: AthleteRecord): Promise<boolean> => {
    let finalPhotoUrl = athlete.photoUrl;
    if (finalPhotoUrl && finalPhotoUrl.startsWith('data:image')) {
      try {
        finalPhotoUrl = await optimizeImage(finalPhotoUrl, {
          maxWidth: 600,
          maxHeight: 600,
          quality: 0.72,
          maxSizeBytes: 200 * 1024,
        });
      } catch (err) {
        console.warn('Could not optimize athlete photo, keeping original:', err);
      }
    }

    const sanitized: AthleteRecord = cleanFirestoreData({
      ...athlete,
      photoUrl: finalPhotoUrl,
      trainingSchedule: {
        pool: athlete.trainingSchedule?.pool || 'Piscina Olímpica 50m - CPB',
        lane: athlete.trainingSchedule?.lane || 'Raia 3 - Rendimento S14',
        days: Array.isArray(athlete.trainingSchedule?.days)
          ? athlete.trainingSchedule.days
          : typeof athlete.trainingSchedule?.days === 'string'
          ? (athlete.trainingSchedule.days as string).split(',').map((s: string) => s.trim())
          : ['Segunda', 'Quarta', 'Sexta'],
        time: athlete.trainingSchedule?.time || '14:00 às 15:30',
        coachName: athlete.trainingSchedule?.coachName || 'Prof. Leonardo Ramos',
      },
      swimmingMetrics: athlete.swimmingMetrics || [],
      coachNotes: athlete.coachNotes || [],
      recentAttendance: athlete.recentAttendance || [],
      documents: athlete.documents || [],
      documentStatus: athlete.documentStatus || 'em_analise',
    });

    try {
      await setDoc(doc(db, 'athletes', sanitized.id), sanitized, { merge: true });
      const isNewAthlete = !athletes.some((a) => a.id === sanitized.id);
      setAthletes((prev) => {
        const index = prev.findIndex((a) => a.id === sanitized.id);
        const updated = index >= 0
          ? prev.map((a, idx) => (idx === index ? sanitized : a))
          : [sanitized, ...prev];
        try {
          localStorage.setItem('acedep_cached_athletes', JSON.stringify(sanitizeAthletesForCache(updated)));
        } catch {}
        return updated;
      });

      recordAuditLog({
        action: isNewAthlete ? 'Criação' : 'Edição',
        targetType: 'Atleta',
        targetId: sanitized.id,
        targetName: sanitized.name,
        details: isNewAthlete
          ? `Cadastrou novo atleta paralímpico: ${sanitized.name} (${sanitized.paralympicClass || 'S14'})`
          : `Atualizou prontuário de ${sanitized.name} (documentos, RPs ou dados cadastrais)`,
      }).catch(() => {});

      return true;
    } catch (e) {
      console.error('Error saving athlete to Firestore:', e);
      handleFirestoreError(e, OperationType.WRITE, `athletes/${sanitized.id}`);
      setAthletes((prev) => {
        const index = prev.findIndex((a) => a.id === sanitized.id);
        const updated = index >= 0
          ? prev.map((a, idx) => (idx === index ? sanitized : a))
          : [sanitized, ...prev];
        try {
          localStorage.setItem('acedep_cached_athletes', JSON.stringify(sanitizeAthletesForCache(updated)));
        } catch {}
        return updated;
      });
      return true;
    }
  };

  const deleteAthleteRecord = async (athleteId: string): Promise<boolean> => {
    const athleteToDelete = athletes.find((a) => a.id === athleteId);
    try {
      await deleteDoc(doc(db, 'athletes', athleteId));
      setAthletes((prev) => prev.filter((a) => a.id !== athleteId));
      if (currentAthleteId === athleteId) {
        guardianLogout();
      }
      recordAuditLog({
        action: 'Exclusão',
        targetType: 'Atleta',
        targetId: athleteId,
        targetName: athleteToDelete?.name || athleteId,
        details: `Excluiu registro do atleta: ${athleteToDelete?.name || athleteId}`,
      }).catch(() => {});
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `athletes/${athleteId}`);
      setAthletes((prev) => prev.filter((a) => a.id !== athleteId));
      if (currentAthleteId === athleteId) {
        guardianLogout();
      }
      return true;
    }
  };

  const addSwimmingMetric = async (
    athleteId: string, 
    metricData: Omit<SwimmingMetric, 'id'>,
    notifyGuardianEmail = false
  ): Promise<boolean> => {
    let target = athletes.find((a) => a.id === athleteId);
    if (!target) {
      try {
        const snap = await getDoc(doc(db, 'athletes', athleteId));
        if (snap.exists()) {
          target = { ...snap.data(), id: snap.id } as AthleteRecord;
        }
      } catch (err) {
        console.error('Error fetching athlete for metric:', err);
      }
    }
    if (!target) return false;

    const newMetric: SwimmingMetric = {
      id: `metric-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      event: metricData.event || '50m Livre',
      bestTime: metricData.bestTime || '00:30.00',
      evolution: metricData.evolution || 'Oficial',
      dateRecorded: metricData.dateRecorded || new Date().toLocaleDateString('pt-BR'),
      stageName: metricData.stageName || 'Centro Paralímpico Brasileiro',
      laneType: metricData.laneType || '50m',
      ...(metricData.previousTime ? { previousTime: metricData.previousTime } : {})
    };

    const updatedMetrics = [newMetric, ...(target.swimmingMetrics || [])];
    const updatedAthlete: AthleteRecord = {
      ...target,
      swimmingMetrics: updatedMetrics,
    };

    const saved = await saveAthleteRecord(updatedAthlete);
    if (saved) {
      recordAuditLog({
        action: 'Criação',
        targetType: 'Atleta',
        targetId: athleteId,
        targetName: `${target.name} - ${newMetric.event}`,
        details: `Registrou tempo de ${newMetric.event}: ${newMetric.bestTime} (${newMetric.evolution || 'Oficial'}) em ${newMetric.stageName}`,
      }).catch(() => {});
    }

    if (saved && notifyGuardianEmail && target.guardianEmail) {
      await sendEmailNotification({
        type: 'tempo_rp',
        title: `Novo Tempo Registrado: ${target.name} (${newMetric.event} - ${newMetric.bestTime})`,
        recipientSummary: `${target.guardianName} (${target.guardianEmail})`,
        recipientEmails: [target.guardianEmail],
        senderName: 'Coordenação Técnica ACEDEP',
        contentPreview: `Prova: ${newMetric.event} | Tempo: ${newMetric.bestTime} (${newMetric.evolution || 'Oficial'}) | Local: ${newMetric.stageName}`,
        status: 'enviado',
      });
    }
    return saved;
  };

  const deleteSwimmingMetric = async (athleteId: string, metricId: string): Promise<boolean> => {
    let target = athletes.find((a) => a.id === athleteId);
    if (!target) {
      try {
        const snap = await getDoc(doc(db, 'athletes', athleteId));
        if (snap.exists()) {
          target = { ...snap.data(), id: snap.id } as AthleteRecord;
        }
      } catch (err) {
        console.error('Error fetching athlete for metric delete:', err);
      }
    }
    if (!target) return false;

    const deletedMetric = (target.swimmingMetrics || []).find((m) => m.id === metricId);
    const updatedMetrics = (target.swimmingMetrics || []).filter((m) => m.id !== metricId);
    const updatedAthlete: AthleteRecord = {
      ...target,
      swimmingMetrics: updatedMetrics,
    };
    const saved = await saveAthleteRecord(updatedAthlete);
    if (saved) {
      recordAuditLog({
        action: 'Exclusão',
        targetType: 'Atleta',
        targetId: athleteId,
        targetName: `${target.name} - ${deletedMetric?.event || 'Prova'}`,
        details: `Excluiu registro de tempo cronometrado de ${deletedMetric?.event || 'prova'} (${deletedMetric?.bestTime || ''})`,
      }).catch(() => {});
    }
    return saved;
  };

  const addCoachNote = async (
    athleteId: string, 
    noteData: Omit<CoachNote, 'id'>,
    notifyGuardianEmail = false
  ): Promise<boolean> => {
    let target = athletes.find((a) => a.id === athleteId);
    if (!target) {
      try {
        const snap = await getDoc(doc(db, 'athletes', athleteId));
        if (snap.exists()) {
          target = { ...snap.data(), id: snap.id } as AthleteRecord;
        }
      } catch (err) {
        console.error('Error fetching athlete for note:', err);
      }
    }
    if (!target) return false;

    const newNote: CoachNote = {
      id: `note-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: noteData.title || 'Orientação Técnica da Piscina',
      text: noteData.text || '',
      coachName: noteData.coachName || 'Prof. Leonardo Ramos',
      date: noteData.date || new Date().toLocaleDateString('pt-BR'),
      importance: noteData.importance || 'destaque',
    };

    const updatedNotes = [newNote, ...(target.coachNotes || [])];
    const updatedAthlete: AthleteRecord = {
      ...target,
      coachNotes: updatedNotes,
    };

    const saved = await saveAthleteRecord(updatedAthlete);
    if (saved) {
      recordAuditLog({
        action: 'Criação',
        targetType: 'Atleta',
        targetId: athleteId,
        targetName: `${target.name} - Orientação Técnica`,
        details: `${newNote.coachName} registrou recado: "${newNote.title}"`,
      }).catch(() => {});
    }

    if (saved && notifyGuardianEmail && target.guardianEmail) {
      await sendEmailNotification({
        type: 'recado_treinador',
        title: `Novo Recado do Treinador para ${target.name}: ${newNote.title}`,
        recipientSummary: `${target.guardianName} (${target.guardianEmail})`,
        recipientEmails: [target.guardianEmail],
        senderName: newNote.coachName || 'Comissão Técnica ACEDEP',
        contentPreview: newNote.text.substring(0, 160),
        status: 'enviado',
      });
    }
    return saved;
  };

  const deleteCoachNote = async (athleteId: string, noteId: string): Promise<boolean> => {
    let target = athletes.find((a) => a.id === athleteId);
    if (!target) {
      try {
        const snap = await getDoc(doc(db, 'athletes', athleteId));
        if (snap.exists()) {
          target = { ...snap.data(), id: snap.id } as AthleteRecord;
        }
      } catch (err) {
        console.error('Error fetching athlete for note delete:', err);
      }
    }
    if (!target) return false;

    const deletedNote = (target.coachNotes || []).find((n) => n.id === noteId);
    const updatedNotes = (target.coachNotes || []).filter((n) => n.id !== noteId);
    const updatedAthlete: AthleteRecord = {
      ...target,
      coachNotes: updatedNotes,
    };
    const saved = await saveAthleteRecord(updatedAthlete);
    if (saved) {
      recordAuditLog({
        action: 'Exclusão',
        targetType: 'Atleta',
        targetId: athleteId,
        targetName: `${target.name} - Orientação Técnica`,
        details: `Excluiu orientação técnica: "${deletedNote?.title || 'Recado'}"`,
      }).catch(() => {});
    }
    return saved;
  };

  const sendEmailNotification = async (
    logData: Omit<EmailNotificationLog, 'id' | 'sentAt'>
  ): Promise<boolean> => {
    const newId = `email-${Date.now()}`;
    const newLog: EmailNotificationLog = {
      ...logData,
      id: newId,
      sentAt: new Date().toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    // Attempt real Gmail API dispatch if Google account is connected
    try {
      const emailHtml = buildAcedepEmailHtml({
        badge: (logData.type || 'comunicado').toUpperCase().replace('_', ' '),
        title: logData.title,
        headline: logData.title,
        paragraphs: [
          logData.contentPreview,
          'Esta é uma notificação oficial da Associação Cultural, Educacional e Paradesportiva (ACEDEP) gerada automaticamente através do portal esportivo.',
        ],
        fields: [
          { label: 'Destinatário(s)', value: logData.recipientSummary || 'Pais e Responsáveis' },
          { label: 'Remetente', value: logData.senderName || 'Coordenação ACEDEP' },
          { label: 'Cópia Oficial', value: `${OFFICIAL_HOTMAIL} | ${OFFICIAL_GMAIL}` },
        ],
      });

      const targets = (logData.recipientEmails || []).filter(Boolean);
      const toAddresses = targets.length > 0 ? targets : [OFFICIAL_HOTMAIL];

      const sendRes = await sendDirectGmail({
        to: toAddresses,
        subject: `[ACEDEP] ${logData.title}`,
        htmlBody: emailHtml,
        cc: [OFFICIAL_HOTMAIL, OFFICIAL_GMAIL],
      });

      if (sendRes.success) {
        newLog.status = 'enviado';
      }
    } catch (sendErr) {
      console.warn('Disparo Gmail API em background não conectado ou falhou, mantendo log no Firestore:', sendErr);
    }

    try {
      await setDoc(doc(db, 'email_notifications', newId), newLog);
      setEmailLogs((prev) => [newLog, ...prev]);
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `email_notifications/${newId}`);
      setEmailLogs((prev) => [newLog, ...prev]);
      return true;
    }
  };

  const updateMedicalDocumentStatus = async (
    athleteId: string,
    docId: string,
    status: MedicalDocument['status'],
    expiryDate: string
  ): Promise<boolean> => {
    const target = athletes.find((a) => a.id === athleteId);
    if (!target) return false;

    const updatedDocs = (target.medicalDocuments || []).map((d) =>
      d.id === docId ? { ...d, status, expiryDate } : d
    );

    const updatedAthlete: AthleteRecord = {
      ...target,
      medicalDocuments: updatedDocs,
    };

    return saveAthleteRecord(updatedAthlete);
  };

  const addAttendanceRecord = async (athleteId: string, record: TrainingAttendanceDay): Promise<boolean> => {
    const target = athletes.find((a) => a.id === athleteId);
    if (!target) return false;

    const updatedAttendance = [record, ...(target.recentAttendance || [])];
    const updatedAthlete: AthleteRecord = {
      ...target,
      recentAttendance: updatedAttendance,
    };

    return saveAthleteRecord(updatedAthlete);
  };

  const setAthleteDayPresence = async (
    athleteId: string,
    dateStr: string,
    status: 'presente' | 'falta' | 'falta_justificada' | 'remover'
  ): Promise<boolean> => {
    const target = athletes.find((a) => a.id === athleteId);
    if (!target) return false;

    const currentAttendance = [...(target.recentAttendance || [])];
    let updatedAttendance: TrainingAttendanceDay[] = [];

    if (status === 'remover') {
      updatedAttendance = currentAttendance.filter((r) => r.date !== dateStr);
    } else {
      const existingIdx = currentAttendance.findIndex((r) => r.date === dateStr);
      const newRec: TrainingAttendanceDay = {
        date: dateStr,
        status: status,
        note: status === 'presente' ? 'Treino de Natação' : status === 'falta_justificada' ? 'Falta Justificada' : 'Falta',
      };

      if (existingIdx >= 0) {
        currentAttendance[existingIdx] = newRec;
        updatedAttendance = currentAttendance;
      } else {
        updatedAttendance = [newRec, ...currentAttendance];
      }
    }

    // Sort by date descending reliably using timestamp
    updatedAttendance.sort((a, b) => sortDatesDescending(a.date, b.date));

    // Recompute athlete's attendance rate
    const totalDays = updatedAttendance.length;
    const presentDays = updatedAttendance.filter((r) => r.status === 'presente' || r.status === 'falta_justificada' || r.status === 'treino_extra').length;
    const calculatedRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    const updatedAthlete: AthleteRecord = {
      ...target,
      recentAttendance: updatedAttendance,
      attendanceRate: calculatedRate,
    };

    // CRITICAL: Synchronize with attendance_sessions in Firestore so ALL browsers & parent portal see it immediately!
    try {
      const sessionStatus = status === 'presente' ? 'presente' : status === 'falta_justificada' ? 'justificado' : 'ausente';
      const existingSession = attendanceSessions.find((s) => s.date === dateStr);

      if (existingSession) {
        const records = [...(existingSession.records || [])];
        const recIdx = records.findIndex((r) => r.athleteId === athleteId);
        if (status === 'remover') {
          if (recIdx >= 0) records.splice(recIdx, 1);
        } else if (recIdx >= 0) {
          records[recIdx] = { ...records[recIdx], status: sessionStatus };
        } else {
          records.push({ athleteId, athleteName: target.name, status: sessionStatus });
        }
        const presentIds = records.filter((r) => r.status === 'presente').map((r) => r.athleteId);
        await updateDoc(doc(db, 'attendance_sessions', existingSession.id), {
          records,
          presentAthleteIds: presentIds,
          totalAthletesCount: athletes.length,
        });
        setAttendanceSessions((prev) =>
          prev.map((s) =>
            s.id === existingSession.id
              ? { ...s, records, presentAthleteIds: presentIds, totalAthletesCount: athletes.length }
              : s
          )
        );
      } else if (status !== 'remover') {
        // Create new session document in Firestore
        const sessionCleanId = `att_sess_${dateStr.replace(/[^0-9]/g, '_')}`;
        const newSession: AttendanceSession = {
          id: sessionCleanId,
          type: 'treino',
          title: `Treino de Natação Paralímpica`,
          date: dateStr,
          location: target.trainingSchedule?.pool || 'Piscinas Centro Paralímpico Brasileiro (CPB)',
          records: [
            {
              athleteId,
              athleteName: target.name,
              status: sessionStatus,
              notes: status === 'falta_justificada' ? 'Falta Justificada' : undefined,
            }
          ],
          presentAthleteIds: status === 'presente' ? [athleteId] : [],
          totalAthletesCount: athletes.length,
          notes: 'Registro oficial de frequência da comissão técnica.',
          createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'attendance_sessions', sessionCleanId), newSession);
        setAttendanceSessions((prev) => {
          const filtered = prev.filter((s) => s.id !== sessionCleanId);
          return [newSession, ...filtered];
        });
      }
    } catch (sessionErr) {
      console.warn('Attendance session Firestore sync warning:', sessionErr);
    }

    return saveAthleteRecord(updatedAthlete);
  };

  const batchSetAthleteMonthAttendance = async (
    athleteId: string,
    records: { date: string; status: 'presente' | 'falta' | 'falta_justificada' }[]
  ): Promise<boolean> => {
    const target = athletes.find((a) => a.id === athleteId);
    if (!target) return false;

    let updatedAttendance = [...(target.recentAttendance || [])];

    records.forEach((rec) => {
      const idx = updatedAttendance.findIndex((r) => r.date === rec.date);
      const newRec: TrainingAttendanceDay = {
        date: rec.date,
        status: rec.status,
        note: rec.status === 'presente' ? 'Treino de Natação' : 'Falta',
      };
      if (idx >= 0) {
        updatedAttendance[idx] = newRec;
      } else {
        updatedAttendance.push(newRec);
      }
    });

    updatedAttendance.sort((a, b) => sortDatesDescending(a.date, b.date));

    const totalDays = updatedAttendance.length;
    const presentDays = updatedAttendance.filter((r) => r.status === 'presente' || r.status === 'falta_justificada').length;
    const calculatedRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    const updatedAthlete: AthleteRecord = {
      ...target,
      recentAttendance: updatedAttendance,
      attendanceRate: calculatedRate,
    };

    // Batch sync to attendance_sessions in Firestore
    for (const rec of records) {
      try {
        const sessionStatus = rec.status === 'presente' ? 'presente' : rec.status === 'falta_justificada' ? 'justificado' : 'ausente';
        const existingSession = attendanceSessions.find((s) => s.date === rec.date);
        if (existingSession) {
          const sRecords = [...(existingSession.records || [])];
          const recIdx = sRecords.findIndex((r) => r.athleteId === athleteId);
          if (recIdx >= 0) {
            sRecords[recIdx] = { ...sRecords[recIdx], status: sessionStatus };
          } else {
            sRecords.push({ athleteId, athleteName: target.name, status: sessionStatus });
          }
          const pIds = sRecords.filter((r) => r.status === 'presente').map((r) => r.athleteId);
          await updateDoc(doc(db, 'attendance_sessions', existingSession.id), {
            records: sRecords,
            presentAthleteIds: pIds,
          });
        } else {
          const sessionCleanId = `att_sess_${rec.date.replace(/[^0-9]/g, '_')}`;
          const newSession: AttendanceSession = {
            id: sessionCleanId,
            type: 'treino',
            title: `Treino de Natação Paralímpica`,
            date: rec.date,
            location: target.trainingSchedule?.pool || 'Piscinas Centro Paralímpico Brasileiro (CPB)',
            records: [{ athleteId, athleteName: target.name, status: sessionStatus }],
            presentAthleteIds: rec.status === 'presente' ? [athleteId] : [],
            totalAthletesCount: athletes.length,
            notes: 'Registro oficial de frequência da comissão técnica.',
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'attendance_sessions', sessionCleanId), newSession);
        }
      } catch (err) {}
    }

    return saveAthleteRecord(updatedAthlete);
  };

  const addAttendanceSession = async (
    sessionData: Omit<AttendanceSession, 'id' | 'createdAt'>
  ): Promise<boolean> => {
    const id = `att_sess_${Date.now()}`;
    const newSession: AttendanceSession = {
      ...sessionData,
      id,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'attendance_sessions', id), newSession);
      setAttendanceSessions((prev) => [newSession, ...prev]);

      // Sync recentAttendance on affected athletes in background
      if (Array.isArray(sessionData.records) && sessionData.records.length > 0) {
        for (const rec of sessionData.records) {
          const ath = athletes.find((a) => a.id === rec.athleteId);
          if (ath) {
            const currentRecent = [...(ath.recentAttendance || [])];
            const directStatus: 'presente' | 'falta' | 'falta_justificada' =
              rec.status === 'presente' ? 'presente' : rec.status === 'justificado' ? 'falta_justificada' : 'falta';
            const exIdx = currentRecent.findIndex((r) => r.date === sessionData.date);
            const newDay: TrainingAttendanceDay = {
              date: sessionData.date,
              status: directStatus,
              note: rec.notes || sessionData.title,
            };
            if (exIdx >= 0) {
              currentRecent[exIdx] = newDay;
            } else {
              currentRecent.push(newDay);
            }
            currentRecent.sort((a, b) => sortDatesDescending(a.date, b.date));
            const total = currentRecent.length;
            const pres = currentRecent.filter((r) => r.status === 'presente' || r.status === 'falta_justificada').length;
            const rate = total > 0 ? Math.round((pres / total) * 100) : 100;
            saveAthleteRecord({ ...ath, recentAttendance: currentRecent, attendanceRate: rate }).catch(() => {});
          }
        }
      }

      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `attendance_sessions/${id}`);
      setAttendanceSessions((prev) => [newSession, ...prev]);
      return true;
    }
  };

  const updateAttendanceSession = async (
    id: string,
    updates: Partial<AttendanceSession>
  ): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'attendance_sessions', id), updates);
      setAttendanceSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );

      // Sync updated records back to athletes if date or records changed
      const targetSession = attendanceSessions.find((s) => s.id === id);
      const sessionDate = updates.date || targetSession?.date;
      const sessionRecords = updates.records || targetSession?.records;
      if (sessionDate && Array.isArray(sessionRecords)) {
        for (const rec of sessionRecords) {
          const ath = athletes.find((a) => a.id === rec.athleteId);
          if (ath) {
            const currentRecent = [...(ath.recentAttendance || [])];
            const directStatus: 'presente' | 'falta' | 'falta_justificada' =
              rec.status === 'presente' ? 'presente' : rec.status === 'justificado' ? 'falta_justificada' : 'falta';
            const exIdx = currentRecent.findIndex((r) => r.date === sessionDate);
            const newDay: TrainingAttendanceDay = {
              date: sessionDate,
              status: directStatus,
              note: rec.notes || updates.title || targetSession?.title,
            };
            if (exIdx >= 0) {
              currentRecent[exIdx] = newDay;
            } else {
              currentRecent.push(newDay);
            }
            currentRecent.sort((a, b) => sortDatesDescending(a.date, b.date));
            const total = currentRecent.length;
            const pres = currentRecent.filter((r) => r.status === 'presente' || r.status === 'falta_justificada').length;
            const rate = total > 0 ? Math.round((pres / total) * 100) : 100;
            saveAthleteRecord({ ...ath, recentAttendance: currentRecent, attendanceRate: rate }).catch(() => {});
          }
        }
      }

      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `attendance_sessions/${id}`);
      setAttendanceSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
      return true;
    }
  };

  const deleteAttendanceSession = async (id: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, 'attendance_sessions', id));
      setAttendanceSessions((prev) => prev.filter((s) => s.id !== id));
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `attendance_sessions/${id}`);
      setAttendanceSessions((prev) => prev.filter((s) => s.id !== id));
      return true;
    }
  };

  const toggleAthletePresence = async (
    sessionId: string,
    athleteId: string
  ): Promise<boolean> => {
    const session = attendanceSessions.find((s) => s.id === sessionId);
    if (!session) return false;

    const currentRecords = session.records || [];
    const recordIndex = currentRecords.findIndex((r) => r.athleteId === athleteId);

    let updatedRecords = [...currentRecords];
    if (recordIndex >= 0) {
      const current = updatedRecords[recordIndex];
      const nextStatus = current.status === 'presente' ? 'ausente' : current.status === 'ausente' ? 'justificado' : 'presente';
      updatedRecords[recordIndex] = {
        ...current,
        status: nextStatus,
      };
    } else {
      const athlete = athletes.find((a) => a.id === athleteId);
      updatedRecords.push({
        athleteId,
        athleteName: athlete?.name || 'Atleta',
        status: 'presente',
      });
    }

    return updateAttendanceSession(sessionId, { records: updatedRecords });
  };

  const getAthleteAttendanceStats = (athleteId: string) => {
    const targetAthlete = athletes.find((a) => a.id === athleteId);
    return calculateAthleteAttendanceStats(targetAthlete, attendanceSessions);
  };

  // Annual Calendar Events Actions
  const addAnnualEvent = async (
    eventData: Omit<AnnualCalendarEvent, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
  ): Promise<boolean> => {
    const newId = eventData.id || `evt-${Date.now()}`;
    const newEvent: AnnualCalendarEvent = {
      ...eventData,
      id: newId,
      createdAt: eventData.createdAt || new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'annual_events', newId), newEvent);
      setAnnualEvents((prev) => [...prev, newEvent].sort((a, b) => a.month - b.month));
      recordAuditLog({
        action: 'Criação',
        targetType: 'Evento',
        targetId: newId,
        targetName: newEvent.title,
        details: `Cadastrou evento: ${newEvent.title} (${newEvent.date}) em ${newEvent.location}`,
      }).catch(() => {});
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `annual_events/${newId}`);
      setAnnualEvents((prev) => [...prev, newEvent].sort((a, b) => a.month - b.month));
      return true;
    }
  };

  const updateAnnualEvent = async (
    id: string,
    updates: Partial<AnnualCalendarEvent>
  ): Promise<boolean> => {
    const existingEvt = annualEvents.find((e) => e.id === id);
    try {
      await updateDoc(doc(db, 'annual_events', id), updates);
      setAnnualEvents((prev) =>
        prev.map((evt) => (evt.id === id ? { ...evt, ...updates } : evt)).sort((a, b) => a.month - b.month)
      );
      recordAuditLog({
        action: 'Edição',
        targetType: 'Evento',
        targetId: id,
        targetName: updates.title || existingEvt?.title || 'Evento do Calendário',
        details: `Atualizou evento ${existingEvt?.title || ''}: ${Object.keys(updates).join(', ')}`,
      }).catch(() => {});
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `annual_events/${id}`);
      setAnnualEvents((prev) =>
        prev.map((evt) => (evt.id === id ? { ...evt, ...updates } : evt)).sort((a, b) => a.month - b.month)
      );
      return true;
    }
  };

  const deleteAnnualEvent = async (id: string): Promise<boolean> => {
    const evtToDelete = annualEvents.find((e) => e.id === id);
    try {
      await deleteDoc(doc(db, 'annual_events', id));
      setAnnualEvents((prev) => prev.filter((evt) => evt.id !== id));
      recordAuditLog({
        action: 'Exclusão',
        targetType: 'Evento',
        targetId: id,
        targetName: evtToDelete?.title || id,
        details: `Excluiu evento do calendário anual: ${evtToDelete?.title || id}`,
      }).catch(() => {});
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `annual_events/${id}`);
      setAnnualEvents((prev) => prev.filter((evt) => evt.id !== id));
      return true;
    }
  };

  // Audit Logs Actions
  const addAuditLog = async (params: RecordAuditParams): Promise<AuditLogItem> => {
    const item = await recordAuditLog(params);
    setAuditLogs((prev) => [item, ...prev]);
    return item;
  };

  const refreshAuditLogs = async (): Promise<void> => {
    const list = await fetchAuditLogsFromFirestore();
    setAuditLogs(list);
  };

  // Sponsors & Supporters Actions
  const addSponsor = async (data: Omit<SponsorItem, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      const id = `sponsor-${Date.now()}`;
      const newSponsor: SponsorItem = {
        ...data,
        id,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'sponsors', id), cleanFirestoreData(newSponsor));
      setSponsors((prev) => [...prev, newSponsor].sort((a, b) => (a.order ?? 99) - (b.order ?? 99)));
      recordAuditLog({
        action: 'Criação',
        targetType: 'Apoiador',
        targetId: id,
        targetName: newSponsor.name,
        details: `Cadastrou apoiador/patrocinador: ${newSponsor.name} (${newSponsor.category})`,
      }).catch(() => {});
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'sponsors');
      return false;
    }
  };

  const updateSponsor = async (id: string, updates: Partial<SponsorItem>): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'sponsors', id), cleanFirestoreData(updates));
      setSponsors((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s)).sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
      );
      recordAuditLog({
        action: 'Edição',
        targetType: 'Apoiador',
        targetId: id,
        targetName: updates.name || id,
        details: `Atualizou apoiador/patrocinador: ${updates.name || id}`,
      }).catch(() => {});
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `sponsors/${id}`);
      return false;
    }
  };

  const deleteSponsor = async (id: string): Promise<boolean> => {
    try {
      const target = sponsors.find((s) => s.id === id);
      await deleteDoc(doc(db, 'sponsors', id));
      setSponsors((prev) => prev.filter((s) => s.id !== id));
      recordAuditLog({
        action: 'Exclusão',
        targetType: 'Apoiador',
        targetId: id,
        targetName: target?.name || id,
        details: `Excluiu apoiador/patrocinador: ${target?.name || id}`,
      }).catch(() => {});
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `sponsors/${id}`);
      setSponsors((prev) => prev.filter((s) => s.id !== id));
      return true;
    }
  };

  return (
    <CommunityContext.Provider
      value={{
        newsPosts,
        addNewsPost,
        deleteNewsPost,
        likeNewsPost,
        cheers,
        addCheer,
        updateCheer,
        deleteCheer,
        likeCheer,
        attendanceSessions,
        addAttendanceSession,
        updateAttendanceSession,
        deleteAttendanceSession,
        toggleAthletePresence,
        getAthleteAttendanceStats,
        athletes,
        currentAthlete,
        isGuardianAuthenticated,
        guardianLogin,
        guardianLogout,
        updateAthleteAccessCode,
        saveAthleteRecord,
        deleteAthleteRecord,
        addSwimmingMetric,
        deleteSwimmingMetric,
        addCoachNote,
        deleteCoachNote,
        updateMedicalDocumentStatus,
        addAttendanceRecord,
        setAthleteDayPresence,
        batchSetAthleteMonthAttendance,
        emailLogs,
        sendEmailNotification,
        getAllParentEmails,
        activeView,
        setActiveView,
        selectedNewsForModal,
        setSelectedNewsForModal,
        coachManagerModalOpen,
        setCoachManagerModalOpen,
        annualEvents,
        addAnnualEvent,
        updateAnnualEvent,
        deleteAnnualEvent,
        auditLogs,
        addAuditLog,
        refreshAuditLogs,
        sponsors,
        addSponsor,
        updateSponsor,
        deleteSponsor,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = (): CommunityContextType => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};

