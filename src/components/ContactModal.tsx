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

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
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
  const targetPhone = '5511998809708';

  const generateEmailBody = () => {
    return `Olá ACEDEP,\n\nMensagem enviada pelo site oficial:\n\n` +
      `• Nome: ${formData.name}\n` +
      `• E-mail: ${formData.email}\n` +
      `• Telefone/WhatsApp: ${formData.phone}\n` +
      `• Assunto: ${formData.subject}\n\n` +
      `Mensagem:\n${formData.message}\n`;
  };

  const generateWhatsAppMessage = () => {
    return `*ACEDEP - Contato pelo Site*\n\n` +
      `*Nome:* ${formData.name}\n` +
      `*E-mail:* ${formData.email}\n` +
      `*Telefone:* ${formData.phone}\n` +
      `*Assunto:* ${formData.subject}\n\n` +
      `*Mensagem:*\n${formData.message}`;
  };

  const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(
    `[ACEDEP] ${formData.subject} - ${formData.name}`
  )}&body=${encodeURIComponent(generateEmailBody())}`;

  const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(generateWhatsAppMessage())}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Tenta abrir o cliente de email diretamente
    window.open(mailtoUrl, '_blank');
    setSubmitted(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateEmailBody());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0a192f] border border-[#1e3a5f] rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-[#060e1c] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo variant="emblem" className="h-9" />
            <div>
              <h3 className="text-lg font-bold text-white font-serif">
                Fale com a ACEDEP
              </h3>
              <p className="text-xs text-[#d4af37]">
                Atendimento Institucional e Paradesportivo
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
            <div className="py-6 text-center space-y-5">
              <div className="w-14 h-14 rounded-full bg-[#d4af37]/20 border border-[#d4af37] text-[#d4af37] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">
                  Mensagem Preparada com Sucesso!
                </h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed mt-1">
                  Sua mensagem foi direcionada para <strong>{targetEmail}</strong> e <strong>(11) 99880-9708</strong>. Para garantir envio imediato, use os botões rápidos abaixo:
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 max-w-md mx-auto">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar pelo WhatsApp (11 99880-9708)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
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
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#0f2744] border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#d4af37]">
                    <Mail className="w-3.5 h-3.5" />
                    <span>E-mail</span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">{targetEmail}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#0f2744] border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#d4af37]">
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp / Telefone</span>
                  </div>
                  <p className="text-[11px] text-slate-300">(11) 99880-9708</p>
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
                    className="px-6 py-2 rounded-md bg-[#d4af37] text-[#060e1c] font-bold text-xs uppercase tracking-wider hover:bg-[#e5c058] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar Mensagem</span>
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

