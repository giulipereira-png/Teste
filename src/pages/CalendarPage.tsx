import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft,
  Calendar as CalendarIcon, 
  Trophy, 
  MapPin, 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Search, 
  ChevronRight, 
  AlertCircle, 
  X,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { usePhotos } from '../context/PhotosContext';
import { AnnualCalendarEvent, EventCategory } from '../types';

const MONTH_NAMES_SHORT = [
  'Todos os Meses', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const CATEGORY_COLORS: Record<EventCategory, { bg: string; text: string; border: string }> = {
  'Campeonato Nacional': { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/40' },
  'Campeonato Estadual': { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/40' },
  'Torneio Regional': { bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/40' },
  'Festival & Confraternização': { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/40' },
  'Seletiva & Avaliação': { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/40' },
  'Reunião de Pais': { bg: 'bg-slate-500/20', text: 'text-slate-300', border: 'border-slate-500/40' },
};

interface CalendarPageProps {
  onBackToHome: () => void;
  onOpenEnrollModal: () => void;
  onNavigateToPage?: (page: string) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  onBackToHome,
  onOpenEnrollModal,
  onNavigateToPage
}) => {
  const { annualEvents, addAnnualEvent, updateAnnualEvent, deleteAnnualEvent, setCoachManagerModalOpen } = useCommunity();
  const { isAdminAuthenticated, openAdminModal } = usePhotos();

  const [selectedMonthFilter, setSelectedMonthFilter] = useState<number>(0);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Add / Edit Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return (annualEvents || []).filter((evt) => {
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
    setIsFormModalOpen(true);
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
    setIsFormModalOpen(true);
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
        description: formDescription.trim(),
        targetCategory: formTarget.trim(),
        status: formStatus,
      });
    } else {
      const newEvt: AnnualCalendarEvent = {
        id: `evt-${Date.now()}`,
        title: formTitle.trim(),
        category: formCategory,
        date: formDate.trim(),
        month: Number(formMonth),
        year: 2026,
        location: formLocation.trim(),
        description: formDescription.trim(),
        targetCategory: formTarget.trim(),
        status: formStatus,
        createdAt: new Date().toISOString(),
      };
      await addAnnualEvent(newEvt);
    }
    setIsSaving(false);
    setIsFormModalOpen(false);
  };

  // Delete Event
  const handleDeleteEvent = async (id: string, title: string) => {
    if (window.confirm(`Tem certeza que deseja remover o evento "${title}" do calendário oficial?`)) {
      await deleteAnnualEvent(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#060e1c] text-slate-100 selection:bg-[#d4af37] selection:text-[#060e1c] pt-24 pb-20">
      
      {/* Top Navigation & Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-b border-[#1e3a5f]/60 mb-6">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-[#d4af37] border border-white/10 hover:border-[#d4af37] text-slate-200 hover:text-[#060e1c] text-xs font-semibold transition-all shadow-sm cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform" />
            <span>Voltar para o Início</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span 
              onClick={onBackToHome} 
              className="hover:text-white cursor-pointer transition-colors"
            >
              Início
            </span>
            <span>/</span>
            <span className="text-[#d4af37] font-medium">Calendário Oficial 2026</span>
          </div>
        </div>

        {/* Clean, Non-Bloated Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
                <CalendarIcon className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Calendário Oficial de Competições 2026
              </h1>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 font-normal">
              Etapas do Circuito Nacional CPB, Campeonatos Paulistas FAP, seletivas técnicas e festivais.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {isAdminAuthenticated && (
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="px-3.5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#b8952b] text-[#060e1c] text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Evento</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenEnrollModal}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 text-xs font-semibold border border-white/10 transition-all cursor-pointer"
            >
              Matricular Atleta
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-5 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] shadow-lg space-y-4 mb-8 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-4 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por competição, local, prova..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-[#1e3a5f] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            {/* Category Select */}
            <div className="md:col-span-4">
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-[#1e3a5f] text-white text-xs focus:outline-none focus:border-[#d4af37]"
              >
                <option value="all">Todas as Categorias de Evento</option>
                <option value="Campeonato Nacional">Campeonatos Nacionais CPB</option>
                <option value="Campeonato Estadual">Campeonatos Estaduais FAP</option>
                <option value="Torneio Regional">Torneios Regionais</option>
                <option value="Festival & Confraternização">Festivais & Confraternizações</option>
                <option value="Seletiva & Avaliação">Seletivas & Avaliações</option>
                <option value="Reunião de Pais">Reuniões de Pais</option>
              </select>
            </div>

            {/* Month Select */}
            <div className="md:col-span-4">
              <select
                value={selectedMonthFilter}
                onChange={(e) => setSelectedMonthFilter(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-[#1e3a5f] text-white text-xs focus:outline-none focus:border-[#d4af37]"
              >
                {MONTH_NAMES_SHORT.map((mName, idx) => (
                  <option key={idx} value={idx}>{mName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Month Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-white/5 custom-scrollbar">
            {MONTH_NAMES_SHORT.map((mName, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedMonthFilter(idx)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedMonthFilter === idx
                    ? 'bg-[#d4af37] text-[#060e1c] font-bold shadow'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                {mName}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#0a192f] border border-[#1e3a5f] space-y-3">
            <CalendarIcon className="w-12 h-12 text-slate-500 mx-auto" />
            <h4 className="text-base font-bold text-white">Nenhum evento encontrado</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Nenhuma competição ou atividade agendada corresponde aos filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEvents.map((evt) => {
              const catStyle = CATEGORY_COLORS[evt.category] || { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/40' };

              return (
                <div
                  key={evt.id}
                  className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] hover:border-[#d4af37]/60 transition-all duration-300 shadow-lg flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    {/* Top Tag & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                        {evt.category}
                      </span>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        evt.status === 'confirmado'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : evt.status === 'concluido'
                          ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {evt.status === 'confirmado' ? 'Confirmado' : evt.status === 'concluido' ? 'Concluído' : 'Previsto'}
                      </span>
                    </div>

                    {/* Title & Date */}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#f3e5ab] transition-colors leading-snug">
                        {evt.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-xs font-mono text-[#d4af37] font-bold mt-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{evt.date}</span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-2 text-xs text-slate-300 bg-black/30 p-2.5 rounded-xl border border-white/5">
                      <MapPin className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                      <span>{evt.location}</span>
                    </div>

                    {/* Description */}
                    {evt.description && (
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {evt.description}
                      </p>
                    )}

                    {/* Target Athletes */}
                    {evt.targetCategory && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>Público: <strong className="text-slate-300">{evt.targetCategory}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Actions / Admin buttons */}
                  {isAdminAuthenticated && (
                    <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(evt)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-[#d4af37]/20 text-slate-300 hover:text-[#d4af37] transition-colors cursor-pointer text-xs flex items-center gap-1"
                        title="Editar Evento"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => handleDeleteEvent(evt.id, evt.title)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer text-xs"
                        title="Excluir Evento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Admin Add/Edit Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#0a192f] border border-[#1e3a5f] rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e3a5f] pb-3">
              <h3 className="text-base font-bold text-white font-serif">
                {editingEvent ? 'Editar Evento do Calendário' : 'Novo Evento no Calendário 2026'}
              </h3>
              <button onClick={() => setIsFormModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Título do Evento *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: 1ª Etapa Circuito Nacional Paralímpico CPB"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#1e3a5f] text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Categoria *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#1e3a5f] text-white text-xs"
                  >
                    <option value="Campeonato Nacional">Campeonato Nacional</option>
                    <option value="Campeonato Estadual">Campeonato Estadual</option>
                    <option value="Torneio Regional">Torneio Regional</option>
                    <option value="Festival & Confraternização">Festival & Confraternização</option>
                    <option value="Seletiva & Avaliação">Seletiva & Avaliação</option>
                    <option value="Reunião de Pais">Reunião de Pais</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Mês *</label>
                  <select
                    value={formMonth}
                    onChange={(e) => setFormMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#1e3a5f] text-white text-xs"
                  >
                    {MONTH_NAMES_SHORT.slice(1).map((m, idx) => (
                      <option key={idx + 1} value={idx + 1}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Data / Período *</label>
                <input
                  type="text"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  placeholder="Ex: 14 e 15 de Março de 2026"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#1e3a5f] text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Local</label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#1e3a5f] text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#1e3a5f] text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b]"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
