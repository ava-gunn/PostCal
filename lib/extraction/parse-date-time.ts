import * as chrono from 'chrono-node';
import { reportError } from '../report-error';

type ParsedResult = ReturnType<typeof chrono.parse>[number];

const COMPONENTS = ['year', 'month', 'day', 'weekday', 'hour', 'minute'] as const;

function specificity(result: ParsedResult): number {
  let score = 0;
  for (const c of COMPONENTS) {
    if (result.start.isCertain(c)) score += 1;
  }
  if (result.start.isCertain('hour')) score += 10;
  return score;
}

export function pickBestResult(results: ParsedResult[]): ParsedResult | null {
  if (results.length === 0) return null;
  return results.reduce((best, r) => {
    const bScore = specificity(best);
    const rScore = specificity(r);
    if (rScore > bScore) return r;
    if (rScore === bScore && r.index >= best.index) return r;
    return best;
  });
}

export function parseDateTime(rawText: string): { date: string | null; time: string | null } {
  try {
    const results = chrono.parse(rawText);
    const result = pickBestResult(results);

    if (!result) {
      return { date: null, time: null };
    }

    const year = result.start.get('year');
    const month = result.start.get('month');
    const day = result.start.get('day');

    if (year == null || month == null || day == null) {
      return { date: null, time: null };
    }

    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    let time: string | null = null;
    if (result.start.isCertain('hour')) {
      const hour = String(result.start.get('hour')).padStart(2, '0');
      const minute = String(result.start.get('minute') ?? 0).padStart(2, '0');
      time = `${hour}:${minute}`;
    }

    return { date, time };
  } catch (e) {
    reportError('extract.parse', e, { parser: 'date-time' });
    return { date: null, time: null };
  }
}
