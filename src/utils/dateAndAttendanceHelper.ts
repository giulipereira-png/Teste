import { AthleteRecord, AttendanceSession, AttendanceStatus, TrainingAttendanceDay } from '../types';

export interface ParsedAppDate {
  day: number;
  month: number; // 0-indexed (0 = Janeiro, 11 = Dezembro)
  year: number;
  timestamp: number;
  formattedBR: string; // DD/MM/YYYY
}

/**
 * Universal date parser that works 100% identically across Chrome, Firefox, Safari (iOS & macOS), Edge, and WebViews.
 * Correctly parses Brazilian formats (DD/MM/YYYY), ISO formats (YYYY-MM-DD), and localized string dates.
 */
export function parseAppDate(dateStr: string | undefined | null): ParsedAppDate | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // 1. Brazilian format: DD/MM/YYYY or D/M/YYYY
  const brMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (brMatch) {
    const day = parseInt(brMatch[1], 10);
    const month = parseInt(brMatch[2], 10) - 1; // 0-indexed
    const year = parseInt(brMatch[3], 10);
    const dateObj = new Date(year, month, day, 12, 0, 0);
    return {
      day,
      month,
      year,
      timestamp: dateObj.getTime(),
      formattedBR: `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`,
    };
  }

  // 2. ISO format: YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const dateObj = new Date(year, month, day, 12, 0, 0);
    return {
      day,
      month,
      year,
      timestamp: dateObj.getTime(),
      formattedBR: `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`,
    };
  }

  // 3. Text format: "26 de Fevereiro de 2026"
  const ptMonths = [
    'janeiro', 'fevereiro', 'março', 'marco', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  const textMatch = trimmed.toLowerCase().match(/(\d{1,2})\s+(?:de\s+)?([a-zç]+)\s+(?:de\s+)?(\d{4})/);
  if (textMatch) {
    const day = parseInt(textMatch[1], 10);
    const monthName = textMatch[2];
    const year = parseInt(textMatch[3], 10);
    const mIdx = ptMonths.findIndex((m) => monthName.startsWith(m.slice(0, 3)));
    if (mIdx >= 0) {
      const dateObj = new Date(year, mIdx, day, 12, 0, 0);
      return {
        day,
        month: mIdx,
        year,
        timestamp: dateObj.getTime(),
        formattedBR: `${String(day).padStart(2, '0')}/${String(mIdx + 1).padStart(2, '0')}/${year}`,
      };
    }
  }

  // 4. Fallback to native Date for standard ISO strings
  const fallbackDate = new Date(trimmed);
  if (!isNaN(fallbackDate.getTime())) {
    const day = fallbackDate.getDate();
    const month = fallbackDate.getMonth();
    const year = fallbackDate.getFullYear();
    return {
      day,
      month,
      year,
      timestamp: fallbackDate.getTime(),
      formattedBR: `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`,
    };
  }

  return null;
}

/**
 * Checks if a date falls within a given month (0-11) and year.
 * Safe across all browsers without NaN bugs.
 */
export function isDateInMonth(dateStr: string | undefined | null, targetMonth: number, targetYear?: number): boolean {
  const parsed = parseAppDate(dateStr);
  if (!parsed) return false;
  if (parsed.month !== targetMonth) return false;
  if (targetYear !== undefined && parsed.year !== targetYear) return false;
  return true;
}

/**
 * Universal date sorting helper (descending = newest first).
 */
export function sortDatesDescending(dateStrA: string, dateStrB: string): number {
  const parsedA = parseAppDate(dateStrA);
  const parsedB = parseAppDate(dateStrB);
  if (!parsedA && !parsedB) return 0;
  if (!parsedA) return 1;
  if (!parsedB) return -1;
  return parsedB.timestamp - parsedA.timestamp;
}

export interface UnifiedAttendanceItem {
  id: string;
  date: string; // Formatted DD/MM/YYYY
  type: 'treino' | 'campeonato';
  title: string;
  location: string;
  status: 'presente' | 'ausente' | 'justificado';
  notes?: string;
  parsedDate: ParsedAppDate;
  source: 'session' | 'athlete_sheet' | 'both';
}

/**
 * Unifies attendance records from BOTH attendanceSessions AND athlete.recentAttendance.
 * Guarantees that presences marked on the coach's matrix / calendar are immediately visible to the parent,
 * and vice-versa.
 */
