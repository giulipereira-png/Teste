import React, { useState, useRef } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Newspaper, 
  UserCheck, 
  Timer, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  UserPlus, 
  RefreshCw, 
  Waves, 
  Mail, 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  Images,
  Copy, 
  ExternalLink, 
  Send, 
  Sparkles, 
  KeyRound, 
  Search, 
  Edit3, 
  Check, 
  Smartphone,
  Heart,
  FileText,
  Calendar,
  Eye,
  Lock,
  LogOut,
  ShieldCheck,
  RotateCcw,
  Database,
  Users,
  MapPin,
  History,
  Phone,
  Trophy,
  Award,
  FileDown
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { usePhotos, DEFAULT_PHOTOS, GalleryPhotoItem } from '../context/PhotosContext';
import { NewsCategory, AthleteRecord, EmailNotificationLog, CommunityCheer, DisabilityCategory, SwimmingStroke } from '../types';
import { AttendanceManagerTab } from './admin/AttendanceManagerTab';
import { AdminUsersManagerTab } from './admin/AdminUsersManagerTab';
import { AthleteDocumentsTab } from './AthleteDocumentsTab';
import { ExportReportModal, ReportType } from './ExportReportModal';
import { 
  groupAndRankMetrics, 
  STROKE_OPTIONS, 
  EVENT_PRESETS, 
  getStrokeFromEvent, 
  calculateTimeDifference 
} from '../utils/swimmingMetricsHelper';

const STROKE_DETAILS: { value: SwimmingStroke; label: string; icon: string }[] = [
  { value: 'Livre', label: 'Livre', icon: '🏊' },
  { value: 'Costas', label: 'Costas', icon: '🌊' },
  { value: 'Peito', label: 'Peito', icon: '🏊‍♂️' },
  { value: 'Borboleta', label: 'Borboleta', icon: '🦋' },
  { value: 'Medley', label: 'Medley', icon: '🏅' },
];

