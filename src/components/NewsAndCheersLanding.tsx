import React, { useState, useEffect } from 'react';
import { 
  Waves, 
  Newspaper, 
  MessageSquareHeart, 
  Heart, 
  Send, 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Play,
  Pause,
  ExternalLink,
  Users
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { CommunityCheer, NewsPost } from '../types';

interface NewsAndCheersLandingProps {
  onOpenCommunityModal?: () => void;
}

export const NewsAndCheersLanding: React.FC<NewsAndCheersLandingProps> = ({
  onOpenCommunityModal
}) => {
  const { 
    newsPosts, 
    cheers, 
    addCheer, 
    likeCheer, 
    setSelectedNewsForModal 
  } = useCommunity();

  // Cheers Carousel State
  const [currentCheerIndex, setCurrentCheerIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showAddCheerForm, setShowAddCheerForm] = useState(false);

  // Add Cheer Form State
  const [authorName, setAuthorName] = useState('');
  const [relationship, setRelationship] = useState('Familiar / Amigo');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Auto-play timer for Cheers Carousel
  useEffect(() => {
    if (isPaused || showAddCheerForm || cheers.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentCheerIndex((prev) => (prev + 1) % cheers.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, showAddCheerForm, cheers.length]);

  // Keep index valid if cheers length changes
  useEffect(() => {
    if (currentCheerIndex >= cheers.length && cheers.length > 0) {
      setCurrentCheerIndex(0);
    }
  }, [cheers.length, currentCheerIndex]);

  const handleCheerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !message.trim()) return;

    setIsSubmitting(true);
    const success = await addCheer({
      authorName: authorName.trim(),
      relationship: relationship.trim() || 'Comunidade ACEDEP',
      message: message.trim(),
    });
    setIsSubmitting(false);

    if (success) {
      setAuthorName('');
      setMessage('');
      setSubmitSuccess(true);
      setShowAddCheerForm(false);
      setTimeout(() => setSubmitSuccess(false), 4000);
    }
  };

  // Recent 3 news posts for the headlines section
  const recentNews = (newsPosts || []).slice(0, 3);
  const activeCheer: CommunityCheer | undefined = cheers[currentCheerIndex] || cheers[0];

  return (
    <section id="comunidade" className="py-8 sm:py-10 bg-[#08172c] text-slate-100 relative border-t border-[#1e3a5f]/60">
      {/* Subtle Background Glow */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
                <Waves className="w-4 h-4" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Notícias & Recados da Torcida
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              Novidades da natação paralímpica e mensagens de incentivo aos nossos 35 atletas.
            </p>
          </div>

          {onOpenCommunityModal && (
            <button
              onClick={onOpenCommunityModal}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d4af37] hover:text-[#f3e5ab] transition-colors cursor-pointer self-start md:self-auto"
            >
              <span>Ver todas as notícias e mural</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2-Column Responsive Layout: Headlines (Left) + Cheers Carousel (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: News Headlines (7 cols on Desktop) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between px-1 mb-2">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Newspaper className="w-4 h-4 text-[#d4af37]" />
                <span>Últimas Manchetes</span>
              </div>
              <span className="text-[11px] text-slate-400">Clique para ler matéria completa</span>
            </div>

            <div className="space-y-3">
              {recentNews.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedNewsForModal(post)}
                  className="group p-4 rounded-2xl bg-[#0b203a]/80 hover:bg-[#0e2747] border border-[#1e3a5f] hover:border-[#d4af37]/60 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl flex flex-col sm:flex-row gap-3.5 items-start sm:items-center justify-between"
                >
                  <div className="flex gap-3.5 items-start flex-1 min-w-0">
                    {post.coverUrl && (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-black/40 border border-white/10">
                        <img 
                          src={post.coverUrl} 
                          alt={post.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d4af37]/20 text-[#f3e5ab] border border-[#d4af37]/30">
                          {post.category}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Calendar className="w-3 h-3" />
                          {post.date}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#d4af37] transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-xs text-slate-300 line-clamp-1">
                        {post.summary}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex sm:flex-col items-center justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <span className="text-xs font-bold text-[#d4af37] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Ler</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Mural de Recados da Torcida (5 cols on Desktop) */}
          <div className="lg:col-span-5 flex flex-col h-full">
            <div className="flex items-center justify-between px-1 mb-2">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <MessageSquareHeart className="w-4 h-4 text-rose-400" />
                <span>Mural de Recados & Torcida</span>
              </div>

              <button
                onClick={() => setShowAddCheerForm(!showAddCheerForm)}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{showAddCheerForm ? 'Fechar Formulário' : 'Deixar Recado'}</span>
              </button>
            </div>

            {/* Success Toast Banner */}
            {submitSuccess && (
              <div className="mb-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Obrigado! Seu recado foi publicado no mural da equipe.</span>
              </div>
            )}

            {/* Form Mode or Carousel Display */}
            {showAddCheerForm ? (
              <div className="p-4 rounded-2xl bg-[#0b203a] border border-[#1e3a5f] shadow-lg animate-fadeIn space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#1e3a5f]">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                    <span>Enviar Mensagem de Apoio aos Nadadores</span>
                  </h4>
                </div>

                <form onSubmit={handleCheerSubmit} className="space-y-2.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Seu Nome *</label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Ex: Família Silva, Mariana ou Carlos"
                      className="w-full p-2 rounded-xl bg-black/40 border border-[#1e3a5f] text-white text-xs focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Vínculo com a ACEDEP</label>
                    <select
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="w-full p-2 rounded-xl bg-black/40 border border-[#1e3a5f] text-white text-xs focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value="Familiar de Atleta">Familiar de Atleta</option>
                      <option value="Amigo & Torcedor">Amigo & Torcedor</option>
                      <option value="Atleta da Equipe">Atleta da Equipe</option>
                      <option value="Apoiador & Parceiro">Apoiador & Parceiro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Sua Mensagem de Incentivo *</label>
                    <textarea
                      required
                      rows={2}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ex: Parabéns a todos os nadadores pelo esforço! Estamos na torcida!"
                      className="w-full p-2 rounded-xl bg-black/40 border border-[#1e3a5f] text-white text-xs focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCheerForm(false)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-slate-300 font-bold hover:bg-white/15 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-1.5 rounded-lg bg-[#d4af37] hover:bg-[#f3e5ab] text-[#060e1c] font-black cursor-pointer shadow flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Enviando...' : 'Publicar'}</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Carousel Card */
              <div 
                className="p-5 rounded-2xl bg-gradient-to-br from-[#0c2342] to-[#08172c] border border-[#1e3a5f] shadow-lg flex flex-col justify-between flex-1 relative min-h-[220px]"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                {activeCheer ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-black text-xs">
                          {activeCheer.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white leading-tight">
                            {activeCheer.authorName}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {activeCheer.relationship || 'Torcedor ACEDEP'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => likeCheer(activeCheer.id)}
                        className="px-2.5 py-1 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Curtir recado"
                      >
                        <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                        <span>{activeCheer.likes || 0}</span>
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 relative">
                      <p className="text-xs text-slate-200 italic leading-relaxed">
                        "{activeCheer.message}"
                      </p>
                    </div>

                    <div className="text-[10px] text-slate-400 text-right">
                      {activeCheer.createdAt ? new Date(activeCheer.createdAt).toLocaleDateString('pt-BR') : 'Recente'}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400">
                    Seja o primeiro a deixar uma mensagem de incentivo para os atletas!
                  </div>
                )}

                {/* Carousel Controls Footer */}
                <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  {/* Dots Indicator */}
                  <div className="flex items-center gap-1">
                    {cheers.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentCheerIndex(idx)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          currentCheerIndex === idx 
                            ? 'w-5 bg-[#d4af37]' 
                            : 'w-1.5 bg-slate-600 hover:bg-slate-400'
                        }`}
                        aria-label={`Ir para recado ${idx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Prev / Next & Pause Toggle */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title={isPaused ? 'Continuar rotação automática' : 'Pausar'}
                    >
                      {isPaused ? <Play className="w-3 h-3 text-[#d4af37]" /> : <Pause className="w-3 h-3" />}
                    </button>

                    <button
                      onClick={() => setCurrentCheerIndex((prev) => (prev === 0 ? cheers.length - 1 : prev - 1))}
                      className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 transition-colors cursor-pointer"
                      aria-label="Recado anterior"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setCurrentCheerIndex((prev) => (prev + 1) % Math.max(1, cheers.length))}
                      className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 transition-colors cursor-pointer"
                      aria-label="Próximo recado"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
