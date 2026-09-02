import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  Waves, 
  UserCheck, 
  Camera, 
  Upload, 
  Check, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { TEAM_MEMBERS } from '../data/mockData';
import { useCommunity } from '../context/CommunityContext';
import { usePhotos } from '../context/PhotosContext';

export const AthletesShowcase: React.FC = () => {
  const { setCoachManagerModalOpen } = useCommunity();
  const { getPhotoUrl, isAdminAuthenticated, savePhotoToDatabase } = usePhotos();
  const [uploadingStaffId, setUploadingStaffId] = useState<string | null>(null);
  const [successStaffId, setSuccessStaffId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePhotoKey, setActivePhotoKey] = useState<string>('staff_enio');

  const staffPhotoKeys = ['staff_enio', 'staff_giuliana', 'staff_tatiana'];

  const handleStaffPhotoUpload = (staffKey: string) => {
    setActivePhotoKey(staffKey);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingStaffId(activePhotoKey);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const ok = await savePhotoToDatabase(activePhotoKey, dataUrl);
        setUploadingStaffId(null);
        if (ok) {
          setSuccessStaffId(activePhotoKey);
          setTimeout(() => setSuccessStaffId(null), 3000);
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <section id="equipe" className="py-20 bg-[#060e1c] text-slate-100 relative border-t border-[#1e3a5f]/60">
      {/* Hidden file input for quick photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-3">
            <span className="h-[2px] w-6 bg-[#d4af37]" />
            Nossa Equipe
            <span className="h-[2px] w-6 bg-[#d4af37]" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Atletas e Comissão Técnica da ACEDEP
          </h2>
          <p className="mt-4 text-base text-slate-200 leading-relaxed font-medium">
            Atualmente contamos com 35 atletas, divididos em atletas em desenvolvimento e atletas de alto rendimento.
          </p>
          <p className="mt-2 text-sm text-slate-400 font-light">
            A equipe técnica é formada por 3 profissionais especializados em natação paradesportiva:
          </p>
        </div>

        {/* Technical Team (3 Professionals) Grid with Compact Photos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 max-w-5xl mx-auto">
          {TEAM_MEMBERS.map((member, i) => {
            const photoKey = staffPhotoKeys[i] || 'staff_enio';
            const photoUrl = getPhotoUrl(photoKey) || member.image;
            const isUploading = uploadingStaffId === photoKey;
            const isSuccess = successStaffId === photoKey;

            return (
              <div
                key={i}
                className="rounded-2xl bg-[#0a192f]/90 border border-white/10 p-5 flex flex-col justify-between hover:border-[#d4af37]/60 transition-all duration-300 shadow-lg relative group"
              >
                <div>
                  {/* Top Row: Compact Photo + Role & Name */}
                  <div className="flex items-center gap-4 mb-3.5">
                    {/* Compact Avatar / Photo */}
                    <div className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-[#d4af37]/40 shadow bg-slate-900">
                      <img
                        src={photoUrl}
                        alt={member.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />

                      {/* Admin Quick Upload Badge */}
                      {isAdminAuthenticated && (
                        <button
                          type="button"
                          onClick={() => handleStaffPhotoUpload(photoKey)}
                          disabled={isUploading}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                          title="Trocar Foto"
                        >
                          {isUploading ? (
                            <RefreshCw className="w-4 h-4 text-[#d4af37] animate-spin" />
                          ) : (
                            <Camera className="w-4 h-4 text-[#d4af37]" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Name & Role Header */}
                    <div className="min-w-0 flex-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#f3e5ab] text-[10px] font-bold mb-1">
                        {i === 0 ? <ShieldCheck className="w-3 h-3 text-[#d4af37]" /> : i === 1 ? <Waves className="w-3 h-3 text-[#d4af37]" /> : <UserCheck className="w-3 h-3 text-[#d4af37]" />}
                        {member.role}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                        {member.name}
                      </h3>
                      {isAdminAuthenticated && (
                        <button
                          onClick={() => handleStaffPhotoUpload(photoKey)}
                          className="text-[10px] text-[#d4af37] hover:underline flex items-center gap-1 mt-0.5 cursor-pointer"
                        >
                          <Camera className="w-2.5 h-2.5" />
                          <span>{isSuccess ? 'Foto Atualizada!' : 'Trocar foto'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Credentials pill */}
                  <div className="text-[11px] text-[#f3e5ab] font-mono bg-black/40 px-2.5 py-1 rounded-lg mb-2.5 border border-[#d4af37]/20 flex items-center justify-between">
                    <span className="truncate">{member.credentials}</span>
                    <span className="text-[9px] text-slate-400 font-sans shrink-0 ml-1">Oficial ACEDEP</span>
                  </div>

                  {/* Experience description */}
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {member.experience}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Board / Comitê de Pais da ACEDEP */}
        <div className="max-w-6xl mx-auto rounded-2xl bg-gradient-to-r from-[#0f2744] via-[#132f52] to-[#0f2744] border border-[#d4af37]/50 p-6 sm:p-8 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f3e5ab] text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                Pais e Família
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Diretoria formada pelos Pais dos Atletas
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                A ACEDEP conta com uma <strong>diretoria formada pelos próprios pais dos atletas</strong>. Todos trabalham de forma voluntária e com muita união para apoiar o dia a dia da equipe, ajudar nos treinos e incentivar o desenvolvimento dos nossos filhos.
              </p>
            </div>
            <div className="lg:col-span-4 bg-black/40 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#d4af37] font-serif">Desde 1990</div>
              <div className="text-xs font-semibold text-white mt-1">União e Trabalho em Família</div>
              <div className="text-[11px] text-slate-300 mt-1">Juntos em cada conquista nas piscinas</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};


