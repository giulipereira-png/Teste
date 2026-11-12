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
  Loader2,
  Mail
} from 'lucide-react';
import { Logo } from './Logo';
import { db, doc, setDoc, OperationType, handleFirestoreError } from '../lib/firebase';
import { sanitizeText } from '../utils/sanitizer';
import { sendDirectGmail, buildAcedepEmailHtml, OFFICIAL_GMAIL, OFFICIAL_HOTMAIL } from '../services/googleEmailService';

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

  const targetEmail = 'giuli.pereira@gmail.com';
  const copyEmail = 'acedep@hotmail.com';
  const targetPhone1 = '5511981047553'; // Celular/WhatsApp Oficial 1 ACEDEP
  const targetPhone2 = '5511988231504'; // Celular/WhatsApp Oficial 2 ACEDEP

  const generateEmailBody = () => {
    return `Olá Equipe ACEDEP (Giuliano Pereira e Diretoria Técnica),\n\n` +
      `Nova solicitação de teste prático / avaliação aquática recebida pelo site:\n\n` +
      `• Atleta: ${formData.athleteName} (${formData.age} anos)\n` +
      `• Responsável: ${formData.guardianName}\n` +
      `• Telefone/WhatsApp: ${formData.phone}\n` +
      `• E-mail do Responsável: ${formData.email || 'Não informado'}\n` +
      `• Condição/Deficiência: ${formData.disabilityType}\n` +
      `• Modalidade/Turma: ${formData.modalityType}\n` +
      `• Experiência Aquática: ${formData.swimmingExperience}\n` +
      `• Observações: ${formData.notes || 'Nenhuma'}\n\n` +
      `Destinatário: ${targetEmail} | Com cópia oficial: ${copyEmail}`;
  };

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

  const mailtoUrl = `mailto:${targetEmail}?cc=${copyEmail}&subject=${encodeURIComponent(
    `[ACEDEP - Inscrição Teste] ${formData.athleteName} - Avaliação Aquática`
  )}&body=${encodeURIComponent(generateEmailBody())}`;

  const whatsappUrl1 = `https://wa.me/${targetPhone1}?text=${encodeURIComponent(generateWhatsAppMessage())}`;
  const whatsappUrl2 = `https://wa.me/${targetPhone2}?text=${encodeURIComponent(generateWhatsAppMessage())}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // Salva os dados permanentemente na nuvem (Firestore) com sanitização de segurança
      const enrollmentId = `req-${Date.now()}`;
      await setDoc(doc(db, 'enrollment_requests', enrollmentId), {
        id: enrollmentId,
        athleteName: sanitizeText(formData.athleteName, 100),
        guardianName: sanitizeText(formData.guardianName, 100),
        age: sanitizeText(formData.age, 20),
        disabilityType: sanitizeText(formData.disabilityType, 100),
        modalityType: sanitizeText(formData.modalityType, 100),
        swimmingExperience: sanitizeText(formData.swimmingExperience, 100),
        phone: sanitizeText(formData.phone, 30),
        email: sanitizeText(formData.email || '', 100),
        notes: sanitizeText(formData.notes || '', 1000),
        status: 'Pendente',
        createdAt: new Date().toISOString(),
      });

      // Dispara envio automático direto se a conta Google/Gmail estiver conectada
      const notificationEmails = [OFFICIAL_GMAIL, OFFICIAL_HOTMAIL];
      if (formData.email && formData.email.includes('@')) {
        notificationEmails.push(formData.email.trim());
      }

      sendDirectGmail({
        to: notificationEmails,
        subject: `[ACEDEP - Inscrição Teste] ${formData.athleteName} (${formData.disabilityType})`,
        htmlBody: buildAcedepEmailHtml({
          badge: 'AVALIAÇÃO AQUÁTICA & SELETIVA',
          title: 'Nova Inscrição para Teste de Natação',
          headline: `Candidato: ${formData.athleteName} (${formData.age} anos)`,
          paragraphs: [
            'Uma nova solicitação de avaliação técnica e teste prático na piscina foi cadastrada pelo site da ACEDEP.',
            formData.notes ? `Observações da família: "${formData.notes}"` : 'Sem observações adicionais.',
          ],
          fields: [
            { label: 'Atleta', value: `${formData.athleteName} (${formData.age} anos)` },
            { label: 'Responsável', value: formData.guardianName },
            { label: 'Telefone/WhatsApp', value: formData.phone },
            { label: 'E-mail', value: formData.email || 'Não informado' },
            { label: 'Condição / Classe', value: formData.disabilityType },
            { label: 'Turma / Objetivo', value: formData.modalityType },
            { label: 'Nível Atual', value: formData.swimmingExperience },
          ],
        }),
        cc: [OFFICIAL_HOTMAIL, OFFICIAL_GMAIL],
      }).catch(() => {});

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0a192f] border-0 sm:border border-[#d4af37]/40 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden text-slate-100 h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-[#060e1c] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Logo variant="emblem" className="h-9 sm:h-10" />
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-serif">
                Avaliação Aquática
              </h3>
              <p className="text-[11px] sm:text-xs text-[#d4af37]">
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 touch-scroll overscroll-y-contain pb-[max(2rem,env(safe-area-inset-bottom))]">
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
                  href={whatsappUrl1}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <MessageCircle className="w-4.5 h-4.5" />
                  <span>Enviar pelo WhatsApp (11) 98104-7553</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <a
                  href={whatsappUrl2}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <MessageCircle className="w-4.5 h-4.5" />
                  <span>Enviar pelo WhatsApp (11) 98823-1504</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <a
                  href={mailtoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4 text-[#d4af37]" />
                  <span>Abrir no Aplicativo de E-mail ({targetEmail})</span>
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
