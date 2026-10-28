/**
 * Security Rate Limiter & Anti-Brute-Force Shield for ACEDEP
 * Protects login endpoints against automated dictionary and brute-force attacks.
 */

interface RateLimitRecord {
  attempts: number;
  lockedUntil: number; // timestamp in ms
  lastAttempt: number;
}

const STORAGE_PREFIX = 'acedep_rl_';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds lockout
const ATTEMPT_WINDOW_MS = 2 * 60 * 1000; // 2 minutes window

export interface RateLimitStatus {
  isLocked: boolean;
  remainingSeconds: number;
  remainingAttempts: number;
  message?: string;
}

export const checkRateLimit = (actionKey: 'admin_login' | 'guardian_login'): RateLimitStatus => {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${actionKey}`);
    if (!raw) {
      return { isLocked: false, remainingSeconds: 0, remainingAttempts: MAX_ATTEMPTS };
    }

    const record: RateLimitRecord = JSON.parse(raw);
    const now = Date.now();

    // Check if currently in lockout period
    if (record.lockedUntil > now) {
      const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return {
        isLocked: true,
        remainingSeconds,
        remainingAttempts: 0,
        message: `Muitas tentativas incorretas consecutivas. Por segurança contra ataques de força bruta, o acesso está bloqueado temporariamente por ${remainingSeconds} segundo(s).`,
      };
    }

    // Check if attempt window expired
    if (now - record.lastAttempt > ATTEMPT_WINDOW_MS) {
      sessionStorage.removeItem(`${STORAGE_PREFIX}${actionKey}`);
      return { isLocked: false, remainingSeconds: 0, remainingAttempts: MAX_ATTEMPTS };
    }

    const remainingAttempts = Math.max(0, MAX_ATTEMPTS - record.attempts);
    return {
      isLocked: false,
      remainingSeconds: 0,
      remainingAttempts,
    };
  } catch {
    return { isLocked: false, remainingSeconds: 0, remainingAttempts: MAX_ATTEMPTS };
  }
};

export const recordFailedAttempt = (actionKey: 'admin_login' | 'guardian_login'): RateLimitStatus => {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${actionKey}`);
    const now = Date.now();
    let record: RateLimitRecord;

    if (raw) {
      record = JSON.parse(raw);
      if (now - record.lastAttempt > ATTEMPT_WINDOW_MS) {
        record = { attempts: 1, lockedUntil: 0, lastAttempt: now };
      } else {
        record.attempts += 1;
        record.lastAttempt = now;
      }
    } else {
      record = { attempts: 1, lockedUntil: 0, lastAttempt: now };
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      record.lockedUntil = now + LOCKOUT_DURATION_MS;
      sessionStorage.setItem(`${STORAGE_PREFIX}${actionKey}`, JSON.stringify(record));
      const remainingSeconds = Math.ceil(LOCKOUT_DURATION_MS / 1000);
      return {
        isLocked: true,
        remainingSeconds,
        remainingAttempts: 0,
        message: `Limite de 5 tentativas excedido. Acesso bloqueado por ${remainingSeconds} segundos para proteção da conta.`,
      };
    }

    sessionStorage.setItem(`${STORAGE_PREFIX}${actionKey}`, JSON.stringify(record));
    const remaining = MAX_ATTEMPTS - record.attempts;
    return {
      isLocked: false,
      remainingSeconds: 0,
      remainingAttempts: remaining,
      message: `Senha incorreta. Você ainda tem ${remaining} tentativa(s) antes do bloqueio temporário de segurança.`,
    };
  } catch {
    return { isLocked: false, remainingSeconds: 0, remainingAttempts: 3 };
  }
};

export const resetRateLimit = (actionKey: 'admin_login' | 'guardian_login'): void => {
  try {
    sessionStorage.removeItem(`${STORAGE_PREFIX}${actionKey}`);
  } catch {}
};
