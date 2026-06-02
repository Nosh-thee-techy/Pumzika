import events from '../data/events.json';
import { getComparablePrice, getForecastBaseline } from './dataService';

const DAY_MULTIPLIERS = {
  0: 1.3,
  1: 0.85,
  2: 0.85,
  3: 0.9,
  4: 1.0,
  5: 1.35,
  6: 1.4,
};

const BEDROOM_MULTIPLIERS = {
  Studio: 0.7,
  '1 BR': 0.85,
  '2 BR': 1.0,
  '3 BR': 1.3,
  '4+ BR': 1.6,
};

function getEventMultiplier(dateStr, neighborhoodId) {
  const event = events.find((e) => e.date === dateStr);
  if (!event) return 1.0;
  if (event.neighborhoods.includes('all') || event.neighborhoods.includes(neighborhoodId)) {
    return event.demandMultiplier;
  }
  return 1.0;
}

function getAmenityScore(amenities = []) {
  let score = 1.0;
  if (amenities.includes('Pool')) score *= 1.12;
  if (amenities.includes('Generator')) score *= 1.08;
  if (amenities.includes('Air Conditioning')) score *= 1.05;
  if (amenities.includes('Gym')) score *= 1.04;
  if (amenities.includes('Borehole Water')) score *= 1.03;
  return score;
}

export function calculateOptimalPrice(property, neighborhood, date = new Date()) {
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  const day = new Date(dateStr + 'T12:00:00').getDay();
  const neighborhoodId = neighborhood?.id ?? 'kilimani';

  const baseline = getForecastBaseline(neighborhoodId, dateStr);
  if (baseline?.recommendedPrice) {
    const amenityScore = getAmenityScore(property?.amenities);
    return Math.round((baseline.recommendedPrice * amenityScore) / 100) * 100;
  }

  const compBase = getComparablePrice(neighborhoodId, property?.bedrooms);
  const base = compBase || (neighborhood?.avgNightlyPrice ?? 7000);

  const eventMultiplier = getEventMultiplier(dateStr, neighborhoodId);
  const dayMultiplier = DAY_MULTIPLIERS[day] ?? 1.0;
  const amenityScore = getAmenityScore(property?.amenities);
  const bedroomMultiplier = BEDROOM_MULTIPLIERS[property?.bedrooms] ?? 1.0;

  const optimal = base * eventMultiplier * dayMultiplier * amenityScore * bedroomMultiplier;
  return Math.round(optimal / 100) * 100;
}

export function getPriceChangePercent(recommended, current) {
  if (!current || current === 0) return 0;
  return Math.round(((recommended - current) / current) * 100);
}

export function getPriceReasons(property, neighborhood, recommendedPrice, date = new Date()) {
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  const event = events.find(
    (e) =>
      e.date === dateStr &&
      (e.neighborhoods.includes('all') || e.neighborhoods.includes(neighborhood?.id))
  );

  const reasons = [];

  if (event) {
    const pct = Math.round((event.demandMultiplier - 1) * 100);
    reasons.push({
      icon: '🗓️',
      text: `${event.name} — demand surges ${pct}% in ${neighborhood?.name ?? 'your area'}`,
    });
  }

  const compPrice = getComparablePrice(neighborhood?.id, property?.bedrooms);
  reasons.push({
    icon: '🏘️',
    text: `Similar ${property.bedrooms} listings nearby averaging Ksh ${compPrice.toLocaleString()} tonight`,
  });

  const occ = Math.round((neighborhood?.occupancyRate ?? 0.7) * 100);
  reasons.push({
    icon: '📈',
    text: `Your occupancy last 7 days: ${occ}% — ${occ >= 70 ? 'above' : 'near'} neighborhood avg`,
  });

  return reasons.slice(0, 3);
}

export function getConfidence(property, neighborhood) {
  let score = 68;
  const listingCount = neighborhood?.activeListings ?? 0;
  if (listingCount >= 5) score += 10;
  if (property.amenities?.length >= 3) score += 8;
  if (neighborhood?.supplyGap > 8) score += 7;
  if (neighborhood?.demandScore > 75) score += 5;
  if (neighborhood?.avgRating >= 4.5) score += 4;
  return Math.min(95, score);
}

export function calculateMoneyLeftBehind(property, neighborhood) {
  if (!property?.currentPrice || !neighborhood) return 0;
  const today = new Date().toISOString().split('T')[0];
  const recommended = calculateOptimalPrice(property, neighborhood, today);
  const dailyGap = Math.max(0, recommended - property.currentPrice);
  const estimatedBookingDays = Math.round((neighborhood.occupancyRate ?? 0.65) * 7);
  return Math.round((dailyGap * estimatedBookingDays) / 100) * 100;
}
