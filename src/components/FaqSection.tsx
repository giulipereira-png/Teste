import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Sparkles,
  MessageCircleQuestion,
  Waves,
  Mail,
  ArrowRight
} from 'lucide-react';
import { FAQS } from '../data/mockData';

interface FaqSectionProps {
  onOpenContactModal?: () => void;
  onOpenEnrollModal?: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({
  onOpenContactModal,
  onOpenEnrollModal,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const categories = [
    { id: 'todos', label: 'Todas as Dúvidas' },
    { id: 'requisitos', label: 'Requisitos & Idade' },
    { id: 'treinos', label: 'Treinos & Local' },
    { id: 'apoio', label: 'Parcerias & Apoio' },
  ];

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (selectedCategory === 'requisitos') {
      return faq.question.includes('Quem') || faq.question.includes('requisitos') || faq.question.includes('teste');
    }
    if (selectedCategory === 'treinos') {
      return faq.question.includes('Onde') || faq.question.includes('turmas') || faq.question.includes('dias') || faq.question.includes('atletas');
    }
    if (selectedCategory === 'apoio') {
      return faq.question.includes('apoiar') || faq.question.includes('patrocinar');
    }
    return true;
  });

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-14 sm:py-16 bg-[#060e1c] text-slate-100 relative border-t border-[#1e3a5f]/60">
      
      {/* Background Subtle Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Compact Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#d4af37] uppercase tracking-widest mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Tire Suas Dúvidas</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif">
            Perguntas Frequentes
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
            Respostas diretas sobre matrículas, critérios para novos atletas, horários e atuação da ACEDEP.
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="mb-6 space-y-3">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar pergunta (ex: idade, CPB, horários)..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#0a192f] border border-[#1e3a5f] text-white placeholder-slate-400 focus:outline-none focus:border-[#d4af37] transition-colors shadow-inner"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#d4af37] text-[#060e1c] font-bold shadow-sm'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Compact Accordion List */}
        <div className="space-y-2.5">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 bg-[#0a192f]/60 rounded-xl border border-white/5">
              Nenhuma dúvida encontrada para a sua busca.
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  id={`faq-item-${idx}`}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isOpen 
                      ? 'bg-gradient-to-r from-[#0f2744] to-[#0a192f] border-[#d4af37]/50 shadow-md shadow-black/40' 
                      : 'bg-[#0a192f]/70 border-white/10 hover:border-white/20'
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full p-3.5 sm:p-4 text-left flex items-center justify-between gap-3 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOpen ? 'bg-[#d4af37]' : 'bg-slate-500'}`} />
                      <span className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                        {faq.question}
                      </span>
                    </div>
                    <div className={`p-1 rounded-md shrink-0 transition-transform duration-200 ${isOpen ? 'text-[#d4af37]' : 'text-slate-400'}`}>
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-3.5 pt-0 sm:px-5 sm:pb-4 text-xs sm:text-xs text-slate-300 leading-relaxed border-t border-white/5 animate-in fade-in duration-150">
                      <p className="pt-2">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Quick Help Contact Banner */}
        <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-[#0a192f] via-[#0f2744] to-[#0a192f] border border-[#1e3a5f] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#d4af37]/20 text-[#d4af37] shrink-0 border border-[#d4af37]/30">
              <MessageCircleQuestion className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Não encontrou o que procurava?</p>
              <p className="text-[11px] text-slate-300">Nossa equipe e treinadores estão prontos para tirar suas dúvidas.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenContactModal && (
              <button
                onClick={onOpenContactModal}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[#d4af37] text-white hover:text-[#060e1c] font-bold text-xs transition-colors border border-white/10 flex items-center gap-1.5 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Falar Conosco</span>
              </button>
            )}
            {onOpenEnrollModal && (
              <button
                onClick={onOpenEnrollModal}
                className="px-3 py-1.5 rounded-lg bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Agendar Avaliação</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
