import { getComparablePrice } from './dataService';

export function getFairnessVerdict(currentPrice, marketPrice) {
  if (!marketPrice) return 'fair';
  if (currentPrice <= marketPrice * 0.95) return 'great-deal';
  if (currentPrice >= marketPrice * 1.1) return 'overpriced';
  return 'fair';
}

export function getFairnessPct(currentPrice, marketPrice) {
  if (!marketPrice) return 0;
  return Math.round(((marketPrice - currentPrice) / marketPrice) * 100);
}

export function getListingInsights(listing, neighborhood) {
  const marketPrice =
    listing.recommendedPrice ??
    getComparablePrice(listing.neighborhood, listing.bedrooms) ??
    neighborhood?.avgNightlyPrice ??
    listing.price;

  const currentPrice = listing.currentPrice ?? listing.price;
  const verdict = getFairnessVerdict(currentPrice, marketPrice);
  const fairnessPct = getFairnessPct(currentPrice, marketPrice);

  const positiveThemes = listing.positiveThemes ?? neighborhood?.topReviewThemes ?? ['location', 'clean'];
  const neutralThemes = listing.neutralThemes ?? neighborhood?.negativeThemes ?? ['noise weekends'];
  const sentimentScore = listing.sentimentScore ?? 0.78;

  return {
    marketPrice,
    currentPrice,
    fairnessVerdict: verdict,
    fairnessPct,
    sentimentBreakdown: {
      positive: sentimentScore,
      neutral: Math.round((1 - sentimentScore) * 0.6 * 100) / 100,
      negative: Math.round((1 - sentimentScore) * 0.4 * 100) / 100,
    },
    positiveThemes,
    neutralThemes,
    shouldBookNow: listing.bookingUrgency === 'high' || verdict === 'great-deal',
    valueScore: listing.valueScore ?? Math.min(95, Math.round(70 + fairnessPct * 0.5 + (listing.rating ?? 4) * 4)),
    priceHistory30d: listing.priceHistory30d ?? neighborhood?.priceHistory30d ?? [],
  };
}

export function getNeighborhoodMatch(neighborhood, guestPrefs) {
  if (!guestPrefs?.vibes?.length) return 75;

  const hoodVibes = neighborhood.vibes ?? [];
  const overlap = guestPrefs.vibes.filter((v) => hoodVibes.includes(v)).length;
  const vibeScore = hoodVibes.length ? (overlap / guestPrefs.vibes.length) * 50 : 25;

  const budgetMid = (guestPrefs.budgetMin + guestPrefs.budgetMax) / 2;
  const priceDiff = Math.abs((neighborhood.avgNightlyPrice ?? budgetMid) - budgetMid);
  const budgetScore = Math.max(0, 50 - (priceDiff / budgetMid) * 50);

  return Math.min(99, Math.round(vibeScore + budgetScore));
}

export function getGuestQuickStats(neighborhoods, guestPrefs) {
  const sorted = [...neighborhoods].sort((a, b) => a.avgNightlyPrice - b.avgNightlyPrice);
  const bestValue = sorted[0];
  const inBudget = neighborhoods.filter(
    (n) => n.avgNightlyPrice >= guestPrefs.budgetMin && n.avgNightlyPrice <= guestPrefs.budgetMax
  );

  return {
    bestValueArea: bestValue?.name ?? 'Karen',
    bestValuePct: 12,
    cheapestNight: 'Tuesday',
    cheapestPct: 18,
    listingsInBudget: inBudget.reduce((s, n) => s + n.activeListings, 0),
    avgGuestRating: 4.5,
  };
}
