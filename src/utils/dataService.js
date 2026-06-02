import neighborhoods from '../data/neighborhoods.json';
import listings from '../data/listings.json';
import countyMarket from '../data/county-market.json';
import forecastBaselines from '../data/forecast.json';
import dataSources from '../data/data-sources.json';
import nairobiConstituencies from '../data/nairobi-constituencies.json';
import events from '../data/events.json';

const byId = (arr, key = 'id') => Object.fromEntries(arr.map((x) => [x[key], x]));

const neighborhoodMap = byId(neighborhoods);
const countyMap = byId(countyMarket);

export { neighborhoods, listings, countyMarket, events, nairobiConstituencies, forecastBaselines, dataSources };

export function getCounty(codeOrId) {
  if (typeof codeOrId === 'number') return countyMarket.find((c) => c.code === codeOrId);
  return countyMap[codeOrId] ?? countyMarket.find((c) => c.id === codeOrId);
}

export function getNeighborhood(idOrName) {
  const id = idOrName?.toLowerCase?.().replace(/\s+/g, '-');
  return neighborhoodMap[id] ?? neighborhoods.find((n) => n.name === idOrName);
}

export function getListingsForNeighborhood(neighborhoodId, bedroomFilter) {
  let rows = listings.filter((l) => l.neighborhood === neighborhoodId);
  if (bedroomFilter) rows = rows.filter((l) => l.bedrooms === bedroomFilter);
  return rows.sort((a, b) => a.price - b.price);
}

export function getListingById(id) {
  return listings.find((l) => l.id === id) ?? null;
}

const NEIGHBORHOOD_VIBES = {
  westlands: ['lively', 'restaurants', 'social'],
  kilimani: ['lively', 'restaurants', 'social'],
  karen: ['quiet', 'family'],
  lavington: ['quiet', 'family'],
  langata: ['quiet', 'family'],
  gigiri: ['business', 'quiet'],
  parklands: ['lively', 'restaurants'],
  upperhill: ['business'],
  kileleshwa: ['lively', 'social'],
  runda: ['quiet', 'family'],
  muthaiga: ['quiet', 'family'],
  'south-b': ['lively', 'social'],
  'south-c': ['lively'],
  'ngong-road': ['lively', 'restaurants'],
  'thika-road': ['business'],
};

export function getComparablePrice(neighborhoodId, bedrooms) {
  const rows = getListingsForNeighborhood(neighborhoodId, bedrooms);
  if (!rows.length) {
    const n = getNeighborhood(neighborhoodId);
    return n?.avgNightlyPrice ?? 7000;
  }
  return Math.round(rows.reduce((s, l) => s + l.price, 0) / rows.length);
}

export function enrichNeighborhood(raw) {
  if (!raw) return null;
  const n = getNeighborhood(raw.id ?? raw.neighborhood ?? raw.name) ?? raw;
  const nListings = getListingsForNeighborhood(n.id);
  if (!nListings.length) return n;

  const prices = nListings.map((l) => l.price);
  const ratings = nListings.map((l) => l.rating);
  return {
    ...n,
    activeListings: nListings.length,
    avgNightlyPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    avgRating: Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    vibes: NEIGHBORHOOD_VIBES[n.id] ?? ['lively'],
    guestRating: n.avgRating ?? 4.5,
    negativeThemes: ['noise weekends', 'parking'],
  };
}

export function getForecastBaseline(neighborhoodId, dateStr) {
  return forecastBaselines[neighborhoodId]?.find((d) => d.date === dateStr) ?? null;
}

export function getNeighborhoodsForCounty(countyId) {
  return neighborhoods.filter((n) => n.countyId === countyId);
}

export function getMarketSummary() {
  const nairobi = getCounty('nairobi');
  return {
    avgPriceTonight: nairobi?.avgNightlyPrice ?? 8200,
    activeListings: countyMarket.reduce((s, c) => s + c.activeListings, 0),
    avgOccupancy: Math.round(
      (countyMarket.reduce((s, c) => s + c.occupancyRate, 0) / countyMarket.length) * 100
    ),
  };
}

export function aggregateCountyFromNeighborhoods(countyId = 'nairobi') {
  const areas = getNeighborhoodsForCounty(countyId);
  if (!areas.length) return getCounty(countyId);
  return {
    ...getCounty(countyId),
    demandScore: Math.round(areas.reduce((s, n) => s + n.demandScore, 0) / areas.length),
    avgNightlyPrice: Math.round(areas.reduce((s, n) => s + n.avgNightlyPrice, 0) / areas.length),
    occupancyRate:
      Math.round((areas.reduce((s, n) => s + n.occupancyRate, 0) / areas.length) * 100) / 100,
    activeListings: areas.reduce((s, n) => s + n.activeListings, 0),
  };
}
