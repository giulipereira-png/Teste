import React from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Facebook, 
  ShieldCheck,
  ChevronUp,
  Lock,
  UserPlus
} from 'lucide-react';
import { Logo } from './Logo';
import { usePhotos } from '../context/PhotosContext';
import { useCommunity } from '../context/CommunityContext';

interface FooterProps {
  onOpenSupportModal: () => void;
  onOpenContactModal: () => void;
  onOpenMemberPortal?: () => void;
  onNavigateToPage?: (page: 'home' | 'sobre' | 'equipe' | 'calendario' | 'galeria' | 'faq' | 'comunidade', hash?: string) => void;
  onOpenCalendarModal?: () => void;
  onOpenTeamModal?: () => void;
  onOpenGalleryModal?: () => void;
  onOpenCommunityModal?: () => void;
  onOpenFaqModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenSupportModal,
  onOpenContactModal,
  onOpenMemberPortal,
  onNavigateToPage,
  onOpenCalendarModal,
  onOpenTeamModal,
  onOpenGalleryModal,
  onOpenCommunityModal,
  onOpenFaqModal,
}) => {
  const { openAdminModal, isAdminAuthenticated } = usePhotos();
  const { setCoachManagerModalOpen } = useCommunity();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkClick = (page: 'home' | 'sobre' | 'equipe' | 'calendario' | 'galeria' | 'faq' | 'comunidade', hash?: string) => {
    if (onNavigateToPage) {
      onNavigateToPage(page, hash);
      if (page === 'home' && hash) {
        setTimeout(() => {
          const el = document.getElementById(hash.replace('#', ''));
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  };

  return (
    <footer id="contato" className="bg-[#060e1c] text-slate-300 border-t border-slate-800">
      
      {/* Upper Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Col 1: Institutional Identity */}
          <div className="lg:col-span-4 space-y-4">
            <Logo variant="horizontal" className="h-12" showTagline={true} />
            
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pt-2">
              A <strong>ACEDEP</strong> (Associação Cultural Especial Paradesportiva Paulista), fundada em 1990, é dedicada à natação para pessoas com deficiência intelectual, promovendo inclusão, saúde e desenvolvimento humano pelo esporte.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-[#d4af37]">
              <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
              <span>Entidade Paradesportiva Registrada • Desde 1990</span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://www.instagram.com/acedepnatacao"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da ACEDEP (@acedepnatacao)"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-[#d4af37] hover:text-[#060e1c] text-slate-200 transition-colors border border-white/10 text-xs font-medium"
              >
                <Instagram className="w-4 h-4 text-[#d4af37] group-hover:text-[#060e1c]" />
                <span>@acedepnatacao</span>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook da ACEDEP"
                className="p-2.5 rounded-lg bg-white/5 hover:bg-[#d4af37] hover:text-[#060e1c] text-slate-300 transition-colors border border-white/10"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Navigation */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-serif">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => handleLinkClick('home', '#home')} 
                  className="text-slate-300 hover:text-[#d4af37] transition-colors block py-0.5 cursor-pointer text-left"
                >
                  Home (Início)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('sobre')} 
                  className="text-slate-300 hover:text-[#d4af37] transition-colors block py-0.5 cursor-pointer text-left"
                >
                  Sobre Nós (História)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('home', '#modalidades')} 
                  className="text-slate-300 hover:text-[#d4af37] transition-colors block py-0.5 cursor-pointer text-left"
                >
                  Modalidades & Horários
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('calendario')}
                  className="text-slate-300 hover:text-[#d4af37] transition-colors block py-0.5 cursor-pointer text-left flex items-center gap-1"
                >
                  <span>Calendário 2026</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('equipe')}
                  className="text-slate-300 hover:text-[#d4af37] transition-colors block py-0.5 cursor-pointer text-left"
                >
                  Nossa Equipe & Atletas
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('galeria')}
                  className="text-slate-300 hover:text-[#d4af37] transition-colors block py-0.5 cursor-pointer text-left"
                >
                  Galeria de Fotos
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('comunidade')}
                  className="text-[#f3e5ab] hover:text-[#d4af37] font-semibold transition-colors block py-0.5 cursor-pointer text-left"
                >
                  Mural & Comunidade
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('faq')}
                  className="text-[#d4af37] hover:underline font-semibold transition-colors block py-0.5 cursor-pointer text-left"
                >
                  Dúvidas Frequentes (FAQ)
                </button>
              </li>
              {onOpenMemberPortal && (
                <li>
                  <button 
                    onClick={onOpenMemberPortal}
                    className="text-[#d4af37] hover:underline font-bold block py-0.5 cursor-pointer text-left"
                  >
                    Portal do Responsável
                  </button>
                </li>
              )}
              <li>
                <button 
                  onClick={onOpenSupportModal}
                  className="text-slate-300 hover:text-[#d4af37] hover:underline block py-0.5 cursor-pointer text-left"
                >
                  Seja um Apoiador
                </button>
              </li>
              <li>
                <button 
                  onClick={openAdminModal}
                  className="text-slate-500 hover:text-[#d4af37] transition-colors block py-0.5 cursor-pointer text-left flex items-center gap-1.5 text-xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Acesso Administrativo (Painel)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Polo de Treinamento em SP */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-serif">
              Polo de Treinamento
            </h4>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-lg bg-white/5 border border-white/5 space-y-1.5">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                  <span>Centro Paralímpico Brasileiro</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Rod. dos Imigrantes, km 11,5 - Vila Guarani, São Paulo - SP
                </p>
                <div className="text-[10px] text-[#d4af37] font-semibold">
                  Iniciação Esportiva & Alto Rendimento
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: Contato & Atendimento */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-serif">
              Canais Oficiais
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-slate-400 text-[11px]">E-mail Oficial:</span>
                  <a 
                    href="mailto:giuli.pereira@gmail.com" 
                    className="text-white hover:text-[#d4af37] transition-colors font-medium"
                  >
                    giuli.pereira@gmail.com
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-slate-400 text-[11px]">Telefone / WhatsApp:</span>
                  <a 
                    href="tel:11998809708"
                    className="text-white hover:text-[#d4af37] transition-colors font-medium text-left"
                  >
                    (11) 99880-9708
                  </a>
                </div>
              </li>

              <li className="pt-2">
                <button
                  onClick={onOpenContactModal}
                  className="w-full py-2 px-3 rounded bg-white/5 hover:bg-white/10 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Enviar Mensagem Direta</span>
                </button>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Copyright & Legal Info */}
      <div className="bg-[#030712] border-t border-slate-900 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-1">
            <p>
              <button
                type="button"
                onClick={openAdminModal}
                className="hover:text-[#d4af37] transition-colors cursor-pointer text-slate-400"
                title="ACEDEP"
              >
                ©
              </button>{' '}
              1990 - 2026 ACEDEP - Associação Cultural Especial Paradesportiva Paulista. Todos os direitos reservados.
            </p>
            <p className="text-[11px] text-slate-400">
              CNPJ: 12.579.030/0001-83 • Organização da Sociedade Civil sem Fins Lucrativos • São Paulo / SP
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openAdminModal}
              id="btn-footer-admin-login"
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 text-[11px] font-bold cursor-pointer ${
                isAdminAuthenticated
                  ? 'bg-[#d4af37]/20 text-[#f3e5ab] border border-[#d4af37]/40 hover:bg-[#d4af37]/30'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/10 hover:border-slate-700'
              }`}
              title="Painel de Administração"
            >
              <Lock className={`w-3 h-3 ${isAdminAuthenticated ? 'text-[#d4af37]' : 'text-slate-400'}`} />
              <span>{isAdminAuthenticated ? 'Admin Conectado' : 'Acesso Admin'}</span>
            </button>

            <button
              onClick={scrollToTop}
              className="p-2 rounded bg-white/5 hover:bg-[#d4af37] hover:text-[#060e1c] text-slate-300 transition-colors flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer"
              title="Voltar ao topo"
            >
              <span>Topo</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

    </footer>
  );
};