// Curated high quality avatars for paralympic swimming athletes
const AVATAR_PRESETS = [
  { id: 'p1', name: 'Atleta Masculino (Gorro Azul)', url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=400&q=80' },
  { id: 'p2', name: 'Atleta Feminina (Óculos de Natação)', url: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=400&q=80' },
  { id: 'p3', name: 'Nadador Podium / Vitória', url: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?auto=format&fit=crop&w=400&q=80' },
  { id: 'p4', name: 'Nadadora Paralímpica Piscina', url: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?auto=format&fit=crop&w=400&q=80' },
  { id: 'p5', name: 'Jovem Promessa S14', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { id: 'p6', name: 'Atleta Competição', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
];

export const AdminCoachPortalModal: React.FC = () => {
  const { 
    coachManagerModalOpen, 
    setCoachManagerModalOpen, 
    newsPosts,
    addNewsPost,
    deleteNewsPost,
    cheers,
    addCheer,
    updateCheer,
    deleteCheer,
    athletes,
    saveAthleteRecord,
    deleteAthleteRecord,
    addSwimmingMetric,
    deleteSwimmingMetric,
    addCoachNote,
    deleteCoachNote,
    emailLogs,
    sendEmailNotification,
    getAllParentEmails,
    annualEvents,
    addAnnualEvent,
    updateAnnualEvent,
    deleteAnnualEvent,
    attendanceSessions,
  } = useCommunity();

  const {
    isAdminAuthenticated,
    currentAdminProfile,
    loginAdmin,
    logoutAdmin,
    adminModalOpen,
    closeAdminModal,
    openAdminModal,
    photos,
    galleryPhotos,
    savePhotoToDatabase,
    resetPhotoToDefault,
    addGalleryPhoto,
    deleteGalleryPhoto,
    updateAdminPin
  } = usePhotos();

  const isSuperAdmin = currentAdminProfile?.email === 'giuli.pereira@gmail.com' || currentAdminProfile?.role === 'Super Admin';
  const isProfessor = currentAdminProfile?.role === 'Professor' || currentAdminProfile?.role === 'Treinador' || currentAdminProfile?.role === 'Técnico de Natação' || (currentAdminProfile && !isSuperAdmin);

  const [activeTab, setActiveTab] = useState<'atletas' | 'presenca' | 'tempos' | 'agenda' | 'recados' | 'mural_familia' | 'emails' | 'administradores' | 'fotos' | 'galeria' | 'noticias' | 'seguranca'>('atletas');

  // Export report modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportModalInitialType, setExportModalInitialType] = useState<ReportType>('athletes_general');
  const [exportModalAthleteId, setExportModalAthleteId] = useState<string | undefined>(undefined);

  // PIN Login Form State
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Search & filter in athletes list
  const [athleteSearchTerm, setAthleteSearchTerm] = useState('');
  const [editingAthlete, setEditingAthlete] = useState<AthleteRecord | null>(null);

  // Form News State
  const [newsTitle, setNewsTitle] = useState('');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsCategory, setNewsCategory] = useState<NewsCategory>('Resultados & Provas');
  const [newsCoverUrl, setNewsCoverUrl] = useState('');
  const [newsAuthor, setNewsAuthor] = useState('Comissão Técnica ACEDEP');
  const [newsNotifyEmail, setNewsNotifyEmail] = useState(true);
  const [isSavingNews, setIsSavingNews] = useState(false);
  const [newsSuccess, setNewsSuccess] = useState('');

  // Form Athlete State (Enhanced for easy creation)
  const [athleteName, setAthleteName] = useState('');
  const [athletePhoto, setAthletePhoto] = useState(AVATAR_PRESETS[0].url);
  const [athleteBirth, setAthleteBirth] = useState('');
  const [athleteDisabilityCategory, setAthleteDisabilityCategory] = useState<DisabilityCategory>('Deficiente Intelectual');
  const [athleteCbdi, setAthleteCbdi] = useState('');
  const [athleteGuardian, setAthleteGuardian] = useState('');
  const [athleteEmail, setAthleteEmail] = useState('');
  const [athletePhone, setAthletePhone] = useState('');
  const [athleteAccessCode, setAthleteAccessCode] = useState('');
  const [athletePool, setAthletePool] = useState('Piscina Olímpica 50m - Centro Paralímpico Brasileiro');
  const [athleteDays, setAthleteDays] = useState('Segunda, Quarta, Sexta');
  const [athleteTime, setAthleteTime] = useState('14:00 às 15:30');
  const [athleteLane, setAthleteLane] = useState('Raia 3 - Rendimento S14');
  const [athleteCoach, setAthleteCoach] = useState('Prof. Leonardo Ramos');
  const [athleteNotifyOnCreate, setAthleteNotifyOnCreate] = useState(true);
  const [isSavingAthlete, setIsSavingAthlete] = useState(false);
  const [isSavingEditAthlete, setIsSavingEditAthlete] = useState(false);
  const [athleteSuccess, setAthleteSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [copiedAccessCard, setCopiedAccessCard] = useState<string | null>(null);
  const [selectedAthleteForDocs, setSelectedAthleteForDocs] = useState<AthleteRecord | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Swimming Metric State
  const [selectedAthleteIdForTime, setSelectedAthleteIdForTime] = useState(athletes[0]?.id || '');
  const [metricEvent, setMetricEvent] = useState('50m Livre');
  const [metricStroke, setMetricStroke] = useState<SwimmingStroke>('Livre');
  const [metricTime, setMetricTime] = useState('00:29.50');
  const [metricPreviousTime, setMetricPreviousTime] = useState('');
  const [metricEvolution, setMetricEvolution] = useState('-0.50s (Novo RP)');
  const [metricStage, setMetricStage] = useState('Circuito Nacional Paralímpico - 1ª Etapa');
  const [metricYear, setMetricYear] = useState<string>('2026');
  const [metricComparedChampionship, setMetricComparedChampionship] = useState('');
  const [metricLaneType, setMetricLaneType] = useState<'25m' | '50m'>('50m');
  const [selectedStrokeFilterAdmin, setSelectedStrokeFilterAdmin] = useState<string>('all');
  const [timeNotifyEmail, setTimeNotifyEmail] = useState(true);
  const [isSavingTime, setIsSavingTime] = useState(false);
  const [timeSuccess, setTimeSuccess] = useState('');
  const [timeError, setTimeError] = useState('');
  const [deletingTimeId, setDeletingTimeId] = useState<string | null>(null);

  // Form Coach Note State
  const [selectedAthleteIdForNote, setSelectedAthleteIdForNote] = useState(athletes[0]?.id || '');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [noteCoachName, setNoteCoachName] = useState('Prof. Leonardo Ramos');
  const [noteNotifyEmail, setNoteNotifyEmail] = useState(true);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState('');
  const [noteError, setNoteError] = useState('');
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [deletingAthleteId, setDeletingAthleteId] = useState<string | null>(null);

  // Form Annual Event (Agenda 2026) State
  const [eventTitle, setEventTitle] = useState('');
  const [eventCategory, setEventCategory] = useState<string>('Competição Oficial');
  const [eventDate, setEventDate] = useState('');
  const [eventMonth, setEventMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [eventLocation, setEventLocation] = useState('Piscina Olímpica 50m - Centro Paralímpico Brasileiro');
  const [eventDescription, setEventDescription] = useState('');
  const [eventTarget, setEventTarget] = useState('Equipe Principal S14');
  const [eventStatus, setEventStatus] = useState<'Confirmado' | 'Previsto'>('Confirmado');
  const [eventNotifyEmail, setEventNotifyEmail] = useState(true);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [eventSuccess, setEventSuccess] = useState('');
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Email Broadcast Center State
  const [broadcastType, setBroadcastType] = useState<'boletim_geral' | 'noticia' | 'recado_treinador'>('boletim_geral');
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastSender, setBroadcastSender] = useState('Coordenação Geral ACEDEP');
  const [broadcastRecipientMode, setBroadcastRecipientMode] = useState<'all' | 'specific'>('all');
  const [broadcastSpecificAthleteId, setBroadcastSpecificAthleteId] = useState(athletes[0]?.id || '');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState('');
  const [confirmDeleteAthleteId, setConfirmDeleteAthleteId] = useState<string | null>(null);
  const [isDeletingAthleteId, setIsDeletingAthleteId] = useState<string | null>(null);

  // Photo & Gallery Manager States
  const [selectedPhotoId, setSelectedPhotoId] = useState<string>('about_team');
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});
  const [successPhotoState, setSuccessPhotoState] = useState<Record<string, string>>({});
  const [customPhotoUrlInput, setCustomPhotoUrlInput] = useState('');
  const [previewOverride, setPreviewOverride] = useState<Record<string, string>>({});
  const [confirmResetId, setConfirmResetId] = useState<string | null>(null);

  // Gallery Photo form state
  const [newGalTitle, setNewGalTitle] = useState('');
  const [newGalCategory, setNewGalCategory] = useState('Equipe Oficial');
  const [newGalDate, setNewGalDate] = useState('');
  const [newGalUrl, setNewGalUrl] = useState('');
  const [newGalPreview, setNewGalPreview] = useState('');
  const [isSavingGallery, setIsSavingGallery] = useState(false);
  const [gallerySuccess, setGallerySuccess] = useState('');
  const [galleryError, setGalleryError] = useState('');
  const [confirmDeleteGalleryId, setConfirmDeleteGalleryId] = useState<string | null>(null);
  const [isDeletingGalleryId, setIsDeletingGalleryId] = useState<string | null>(null);

  // Security / PIN management
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [isSavingPin, setIsSavingPin] = useState(false);
  const [pinSuccess, setPinSuccess] = useState('');
  const [pinFormError, setPinFormError] = useState('');

  // Community Cheers Management State
  const [cheerSearchTerm, setCheerSearchTerm] = useState('');
  const [editingCheer, setEditingCheer] = useState<CommunityCheer | null>(null);
  const [editCheerAuthor, setEditCheerAuthor] = useState('');
  const [editCheerRelation, setEditCheerRelation] = useState('');
  const [editCheerMsg, setEditCheerMsg] = useState('');
  const [isSavingCheer, setIsSavingCheer] = useState(false);
  const [confirmDeleteCheerId, setConfirmDeleteCheerId] = useState<string | null>(null);
  const [isDeletingCheerId, setIsDeletingCheerId] = useState<string | null>(null);
  const [cheerAdminSuccess, setCheerAdminSuccess] = useState('');
  const [cheerAdminError, setCheerAdminError] = useState('');
  const [newAdminCheerAuthor, setNewAdminCheerAuthor] = useState('');
  const [newAdminCheerRelation, setNewAdminCheerRelation] = useState('Coordenação / Técnico');
  const [newAdminCheerMsg, setNewAdminCheerMsg] = useState('');
  const [isAddingAdminCheer, setIsAddingAdminCheer] = useState(false);
  const [addCheerSuccess, setAddCheerSuccess] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(false);
    setIsLoggingIn(true);
    const success = await loginAdmin(pinInput);
    setIsLoggingIn(false);
    if (!success) {
      setPinError(true);
    } else {
      setPinInput('');
    }
  };

  const handleCloseModal = () => {
    setCoachManagerModalOpen(false);
    closeAdminModal();
  };

  // Photo Handlers
  const handlePhotoFileChange = (photoId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setPreviewOverride((prev) => ({ ...prev, [photoId]: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoDrop = (photoId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setPreviewOverride((prev) => ({ ...prev, [photoId]: dataUrl }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhotoToFirestore = async (photoId: string) => {
    const imageToSave = previewOverride[photoId] || customPhotoUrlInput.trim();
    if (!imageToSave) return;

    setUploadingState((prev) => ({ ...prev, [photoId]: true }));
    const success = await savePhotoToDatabase(photoId, imageToSave, DEFAULT_PHOTOS[photoId]?.title);
    setUploadingState((prev) => ({ ...prev, [photoId]: false }));

    if (success) {
      setSuccessPhotoState((prev) => ({ ...prev, [photoId]: 'Salvo com sucesso no Firestore!' }));
      setPreviewOverride((prev) => {
        const copy = { ...prev };
        delete copy[photoId];
        return copy;
      });
      setCustomPhotoUrlInput('');
      setTimeout(() => {
        setSuccessPhotoState((prev) => ({ ...prev, [photoId]: '' }));
      }, 4000);
    }
  };

  const handleResetPhotoExecute = async (photoId: string) => {
    setUploadingState((prev) => ({ ...prev, [photoId]: true }));
    setConfirmResetId(null);
    await resetPhotoToDefault(photoId);
    setPreviewOverride((prev) => {
      const copy = { ...prev };
      delete copy[photoId];
      return copy;
    });
    setUploadingState((prev) => ({ ...prev, [photoId]: false }));
    setSuccessPhotoState((prev) => ({ ...prev, [photoId]: 'Restaurada para o padrão!' }));
    setTimeout(() => {
      setSuccessPhotoState((prev) => ({ ...prev, [photoId]: '' }));
    }, 4000);
  };

  // Gallery handlers
  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setNewGalPreview(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddGalleryPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGalleryError('');
    const finalUrl = newGalPreview || newGalUrl.trim();
    if (!finalUrl) {
      setGalleryError('Por favor, selecione uma foto ou informe o link da imagem.');
      setTimeout(() => setGalleryError(''), 5000);
      return;
    }

    setIsSavingGallery(true);
    const success = await addGalleryPhoto({
      title: newGalTitle.trim() || 'Foto ACEDEP',
      category: newGalCategory,
      url: finalUrl,
      date: newGalDate.trim() || undefined
    });
    setIsSavingGallery(false);

    if (success) {
      setGallerySuccess('Foto adicionada à galeria com sucesso!');
      setNewGalTitle('');
      setNewGalDate('');
      setNewGalUrl('');
      setNewGalPreview('');
      setTimeout(() => setGallerySuccess(''), 4000);
    } else {
      setGalleryError('Erro ao gravar foto na galeria. Tente novamente.');
      setTimeout(() => setGalleryError(''), 5000);
    }
  };

  const executeDeleteGalleryPhoto = async (photo: GalleryPhotoItem) => {
    setIsDeletingGalleryId(photo.id);
    await deleteGalleryPhoto(photo.id);
    setIsDeletingGalleryId(null);
    setConfirmDeleteGalleryId(null);
  };

  // PIN change handler
  const handleUpdatePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinFormError('');
    setPinSuccess('');

    if (newPinInput.length < 4) {
      setPinFormError('A nova senha deve ter no mínimo 4 dígitos.');
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setPinFormError('As senhas digitadas não coincidem.');
      return;
    }

    setIsSavingPin(true);
    const success = await updateAdminPin(newPinInput);
    setIsSavingPin(false);

    if (success) {
      setPinSuccess('Senha de administrador atualizada com sucesso!');
      setNewPinInput('');
      setConfirmPinInput('');
      setTimeout(() => setPinSuccess(''), 5000);
    } else {
      setPinFormError('Falha ao atualizar senha. Verifique a conexão.');
    }
  };

  // Cheer Management Handlers
  const handleStartEditCheer = (cheer: CommunityCheer) => {
    setEditingCheer(cheer);
    setEditCheerAuthor(cheer.authorName);
    setEditCheerRelation(cheer.relationship || '');
    setEditCheerMsg(cheer.message);
    setCheerAdminSuccess('');
    setCheerAdminError('');
  };

  const handleSaveEditCheer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCheer) return;
    if (!editCheerAuthor.trim() || !editCheerMsg.trim()) {
      setCheerAdminError('Preencha o nome do autor e o texto da mensagem.');
      return;
    }
    setIsSavingCheer(true);
    const success = await updateCheer(editingCheer.id, {
      authorName: editCheerAuthor,
      relationship: editCheerRelation,
      message: editCheerMsg,
    });
    setIsSavingCheer(false);
    if (success) {
      setCheerAdminSuccess('Recado atualizado com sucesso no mural!');
      setEditingCheer(null);
      setTimeout(() => setCheerAdminSuccess(''), 4000);
    } else {
      setCheerAdminError('Falha ao atualizar recado.');
    }
  };

  const handleDeleteCheerExecute = async (cheerId: string) => {
    setIsDeletingCheerId(cheerId);
    await deleteCheer(cheerId);
    setIsDeletingCheerId(null);
    setConfirmDeleteCheerId(null);
    setCheerAdminSuccess('Recado excluído com sucesso do mural!');
    setTimeout(() => setCheerAdminSuccess(''), 4000);
  };

  const handleAdminAddCheerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminCheerAuthor.trim() || !newAdminCheerMsg.trim()) return;
    setIsAddingAdminCheer(true);
    const success = await addCheer({
      authorName: newAdminCheerAuthor,
      relationship: newAdminCheerRelation || 'Coordenação ACEDEP',
      message: newAdminCheerMsg,
    });
    setIsAddingAdminCheer(false);
    if (success) {
      setAddCheerSuccess('Recado publicado com sucesso no mural!');
      setNewAdminCheerAuthor('');
      setNewAdminCheerRelation('Coordenação / Técnico');
      setNewAdminCheerMsg('');
      setTimeout(() => setAddCheerSuccess(''), 4000);
    }
  };

  const isOpen = coachManagerModalOpen || adminModalOpen;
  if (!isOpen) return null;

  // Auto generate a simple and clean access code
  const handleAutoGenerateAccessCode = () => {
    const cleanFirstName = athleteName.trim().split(' ')[0]?.toLowerCase() || 'atleta';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setAthleteAccessCode(`${cleanFirstName}${randomSuffix}`);
  };

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (under 3MB)
    if (file.size > 3 * 1024 * 1024) {
      setFormError('Por favor, escolha uma imagem com tamanho menor que 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAthletePhoto(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Copy access credentials
  const handleCopyAccessCredentials = (athlete: { name: string; guardianName: string; guardianEmail: string; accessCode: string }) => {
    const text = `🏊‍♂️ *ACEDEP NATAÇÃO PARALÍMPICA - DADOS DE ACESSO AO PORTAL DO ATLETA* 🏊‍♂️\n\n` +
      `Olá ${athlete.guardianName}!\n` +
      `Seguem os dados para acompanhar o desenvolvimento e treinos de *${athlete.name}*:\n\n` +
      `🔗 *Site:* https://acedep.org.br\n` +
      `👤 *Identificador:* ${athlete.guardianEmail || athlete.name}\n` +
      `🔑 *Senha de Acesso:* ${athlete.accessCode}\n\n` +
      `No portal você acompanha horários de treinos no CPB, cronometragens (RP), atestados e recados da comissão técnica!`;

    navigator.clipboard.writeText(text);
    setCopiedAccessCard(athlete.accessCode);
    setTimeout(() => setCopiedAccessCard(null), 3500);
  };

  // Handle Publish News
  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsContent.trim()) return;

    setIsSavingNews(true);
    const success = await addNewsPost(
      {
        title: newsTitle.trim(),
        summary: newsSummary.trim() || newsTitle.trim(),
        content: newsContent.trim(),
        category: newsCategory,
        coverUrl: newsCoverUrl.trim() || 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1000&q=80',
        date: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
        author: newsAuthor.trim(),
        authorRole: 'Comissão Técnica ACEDEP',
        tags: ['Natação Paralímpica', 'S14', 'ACEDEP'],
      },
      newsNotifyEmail
    );
    setIsSavingNews(false);

    if (success) {
      setNewsSuccess(`Notícia publicada com sucesso! ${newsNotifyEmail ? '📧 Notificação enviada por e-mail aos pais.' : ''}`);
      setNewsTitle('');
      setNewsSummary('');
      setNewsContent('');
      setNewsCoverUrl('');
      setTimeout(() => setNewsSuccess(''), 5000);
    }
  };

  // Handle Create Athlete
  const handleAddAthlete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!athleteName.trim() || !athleteGuardian.trim() || !athleteAccessCode.trim()) return;

    setIsSavingAthlete(true);
    const newAthleteId = `atleta-${Date.now()}`;
    const dynamicClass = athleteDisabilityCategory === 'Síndrome de Down' 
      ? 'S14 / S21 - Síndrome de Down' 
      : athleteDisabilityCategory === 'Autista' 
      ? 'S14 - Autismo / TEA' 
      : 'S14 / SB14 / SM14 - Deficiência Intelectual';

    const newAthlete: AthleteRecord = {
      id: newAthleteId,
      name: athleteName.trim(),
      photoUrl: athletePhoto.trim() || AVATAR_PRESETS[0].url,
      birthDate: athleteBirth.trim() || '15/05/2009',
      paralympicClass: dynamicClass,
      disabilityCategory: athleteDisabilityCategory,
      clubRegistration: `ACEDEP-2026-${Math.floor(100 + Math.random() * 900)}`,
      cbdiRegistration: athleteCbdi.trim() || 'CBDI-SP-Homologado',
      guardianName: athleteGuardian.trim(),
      guardianEmail: athleteEmail.trim(),
      guardianPhone: athletePhone.trim(),
      accessCode: athleteAccessCode.trim(),
      trainingSchedule: {
        pool: athletePool,
        days: athleteDays.split(',').map((s) => s.trim()),
        time: athleteTime,
        lane: athleteLane,
        coachName: athleteCoach,
      },
      attendanceRate: 100,
      recentAttendance: [
        { date: new Date().toLocaleDateString('pt-BR'), status: 'presente', note: 'Treino inicial de acolhimento e ambientação' }
      ],
      swimmingMetrics: [],
      medicalDocuments: [
        {
          id: `doc-${Date.now()}-1`,
          name: 'Atestado Cardiológico e Dermatológico para Piscina',
          status: 'Válido',
          expiryDate: '10/12/2026',
          notes: 'Apto para atividades físicas aquáticas no Centro Paralímpico.',
        },
      ],
      coachNotes: [
        {
          id: `note-${Date.now()}-1`,
          date: new Date().toLocaleDateString('pt-BR'),
          title: 'Boas-vindas à ACEDEP Natação Paralímpica',
          text: `Olá ${athleteGuardian}! Seja muito bem-vindo(a) à nossa equipe. Os treinos de ${athleteName} ocorrem na ${athletePool} (${athleteDays}, ${athleteTime}). Qualquer dúvida estamos à total disposição.`,
          coachName: athleteCoach,
          importance: 'destaque',
        },
      ],
      createdAt: new Date().toISOString(),
    };

    const success = await saveAthleteRecord(newAthlete);

    // Optionally send immediate welcome email with login details
    if (success && athleteNotifyOnCreate && athleteEmail.trim()) {
      await sendEmailNotification({
        type: 'credenciais',
        title: `Boas-vindas à ACEDEP: Login e Acesso Liberado para ${newAthlete.name}`,
        recipientSummary: `${newAthlete.guardianName} (${newAthlete.guardianEmail})`,
        recipientEmails: [newAthlete.guardianEmail],
        senderName: 'Coordenação ACEDEP',
        contentPreview: `Login: ${newAthlete.guardianEmail} | Senha de Acesso: ${newAthlete.accessCode} | Categoria: ${newAthlete.disabilityCategory || 'Classe S14'} | Atleta: ${newAthlete.name}`,
        status: 'enviado',
      });
    }

    setIsSavingAthlete(false);

    if (success) {
      setAthleteSuccess(`Atleta ${athleteName} (${athleteDisabilityCategory}) cadastrado com sucesso com login "${athleteAccessCode}"!`);
      setAthleteName('');
      setAthleteGuardian('');
      setAthleteEmail('');
      setAthletePhone('');
      setAthleteAccessCode('');
      setAthleteBirth('');
      setAthleteCbdi('');
      setTimeout(() => setAthleteSuccess(''), 6000);
    }
  };

  // Handle Save Edited Athlete
  const handleSaveEditedAthlete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAthlete) return;

    setIsSavingEditAthlete(true);
    try {
      await saveAthleteRecord(editingAthlete);
      setAthleteSuccess(`Cadastro e dados de treinos de ${editingAthlete.name} atualizados com sucesso!`);
      setTimeout(() => setAthleteSuccess(''), 6000);
    } finally {
      setIsSavingEditAthlete(false);
      setEditingAthlete(null);
    }
  };

  // Handle Add Swimming Metric
  const handleAddTime = async (e: React.FormEvent) => {
    e.preventDefault();
    setTimeError('');
    setTimeSuccess('');

    const targetAthleteId = selectedAthleteIdForTime || athletes[0]?.id;
    if (!targetAthleteId) {
      setTimeError('Nenhum atleta cadastrado. Cadastre um atleta primeiro.');
      return;
    }

    if (!metricTime.trim()) {
      setTimeError('Por favor, informe o tempo cronometrado (Ex: 00:29.50).');
      return;
    }

    setIsSavingTime(true);
    const targetAthlete = athletes.find((a) => a.id === targetAthleteId);
    try {
      const derivedStroke = metricStroke || getStrokeFromEvent(metricEvent);
      const success = await addSwimmingMetric(
        targetAthleteId, 
        {
          event: metricEvent,
          stroke: derivedStroke,
          bestTime: metricTime.trim(),
          previousTime: metricPreviousTime.trim() || undefined,
          evolution: metricEvolution.trim() || 'Marca Oficial',
          dateRecorded: new Date().toLocaleDateString('pt-BR'),
          stageName: metricStage.trim() || 'Centro Paralímpico Brasileiro',
          year: metricYear.trim() || new Date().getFullYear().toString(),
          laneType: metricLaneType,
          comparedToChampionship: metricComparedChampionship.trim() || undefined,
          isPersonalBest: true,
        },
        timeNotifyEmail
      );
      setIsSavingTime(false);

      if (success) {
        setTimeSuccess(`Tempo lançado com sucesso na ficha de ${targetAthlete?.name || 'atleta'}! ${timeNotifyEmail ? '📧 Notificação enviada por e-mail.' : ''}`);
        setMetricTime('');
        setMetricPreviousTime('');
        setMetricEvolution('');
        setMetricComparedChampionship('');
        setTimeout(() => setTimeSuccess(''), 5000);
      } else {
        setTimeError('Erro ao gravar tempo. Verifique a conexão com o banco.');
      }
    } catch (err: any) {
      setIsSavingTime(false);
      setTimeError(err?.message || 'Erro inesperado ao salvar tempo.');
    }
  };

  const handleDeleteTime = async (athleteId: string, metricId: string) => {
    setDeletingTimeId(metricId);
    try {
      await deleteSwimmingMetric(athleteId, metricId);
      setTimeSuccess('Cronometragem removida com sucesso!');
      setTimeout(() => setTimeSuccess(''), 4000);
    } finally {
      setDeletingTimeId(null);
    }
  };

  // Handle Add Coach Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setNoteError('');
    setNoteSuccess('');

    const targetAthleteId = selectedAthleteIdForNote || athletes[0]?.id;
    if (!targetAthleteId) {
      setNoteError('Nenhum atleta cadastrado. Cadastre um atleta primeiro.');
      return;
    }

    if (!noteText.trim()) {
      setNoteError('Por favor, escreva o recado/orientação técnica para o responsável.');
      return;
    }

    setIsSavingNote(true);
    const targetAthlete = athletes.find((a) => a.id === targetAthleteId);
    try {
      const success = await addCoachNote(
        targetAthleteId, 
        {
          title: noteTitle.trim() || 'Orientação Técnica da Piscina',
          text: noteText.trim(),
          coachName: noteCoachName.trim() || 'Prof. Leonardo Ramos',
          date: new Date().toLocaleDateString('pt-BR'),
          importance: 'destaque',
        },
        noteNotifyEmail
      );
      setIsSavingNote(false);

      if (success) {
        setNoteSuccess(`Recado enviado ao responsável de ${targetAthlete?.name || 'atleta'}! ${noteNotifyEmail ? '📧 Notificação gravada e enviada por e-mail.' : ''}`);
        setNoteTitle('');
        setNoteText('');
        setTimeout(() => setNoteSuccess(''), 5000);
      } else {
        setNoteError('Erro ao gravar recado no banco de dados. Tente novamente.');
      }
    } catch (err: any) {
      setIsSavingNote(false);
      setNoteError(err?.message || 'Erro inesperado ao enviar recado.');
    }
  };

  const handleDeleteNote = async (athleteId: string, noteId: string) => {
    setDeletingNoteId(noteId);
    try {
      await deleteCoachNote(athleteId, noteId);
      setNoteSuccess('Recado removido com sucesso!');
      setTimeout(() => setNoteSuccess(''), 4000);
    } finally {
      setDeletingNoteId(null);
    }
  };

  // Handle Annual Calendar Events (Agenda 2026)
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate.trim()) {
      setEventSuccess('');
      return;
    }

    setIsSavingEvent(true);
    let success = false;
    if (editingEventId) {
      success = await updateAnnualEvent(editingEventId, {
        title: eventTitle.trim(),
        category: eventCategory,
        date: eventDate.trim(),
        month: Number(eventMonth),
        year: 2026,
        location: eventLocation.trim(),
        description: eventDescription.trim(),
        targetCategory: eventTarget.trim(),
        status: eventStatus,
      });
    } else {
      success = await addAnnualEvent({
        title: eventTitle.trim(),
        category: eventCategory,
        date: eventDate.trim(),
        month: Number(eventMonth),
        year: 2026,
        location: eventLocation.trim(),
        description: eventDescription.trim(),
        targetCategory: eventTarget.trim(),
        status: eventStatus,
      });

      if (success && eventNotifyEmail) {
        await sendEmailNotification({
          type: 'boletim_geral',
          title: `Agenda 2026: Novo Evento Cadastrado - ${eventTitle.trim()}`,
          recipientSummary: `Todos os Pais e Responsáveis (${getAllParentEmails().length} e-mails)`,
          recipientEmails: getAllParentEmails(),
          senderName: 'Coordenação Técnica ACEDEP',
          contentPreview: `Evento: ${eventTitle.trim()} | Data: ${eventDate.trim()} | Local: ${eventLocation.trim()} | Categoria: ${eventCategory}`,
          status: 'enviado',
        });
      }
    }

    setIsSavingEvent(false);
    if (success) {
      setEventSuccess(editingEventId ? 'Evento da Agenda 2026 atualizado com sucesso!' : 'Evento salvo na Agenda 2026 com sucesso!');
      setEventTitle('');
      setEventDate('');
      setEventDescription('');
      setEditingEventId(null);
      setTimeout(() => setEventSuccess(''), 5000);
    }
  };

  const handleEditEvent = (evt: any) => {
    setEditingEventId(evt.id);
    setEventTitle(evt.title);
    setEventCategory(evt.category || 'Competição Oficial');
    setEventDate(evt.date);
    setEventMonth(evt.month || 1);
    setEventLocation(evt.location || '');
    setEventDescription(evt.description || '');
    setEventTarget(evt.targetCategory || 'Equipe Principal S14');
    setEventStatus(evt.status || 'Confirmado');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteEvent = async (id: string) => {
    await deleteAnnualEvent(id);
  };

  // Handle Manual Email Broadcast Dispatch
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastSubject.trim() || !broadcastBody.trim()) return;

    setIsSendingBroadcast(true);

    let recipients: string[] = [];
    let summary = '';

    if (broadcastRecipientMode === 'all') {
      recipients = getAllParentEmails();
      summary = `Todos os Pais e Responsáveis (${recipients.length} e-mails cadastrados)`;
    } else {
      const target = athletes.find((a) => a.id === (broadcastSpecificAthleteId || athletes[0]?.id));
      if (target && target.guardianEmail) {
        recipients = [target.guardianEmail];
        summary = `${target.guardianName} (${target.guardianEmail}) - Atleta: ${target.name}`;
      } else {
        recipients = ['pais@acedep.org.br'];
        summary = 'Responsável selecionado';
      }
    }

    await sendEmailNotification({
      type: broadcastType,
      title: broadcastSubject.trim(),
      recipientSummary: summary,
      recipientEmails: recipients,
      senderName: broadcastSender.trim(),
      contentPreview: broadcastBody.trim().substring(0, 180),
      status: 'enviado',
    });

    setIsSendingBroadcast(false);
    setBroadcastSuccess(`Informativo gravado e disparado com sucesso para ${summary}!`);
    setBroadcastSubject('');
    setBroadcastBody('');
    setTimeout(() => setBroadcastSuccess(''), 6000);
  };

  // Open Gmail Web directly in browser with recipients and subject filled
  const handleOpenGmailWeb = (subject?: string, body?: string) => {
    const target = athletes.find((a) => a.id === (broadcastRecipientMode === 'specific' ? (broadcastSpecificAthleteId || athletes[0]?.id) : ''));
    const toEmail = broadcastRecipientMode === 'specific' ? (target?.guardianEmail || '') : getAllParentEmails().join(',');
    const encodedSubject = encodeURIComponent(subject || broadcastSubject || 'Informativo ACEDEP Natação Paralímpica');
    const encodedBody = encodeURIComponent(body || broadcastBody || 'Prezados pais e responsáveis,\n\nSegue atualização importante sobre as atividades e treinos da ACEDEP:\n\nAtenciosamente,\nCoordenação ACEDEP');
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toEmail)}&su=${encodedSubject}&body=${encodedBody}`;
    window.open(gmailUrl, '_blank');
  };

  // Open default mail client with parent emails
  const handleOpenMailClient = (subject?: string, body?: string) => {
    let mailUrl = '';
    const encodedSubject = encodeURIComponent(subject || broadcastSubject || 'Informativo ACEDEP Natação Paralímpica');
    const encodedBody = encodeURIComponent(body || broadcastBody || 'Prezados pais e responsáveis,\n\nSegue atualização importante sobre as atividades e treinos da ACEDEP:\n\nAtenciosamente,\nCoordenação ACEDEP');

    if (broadcastRecipientMode === 'specific') {
      const target = athletes.find((a) => a.id === (broadcastSpecificAthleteId || athletes[0]?.id));
      const toEmail = target?.guardianEmail || 'contato@acedep.org.br';
      mailUrl = `mailto:${toEmail}?subject=${encodedSubject}&body=${encodedBody}`;
    } else {
      const parentEmails = getAllParentEmails().join(',');
      mailUrl = `mailto:contato@acedep.org.br?bcc=${parentEmails}&subject=${encodedSubject}&body=${encodedBody}`;
    }

    window.open(mailUrl, '_blank');
  };

  // Filtered athletes list
  const filteredAthletes = athletes.filter((a) => 
    a.name.toLowerCase().includes(athleteSearchTerm.toLowerCase()) ||
    a.guardianName.toLowerCase().includes(athleteSearchTerm.toLowerCase()) ||
    (a.guardianEmail || '').toLowerCase().includes(athleteSearchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl max-h-[94vh] bg-[#0c1f38] border border-[#1e3a5f] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e3a5f] bg-[#071326]/95">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
              {isAdminAuthenticated ? <Waves className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
                <span>
                  {isAdminAuthenticated 
                    ? isProfessor 
                      ? `Painel do(a) Professor(a) • ${currentAdminProfile?.name || 'Comissão Técnica'}`
                      : 'Painel da Coordenação Geral & Administração' 
                    : 'Acesso Restrito • Equipe Técnica & Coordenação'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  isProfessor 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                    : 'bg-[#d4af37]/20 text-[#f3e5ab] border border-[#d4af37]/40'
                }`}>
                  {isAdminAuthenticated ? (isProfessor ? 'Perfil Professor' : 'Gestão Geral ACEDEP') : 'Autenticação'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isAdminAuthenticated 
                  ? isProfessor 
                    ? 'Chamada em treinos e campeonatos, cadastro de atletas, tempos RP, agenda e recados.'
                    : 'Gestão geral: atletas, lista de presença, professores, fotos, notícias, comunicados e segurança.' 
                  : 'Digite seu PIN ou senha cadastrada para acessar as ferramentas da ACEDEP.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminAuthenticated && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setExportModalInitialType(
                      activeTab === 'presenca' ? 'attendance_monthly' :
                      activeTab === 'tempos' ? 'swimming_times_ranking' : 'athletes_general'
                    );
                    setExportModalAthleteId(undefined);
                    setExportModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d4af37]/20 hover:bg-[#d4af37]/35 text-[#f3e5ab] border border-[#d4af37]/40 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                  title="Exportar dados e relatórios em PDF ou Word"
                >
                  <FileDown className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span className="hidden sm:inline">Exportar Relatórios</span>
                </button>

                <button
                  onClick={logoutAdmin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer"
                  title="Encerrar sessão de administrador"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </>
            )}
            <button
              onClick={handleCloseModal}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isAdminAuthenticated ? (
          /* =========================================================================
             LOGIN FORM - PIN RESTRICTION GUARD
             ========================================================================= */
          <div className="p-8 sm:p-12 overflow-y-auto flex-1 flex items-center justify-center">
            <div className="max-w-md w-full mx-auto text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#d4af37]/15 border-2 border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shadow-xl">
                <Lock className="w-8 h-8" />
              </div>
              
              <div>
                <h4 className="text-xl font-bold text-white font-serif mb-2">
                  Painel Administrativo da ACEDEP
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Insira a senha de coordenador/administrador para acessar o cadastro de atletas, tempos de treinos, disparo de comunicados aos pais e notícias.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="text-left">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Senha de Administrador / Treinador
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={pinInput}
                      onChange={(e) => {
                        setPinInput(e.target.value);
                        setPinError(false);
                      }}
                      placeholder="Digite a senha de administrador..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-[#1e3a5f] text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                      autoFocus
                    />
                  </div>
                  {pinError && (
                    <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Senha incorreta. Verifique com a coordenação da ACEDEP.</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn || !pinInput.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8952b] text-[#060e1c] font-bold text-sm hover:brightness-110 active:scale-[0.99] transition-all shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingIn ? 'Verificando...' : 'Acessar Painel da Coordenação'}
                </button>
              </form>

              <div className="pt-2 text-[11px] text-slate-400 border-t border-white/5">
                <span>Dúvidas ou suporte? Contate a secretaria: </span>
                <strong className="text-slate-300">giuli.pereira@gmail.com</strong>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs Bar */}
            <div className="px-4 sm:px-6 pt-3 pb-2 bg-[#0a192f] border-b border-[#1e3a5f]/60">
              <div className="flex flex-wrap gap-1.5 p-1 bg-black/40 rounded-xl border border-[#1e3a5f]">
                
                {/* 1. Atletas (Professor & Admin) */}
                <button
                  onClick={() => setActiveTab('atletas')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'atletas'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Atletas ({athletes.length})</span>
                </button>

                {/* 2. Lista de Presença (Professor & Admin) */}
                <button
                  onClick={() => setActiveTab('presenca')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'presenca'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Lista de Presença</span>
                </button>

                {/* 3. Tempos RP (Professor & Admin) */}
                <button
                  onClick={() => setActiveTab('tempos')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'tempos'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>Tempos RP</span>
                </button>

                {/* 4. Agenda 2026 & Competições (Professor & Admin) */}
                <button
                  onClick={() => setActiveTab('agenda')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'agenda'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Agenda 2026 ({annualEvents.length})</span>
                </button>

                {/* 5. Recados Técnicos aos Pais (Professor & Admin) */}
                <button
                  onClick={() => setActiveTab('recados')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'recados'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Recados aos Pais</span>
                </button>

                {/* 5. Mural da Família (Professor & Admin) */}
                <button
                  onClick={() => setActiveTab('mural_familia')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'mural_familia'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>Mural da Família ({cheers.length})</span>
                </button>

                {/* Super Admin ONLY Tabs */}
                {!isProfessor && (
                  <>
                    <button
                      onClick={() => setActiveTab('administradores')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeTab === 'administradores'
                          ? 'bg-[#d4af37] text-[#060e1c] shadow'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Professores & Acessos</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('fotos')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeTab === 'fotos'
                          ? 'bg-[#d4af37] text-[#060e1c] shadow'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Fotos do Site</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('galeria')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeTab === 'galeria'
                          ? 'bg-[#d4af37] text-[#060e1c] shadow'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Images className="w-3.5 h-3.5" />
                      <span>Galeria ({galleryPhotos.length})</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('noticias')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeTab === 'noticias'
                          ? 'bg-[#d4af37] text-[#060e1c] shadow'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Newspaper className="w-3.5 h-3.5" />
                      <span>Notícias ({newsPosts.length})</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('emails')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeTab === 'emails'
                          ? 'bg-[#d4af37] text-[#060e1c] shadow'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>E-mails aos Pais</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('seguranca')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeTab === 'seguranca'
                          ? 'bg-[#d4af37] text-[#060e1c] shadow'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Senha Mestre</span>
                    </button>
                  </>
                )}
              </div>
            </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 flex-1 space-y-6">
          
          {/* =========================================================================
              TAB: LISTA DE PRESENÇA (TREINOS & CAMPEONATOS)
             ========================================================================= */}
          {activeTab === 'presenca' && <AttendanceManagerTab />}

          {/* =========================================================================
              TAB: GESTÃO SEGURA DE ADMINISTRADORES
             ========================================================================= */}
          {activeTab === 'administradores' && <AdminUsersManagerTab />}

          {/* =========================================================================
              TAB 1: GESTÃO & CADASTRO DE ATLETAS (FÁCIL + FOTO + LOGIN)
             ========================================================================= */}
          {activeTab === 'atletas' && (
            <div className="space-y-8">
              
              {/* Add Athlete Form */}
              <form onSubmit={handleAddAthlete} className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-5 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-[#d4af37]" />
                      <span>Cadastrar Novo Atleta & Criar Login Imediato</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Adicione a foto de perfil, os dados do responsável e gere a senha de acesso ao portal com 1 clique.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#d4af37]/10 text-[#f3e5ab] text-[11px] font-semibold border border-[#d4af37]/30">
                    Deficiência Intelectual • S14
                  </span>
                </div>

                {/* 1. Profile Photo Selection Section */}
                <div className="p-4 rounded-xl bg-black/40 border border-[#1e3a5f] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#d4af37] flex items-center gap-1.5">
                      <Camera className="w-4 h-4" />
                      <span>1. Foto de Perfil do Atleta</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Escolha uma foto ou use os modelos abaixo</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    {/* Live Avatar Preview */}
                    <div className="relative group">
                      <img 
                        src={athletePhoto} 
                        alt="Preview" 
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-[#d4af37] shadow-md shadow-black/50"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute -bottom-2 -right-2 p-1 bg-[#d4af37] text-[#060e1c] rounded-full shadow">
                        <Sparkles className="w-3 h-3" />
                      </span>
                    </div>

                    {/* Upload / Custom URL Actions */}
                    <div className="flex-1 space-y-2.5 w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[#d4af37] text-white hover:text-[#060e1c] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border border-white/10"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Enviar Foto do Dispositivo / Celular</span>
                        </button>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileUpload} 
                          accept="image/*" 
                          className="hidden" 
                        />
                        <span className="text-[11px] text-slate-500">ou selecione um avatar rápido:</span>
                      </div>

                      {/* Presets Carousel */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {AVATAR_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setAthletePhoto(preset.url)}
                            title={preset.name}
                            className={`p-0.5 rounded-xl border-2 transition-all cursor-pointer shrink-0 ${
                              athletePhoto === preset.url
                                ? 'border-[#d4af37] scale-105 shadow'
                                : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img 
                              src={preset.url} 
                              alt={preset.name} 
                              className="w-9 h-9 rounded-lg object-cover" 
                              referrerPolicy="no-referrer" 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Personal & Guardian Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Nome Completo do Atleta *</label>
                    <input
                      type="text"
                      required
                      value={athleteName}
                      onChange={(e) => {
                        setAthleteName(e.target.value);
                        if (!athleteAccessCode) {
                          const cleanFirstName = e.target.value.trim().split(' ')[0]?.toLowerCase() || 'atleta';
                          setAthleteAccessCode(`${cleanFirstName}2026`);
                        }
                      }}
                      placeholder="Ex: Matheus Vinícius de Oliveira"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Data Nasc. / Idade</label>
                    <input
                      type="text"
                      value={athleteBirth}
                      onChange={(e) => setAthleteBirth(e.target.value)}
                      placeholder="Ex: 12/04/2008 (17 anos)"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Nº de Cadastro / Registro CBDI
                    </label>
                    <input
                      type="text"
                      value={athleteCbdi}
                      onChange={(e) => setAthleteCbdi(e.target.value)}
                      placeholder="Ex: CBDI-SP-4491"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  {/* Disability Category Selector */}
                  <div className="sm:col-span-2 p-3.5 rounded-xl bg-black/40 border border-[#1e3a5f] space-y-2">
                    <label className="text-xs font-bold text-[#f3e5ab] flex items-center justify-between">
                      <span>Categoria / Condição do Atleta *</span>
                      <span className="text-[10px] text-slate-400 font-normal">Selecione para enquadramento na classe paralímpica</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setAthleteDisabilityCategory('Deficiente Intelectual')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                          athleteDisabilityCategory === 'Deficiente Intelectual'
                            ? 'bg-[#d4af37]/20 border-[#d4af37] text-white shadow-md'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="text-lg">🧠</span>
                        <div>
                          <span className="text-xs font-bold block leading-tight">Deficiente Intelectual</span>
                          <span className="text-[10px] text-slate-400 block">Classe S14 / CBDI</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAthleteDisabilityCategory('Autista')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                          athleteDisabilityCategory === 'Autista'
                            ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="text-lg">🧩</span>
                        <div>
                          <span className="text-xs font-bold block leading-tight">Autista (TEA)</span>
                          <span className="text-[10px] text-slate-400 block">Classe S14</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAthleteDisabilityCategory('Síndrome de Down')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                          athleteDisabilityCategory === 'Síndrome de Down'
                            ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="text-lg">💛</span>
                        <div>
                          <span className="text-xs font-bold block leading-tight">Síndrome de Down</span>
                          <span className="text-[10px] text-slate-400 block">Classe S14 / S21 (T21)</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Nome do Pai / Mãe / Responsável *</label>
                    <input
                      type="text"
                      required
                      value={athleteGuardian}
                      onChange={(e) => setAthleteGuardian(e.target.value)}
                      placeholder="Ex: Patrícia de Oliveira"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">E-mail do Responsável (para notificações) *</label>
                    <input
                      type="email"
                      required
                      value={athleteEmail}
                      onChange={(e) => setAthleteEmail(e.target.value)}
                      placeholder="patricia.oliveira@gmail.com"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">WhatsApp / Telefone</label>
                    <input
                      type="text"
                      value={athletePhone}
                      onChange={(e) => setAthletePhone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  {/* Access PIN Code Generator */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#d4af37]">Senha de Acesso do Login *</label>
                      <button
                        type="button"
                        onClick={handleAutoGenerateAccessCode}
                        className="text-[10px] text-[#f3e5ab] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Gerar Código Fácil</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={athleteAccessCode}
                        onChange={(e) => setAthleteAccessCode(e.target.value)}
                        placeholder="Ex: matheus2026"
                        className="w-full pl-8 pr-3 py-2 text-xs font-mono font-bold rounded-xl bg-black/50 border border-[#d4af37]/60 text-[#f3e5ab] placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                      />
                      <KeyRound className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#d4af37]" />
                    </div>
                  </div>
                </div>

                {/* 3. Training presets (Customizable Days, Hours, Coach, Pool, Lane) */}
                <div className="p-4 rounded-xl bg-black/40 border border-[#1e3a5f] space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-[#f3e5ab] flex items-center gap-1.5">
                      <Waves className="w-3.5 h-3.5 text-[#d4af37]" />
                      Configuração de Treino & Comissão Técnica
                    </span>
                    <span className="text-[10px] text-slate-400">Personalize os dias, horários e professor</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-300 block mb-1 text-[11px] font-semibold">Polo & Piscina</label>
                      <input
                        type="text"
                        value={athletePool}
                        onChange={(e) => setAthletePool(e.target.value)}
                        placeholder="Ex: Piscina Olímpica 50m - CPB"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1 text-[11px] font-semibold">Dias de Treino</label>
                      <input
                        type="text"
                        value={athleteDays}
                        onChange={(e) => setAthleteDays(e.target.value)}
                        placeholder="Ex: Segunda, Quarta e Sexta"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1 text-[11px] font-semibold">Horário do Treino</label>
                      <input
                        type="text"
                        value={athleteTime}
                        onChange={(e) => setAthleteTime(e.target.value)}
                        placeholder="Ex: 14:00 às 15:30"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1 text-[11px] font-semibold">Professor(a) / Treinador(a)</label>
                      <input
                        type="text"
                        value={athleteCoach}
                        onChange={(e) => setAthleteCoach(e.target.value)}
                        placeholder="Ex: Prof. Leonardo Ramos"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1 text-[11px] font-semibold">Raia / Categoria</label>
                      <input
                        type="text"
                        value={athleteLane}
                        onChange={(e) => setAthleteLane(e.target.value)}
                        placeholder="Ex: Raia 3 - Rendimento S14"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1 text-[11px] font-semibold">Opções Rápidas de Horário</label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            const [d, t] = e.target.value.split('|');
                            if (d) setAthleteDays(d);
                            if (t) setAthleteTime(t);
                          }
                        }}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-slate-300 focus:outline-none focus:border-[#d4af37]"
                      >
                        <option value="">Selecionar modelo rápido...</option>
                        <option value="Segunda, Quarta e Sexta|14:00 às 15:30">Seg/Qua/Sex (14:00 - 15:30)</option>
                        <option value="Segunda, Quarta e Sexta|15:30 às 17:00">Seg/Qua/Sex (15:30 - 17:00)</option>
                        <option value="Terça e Quinta|08:00 às 09:30">Ter/Qui (08:00 - 09:30)</option>
                        <option value="Terça e Quinta|14:00 às 15:30">Ter/Qui (14:00 - 15:30)</option>
                        <option value="Segunda a Sexta|14:00 às 16:30">Seg a Sex - Alto Rendimento (14:00 - 16:30)</option>
                        <option value="Sábados|09:00 às 11:00">Sábado (09:00 - 11:00)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Email Welcome Option */}
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    id="notifyWelcome"
                    checked={athleteNotifyOnCreate}
                    onChange={(e) => setAthleteNotifyOnCreate(e.target.checked)}
                    className="rounded border-[#1e3a5f] text-[#d4af37] focus:ring-[#d4af37]"
                  />
                  <label htmlFor="notifyWelcome" className="cursor-pointer">
                    📧 Enviar automaticamente e-mail de boas-vindas com dados de login ao responsável
                  </label>
                </div>

                {athleteSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{athleteSuccess}</span>
                    </span>
                  </div>
                )}

                {formError && (
                  <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSavingAthlete}
                  className="px-6 py-2.5 rounded-xl bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isSavingAthlete ? 'Cadastrando...' : 'Salvar Atleta & Ativar Login'}</span>
                </button>
              </form>

              {/* Athletes Directory with Live Management */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h5 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Atletas & Logins Ativos ({athletes.length})</span>
                    </h5>
                    <p className="text-xs text-slate-400">
                      Consulte a lista, copie o cartão de acesso para WhatsApp ou edite a foto de cada atleta.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setExportModalInitialType('athletes_general');
                        setExportModalAthleteId(undefined);
                        setExportModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#d4af37]/20 hover:bg-[#d4af37] text-[#f3e5ab] hover:text-[#060e1c] border border-[#d4af37]/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                      title="Exportar Lista Geral de Atletas em PDF ou Word"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Exportar Quadro de Atletas</span>
                    </button>

                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={athleteSearchTerm}
                        onChange={(e) => setAthleteSearchTerm(e.target.value)}
                        placeholder="Buscar por atleta ou responsável..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>
                </div>

                {filteredAthletes.length === 0 ? (
                  <div className="p-8 text-center bg-black/30 rounded-2xl border border-white/5 text-xs text-slate-400">
                    Nenhum atleta encontrado para a busca.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredAthletes.map((athlete) => (
                      <div
                        key={athlete.id}
                        className="p-4 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-3 relative group hover:border-[#d4af37]/50 transition-all shadow-md"
                      >
                        <div className="flex items-start gap-3">
                          <img 
                            src={athlete.photoUrl || AVATAR_PRESETS[0].url} 
                            alt={athlete.name} 
                            className="w-14 h-14 rounded-xl object-cover border border-[#d4af37]/60 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h6 className="font-bold text-white text-sm truncate">{athlete.name}</h6>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingAthlete(athlete)}
                                  className="p-1.5 text-slate-400 hover:text-[#d4af37] transition-colors cursor-pointer rounded-lg hover:bg-white/5"
                                  title="Editar atleta e foto"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                {confirmDeleteAthleteId === athlete.id ? (
                                  <div className="flex items-center gap-1 bg-red-950/80 border border-red-500/50 px-1.5 py-0.5 rounded-lg">
                                    <span className="text-[10px] text-red-300 font-bold">Excluir?</span>
                                    <button
                                      type="button"
                                      disabled={isDeletingAthleteId === athlete.id}
                                      onClick={async () => {
                                        setIsDeletingAthleteId(athlete.id);
                                        await deleteAthleteRecord(athlete.id);
                                        setIsDeletingAthleteId(null);
                                        setConfirmDeleteAthleteId(null);
                                      }}
                                      className="text-[10px] bg-red-600 hover:bg-red-500 text-white font-bold px-1.5 py-0.5 rounded cursor-pointer disabled:opacity-50"
                                    >
                                      {isDeletingAthleteId === athlete.id ? '...' : 'Sim'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteAthleteId(null)}
                                      className="text-[10px] text-slate-400 hover:text-white px-1 cursor-pointer"
                                    >
                                      Não
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteAthleteId(athlete.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-400 transition-colors cursor-pointer rounded-lg hover:bg-red-500/10"
                                    title="Remover atleta"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 my-1 flex-wrap">
                              {athlete.disabilityCategory && (
                                <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold flex items-center gap-1">
                                  <span>{athlete.disabilityCategory === 'Autista' ? '🧩' : athlete.disabilityCategory === 'Síndrome de Down' ? '💛' : '🧠'}</span>
                                  <span>{athlete.disabilityCategory}</span>
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 text-[10px]">
                                {athlete.paralympicClass || 'Classe S14'}
                              </span>
                              {athlete.cbdiRegistration && (
                                <span className="px-2 py-0.5 rounded-md bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#f3e5ab] font-mono text-[10px] font-semibold">
                                  {athlete.cbdiRegistration}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-300 truncate">
                              Resp: <span className="text-white font-medium">{athlete.guardianName}</span>
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              E-mail: {athlete.guardianEmail || 'Não informado'}
                            </p>
                          </div>
                        </div>

                        {/* Login Credential Box */}
                        <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">SENHA DO PORTAL:</span>
                            <span className="font-mono text-[#f3e5ab] font-bold">{athlete.accessCode}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopyAccessCredentials(athlete)}
                              className="px-2.5 py-1 rounded-lg bg-[#d4af37]/20 hover:bg-[#d4af37] text-[#f3e5ab] hover:text-[#060e1c] text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                              title="Copiar dados para WhatsApp/E-mail"
                            >
                              {copiedAccessCard === athlete.accessCode ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span>Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copiar Acesso</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Action Buttons: Documentos & Export Relatório */}
                        <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedAthleteForDocs(athlete)}
                            className="py-2 px-2.5 rounded-xl bg-white/5 hover:bg-[#d4af37]/20 border border-white/10 hover:border-[#d4af37]/50 text-slate-200 hover:text-[#f3e5ab] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm truncate"
                            title="Visualizar laudos e certidões"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                            <span className="truncate">Laudos & Docs</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setExportModalInitialType('athlete_individual');
                              setExportModalAthleteId(athlete.id);
                              setExportModalOpen(true);
                            }}
                            className="py-2 px-2.5 rounded-xl bg-[#d4af37]/15 hover:bg-[#d4af37] border border-[#d4af37]/30 hover:border-[#d4af37] text-[#f3e5ab] hover:text-[#060e1c] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm truncate"
                            title="Exportar ficha cadastral e tempos deste atleta"
                          >
                            <FileDown className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Exportar Ficha</span>
                          </button>
                        </div>

                        {/* Quick Metrics summary */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                          <span>{athlete.swimmingMetrics?.length || 0} marcas (RP) registradas</span>
                          <span className="text-[#d4af37] font-semibold">{athlete.trainingSchedule?.lane || 'Raia S14'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* =========================================================================
              TAB 2: DISPARADOR DE E-MAILS AOS PAIS & HISTÓRICO
             ========================================================================= */}
          {activeTab === 'emails' && (
            <div className="space-y-6">
              
              {/* Broadcast Composer */}
              <form onSubmit={handleSendBroadcast} className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#d4af37]" />
                      <span>Disparador de Atividades & Comunicados por E-mail</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Envie instantaneamente informativos para que pais e responsáveis não percam nenhuma atualização da página.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenMailClient()}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-white/10"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir Gmail / Outlook com CCO</span>
                  </button>
                </div>

                {/* Templates Quick Bar */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Modelos Rápidos de Mensagem:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setBroadcastSubject('Informativo ACEDEP: Horários de Treinos no Centro Paralímpico Brasileiro');
                        setBroadcastBody('Prezados pais e responsáveis,\n\nInformamos que os treinos desta semana ocorrerão normalmente na piscina olímpica do CPB. Pedimos pontualidade de 15 minutos antes da entrada na água.\n\nAtenciosamente,\nComissão Técnica ACEDEP');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-[#d4af37]/20 hover:text-[#f3e5ab] text-slate-300 text-[11px] border border-white/5 transition-colors cursor-pointer"
                    >
                      🏊 Horários de Treino
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBroadcastSubject('Nova Notícia no Mural: Resultados Oficiais e Conquistas S14');
                        setBroadcastBody('Prezados pais e familiares,\n\nAcabamos de publicar na página inicial da ACEDEP as fotos e resultados da última competição de natação paralímpica. Nossos atletas tiveram uma participação exemplar!\n\nConfiram os detalhes no site: https://acedep.org.br\n\nAbraços,\nEquipe ACEDEP');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-[#d4af37]/20 hover:text-[#f3e5ab] text-slate-300 text-[11px] border border-white/5 transition-colors cursor-pointer"
                    >
                      🏆 Nova Notícia no Mural
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBroadcastSubject('Lembrete Importante: Renovação de Atestados Médicos para a Piscina');
                        setBroadcastBody('Prezados responsáveis,\n\nLembramos a todos da necessidade de manter os atestados cardiológicos e dermatológicos atualizados junto à coordenação técnica para acesso às raias.\n\nQualquer dúvida estamos à disposição.\nCoordenação ACEDEP');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-[#d4af37]/20 hover:text-[#f3e5ab] text-slate-300 text-[11px] border border-white/5 transition-colors cursor-pointer"
                    >
                      📋 Atestados Médicos
                    </button>
                  </div>
                </div>

                {/* Recipient Mode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Destinatários do E-mail *</label>
                    <select
                      value={broadcastRecipientMode}
                      onChange={(e) => setBroadcastRecipientMode(e.target.value as 'all' | 'specific')}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value="all">Todos os Pais e Responsáveis Cadastrados ({getAllParentEmails().length} e-mails)</option>
                      <option value="specific">Responsável de um atleta específico</option>
                    </select>
                  </div>

                  {broadcastRecipientMode === 'specific' && (
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Selecione o Atleta / Responsável *</label>
                      <select
                        value={broadcastSpecificAthleteId}
                        onChange={(e) => setBroadcastSpecificAthleteId(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                      >
                        {athletes.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} (Resp: {a.guardianName} - {a.guardianEmail})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Assunto do E-mail *</label>
                  <input
                    type="text"
                    required
                    value={broadcastSubject}
                    onChange={(e) => setBroadcastSubject(e.target.value)}
                    placeholder="Ex: Informativo ACEDEP: Convocação para o Circuito Paulista"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Mensagem do E-mail aos Responsáveis *</label>
                  <textarea
                    required
                    rows={5}
                    value={broadcastBody}
                    onChange={(e) => setBroadcastBody(e.target.value)}
                    placeholder="Escreva a mensagem detalhada para os pais..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] resize-y"
                  />
                </div>

                {broadcastSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{broadcastSuccess}</span>
                  </div>
                )}

                {/* Delivery Explanation Note */}
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-slate-300 text-[11px] space-y-1">
                  <span className="font-bold text-blue-300 block flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    Entrega Garantida na Caixa de Entrada dos Pais:
                  </span>
                  <p>
                    O botão <strong>Disparar Notificação</strong> registra o comunicado instantaneamente no portal e no histórico do responsável. Para que a mensagem caia diretamente no Gmail ou Outlook pessoal do responsável sem risco de filtro anti-spam, utilize também o botão <strong>Abrir no Gmail / Programa de E-mail</strong>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSendingBroadcast}
                    className="px-6 py-2.5 rounded-xl bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSendingBroadcast ? 'Disparando...' : 'Gravar & Notificar no Portal'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenMailClient(broadcastSubject, broadcastBody)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all cursor-pointer border border-white/10 flex items-center gap-1.5"
                    title="Abre o Gmail/Outlook com destinatários e mensagem preenchidos"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir no Gmail / Outlook dos Pais</span>
                  </button>

                  {broadcastRecipientMode === 'specific' && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = athletes.find((a) => a.id === broadcastSpecificAthleteId);
                        const phone = (target?.guardianPhone || '').replace(/\D/g, '');
                        const msg = `*ACEDEP Natação Paralímpica - Comunicado Oficial*\n\n*Assunto:* ${broadcastSubject || 'Informativo'}\n\n${broadcastBody || 'Acesse o portal da ACEDEP para conferir as atualizações.'}\n\n_Atenciosamente, Comissão Técnica ACEDEP_`;
                        const targetPhone = phone.length >= 10 ? (phone.startsWith('55') ? phone : `55${phone}`) : '5511998809708';
                        window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 font-semibold text-xs transition-all cursor-pointer border border-emerald-500/30 flex items-center gap-1.5"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Enviar via WhatsApp do Responsável</span>
                    </button>
                  )}
                </div>
              </form>

              {/* Email Activity History Log */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Histórico de Atualizações Enviadas por E-mail ({emailLogs.length})</span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Sincronizado em Tempo Real
                  </span>
                </h5>

                <div className="space-y-2">
                  {emailLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl bg-black/40 border border-[#1e3a5f] space-y-1.5 text-xs hover:border-white/20 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-xs">{log.title}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-mono text-[10px] border border-emerald-500/20">
                          {log.status === 'enviado' ? '✓ Enviado' : 'Pendente'}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] line-clamp-2">{log.contentPreview}</p>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 pt-1 border-t border-white/5">
                        <span>Destinatários: <strong className="text-slate-300">{log.recipientSummary}</strong></span>
                        <span>{log.sentAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* =========================================================================
              TAB 3: NOTÍCIAS NO MURAL
             ========================================================================= */}
          {activeTab === 'noticias' && (
            <div className="space-y-6">
              <form onSubmit={handleAddNews} className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#d4af37]" />
                  Publicar Nova Notícia no Mural da ACEDEP
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Título da Notícia *</label>
                    <input
                      type="text"
                      required
                      value={newsTitle}
                      onChange={(e) => setNewsTitle(e.target.value)}
                      placeholder="Ex: ACEDEP conquista ouro nos 100m livre S14"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Categoria *</label>
                    <select
                      value={newsCategory}
                      onChange={(e) => setNewsCategory(e.target.value as NewsCategory)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value="Resultados & Provas">Resultados & Provas</option>
                      <option value="Comunicados Oficiais">Comunicados Oficiais</option>
                      <option value="Treinos & Calendário">Treinos & Calendário</option>
                      <option value="Eventos & Festivais">Eventos & Festivais</option>
                      <option value="Histórias de Superação">Histórias de Superação</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Resumo Rápido (Subtítulo)</label>
                  <input
                    type="text"
                    value={newsSummary}
                    onChange={(e) => setNewsSummary(e.target.value)}
                    placeholder="Breve frase descritiva para o card"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">URL da Imagem de Capa</label>
                  <input
                    type="url"
                    value={newsCoverUrl}
                    onChange={(e) => setNewsCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Conteúdo Completo *</label>
                  <textarea
                    required
                    rows={5}
                    value={newsContent}
                    onChange={(e) => setNewsContent(e.target.value)}
                    placeholder="Escreva os detalhes da notícia, resultados, datas ou comunicados..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] resize-y"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    id="notifyNewsEmail"
                    checked={newsNotifyEmail}
                    onChange={(e) => setNewsNotifyEmail(e.target.checked)}
                    className="rounded border-[#1e3a5f] text-[#d4af37] focus:ring-[#d4af37]"
                  />
                  <label htmlFor="notifyNewsEmail" className="cursor-pointer">
                    📧 Enviar aviso desta notícia por e-mail automaticamente a todos os pais e responsáveis
                  </label>
                </div>

                {newsSuccess && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{newsSuccess}</span>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSavingNews}
                  className="px-5 py-2.5 rounded-xl bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingNews ? 'Publicando...' : 'Salvar e Publicar Notícia'}
                </button>
              </form>

              {/* Existing News List */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Notícias Publicadas ({newsPosts.length})
                </h5>
                <div className="space-y-2">
                  {newsPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-3.5 rounded-xl bg-black/40 border border-[#1e3a5f] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="truncate">
                        <p className="font-bold text-white truncate">{post.title}</p>
                        <p className="text-[10px] text-slate-400">{post.category} • {post.date}</p>
                      </div>
                      <button
                        onClick={() => deleteNewsPost(post.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                        title="Excluir notícia"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 4: LANÇAR TEMPOS & RECORDES (RP)
             ========================================================================= */}
          {activeTab === 'tempos' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form to Add New RP Metric */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4">
                  <div className="border-b border-white/10 pb-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Timer className="w-4 h-4 text-[#d4af37]" />
                      <span>Lançar Nova Marca / Tempo de Natação</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Cadastre os tempos por prova e estilo. O sistema gera automaticamente o ranking dos melhores tempos (RP) e compara diferenças entre campeonatos.
                    </p>
                  </div>

                  <form onSubmit={handleAddTime} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Selecione o Nadador *</label>
                      <select
                        value={selectedAthleteIdForTime || (athletes[0]?.id || '')}
                        onChange={(e) => {
                          setSelectedAthleteIdForTime(e.target.value);
                          setMetricPreviousTime('');
                          setMetricComparedChampionship('');
                        }}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                      >
                        {athletes.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.disabilityCategory || 'S14'})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Estilo e Prova */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300 block">Estilo da Prova *</label>
                      <div className="grid grid-cols-5 gap-1">
                        {STROKE_DETAILS.map((st) => (
                          <button
                            key={st.value}
                            type="button"
                            onClick={() => {
                              setMetricStroke(st.value);
                              // Auto set first preset event for this stroke if current doesn't match
                              const presets = EVENT_PRESETS.filter((p) => p.stroke === st.value).map((p) => p.event);
                              if (presets.length > 0 && !presets.includes(metricEvent)) {
                                setMetricEvent(presets[0]);
                              }
                            }}
                            className={`py-1.5 px-1 text-center rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              metricStroke === st.value
                                ? 'bg-[#d4af37] text-[#060e1c] shadow'
                                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <span className="block text-xs">{st.icon}</span>
                            <span className="truncate block text-[10px]">{st.label}</span>
                          </button>
                        ))}
                      </div>

                      <div className="pt-1">
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Distância / Prova *</label>
                        <div className="flex flex-wrap gap-1.5">
                          {EVENT_PRESETS.filter((p) => p.stroke === metricStroke).map((preset) => (
                            <button
                              key={preset.event}
                              type="button"
                              onClick={() => setMetricEvent(preset.event)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                                metricEvent === preset.event
                                  ? 'bg-[#d4af37] text-black font-bold ring-1 ring-[#d4af37]'
                                  : 'bg-black/50 border border-[#1e3a5f] text-slate-300 hover:bg-white/10'
                              }`}
                            >
                              {preset.event}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Tempos e Diferenças */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-xs font-semibold text-[#d4af37] block mb-1">Tempo Cronometrado *</label>
                        <input
                          type="text"
                          required
                          value={metricTime}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMetricTime(val);
                            if (metricPreviousTime && val) {
                              const diff = calculateTimeDifference(val, metricPreviousTime);
                              if (diff.diffText) {
                                setMetricEvolution(diff.diffText);
                              }
                            }
                          }}
                          placeholder="Ex: 00:29.40"
                          className="w-full px-3 py-2 font-mono font-bold text-xs rounded-xl bg-black/50 border border-[#d4af37]/60 text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Ano da Prova</label>
                        <input
                          type="text"
                          value={metricYear}
                          onChange={(e) => setMetricYear(e.target.value)}
                          placeholder="Ex: 2026"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Campeonato / Etapa *</label>
                        <input
                          type="text"
                          required
                          value={metricStage}
                          onChange={(e) => setMetricStage(e.target.value)}
                          placeholder="Ex: Circuito Paralímpico SP"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Piscina</label>
                        <select
                          value={metricLaneType}
                          onChange={(e) => setMetricLaneType(e.target.value as '25m' | '50m')}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                        >
                          <option value="50m">Piscina 50m (Olímpica)</option>
                          <option value="25m">Piscina 25m (Semi-Olímpica)</option>
                        </select>
                      </div>
                    </div>

                    {/* Comparação sutil entre campeonatos */}
                    <div className="p-3 rounded-xl bg-black/40 border border-[#1e3a5f] space-y-2">
                      <label className="text-[11px] font-bold text-cyan-300 block">
                        Comparar Diferença com Outro Campeonato / Tempo Anterior (Opcional)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <input
                            type="text"
                            value={metricComparedChampionship}
                            onChange={(e) => setMetricComparedChampionship(e.target.value)}
                            placeholder="Ex: vs Etapa Regional 2025"
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={metricEvolution}
                            onChange={(e) => setMetricEvolution(e.target.value)}
                            placeholder="Ex: -0.45s (Novo RP)"
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        💡 Mostra no portal do atleta a evolução comparativa de segundos entre os campeonatos.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <input
                        type="checkbox"
                        id="notifyTimeEmail"
                        checked={timeNotifyEmail}
                        onChange={(e) => setTimeNotifyEmail(e.target.checked)}
                        className="rounded border-[#1e3a5f] text-[#d4af37] focus:ring-[#d4af37]"
                      />
                      <label htmlFor="notifyTimeEmail" className="cursor-pointer text-[11px]">
                        📧 Notificar responsável do atleta por e-mail comemorando a nova marca
                      </label>
                    </div>

                    {timeError && (
                      <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{timeError}</span>
                      </div>
                    )}

                    {timeSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{timeSuccess}</span>
                      </div>
                    )}

                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={isSavingTime}
                        className="w-full py-2.5 rounded-xl bg-[#d4af37] text-[#060e1c] font-black text-xs hover:bg-[#b8952b] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/10"
                      >
                        {isSavingTime ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Timer className="w-4 h-4" />}
                        <span>{isSavingTime ? 'Gravando no Banco de Dados...' : 'Salvar Novo Tempo & Atualizar Ranking'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right: Live List of Records & Ranking for Selected Athlete */}
                <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4">
                  {(() => {
                    const currentSelectedAthlete = athletes.find((a) => a.id === (selectedAthleteIdForTime || athletes[0]?.id));
                    const rawMetrics = currentSelectedAthlete?.swimmingMetrics || [];
                    const grouped = groupAndRankMetrics(rawMetrics);

                    // Filter grouped by selected stroke filter
                    const filteredGrouped = selectedStrokeFilterAdmin === 'all'
                      ? grouped.allEventGroups
                      : (grouped.byStroke[selectedStrokeFilterAdmin as SwimmingStroke] || []);

                    return (
                      <>
                        <div className="border-b border-white/10 pb-3 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-[#d4af37]" />
                                <span>Ranking & Tempos: {currentSelectedAthlete?.name || 'Nadador'}</span>
                              </h4>
                              <p className="text-[11px] text-slate-400">
                                {rawMetrics.length} cronometragens registradas • Separadas por estilo e prova
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setExportModalInitialType('swimming_times_ranking');
                                  setExportModalAthleteId(currentSelectedAthlete?.id);
                                  setExportModalOpen(true);
                                }}
                                className="px-3 py-1 rounded-xl bg-[#d4af37]/20 hover:bg-[#d4af37] text-[#f3e5ab] hover:text-[#060e1c] border border-[#d4af37]/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                                title="Exportar tempos e ranking em PDF ou Word"
                              >
                                <FileDown className="w-3.5 h-3.5" />
                                <span>Exportar Ranking</span>
                              </button>
                            </div>
                          </div>

                          {/* Stroke Filter Tabs */}
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedStrokeFilterAdmin('all')}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                selectedStrokeFilterAdmin === 'all'
                                  ? 'bg-[#d4af37] text-[#060e1c]'
                                  : 'bg-white/5 text-slate-400 hover:text-white'
                              }`}
                            >
                              Todos
                            </button>
                            {STROKE_DETAILS.map((st) => (
                              <button
                                key={st.value}
                                type="button"
                                onClick={() => setSelectedStrokeFilterAdmin(st.value)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                  selectedStrokeFilterAdmin === st.value
                                    ? 'bg-[#d4af37] text-[#060e1c]'
                                    : 'bg-white/5 text-slate-400 hover:text-white'
                                }`}
                              >
                                {st.icon} {st.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                          {rawMetrics.length === 0 ? (
                            <div className="p-8 rounded-xl bg-black/30 border border-white/5 text-center text-xs text-slate-400 space-y-2">
                              <Timer className="w-8 h-8 mx-auto text-slate-600" />
                              <p>Nenhum tempo RP lançado ainda para este atleta.</p>
                              <p className="text-[11px] text-slate-500">Use o formulário ao lado para cadastrar marcas e campeonatos.</p>
                            </div>
                          ) : filteredGrouped.length === 0 ? (
                            <div className="p-6 rounded-xl bg-black/30 text-center text-xs text-slate-400">
                              Nenhuma marca cadastrada para este estilo.
                            </div>
                          ) : (
                            filteredGrouped.map((group) => (
                              <div
                                key={`${group.stroke}-${group.event}`}
                                className="rounded-xl bg-black/40 border border-[#1e3a5f] p-3.5 space-y-2.5"
                              >
                                {/* Group Header */}
                                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                                      <span>{group.event}</span>
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-medium">
                                      Estilo {group.stroke}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400">
                                    {group.allMetrics.length} {group.allMetrics.length === 1 ? 'registro' : 'registros'}
                                  </span>
                                </div>

                                {/* Ranked Records inside this event */}
                                <div className="space-y-1.5">
                                  {group.allMetrics.map((record) => {
                                    const isRP = record.rank === 1;
                                    return (
                                      <div
                                        key={record.id}
                                        className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 text-xs transition-all ${
                                          isRP
                                            ? 'bg-[#d4af37]/10 border-[#d4af37]/40 text-white'
                                            : 'bg-white/5 border-white/5 text-slate-300'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          {/* Rank badge */}
                                          <div className="shrink-0">
                                            {record.rank === 1 ? (
                                              <span className="px-1.5 py-0.5 rounded bg-[#d4af37] text-black font-black text-[10px] flex items-center gap-0.5 shadow">
                                                🥇 RP
                                              </span>
                                            ) : record.rank === 2 ? (
                                              <span className="px-1.5 py-0.5 rounded bg-slate-300 text-black font-bold text-[10px]">
                                                🥈 #2
                                              </span>
                                            ) : record.rank === 3 ? (
                                              <span className="px-1.5 py-0.5 rounded bg-amber-700 text-white font-bold text-[10px]">
                                                🥉 #3
                                              </span>
                                            ) : (
                                              <span className="px-1.5 py-0.5 rounded bg-black/40 text-slate-400 text-[10px]">
                                                #{record.rank}
                                              </span>
                                            )}
                                          </div>

                                          <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className="font-mono font-black text-sm text-[#f3e5ab]">
                                                {record.bestTime}
                                              </span>
                                              <span className="text-slate-300 font-medium truncate text-xs">
                                                {record.stageName}
                                              </span>
                                              <span className="px-1.5 py-0.2 rounded bg-white/10 text-slate-300 text-[10px] font-bold">
                                                {record.year || '2026'}
                                              </span>
                                            </div>

                                            {/* Evolution and subtle delta comparison */}
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 flex-wrap">
                                              <span>Piscina {record.laneType || '50m'}</span>
                                              {record.comparedToChampionship && (
                                                <>
                                                  <span>•</span>
                                                  <span className="text-cyan-300">
                                                    {record.comparedToChampionship}
                                                  </span>
                                                </>
                                              )}
                                              {record.differenceFromBest && (
                                                <span className="px-1.5 py-0.2 rounded font-mono font-bold bg-amber-500/20 text-amber-300">
                                                  {record.differenceFromBest}
                                                </span>
                                              )}
                                              {record.differenceFromPrevious && !record.differenceFromBest && (
                                                <span className={`px-1.5 py-0.2 rounded font-mono font-bold ${
                                                  record.differenceFromPrevious.startsWith('-')
                                                    ? 'bg-emerald-500/20 text-emerald-300'
                                                    : 'bg-amber-500/20 text-amber-300'
                                                }`}>
                                                  {record.differenceFromPrevious}
                                                </span>
                                              )}
                                              {record.evolution && !record.differenceFromPrevious && !record.differenceFromBest && (
                                                <span className="text-emerald-400 font-medium">
                                                  ({record.evolution})
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Action buttons */}
                                        <button
                                          type="button"
                                          disabled={deletingTimeId === record.id}
                                          onClick={() => currentSelectedAthlete && handleDeleteTime(currentSelectedAthlete.id, record.id)}
                                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                                          title="Excluir marca"
                                        >
                                          {deletingTimeId === record.id ? (
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-400" />
                                          ) : (
                                            <Trash2 className="w-3.5 h-3.5" />
                                          )}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB: AGENDA 2026 & EVENTOS OFICIAIS (FIREBASE FIRESTORE)
             ========================================================================= */}
          {activeTab === 'agenda' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Add/Edit Event */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#d4af37]" />
                      <span>{editingEventId ? 'Editar Evento da Agenda' : 'Novo Evento / Competição 2026'}</span>
                    </h4>
                    {editingEventId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEventId(null);
                          setEventTitle('');
                          setEventDate('');
                          setEventDescription('');
                        }}
                        className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                      >
                        Cancelar Edição
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSaveEvent} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Título do Evento / Etapa *</label>
                      <input
                        type="text"
                        required
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        placeholder="Ex: Circuito Nacional Paralímpico - 1ª Fase"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Mês do Calendário *</label>
                        <select
                          value={eventMonth}
                          onChange={(e) => setEventMonth(Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                        >
                          <option value={1}>01 - Janeiro</option>
                          <option value={2}>02 - Fevereiro</option>
                          <option value={3}>03 - Março</option>
                          <option value={4}>04 - Abril</option>
                          <option value={5}>05 - Maio</option>
                          <option value={6}>06 - Junho</option>
                          <option value={7}>07 - Julho</option>
                          <option value={8}>08 - Agosto</option>
                          <option value={9}>09 - Setembro</option>
                          <option value={10}>10 - Outubro</option>
                          <option value={11}>11 - Novembro</option>
                          <option value={12}>12 - Dezembro</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Data Exata / Período *</label>
                        <input
                          type="text"
                          required
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          placeholder="Ex: 14 e 15 de Março"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Categoria do Evento</label>
                        <select
                          value={eventCategory}
                          onChange={(e) => setEventCategory(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                        >
                          <option value="Competição Oficial">Competição Oficial</option>
                          <option value="Avaliação Técnica">Avaliação Técnica</option>
                          <option value="Festival Inclusivo">Festival Inclusivo</option>
                          <option value="Confraternização">Confraternização</option>
                          <option value="Treino Especial">Treino Especial</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Status</label>
                        <select
                          value={eventStatus}
                          onChange={(e) => setEventStatus(e.target.value as 'Confirmado' | 'Previsto')}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                        >
                          <option value="Confirmado">Confirmado</option>
                          <option value="Previsto">Previsto</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Local do Evento</label>
                      <input
                        type="text"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        placeholder="Ex: Centro Paralímpico Brasileiro - São Paulo"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Categoria / Público Alvo</label>
                      <input
                        type="text"
                        value={eventTarget}
                        onChange={(e) => setEventTarget(e.target.value)}
                        placeholder="Ex: Equipe Principal S14 e Base"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Descrição / Detalhes</label>
                      <textarea
                        rows={3}
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                        placeholder="Informações adicionais para atletas e responsáveis..."
                        className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] resize-none"
                      />
                    </div>

                    {!editingEventId && (
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <input
                          type="checkbox"
                          id="notifyEventEmail"
                          checked={eventNotifyEmail}
                          onChange={(e) => setEventNotifyEmail(e.target.checked)}
                          className="rounded border-[#1e3a5f] text-[#d4af37] focus:ring-[#d4af37]"
                        />
                        <label htmlFor="notifyEventEmail" className="cursor-pointer">
                          📧 Disparar e-mail informativo com este evento para todos os pais cadastrados
                        </label>
                      </div>
                    )}

                    {eventSuccess && (
                      <p className="text-xs text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{eventSuccess}</span>
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSavingEvent}
                      className="px-5 py-2.5 rounded-xl bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSavingEvent ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Calendar className="w-3.5 h-3.5" />}
                      <span>{isSavingEvent ? 'Salvando...' : editingEventId ? 'Atualizar Evento' : 'Salvar na Agenda 2026'}</span>
                    </button>
                  </form>
                </div>

                {/* Right: List of 2026 Events in Firestore */}
                <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#d4af37]" />
                        <span>Calendário Oficial 2026 ({annualEvents.length} eventos)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">Sincronizado em tempo real na Home e no Portal dos Pais</p>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                    {annualEvents.length === 0 ? (
                      <div className="p-8 rounded-xl bg-black/30 border border-white/5 text-center text-xs text-slate-400">
                        Nenhum evento cadastrado para a Agenda 2026.
                      </div>
                    ) : (
                      annualEvents.map((evt) => (
                        <div
                          key={evt.id}
                          className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-white text-sm">{evt.title}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                evt.status === 'confirmado'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}>
                                {evt.status || 'Confirmado'}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                                {evt.category}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                              <span className="text-[#f3e5ab] font-medium flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-[#d4af37]" />
                                {evt.date} (Mês {evt.month})
                              </span>
                              {evt.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-500" />
                                  {evt.location}
                                </span>
                              )}
                              {evt.targetCategory && (
                                <span className="text-slate-400">
                                  Alvo: {evt.targetCategory}
                                </span>
                              )}
                            </div>

                            {evt.description && (
                              <p className="text-[11px] text-slate-300 line-clamp-2">
                                {evt.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleEditEvent(evt)}
                              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                              title="Editar evento"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEvent(evt.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                              title="Excluir evento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 5: RECADOS AO RESPONSÁVEL
             ========================================================================= */}
          {activeTab === 'recados' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Send Coach Note */}
                <div className="lg:col-span-6 p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4">
                  <div className="border-b border-white/10 pb-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#d4af37]" />
                      Enviar Feedback / Orientação Privada ao Responsável
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Comunique-se diretamente com os pais e responsáveis sobre atestados, evolução técnica e recomendações.
                    </p>
                  </div>

                  <form onSubmit={handleAddNote} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Selecione o Nadador *</label>
                      <select
                        value={selectedAthleteIdForNote || (athletes[0]?.id || '')}
                        onChange={(e) => setSelectedAthleteIdForNote(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                      >
                        {athletes.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} (Responsável: {a.guardianName})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quick message template suggestions */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">Modelos Rápidos de Mensagem:</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {[
                          {
                            title: 'Evolução Técnica no Treino',
                            text: 'Parabéns pela dedicação e excelente evolução técnica na braçada e respiração bilateral nos treinos desta semana no CPB!',
                          },
                          {
                            title: 'Lembrete de Atestado Médico',
                            text: 'Solicitamos aos responsáveis o envio do atestado médico/cardiológico atualizado para validação na federação e controle de saúde.',
                          },
                          {
                            title: 'Convocação para Competição',
                            text: 'O atleta está convocado para representar a ACEDEP na próxima etapa oficial. Favor verificar horário de aquecimento e documentação.',
                          },
                          {
                            title: 'Orientações de Hidratação e Descanso',
                            text: 'Recomendamos manter hidratação constante antes do treino e alimentação balanceada rica em carboidratos complexos.',
                          },
                        ].map((tpl, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setNoteTitle(tpl.title);
                              setNoteText(tpl.text);
                            }}
                            className="p-2 rounded-xl bg-white/5 border border-white/5 hover:border-[#d4af37]/40 hover:bg-[#d4af37]/5 text-left text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer truncate"
                          >
                            <span className="font-bold text-[#d4af37] block truncate">⚡ {tpl.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Título do Recado</label>
                        <input
                          type="text"
                          value={noteTitle}
                          onChange={(e) => setNoteTitle(e.target.value)}
                          placeholder="Ex: Excelente evolução na respiração bilateral"
                          className="w-full px-3 py-2.5 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Professor / Treinador Autor</label>
                        <input
                          type="text"
                          value={noteCoachName}
                          onChange={(e) => setNoteCoachName(e.target.value)}
                          placeholder="Ex: Prof. Leonardo Ramos"
                          className="w-full px-3 py-2.5 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Mensagem / Orientação do Treinador *</label>
                      <textarea
                        required
                        rows={4}
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Escreva a orientação para os pais sobre o treino aquático, atestados ou comportamento..."
                        className="w-full px-3 py-2.5 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] resize-none leading-relaxed"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-300 pt-1">
                      <input
                        type="checkbox"
                        id="notifyNoteEmail"
                        checked={noteNotifyEmail}
                        onChange={(e) => setNoteNotifyEmail(e.target.checked)}
                        className="rounded border-[#1e3a5f] text-[#d4af37] focus:ring-[#d4af37]"
                      />
                      <label htmlFor="notifyNoteEmail" className="cursor-pointer">
                        📧 Gravar no portal e registrar envio de e-mail ao responsável
                      </label>
                    </div>

                    {noteError && (
                      <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{noteError}</span>
                      </div>
                    )}

                    {noteSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{noteSuccess}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2.5 pt-2">
                      <button
                        type="submit"
                        disabled={isSavingNote}
                        className="px-6 py-3 rounded-xl bg-[#d4af37] text-[#060e1c] font-black text-xs hover:bg-[#b8952b] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[#d4af37]/10"
                      >
                        {isSavingNote ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span>{isSavingNote ? 'Enviando ao Banco...' : 'Gravar Recado no Portal'}</span>
                      </button>

                      {/* Direct WhatsApp and Gmail Buttons */}
                      {(() => {
                        const target = athletes.find((a) => a.id === (selectedAthleteIdForNote || athletes[0]?.id));
                        if (!target) return null;
                        const sub = noteTitle || `Recado do Treinador ACEDEP - Atleta ${target.name}`;
                        const body = `Olá ${target.guardianName}!\n\nSegue recado da comissão técnica da ACEDEP sobre ${target.name}:\n\n"${noteText || '...'}"\n\nAtenciosamente,\n${noteCoachName}`;

                        return (
                          <div className="flex items-center gap-2">
                            {target.guardianPhone && (
                              <button
                                type="button"
                                onClick={() => {
                                  const cleanPhone = target.guardianPhone.replace(/\D/g, '');
                                  const waUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(body)}`;
                                  window.open(waUrl, '_blank');
                                }}
                                className="px-3.5 py-3 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                                title="Enviar via WhatsApp"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </button>
                            )}

                            {target.guardianEmail && (
                              <button
                                type="button"
                                onClick={() => {
                                  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(target.guardianEmail)}&su=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`;
                                  window.open(gmailUrl, '_blank');
                                }}
                                className="px-3.5 py-3 rounded-xl bg-red-600/20 text-red-300 border border-red-500/30 text-xs font-bold hover:bg-red-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                                title="Abrir diretamente no Gmail"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>Abrir no Gmail</span>
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </form>
                </div>

                {/* Right: Sent Notes for this athlete */}
                <div className="lg:col-span-6 p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4">
                  {(() => {
                    const currentSelectedAthlete = athletes.find((a) => a.id === (selectedAthleteIdForNote || athletes[0]?.id));
                    const notes = currentSelectedAthlete?.coachNotes || [];
                    return (
                      <>
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <div>
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-[#d4af37]" />
                              <span>Recados Enviados: {currentSelectedAthlete?.name || 'Atleta'}</span>
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              {notes.length} orientações gravadas em banco de dados
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                          {notes.length === 0 ? (
                            <div className="p-8 rounded-xl bg-black/30 border border-white/5 text-center text-xs text-slate-400 space-y-2">
                              <MessageSquare className="w-8 h-8 mx-auto text-slate-600" />
                              <p>Nenhum recado cadastrado ainda para este atleta.</p>
                              <p className="text-[11px] text-slate-500">Use o formulário ao lado para enviar uma orientação técnica ou aviso aos pais.</p>
                            </div>
                          ) : (
                            notes.map((n) => (
                              <div
                                key={n.id}
                                className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-0.5">
                                    <span className="font-bold text-white text-sm">{n.title}</span>
                                    <p className="text-[10px] text-slate-400">
                                      Por: {n.coachName || 'Comissão Técnica'} • {n.date}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    disabled={deletingNoteId === n.id}
                                    onClick={() => currentSelectedAthlete && handleDeleteNote(currentSelectedAthlete.id, n.id)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-50"
                                    title="Remover recado"
                                  >
                                    {deletingNoteId === n.id ? (
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-400" />
                                    ) : (
                                      <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                                <p className="text-slate-300 bg-white/5 p-3 rounded-lg text-xs leading-relaxed border border-white/5">
                                  {n.text}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB: FOTOS DAS SEÇÕES DO SITE (FIREBASE FIRESTORE)
             ========================================================================= */}
          {activeTab === 'fotos' && (
            <div className="space-y-6">
              {/* Section Selector Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-[#1e3a5f] pb-3">
                {Object.keys(DEFAULT_PHOTOS).map((photoKey) => {
                  const meta = DEFAULT_PHOTOS[photoKey];
                  const isSelected = selectedPhotoId === photoKey;
                  return (
                    <button
                      key={photoKey}
                      onClick={() => {
                        setSelectedPhotoId(photoKey);
                        setCustomPhotoUrlInput('');
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? 'bg-[#d4af37] text-[#060e1c] shadow-lg'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{meta.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Section Editor Card */}
              {selectedPhotoId && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#0a192f]/60 p-5 rounded-2xl border border-[#1e3a5f]">
                  
                  {/* Left Column: Live Preview */}
                  <div className="md:col-span-5 space-y-2">
                    <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                      <span>Visualização Atual</span>
                      {previewOverride[selectedPhotoId] && (
                        <span className="text-[10px] text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/30">
                          Prévia não salva
                        </span>
                      )}
                    </label>

                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/60 border border-[#1e3a5f] group shadow-inner">
                      <img
                        src={previewOverride[selectedPhotoId] || photos[selectedPhotoId] || DEFAULT_PHOTOS[selectedPhotoId]?.defaultUrl}
                        alt="Prévia da foto"
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                      
                      <div className="absolute bottom-2 left-2 right-2 p-2 rounded-lg bg-black/60 backdrop-blur-sm text-[11px] text-slate-300">
                        <span className="font-bold text-[#f3e5ab] block">
                          {DEFAULT_PHOTOS[selectedPhotoId]?.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Seção: {DEFAULT_PHOTOS[selectedPhotoId]?.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Upload & Actions */}
                  <div className="md:col-span-7 space-y-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">
                        Atualizar Foto desta Seção
                      </h4>
                      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                        Envie a foto do seu dispositivo. Ao salvar, ela será atualizada no <strong>Firebase Firestore</strong> instantaneamente para todos os visitantes.
                      </p>

                      {/* Dropzone & File Input */}
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handlePhotoDrop(selectedPhotoId, e)}
                        className="p-6 rounded-xl border-2 border-dashed border-[#1e3a5f] hover:border-[#d4af37] bg-black/40 text-center transition-colors mb-4"
                      >
                        <Upload className="w-8 h-8 mx-auto text-[#d4af37] mb-2" />
                        <p className="text-xs font-semibold text-white mb-1">
                          Arraste e solte a nova foto aqui
                        </p>
                        <p className="text-[11px] text-slate-400 mb-3">
                          ou clique no botão abaixo para escolher
                        </p>

                        <input
                          type="file"
                          id={`file-input-${selectedPhotoId}`}
                          accept="image/*"
                          onChange={(e) => handlePhotoFileChange(selectedPhotoId, e)}
                          className="sr-only"
                        />
                        <label
                          htmlFor={`file-input-${selectedPhotoId}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-[#d4af37] text-white hover:text-[#060e1c] text-xs font-bold transition-all border border-white/20 hover:border-[#d4af37] cursor-pointer shadow"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Selecionar Imagem...</span>
                        </label>
                      </div>

                      {/* Optional URL input */}
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 block font-medium">
                          Ou digite o link direto de uma imagem (URL):
                        </label>
                        <input
                          type="url"
                          value={customPhotoUrlInput}
                          onChange={(e) => {
                            setCustomPhotoUrlInput(e.target.value);
                            if (e.target.value) {
                              setPreviewOverride((prev) => ({ ...prev, [selectedPhotoId]: e.target.value }));
                            }
                          }}
                          placeholder="https://exemplo.com/minha-foto.jpg"
                          className="w-full px-3 py-2 text-xs rounded-lg bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                    </div>

                    {/* Feedback Messages */}
                    {successPhotoState[selectedPhotoId] && (
                      <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{successPhotoState[selectedPhotoId]}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#1e3a5f]">
                      {confirmResetId === selectedPhotoId ? (
                        <div className="flex items-center gap-2 bg-amber-950/80 border border-amber-500/50 px-3 py-1.5 rounded-xl">
                          <span className="text-[11px] text-amber-200 font-semibold">Restaurar original?</span>
                          <button
                            type="button"
                            onClick={() => handleResetPhotoExecute(selectedPhotoId)}
                            className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-[#060e1c] font-bold text-xs cursor-pointer transition-colors"
                          >
                            Sim
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmResetId(null)}
                            className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 font-semibold text-xs cursor-pointer transition-colors"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmResetId(selectedPhotoId)}
                          disabled={uploadingState[selectedPhotoId]}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restaurar Padrão</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleSavePhotoToFirestore(selectedPhotoId)}
                        disabled={
                          uploadingState[selectedPhotoId] ||
                          (!previewOverride[selectedPhotoId] && !customPhotoUrlInput.trim())
                        }
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] transition-all shadow-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {uploadingState[selectedPhotoId] ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Gravando no Banco...</span>
                          </>
                        ) : (
                          <>
                            <Database className="w-3.5 h-3.5" />
                            <span>Salvar no Banco de Dados</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB: GALERIA DE FOTOS DA ACEDEP
             ========================================================================= */}
          {activeTab === 'galeria' && (
            <div className="space-y-6">
              {/* Add New Gallery Photo Card */}
              <form 
                onSubmit={handleAddGalleryPhotoSubmit}
                className="p-5 rounded-2xl bg-[#0a192f]/80 border border-[#1e3a5f] space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[#1e3a5f] pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#d4af37]" />
                    Adicionar Nova Foto na Galeria
                  </h4>
                  <span className="text-[11px] text-slate-400">Salvo diretamente no Firestore</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Photo inputs */}
                  <div className="md:col-span-8 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Título / Descrição da Foto *
                        </label>
                        <input
                          type="text"
                          required
                          value={newGalTitle}
                          onChange={(e) => setNewGalTitle(e.target.value)}
                          placeholder="Ex: Treino da equipe nas piscinas"
                          className="w-full px-3 py-2 text-xs rounded-lg bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Categoria *
                        </label>
                        <select
                          value={newGalCategory}
                          onChange={(e) => setNewGalCategory(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-[#060e1c] border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                        >
                          <option value="Equipe Oficial">Equipe Oficial</option>
                          <option value="Iniciação Esportiva">Iniciação Esportiva</option>
                          <option value="Alto Rendimento">Alto Rendimento</option>
                          <option value="Competições">Competições</option>
                          <option value="Treinamento">Treinamento</option>
                          <option value="Comunidade ACEDEP">Comunidade ACEDEP</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Data / Evento (opcional)
                        </label>
                        <input
                          type="text"
                          value={newGalDate}
                          onChange={(e) => setNewGalDate(e.target.value)}
                          placeholder="Ex: Campeonato Paulista 2026"
                          className="w-full px-3 py-2 text-xs rounded-lg bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Ou Link da Imagem (URL)
                        </label>
                        <input
                          type="url"
                          value={newGalUrl}
                          onChange={(e) => setNewGalUrl(e.target.value)}
                          placeholder="https://exemplo.com/foto.jpg"
                          className="w-full px-3 py-2 text-xs rounded-lg bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                    </div>

                    {/* File Upload Selector */}
                    <div>
                      <input
                        type="file"
                        id="gallery-file-upload-coach"
                        accept="image/*"
                        onChange={handleGalleryFileChange}
                        className="sr-only"
                      />
                      <label
                        htmlFor="gallery-file-upload-coach"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-[#d4af37] text-slate-300 hover:text-[#060e1c] text-xs font-semibold transition-all border border-white/10 hover:border-[#d4af37] cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Carregar foto do seu dispositivo</span>
                      </label>
                    </div>
                  </div>

                  {/* Photo preview box */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-3 rounded-xl bg-black/40 border border-[#1e3a5f]">
                    {newGalPreview || newGalUrl ? (
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-[#d4af37]/40">
                        <img
                          src={newGalPreview || newGalUrl}
                          alt="Prévia"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                        <span className="text-[10px]">Nenhuma foto selecionada</span>
                      </div>
                    )}
                  </div>
                </div>

                {galleryError && (
                  <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{galleryError}</span>
                  </div>
                )}

                {gallerySuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{gallerySuccess}</span>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSavingGallery || (!newGalPreview && !newGalUrl.trim())}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] transition-all shadow cursor-pointer disabled:opacity-40"
                  >
                    {isSavingGallery ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Salvando na Galeria...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar à Galeria</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* List of existing gallery photos with delete option */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Fotos Atuais na Galeria ({galleryPhotos.length})</span>
                  <span className="text-[10px] text-slate-400 font-normal">Clique no ícone de lixeira para remover</span>
                </h4>

                {galleryPhotos.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#0a192f]/40 border border-dashed border-[#1e3a5f] text-center text-slate-400">
                    <Images className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                    <p className="text-xs font-semibold text-slate-300">Nenhuma foto na galeria no momento.</p>
                    <p className="text-[11px] text-slate-500 mt-1">Adicione novas fotos usando o formulário acima.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {galleryPhotos.map((photo) => {
                      const isConfirming = confirmDeleteGalleryId === photo.id;
                      const isDeleting = isDeletingGalleryId === photo.id;

                      return (
                        <div
                          key={photo.id}
                          className="relative rounded-xl overflow-hidden bg-[#0a192f] border border-white/10 p-2.5 flex gap-3 items-center group transition-all hover:border-[#1e3a5f]"
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-black shrink-0 border border-white/10">
                            <img
                              src={photo.url}
                              alt={photo.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#d4af37]/20 text-[#f3e5ab] font-semibold">
                              {photo.category}
                            </span>
                            <h5 className="text-xs font-bold text-white truncate mt-1">
                              {photo.title}
                            </h5>
                            {photo.date && (
                              <p className="text-[10px] text-slate-400 truncate">
                                {photo.date}
                              </p>
                            )}
                          </div>

                          {isConfirming ? (
                            <div className="flex flex-col gap-1 shrink-0 bg-red-950/90 border border-red-500/60 p-1.5 rounded-lg z-10">
                              <span className="text-[9px] text-red-200 font-bold text-center">Excluir?</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={isDeleting}
                                  onClick={() => executeDeleteGalleryPhoto(photo)}
                                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold cursor-pointer transition-colors shadow"
                                >
                                  {isDeleting ? '...' : 'Sim'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteGalleryId(null)}
                                  className="px-2 py-1 bg-white/10 hover:bg-white/20 text-slate-300 rounded text-[10px] font-semibold cursor-pointer transition-colors"
                                >
                                  Não
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteGalleryId(photo.id)}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 transition-colors cursor-pointer shrink-0"
                              title="Remover foto da galeria"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB: MURAL DA FAMÍLIA & COMUNIDADE (MODERAÇÃO DE RECADOS)
             ========================================================================= */}
          {activeTab === 'mural_familia' && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0a192f]/80 border border-[#1e3a5f]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Gerenciar Mural de Recados da Família & Comunidade
                    </h4>
                    <p className="text-xs text-slate-300">
                      Edite textos, corrija informações ou exclua mensagens publicadas no mural de torcida.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#f3e5ab] text-xs font-bold whitespace-nowrap">
                    Total: {cheers.length} {cheers.length === 1 ? 'recado' : 'recados'}
                  </span>
                </div>
              </div>

              {/* Feedback messages */}
              {cheerAdminSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{cheerAdminSuccess}</span>
                </div>
              )}

              {cheerAdminError && (
                <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{cheerAdminError}</span>
                </div>
              )}

              {/* Add New Official Cheer Form */}
              <div className="p-5 rounded-2xl bg-[#0c1f38] border border-[#1e3a5f] space-y-4">
                <div className="flex items-center gap-2 border-b border-[#1e3a5f]/60 pb-3">
                  <Plus className="w-4 h-4 text-[#d4af37]" />
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                    Publicar Novo Recado Oficial da Coordenação / Comissão
                  </h5>
                </div>

                <form onSubmit={handleAdminAddCheerSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3.5 text-xs">
                  <div className="md:col-span-4">
                    <label className="text-slate-300 block mb-1 font-semibold">Nome do Autor / Emissor *</label>
                    <input
                      type="text"
                      required
                      value={newAdminCheerAuthor}
                      onChange={(e) => setNewAdminCheerAuthor(e.target.value)}
                      placeholder="Ex: Prof. Leonardo Ramos / Coordenação"
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="text-slate-300 block mb-1 font-semibold">Vínculo / Cargo</label>
                    <input
                      type="text"
                      value={newAdminCheerRelation}
                      onChange={(e) => setNewAdminCheerRelation(e.target.value)}
                      placeholder="Ex: Coordenação Técnica ACEDEP"
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div className="md:col-span-4 flex items-end">
                    <button
                      type="submit"
                      disabled={isAddingAdminCheer || !newAdminCheerAuthor.trim() || !newAdminCheerMsg.trim()}
                      className="w-full py-2 px-4 rounded-xl bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                    >
                      {isAddingAdminCheer ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Publicando...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Publicar no Mural</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="md:col-span-12">
                    <label className="text-slate-300 block mb-1 font-semibold">Mensagem de Incentivo aos Nadadores *</label>
                    <textarea
                      required
                      rows={2}
                      value={newAdminCheerMsg}
                      onChange={(e) => setNewAdminCheerMsg(e.target.value)}
                      placeholder="Escreva a mensagem que aparecerá no mural da comunidade..."
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] resize-none"
                    />
                  </div>

                  {addCheerSuccess && (
                    <div className="md:col-span-12 p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{addCheerSuccess}</span>
                    </div>
                  )}
                </form>
              </div>

              {/* Search & List of existing cheers */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#d4af37]" />
                    <span>Recados Publicados ({cheers.length})</span>
                  </h4>

                  {/* Search input */}
                  <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={cheerSearchTerm}
                      onChange={(e) => setCheerSearchTerm(e.target.value)}
                      placeholder="Buscar por autor, texto ou vínculo..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-black/40 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                {cheers.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#0a192f]/40 border border-dashed border-[#1e3a5f] text-center text-slate-400">
                    <Heart className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                    <p className="text-xs font-semibold text-slate-300">Nenhum recado no mural ainda.</p>
                    <p className="text-[11px] text-slate-500 mt-1">Publique o primeiro recado usando o formulário acima.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cheers
                      .filter((c) => {
                        if (!cheerSearchTerm.trim()) return true;
                        const term = cheerSearchTerm.toLowerCase();
                        return (
                          c.authorName.toLowerCase().includes(term) ||
                          c.message.toLowerCase().includes(term) ||
                          (c.relationship || '').toLowerCase().includes(term)
                        );
                      })
                      .map((cheer) => {
                        const isConfirmingDelete = confirmDeleteCheerId === cheer.id;
                        const isDeleting = isDeletingCheerId === cheer.id;

                        return (
                          <div
                            key={cheer.id}
                            className="p-4 rounded-2xl bg-[#0c1f38] border border-[#1e3a5f] hover:border-[#d4af37]/40 transition-all flex flex-col justify-between space-y-3 shadow-md group"
                          >
                            <div className="space-y-2.5">
                              {/* Author and metadata */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#060e1c] text-xs font-bold shrink-0 shadow"
                                    style={{ backgroundColor: cheer.avatarColor || '#d4af37' }}
                                  >
                                    {cheer.authorName.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-white truncate">{cheer.authorName}</p>
                                    <p className="text-[10px] text-[#d4af37] truncate font-medium">{cheer.relationship || 'Comunidade ACEDEP'}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="flex items-center gap-1 text-[10px] text-rose-300 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                                    <Heart className="w-2.5 h-2.5 fill-rose-400 text-rose-400" />
                                    <span>{cheer.likes || 0}</span>
                                  </span>
                                </div>
                              </div>

                              {/* Message text */}
                              <div className="p-3 rounded-xl bg-black/30 border border-[#1e3a5f]/40">
                                <p className="text-xs text-slate-200 leading-relaxed italic">
                                  "{cheer.message}"
                                </p>
                              </div>
                            </div>

                            {/* Action Buttons: Edit and Delete */}
                            <div className="pt-2 border-t border-[#1e3a5f]/40 flex items-center justify-between gap-2">
                              <span className="text-[10px] text-slate-400">
                                {cheer.createdAt ? new Date(cheer.createdAt).toLocaleDateString('pt-BR') : 'Publicado'}
                              </span>

                              {isConfirmingDelete ? (
                                <div className="flex items-center gap-1.5 bg-red-950/90 border border-red-500/60 px-2 py-1 rounded-xl">
                                  <span className="text-[10px] text-red-200 font-bold">Excluir?</span>
                                  <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={() => handleDeleteCheerExecute(cheer.id)}
                                    className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold cursor-pointer transition-colors shadow"
                                  >
                                    {isDeleting ? '...' : 'Sim, excluir'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteCheerId(null)}
                                    className="px-2 py-0.5 bg-white/10 hover:bg-white/20 text-slate-300 rounded text-[10px] font-semibold cursor-pointer transition-colors"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditCheer(cheer)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#d4af37]/20 text-slate-300 hover:text-[#f3e5ab] border border-white/10 hover:border-[#d4af37]/40 text-xs font-semibold transition-all cursor-pointer"
                                    title="Editar recado"
                                  >
                                    <Edit3 className="w-3 h-3 text-[#d4af37]" />
                                    <span>Editar</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteCheerId(cheer.id)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 text-xs font-semibold transition-all cursor-pointer"
                                    title="Excluir recado permanentemente"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Excluir</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB: COMUNICAÇÃO POR E-MAIL AOS PAIS E RESPONSÁVEIS
             ========================================================================= */}
          {activeTab === 'emails' && (
            <div className="space-y-6">
              {/* Notice Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0a192f] to-[#122847] border border-[#1e3a5f] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[#d4af37]" />
                    <h4 className="text-sm font-bold text-white">Central de Informativos & Disparo aos Pais</h4>
                  </div>
                  <p className="text-xs text-slate-300">
                    Dispare comunicados oficiais para os <strong className="text-[#f3e5ab]">{getAllParentEmails().length} e-mails de responsáveis</strong> cadastrados.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenGmailWeb()}
                    className="px-3.5 py-2 rounded-xl bg-red-600/20 text-red-300 border border-red-500/40 text-xs font-bold hover:bg-red-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                    title="Abrir tela de envio no Gmail com todos os pais em Cópia Oculta (BCC)"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Abrir no Gmail Web</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenMailClient()}
                    className="px-3.5 py-2 rounded-xl bg-white/10 text-white border border-white/15 text-xs font-bold hover:bg-white/20 transition-all cursor-pointer flex items-center gap-1.5"
                    title="Abrir no Outlook, Thunderbird ou aplicativo de e-mail do sistema"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Cliente Padrão (Mailto)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Compose Broadcast */}
                <div className="lg:col-span-6 p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#d4af37]" />
                    Redigir Comunicado Oficial
                  </h4>

                  <form onSubmit={handleSendBroadcast} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Destinatários *</label>
                        <select
                          value={broadcastRecipientMode}
                          onChange={(e) => setBroadcastRecipientMode(e.target.value as 'all' | 'specific')}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                        >
                          <option value="all">Todos os Pais ({getAllParentEmails().length} cadastrados)</option>
                          <option value="specific">Responsável Específico</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Tipo de Comunicado</label>
                        <select
                          value={broadcastType}
                          onChange={(e) => setBroadcastType(e.target.value as any)}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                        >
                          <option value="boletim_geral">Boletim Geral / Circular</option>
                          <option value="convocacao_competicao">Convocação de Competição</option>
                          <option value="aviso_treino">Aviso de Treino / Piscina</option>
                          <option value="documentacao_atestado">Documentação & Atestados</option>
                          <option value="financeiro_mensalidade">Financeiro / Informes</option>
                        </select>
                      </div>
                    </div>

                    {broadcastRecipientMode === 'specific' && (
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Selecione o Atleta / Pai *</label>
                        <select
                          value={broadcastSpecificAthleteId}
                          onChange={(e) => setBroadcastSpecificAthleteId(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                        >
                          {athletes.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name} • Resp: {a.guardianName} ({a.guardianEmail || 'Sem e-mail'})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Assunto do E-mail *</label>
                        <input
                          type="text"
                          required
                          value={broadcastSubject}
                          onChange={(e) => setBroadcastSubject(e.target.value)}
                          placeholder="Ex: Convocação para o Circuito Paulista 2026"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Nome do Remetente</label>
                        <input
                          type="text"
                          value={broadcastSender}
                          onChange={(e) => setBroadcastSender(e.target.value)}
                          placeholder="Ex: Coordenação Técnica ACEDEP"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Conteúdo da Mensagem *</label>
                      <textarea
                        required
                        rows={4}
                        value={broadcastBody}
                        onChange={(e) => setBroadcastBody(e.target.value)}
                        placeholder="Escreva as instruções para os pais, horários de saída do ônibus, itens para levar..."
                        className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] resize-none"
                      />
                    </div>

                    {broadcastSuccess && (
                      <p className="text-xs text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{broadcastSuccess}</span>
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={isSendingBroadcast}
                        className="px-5 py-2.5 rounded-xl bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                      >
                        {isSendingBroadcast ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                        <span>{isSendingBroadcast ? 'Gravando...' : 'Gravar no Histórico'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenGmailWeb(broadcastSubject, broadcastBody)}
                        className="px-4 py-2.5 rounded-xl bg-red-600/20 text-red-300 border border-red-500/30 text-xs font-bold hover:bg-red-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Abrir no Gmail</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right: History of Sent / Logged Emails */}
                <div className="lg:col-span-6 p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <History className="w-4 h-4 text-[#d4af37]" />
                        <span>Histórico de E-mails ({emailLogs.length})</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">Registros gravados no Firestore</p>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                    {emailLogs.length === 0 ? (
                      <div className="p-8 rounded-xl bg-black/30 border border-white/5 text-center text-xs text-slate-400">
                        Nenhum comunicado enviado ainda.
                      </div>
                    ) : (
                      emailLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs hover:border-white/10 transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-bold text-white text-sm block">{log.title}</span>
                              <p className="text-[10px] text-slate-400">
                                Para: {log.recipientSummary} • Por: {log.senderName}
                              </p>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold shrink-0">
                              {log.status || 'Registrado'}
                            </span>
                          </div>

                          <p className="text-slate-300 text-xs bg-white/5 p-2 rounded-lg leading-relaxed">
                            {log.contentPreview}
                          </p>

                          <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                            <span>{new Date(log.sentAt).toLocaleString('pt-BR')}</span>
                            <button
                              type="button"
                              onClick={() => handleOpenGmailWeb(log.title, log.contentPreview)}
                              className="text-[#d4af37] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Mail className="w-3 h-3" />
                              <span>Reenviar via Gmail</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB: SEGURANÇA E ALTERAÇÃO DE SENHA DO ADMIN
             ========================================================================= */}
          {activeTab === 'seguranca' && (
            <div className="space-y-6">
              <form 
                onSubmit={handleUpdatePinSubmit}
                className="p-6 rounded-2xl bg-[#0a192f]/80 border border-[#1e3a5f] space-y-4 max-w-lg"
              >
                <div className="flex items-center gap-3 border-b border-[#1e3a5f] pb-3">
                  <div className="p-2 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Alterar Senha do Administrador
                    </h4>
                    <p className="text-xs text-slate-400">
                      Defina uma senha pessoal e exclusiva para gerenciar todo o painel ACEDEP.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Nova Senha *
                    </label>
                    <input
                      type="password"
                      required
                      value={newPinInput}
                      onChange={(e) => {
                        setNewPinInput(e.target.value);
                        setPinFormError('');
                      }}
                      placeholder="Mínimo de 4 caracteres"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Confirmar Nova Senha *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPinInput}
                      onChange={(e) => {
                        setConfirmPinInput(e.target.value);
                        setPinFormError('');
                      }}
                      placeholder="Repita a nova senha"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                {pinFormError && (
                  <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{pinFormError}</span>
                  </div>
                )}

                {pinSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{pinSuccess}</span>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingPin || !newPinInput.trim() || !confirmPinInput.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] transition-all shadow cursor-pointer disabled:opacity-40"
                  >
                    {isSavingPin ? 'Atualizando Senha...' : 'Atualizar Senha de Administrador'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
        </>
        )}

        {/* Modal for Editing Athlete */}
        {editingAthlete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-[#0c1f38] border border-[#d4af37]/60 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#1e3a5f] pb-3">
                <h5 className="font-bold text-white text-sm font-serif flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#d4af37]" />
                  <span>Editar Atleta • {editingAthlete.name}</span>
                </h5>
                <button 
                  onClick={() => setEditingAthlete(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditedAthlete} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Nome Completo do Atleta *</label>
                    <input
                      type="text"
                      required
                      value={editingAthlete.name}
                      onChange={(e) => setEditingAthlete({ ...editingAthlete, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Data de Nascimento</label>
                    <input
                      type="text"
                      value={editingAthlete.birthDate || ''}
                      onChange={(e) => setEditingAthlete({ ...editingAthlete, birthDate: e.target.value })}
                      placeholder="DD/MM/AAAA"
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Categoria / Condição do Atleta</label>
                    <select
                      value={editingAthlete.disabilityCategory || 'Deficiente Intelectual'}
                      onChange={(e) => {
                        const cat = e.target.value as DisabilityCategory;
                        const dynamicClass = cat === 'Síndrome de Down' 
                          ? 'S14 / S21 - Síndrome de Down' 
                          : cat === 'Autista' 
                          ? 'S14 - Autismo / TEA' 
                          : 'S14 / SB14 / SM14 - Deficiência Intelectual';

                        setEditingAthlete({ 
                          ...editingAthlete, 
                          disabilityCategory: cat,
                          paralympicClass: dynamicClass 
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value="Deficiente Intelectual">🧠 Deficiente Intelectual (Classe S14)</option>
                      <option value="Autista">🧩 Autista / TEA (Classe S14)</option>
                      <option value="Síndrome de Down">💛 Síndrome de Down (Classe S14 / S21 - T21)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Nº de Registro CBDI / CPB</label>
                    <input
                      type="text"
                      value={editingAthlete.cbdiRegistration || ''}
                      onChange={(e) => setEditingAthlete({ ...editingAthlete, cbdiRegistration: e.target.value })}
                      placeholder="Ex: CBDI-SP-4491"
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">URL da Foto de Perfil</label>
                  <input
                    type="text"
                    value={editingAthlete.photoUrl || ''}
                    onChange={(e) => setEditingAthlete({ ...editingAthlete, photoUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Nome do Responsável *</label>
                    <input
                      type="text"
                      required
                      value={editingAthlete.guardianName}
                      onChange={(e) => setEditingAthlete({ ...editingAthlete, guardianName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">WhatsApp / Telefone</label>
                    <input
                      type="text"
                      value={editingAthlete.guardianPhone || ''}
                      onChange={(e) => setEditingAthlete({ ...editingAthlete, guardianPhone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">E-mail do Responsável *</label>
                    <input
                      type="email"
                      required
                      value={editingAthlete.guardianEmail || ''}
                      onChange={(e) => setEditingAthlete({ ...editingAthlete, guardianEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="text-[#d4af37] block mb-1 font-bold">Senha de Acesso (PIN) *</label>
                    <input
                      type="text"
                      required
                      value={editingAthlete.accessCode}
                      onChange={(e) => setEditingAthlete({ ...editingAthlete, accessCode: e.target.value })}
                      className="w-full px-3 py-2 font-mono font-bold rounded-lg bg-black/50 border border-[#d4af37]/60 text-[#f3e5ab] focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                {/* Training Details for Athlete Edit */}
                <div className="p-3 rounded-xl bg-black/40 border border-[#1e3a5f] space-y-3">
                  <span className="text-[11px] font-bold text-[#f3e5ab] block border-b border-white/5 pb-1">
                    🏊 Treinos, Horários & Professor Responsável
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-slate-300 block mb-1 text-[10px] font-semibold">Dias de Treino</label>
                      <input
                        type="text"
                        value={Array.isArray(editingAthlete.trainingSchedule?.days) ? editingAthlete.trainingSchedule.days.join(', ') : (editingAthlete.trainingSchedule?.days || '')}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingAthlete({
                            ...editingAthlete,
                            trainingSchedule: {
                              ...editingAthlete.trainingSchedule,
                              days: val.split(',').map((s) => s.trim()),
                              pool: editingAthlete.trainingSchedule?.pool || 'Piscina Olímpica 50m - CPB',
                              time: editingAthlete.trainingSchedule?.time || '14:00 às 15:30',
                              coachName: editingAthlete.trainingSchedule?.coachName || 'Prof. Leonardo Ramos',
                              lane: editingAthlete.trainingSchedule?.lane || 'Raia 3 - Rendimento S14',
                            }
                          });
                        }}
                        placeholder="Ex: Segunda, Quarta, Sexta"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1 text-[10px] font-semibold">Horário do Treino</label>
                      <input
                        type="text"
                        value={editingAthlete.trainingSchedule?.time || ''}
                        onChange={(e) => {
                          setEditingAthlete({
                            ...editingAthlete,
                            trainingSchedule: {
                              ...editingAthlete.trainingSchedule,
                              days: editingAthlete.trainingSchedule?.days || ['Segunda', 'Quarta', 'Sexta'],
                              pool: editingAthlete.trainingSchedule?.pool || 'Piscina Olímpica 50m - CPB',
                              time: e.target.value,
                              coachName: editingAthlete.trainingSchedule?.coachName || 'Prof. Leonardo Ramos',
                              lane: editingAthlete.trainingSchedule?.lane || 'Raia 3 - Rendimento S14',
                            }
                          });
                        }}
                        placeholder="Ex: 14:00 às 15:30"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1 text-[10px] font-semibold">Professor(a) Responsável</label>
                      <input
                        type="text"
                        value={editingAthlete.trainingSchedule?.coachName || ''}
                        onChange={(e) => {
                          setEditingAthlete({
                            ...editingAthlete,
                            trainingSchedule: {
                              ...editingAthlete.trainingSchedule,
                              days: editingAthlete.trainingSchedule?.days || ['Segunda', 'Quarta', 'Sexta'],
                              pool: editingAthlete.trainingSchedule?.pool || 'Piscina Olímpica 50m - CPB',
                              time: editingAthlete.trainingSchedule?.time || '14:00 às 15:30',
                              coachName: e.target.value,
                              lane: editingAthlete.trainingSchedule?.lane || 'Raia 3 - Rendimento S14',
                            }
                          });
                        }}
                        placeholder="Ex: Prof. Leonardo Ramos"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1 text-[10px] font-semibold">Raia & Nível</label>
                      <input
                        type="text"
                        value={editingAthlete.trainingSchedule?.lane || ''}
                        onChange={(e) => {
                          setEditingAthlete({
                            ...editingAthlete,
                            trainingSchedule: {
                              ...editingAthlete.trainingSchedule,
                              days: editingAthlete.trainingSchedule?.days || ['Segunda', 'Quarta', 'Sexta'],
                              pool: editingAthlete.trainingSchedule?.pool || 'Piscina Olímpica 50m - CPB',
                              time: editingAthlete.trainingSchedule?.time || '14:00 às 15:30',
                              coachName: editingAthlete.trainingSchedule?.coachName || 'Prof. Leonardo Ramos',
                              lane: e.target.value,
                            }
                          });
                        }}
                        placeholder="Ex: Raia 3 - Rendimento S14"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setEditingAthlete(null)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEditAthlete}
                    className="px-4 py-1.5 rounded-lg bg-[#d4af37] text-[#060e1c] font-bold hover:bg-[#b8952b] cursor-pointer disabled:opacity-50"
                  >
                    {isSavingEditAthlete ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal for Editing Community Cheer */}
        {editingCheer && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-[#0c1f38] border border-[#d4af37]/60 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#1e3a5f] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <h5 className="font-bold text-white text-sm font-serif">Editar Recado do Mural da Família</h5>
                </div>
                <button 
                  onClick={() => setEditingCheer(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditCheer} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Nome do Autor *</label>
                  <input
                    type="text"
                    required
                    value={editCheerAuthor}
                    onChange={(e) => setEditCheerAuthor(e.target.value)}
                    placeholder="Ex: Mariana Silva"
                    className="w-full px-3 py-2.5 rounded-lg bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Vínculo com a ACEDEP / Atleta</label>
                  <input
                    type="text"
                    value={editCheerRelation}
                    onChange={(e) => setEditCheerRelation(e.target.value)}
                    placeholder="Ex: Mãe do atleta Lucas (S14), Padrinho, Amigo..."
                    className="w-full px-3 py-2.5 rounded-lg bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Mensagem de Incentivo *</label>
                  <textarea
                    required
                    rows={4}
                    value={editCheerMsg}
                    onChange={(e) => setEditCheerMsg(e.target.value)}
                    placeholder="Texto do recado..."
                    className="w-full px-3 py-2.5 rounded-lg bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37] resize-none"
                  />
                </div>

                {cheerAdminError && (
                  <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{cheerAdminError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e3a5f]/60">
                  <button
                    type="button"
                    onClick={() => setEditingCheer(null)}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingCheer}
                    className="px-5 py-2 rounded-lg bg-[#d4af37] text-[#060e1c] font-bold hover:bg-[#b8952b] cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSavingCheer ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Salvar Alterações</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL DE DOCUMENTOS & LAUDOS DO ATLETA (ADMIN/TÉCNICO)
           ========================================================================= */}
        {selectedAthleteForDocs && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#060e1c] border border-[#1e3a5f] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
              
              {/* Modal Header */}
              <div className="p-5 bg-[#0a192f] border-b border-[#1e3a5f] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#d4af37]/60 bg-black/40 shrink-0">
                    <img 
                      src={selectedAthleteForDocs.photoUrl || AVATAR_PRESETS[0].url} 
                      alt={selectedAthleteForDocs.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
                      <span>Documentação & Laudos: {selectedAthleteForDocs.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f3e5ab] text-[10px] font-sans font-bold uppercase">
                        Acesso Técnico / Adm
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300">
                      Responsável: <span className="text-white font-medium">{selectedAthleteForDocs.guardianName}</span> ({selectedAthleteForDocs.guardianEmail || 'Sem e-mail'})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAthleteForDocs(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                {(() => {
                  const currentSyncedAthlete = athletes.find((a) => a.id === selectedAthleteForDocs.id) || selectedAthleteForDocs;
                  return (
                    <AthleteDocumentsTab 
                      athlete={currentSyncedAthlete} 
                      isStaff={true} 
                      uploaderName="Comissão Técnica ACEDEP" 
                    />
                  );
                })()}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-[#0a192f]/80 border-t border-[#1e3a5f] flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  Ambiente seguro em conformidade com as diretrizes do CPB / ACEDEP
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedAthleteForDocs(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all cursor-pointer"
                >
                  Fechar Janela
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Global Export Report Modal */}
        <ExportReportModal
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          athletes={athletes}
          attendanceSessions={attendanceSessions}
          initialReportType={exportModalInitialType}
          initialAthleteId={exportModalAthleteId}
        />

      </div>
    </div>
  );
};
