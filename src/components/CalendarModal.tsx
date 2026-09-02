import React, { useState, useMemo, useEffect } from 'react';
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

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEnrollModal?: () => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({ 
  isOpen, 
  onClose,
  onOpenEnrollModal 
}) => {
  const { annualEvents, addAnnualEvent, updateAnnualEvent, deleteAnnualEvent, setCoachManagerModalOpen } = useCommunity();
  const { isAdminAuthenticated, openAdminModal } = usePhotos();

  const [selectedMonthFilter, setSelectedMonthFilter] = useState<number>(0); // 0 = all
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

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFormModalOpen) {
          setIsFormModalOpen(false);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFormModalOpen, onClose]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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

  // Delete
  const handleDeleteEvent = async (id: string, title: string) => {
    if (window.confirm(`Tem certeza que deseja remover o evento "${title}" do calendário oficial?`)) {
      await deleteAnnualEvent(id);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl my-auto rounded-3xl bg-[#08172c] border border-[#1e3a5f] shadow-2xl shadow-black/80 flex flex-col max-h-[92vh] overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header Bar */}
        <div className="p-4 sm:p-6 bg-[#060e1c] border-b border-[#1e3a5f] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 shadow-inner">
              <CalendarIcon className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-white font-serif tracking-tight">
                  Calendário Oficial de Competições & Eventos
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f3e5ab] text-[11px] font-mono font-bold border border-[#d4af37]/30">
                  2026
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Torneios paralímpicos, etapas estaduais, festivais e reuniões da ACEDEP Natação
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminAuthenticated && (
              <button
                onClick={handleOpenCreateModal}
                className="px-3 py-1.5 rounded-xl bg-[#d4af37] hover:bg-[#f3e5ab] text-[#060e1c] font-bold text-xs transition-all flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Adicionar Evento</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Fechar calendário"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Filters Bar: Search & Category Chips */}
        <div className="p-4 sm:px-6 bg-[#0a1f3b]/70 border-b border-[#1e3a5f] space-y-3 shrink-0">
          {/* Search + Category Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar torneio, cidade, categoria ou data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-[#1e3a5f] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#d4af37]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="py-2 px-3 rounded-xl bg-black/40 border border-[#1e3a5f] text-xs text-white focus:outline-none focus:border-[#d4af37]"
              >
                <option value="all">Todas as Categorias</option>
                <option value="Campeonato Nacional">Campeonatos Nacionais</option>
                <option value="Campeonato Estadual">Campeonatos Estaduais</option>
                <option value="Torneio Regional">Torneios Regionais</option>
                <option value="Festival & Confraternização">Festivais & Confraternizações</option>
                <option value="Seletiva & Avaliação">Seletivas & Avaliações</option>
                <option value="Reunião de Pais">Reuniões de Pais</option>
              </select>
            </div>
          </div>

          {/* Month Selector Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {MONTH_NAMES_SHORT.map((name, idx) => (
              <button
                key={name}
                onClick={() => setSelectedMonthFilter(idx)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedMonthFilter === idx
                    ? 'bg-[#d4af37] text-[#060e1c] font-black shadow'
                    : 'bg-black/30 text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Events List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-black/20 border border-white/5 space-y-3">
              <CalendarIcon className="w-10 h-10 text-slate-500 mx-auto opacity-60" />
              <p className="text-sm text-slate-300 font-medium">
                Nenhum evento encontrado para os filtros selecionados.
              </p>
              <button
                onClick={() => {
                  setSelectedMonthFilter(0);
                  setSelectedCategoryFilter('all');
                  setSearchTerm('');
                }}
                className="px-4 py-1.5 rounded-lg bg-[#1e3a5f] text-xs font-bold text-slate-200 hover:bg-[#d4af37] hover:text-black transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEvents.map((evt) => {
                const badge = CATEGORY_COLORS[evt.category] || {
                  bg: 'bg-slate-500/20',
                  text: 'text-slate-300',
                  border: 'border-slate-500/30'
                };

                return (
                  <div
                    key={evt.id}
                    className="p-4 rounded-2xl bg-[#0c2240]/80 border border-[#1e3a5f] hover:border-[#d4af37]/60 transition-all flex flex-col justify-between space-y-3 shadow-md"
                  >
                    <div className="space-y-2">
                      {/* Category & Status */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {evt.category}
                        </span>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          evt.status === 'confirmado'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : evt.status === 'concluido'
                            ? 'bg-slate-700 text-slate-300'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {evt.status === 'confirmado' ? 'Confirmado' : evt.status === 'concluido' ? 'Concluído' : 'Previsto'}
                        </span>
                      </div>

                      {/* Event Title */}
                      <h4 className="text-base font-extrabold text-white leading-snug">
                        {evt.title}
                      </h4>

                      {/* Date & Location */}
                      <div className="space-y-1 text-xs text-slate-300">
                        <div className="flex items-center gap-2 text-[#f3e5ab] font-bold">
                          <CalendarIcon className="w-3.5 h-3.5 text-[#d4af37]" />
                          <span>{evt.date}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{evt.location}</span>
                        </div>

                        {evt.targetCategory && (
                          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                            <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>Público: {evt.targetCategory}</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {evt.description && (
                        <p className="text-xs text-slate-300 pt-1 leading-relaxed border-t border-white/5">
                          {evt.description}
                        </p>
                      )}
                    </div>

                    {/* Admin Action Buttons */}
                    {isAdminAuthenticated && (
                      <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(evt)}
                          className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Editar</span>
                        </button>

                        <button
                          onClick={() => handleDeleteEvent(evt.id, evt.title)}
                          className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remover</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="p-4 bg-[#060e1c] border-t border-[#1e3a5f] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Calendário sincronizado com o Comitê Paralímpico Brasileiro e FAP</span>
          </div>

          <div className="flex items-center gap-3">
            {!isAdminAuthenticated ? (
              <button
                onClick={openAdminModal}
                className="text-[11px] text-slate-400 hover:text-[#d4af37] transition-colors cursor-pointer"
              >
                Acesso do Treinador (Gerenciar)
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  setCoachManagerModalOpen(true);
                }}
                className="text-[11px] text-[#d4af37] hover:underline font-bold transition-colors cursor-pointer"
              >
                Abrir Painel Geral do Treinador →
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-[#1e3a5f] hover:bg-[#d4af37] text-white hover:text-black font-bold text-xs transition-all cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>

        {/* Inner Add / Edit Form Modal */}
        {isFormModalOpen && (
          <div 
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
            onClick={() => setIsFormModalOpen(false)}
          >
            <div 
              className="relative w-full max-w-lg rounded-2xl bg-[#0a192f] border border-[#1e3a5f] p-6 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#1e3a5f] pb-3">
                <h4 className="text-base font-bold text-white font-serif">
                  {editingEvent ? 'Editar Evento do Calendário' : 'Novo Evento / Torneio'}
                </h4>
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Título do Evento *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ex: Campeonato Paulista FAP - 1ª Etapa"
                    className="w-full p-2.5 rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Categoria *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as EventCategory)}
                      className="w-full p-2.5 rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
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
                    <label className="block font-bold text-slate-300 mb-1">Mês de Referência *</label>
                    <select
                      value={formMonth}
                      onChange={(e) => setFormMonth(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                    >
                      {MONTH_NAMES_SHORT.slice(1).map((m, idx) => (
                        <option key={m} value={idx + 1}>{m} (Mês {idx + 1})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Data / Período *</label>
                    <input
                      type="text"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      placeholder="Ex: 21 a 22 de Março, 2026"
                      className="w-full p-2.5 rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value="confirmado">Confirmado</option>
                      <option value="previsto">Previsto</option>
                      <option value="concluido">Concluído</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Local / Cidade *</label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Ex: Centro Paralímpico Brasileiro - São Paulo, SP"
                    className="w-full p-2.5 rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Público / Categoria de Atletas</label>
                  <input
                    type="text"
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value)}
                    placeholder="Ex: Alto Rendimento S14 & S21 ou Todos os Atletas"
                    className="w-full p-2.5 rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Descrição / Observações</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Detalhes sobre provas, balizamento ou orientações..."
                    className="w-full p-2.5 rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="pt-3 border-t border-[#1e3a5f] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 font-bold hover:bg-white/15 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#f3e5ab] text-[#060e1c] font-black cursor-pointer shadow disabled:opacity-50"
                  >
                    {isSaving ? 'Salvando...' : editingEvent ? 'Atualizar Evento' : 'Cadastrar Evento'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
