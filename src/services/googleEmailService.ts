import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth, db, doc, setDoc } from '../lib/firebase';

// Dedicated Google Workspace OAuth Provider for Gmail
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.setCustomParameters({
  prompt: 'select_account',
});

// Primary official target and copy emails requested by ACEDEP
export const OFFICIAL_GMAIL = 'giuli.pereira@gmail.com';
export const OFFICIAL_HOTMAIL = 'acedep@hotmail.com';

// In-memory token cache (Do NOT store in localStorage per security requirements)
let cachedAccessToken: string | null = null;
let currentGoogleUser: User | null = null;
let isSigningIn = false;
const authListeners = new Set<(status: GoogleAuthStatus) => void>();

function notifyAuthListeners() {
  const status = getGoogleAuthStatus();
  authListeners.forEach((cb) => cb(status));
}

// Listen to auth state changes to keep track of user and clear on sign out
onAuthStateChanged(auth, (user) => {
  currentGoogleUser = user;
  if (!user) {
    cachedAccessToken = null;
  }
  notifyAuthListeners();
});

export interface GoogleAuthStatus {
  isConnected: boolean;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  hasSendScope: boolean;
}

export interface DirectGmailOptions {
  to: string | string[];
  subject: string;
  htmlBody: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  skipLog?: boolean;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  method: 'gmail_api' | 'pending_dispatch';
}

/**
 * Subscribe to Google Workspace auth status changes
 */
export function subscribeGoogleAuthStatus(listener: (status: GoogleAuthStatus) => void): () => void {
  authListeners.add(listener);
  listener(getGoogleAuthStatus());
  return () => {
    authListeners.delete(listener);
  };
}

/**
 * Connect to Google account via Firebase Auth Popup with Gmail Send scope
 */
export async function connectGoogleAccount(): Promise<{ success: boolean; user?: User; error?: string }> {
  if (isSigningIn) {
    return { success: false, error: 'Uma solicitação de login já está em andamento.' };
  }

  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error('Não foi possível obter o token de acesso do Google.');
    }

    cachedAccessToken = credential.accessToken;
    currentGoogleUser = result.user;
    notifyAuthListeners();

    return {
      success: true,
      user: result.user,
    };
  } catch (err: any) {
    console.error('Erro ao conectar conta Google:', err);
    return {
      success: false,
      error: err?.message || 'Falha ao conectar conta Google.',
    };
  } finally {
    isSigningIn = false;
  }
}

/**
 * Disconnect current Google account session
 */
export async function disconnectGoogleAccount(): Promise<void> {
  try {
    await signOut(auth);
  } finally {
    cachedAccessToken = null;
    currentGoogleUser = null;
    notifyAuthListeners();
  }
}

/**
 * Check current Google account connection status and token availability
 */
export function getGoogleAuthStatus(): GoogleAuthStatus {
  return {
    isConnected: !!cachedAccessToken && !!currentGoogleUser,
    email: currentGoogleUser?.email || null,
    displayName: currentGoogleUser?.displayName || null,
    photoURL: currentGoogleUser?.photoURL || null,
    hasSendScope: !!cachedAccessToken,
  };
}

/**
 * Encode UTF-8 text string to RFC 2047 standard for MIME headers
 */
function encodeMimeSubject(subject: string): string {
  // RFC 2047 base64 encoded subject line for full accented characters support (PT-BR)
  const utf8Bytes = new TextEncoder().encode(subject);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return `=?UTF-8?B?${btoa(binary)}?=`;
}

/**
 * Send an email directly through the official Gmail REST API on behalf of the user
 */
