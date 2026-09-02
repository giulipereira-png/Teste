import React, { useRef, useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { AthleteRecord } from '../../types';

export const AVATAR_PRESETS = [
  { id: 'p1', name: 'Atleta Masculino', url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=400&q=80' },
  { id: 'p2', name: 'Atleta Feminina', url: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=400&q=80' },
  { id: 'p3', name: 'Nadador Podium / Ouro', url: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?auto=format&fit=crop&w=400&q=80' },
  { id: 'p4', name: 'Nadadora Paralímpica', url: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?auto=format&fit=crop&w=400&q=80' },
  { id: 'p5', name: 'Jovem Promessa S14', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
];

interface MemberPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  athlete: AthleteRecord;
  onSavePhoto: (photoUrl: string) => Promise<void>;
}

export const MemberPhotoModal: React.FC<MemberPhotoModalProps> = ({
  isOpen,
  onClose,
  athlete,
  onSavePhoto,
}) => {
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState(athlete.photoUrl || AVATAR_PRESETS[0].url);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedPhotoUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = async () => {
    if (!selectedPhotoUrl) return;
    setIsSavingPhoto(true);
    try {
      await onSavePhoto(selectedPhotoUrl);
      onClose();
    } finally {
      setIsSavingPhoto(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0c1f38] border border-[#d4af37]/60 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="font-bold text-white text-sm font-serif flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#d4af37]" />
            <span>Escolher Foto de Perfil do Atleta</span>
          </h5>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 py-2">
          <img 
            src={selectedPhotoUrl || AVATAR_PRESETS[0].url} 
            alt="Preview" 
            className="w-24 h-24 rounded-2xl object-cover border-2 border-[#d4af37] shadow"
            referrerPolicy="no-referrer"
          />

          <div className="w-full space-y-2">
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="w-full py-2 rounded-xl bg-white/10 hover:bg-[#d4af37] text-white hover:text-[#060e1c] text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-white/10"
            >
              <Upload className="w-4 h-4" />
              <span>Carregar Foto do Celular / Computador</span>
            </button>
            <input
              type="file"
              ref={photoInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="w-full space-y-1.5">
            <span className="text-[11px] text-slate-400 block font-medium">Ou selecione um avatar:</span>
            <div className="flex items-center justify-center gap-2">
              {AVATAR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPhotoUrl(preset.url)}
                  className={`p-0.5 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedPhotoUrl === preset.url ? 'border-[#d4af37] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={preset.url} 
                    alt={preset.name} 
                    className="w-10 h-10 rounded-lg object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-white/10 text-white font-medium text-xs hover:bg-white/20 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSavingPhoto}
            className="px-4 py-1.5 rounded-lg bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] cursor-pointer disabled:opacity-50"
          >
            {isSavingPhoto ? 'Salvando...' : 'Confirmar Foto'}
          </button>
        </div>
      </div>
    </div>
  );
};
