import React, { useState } from 'react';
import { KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AthleteRecord } from '../../types';
import { useCommunity } from '../../context/CommunityContext';

interface MemberSecurityTabProps {
  athlete: AthleteRecord;
}

export const MemberSecurityTab: React.FC<MemberSecurityTabProps> = ({ athlete }) => {
  const { updateAthleteAccessCode } = useCommunity();
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState('');
  const [pinChangeError, setPinChangeError] = useState('');
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);

  const handleChangePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeError('');
    setPinChangeSuccess('');

    if (newPin.trim().length < 4) {
      setPinChangeError('A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }

    if (newPin.trim() !== confirmNewPin.trim()) {
      setPinChangeError('A confirmação não confere com a nova senha digitada.');
      return;
    }

    setIsUpdatingPin(true);
    const success = await updateAthleteAccessCode(athlete.id, newPin.trim());
    setIsUpdatingPin(false);

    if (success) {
      setPinChangeSuccess('Sua nova senha de acesso foi atualizada com sucesso!');
      setNewPin('');
      setConfirmNewPin('');
      setTimeout(() => setPinChangeSuccess(''), 5000);
    } else {
      setPinChangeError('Não foi possível atualizar a senha. Tente novamente.');
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleChangePinSubmit}
        className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4 max-w-lg"
      >
        <h4 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
          <KeyRound className="w-4 h-4" />
          Alterar Senha do Responsável
        </h4>
        <p className="text-xs text-slate-300">
          Personalize sua senha de acesso para que apenas você consulte as informações do seu filho(a).
        </p>

        <div className="space-y-3 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Nova Senha *</label>
            <input
              type="password"
              required
              value={newPin}
              onChange={(e) => {
                setNewPin(e.target.value);
                setPinChangeError('');
              }}
              placeholder="Mínimo 4 caracteres"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Confirmar Nova Senha *</label>
            <input
              type="password"
              required
              value={confirmNewPin}
              onChange={(e) => {
                setConfirmNewPin(e.target.value);
                setPinChangeError('');
              }}
              placeholder="Repita a nova senha"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>

        {pinChangeError && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            <span>{pinChangeError}</span>
          </p>
        )}

        {pinChangeSuccess && (
          <p className="text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>{pinChangeSuccess}</span>
          </p>
        )}

        <button
          type="submit"
          disabled={isUpdatingPin}
          className="px-5 py-2.5 rounded-xl bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] transition-all cursor-pointer disabled:opacity-50"
        >
          {isUpdatingPin ? 'Salvando...' : 'Salvar Nova Senha'}
        </button>
      </form>
    </div>
  );
};
