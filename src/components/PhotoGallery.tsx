import React, { useState } from 'react';
import { 
  Images, 
  Eye, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  PlusCircle, 
  Calendar, 
  Sparkles,
  Lock,
  Tag
} from 'lucide-react';
import { usePhotos, GalleryPhotoItem } from '../context/PhotosContext';

export const PhotoGallery: React.FC = () => {
  const { galleryPhotos, isAdminAuthenticated, openAdminModal } = usePhotos();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Extract unique categories
  const categories = ['Todas', ...Array.from(new Set(galleryPhotos.map((p) => p.category).filter(Boolean)))];

  const filteredPhotos = selectedCategory === 'Todas' 
    ? galleryPhotos 
    : galleryPhotos.filter((p) => p.category === selectedCategory);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length);
    }
  };

  return (
    <section id="galeria" className="py-20 bg-[#0a192f] text-slate-100 relative border-t border-[#1e3a5f]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-3">
              <span className="h-[2px] w-6 bg-[#d4af37]" />
              Momentos & Conquistas
              <span className="h-[2px] w-6 bg-[#d4af37]" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Galeria de Fotos da ACEDEP
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Registros dos nossos treinos, campeonatos, superações e da união entre atletas, familiares e comissão técnica.
            </p>
          </div>

          {/* Admin button ONLY visible if already logged into admin session */}
          {isAdminAuthenticated && (
            <div className="flex items-center gap-3">
              <button
                onClick={openAdminModal}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0f2744] hover:bg-[#132f52] border border-[#d4af37]/50 text-[#f3e5ab] text-xs font-bold transition-all shadow-md cursor-pointer hover:border-[#d4af37]"
              >
                <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Gerenciar Fotos</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter Categories */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8 items-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#d4af37] text-[#060e1c] font-bold shadow-md shadow-[#d4af37]/20 scale-105'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Photos Grid */}
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-16 bg-[#0f2744]/40 border border-dashed border-white/10 rounded-2xl p-8">
            <Images className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-sm text-slate-300 font-medium">Nenhuma foto cadastrada nesta categoria.</p>
            <p className="text-xs text-slate-500 mt-1">Use o painel de fotos para adicionar novos registros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo, idx) => (
              <div
                key={photo.id}
                onClick={() => openLightbox(idx)}
                className="group relative rounded-2xl overflow-hidden bg-[#0f2744] border border-white/10 hover:border-[#d4af37]/60 shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              >
                {/* Image Box */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/50">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/IMG_4378.jpeg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060e1c]/90 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-bold text-[#f3e5ab] flex items-center gap-1.5 shadow-sm">
                    <Tag className="w-2.5 h-2.5 text-[#d4af37]" />
                    <span>{photo.category}</span>
                  </div>

                  {/* Hover Eye Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="p-3 rounded-full bg-[#d4af37] text-[#060e1c] shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      <Eye className="w-5 h-5" />
                    </span>
                  </div>
                </div>

                {/* Caption Details */}
                <div className="p-4 bg-[#0f2744]/90 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#f3e5ab] transition-colors line-clamp-1">
                      {photo.title}
                    </h3>
                    {photo.date && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <Calendar className="w-3 h-3 text-[#d4af37]" />
                        <span>{photo.date}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-[#d4af37] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver foto →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        {lightboxIndex !== null && filteredPhotos[lightboxIndex] && (
          <div
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-50"
              title="Fechar (Esc)"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev Button */}
            {filteredPhotos.length > 1 && (
              <button
                onClick={prevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-[#d4af37] hover:text-[#060e1c] text-white transition-colors cursor-pointer z-50 hidden sm:flex items-center justify-center shadow-lg"
                title="Foto anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next Button */}
            {filteredPhotos.length > 1 && (
              <button
                onClick={nextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-[#d4af37] hover:text-[#060e1c] text-white transition-colors cursor-pointer z-50 hidden sm:flex items-center justify-center shadow-lg"
                title="Próxima foto"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Modal Image Content */}
            <div
              className="max-w-5xl w-full max-h-[90vh] flex flex-col rounded-2xl overflow-hidden bg-[#0a192f] border border-[#d4af37]/40 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Active Image */}
              <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden max-h-[70vh]">
                <img
                  src={filteredPhotos[lightboxIndex].url}
                  alt={filteredPhotos[lightboxIndex].title}
                  className="max-h-[70vh] w-full object-contain"
                />
              </div>

              {/* Bottom Details */}
              <div className="p-4 sm:p-5 bg-[#0f2744] flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#d4af37]/20 text-[#f3e5ab] border border-[#d4af37]/30">
                      {filteredPhotos[lightboxIndex].category}
                    </span>
                    {filteredPhotos[lightboxIndex].date && (
                      <span className="text-xs text-slate-400">
                        • {filteredPhotos[lightboxIndex].date}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white">
                    {filteredPhotos[lightboxIndex].title}
                  </h4>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>
                    Foto {lightboxIndex + 1} de {filteredPhotos.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
