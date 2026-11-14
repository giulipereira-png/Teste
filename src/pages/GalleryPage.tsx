import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  Images, 
  Sparkles, 
  ShieldCheck, 
  Camera, 
  Calendar,
  Lock,
  HeartHandshake
} from 'lucide-react';
import { PhotoGallery } from '../components/PhotoGallery';
import { usePhotos } from '../context/PhotosContext';
import { SubpageTopBar } from '../components/SubpageTopBar';

interface GalleryPageProps {
  onBackToHome: () => void;
  onOpenSupportModal: () => void;
  onNavigateToPage?: (page: string) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ 
  onBackToHome, 
  onOpenSupportModal,
  onNavigateToPage 
}) => {
  const { galleryPhotos, isAdminAuthenticated, openAdminModal } = usePhotos();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-[#060e1c] text-slate-100 selection:bg-[#d4af37] selection:text-[#060e1c] subpage-top-offset pb-28 md:pb-20">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <SubpageTopBar currentLabel="Galeria de Fotos Oficial" onBackToHome={onBackToHome} />

        {/* Clean, Non-Bloated Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
                <Images className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Galeria de Fotos & Conquistas
              </h1>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 font-normal">
              Acervo de treinos no Centro Paralímpico, torneios nacionais, pódios e eventos da ACEDEP ({galleryPhotos.length} fotos).
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {isAdminAuthenticated && (
              <button
                type="button"
                onClick={openAdminModal}
                className="px-3.5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#b8952b] text-[#060e1c] text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Upload de Fotos</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenSupportModal}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 text-xs font-semibold border border-white/10 transition-all cursor-pointer"
            >
              Apoiar Atletas
            </button>
          </div>
        </div>
      </div>

      {/* Main Gallery Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PhotoGallery />

        {/* Bottom Banner */}
        <div className="mt-12 sm:mt-16 p-6 sm:p-8 rounded-3xl bg-[#0a192f] border border-[#1e3a5f] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <h4 className="text-lg font-bold text-white font-serif">
              Conheça os nadadores e a comissão técnica da ACEDEP
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Veja o perfil dos 35 atletas da natação S14/S21 e a equipe de técnicos e voluntários.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
            {onNavigateToPage && (
              <button
                onClick={() => onNavigateToPage('equipe')}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#0f284a] hover:bg-[#d4af37] text-[#f3e5ab] hover:text-[#060e1c] border border-[#d4af37]/40 text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
              >
                Conhecer a Equipe
              </button>
            )}

            <button
              onClick={onBackToHome}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </main>

    </div>
  );
};
