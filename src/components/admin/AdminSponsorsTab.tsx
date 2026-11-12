import React, { useState, useRef } from 'react';
import { 
  HeartHandshake, 
  Plus, 
  Upload, 
  Trash2, 
  Edit3, 
  Globe, 
  CheckCircle2, 
  X, 
  ExternalLink, 
  Image as ImageIcon, 
  AlertCircle,
  Building2,
  Calendar,
  Eye,
  EyeOff,
  Sparkles,
  ArrowUpDown,
  Search,
  Filter
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { SponsorItem } from '../../types';

const CATEGORIES: SponsorItem['category'][] = [
  'Patrocinador Master',
  'Apoiador Institucional',
  'Parceiro Técnico',
  'Apoio Alimentar & Saúde',
  'Empresa Amiga do Paradesporto'
];

interface AdminSponsorsTabProps {
  onNavigateToPublicSponsors?: () => void;
}

export const AdminSponsorsTab: React.FC<AdminSponsorsTabProps> = ({ onNavigateToPublicSponsors }) => {
  const { sponsors, addSponsor, updateSponsor, deleteSponsor } = useCommunity();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSponsorId, setEditingSponsorId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SponsorItem['category']>('Patrocinador Master');
  const [logoUrl, setLogoUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');
  const [sinceYear, setSinceYear] = useState('2026');
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState<number>(sponsors.length + 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName('');
    setCategory('Patrocinador Master');
    setLogoUrl('');
    setWebsiteUrl('');
    setDescription('');
    setSinceYear('2026');
    setIsActive(true);
    setOrder(sponsors.length + 1);
    setEditingSponsorId(null);
    setIsFormOpen(false);
  };

  const handleStartEdit = (item: SponsorItem) => {
    setEditingSponsorId(item.id);
    setName(item.name);
    setCategory(item.category);
    setLogoUrl(item.logoUrl || '');
    setWebsiteUrl(item.websiteUrl || '');
    setDescription(item.description || '');
    setSinceYear(item.sinceYear || '2026');
    setIsActive(item.isActive);
    setOrder(item.order ?? 1);
    setIsFormOpen(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Convert uploaded logo image to a lightweight compressed data URL
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedbackMessage({ type: 'error', text: 'Por favor, selecione um arquivo de imagem válido (PNG, JPG, SVG, WebP).' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDimension = 600;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/png', 0.9);
          setLogoUrl(compressed);
          setFeedbackMessage({ type: 'success', text: 'Logotipo carregado com sucesso!' });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFeedbackMessage({ type: 'error', text: 'Informe o nome da empresa ou parceiro.' });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMessage(null);

    try {
      if (editingSponsorId) {
        const success = await updateSponsor(editingSponsorId, {
          name: name.trim(),
          category,
          logoUrl: logoUrl.trim(),
          websiteUrl: websiteUrl.trim(),
          description: description.trim(),
          sinceYear: sinceYear.trim(),
          isActive,
          order: Number(order) || 1,
        });

        if (success) {
          setFeedbackMessage({ type: 'success', text: `Apoiador "${name}" atualizado com sucesso!` });
          resetForm();
        } else {
          setFeedbackMessage({ type: 'error', text: 'Erro ao atualizar apoiador no banco de dados.' });
        }
      } else {
        const success = await addSponsor({
          name: name.trim(),
          category,
          logoUrl: logoUrl.trim(),
          websiteUrl: websiteUrl.trim(),
          description: description.trim(),
          sinceYear: sinceYear.trim(),
          isActive,
          order: Number(order) || (sponsors.length + 1),
        });

        if (success) {
          setFeedbackMessage({ type: 'success', text: `Apoiador "${name}" adicionado com sucesso!` });
          resetForm();
        } else {
          setFeedbackMessage({ type: 'error', text: 'Erro ao cadastrar apoiador no banco de dados.' });
        }
      }
    } catch {
      setFeedbackMessage({ type: 'error', text: 'Ocorreu um erro inesperado ao salvar o apoiador.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, sponsorName: string) => {
    if (window.confirm(`Tem certeza que deseja remover o apoiador/parceiro "${sponsorName}"?`)) {
      const ok = await deleteSponsor(id);
      if (ok) {
        setFeedbackMessage({ type: 'success', text: `Apoiador "${sponsorName}" removido com sucesso.` });
      }
    }
  };

  const handleToggleActive = async (item: SponsorItem) => {
    await updateSponsor(item.id, { isActive: !item.isActive });
  };

  // Filtered sponsors
  const filteredSponsors = sponsors.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'all' || s.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="admin-sponsors-tab" className="space-y-6">
      {/* Institutional Top Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#0a182e] via-[#0d2242] to-[#0a182e] border border-[#d4af37]/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f3e5ab] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-[#d4af37]" />
                Gestão Institucional de Parcerias
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                {sponsors.filter((s) => s.isActive).length} Ativos no Site
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
              Apoiadores, Patrocinadores & Empresas Parceiras
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Adicione e gerencie os logotipos das empresas e instituições que apoiam os atletas da ACEDEP na natação paralímpica. Você pode anexar fotos de logotipos do seu celular ou computador a qualquer momento.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onNavigateToPublicSponsors && (
              <button
                type="button"
                onClick={onNavigateToPublicSponsors}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Ver Aba no Site</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (isFormOpen && !editingSponsorId) {
                  setIsFormOpen(false);
                } else {
                  resetForm();
                  setIsFormOpen(true);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#b8952b] text-[#060e1c] text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#d4af37]/20 transition-all cursor-pointer"
            >
              {isFormOpen && !editingSponsorId ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Fechar Formulário</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Novo Apoiador / Anexar Logo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMessage && (
        <div className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center justify-between gap-3 ${
          feedbackMessage.type === 'success' 
            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200' 
            : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add / Edit Form Modal / Accordion */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-[#091528] border border-[#d4af37]/40 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
                <Building2 className="w-4 h-4" />
              </span>
              <h4 className="text-base font-bold text-white">
                {editingSponsorId ? 'Editar Apoiador / Atualizar Logotipo' : 'Cadastrar Novo Apoiador & Anexar Logotipo'}
              </h4>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-white/5"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Column: Data fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nome da Empresa / Entidade Parceira <span className="text-[#d4af37]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Farmácia Central, Speedo Brasil, Padaria São Paulo..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Categoria da Parceria <span className="text-[#d4af37]">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as SponsorItem['category'])}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-[#d4af37]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Parceiro Desde (Ano)
                  </label>
                  <input
                    type="text"
                    value={sinceYear}
                    onChange={(e) => setSinceYear(e.target.value)}
                    placeholder="Ex: 2024, 2025, 2026..."
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Site Oficial ou Link Social (Opcional)</span>
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://suaempresa.com.br ou instagram.com/empresa"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Descrição / Detalhes do Apoio
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Apoio com toucas e uniformes para os campeonatos estaduais e lanche dos atletas nos treinos."
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-white/20 text-[#d4af37] focus:ring-[#d4af37] bg-black/40 w-4 h-4 cursor-pointer"
                  />
                  <span>Exibir publicamente no site</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Ordem:</span>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-16 px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-white text-xs text-center focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Logo Attachment & Preview */}
            <div className="space-y-3 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Logotipo da Empresa (Anexar ou Colar Link)</span>
                  <span className="text-[11px] text-[#d4af37]">PNG, JPG, WebP</span>
                </label>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                {/* Upload Action Button */}
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:border-[#d4af37]"
                  >
                    <Upload className="w-4 h-4 text-[#d4af37]" />
                    <span>Anexar Logotipo do Computador/Celular</span>
                  </button>

                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="px-3 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold cursor-pointer"
                      title="Remover logotipo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Direct URL input fallback */}
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="Ou cole aqui a URL direta da imagem do logotipo..."
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              {/* Logo Preview Box */}
              <div className="flex-1 min-h-[170px] p-4 rounded-2xl bg-black/60 border border-dashed border-white/20 flex flex-col items-center justify-center text-center relative overflow-hidden">
                {logoUrl ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-white/90 rounded-xl inline-block max-w-[240px] max-h-[130px] shadow-md">
                      <img
                        src={logoUrl}
                        alt="Pré-visualização do Logotipo"
                        className="max-h-[100px] max-w-[200px] object-contain mx-auto"
                      />
                    </div>
                    <span className="block text-[11px] text-emerald-400 font-medium">
                      ✓ Logotipo pronto para exibição
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1 text-slate-400">
                    <ImageIcon className="w-8 h-8 text-slate-500 mx-auto stroke-1" />
                    <p className="text-xs font-medium">Nenhum logotipo anexado ainda</p>
                    <p className="text-[11px] text-slate-500">
                      O card exibirá as iniciais e o nome da empresa até que o logotipo seja anexado.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#b8952b] text-[#060e1c] text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingSponsorId ? 'Salvar Alterações' : 'Salvar e Publicar Apoiador'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#091528] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome da empresa ou descrição..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-[#d4af37]"
          >
            <option value="all">Todas as Categorias ({sponsors.length})</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat} ({sponsors.filter((s) => s.category === cat).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sponsors Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSponsors.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
              item.isActive
                ? 'bg-gradient-to-b from-[#0a1b33] to-[#071324] border-white/10 hover:border-[#d4af37]/50 shadow-md'
                : 'bg-black/40 border-white/5 opacity-60'
            }`}
          >
            <div className="space-y-3">
              {/* Header with status badge & actions */}
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#f3e5ab] text-[10px] font-bold uppercase tracking-wider">
                  {item.category}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(item)}
                    title={item.isActive ? 'Ocultar do site' : 'Publicar no site'}
                    className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                      item.isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                        : 'bg-slate-700/30 text-slate-400 border-slate-600/30 hover:text-white'
                    }`}
                  >
                    {item.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartEdit(item)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10 text-xs transition-colors cursor-pointer"
                    title="Editar informações ou trocar logotipo"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.name)}
                    className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs transition-colors cursor-pointer"
                    title="Excluir apoiador"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Logo / Thumbnail container */}
              <div className="w-full h-24 rounded-xl bg-white/95 flex items-center justify-center p-3 overflow-hidden shadow-inner border border-white/30">
                {item.logoUrl ? (
                  <img
                    src={item.logoUrl}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest block">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Espaço Reservado para Logotipo
                    </span>
                  </div>
                )}
              </div>

              {/* Company Info */}
              <div>
                <h4 className="text-sm font-bold text-white leading-snug">
                  {item.name}
                </h4>
                {item.sinceYear && (
                  <span className="text-[11px] text-[#d4af37] font-medium block mt-0.5">
                    Parceiro desde {item.sinceYear}
                  </span>
                )}
                {item.description && (
                  <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </div>

            {/* Footer with website link and upload shortcut */}
            <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-xs">
              {item.websiteUrl ? (
                <a
                  href={item.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium text-[11px]"
                >
                  <Globe className="w-3 h-3" />
                  <span>Acessar Site</span>
                  <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                </a>
              ) : (
                <span className="text-slate-500 text-[11px]">Sem site cadastrado</span>
              )}

              <button
                type="button"
                onClick={() => handleStartEdit(item)}
                className="text-[#d4af37] hover:underline text-[11px] font-semibold cursor-pointer"
              >
                {item.logoUrl ? 'Alterar Logo' : '+ Anexar Logo'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSponsors.length === 0 && (
        <div className="p-8 rounded-3xl bg-[#091528] border border-white/10 text-center space-y-3">
          <HeartHandshake className="w-10 h-10 text-slate-500 mx-auto" />
          <h4 className="text-sm font-bold text-white">Nenhum apoiador encontrado</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchTerm || selectedCategoryFilter !== 'all'
              ? 'Tente ajustar os filtros de busca para encontrar o apoiador desejado.'
              : 'Clique no botão "+ Novo Apoiador / Anexar Logo" acima para cadastrar a primeira empresa ou parceiro oficial da ACEDEP.'}
          </p>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#d4af37] hover:bg-[#b8952b] text-[#060e1c] text-xs font-bold transition-all shadow"
          >
            Cadastrar Apoiador Agora
          </button>
        </div>
      )}
    </div>
  );
};
