import React, { useState } from 'react';
import { 
  Images, 
  Eye, 
  ChevronRight, 
  Tag, 
  Calendar, 
  Sparkles,
  ExternalLink,
  X,
  ChevronLeft
} from 'lucide-react';
import { usePhotos } from '../context/PhotosContext';

interface CompactPhotoGalleryProps {
  onOpenFullGalleryPage: () => void;
}

export const CompactPhotoGallery: React.FC<CompactPhotoGalleryProps> = ({ onOpenFullGalleryPage }) => {
  const { galleryPhotos } = usePhotos();
  const [previewPhotoIndex, setPreviewPhotoIndex] = useState<number | null>(null);

  // Take top 4-6 photos for a clean, non-intrusive preview
  const previewPhotos = galleryPhotos.slice(0, 6);

  const activePhoto = previewPhotoIndex !== null ? previewPhotos[previewPhotoIndex] : null;

  return (
    <section id="galeria-preview" className="py-10 bg-[#071326] text-slate-100 relative border-t border-[#1e3a5f]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Compact Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] shadow-inner">
              <Images className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-white font-serif tracking-tight">
                  Galeria de Fotos
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f3e5ab] text-[10px] font-bold border border-[#d4af37]/30 flex items-center gap-1 font-mono">
                  <Sparkles className="w-2.5 h-2.5 text-[#d4af37]" />
                  {galleryPhotos.length} fotos
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Prévia dos treinos no Centro Paralímpico, pódios e conquistas da ACEDEP
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenFullGalleryPage}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f2744] hover:bg-[#d4af37] border border-[#d4af37]/40 hover:border-[#d4af37] text-[#f3e5ab] hover:text-[#060e1c] text-xs font-bold transition-all shadow-md cursor-pointer self-start sm:self-auto group"
          >
            <span>Ver Galeria Completa</span>
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Compact Grid of Thumbnails (Responsive 2 cols on mobile, 3 on tablet, 6 on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {previewPhotos.map((photo, idx) => (
            <div
              key={photo.id}
              onClick={() => setPreviewPhotoIndex(idx)}
              className="group relative rounded-xl overflow-hidden bg-[#0a192f] border border-white/10 hover:border-[#d4af37] shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer aspect-[4/3] flex flex-col justify-end"
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/IMG_4378.jpeg';
                }}
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-75 group-hover:opacity-95 transition-opacity" />

              {/* Tag pill */}
              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm border border-white/10 text-[9px] font-bold text-[#f3e5ab] truncate max-w-[90%]">
                {photo.category}
              </div>

              {/* Caption */}
              <div className="relative p-2 z-10">
                <p className="text-[11px] font-bold text-white group-hover:text-[#f3e5ab] transition-colors truncate">
                  {photo.title}
                </p>
                {photo.date && (
                  <p className="text-[9px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                    <Calendar className="w-2.5 h-2.5 text-[#d4af37]" />
                    <span>{photo.date}</span>
                  </p>
                )}
              </div>

              {/* Quick eye icon on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <span className="p-2 rounded-full bg-[#d4af37] text-[#060e1c] shadow">
                  <Eye className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Mini Lightbox Modal for Compact Preview */}
      {activePhoto && previewPhotoIndex !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setPreviewPhotoIndex(null)}
        >
          <div 
            className="relative max-w-3xl w-full bg-[#08172c] border border-[#1e3a5f] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 bg-[#060e1c] border-b border-[#1e3a5f] flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white font-serif">{activePhoto.title}</h4>
                <p className="text-[11px] text-slate-400">{activePhoto.category} • {activePhoto.date}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setPreviewPhotoIndex(null);
                    onOpenFullGalleryPage();
                  }}
                  className="px-3 py-1 rounded-xl bg-[#d4af37] text-[#060e1c] text-xs font-bold hover:bg-[#b8952b] transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>Abrir Galeria Completa</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                <button
                  onClick={() => setPreviewPhotoIndex(null)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image Preview */}
            <div className="relative aspect-[16/10] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={activePhoto.url}
                alt={activePhoto.title}
                className="max-h-[60vh] w-full object-contain"
              />

              {/* Navigation arrows */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewPhotoIndex((previewPhotoIndex - 1 + previewPhotos.length) % previewPhotos.length);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-[#d4af37] text-white hover:text-black transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewPhotoIndex((previewPhotoIndex + 1) % previewPhotos.length);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-[#d4af37] text-white hover:text-black transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Description footer */}
            {activePhoto.description && (
              <div className="p-3 bg-[#060e1c]/80 text-xs text-slate-300 border-t border-white/5">
                {activePhoto.description}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
