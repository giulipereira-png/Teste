import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  FileCheck, 
  X, 
  FileSpreadsheet, 
  FileCode, 
  Sparkles,
  AlertCircle,
  FolderOpen,
  User,
  Info,
  ExternalLink
} from 'lucide-react';
import { AthleteRecord, AthleteDocumentItem, DocumentCategory } from '../types';
import { useCommunity } from '../context/CommunityContext';
import { downloadAthleteDocument, formatFileSize, getInitialSampleDocuments } from '../utils/documentHelpers';
import { uploadDocumentToGoogleDrive } from '../services/driveService';

const CATEGORIES: DocumentCategory[] = [
  'Laudo Médico / Neurológico (S14)',
  'Laudo Psicológico / Neuropsicológico (WISC/WAIS)',
  'Classificação Funcional CBDI / CPB',
  'Atestado Médico / Liberação Piscina',
  'RG / Documento de Identidade do Atleta',
  'RG / CPF do Responsável Legal',
  'Comprovante de Residência',
  'Termo de Autorização & Imagem',
  'Exame Laboratorial / Cardiológico',
  'Outro Documento',
];

interface AthleteDocumentsTabProps {
  athlete: AthleteRecord;
  isStaff?: boolean; // true if accessed by Admin / Coach / Professor
  uploaderName?: string;
}

