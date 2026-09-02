import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  Upload, 
  Check, 
  AlertCircle, 
  Database, 
  Sparkles, 
  Image as ImageIcon, 
  RotateCcw, 
  X, 
  KeyRound, 
  ShieldCheck, 
  LogOut, 
  CheckCircle2, 
  RefreshCw,
  Eye,
  Images,
  Trash2,
  Plus,
  Tag
} from 'lucide-react';
import { usePhotos, DEFAULT_PHOTOS, GalleryPhotoItem } from '../context/PhotosContext';

export const AdminPhotoManagerModal: React.FC = () => {
  const {
    adminModalOpen,
    closeAdminModal,
    isAdminAuthenticated,
    loginAdmin,
    logoutAdmin,
    photos,
    galleryPhotos,
    savePhotoToDatabase,
    resetPhotoToDefault,
    addGalleryPhoto,
    deleteGalleryPhoto,
    updateAdminPin,
    isFirebaseConnected
  } = usePhotos();

  const [activeTab, setActiveTab] = useState<'site' | 'gallery' | 'security'>('site');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string>('about_team');
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});
  const [successState, setSuccessState] = useState<Record<string, string>>({});
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [previewOverride, setPreviewOverride] = useState<Record<string, string>>({});

  // New Gallery Photo form state
  const [newGalTitle, setNewGalTitle] = useState('');
  const [newGalCategory, setNewGalCategory] = useState('Equipe Oficial');
  const [newGalDate, setNewGalDate] = useState('');
  const [newGalUrl, setNewGalUrl] = useState('');
  const [newGalPreview, setNewGalPreview] = useState('');
  const [isSavingGallery, setIsSavingGallery] = useState(false);
  const [gallerySuccess, setGallerySuccess] = useState('');
  const [galleryError, setGalleryError] = useState('');
  const [confirmDeleteGalleryId, setConfirmDeleteGalleryId] = useState<string | null>(null);
  const [isDeletingGalleryId, setIsDeletingGalleryId] = useState<string | null>(null);
  const [confirmResetId, setConfirmResetId] = useState<string | null>(null);

  // Security & Custom PIN state
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [isSavingPin, setIsSavingPin] = useState(false);
  const [pinSuccess, setPinSuccess] = useState('');
  const [pinFormError, setPinFormError] = useState('');

  if (!adminModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(false);
    const success = await loginAdmin(pinInput);
    if (!success) {
      setPinError(true);
    } else {
      setPinInput('');
    }
  };

  const handleFileChange = (photoId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setPreviewOverride((prev) => ({ ...prev, [photoId]: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (photoId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setPreviewOverride((prev) => ({ ...prev, [photoId]: dataUrl }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveToFirestore = async (photoId: string) => {
    const imageToSave = previewOverride[photoId] || customUrlInput.trim();
    if (!imageToSave) return;

    setUploadingState((prev) => ({ ...prev, [photoId]: true }));
    const success = await savePhotoToDatabase(photoId, imageToSave, DEFAULT_PHOTOS[photoId]?.title);
    setUploadingState((prev) => ({ ...prev, [photoId]: false }));

    if (success) {
      setSuccessState((prev) => ({ ...prev, [photoId]: 'Salvo com sucesso no Firestore!' }));
      setPreviewOverride((prev) => {
        const copy = { ...prev };
        delete copy[photoId];
        return copy;
      });
      setCustomUrlInput('');
      setTimeout(() => {
        setSuccessState((prev) => ({ ...prev, [photoId]: '' }));
      }, 4000);
    }
  };

  const handleResetExecute = async (photoId: string) => {
    setUploadingState((prev) => ({ ...prev, [photoId]: true }));
    setConfirmResetId(null);
    await resetPhotoToDefault(photoId);
    setPreviewOverride((prev) => {
      const copy = { ...prev };
      delete copy[photoId];
      return copy;
    });
    setUploadingState((prev) => ({ ...prev, [photoId]: false }));
    setSuccessState((prev) => ({ ...prev, [photoId]: 'Restaurada para o padrão!' }));
    setTimeout(() => {
      setSuccessState((prev) => ({ ...prev, [photoId]: '' }));
    }, 4000);
  };

  // Gallery photo upload handler
  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setNewGalPreview(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddGalleryPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGalleryError('');
    const finalUrl = newGalPreview || newGalUrl.trim();
    if (!finalUrl) {
      setGalleryError('Por favor, selecione uma foto ou informe o link da imagem.');
      setTimeout(() => setGalleryError(''), 5000);
      return;
    }

    setIsSavingGallery(true);
    const success = await addGalleryPhoto({
      title: newGalTitle.trim() || 'Foto ACEDEP',
      category: newGalCategory,
      url: finalUrl,
      date: newGalDate.trim() || new Date().toLocaleDateString('pt-BR'),
    });
    setIsSavingGallery(false);

    if (success) {
      setGallerySuccess('Foto adicionada com sucesso à galeria!');
      setNewGalTitle('');
      setNewGalUrl('');
      setNewGalPreview('');
      setNewGalDate('');
      setTimeout(() => setGallerySuccess(''), 4000);
    }
  };

  const handleUpdatePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinFormError('');
    setPinSuccess('');

    const cleanNew = newPinInput.trim();
    if (cleanNew.length < 4) {
      setPinFormError('A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }

    if (cleanNew !== confirmPinInput.trim()) {
      setPinFormError('A confirmação de senha não confere com a nova senha digitada.');
      return;
    }

    setIsSavingPin(true);
    const success = await updateAdminPin(cleanNew);
    setIsSavingPin(false);

    if (success) {
      setPinSuccess('Sua nova senha de administrador foi gravada com sucesso no Firebase!');
      setNewPinInput('');
      setConfirmPinInput('');
      setTimeout(() => setPinSuccess(''), 6000);
    } else {
      setPinFormError('Não foi possível gravar a nova senha no banco de dados. Tente novamente.');
    }
  };

  const executeDeleteGalleryPhoto = async (photo: GalleryPhotoItem) => {
    setIsDeletingGalleryId(photo.id);
    const success = await deleteGalleryPhoto(photo.id);
    setIsDeletingGalleryId(null);
    setConfirmDeleteGalleryId(null);

    if (success) {
      setGallerySuccess(`Foto "${photo.title}" excluída com sucesso da galeria!`);
      setTimeout(() => setGallerySuccess(''), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-[#060e1c] border border-[#1e3a5f] rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e3a5f]/80 bg-[#0a192f]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-serif flex items-center gap-2">
                Painel de Gestão de Fotos • ACEDEP
                <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f3e5ab] border border-[#d4af37]/40">
                  Firebase Ativo
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Gerencie as fotos das seções e a nova Galeria de Fotos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminAuthenticated && (
              <button
                onClick={logoutAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer"
                title="Encerrar sessão de administrador"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            )}
            <button
              onClick={closeAdminModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {!isAdminAuthenticated ? (
            /* PIN Login Form */
            <div className="max-w-md mx-auto py-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#d4af37]/10 border-2 border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white font-serif mb-2">
                Acesso Restrito à Coordenação
              </h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Insira a senha de administrador da ACEDEP para gerenciar fotos principais e a galeria no banco de dados.
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={pinInput}
                      onChange={(e) => {
                        setPinInput(e.target.value);
                        setPinError(false);
                      }}
                      placeholder="Digite a senha de administrador"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-[#1e3a5f] text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                      autoFocus
                    />
                  </div>
                  {pinError && (
                    <p className="text-xs text-red-400 mt-2 flex items-center justify-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Senha incorreta. Verifique e tente novamente.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8952b] text-[#060e1c] font-bold text-sm hover:brightness-110 transition-all shadow-lg cursor-pointer"
                >
                  Entrar no Painel de Fotos
                </button>
              </form>
            </div>
          ) : (
            /* Admin Management Interface */
            <div className="space-y-6">
              
              {/* Status Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0a192f] border border-[#1e3a5f]">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-slate-200">
                    Banco de Dados Firebase Firestore Ativo
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">Sincronização em tempo real</span>
                </div>
                <div className="text-[11px] text-[#f3e5ab] font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Sessão de Administrador Ativa</span>
                </div>
              </div>

              {/* Top Navigation Mode Tabs */}
              <div className="flex flex-wrap sm:flex-nowrap gap-2 p-1 bg-black/40 rounded-xl border border-[#1e3a5f]">
                <button
                  onClick={() => setActiveTab('site')}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'site'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Fotos das Seções</span>
                </button>

                <button
                  onClick={() => setActiveTab('gallery')}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'gallery'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Images className="w-4 h-4" />
                  <span>Galeria de Fotos ({galleryPhotos.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'security'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Segurança & Senha</span>
                </button>
              </div>

              {activeTab === 'site' ? (
                /* TAB 1: Site Main Sections Photos */
                <div className="space-y-6">
                  {/* Section Selector Tabs */}
                  <div className="flex flex-wrap gap-2 border-b border-[#1e3a5f] pb-3">
                    {Object.keys(DEFAULT_PHOTOS).map((photoKey) => {
                      const meta = DEFAULT_PHOTOS[photoKey];
                      const isSelected = selectedPhotoId === photoKey;
                      return (
                        <button
                          key={photoKey}
                          onClick={() => {
                            setSelectedPhotoId(photoKey);
                            setCustomUrlInput('');
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                            isSelected
                              ? 'bg-[#d4af37] text-[#060e1c] shadow-lg'
                              : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                          }`}
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>{meta.title}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Section Editor Card */}
                  {selectedPhotoId && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#0a192f]/60 p-5 rounded-2xl border border-[#1e3a5f]">
                      
                      {/* Left Column: Live Preview */}
                      <div className="md:col-span-5 space-y-2">
                        <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                          <span>Visualização Atual</span>
                          {previewOverride[selectedPhotoId] && (
                            <span className="text-[10px] text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/30">
                              Prévia não salva
                            </span>
                          )}
                        </label>

                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/60 border border-[#1e3a5f] group shadow-inner">
                          <img
                            src={previewOverride[selectedPhotoId] || photos[selectedPhotoId] || DEFAULT_PHOTOS[selectedPhotoId]?.defaultUrl}
                            alt="Prévia da foto"
                            className="w-full h-full object-cover object-center"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                          
                          <div className="absolute bottom-2 left-2 right-2 p-2 rounded-lg bg-black/60 backdrop-blur-sm text-[11px] text-slate-300">
                            <span className="font-bold text-[#f3e5ab] block">
                              {DEFAULT_PHOTOS[selectedPhotoId]?.title}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Seção: {DEFAULT_PHOTOS[selectedPhotoId]?.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Upload & Actions */}
                      <div className="md:col-span-7 space-y-4 flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white mb-1">
                            Atualizar Foto desta Seção
                          </h4>
                          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                            Envie a foto do seu dispositivo. Ao salvar, ela será atualizada no <strong>Firebase Firestore</strong> instantaneamente para todos os visitantes.
                          </p>

                          {/* Dropzone & File Input */}
                          <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(selectedPhotoId, e)}
                            className="p-6 rounded-xl border-2 border-dashed border-[#1e3a5f] hover:border-[#d4af37] bg-black/40 text-center transition-colors mb-4"
                          >
                            <Upload className="w-8 h-8 mx-auto text-[#d4af37] mb-2" />
                            <p className="text-xs font-semibold text-white mb-1">
                              Arraste e solte a nova foto aqui
                            </p>
                            <p className="text-[11px] text-slate-400 mb-3">
                              ou clique no botão abaixo para escolher
                            </p>

                            <input
                              type="file"
                              id={`file-input-${selectedPhotoId}`}
                              accept="image/*"
                              onChange={(e) => handleFileChange(selectedPhotoId, e)}
                              className="sr-only"
                            />
                            <label
                              htmlFor={`file-input-${selectedPhotoId}`}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-[#d4af37] text-white hover:text-[#060e1c] text-xs font-bold transition-all border border-white/20 hover:border-[#d4af37] cursor-pointer shadow"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>Selecionar Imagem...</span>
                            </label>
                          </div>

                          {/* Optional URL input */}
                          <div className="space-y-1">
                            <label className="text-[11px] text-slate-400 block font-medium">
                              Ou digite o link direto de uma imagem (URL):
                            </label>
                            <input
                              type="url"
                              value={customUrlInput}
                              onChange={(e) => {
                                setCustomUrlInput(e.target.value);
                                if (e.target.value) {
                                  setPreviewOverride((prev) => ({ ...prev, [selectedPhotoId]: e.target.value }));
                                }
                              }}
                              placeholder="https://exemplo.com/minha-foto.jpg"
                              className="w-full px-3 py-2 text-xs rounded-lg bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                            />
                          </div>
                        </div>

                        {/* Feedback Messages */}
                        {successState[selectedPhotoId] && (
                          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{successState[selectedPhotoId]}</span>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#1e3a5f]">
                          {confirmResetId === selectedPhotoId ? (
                            <div className="flex items-center gap-2 bg-amber-950/80 border border-amber-500/50 px-3 py-1.5 rounded-xl">
                              <span className="text-[11px] text-amber-200 font-semibold">Restaurar original?</span>
                              <button
                                type="button"
                                onClick={() => handleResetExecute(selectedPhotoId)}
                                className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-[#060e1c] font-bold text-xs cursor-pointer transition-colors"
                              >
                                Sim
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmResetId(null)}
                                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 font-semibold text-xs cursor-pointer transition-colors"
                              >
                                Não
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmResetId(selectedPhotoId)}
                              disabled={uploadingState[selectedPhotoId]}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restaurar Padrão</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleSaveToFirestore(selectedPhotoId)}
                            disabled={
                              uploadingState[selectedPhotoId] ||
                              (!previewOverride[selectedPhotoId] && !customUrlInput.trim())
                            }
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] transition-all shadow-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {uploadingState[selectedPhotoId] ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Gravando no Banco...</span>
                              </>
                            ) : (
                              <>
                                <Database className="w-3.5 h-3.5" />
                                <span>Salvar no Banco de Dados</span>
                              </>
                            )}
                          </button>
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              ) : activeTab === 'gallery' ? (
                /* TAB 2: Gallery Photos Manager */
                <div className="space-y-6">
                  
                  {/* Add New Gallery Photo Card */}
                  <form 
                    onSubmit={handleAddGalleryPhotoSubmit}
                    className="p-5 rounded-2xl bg-[#0a192f]/80 border border-[#1e3a5f] space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-[#1e3a5f] pb-3">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Plus className="w-4 h-4 text-[#d4af37]" />
                        Adicionar Nova Foto na Galeria
                      </h4>
                      <span className="text-[11px] text-slate-400">Salvo diretamente no Firestore</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Photo inputs */}
                      <div className="md:col-span-8 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-slate-300 block mb-1">
                              Título / Descrição da Foto *
                            </label>
                            <input
                              type="text"
                              required
                              value={newGalTitle}
                              onChange={(e) => setNewGalTitle(e.target.value)}
                              placeholder="Ex: Treino da equipe nas piscinas"
                              className="w-full px-3 py-2 text-xs rounded-lg bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-slate-300 block mb-1">
                              Categoria *
                            </label>
                            <select
                              value={newGalCategory}
                              onChange={(e) => setNewGalCategory(e.target.value)}
                              className="w-full px-3 py-2 text-xs rounded-lg bg-[#060e1c] border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                            >
                              <option value="Equipe Oficial">Equipe Oficial</option>
                              <option value="Iniciação Esportiva">Iniciação Esportiva</option>
                              <option value="Alto Rendimento">Alto Rendimento</option>
                              <option value="Competições">Competições</option>
                              <option value="Treinamento">Treinamento</option>
                              <option value="Comunidade ACEDEP">Comunidade ACEDEP</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-slate-300 block mb-1">
                              Data / Evento (opcional)
                            </label>
                            <input
                              type="text"
                              value={newGalDate}
                              onChange={(e) => setNewGalDate(e.target.value)}
                              placeholder="Ex: Campeonato Paulista 2026"
                              className="w-full px-3 py-2 text-xs rounded-lg bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-slate-300 block mb-1">
                              Ou Link da Imagem (URL)
                            </label>
                            <input
                              type="url"
                              value={newGalUrl}
                              onChange={(e) => setNewGalUrl(e.target.value)}
                              placeholder="https://exemplo.com/foto.jpg"
                              className="w-full px-3 py-2 text-xs rounded-lg bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                            />
                          </div>
                        </div>

                        {/* File Upload Selector */}
                        <div>
                          <input
                            type="file"
                            id="gallery-file-upload"
                            accept="image/*"
                            onChange={handleGalleryFileChange}
                            className="sr-only"
                          />
                          <label
                            htmlFor="gallery-file-upload"
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-[#d4af37] text-slate-300 hover:text-[#060e1c] text-xs font-semibold transition-all border border-white/10 hover:border-[#d4af37] cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Carregar foto do seu computador / celular</span>
                          </label>
                        </div>
                      </div>

                      {/* Photo preview box */}
                      <div className="md:col-span-4 flex flex-col items-center justify-center p-3 rounded-xl bg-black/40 border border-[#1e3a5f]">
                        {newGalPreview || newGalUrl ? (
                          <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-[#d4af37]/40">
                            <img
                              src={newGalPreview || newGalUrl}
                              alt="Prévia"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="text-center py-6 text-slate-500">
                            <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                            <span className="text-[10px]">Nenhuma foto selecionada</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {galleryError && (
                      <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{galleryError}</span>
                      </div>
                    )}

                    {gallerySuccess && (
                      <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{gallerySuccess}</span>
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isSavingGallery || (!newGalPreview && !newGalUrl.trim())}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] transition-all shadow cursor-pointer disabled:opacity-40"
                      >
                        {isSavingGallery ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Salvando na Galeria...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Adicionar à Galeria</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* List of existing gallery photos with delete option */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                      <span>Fotos Atuais na Galeria ({galleryPhotos.length})</span>
                      <span className="text-[10px] text-slate-400 font-normal">Clique no ícone de lixeira para remover</span>
                    </h4>

                    {galleryPhotos.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-[#0a192f]/40 border border-dashed border-[#1e3a5f] text-center text-slate-400">
                        <Images className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                        <p className="text-xs font-semibold text-slate-300">Nenhuma foto na galeria no momento.</p>
                        <p className="text-[11px] text-slate-500 mt-1">Adicione novas fotos usando o formulário acima.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {galleryPhotos.map((photo) => {
                          const isConfirming = confirmDeleteGalleryId === photo.id;
                          const isDeleting = isDeletingGalleryId === photo.id;

                          return (
                            <div
                              key={photo.id}
                              className="relative rounded-xl overflow-hidden bg-[#0a192f] border border-white/10 p-2.5 flex gap-3 items-center group transition-all hover:border-[#1e3a5f]"
                            >
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-black shrink-0 border border-white/10">
                                <img
                                  src={photo.url}
                                  alt={photo.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#d4af37]/20 text-[#f3e5ab] font-semibold">
                                  {photo.category}
                                </span>
                                <h5 className="text-xs font-bold text-white truncate mt-1">
                                  {photo.title}
                                </h5>
                                {photo.date && (
                                  <p className="text-[10px] text-slate-400 truncate">
                                    {photo.date}
                                  </p>
                                )}
                              </div>

                              {isConfirming ? (
                                <div className="flex flex-col gap-1 shrink-0 bg-red-950/90 border border-red-500/60 p-1.5 rounded-lg z-10">
                                  <span className="text-[9px] text-red-200 font-bold text-center">Excluir?</span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      disabled={isDeleting}
                                      onClick={() => executeDeleteGalleryPhoto(photo)}
                                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold cursor-pointer transition-colors shadow"
                                    >
                                      {isDeleting ? '...' : 'Sim'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteGalleryId(null)}
                                      className="px-2 py-1 bg-white/10 hover:bg-white/20 text-slate-300 rounded text-[10px] font-semibold cursor-pointer transition-colors"
                                    >
                                      Não
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteGalleryId(photo.id)}
                                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 transition-colors cursor-pointer shrink-0"
                                  title="Remover foto da galeria"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                /* TAB 3: Security & Custom Password Management */
                <div className="space-y-6">
                  
                  {/* Change Password Card */}
                  <form 
                    onSubmit={handleUpdatePinSubmit}
                    className="p-6 rounded-2xl bg-[#0a192f]/80 border border-[#1e3a5f] space-y-4"
                  >
                    <div className="flex items-center gap-3 border-b border-[#1e3a5f] pb-3">
                      <div className="p-2 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          Alterar Senha do Administrador
                        </h4>
                        <p className="text-xs text-slate-400">
                          Defina sua senha pessoal e exclusiva para gerenciar as fotos do site.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                          Nova Senha *
                        </label>
                        <input
                          type="password"
                          required
                          value={newPinInput}
                          onChange={(e) => {
                            setNewPinInput(e.target.value);
                            setPinFormError('');
                          }}
                          placeholder="Mínimo de 4 caracteres"
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                          Confirmar Nova Senha *
                        </label>
                        <input
                          type="password"
                          required
                          value={confirmPinInput}
                          onChange={(e) => {
                            setConfirmPinInput(e.target.value);
                            setPinFormError('');
                          }}
                          placeholder="Repita a nova senha"
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                    </div>

                    {pinFormError && (
                      <p className="text-xs text-red-400 flex items-center gap-1.5 pt-1">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{pinFormError}</span>
                      </p>
                    )}

                    {pinSuccess && (
                      <p className="text-xs text-emerald-400 flex items-center gap-1.5 pt-1">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{pinSuccess}</span>
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-[11px] text-slate-400">
                        🔒 Ao salvar, a senha padrão será desativada e apenas sua nova senha funcionará.
                      </p>
                      <button
                        type="submit"
                        disabled={isSavingPin}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] transition-all shadow-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isSavingPin ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Gravando no Firebase...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Salvar Nova Senha</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Secret Access Guide for the Admin */}
                  <div className="p-6 rounded-2xl bg-[#0a192f]/40 border border-[#1e3a5f]/60 space-y-4">
                    <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Como Acessar Este Painel Secretamente (Apenas Para Você)
                    </h4>
                    
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Para que terceiros e visitantes não saibam da existência da área de fotos, todos os botões públicos foram ocultados. Você pode abrir este painel a qualquer momento usando qualquer um dos métodos abaixo:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center text-[10px]">1</span>
                          Atalho de Teclado
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Pressione <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[#f3e5ab] font-mono text-[10px]">Ctrl + Shift + A</kbd> (ou <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[#f3e5ab] font-mono text-[10px]">Cmd + Shift + A</kbd>) em qualquer página.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center text-[10px]">2</span>
                          Link com #admin
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Adicione <code className="text-[#f3e5ab] font-mono text-[10px]">#admin</code> ao final da URL do site na barra de endereços.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center text-[10px]">3</span>
                          Clique no Símbolo ©
                        </div>
                        <p className="text-[11px] text-slate-400">
                          No rodapé da página, clique no símbolo de copyright <span className="text-[#d4af37] font-bold">©</span> antes do ano 1990.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center text-[10px]">4</span>
                          Duplo Clique no Logotipo
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Dê um duplo clique no logotipo da ACEDEP no cabeçalho superior.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#030712] border-t border-[#1e3a5f] text-center text-[11px] text-slate-500">
          Associação Cultural Especial Paradesportiva Paulista • Sistema de Banco de Dados Oficial Firebase Firestore
        </div>
      </div>
    </div>
  );
};
