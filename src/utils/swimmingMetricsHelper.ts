import { SwimmingMetric, SwimmingStroke } from '../types';

export const STROKE_OPTIONS: SwimmingStroke[] = ['Livre', 'Costas', 'Peito', 'Borboleta', 'Medley'];

export const EVENT_PRESETS: { event: string; stroke: SwimmingStroke; distance: string }[] = [
  // Livre
  { event: '50m Livre', stroke: 'Livre', distance: '50m' },
  { event: '100m Livre', stroke: 'Livre', distance: '100m' },
  { event: '200m Livre', stroke: 'Livre', distance: '200m' },
  { event: '400m Livre', stroke: 'Livre', distance: '400m' },
  { event: '800m Livre', stroke: 'Livre', distance: '800m' },
  // Costas
  { event: '50m Costas', stroke: 'Costas', distance: '50m' },
  { event: '100m Costas', stroke: 'Costas', distance: '100m' },
  { event: '200m Costas', stroke: 'Costas', distance: '200m' },
  // Peito
  { event: '50m Peito', stroke: 'Peito', distance: '50m' },
  { event: '100m Peito', stroke: 'Peito', distance: '100m' },
  { event: '200m Peito', stroke: 'Peito', distance: '200m' },
  // Borboleta
  { event: '50m Borboleta', stroke: 'Borboleta', distance: '50m' },
  { event: '100m Borboleta', stroke: 'Borboleta', distance: '100m' },
  { event: '200m Borboleta', stroke: 'Borboleta', distance: '200m' },
  // Medley
  { event: '150m Medley', stroke: 'Medley', distance: '150m' },
  { event: '200m Medley', stroke: 'Medley', distance: '200m' },
  { event: '400m Medley', stroke: 'Medley', distance: '400m' },
];

/**
 * Identify swimming stroke from event string
 */
export function getStrokeFromEvent(eventName: string): SwimmingStroke {
  const lower = (eventName || '').toLowerCase();
  if (lower.includes('costas')) return 'Costas';
  if (lower.includes('peito')) return 'Peito';
  if (lower.includes('borboleta') || lower.includes('fly')) return 'Borboleta';
  if (lower.includes('medley')) return 'Medley';
  return 'Livre';
}

/**
 * Parse time string (e.g. "00:29.80", "01:06.40", "29.80", "1:06.4") into total seconds
 */
export function parseTimeToSeconds(timeStr: string): number {
  if (!timeStr) return 999999;
  const clean = timeStr.trim().replace(',', '.');
  
  // Format MM:SS.CC or M:SS.CC
  if (clean.includes(':')) {
    const parts = clean.split(':');
    const minutes = parseFloat(parts[0]) || 0;
    const seconds = parseFloat(parts[1]) || 0;
    return minutes * 60 + seconds;
  }
  
  // Format SS.CC
  const val = parseFloat(clean);
  return isNaN(val) ? 999999 : val;
}

/**
 * Format total seconds into standard "MM:SS.CC" or "SS.CC"
 */
export function formatSecondsToTime(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds <= 0 || totalSeconds >= 999990) return '--:--.--';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const hundredths = Math.round((totalSeconds - Math.floor(totalSeconds)) * 100);

  const minStr = String(minutes).padStart(2, '0');
  const secStr = String(seconds).padStart(2, '0');
  const hunStr = String(hundredths).padStart(2, '0');

  return `${minStr}:${secStr}.${hunStr}`;
}

/**
 * Calculates evolution / time difference between two times
 * e.g., current: "00:29.80", previous: "00:30.65" -> "-0.85s" (improved)
 */
export function calculateTimeDifference(currentTimeStr: string, previousTimeStr: string): {
  diffText: string;
  diffSeconds: number;
  isImproved: boolean;
} {
  const currentSec = parseTimeToSeconds(currentTimeStr);
  const prevSec = parseTimeToSeconds(previousTimeStr);

  if (currentSec >= 999990 || prevSec >= 999990) {
    return { diffText: '', diffSeconds: 0, isImproved: false };
  }

  const diff = currentSec - prevSec;
  const isImproved = diff < 0;
  const sign = diff > 0 ? '+' : '';
  const diffText = `${sign}${diff.toFixed(2)}s`;

  return {
    diffText,
    diffSeconds: diff,
    isImproved,
  };
}

