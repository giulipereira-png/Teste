import React, { useState } from 'react';
import { Lock, User, KeyRound, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';

interface MemberPortalLoginProps {
  onSuccess?: () => void;
}

export const MemberPortalLogin: React.FC<MemberPortalLoginProps> = ({ onSuccess }) => {
  const { guardianLogin } = useCommunity();
  const [identifierInput, setIdentifierInput] = useState('');
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    const res = await guardianLogin(identifierInput, accessCodeInput);
    setIsLoggingIn(false);

    if (!res.success) {
      setLoginError(res.message || 'Dados de acesso incorretos.');
    } else {
      setIdentifierInput('');
      setAccessCodeInput('');
      onSuccess?.();
    }
  };

  return (
    <div id="member-portal-login-box" className="max-w-md mx-auto space-y-6 py-4">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] shadow-lg">
          <Lock className="w-7 h-7" />
        </div>
        <h4 className="text-xl font-bold text-white font-serif">
          Acesso Individual do Responsável
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          Digite o e-mail cadastrado ou nome do atleta e a senha de acesso individual.
        </p>
      </div>

      <form onSubmit={handleLoginSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            E-mail do Responsável ou Nome do Atleta
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-guardian-identifier"
              type="text"
              required
              value={identifierInput}
              onChange={(e) => {
                setIdentifierInput(e.target.value);
                setLoginError('');
              }}
              placeholder="Ex: mariana.pereira@exemplo.com ou Lucas"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-[#1e3a5f] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Senha de Acesso do Responsável
          </label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-guardian-passcode"
              type="password"
              required
              value={accessCodeInput}
              onChange={(e) => {
                setAccessCodeInput(e.target.value);
                setLoginError('');
              }}
              placeholder="Digite sua senha individual"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-[#1e3a5f] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>

        {loginError && (
          <p className="text-xs text-red-400 flex items-center gap-1.5 justify-center">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{loginError}</span>
          </p>
        )}

        <button
          id="btn-guardian-login-submit"
          type="submit"
          disabled={isLoggingIn}
          className="w-full py-3 rounded-xl bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoggingIn ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Validando Acesso...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Entrar no Portal do Filho(a)</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
