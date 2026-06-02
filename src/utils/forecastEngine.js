import events from '../data/events.json';
import { calculateOptimalPrice } from './priceEngine';

const DEMAND_LEVELS = ['cold', 'low', 'medium', 'high', 'peak'];

function occupancyToLevel(occupancy) {
  if (occupancy >= 0.9) return 'peak';
  if (occupancy >= 0.8) return 'high';
  if (occupancy >= 0.65) return 'medium';
  if (occupancy >= 0.5) return 'low';
  return 'cold';
}

function getDayOccupancy(base, dateStr, neighborhoodId) {
  const day = new Date(dateStr + 'T12:00:00').getDay();
  const weekendBoost = day === 5 || day === 6 || day === 0 ? 0.12 : 0;
  const event = events.find(
    (e) =>
      e.date === dateStr &&
      (e.neighborhoods.includes('all') || e.neighborhoods.includes(neighborhoodId))
  );
  const eventBoost = event ? (event.demandMultiplier - 1) * 0.35 : 0;
  const noise = ((dateStr.charCodeAt(8) + dateStr.charCodeAt(9)) % 10) / 100;
  return Math.min(0.98, Math.max(0.35, base + weekendBoost + eventBoost + noise));
}

export function generateForecast(property, neighborhood, startDate = new Date(), days = 30) {
  const base = neighborhood?.occupancyRate ?? 0.7;
  const neighborhoodId = neighborhood?.id ?? 'kilimani';
  const forecast = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const occupancy = getDayOccupancy(base, dateStr, neighborhoodId);
    const recommendedPrice = calculateOptimalPrice(property, neighborhood, dateStr);
    const demandLevel = occupancyToLevel(occupancy);

    const event = events.find(
      (e) =>
        e.date === dateStr &&
        (e.neighborhoods.includes('all') || e.neighborhoods.includes(neighborhoodId))
    );

    forecast.push({
      date: dateStr,
      occupancy,
      recommendedPrice,
      demandLevel,
      event: event
        ? { name: event.name, type: event.type, icon: event.type === 'holiday' ? '🎉' : '🏃' }
        : null,
      reason: event
        ? `${event.name} — expect ${demandLevel} demand`
        : occupancy >= 0.8
          ? 'Strong weekend demand expected'
          : occupancy < 0.55
            ? 'Midweek lull — consider a discount'
            : 'Steady neighborhood demand',
      action:
        demandLevel === 'peak'
          ? 'Price up — high demand window'
          : demandLevel === 'cold'
            ? 'Drop minimum stay or offer midweek discount'
            : 'Hold current strategy',
    });
  }

  return forecast;
}

export function getDemandCellStyle(level) {
  const map = {
    cold: { bg: 'var(--demand-1)', text: '#2d6a9f', level: 1 },
    low: { bg: 'var(--demand-2)', text: '#2d6a9f', level: 2 },
    medium: { bg: 'var(--demand-3)', text: '#9b6e1a', level: 3 },
    high: { bg: 'var(--demand-4)', text: '#7a4f0a', level: 4 },
    peak: { bg: 'var(--bg-inverse)', text: '#ffffff', level: 5 },
  };
  return map[level] ?? map.medium;
}

/** @deprecated use getDemandCellStyle */
export function getDemandColor(level) {
  return getDemandCellStyle(level).bg;
}

export function getActionPrompts(forecast) {
  const prompts = [];
  const peakDays = forecast.filter((d) => d.demandLevel === 'peak' || d.demandLevel === 'high');
  const coldDays = forecast.filter((d) => d.demandLevel === 'cold' || d.occupancy < 0.55);

  if (peakDays.length > 0) {
    const first = peakDays[0];
    const last = peakDays[Math.min(2, peakDays.length - 1)];
    prompts.push({
      urgency: 'urgent',
      icon: '🔴',
      text: `Price up ${formatShortDate(first.date)}${peakDays.length > 1 ? `–${formatShortDate(last.date)}` : ''} — ${first.event?.name ?? 'high demand'}, don't leave money behind`,
    });
  }

  if (coldDays.length > 0) {
    const gap = coldDays[0];
    prompts.push({
      urgency: 'week',
      icon: '🟡',
      text: `Drop minimum stay to 1 night for ${formatShortDate(gap.date)} — midweek gap`,
    });
  }

  const marathon = forecast.find((d) => d.event?.name?.includes('Marathon'));
  if (marathon) {
    prompts.push({
      urgency: 'plan',
      icon: '🟢',
      text: `Block ${formatShortDate(marathon.date)} early or push price to Ksh ${(marathon.recommendedPrice + 1500).toLocaleString()} — Nairobi marathon`,
    });
  } else {
    prompts.push({
      urgency: 'plan',
      icon: '🟢',
      text: 'Review pricing every Monday — market shifts fast in Nairobi',
    });
  }

  return prompts.slice(0, 3);
}

function formatShortDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' });
}

export function getForecastSummary(forecast) {
  const avgOcc = forecast.reduce((s, d) => s + d.occupancy, 0) / forecast.length;
  const peakCount = forecast.filter((d) => d.demandLevel === 'peak' || d.demandLevel === 'high').length;
  return `${Math.round(avgOcc * 100)}% avg occupancy, ${peakCount} high-demand days in next 30 days`;
}
