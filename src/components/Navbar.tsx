import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { 
  Menu, 
  X, 
  HeartHandshake, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronRight, 
  ShieldCheck, 
  Lock, 
  UserCheck,
  Compass
} from 'lucide-react';
import { usePhotos } from '../context/PhotosContext';
import { useCommunity } from '../context/CommunityContext';

interface NavbarProps {
  currentPage?: string;
  onNavigateToPage: (page: 'home' | 'sobre' | 'equipe' | 'calendario' | 'galeria' | 'faq' | 'comunidade') => void;
  onOpenSupportModal: () => void;
  onOpenContactModal: () => void;
  onOpenMemberPortal: () => void;
  onOpenCalendarModal?: () => void;
  onOpenTeamModal?: () => void;
  onOpenGalleryModal?: () => void;
  onOpenCommunityModal?: () => void;
  onOpenFaqModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage = 'home',
  onNavigateToPage,
  onOpenSupportModal,
  onOpenContactModal,
  onOpenMemberPortal,
}) => {
  const { openAdminModal, isAdminAuthenticated } = usePhotos();
  const { isGuardianAuthenticated, currentAthlete } = useCommunity();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      if (currentPage === 'home') {
        const sections = ['home', 'modalidades', 'galeria-preview', 'explorar', 'contato'];
        const scrollPosition = window.scrollY + 200;

        for (const section of sections) {
          const el = document.getElementById(section);
          if (el) {
            const top = el.offsetTop;
            const height = el.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
              setActiveSection(section);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage]);

  const handleNavClick = (pageId: 'home' | 'sobre' | 'equipe' | 'calendario' | 'galeria' | 'faq' | 'comunidade', hash?: string) => {
    setMobileMenuOpen(false);
    onNavigateToPage(pageId);
    if (pageId === 'home' && hash) {
      setTimeout(() => {
        const el = document.getElementById(hash.replace('#', ''));
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // Primary navigation items for clean layout
  const navLinks: Array<{ name: string; page: 'home' | 'sobre' | 'equipe' | 'calendario' | 'galeria' | 'faq' | 'comunidade'; hash?: string }> = [
    { name: 'Início', page: 'home', hash: '#home' },
    { name: 'Sobre Nós', page: 'sobre' },
    { name: 'Nossa Equipe', page: 'equipe' },
    { name: 'Calendário 2026', page: 'calendario' },
    { name: 'Galeria', page: 'galeria' },
    { name: 'Comunidade', page: 'comunidade' },
    { name: 'FAQ', page: 'faq' },
  ];

  // Quick jump sub-sections on Home
  const homeQuickSections = [
    { label: 'Modalidades & Horários', hash: '#modalidades' },
    { label: 'Contato & Local', hash: '#contato' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Top Institutional Bar */}
      <div className={`bg-[#060e1c] border-b border-slate-800/80 text-xs text-slate-300 transition-all duration-300 ${
        isScrolled ? 'hidden md:hidden' : 'block'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5 text-[#d4af37] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Instituição Fundada em 1990
            </span>
            <span className="hidden sm:inline-block text-slate-500">•</span>
            <span className="hidden sm:flex items-center gap-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
              Polo: Centro Paralímpico Brasileiro (São Paulo - SP)
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <a 
              href="mailto:giuli.pereira@gmail.com" 
              className="hidden md:flex items-center gap-1 text-slate-300 hover:text-[#d4af37] transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#d4af37]" />
              giuli.pereira@gmail.com
            </a>
            <a 
              href="tel:11998809708"
              className="flex items-center gap-1 text-slate-300 hover:text-[#d4af37] transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
              (11) 99880-9708
            </a>

            {/* Admin shortcut visible on desktop & mobile top bar */}
            <button
              onClick={openAdminModal}
              id="btn-admin-login-topbar"
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                isAdminAuthenticated
                  ? 'bg-amber-400/20 text-[#f3e5ab] border border-amber-400/50 hover:bg-amber-400/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
              }`}
              title={isAdminAuthenticated ? 'Painel de Administração Ativo' : 'Entrar no Painel Administrativo'}
            >
              <Lock className={`w-3 h-3 ${isAdminAuthenticated ? 'text-[#d4af37]' : 'text-slate-400'}`} />
              <span>{isAdminAuthenticated ? 'Admin (Conectado)' : 'Admin'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav
        className={`transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0a192f]/95 backdrop-blur-md shadow-xl shadow-black/30 border-b border-[#1e3a5f]/80 py-3'
            : 'bg-gradient-to-b from-[#0a192f]/95 to-[#0a192f]/80 backdrop-blur-sm border-b border-white/5 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand / Logo Link */}
          <button
            type="button"
            onClick={() => handleNavClick('home', '#home')}
            id="nav-logo-link"
            className="flex items-center gap-2 group transition-transform duration-200 hover:scale-[1.02] cursor-pointer text-left shrink-0"
            title="ACEDEP Paradesporto"
          >
            <Logo variant="horizontal" className="h-11 md:h-13" />
          </button>

          {/* Desktop Nav Items (Streamlined 6 items) */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((link) => {
              const isCurrent = (currentPage === link.page && (!link.hash || activeSection === link.hash.replace('#', '')));

              return (
                <button
                  key={link.name}
                  type="button"
                  onClick={() => handleNavClick(link.page, link.hash)}
                  id={`nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`px-3 py-2 text-xs xl:text-sm font-semibold tracking-wide rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    isCurrent
                      ? 'text-[#d4af37] bg-white/10 shadow-inner font-bold'
                      : 'text-slate-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </div>

          {/* Action Button & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Portal do Responsável Button */}
            <button
              id="btn-portal-responsavel-nav"
              onClick={onOpenMemberPortal}
              className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                isGuardianAuthenticated
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30 shadow-md'
                  : 'bg-[#0f284a] hover:bg-[#163866] text-[#f3e5ab] border-[#1e3a5f] hover:border-[#d4af37]'
              }`}
              title={isGuardianAuthenticated ? `Portal: ${currentAthlete?.name}` : 'Acesso Individual do Responsável'}
            >
              <UserCheck className={`w-4 h-4 ${isGuardianAuthenticated ? 'text-emerald-400' : 'text-[#d4af37]'}`} />
              <span className="hidden sm:inline">
                {isGuardianAuthenticated ? `Portal (${currentAthlete?.name?.split(' ')[0]})` : 'Portal do Responsável'}
              </span>
              <span className="sm:hidden">
                {isGuardianAuthenticated ? 'Portal' : 'Responsável'}
              </span>
            </button>

            {/* Seja um Apoiador Button */}
            <button
              id="btn-seja-apoiador-nav"
              onClick={onOpenSupportModal}
              className="relative group overflow-hidden rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e5c058] to-[#c49e29] px-3.5 sm:px-4.5 py-2 text-xs sm:text-sm font-bold text-[#060e1c] shadow-lg shadow-[#d4af37]/20 hover:shadow-[#d4af37]/40 transition-all duration-200 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <HeartHandshake className="w-4 h-4 text-[#060e1c] group-hover:scale-110 transition-transform duration-200" />
              <span className="hidden sm:inline">Seja um Apoiador</span>
              <span className="sm:hidden">Apoiar</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#d4af37] cursor-pointer"
              aria-label="Abrir menu principal"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div 
          id="mobile-drawer-menu"
          className="lg:hidden bg-[#060e1c]/98 border-b border-[#1e3a5f] backdrop-blur-xl px-4 pt-3 pb-6 shadow-2xl transition-all animate-fadeIn max-h-[85vh] overflow-y-auto"
        >
          <div className="space-y-3">
            {/* Primary Navigation Links */}
            <div className="py-1 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 pb-1 block">
                Navegação Principal
              </span>
              {navLinks.map((link) => {
                const isCurrent = (currentPage === link.page && (!link.hash || activeSection === link.hash.replace('#', '')));

                return (
                  <button
                    key={link.name}
                    type="button"
                    onClick={() => handleNavClick(link.page, link.hash)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left ${
                      isCurrent
                        ? 'text-[#d4af37] bg-white/10 font-bold'
                        : 'text-slate-200 hover:text-[#d4af37] hover:bg-white/5'
                    }`}
                  >
                    <span>{link.name}</span>
                    <ChevronRight className="w-4 h-4 text-[#d4af37]" />
                  </button>
                );
              })}
            </div>

            {/* Home Sections Quick Access */}
            <div className="pt-2 border-t border-white/5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#d4af37] px-3 pb-1.5 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Seções da Home</span>
              </span>
              <div className="grid grid-cols-1 gap-1 px-1">
                {homeQuickSections.map((sec) => (
                  <button
                    key={sec.label}
                    type="button"
                    onClick={() => handleNavClick('home', sec.hash)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-[#f3e5ab] hover:bg-white/5 flex items-center justify-between"
                  >
                    <span>{sec.label}</span>
                    <span className="text-[10px] text-slate-400">Ir para seção ↓</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-white/10 space-y-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenMemberPortal();
                }}
                className="w-full py-3 bg-[#0f284a] border border-[#1e3a5f] text-[#f3e5ab] font-bold rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-[#d4af37]" />
                <span>{isGuardianAuthenticated ? `Ver Portal de ${currentAthlete?.name}` : 'Acessar Portal do Responsável'}</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSupportModal();
                }}
                className="w-full py-3 bg-[#d4af37] text-[#060e1c] font-bold rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <HeartHandshake className="w-4 h-4" />
                Seja um Apoiador / Patrocinador
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenContactModal();
                }}
                className="w-full py-2.5 border border-slate-700 hover:border-[#d4af37] text-slate-300 hover:text-[#d4af37] font-semibold text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                Fale Conosco / Avaliação
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAdminModal();
                }}
                className="w-full py-2 bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-[#d4af37] text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isAdminAuthenticated ? 'Painel de Gestão (Admin Conectado)' : 'Acesso de Gestão / Admin (PIN)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
