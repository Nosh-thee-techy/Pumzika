import events from '../data/events.json';

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
  if (amenities.includes('Pool')) return 1.12;
  if (amenities.includes('Generator')) return 1.08;
  if (amenities.includes('Air Conditioning')) return 1.05;
  return 1.0;
}

export function calculateOptimalPrice(property, neighborhood, date = new Date()) {
  const dateStr =
    typeof date === 'string'
      ? date
      : date.toISOString().split('T')[0];
  const day = new Date(dateStr + 'T12:00:00').getDay();
  const base = neighborhood?.avgNightlyPrice ?? 7000;
  const neighborhoodId = neighborhood?.id ?? 'kilimani';

  const eventMultiplier = getEventMultiplier(dateStr, neighborhoodId);
  const dayMultiplier = DAY_MULTIPLIERS[day] ?? 1.0;
  const amenityScore = getAmenityScore(property.amenities);
  const bedroomMultiplier = BEDROOM_MULTIPLIERS[property.bedrooms] ?? 1.0;

  const optimal =
    base * eventMultiplier * dayMultiplier * amenityScore * bedroomMultiplier;

  return Math.round(optimal / 100) * 100;
}

export function getPriceChangePercent(recommended, current) {
  if (!current || current === 0) return 0;
  return Math.round(((recommended - current) / current) * 100);
}

export function getPriceReasons(property, neighborhood, recommendedPrice, date = new Date()) {
  const dateStr =
    typeof date === 'string'
      ? date
      : date.toISOString().split('T')[0];
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

  const compPrice = Math.round((neighborhood?.avgNightlyPrice ?? 7000) * (BEDROOM_MULTIPLIERS[property.bedrooms] ?? 1));
  reasons.push({
    icon: '🏘️',
    text: `Similar ${property.bedrooms} listings nearby averaging Ksh ${compPrice.toLocaleString()} tonight`,
  });

  const occ = Math.round((neighborhood?.occupancyRate ?? 0.7) * 100);
  reasons.push({
    icon: '📈',
    text: `Neighborhood occupancy: ${occ}% — ${occ >= 70 ? 'above' : 'near'} market average`,
  });

  return reasons.slice(0, 3);
}

export function getConfidence(property, neighborhood) {
  let score = 72;
  if (property.amenities?.length >= 3) score += 8;
  if (neighborhood?.supplyGap > 8) score += 7;
  if (neighborhood?.demandScore > 75) score += 5;
  return Math.min(95, score);
}
