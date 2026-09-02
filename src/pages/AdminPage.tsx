import React, { useEffect } from 'react';
import { ShieldCheck, Lock, ArrowLeft, Waves } from 'lucide-react';
import { usePhotos } from '../context/PhotosContext';
import { Logo } from '../components/Logo';

interface AdminPageProps {
  onBackToHome?: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToHome }) => {
  const { openAdminModal, isAdminAuthenticated, currentAdminProfile } = usePhotos();

  useEffect(() => {
    // Open admin portal modal immediately on page load
    openAdminModal();
  }, [openAdminModal]);

  const handleBack = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-[#060e1c] text-white flex flex-col justify-between p-4 sm:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <Logo className="h-10 w-auto" />
          <div>
            <h1 className="text-base sm:text-lg font-bold font-serif text-[#f3e5ab]">
              ACEDEP Natação Paralímpica
            </h1>
            <p className="text-xs text-slate-400">Portal de Gestão & Comissão Técnica</p>
          </div>
        </div>

        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-white/10 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Site</span>
        </button>
      </div>

      {/* Center Action Box */}
      <div className="max-w-md mx-auto w-full my-12 p-6 sm:p-8 rounded-3xl bg-[#0c1f38] border border-[#d4af37]/30 shadow-2xl text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] mx-auto shadow-lg">
          {isAdminAuthenticated ? <Waves className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
        </div>

        <div>
          <h2 className="text-xl font-bold font-serif text-white">
            {isAdminAuthenticated ? 'Painel Administrativo Ativo' : 'Acesso Restrito da Equipe'}
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {isAdminAuthenticated 
              ? `Conectado como: ${currentAdminProfile?.name || 'Administrador ACEDEP'}`
              : 'Área exclusiva para diretoria, professores e comissão técnica da ACEDEP.'}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={() => openAdminModal()}
            className="w-full py-3.5 px-4 rounded-xl bg-[#d4af37] hover:bg-[#b8952b] text-[#060e1c] font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isAdminAuthenticated ? 'Abrir Painel Completo' : 'Digitar PIN / Senha de Acesso'}</span>
          </button>

          <button
            onClick={handleBack}
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-white/10 cursor-pointer"
          >
            Navegar no Site Público
          </button>
        </div>
      </div>

      {/* Footer info */}
      <div className="max-w-6xl mx-auto w-full text-center text-[11px] text-slate-500 border-t border-white/5 pt-4">
        ACEDEP • Associação Cultural e Esportiva de Deficientes Paulistas | Centro Paralímpico Brasileiro
      </div>
    </div>
  );
};