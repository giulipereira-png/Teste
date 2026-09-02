import React, { useState, useEffect, useRef } from 'react';
import { Camera, Eye, ChevronRight, Pause, Play, Sparkles, ExternalLink } from 'lucide-react';
import { usePhotos } from '../context/PhotosContext';

interface MiniAutoPhotoCarouselProps {
  onOpenFullGallery?: () => void;
}

export const MiniAutoPhotoCarousel: React.FC<MiniAutoPhotoCarouselProps> = ({ onOpenFullGallery }) => {
  const { photos, galleryPhotos, isAdminAuthenticated, openAdminModal } = usePhotos();
  const [isPaused, setIsPaused] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Build the list of photos for the carousel
  const carouselItems = [
    {
      id: 'carousel_1',
      title: 'Equipe ACEDEP',
      url: photos['carousel_1'] || '/IMG_4378.jpeg',
      fallbacks: ['/IMG_4378.jpeg', 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=600&q=80'],
    },
    {
      id: 'carousel_2',
      title: 'Treinos Técnicos CPB',
      url: photos['carousel_2'] || 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=600&q=80',
      fallbacks: ['https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=600&q=80', '/IMG_4378.jpeg'],
    },
    {
      id: 'carousel_3',
      title: 'Premiações & Pódios',
      url: photos['carousel_3'] || 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=600&q=80',
      fallbacks: ['https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=600&q=80', '/IMG_4378.jpeg'],
    },
    {
      id: 'carousel_4',
      title: 'Piscina Olímpica 50m',
      url: photos['carousel_4'] || 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=600&q=80',
      fallbacks: ['https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=600&q=80', '/IMG_4378.jpeg'],
    },
    {
      id: 'carousel_5',
      title: 'Superação & Inclusão',
      url: photos['carousel_5'] || 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=600&q=80',
      fallbacks: ['https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=600&q=80', '/IMG_4378.jpeg'],
    },
    {
      id: 'carousel_6',
      title: 'Espírito Esportivo',
      url: photos['carousel_6'] || '/IMG_4378.jpeg',
      fallbacks: ['/IMG_4378.jpeg', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=600&q=80'],
    },
    // Append any extra dynamic gallery photos if available
    ...(galleryPhotos?.slice(0, 4).map((g) => ({
      id: g.id,
      title: g.title,
      url: g.url,
      fallbacks: ['/IMG_4378.jpeg', 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=600&q=80'],
    })) || []),
  ];

  // Auto-scroll loop
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const scrollSpeed = 0.45; // Pixels per frame (~30px/sec)

    const step = (now: number) => {
      const elapsed = now - lastTime;
      lastTime = now;

      if (!isPaused && container) {
        container.scrollLeft += (scrollSpeed * (elapsed / 16.67));
        
        // Reset scroll when reaching half-width (since we duplicated items for infinite effect)
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
      }

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPaused]);

  // Duplicate items array to make an endless seamless track
  const duplicatedList = [...carouselItems, ...carouselItems];

  return (
    <section className="py-8 bg-[#050c18] border-t border-b border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Nossa Galeria em Destaque
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">• Registros dos Treinos & Competições</span>
        </div>

        <div className="flex items-center gap-3">
          {isAdminAuthenticated && (
            <button
              onClick={() => openAdminModal()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#d4af37]/15 hover:bg-[#d4af37] text-[#d4af37] hover:text-[#060e1c] border border-[#d4af37]/40 text-[11px] font-bold transition-all cursor-pointer"
              title="Gerenciar e trocar fotos do carrossel no Painel"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Gerenciar Fotos</span>
            </button>
          )}

          {onOpenFullGallery && (
            <button
              onClick={onOpenFullGallery}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#d4af37] hover:text-[#f3e5ab] transition-colors cursor-pointer"
            >
              <span>Ver Galeria Completa</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isPaused ? 'Retomar rolagem' : 'Pausar rolagem'}
            aria-label={isPaused ? 'Retomar rolagem' : 'Pausar rolagem'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Auto-scrolling Track */}
      <div 
        ref={scrollContainerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="flex gap-3 overflow-x-hidden select-none cursor-grab active:cursor-grabbing px-4 no-scrollbar"
        style={{ scrollBehavior: 'auto' }}
      >
        {duplicatedList.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            onClick={() => setSelectedImage({ url: item.url, title: item.title })}
            className="group relative flex-shrink-0 w-44 sm:w-56 h-28 sm:h-36 rounded-xl overflow-hidden bg-[#0a192f] border border-white/10 hover:border-[#d4af37] transition-all duration-300 shadow-md cursor-pointer"
          >
            <img
              src={item.url}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const candidates = [
                  ...item.fallbacks,
                  '/IMG_4378.jpeg',
                  '/IMG_2382.jpeg',
                  '/IMG_5625.jpeg',
                ];
                const currentSrc = target.getAttribute('src') || '';
                const currentIndex = candidates.findIndex((c) => currentSrc.endsWith(c));
                if (currentIndex !== -1 && currentIndex + 1 < candidates.length) {
                  target.src = candidates[currentIndex + 1];
                }
              }}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-white truncate drop-shadow-sm">
                {item.title}
              </span>
              <Eye className="w-3.5 h-3.5 text-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Modal when clicking a photo */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden border border-[#d4af37]/40 bg-[#08172c] shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedImage.url} 
              alt={selectedImage.title} 
              className="w-full max-h-[70vh] object-contain rounded-xl"
            />
            <div className="p-3 flex items-center justify-between">
              <span className="text-sm font-bold text-white">{selectedImage.title}</span>
              <button
                onClick={() => setSelectedImage(null)}
                className="px-3 py-1 rounded bg-[#d4af37] text-[#060e1c] text-xs font-bold hover:bg-[#b8952b] transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
