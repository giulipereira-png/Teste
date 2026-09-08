import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Timer, 
  FileText, 
  MessageSquare, 
  LogOut, 
  Waves, 
  KeyRound,
  Mail,
  FileDown
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { AthleteDocumentsTab } from './AthleteDocumentsTab';
import { ExportReportModal } from './ExportReportModal';

// Subcomponents extracted for modularity and maintainability
import { MemberPortalLogin } from './member-portal/MemberPortalLogin';
import { MemberPortalHeader } from './member-portal/MemberPortalHeader';
import { MemberTrainingTab } from './member-portal/MemberTrainingTab';
import { MemberMetricsTab } from './member-portal/MemberMetricsTab';
import { MemberMessagesTab } from './member-portal/MemberMessagesTab';
import { MemberNotificationsTab } from './member-portal/MemberNotificationsTab';
import { MemberSecurityTab } from './member-portal/MemberSecurityTab';
import { MemberPhotoModal, AVATAR_PRESETS } from './member-portal/MemberPhotoModal';

interface MemberPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MemberPortalModal: React.FC<MemberPortalModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentAthlete, 
    isGuardianAuthenticated, 
    guardianLogout,
    saveAthleteRecord,
    emailLogs,
    attendanceSessions,
  } = useCommunity();

  // Active Dashboard Tab
  const [activeTab, setActiveTab] = useState<'treinos' | 'tempos' | 'documentos' | 'mensagens' | 'emails' | 'senha'>('treinos');

  // Photo modal state
  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  // Export report modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleSavePhoto = async (newPhotoUrl: string) => {
    if (!currentAthlete) return;
    await saveAthleteRecord({
      ...currentAthlete,
      photoUrl: newPhotoUrl,
    });
  };

  return (
    <div id="member-portal-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="member-portal-modal-container"
        className="relative w-full max-w-4xl h-[100dvh] sm:h-auto sm:max-h-[92vh] bg-[#0c1f38] border-0 sm:border border-[#1e3a5f] rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-[#1e3a5f] bg-[#071326]/90 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] shrink-0">
              <Waves className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white font-serif flex items-center gap-2 truncate">
                <span className="truncate">Portal do Responsável</span>
                <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f3e5ab] text-[10px] font-mono font-bold shrink-0">
                  S14
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                {isGuardianAuthenticated && currentAthlete
                  ? `Atleta: ${currentAthlete.name}`
                  : 'Área restrita e individual para acompanhamento do atleta'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {isGuardianAuthenticated && currentAthlete && (
              <button
                type="button"
                onClick={() => setExportModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#d4af37]/20 hover:bg-[#d4af37]/35 text-[#f3e5ab] border border-[#d4af37]/40 text-xs font-semibold transition-colors cursor-pointer"
                title="Baixar Relatório em PDF"
              >
                <FileDown className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="hidden sm:inline">Relatório</span>
              </button>
            )}

            {isGuardianAuthenticated && (
              <button
                id="btn-guardian-logout"
                onClick={guardianLogout}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer"
                title="Sair da Conta do Responsável"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            )}

            <button
              id="btn-close-member-portal"
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Fechar Portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-8 flex-1 touch-scroll overscroll-y-contain pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          
          {!isGuardianAuthenticated || !currentAthlete ? (
            /* LOGIN SCREEN */
            <MemberPortalLogin />
          ) : (
            /* LOGGED IN DASHBOARD */
            <div className="space-y-6">
              
              {/* ATHLETE IDENTITY HEADER CARD */}
              <MemberPortalHeader
                athlete={currentAthlete}
                onOpenPhotoModal={() => setPhotoModalOpen(true)}
                onOpenExportModal={() => setExportModalOpen(true)}
                defaultAvatarUrl={AVATAR_PRESETS[0].url}
              />

              {/* NAVIGATION TABS */}
              <div className="flex items-center gap-1.5 p-1.5 bg-black/40 rounded-2xl border border-[#1e3a5f] overflow-x-auto no-scrollbar scroll-smooth touch-pan-x">
                <button
                  id="tab-btn-treinos"
                  onClick={() => setActiveTab('treinos')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                    activeTab === 'treinos'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Treinos</span>
                </button>

                <button
                  id="tab-btn-tempos"
                  onClick={() => setActiveTab('tempos')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                    activeTab === 'tempos'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Timer className="w-4 h-4" />
                  <span>Tempos (RP)</span>
                </button>

                <button
                  id="tab-btn-documentos"
                  onClick={() => setActiveTab('documentos')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                    activeTab === 'documentos'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Documentos & Laudos</span>
                </button>

                <button
                  id="tab-btn-mensagens"
                  onClick={() => setActiveTab('mensagens')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                    activeTab === 'mensagens'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Recados</span>
                </button>

                <button
                  id="tab-btn-emails"
                  onClick={() => setActiveTab('emails')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                    activeTab === 'emails'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>E-mails Recebidos</span>
                </button>

                <button
                  id="tab-btn-senha"
                  onClick={() => setActiveTab('senha')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                    activeTab === 'senha'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Senha</span>
                </button>
              </div>

              {/* TAB 1: TREINOS & PRESENÇA */}
              {activeTab === 'treinos' && (
                <MemberTrainingTab athlete={currentAthlete} />
              )}

              {/* TAB 2: EVOLUÇÃO & TEMPOS (RP) */}
              {activeTab === 'tempos' && (
                <MemberMetricsTab athlete={currentAthlete} />
              )}

              {/* TAB 3: ATESTADOS, LAUDOS, RG & EXAMES MÉDICOS (UPLOAD & DOWNLOAD) */}
              {activeTab === 'documentos' && (
                <AthleteDocumentsTab 
                  athlete={currentAthlete} 
                  isStaff={false} 
                  uploaderName={currentAthlete.guardianName || 'Responsável'} 
                />
              )}

              {/* TAB 4: RECADOS DA COMISSÃO TÉCNICA */}
              {activeTab === 'mensagens' && (
                <MemberMessagesTab athlete={currentAthlete} />
              )}

              {/* TAB 5: E-MAILS RECEBIDOS & INFORMATIVOS */}
              {activeTab === 'emails' && (
                <MemberNotificationsTab 
                  athlete={currentAthlete} 
                  emailLogs={emailLogs} 
                />
              )}

              {/* TAB 6: MINHA SENHA */}
              {activeTab === 'senha' && (
                <MemberSecurityTab athlete={currentAthlete} />
              )}

            </div>
          )}

        </div>

        {/* Edit Photo Submodal */}
        {currentAthlete && (
          <MemberPhotoModal
            isOpen={photoModalOpen}
            onClose={() => setPhotoModalOpen(false)}
            athlete={currentAthlete}
            onSavePhoto={handleSavePhoto}
          />
        )}

        {/* Export Report Submodal */}
        {currentAthlete && (
          <ExportReportModal
            isOpen={exportModalOpen}
            onClose={() => setExportModalOpen(false)}
            athletes={[currentAthlete]}
            attendanceSessions={attendanceSessions}
            fixedAthlete={currentAthlete}
            isMemberPortal={true}
          />
        )}

      </div>
    </div>
  );
};
