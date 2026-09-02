import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  User, 
  CheckCircle2, 
  ShieldCheck,
  Send,
  Mail,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Phone
} from 'lucide-react';
import { Logo } from './Logo';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [supportType, setSupportType] = useState<'empresa' | 'pessoa'>('empresa');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    modalityInterest: 'Equipe de Natação (Deficiência Intelectual)',
    contributionType: 'Patrocínio direto',
    message: '',
  });

  if (!isOpen) return null;

  const targetEmail = 'giuli.pereira@gmail.com';
  const targetPhone = '5511998809708';

  const generateEmailBody = () => {
    return `Olá Equipe ACEDEP,\n\nProposta de Apoio / Patrocínio enviada pelo site:\n\n` +
      `• Tipo: ${supportType === 'empresa' ? 'Pessoa Jurídica (Empresa)' : 'Pessoa Física (Doador Individual)'}\n` +
      `• Nome: ${formData.name}\n` +
      (formData.company ? `• Empresa / Razão Social: ${formData.company}\n` : '') +
      `• E-mail: ${formData.email}\n` +
      `• Telefone/WhatsApp: ${formData.phone}\n` +
      `• Modalidade de Apoio: ${formData.contributionType}\n` +
      `• Mensagem: ${formData.message || 'Sem observações adicionais'}\n`;
  };

  const generateWhatsAppMessage = () => {
    return `*ACEDEP - Proposta de Apoio / Patrocínio*\n\n` +
      `*Tipo:* ${supportType === 'empresa' ? 'Pessoa Jurídica' : 'Pessoa Física'}\n` +
      `*Nome:* ${formData.name}\n` +
      (formData.company ? `*Empresa:* ${formData.company}\n` : '') +
      `*Telefone:* ${formData.phone}\n` +
      `*E-mail:* ${formData.email}\n` +
      `*Opção:* ${formData.contributionType}\n` +
      (formData.message ? `*Mensagem:* ${formData.message}` : '');
  };

  const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(
    `[ACEDEP - Apoio] ${formData.contributionType} - ${formData.name}`
  )}&body=${encodeURIComponent(generateEmailBody())}`;

  const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(generateWhatsAppMessage())}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      <div className="relative w-full max-w-2xl bg-[#0a192f] border border-[#d4af37]/40 rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-6 bg-[#060e1c] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo variant="emblem" className="h-10" />
            <div>
              <h3 className="text-lg font-bold text-white font-serif">
                Apoie a Equipe da ACEDEP
              </h3>
              <p className="text-xs text-[#d4af37]">
                Fortaleça o paradesporto e nossos atletas de natação com deficiência intelectual
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

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {submitted ? (
            <div className="py-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#d4af37]/20 border border-[#d4af37] text-[#d4af37] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-white">
                  Proposta Preparada com Sucesso!
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed mt-1">
                  Agradecemos imensamente! Sua proposta foi direcionada para <strong>{targetEmail}</strong> e <strong>(11) 99880-9708</strong>. Clique abaixo para enviar agora:
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
                  <span>Enviar Proposta pelo WhatsApp</span>
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
                      <span className="text-green-400 font-semibold">Dados copiados com sucesso!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#d4af37]" />
                      <span>Copiar Dados da Proposta</span>
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
            <>
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-3 p-1 rounded-lg bg-black/40 border border-white/10">
                <button
                  type="button"
                  onClick={() => setSupportType('empresa')}
                  className={`py-2 px-4 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    supportType === 'empresa'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Pessoa Jurídica (Empresas)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSupportType('pessoa')}
                  className={`py-2 px-4 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    supportType === 'pessoa'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Pessoa Física (Doador)</span>
                </button>
              </div>

              {/* Support modality banner */}
              <div className="p-4 rounded-xl bg-[#0f2744] border border-[#d4af37]/30 text-xs text-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#d4af37]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Opções de Apoio: Patrocínio Direto & Doação Espontânea</span>
                </div>
                <p className="text-slate-300">
                  {supportType === 'empresa'
                    ? 'Sua empresa pode realizar um patrocínio direto para suporte a uniformes, viagens e competições dos nossos atletas, ou efetuar uma doação institucional espontânea.'
                    : 'Pessoas físicas podem contribuir diretamente com a equipe da ACEDEP através de doação institucional espontânea ou patrocínio de atletas para viagens e equipamentos.'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {supportType === 'empresa' ? 'Nome do Responsável *' : 'Nome Completo *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Seu Nome"
                      className="w-full px-3 py-2 bg-[#060e1c] border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  {supportType === 'empresa' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Razão Social / Nome Fantasia *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Ex: Grupo Empresarial SP"
                        className="w-full px-3 py-2 bg-[#060e1c] border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  )}

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
                    Tipo de Apoio Desejado *
                  </label>
                  <select
                    value={formData.contributionType}
                    onChange={(e) => setFormData({ ...formData, contributionType: e.target.value })}
                    className="w-full px-3 py-2 bg-[#060e1c] border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="Patrocínio direto">Patrocínio direto</option>
                    <option value="Doação institucional Espontânea">Doação institucional Espontânea</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mensagem ou Proposta (Opcional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Conte-nos como gostaria de apoiar a equipe de natação da ACEDEP..."
                    className="w-full px-3 py-2 bg-[#060e1c] border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:border-[#d4af37] resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-md border border-slate-700 text-xs text-slate-300 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-md bg-gradient-to-r from-[#d4af37] to-[#c49e29] text-[#060e1c] font-bold text-xs uppercase tracking-wider hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar Proposta de Apoio</span>
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
