import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Trophy, 
  MapPin, 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Filter, 
  Search, 
  ExternalLink,
  ChevronRight,
  AlertCircle,
  X
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { usePhotos } from '../context/PhotosContext';
import { AnnualCalendarEvent, EventCategory } from '../types';

const MONTH_NAMES_SHORT = [
  'Todos', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

const CATEGORY_COLORS: Record<EventCategory, { bg: string; text: string; border: string }> = {
  'Campeonato Nacional': { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/40' },
  'Campeonato Estadual': { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/40' },
  'Torneio Regional': { bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/40' },
  'Festival & Confraternização': { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/40' },
  'Seletiva & Avaliação': { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/40' },
  'Reunião de Pais': { bg: 'bg-slate-500/20', text: 'text-slate-300', border: 'border-slate-500/40' },
};

interface CalendarEventsSectionProps {
  onOpenEnrollModal?: () => void;
}

export const CalendarEventsSection: React.FC<CalendarEventsSectionProps> = ({ onOpenEnrollModal }) => {
  const { annualEvents, addAnnualEvent, updateAnnualEvent, deleteAnnualEvent, setCoachManagerModalOpen } = useCommunity();
  const { isAdminAuthenticated, openAdminModal } = usePhotos();

  const [selectedMonthFilter, setSelectedMonthFilter] = useState<number>(0); // 0 = all
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AnnualCalendarEvent | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<EventCategory>('Campeonato Estadual');
  const [formDate, setFormDate] = useState('');
  const [formMonth, setFormMonth] = useState<number>(new Date().getMonth() + 1);
  const [formLocation, setFormLocation] = useState('Centro Paralímpico Brasileiro - São Paulo, SP');
  const [formDescription, setFormDescription] = useState('');
  const [formTarget, setFormTarget] = useState('Alto Rendimento S14 & S21');
  const [formStatus, setFormStatus] = useState<'confirmado' | 'previsto' | 'concluido'>('confirmado');
  const [isSaving, setIsSaving] = useState(false);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return annualEvents.filter((evt) => {
      const matchMonth = selectedMonthFilter === 0 || evt.month === selectedMonthFilter;
      const matchCategory = selectedCategoryFilter === 'all' || evt.category === selectedCategoryFilter;
      const matchSearch = !searchTerm.trim() || 
        evt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evt.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evt.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (evt.targetCategory || '').toLowerCase().includes(searchTerm.toLowerCase());

      return matchMonth && matchCategory && matchSearch;
    }).sort((a, b) => a.month - b.month);
  }, [annualEvents, selectedMonthFilter, selectedCategoryFilter, searchTerm]);

  // Open Form for Create
  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setFormTitle('');
    setFormCategory('Campeonato Estadual');
    setFormDate('');
    setFormMonth(new Date().getMonth() + 1);
    setFormLocation('Centro Paralímpico Brasileiro - São Paulo, SP');
    setFormDescription('');
    setFormTarget('Alto Rendimento S14 & S21');
    setFormStatus('confirmado');
    setIsModalOpen(true);
  };

  // Open Form for Edit
  const handleOpenEditModal = (evt: AnnualCalendarEvent) => {
    setEditingEvent(evt);
    setFormTitle(evt.title);
    setFormCategory(evt.category);
    setFormDate(evt.date);
    setFormMonth(evt.month);
    setFormLocation(evt.location);
    setFormDescription(evt.description || '');
    setFormTarget(evt.targetCategory || 'Alto Rendimento S14 & S21');
    setFormStatus(evt.status);
    setIsModalOpen(true);
  };

  // Save Event
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDate.trim()) return;

    setIsSaving(true);
    if (editingEvent) {
      await updateAnnualEvent(editingEvent.id, {
        title: formTitle.trim(),
        category: formCategory,
        date: formDate.trim(),
        month: Number(formMonth),
        year: 2026,
        location: formLocation.trim(),
        description: formDescription.trim() || undefined,
        targetCategory: formTarget.trim() || undefined,
        status: formStatus,
      });
    } else {
      await addAnnualEvent({
        title: formTitle.trim(),
        category: formCategory,
        date: formDate.trim(),
        month: Number(formMonth),
        year: 2026,
        location: formLocation.trim(),
        description: formDescription.trim() || undefined,
        targetCategory: formTarget.trim() || undefined,
        status: formStatus,
        highlight: formCategory === 'Campeonato Nacional' || formCategory === 'Campeonato Estadual',
      });
    }
    setIsSaving(false);
    setIsModalOpen(false);
  };

  return (
    <section id="calendario" className="py-16 bg-[#071326] text-slate-100 relative border-t border-[#1e3a5f]/80">
      
      {/* Background Subtle Elements */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#1e4976]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header (Compact & Clear) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-2">
              <CalendarIcon className="w-4 h-4" />
              <span>Temporada Competitiva 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Calendário de Competições & Eventos
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl font-light">
              Acompanhe as datas dos Campeonatos Paulistas, Circuitos Nacionais, seletivas técnicas e festivais da ACEDEP durante todo o ano.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isAdminAuthenticated ? (
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 rounded-xl bg-[#d4af37] hover:bg-[#f3e5ab] text-[#060e1c] text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Competição / Evento</span>
              </button>
            ) : (
              <button
                onClick={openAdminModal}
                className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Acesso da Comissão Técnica para atualizar datas"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Atualizar Calendário</span>
              </button>
            )}
          </div>
        </div>

        {/* Compact Filters & Month Tabs Bar */}
        <div className="p-3 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] shadow-lg mb-6 space-y-3">
          
          {/* Top Bar: Search & Category Select */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar torneio, local ou classe..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            {/* Category Dropdown & Counter */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="py-1.5 px-3 rounded-lg bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-[#d4af37] cursor-pointer"
              >
                <option value="all">Todas as Categorias</option>
                <option value="Campeonato Nacional">Campeonatos Nacionais</option>
                <option value="Campeonato Estadual">Campeonatos Estaduais</option>
                <option value="Torneio Regional">Torneios Regionais</option>
                <option value="Seletiva & Avaliação">Seletivas & Avaliações</option>
                <option value="Festival & Confraternização">Festivais</option>
                <option value="Reunião de Pais">Reuniões de Pais</option>
              </select>

              <span className="text-[11px] text-[#d4af37] font-semibold bg-black/50 px-2.5 py-1 rounded-md border border-[#d4af37]/20 shrink-0">
                {filteredEvents.length} {filteredEvents.length === 1 ? 'evento' : 'eventos'}
              </span>
            </div>
          </div>

          {/* Month Pills Tabs (Compact Horizontal Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
            {MONTH_NAMES_SHORT.map((name, idx) => {
              const isSelected = selectedMonthFilter === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedMonthFilter(idx)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#d4af37] text-[#060e1c] shadow-sm font-bold'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>

        </div>

        {/* Compact Event List / Grid */}
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#0a192f] border border-[#1e3a5f] text-slate-400 text-xs">
            Nenhum evento encontrado para os filtros selecionados.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredEvents.map((evt) => {
              const catStyle = CATEGORY_COLORS[evt.category] || {
                bg: 'bg-white/10',
                text: 'text-slate-200',
                border: 'border-white/10',
              };

              return (
                <div
                  key={evt.id}
                  className={`p-4 rounded-xl bg-gradient-to-b from-[#0a192f] to-[#060e1c] border transition-all duration-200 hover:border-[#d4af37]/50 shadow-md flex flex-col justify-between space-y-3 group ${
                    evt.highlight ? 'border-[#d4af37]/30' : 'border-[#1e3a5f]'
                  }`}
                >
                  {/* Top Bar: Date & Category */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Date Badge */}
                      <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-center min-w-[70px] shrink-0">
                        <span className="text-[10px] font-extrabold uppercase text-[#d4af37] block leading-none mb-1">
                          {MONTH_NAMES_SHORT[evt.month]} / 26
                        </span>
                        <span className="text-xs font-black text-white leading-tight block">
                          {evt.date.split(' ')[0]}
                        </span>
                      </div>

                      <div>
                        {/* Category Pill */}
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border mb-1 ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                          {evt.category}
                        </span>
                        <h3 className="text-sm font-bold text-white leading-snug group-hover:text-[#f3e5ab] transition-colors">
                          {evt.title}
                        </h3>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="shrink-0">
                      {evt.status === 'confirmado' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Confirmado
                        </span>
                      )}
                      {evt.status === 'previsto' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Previsto
                        </span>
                      )}
                      {evt.status === 'concluido' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30">
                          Concluído
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details strip */}
                  <div className="space-y-1.5 text-xs text-slate-300 pt-1 border-t border-white/5">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                      <span className="font-semibold text-white">{evt.date}</span>
                    </div>

                    <div className="flex items-start gap-2 text-slate-400 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-[#d4af37] shrink-0 mt-0.5" />
                      <span className="truncate">{evt.location}</span>
                    </div>

                    {evt.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 pt-0.5 font-light">
                        {evt.description}
                      </p>
                    )}
                  </div>

                  {/* Bottom: Target Audience & Admin Controls */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-black/40 text-[#f3e5ab] border border-white/5 font-medium">
                      Público: {evt.targetCategory || 'Atletas ACEDEP'}
                    </span>

                    {isAdminAuthenticated && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(evt)}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                          title="Editar Competição"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm(`Remover "${evt.title}" do calendário?`)) {
                              await deleteAnnualEvent(evt.id);
                            }
                          }}
                          className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 transition-colors cursor-pointer"
                          title="Excluir Evento"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* MODAL: ADD / EDIT COMPETITION OR EVENT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#0a192f] border-2 border-[#d4af37]/40 shadow-2xl p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <CalendarIcon className="w-5 h-5 text-[#d4af37]" />
                <span>{editingEvent ? 'Editar Competição / Evento' : 'Novo Evento no Calendário'}</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome do Torneio ou Evento *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Campeonato Paulista FAP - 1ª Etapa"
                  className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Categoria *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as EventCategory)}
                    className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#d4af37] cursor-pointer"
                  >
                    <option value="Campeonato Nacional">Campeonato Nacional</option>
                    <option value="Campeonato Estadual">Campeonato Estadual</option>
                    <option value="Torneio Regional">Torneio Regional</option>
                    <option value="Seletiva & Avaliação">Seletiva & Avaliação</option>
                    <option value="Festival & Confraternização">Festival & Confraternização</option>
                    <option value="Reunião de Pais">Reunião de Pais</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mês de Ocorrência *</label>
                  <select
                    value={formMonth}
                    onChange={(e) => setFormMonth(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#d4af37] cursor-pointer"
                  >
                    {MONTH_NAMES_SHORT.slice(1).map((m, idx) => (
                      <option key={idx + 1} value={idx + 1}>{idx + 1} - {m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Data / Período *</label>
                  <input
                    type="text"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    placeholder="Ex: 21 e 22 de Março de 2026"
                    className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status da Data</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#d4af37] cursor-pointer"
                  >
                    <option value="confirmado">Confirmado Oficialmente</option>
                    <option value="previsto">Data Prevista / A Confirmar</option>
                    <option value="concluido">Concluído</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Local / Piscina</label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="Ex: Centro Paralímpico Brasileiro - Piscina Olímpica 50m"
                  className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Público-Alvo / Categorias Convocadas</label>
                <input
                  type="text"
                  value={formTarget}
                  onChange={(e) => setFormTarget(e.target.value)}
                  placeholder="Ex: Alto Rendimento S14 & S21, Todos os Atletas..."
                  className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Observações Técnicas / Detalhes</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Provas disputadas, horários de aquecimento, etc."
                  className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] resize-none"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-[#d4af37] hover:bg-[#f3e5ab] text-[#060e1c] text-xs font-bold transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : editingEvent ? 'Salvar Alterações' : 'Adicionar ao Calendário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
};
