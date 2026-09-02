import React from 'react';
import { Camera, Users, ChevronRight, ShieldCheck, MapPin } from 'lucide-react';
import { Logo } from './Logo';
import { usePhotos } from '../context/PhotosContext';

interface TeamPhotoBannerProps {
  onNavigateToAbout: () => void;
}

export const TeamPhotoBanner: React.FC<TeamPhotoBannerProps> = ({ onNavigateToAbout }) => {
  const { photos, openAdminModal, isAdminAuthenticated } = usePhotos();

  const teamPhotoUrl = photos['about_team'] || '/IMG_4378.jpeg';
  const fallbacks = [
    '/IMG_4378.jpeg',
    '/IMG_4378.jpg',
    'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1200&q=85'
  ];

  return (
    <section className="py-8 sm:py-10 bg-[#060e1c] text-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#1e3a5f]/80 shadow-2xl bg-[#08172c] group">
          
          {/* Main Photo Container */}
          <div className="relative h-[280px] sm:h-[380px] md:h-[440px] w-full overflow-hidden">
            <img
              src={teamPhotoUrl}
              alt="Equipe ACEDEP no Centro Paralímpico Brasileiro"
              className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const currentSrc = target.getAttribute('src') || '';
                const currentIndex = fallbacks.findIndex((c) => currentSrc.endsWith(c));
                if (currentIndex !== -1 && currentIndex + 1 < fallbacks.length) {
                  target.src = fallbacks[currentIndex + 1];
                }
              }}
              referrerPolicy="no-referrer"
            />
            
            {/* Elegant Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#060e1c] via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#060e1c]/80 via-transparent to-transparent hidden md:block" />

            {/* Top Left Institution Badge */}
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-[#060e1c]/90 border border-[#d4af37]/50 backdrop-blur-md flex items-center gap-2 shadow-lg z-10">
              <Logo variant="emblem" className="h-6" />
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-[#d4af37]">Equipe Oficial</div>
                <div className="text-[11px] font-bold text-white leading-tight">ACEDEP • Desde 1990</div>
              </div>
            </div>

            {/* Top Right Admin Edit Button */}
            {isAdminAuthenticated && (
              <button
                onClick={() => openAdminModal()}
                className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-lg bg-[#d4af37] hover:bg-[#b8952b] text-[#060e1c] text-xs font-bold shadow-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                title="Alterar esta foto no Painel Administrativo"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Gerenciar Foto</span>
              </button>
            )}

            {/* Bottom Content & Navigation CTA */}
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Centro Paralímpico Brasileiro • São Paulo - SP</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-snug drop-shadow-md">
                  Nossa Equipe de Natação Paralímpica
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-light mt-1 line-clamp-2 drop-shadow">
                  Nadadores, educadores e comissão técnica reunidos nas raias do CPB promovendo saúde, inclusão e alto rendimento.
                </p>
              </div>

              <button
                type="button"
                onClick={onNavigateToAbout}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#b8952b] text-[#060e1c] text-xs sm:text-sm font-bold shadow-lg hover:shadow-[#d4af37]/20 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              >
                <span>Saiba mais</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
