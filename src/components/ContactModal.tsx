import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  CheckCircle2, 
  Clock,
  Phone,
  MessageCircle,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { Logo } from './Logo';
import { sendDirectGmail, buildAcedepEmailHtml } from '../services/googleEmailService';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [directEmailSent, setDirectEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Informações Gerais sobre a ACEDEP',
    message: '',
  });

  if (!isOpen) return null;

  const targetEmail = 'giuli.pereira@gmail.com';
  const copyEmail = 'acedep@hotmail.com';
  const targetPhone1 = '5511981047553';
  const targetPhone2 = '5511988231504';

  const generateEmailBody = () => {
    return `Olá Equipe ACEDEP (Giuliano Pereira e Diretoria),\n\nMensagem enviada pelo site oficial:\n\n` +
      `• Nome: ${formData.name}\n` +
      `• E-mail: ${formData.email}\n` +
      `• Telefone/WhatsApp: ${formData.phone}\n` +
      `• Assunto: ${formData.subject}\n\n` +
      `Mensagem:\n${formData.message}\n\n` +
      `Enviado para: ${targetEmail} | Com cópia oficial: ${copyEmail}`;
  };

  const generateWhatsAppMessage = () => {
    return `*ACEDEP - Contato pelo Site*\n\n` +
      `*Nome:* ${formData.name}\n` +
      `*E-mail:* ${formData.email}\n` +
      `*Telefone:* ${formData.phone}\n` +
      `*Assunto:* ${formData.subject}\n\n` +
      `*Mensagem:*\n${formData.message}`;
  };

  const subjectLine = `[ACEDEP] ${formData.subject} - ${formData.name}`;
  const mailtoUrl = `mailto:${targetEmail}?cc=${copyEmail}&subject=${encodeURIComponent(
    subjectLine
  )}&body=${encodeURIComponent(generateEmailBody())}`;
  const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    targetEmail
  )}&cc=${encodeURIComponent(copyEmail)}&su=${encodeURIComponent(
    subjectLine
  )}&body=${encodeURIComponent(generateEmailBody())}`;

  const whatsappUrl1 = `https://wa.me/${targetPhone1}?text=${encodeURIComponent(generateWhatsAppMessage())}`;
  const whatsappUrl2 = `https://wa.me/${targetPhone2}?text=${encodeURIComponent(generateWhatsAppMessage())}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await sendDirectGmail({
        to: [targetEmail, copyEmail],
        subject: subjectLine,
        htmlBody: buildAcedepEmailHtml({
          badge: 'CONTATO DO SITE',
          title: 'Nova Mensagem de Contato pelo Site',
          headline: `${formData.name} enviou uma mensagem institucional`,
          paragraphs: [
            `Uma nova mensagem foi preenchida diretamente no formulário de contato do portal da ACEDEP.`,
            formData.message,
          ],
          fields: [
            { label: 'Nome', value: formData.name },
            { label: 'E-mail de Contato', value: formData.email },
            { label: 'Telefone/WhatsApp', value: formData.phone },
            { label: 'Assunto', value: formData.subject },
          ],
        }),
        cc: [copyEmail, targetEmail],
        replyTo: formData.email || undefined,
      });
      setDirectEmailSent(res.success);
    } catch {
      setDirectEmailSent(false);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateEmailBody());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0a192f] border-0 sm:border border-[#1e3a5f] rounded-none sm:rounded-2xl shadow-2xl overflow-hidden text-slate-100 h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:p-6 bg-[#060e1c] border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Logo variant="emblem" className="h-8 sm:h-9 shrink-0" />
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-white font-serif truncate">
                Fale com a ACEDEP
              </h3>
              <p className="text-[11px] sm:text-xs text-[#d4af37] truncate">
                Atendimento Institucional e Paradesportivo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="Fechar janela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 touch-scroll overscroll-y-contain pb-[max(2rem,env(safe-area-inset-bottom))]">
          {submitted ? (
            <div className="py-6 text-center space-y-5">
              <div className="w-14 h-14 rounded-full bg-[#d4af37]/20 border border-[#d4af37] text-[#d4af37] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">
                  {directEmailSent ? 'Mensagem Enviada por E-mail!' : 'Mensagem Preparada com Sucesso!'}
                </h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed mt-1">
                  {directEmailSent ? (
                    <>
                      Sua mensagem foi enviada diretamente para <strong>{targetEmail}</strong> com cópia oficial para <strong>{copyEmail}</strong>!
                    </>
                  ) : (
                    <>
                      Sua mensagem foi direcionada para a coordenação em <strong>{targetEmail}</strong> com cópia oficial para <strong>{copyEmail}</strong> e nossos celulares oficiais <strong>(11) 98104-7553</strong> e <strong>(11) 98823-1504</strong>.
                    </>
                  )}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 max-w-md mx-auto">
                <a
                  href={whatsappUrl1}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar via WhatsApp (11) 98104-7553</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href={whatsappUrl2}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar via WhatsApp (11) 98823-1504</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href={gmailWebUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-200 font-semibold text-xs border border-red-500/40 transition-all flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4 text-red-300" />
                  <span>Enviar pelo Gmail Web ({targetEmail})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href={mailtoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4 text-[#d4af37]" />
                  <span>Abrir no App de E-mail / Hotmail ({copyEmail})</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full py-2.5 px-4 rounded-lg bg-black/40 hover:bg-black/60 text-slate-300 text-xs border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-semibold">Texto copiado para a área de transferência!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#d4af37]" />
                      <span>Copiar Dados da Mensagem</span>
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
                  className="px-6 py-2 rounded-md bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#e5c058] transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Quick Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#0f2744] border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#d4af37]">
                    <Mail className="w-3.5 h-3.5" />
                    <span>E-mail Oficial</span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">{targetEmail}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#0f2744] border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#d4af37]">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Celular & WhatsApp</span>
                  </div>
                  <p className="text-[11px] text-slate-300">(11) 98104-7553 • (11) 98823-1504</p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Seu nome completo"
                    className="w-full px-3 py-2 bg-[#060e1c] border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seuemail@exemplo.com"
                      className="w-full px-3 py-2 bg-[#060e1c] border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Telefone / WhatsApp *
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

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Assunto
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-[#060e1c] border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="Informações Gerais sobre a ACEDEP">Informações Gerais</option>
                    <option value="Avaliação Aquática">Avaliação Aquática / Novos Atletas</option>
                    <option value="Apoio e Patrocínio">Apoio e Patrocínio</option>
                    <option value="Outros Assuntos">Outros Assuntos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mensagem *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Como podemos ajudar?"
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
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded-md bg-[#d4af37] text-[#060e1c] font-bold text-xs uppercase tracking-wider hover:bg-[#e5c058] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

