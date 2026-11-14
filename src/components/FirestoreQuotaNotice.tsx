import React, { useEffect, useState } from 'react';
import { AlertTriangle, ExternalLink, X } from 'lucide-react';
import {
  subscribeFirestoreQuotaError,
  FIRESTORE_QUOTA_CONSOLE_URL,
  FIRESTORE_PRICING_URL,
} from '../lib/firebase';

interface FirestoreQuotaNoticeProps {
  compact?: boolean;
}

export const FirestoreQuotaNotice: React.FC<FirestoreQuotaNoticeProps> = ({ compact = false }) => {
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    return subscribeFirestoreQuotaError((exceeded) => {
      setQuotaExceeded(exceeded);
    });
  }, []);

  if (!quotaExceeded || dismissed) return null;

  return (
    <div
      className={`${
        compact
          ? 'mx-3 sm:mx-6 mt-3 p-3.5 rounded-xl'
          : 'fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] md:bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-lg z-50 p-4 rounded-2xl shadow-2xl'
      } bg-amber-950/95 border border-amber-400/50 text-amber-100 backdrop-blur-md`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1.5 text-xs">
          <p className="font-bold text-amber-200">
            Seus dados na nuvem NÃO foram apagados (Cota diária gratuita do Firestore atingida)
          </p>
          <p className="text-amber-100/90 leading-relaxed">
            O banco de dados atingiu hoje o limite diário gratuito de leituras do plano Spark (Enterprise edition), por isso este novo domínio está exibindo os dados padrão temporariamente. A cota reinicia automaticamente amanhã, ou você pode verificar os limites/plano diretamente no Console do Firebase.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href={FIRESTORE_QUOTA_CONSOLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-[#f3e5ab] hover:underline"
            >
              <span>Abrir Banco no Firebase Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={FIRESTORE_PRICING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-amber-300 hover:underline"
            >
              <span>Detalhes da Cota (Plano Spark)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg text-amber-300 hover:text-white hover:bg-amber-400/20 transition-colors cursor-pointer"
          aria-label="Fechar aviso"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
