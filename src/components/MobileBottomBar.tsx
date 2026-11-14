import React from 'react';
import { Home, ArrowLeft, Calendar, UserCheck, Menu, X } from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';

interface MobileBottomBarProps {
  currentPage: string;
  mobileMenuOpen: boolean;
  onNavigateHome: () => void;
  onNavigateCalendar: () => void;
  onOpenMemberPortal: () => void;
  onToggleMobileMenu: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  currentPage,
  mobileMenuOpen,
  onNavigateHome,
  onNavigateCalendar,
  onOpenMemberPortal,
  onToggleMobileMenu,
}) => {
  const { isGuardianAuthenticated } = useCommunity();
  const isSubpage = currentPage !== 'home';

  return (
    <nav
      aria-label="Navegação rápida para celular"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#060e1c]/95 backdrop-blur-xl border-t border-[#1e3a5f]/90 shadow-[0_-8px_24px_rgba(0,0,0,0.45)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-4 h-14 max-w-lg mx-auto">
        <button
          type="button"
          onClick={onNavigateHome}
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors cursor-pointer active:scale-95 ${
            isSubpage
              ? 'text-[#f3e5ab]'
              : !mobileMenuOpen
              ? 'text-[#d4af37]'
              : 'text-slate-300'
          }`}
          aria-label={isSubpage ? 'Voltar para o Início' : 'Ir para o Início'}
        >
          {isSubpage ? (
            <ArrowLeft className="w-5 h-5 text-[#d4af37]" />
          ) : (
            <Home className="w-5 h-5" />
          )}
          <span className="leading-none whitespace-nowrap">
            {isSubpage ? 'Voltar' : 'Início'}
          </span>
        </button>

        <button
          type="button"
          onClick={onNavigateCalendar}
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors cursor-pointer active:scale-95 ${
            currentPage === 'calendario' ? 'text-[#d4af37]' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="leading-none whitespace-nowrap">Agenda</span>
        </button>

        <button
          type="button"
          onClick={onOpenMemberPortal}
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors cursor-pointer active:scale-95 ${
            isGuardianAuthenticated ? 'text-emerald-300' : 'text-slate-300 hover:text-white'
          }`}
        >
          <UserCheck className={`w-5 h-5 ${isGuardianAuthenticated ? 'text-emerald-400' : ''}`} />
          <span className="leading-none whitespace-nowrap">Portal</span>
        </button>

        <button
          type="button"
          onClick={onToggleMobileMenu}
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors cursor-pointer active:scale-95 ${
            mobileMenuOpen ? 'text-[#d4af37]' : 'text-slate-300 hover:text-white'
          }`}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir todas as páginas'}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          <span className="leading-none whitespace-nowrap">Páginas</span>
        </button>
      </div>
    </nav>
  );
};