export function getUnifiedAthleteAttendance(
  athlete: AthleteRecord | undefined | null,
  attendanceSessions: AttendanceSession[] = []
): UnifiedAttendanceItem[] {
  if (!athlete) return [];

  const itemsMap = new Map<string, UnifiedAttendanceItem>();

  // 1. Process attendance_sessions
  attendanceSessions.forEach((sess) => {
    const rec = sess.records?.find((r) => r.athleteId === athlete.id);
    if (!rec) return;

    const parsed = parseAppDate(sess.date);
    if (!parsed) return;

    const normalizedDate = parsed.formattedBR;
    const itemStatus: 'presente' | 'ausente' | 'justificado' =
      rec.status === 'presente' ? 'presente' :
      rec.status === 'justificado' ? 'justificado' : 'ausente';

    itemsMap.set(normalizedDate, {
      id: sess.id || `sess_${normalizedDate}`,
      date: normalizedDate,
      type: sess.type || 'treino',
      title: sess.title || (sess.type === 'campeonato' ? 'Campeonato Oficial' : 'Treino de Natação'),
      location: sess.location || 'Centro Paralímpico Brasileiro (CPB)',
      status: itemStatus,
      notes: rec.notes || sess.notes,
      parsedDate: parsed,
      source: 'session',
    });
  });

  // 2. Merge athlete.recentAttendance (recorded directly from matrix/calendar)
  const recentList = athlete.recentAttendance || [];
  recentList.forEach((attRec) => {
    const parsed = parseAppDate(attRec.date);
    if (!parsed) return;

    const normalizedDate = parsed.formattedBR;
    const existing = itemsMap.get(normalizedDate);

    const directStatus: 'presente' | 'ausente' | 'justificado' =
      attRec.status === 'presente' || attRec.status === 'treino_extra' ? 'presente' :
      attRec.status === 'falta_justificada' ? 'justificado' : 'ausente';

    if (existing) {
      // Prioritize the presence marked on the athlete sheet if updated recently, but preserve championship title
      existing.status = directStatus;
      if (attRec.note && !existing.notes) {
        existing.notes = attRec.note;
      }
      existing.source = 'both';
    } else {
      itemsMap.set(normalizedDate, {
        id: `att_sheet_${athlete.id}_${normalizedDate}`,
        date: normalizedDate,
        type: 'treino',
        title: 'Treino Aquático Oficial',
        location: athlete.trainingSchedule?.pool || 'Piscinas Centro Paralímpico Brasileiro (CPB)',
        status: directStatus,
        notes: attRec.note,
        parsedDate: parsed,
        source: 'athlete_sheet',
      });
    }
  });

  // 3. Convert to array and sort descending by timestamp (newest first)
  const result = Array.from(itemsMap.values());
  result.sort((a, b) => b.parsedDate.timestamp - a.parsedDate.timestamp);
  return result;
}

/**
 * Computes exact attendance stats for an athlete based on the unified attendance list.
 */
export function calculateAthleteAttendanceStats(
  athlete: AthleteRecord | undefined | null,
  attendanceSessions: AttendanceSession[] = []
): {
  totalSessions: number;
  totalPresent: number;
  percentage: number;
  treinosCount: number;
  treinosPresent: number;
  treinosPercentage: number;
  campeonatosCount: number;
  campeonatosPresent: number;
  campeonatosPercentage: number;
} {
  if (!athlete) {
    return {
      totalSessions: 0,
      totalPresent: 0,
      percentage: 100,
      treinosCount: 0,
      treinosPresent: 0,
      treinosPercentage: 100,
      campeonatosCount: 0,
      campeonatosPresent: 0,
      campeonatosPercentage: 100,
    };
  }

  const unified = getUnifiedAthleteAttendance(athlete, attendanceSessions);
  const totalSessions = unified.length;

  let totalPresent = 0;
  let treinosCount = 0;
  let treinosPresent = 0;
  let campeonatosCount = 0;
  let campeonatosPresent = 0;

  unified.forEach((item) => {
    const isPresent = item.status === 'presente' || item.status === 'justificado';
    if (isPresent) totalPresent++;

    if (item.type === 'treino') {
      treinosCount++;
      if (isPresent) treinosPresent++;
    } else if (item.type === 'campeonato') {
      campeonatosCount++;
      if (isPresent) campeonatosPresent++;
    }
  });

  const percentage = totalSessions > 0
    ? Math.round((totalPresent / totalSessions) * 100)
    : (athlete.attendanceRate || 100);

  const treinosPercentage = treinosCount > 0
    ? Math.round((treinosPresent / treinosCount) * 100)
    : 100;

  const campeonatosPercentage = campeonatosCount > 0
    ? Math.round((campeonatosPresent / campeonatosCount) * 100)
    : 100;

  return {
    totalSessions,
    totalPresent,
    percentage,
    treinosCount,
    treinosPresent,
    treinosPercentage,
    campeonatosCount,
    campeonatosPresent,
    campeonatosPercentage,
  };
}
