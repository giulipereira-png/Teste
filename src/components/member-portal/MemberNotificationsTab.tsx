import React from 'react';
import { Mail } from 'lucide-react';
import { AthleteRecord, EmailNotificationLog } from '../../types';

interface MemberNotificationsTabProps {
  athlete: AthleteRecord;
  emailLogs: EmailNotificationLog[];
}

export const MemberNotificationsTab: React.FC<MemberNotificationsTabProps> = ({
  athlete,
  emailLogs,
}) => {
  // Filter logs relevant to this athlete or general broadcast
  const athleteLogs = emailLogs.filter((log) => {
    const matchEmail = log.recipientEmails.some(
      (e) => e.toLowerCase() === (athlete.guardianEmail || '').toLowerCase()
    );
    const matchName =
      log.recipientSummary.toLowerCase().includes(athlete.name.toLowerCase()) ||
      log.recipientSummary.includes('Todos os Pais');
    return matchEmail || matchName || log.type === 'boletim_geral' || log.type === 'noticia';
  });

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Informativos & Atualizações Enviadas para Seu E-mail
            </h4>
            <p className="text-xs text-slate-300 pt-1">
              Todas as notificações, novidades do site e recados disparados pela coordenação da ACEDEP para{' '}
              <strong className="text-white">{athlete.guardianEmail || 'e-mail do responsável'}</strong>.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {athleteLogs.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-black/30 rounded-xl">
              Nenhum comunicado recente no histórico.
            </div>
          ) : (
            athleteLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-black/40 border border-[#1e3a5f] space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-white text-xs">{log.title}</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {log.sentAt}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{log.contentPreview}</p>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-white/5 flex items-center justify-between">
                  <span>Remetente: {log.senderName}</span>
                  <span className="text-emerald-400">✓ Entregue</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
