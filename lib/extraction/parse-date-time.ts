import * as chrono from 'chrono-node';
import { reportError } from '../report-error';

export function parseDateTime(rawText: string): { date: string | null; time: string | null } {
  try {
    const results = chrono.parse(rawText);

    if (results.length === 0) {
      return { date: null, time: null };
    }

    const result = results[0];

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