export async function sendDirectGmail(options: DirectGmailOptions): Promise<SendEmailResult> {
  if (!cachedAccessToken) {
    return {
      success: false,
      error: 'Conta Google (Gmail) não está conectada no navegador. Conecte sua conta giuli.pereira@gmail.com.',
      method: 'pending_dispatch',
    };
  }

  try {
    const toList = Array.isArray(options.to) ? options.to.filter(Boolean).join(', ') : options.to;
    
    // Always include ACEDEP hotmail in CC and ensure Giuliano is also copied
    const defaultCc = [OFFICIAL_HOTMAIL];
    if (OFFICIAL_GMAIL && !toList.includes(OFFICIAL_GMAIL)) {
      defaultCc.push(OFFICIAL_GMAIL);
    }
    const additionalCc = options.cc 
      ? (Array.isArray(options.cc) ? options.cc : [options.cc]) 
      : [];
    const allCc = Array.from(new Set([...defaultCc, ...additionalCc])).filter(Boolean).join(', ');

    const bccList = options.bcc 
      ? (Array.isArray(options.bcc) ? options.bcc.filter(Boolean).join(', ') : options.bcc)
      : undefined;

    const senderEmail = currentGoogleUser?.email || OFFICIAL_GMAIL;
    const senderHeader = `ACEDEP Paradesporto <${senderEmail}>`;

    const mimeHeaders = [
      `From: ${senderHeader}`,
      `To: ${toList}`,
      allCc ? `Cc: ${allCc}` : '',
      bccList ? `Bcc: ${bccList}` : '',
      options.replyTo ? `Reply-To: ${options.replyTo}` : `Reply-To: ${OFFICIAL_HOTMAIL}`,
      `Subject: ${encodeMimeSubject(options.subject)}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 8bit',
    ].filter(Boolean).join('\r\n');

    const rawMessage = `${mimeHeaders}\r\n\r\n${options.htmlBody}`;

    // Base64URL encoding required by Gmail API
    const utf8Bytes = new TextEncoder().encode(rawMessage);
    let binary = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    const base64Url = btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cachedAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: base64Url }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        cachedAccessToken = null; // Token expired
        notifyAuthListeners();
      }
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData?.error?.message || `Erro HTTP ${response.status} ao enviar pelo Gmail.`;
      throw new Error(errMsg);
    }

    const data = await response.json();

    // Register successful dispatch in Firestore unless caller handles logging
    if (!options.skipLog) {
      const logId = `gmail-log-${Date.now()}`;
      await setDoc(doc(db, 'email_notifications', logId), {
        id: logId,
        type: 'boletim_geral',
        title: options.subject,
        recipientSummary: toList,
        recipientEmails: Array.isArray(options.to) ? options.to : [options.to],
        senderName: senderHeader,
        contentPreview: options.subject,
        status: 'enviado',
        gmailMessageId: data.id,
        sentAt: new Date().toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }).catch(() => {});
    }

    return {
      success: true,
      messageId: data.id,
      method: 'gmail_api',
    };
  } catch (error: any) {
    console.error('Falha no envio direto via Gmail API:', error);
    return {
      success: false,
      error: error?.message || 'Erro ao processar envio pelo Gmail.',
      method: 'gmail_api',
    };
  }
}

/**
 * Standard branded HTML Email Template for ACEDEP communications
 */
export function buildAcedepEmailHtml(params: {
  badge: string;
  title: string;
  headline: string;
  paragraphs: string[];
  fields?: { label: string; value: string }[];
  actionUrl?: string;
  actionText?: string;
}): string {
  const fieldsHtml = params.fields && params.fields.length > 0
    ? `
      <div style="background-color: #0b1a30; border: 1px solid #d4af37; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 13px;">
          ${params.fields.map((f) => `
            <tr>
              <td style="padding: 6px 0; color: #d4af37; font-weight: bold; width: 35%; vertical-align: top;">${f.label}:</td>
              <td style="padding: 6px 0; color: #ffffff; width: 65%;">${f.value}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    `
    : '';

  const paragraphsHtml = params.paragraphs
    .map((p) => `<p style="margin: 12px 0; color: #e2e8f0; font-size: 14px; line-height: 1.6;">${p}</p>`)
    .join('');

  const actionButtonHtml = params.actionUrl && params.actionText
    ? `
      <div style="text-align: center; margin: 28px 0;">
        <a href="${params.actionUrl}" style="background-color: #d4af37; color: #060e1c; font-weight: bold; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; display: inline-block;">
          ${params.actionText}
        </a>
      </div>
    `
    : '';

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <title>${params.title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #060e1c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #060e1c; padding: 30px 15px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="600" style="max-width: 600px; background-color: #0a172a; border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0d2242 0%, #060e1c 100%); padding: 24px 30px; border-bottom: 2px solid #d4af37;">
                  <table width="100%">
                    <tr>
                      <td>
                        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #d4af37; font-weight: bold; display: block; margin-bottom: 4px;">
                          ${params.badge}
                        </span>
                        <h1 style="margin: 0; font-size: 20px; color: #ffffff; font-weight: 800;">
                          ACEDEP · Natação Paralímpica Paulista
                        </h1>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Content Body -->
              <tr>
                <td style="padding: 30px 30px 20px 30px;">
                  <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #ffffff; font-weight: 700;">
                    ${params.headline}
                  </h2>
                  ${paragraphsHtml}
                  ${fieldsHtml}
                  ${actionButtonHtml}
                </td>
              </tr>

              <!-- Institutional Footer -->
              <tr>
                <td style="background-color: #050b16; padding: 20px 30px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: #94a3b8; text-align: center;">
                  <p style="margin: 0 0 6px 0; color: #cbd5e1; font-weight: 600;">
                    ACEDEP — Associação Cultural, Educacional e Paradesportiva
                  </p>
                  <p style="margin: 0 0 4px 0;">
                    Centro de Treinamento Paralímpico Brasileiro (CPB) · São Paulo - SP
                  </p>
                  <p style="margin: 6px 0 0 0; color: #d4af37;">
                    E-mail: <strong>${OFFICIAL_HOTMAIL}</strong> | Coordenação: <strong>${OFFICIAL_GMAIL}</strong>
                  </p>
                  <p style="margin: 4px 0 0 0; color: #94a3b8;">
                    WhatsApp/Telefone: (11) 98104-7553 • (11) 98823-1504
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
