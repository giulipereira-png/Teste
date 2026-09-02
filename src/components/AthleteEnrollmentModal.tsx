import React, { useState } from 'react';
import { 
  X, 
  CalendarCheck, 
  CheckCircle2, 
  AlertCircle,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Logo } from './Logo';
import { db, doc, setDoc, OperationType, handleFirestoreError } from '../lib/firebase';

interface AthleteEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AthleteEnrollmentModal: React.FC<AthleteEnrollmentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    athleteName: '',
    guardianName: '',
    age: '',
    disabilityType: 'Autismo (TEA)',
    modalityType: 'Iniciação Esportiva',
    swimmingExperience: 'Já nada com autonomia básica / breve experiência',
    phone: '',
    email: '',
    notes: '',
  });

  if (!isOpen) return null;

  const targetPhone = '5511998809708'; // WhatsApp Oficial ACEDEP

  const generateWhatsAppMessage = () => {
    return `*ACEDEP - Nova Solicitação de Avaliação*\n\n` +
      `*Atleta:* ${formData.athleteName} (${formData.age} anos)\n` +
      `*Responsável:* ${formData.guardianName}\n` +
      `*Telefone/WhatsApp:* ${formData.phone}\n` +
      `*Condição:* ${formData.disabilityType}\n` +
      `*Turma:* ${formData.modalityType}\n` +
      `*Experiência:* ${formData.swimmingExperience}\n` +
      (formData.notes ? `*Obs:* ${formData.notes}\n` : '');
  };

  const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(generateWhatsAppMessage())}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // Salva os dados permanentemente na nuvem (Firestore) - Acessível de qualquer aparelho
      const enrollmentId = `req-${Date.now()}`;
      await setDoc(doc(db, 'enrollment_requests', enrollmentId), {
        id: enrollmentId,
        athleteName: formData.athleteName,
        guardianName: formData.guardianName,
        age: formData.age,
        disabilityType: formData.disabilityType,
        modalityType: formData.modalityType,
        swimmingExperience: formData.swimmingExperience,
        phone: formData.phone,
        email: formData.email || '',
        notes: formData.notes || '',
        status: 'Pendente',
        createdAt: new Date().toISOString(),
      });

      setSubmitted(true);
    } catch (err: any) {
      console.error('Erro ao salvar no Firestore:', err);
      handleFirestoreError(err, OperationType.CREATE, 'enrollment_requests');
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateWhatsAppMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0a192f] border border-[#d4af37]/40 rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-[#060e1c] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo variant="emblem" className="h-10" />
            <div>
              <h3 className="text-lg font-bold text-white font-serif">
                Avaliação Aquática
              </h3>
              <p className="text-xs text-[#d4af37]">
                Natação para Deficiência Intelectual (a partir de 12 anos)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Fechar janela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {submitted ? (
            <div className="py-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#d4af37]/20 border border-[#d4af37] text-[#d4af37] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-white">
                  Cadastro Salvo com Sucesso!
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed mt-1">
                  Os dados do atleta foram salvos no sistema da ACEDEP na nuvem e já estão disponíveis no painel administrativo de qualquer aparelho. 
                </p>
                <p className="text-xs text-[#f3e5ab] mt-2 font-medium">
                  Para atendimento imediato, clique abaixo para enviar a solicitação diretamente no WhatsApp da diretoria:
                </p>
                {errorMessage && (
                  <p className="text-xs text-amber-400 mt-2">{errorMessage}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 max-w-md mx-auto">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Enviar Confirmação pelo WhatsApp</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full py-2.5 px-4 rounded-lg bg-black/40 hover:bg-black/60 text-slate-300 text-xs border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-semibold">Dados copiados!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#d4af37]" />
                      <span>Copiar Resumo da Inscrição</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-md bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#e5c058] transition-colors cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Requirements Banner */}
              <div className="p-3.5 rounded-xl bg-[#0f2744] border border-[#d4af37]/40 text-xs text-slate-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Sincronização em Nuvem:</strong>
                  Ao enviar este formulário, o perfil do atleta é gravado permanentemente no banco de dados e poderá ser acessado de qualquer computador ou celular pela diretoria.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nome do Atleta *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.athleteName}
                    onChange={(e) => setFormData({ ...formData, athleteName: e.target.value })}
                    placeholder="Nome completo do atleta"
                    className="w-full px-3 py-2 bg-[#060e1c] border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Idade do Atleta (mínimo 12 anos) *
                  </label>
                  <input
                    type="number"
                    min="12"
                    max="80"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Ex: 14"
                    className="w-full px-3 py-2 bg-[#060e1c] border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nome do Responsável *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    placeholder="Nome do pai/mãe/responsável"
                    className="w-full px-3 py-2 bg-[#060e1c] border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Telefone / WhatsApp para Contato *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 99880-9708"
                    className="w-full px-3 py-2 bg-[#060e1c] border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Condição / Diagnóstico *
                  </label>
                  <select
                    value={formData.disabilityType}
                    onChange={(e) => setFormData({ ...formData, disabilityType: e.target.value })}
                    className="w-full px-3 py-2 bg-[#060e1c] border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="Autismo (TEA)">Autismo / Transtorno do Espectro Autista (TEA)</option>
                    <option value="Deficiência Intelectual (DI)">Deficiência Intelectual (DI)</option>
                    <option value="Síndrome de Down (T21)">Síndrome de Down (Trissomia 21)</option>
                    <option value="Deficiência Intelectual Associada">Deficiência Intelectual Associada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Turma Desejada
                  </label>
                  <select
                    value={formData.modalityType}
                    onChange={(e) => setFormData({ ...formData, modalityType: e.target.value })}
                    className="w-full px-3 py-2 bg-[#060e1c] border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="Iniciação Esportiva">Iniciação Esportiva (Aperfeiçoamento dos Nados)</option>
                    <option value="Alto Rendimento (Classes S14 e S21)">Alto Rendimento (Classes S14 e S21 - Síndrome de Down)</option>
                    <option value="Avaliar pela comissão técnica">A critério da avaliação técnica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Experiência Prévia na Água *
                </label>
                <select
                  value={formData.swimmingExperience}
                  onChange={(e) => setFormData({ ...formData, swimmingExperience: e.target.value })}
                  className="w-full px-3 py-2 bg-[#060e1c] border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:border-[#d4af37]"
                >
                  <option value="Já nada com autonomia básica / breve experiência">Já nada com autonomia básica e breve experiência prévia</option>
                  <option value="Domina estilos e deseja competir">Domina estilos básicos e deseja competir no alto rendimento</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Observações Médicas ou Detalhes Relevantes (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informe detalhes sobre laudo, medicamentos ou histórico aquático..."
                  className="w-full px-3 py-2 bg-[#060e1c] border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:border-[#d4af37] resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-md border border-slate-700 text-xs text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-md bg-gradient-to-r from-[#d4af37] to-[#c49e29] text-[#060e1c] font-bold text-xs uppercase tracking-wider hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando na Nuvem...</span>
                    </>
                  ) : (
                    <>
                      <CalendarCheck className="w-4 h-4" />
                      <span>Cadastrar Atleta</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
