import React from 'react';
import { Award, Camera, FileDown } from 'lucide-react';
import { AthleteRecord } from '../../types';

interface MemberPortalHeaderProps {
  athlete: AthleteRecord;
  onOpenPhotoModal: () => void;
  onOpenExportModal?: () => void;
  defaultAvatarUrl: string;
}

export const MemberPortalHeader: React.FC<MemberPortalHeaderProps> = ({
  athlete,
  onOpenPhotoModal,
  onOpenExportModal,
  defaultAvatarUrl,
}) => {
  return (
    <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0a192f] via-[#0e2442] to-[#0a192f] border border-[#1e3a5f] shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
      <div className="relative group shrink-0">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#d4af37] shadow-lg bg-black/40">
          <img
            src={athlete.photoUrl || defaultAvatarUrl}
            alt={athlete.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <button
          id="btn-edit-athlete-photo"
          onClick={onOpenPhotoModal}
          className="absolute -bottom-2 -right-2 px-2 py-1 rounded-lg bg-[#d4af37] text-[#060e1c] text-[10px] font-bold shadow-md hover:bg-[#b8952b] transition-all flex items-center gap-1 cursor-pointer"
          title="Alterar Foto de Perfil"
        >
          <Camera className="w-3 h-3" />
          <span>Foto</span>
        </button>
      </div>

      <div className="space-y-2 flex-1 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <span className="px-3 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f3e5ab] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#d4af37]" />
            {athlete.paralympicClass}
          </span>
          {athlete.disabilityCategory && (
            <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1">
              <span>{athlete.disabilityCategory === 'Autista' ? '🧩' : athlete.disabilityCategory === 'Síndrome de Down' ? '💛' : '🧠'}</span>
              <span>{athlete.disabilityCategory}</span>
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            Atleta Ativo • ACEDEP
          </span>

          {onOpenExportModal && (
            <button
              type="button"
              onClick={onOpenExportModal}
              className="ml-auto px-3 py-1 rounded-xl bg-[#d4af37]/20 hover:bg-[#d4af37]/35 border border-[#d4af37]/40 text-[#f3e5ab] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Baixar Ficha e Relatórios em PDF ou Word"
            >
              <FileDown className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Baixar Relatório (PDF / Word)</span>
            </button>
          )}
        </div>

        <h3 className="text-2xl font-bold text-white font-serif">
          {athlete.name}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
          <div className="p-2 rounded-xl bg-black/30 border border-white/5">
            <span className="text-[10px] text-slate-400 block">Matrícula Clube</span>
            <span className="font-mono text-slate-200 font-bold">{athlete.clubRegistration}</span>
          </div>
          <div className="p-2 rounded-xl bg-black/30 border border-white/5">
            <span className="text-[10px] text-slate-400 block">Registro CBDI/CPB</span>
            <span className="font-mono text-slate-200 font-bold">{athlete.cbdiRegistration || 'Homologado'}</span>
          </div>
          <div className="p-2 rounded-xl bg-black/30 border border-white/5">
            <span className="text-[10px] text-slate-400 block">Idade / Nasc.</span>
            <span className="text-slate-200 font-bold">{athlete.birthDate}</span>
          </div>
          <div className="p-2 rounded-xl bg-black/30 border border-white/5">
            <span className="text-[10px] text-slate-400 block">Presença Treinos</span>
            <span className="text-emerald-400 font-bold">{athlete.attendanceRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