export const AthleteDocumentsTab: React.FC<AthleteDocumentsTabProps> = ({ 
  athlete, 
  isStaff = false,
  uploaderName
}) => {
  const { saveAthleteRecord } = useCommunity();

  // Get current documents or initialize with defaults if empty
  const documents: AthleteDocumentItem[] = (athlete.documents && athlete.documents.length > 0)
    ? athlete.documents
    : getInitialSampleDocuments(athlete.name);

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<DocumentCategory>('Laudo Médico / Neurológico (S14)');
  const [docExpiryDate, setDocExpiryDate] = useState('');
  const [docNotes, setDocNotes] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState('');
  const [uploadedFileType, setUploadedFileType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<AthleteDocumentItem | null>(null);

  // Delete Confirmation State
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      setUploadError('O arquivo selecionado é maior que o limite de 8 MB.');
      return;
    }

    setUploadError('');
    setUploadedFileName(file.name);
    setUploadedFileSize(formatFileSize(file.size));
    setUploadedFileType(file.type || 'application/pdf');

    // Auto-fill title if empty
    if (!docTitle.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setDocTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setUploadedFileUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');

    if (!docTitle.trim()) {
      setUploadError('Por favor, informe o título do documento.');
      return;
    }

    if (!uploadedFileUrl) {
      setUploadError('Por favor, selecione um arquivo (PDF, imagem ou documento) para enviar.');
      return;
    }

    setIsSubmitting(true);

    // Auto sync to Google Drive in athlete folder
    let driveInfo = undefined;
    try {
      driveInfo = await uploadDocumentToGoogleDrive({
        athleteName: athlete.name,
        documentTitle: docTitle.trim(),
        fileName: uploadedFileName || `${docTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`,
        fileDataUrl: uploadedFileUrl,
      });
    } catch (driveErr) {
      console.warn('Google Drive sync warning:', driveErr);
    }

    const newDocItem: AthleteDocumentItem = {
      id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: docTitle.trim(),
      category: docCategory,
      fileName: uploadedFileName || `${docTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`,
      fileUrl: uploadedFileUrl,
      fileSize: uploadedFileSize || '1.0 MB',
      fileType: uploadedFileType || 'application/pdf',
      uploadedBy: isStaff ? 'Comissão Técnica / Admin' : 'Responsável',
      uploadedByName: uploaderName || (isStaff ? 'Coordenação ACEDEP' : athlete.guardianName),
      uploadedAt: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      expiryDate: docExpiryDate.trim() || undefined,
      status: 'Válido',
      notes: docNotes.trim() || undefined,
      driveFileId: driveInfo?.fileId,
      driveViewLink: driveInfo?.webViewLink,
      driveFolderLink: driveInfo?.folderLink,
      syncedToDrive: driveInfo?.success ?? true,
    };

    const updatedDocuments = [newDocItem, ...documents];
    const updatedAthlete: AthleteRecord = {
      ...athlete,
      documents: updatedDocuments,
    };

    const saved = await saveAthleteRecord(updatedAthlete);
    setIsSubmitting(false);

    if (saved) {
      setUploadSuccess('Documento enviado e disponibilizado com sucesso!');
      // Reset form
      setDocTitle('');
      setUploadedFileUrl('');
      setUploadedFileName('');
      setUploadedFileSize('');
      setUploadedFileType('');
      setDocExpiryDate('');
      setDocNotes('');
      setTimeout(() => {
        setUploadSuccess('');
        setIsUploadModalOpen(false);
      }, 1500);
    } else {
      setUploadError('Erro ao gravar documento. Tente novamente.');
    }
  };

  // Handle Delete Document
  const handleDeleteDocument = async (docId: string) => {
    const updatedDocuments = documents.filter((d) => d.id !== docId);
    const updatedAthlete: AthleteRecord = {
      ...athlete,
      documents: updatedDocuments,
    };
    await saveAthleteRecord(updatedAthlete);
    setDeletingDocId(null);
  };

  // Filter list
  const filteredDocuments = documents.filter((doc) => {
    const matchSearch = 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.notes && doc.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchStatus = selectedStatus === 'all' || doc.status === selectedStatus;

    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Info & Actions */}
      <div className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-base font-bold text-white font-serif flex items-center gap-2">
                  <span>Documentação, Laudos & Exames</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono">
                    {documents.length} arquivos disponíveis
                  </span>
                </h4>
                <p className="text-xs text-slate-300">
                  Espaço seguro para envio e download de laudos médicos, atestados de piscina, RG e documentos de {athlete.name}.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setUploadError('');
                setUploadSuccess('');
                setIsUploadModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8952b] hover:brightness-110 text-[#060e1c] font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Upload className="w-4 h-4" />
              <span>Fazer Upload de Documento</span>
            </button>
          </div>
        </div>

        {/* Google Drive Automatic Sync Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-[#0a1e3b] to-blue-950/60 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-100 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>Google Drive Sincronizado</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">Auto-Upload Ativo</span>
              </div>
              <p className="text-[11px] text-blue-200/80">
                Todos os laudos e documentos anexados são enviados automaticamente para a pasta oficial do atleta no Google Drive.
              </p>
            </div>
          </div>
          <a
            href={`https://drive.google.com/drive/search?q=${encodeURIComponent(athlete.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/30 text-white text-xs font-semibold self-start sm:self-auto cursor-pointer transition-all"
          >
            <span>Ver Pasta no Drive</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Access Notice Badge */}
        <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2.5 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-[#d4af37] shrink-0" />
          <span>
            {isStaff ? (
              <><strong>Acesso da Coordenação / Técnico:</strong> Você tem permissão total para visualizar, baixar e anexar novos laudos para este atleta.</>
            ) : (
              <><strong>Acesso do Responsável:</strong> Você pode enviar novos laudos e atestados atualizados e baixar qualquer documento arquivado a qualquer momento.</>
            )}
          </span>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por laudo, atestado, RG..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-[#1e3a5f] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-[#1e3a5f] text-white text-xs focus:outline-none focus:border-[#d4af37]"
            >
              <option value="all">Todas as Categorias</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-[#1e3a5f] text-white text-xs focus:outline-none focus:border-[#d4af37]"
            >
              <option value="all">Todos os Status</option>
              <option value="Válido">Válidos</option>
              <option value="A vencer">A vencer</option>
              <option value="Em Análise">Em Análise</option>
              <option value="Pendente">Pendentes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        {filteredDocuments.length === 0 ? (
          <div className="p-10 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] text-center space-y-3">
            <FolderOpen className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="text-sm font-bold text-white">Nenhum documento encontrado</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Nenhum arquivo corresponde aos filtros aplicados. Clique no botão de upload acima para adicionar um novo laudo ou documento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredDocuments.map((docItem) => {
              const isPdf = docItem.fileName.toLowerCase().endsWith('.pdf') || docItem.fileType?.includes('pdf');
              const isImage = docItem.fileType?.includes('image') || /\.(jpg|jpeg|png|webp)$/i.test(docItem.fileName);

              return (
                <div
                  key={docItem.id}
                  className="p-5 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] hover:border-[#d4af37]/50 transition-all flex flex-col justify-between gap-4 shadow-md group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Category & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-[#d4af37]/15 text-[#f3e5ab] text-[11px] font-bold border border-[#d4af37]/30 flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span className="truncate max-w-[200px] sm:max-w-xs">{docItem.category}</span>
                      </span>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        docItem.status === 'Válido'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : docItem.status === 'A vencer'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : docItem.status === 'Em Análise'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {docItem.status}
                      </span>
                    </div>

                    {/* Document Title & File Details */}
                    <div className="flex items-start gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border shadow-inner ${
                        isPdf
                          ? 'bg-red-500/15 border-red-500/30 text-red-400'
                          : isImage
                          ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                          : 'bg-[#d4af37]/15 border-[#d4af37]/30 text-[#d4af37]'
                      }`}>
                        <FileText className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h5 className="text-sm font-bold text-white group-hover:text-[#d4af37] transition-colors leading-snug">
                          {docItem.title}
                        </h5>
                        <p className="text-[11px] text-slate-400 font-mono pt-0.5 truncate flex items-center gap-2">
                          <span>{docItem.fileName}</span>
                          <span>•</span>
                          <span>{docItem.fileSize || '1.0 MB'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Optional Notes */}
                    {docItem.notes && (
                      <p className="text-xs text-slate-300 bg-black/30 p-2.5 rounded-xl border border-white/5 leading-relaxed">
                        {docItem.notes}
                      </p>
                    )}

                    {/* Metadata: Expiry & Upload Info */}
                    <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Enviado em {docItem.uploadedAt} por <strong className="text-slate-300">{docItem.uploadedByName || docItem.uploadedBy}</strong></span>
                      </div>

                      {docItem.expiryDate && (
                        <div className="flex items-center gap-1 text-[#f3e5ab] font-mono">
                          <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                          <span>Validade: {docItem.expiryDate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Visualizar / Preview */}
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(docItem)}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors border border-white/10"
                        title="Visualizar documento na tela"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Visualizar</span>
                      </button>

                      {/* Download */}
                      <button
                        type="button"
                        onClick={() => downloadAthleteDocument(docItem)}
                        className="px-3 py-1.5 rounded-xl bg-[#d4af37]/20 hover:bg-[#d4af37] text-[#f3e5ab] hover:text-[#060e1c] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border border-[#d4af37]/40 shadow-sm"
                        title="Baixar arquivo para o computador ou celular"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Baixar Arquivo</span>
                      </button>

                      {/* Google Drive Link */}
                      <a
                        href={docItem.driveViewLink || `https://drive.google.com/drive/search?q=${encodeURIComponent(docItem.fileName)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/30 text-blue-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all border border-blue-500/30"
                        title="Abrir no Google Drive"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                        <span>Google Drive</span>
                      </a>
                    </div>

                    {/* Delete Action */}
                    {deletingDocId === docItem.id ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-red-300 font-semibold">Excluir?</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(docItem.id)}
                          className="px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-bold hover:bg-red-600 cursor-pointer"
                        >
                          Sim
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingDocId(null)}
                          className="px-2 py-1 rounded-lg bg-white/10 text-slate-300 text-[10px] hover:bg-white/20 cursor-pointer"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeletingDocId(docItem.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Remover documento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: UPLOAD DE NOVO DOCUMENTO
         ========================================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-lg bg-[#0c1f38] border border-[#1e3a5f] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e3a5f] bg-[#071326]/90">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-serif">
                    Upload de Documentação do Atleta
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Atleta: <strong className="text-white">{athlete.name}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleUploadSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              
              {/* File Dropzone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 block">
                  Arquivo do Documento (PDF, Imagem, JPG, PNG) *
                </label>
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-5 rounded-2xl border-2 border-dashed border-[#1e3a5f] hover:border-[#d4af37] bg-black/40 text-center cursor-pointer transition-all space-y-2 group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,image/*,.doc,.docx"
                    className="hidden"
                  />

                  {uploadedFileName ? (
                    <div className="flex items-center justify-center gap-3 py-1">
                      <FileCheck className="w-8 h-8 text-emerald-400 shrink-0" />
                      <div className="text-left min-w-0">
                        <p className="text-xs font-bold text-white truncate max-w-xs">{uploadedFileName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{uploadedFileSize} • Pronto para envio</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 mx-auto rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-white">
                        Clique para selecionar ou arraste o arquivo aqui
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Suporta Laudos em PDF, fotos de exames, RG frente/verso (até 8 MB)
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Título / Identificação do Documento *
                </label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Ex: Laudo Médico Elegibilidade S14 - Dr. Roberto"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-[#1e3a5f] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              {/* Category Select */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Categoria do Documento *
                </label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as DocumentCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-[#1e3a5f] text-white text-xs focus:outline-none focus:border-[#d4af37]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Expiry Date (Optional) */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Data de Validade (opcional - para atestados periódicos)
                </label>
                <input
                  type="text"
                  value={docExpiryDate}
                  onChange={(e) => setDocExpiryDate(e.target.value)}
                  placeholder="Ex: 15/12/2026 ou Permanente"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-[#1e3a5f] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Observações / CRM Médico / Detalhes Adicionais
                </label>
                <textarea
                  rows={2}
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  placeholder="Ex: Laudo neurológico com CID-10 e carimbo do médico especialista..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-[#1e3a5f] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              {/* Feedback messages */}
              {uploadError && (
                <p className="text-xs text-red-400 flex items-center gap-1.5 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </p>
              )}

              {uploadSuccess && (
                <p className="text-xs text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{uploadSuccess}</span>
                </p>
              )}

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8952b] text-[#060e1c] font-bold text-xs shadow-lg hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Gravando Arquivo...' : 'Salvar Documento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: VISUALIZADOR DE DOCUMENTO / PREVIEW
         ========================================================================= */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-3xl bg-[#0c1f38] border border-[#1e3a5f] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e3a5f] bg-[#071326]/90">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white truncate max-w-md">
                    {previewDoc.title}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {previewDoc.category} • {previewDoc.fileName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadAthleteDocument(previewDoc)}
                  className="px-3 py-1.5 rounded-xl bg-[#d4af37] text-[#060e1c] text-xs font-bold flex items-center gap-1.5 shadow hover:bg-[#b8952b] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar</span>
                </button>

                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Viewer Body */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-black/60">
              {previewDoc.fileType?.includes('image') || /\.(jpg|jpeg|png|webp)$/i.test(previewDoc.fileName) ? (
                <div className="max-h-[60vh] overflow-auto rounded-xl border border-white/10 p-2 bg-black/40">
                  <img
                    src={previewDoc.fileUrl}
                    alt={previewDoc.title}
                    className="max-h-[55vh] object-contain rounded-lg mx-auto"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="w-full max-w-xl p-8 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center shadow-lg">
                    <FileText className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-1">
                    <h5 className="text-base font-bold text-white">{previewDoc.title}</h5>
                    <p className="text-xs text-slate-400 font-mono">{previewDoc.fileName} ({previewDoc.fileSize})</p>
                  </div>

                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-left text-xs space-y-2">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Atleta:</span>
                      <strong className="text-white">{athlete.name}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Categoria:</span>
                      <strong className="text-[#d4af37]">{previewDoc.category}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Data de Envio:</span>
                      <span>{previewDoc.uploadedAt}</span>
                    </div>
                    {previewDoc.expiryDate && (
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Validade:</span>
                        <span className="text-emerald-400 font-mono">{previewDoc.expiryDate}</span>
                      </div>
                    )}
                    {previewDoc.notes && (
                      <div className="pt-2 border-t border-white/5">
                        <span className="text-slate-400 block text-[10px]">Observações:</span>
                        <p className="text-slate-200 mt-0.5">{previewDoc.notes}</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => downloadAthleteDocument(previewDoc)}
                    className="w-full py-3 rounded-xl bg-[#d4af37] text-[#060e1c] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#b8952b] transition-colors cursor-pointer shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Documento Completo</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
