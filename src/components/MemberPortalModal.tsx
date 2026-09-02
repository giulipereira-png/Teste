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
    <div id="member-portal-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="member-portal-modal-container"
        className="relative w-full max-w-4xl max-h-[92vh] bg-[#0c1f38] border border-[#1e3a5f] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e3a5f] bg-[#071326]/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
                <span>Portal do Responsável & Atleta</span>
                <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f3e5ab] text-[10px] font-mono font-bold">
                  Natação Paralímpica S14
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isGuardianAuthenticated && currentAthlete
                  ? `Atleta: ${currentAthlete.name} • Responsável: ${currentAthlete.guardianName || 'Família'}`
                  : 'Área restrita e individual para acompanhamento do atleta da ACEDEP'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isGuardianAuthenticated && currentAthlete && (
              <button
                type="button"
                onClick={() => setExportModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#d4af37]/20 hover:bg-[#d4af37]/35 text-[#f3e5ab] border border-[#d4af37]/40 text-xs font-semibold transition-colors cursor-pointer"
                title="Baixar Relatório em PDF ou Word"
              >
                <FileDown className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="hidden sm:inline">Baixar Relatório</span>
              </button>
            )}

            {isGuardianAuthenticated && (
              <button
                id="btn-guardian-logout"
                onClick={guardianLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer"
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
        <div className="overflow-y-auto p-6 sm:p-8 flex-1">
          
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
              <div className="flex flex-wrap sm:flex-nowrap gap-1.5 p-1.5 bg-black/40 rounded-2xl border border-[#1e3a5f]">
                <button
                  id="tab-btn-treinos"
                  onClick={() => setActiveTab('treinos')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'senha'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span className="hidden sm:inline">Senha</span>
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
