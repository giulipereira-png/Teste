import React from 'react';
import { MessageSquare } from 'lucide-react';
import { AthleteRecord } from '../../types';

interface MemberMessagesTabProps {
  athlete: AthleteRecord;
}

export const MemberMessagesTab: React.FC<MemberMessagesTabProps> = ({ athlete }) => {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4">
        <h4 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Orientações & Mensagens da Comissão Técnica
        </h4>
        <p className="text-xs text-slate-300">
          Recados e feedbacks personalizados enviados diretamente pelos técnicos para o responsável de {athlete.name}.
        </p>

        <div className="space-y-4 pt-2">
          {(!athlete.coachNotes || athlete.coachNotes.length === 0) ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-black/30 rounded-xl">
              Nenhuma mensagem ou orientação técnica cadastrada no momento.
            </div>
          ) : (
            athlete.coachNotes.map((note) => (
              <div
                key={note.id}
                className="p-5 rounded-2xl bg-black/40 border border-[#1e3a5f] space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-white">{note.title}</span>
                  <span className="text-[11px] text-slate-400 font-mono">{note.date}</span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                  {note.text}
                </p>

                <div className="pt-1 flex items-center justify-between text-[11px] text-[#f3e5ab]">
                  <span>Enviado por: {note.coachName}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