export interface RankedMetric extends SwimmingMetric {
  rank: number; // 1 = Recorde Pessoal / Ouro, 2 = Prata, etc.
  stroke: SwimmingStroke;
  timeInSeconds: number;
  differenceFromBest?: string; // "+0.45s vs RP"
  differenceFromPrevious?: string; // "-0.80s vs campeonato anterior"
}

export interface EventGroup {
  event: string;
  stroke: SwimmingStroke;
  bestMetric: RankedMetric;
  allMetrics: RankedMetric[];
}

/**
 * Groups swimming metrics by event, orders by best time, marks rankings and differences
 */
export function groupAndRankMetrics(metrics: SwimmingMetric[]): {
  byStroke: Record<SwimmingStroke, EventGroup[]>;
  allEventGroups: EventGroup[];
  totalRecordsCount: number;
} {
  if (!metrics || metrics.length === 0) {
    return {
      byStroke: {
        Livre: [],
        Costas: [],
        Peito: [],
        Borboleta: [],
        Medley: [],
      },
      allEventGroups: [],
      totalRecordsCount: 0,
    };
  }

  // Group by event name (e.g. "50m Livre")
  const eventMap = new Map<string, SwimmingMetric[]>();

  metrics.forEach((m) => {
    const eventName = m.event || '50m Livre';
    if (!eventMap.has(eventName)) {
      eventMap.set(eventName, []);
    }
    eventMap.get(eventName)!.push(m);
  });

  const allEventGroups: EventGroup[] = [];
  const byStroke: Record<SwimmingStroke, EventGroup[]> = {
    Livre: [],
    Costas: [],
    Peito: [],
    Borboleta: [],
    Medley: [],
  };

  eventMap.forEach((metricList, eventName) => {
    const stroke = metricList[0]?.stroke || getStrokeFromEvent(eventName);

    // Sort by best time (fastest first)
    const sorted = [...metricList].sort((a, b) => {
      const secA = parseTimeToSeconds(a.bestTime);
      const secB = parseTimeToSeconds(b.bestTime);
      return secA - secB;
    });

    const bestSec = parseTimeToSeconds(sorted[0].bestTime);

    // Add rank and differences
    const rankedList: RankedMetric[] = sorted.map((item, index) => {
      const itemSec = parseTimeToSeconds(item.bestTime);
      const diffFromBest = index === 0 ? '' : `+${(itemSec - bestSec).toFixed(2)}s`;
      
      let diffFromPrev = '';
      if (item.previousTime) {
        const delta = calculateTimeDifference(item.bestTime, item.previousTime);
        diffFromPrev = delta.diffText;
      }

      return {
        ...item,
        stroke,
        rank: index + 1,
        timeInSeconds: itemSec,
        differenceFromBest: diffFromBest,
        differenceFromPrevious: diffFromPrev || item.evolution,
        isPersonalBest: index === 0,
      };
    });

    const group: EventGroup = {
      event: eventName,
      stroke,
      bestMetric: rankedList[0],
      allMetrics: rankedList,
    };

    allEventGroups.push(group);
    if (byStroke[stroke]) {
      byStroke[stroke].push(group);
    }
  });

  // Sort event groups by stroke order and distance
  allEventGroups.sort((a, b) => {
    const strokeOrder: Record<SwimmingStroke, number> = {
      Livre: 1,
      Costas: 2,
      Peito: 3,
      Borboleta: 4,
      Medley: 5,
    };
    const orderDiff = strokeOrder[a.stroke] - strokeOrder[b.stroke];
    if (orderDiff !== 0) return orderDiff;
    return a.event.localeCompare(b.event);
  });

  return {
    byStroke,
    allEventGroups,
    totalRecordsCount: metrics.length,
  };
}
