/**
 * Ingests real CSV datasets from ../Data/ and builds app JSON.
 * Sources:
 *   - AB_NYC_2019.csv      → listings + neighborhood pricing/occupancy
 *   - hotel_bookings.csv   → seasonal demand + ADR forecast patterns
 *
 * Run: npm run build:data
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseCsvFile } from './csv-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../src/data');

const seedNeighborhoods = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'neighborhoods.seed.json'), 'utf8')
);
const countiesIndex = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'kenya-counties-index.json'), 'utf8')
);
const events = JSON.parse(fs.readFileSync(path.join(dataDir, 'events.json'), 'utf8'));

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const KSH_PER_USD = 78; // calibrated: NYC $100 ≈ Ksh 7,800

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function mean(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function round100(n) {
  return Math.round(n / 100) * 100;
}

function roomTypeToBedroom(roomType, price) {
  if (roomType === 'Shared room') return 'Studio';
  if (roomType === 'Private room') return price > 150 ? '1 BR' : 'Studio';
  if (price > 250) return '3 BR';
  if (price > 150) return '2 BR';
  return '1 BR';
}

function roomTypeToPropertyType(roomType) {
  if (roomType === 'Private room') return 'Private Room';
  if (roomType === 'Shared room') return 'Private Room';
  if (roomType === 'Hotel room') return 'Apartment';
  return 'Entire Home';
}

function availabilityToStatus(avail) {
  if (avail <= 60) return 'booked';
  if (avail >= 300) return 'available';
  return 'available';
}

function reviewsToRating(reviewsPerMonth, reviewCount) {
  const rpm = Number(reviewsPerMonth) || 0;
  const count = Number(reviewCount) || 0;
  if (count === 0) return 4.0;
  return Math.min(5, Math.round((4.0 + Math.min(1, rpm / 2) + Math.min(0.5, count / 100)) * 10) / 10);
}

function occLevel(o) {
  if (o >= 0.9) return 'peak';
  if (o >= 0.8) return 'high';
  if (o >= 0.65) return 'medium';
  if (o >= 0.5) return 'low';
  return 'cold';
}

// ─── Load CSVs ───────────────────────────────────────────────────────────────
console.log('Loading CSV datasets...');
const airbnbRaw = parseCsvFile('../Data/AB_NYC_2019.csv');
const hotelRaw = parseCsvFile('../Data/hotel_bookings.csv');

const airbnb = airbnbRaw.filter((r) => {
  const price = Number(r.price);
  return price > 20 && price < 2000 && r.neighbourhood;
});

console.log(`  Airbnb: ${airbnb.length} listings (of ${airbnbRaw.length})`);
console.log(`  Hotels: ${hotelRaw.length} booking records`);

// ─── NYC neighbourhood stats ─────────────────────────────────────────────────
const nycByHood = {};
for (const r of airbnb) {
  const nb = r.neighbourhood;
  if (!nycByHood[nb]) nycByHood[nb] = { prices: [], avail: [], reviews: [], rows: [] };
  nycByHood[nb].prices.push(Number(r.price));
  nycByHood[nb].avail.push(Number(r.availability_365) || 0);
  nycByHood[nb].reviews.push(Number(r.reviews_per_month) || 0);
  nycByHood[nb].rows.push(r);
}

const nycStats = Object.entries(nycByHood)
  .filter(([, d]) => d.rows.length >= 15)
  .map(([name, d]) => ({
    name,
    count: d.rows.length,
    medPrice: median(d.prices),
    occupancy: 1 - mean(d.avail) / 365,
    reviewRate: mean(d.reviews),
    rows: d.rows,
  }))
  .sort((a, b) => b.medPrice - a.medPrice);

// Rank-match NYC neighbourhoods → Nairobi areas by price tier
const nairobiSorted = [...seedNeighborhoods].sort((a, b) => b.priceTier - a.priceTier);
const nycToNairobi = {};
nycStats.forEach((nyc, i) => {
  const target = nairobiSorted[i % nairobiSorted.length];
  nycToNairobi[nyc.name] = target.id;
});

// ─── Build listings from real Airbnb rows ────────────────────────────────────
const listings = [];
const listingsByNairobi = {};

for (const r of airbnb) {
  const nairobiId = nycToNairobi[r.neighbourhood];
  if (!nairobiId) continue;

  const nycMed = nycStats.find((s) => s.name === r.neighbourhood)?.medPrice || Number(r.price);
  const nairobiSeed = seedNeighborhoods.find((n) => n.id === nairobiId);
  const nairobiMed = (nycMed * KSH_PER_USD * (0.85 + nairobiSeed.priceTier * 0.04)) / 1;

  const usdPrice = Number(r.price);
  const kshPrice = round100((usdPrice / nycMed) * nairobiMed);

  const listing = {
    id: `ab-${r.id}`,
    sourceId: r.id,
    name: r.name.slice(0, 60),
    neighborhood: nairobiId,
    countyId: 'nairobi',
    sourceNeighbourhood: r.neighbourhood,
    sourceBorough: r.neighbourhood_group,
    bedrooms: roomTypeToBedroom(r.room_type, usdPrice),
    propertyType: roomTypeToPropertyType(r.room_type),
    price: kshPrice,
    status: availabilityToStatus(Number(r.availability_365) || 365),
    rating: reviewsToRating(r.reviews_per_month, r.number_of_reviews),
    reviews: Number(r.number_of_reviews) || 0,
    availability365: Number(r.availability_365) || 0,
  };

  if (!listingsByNairobi[nairobiId]) listingsByNairobi[nairobiId] = [];
  listingsByNairobi[nairobiId].push(listing);
}

// Cap at 12 listings per neighborhood (best reviewed)
for (const [nid, rows] of Object.entries(listingsByNairobi)) {
  rows.sort((a, b) => b.reviews - a.reviews || b.rating - a.rating);
  listings.push(...rows.slice(0, 12));
}

console.log('listings:', listings.length);

// ─── Hotel booking patterns ──────────────────────────────────────────────────
const activeHotels = hotelRaw.filter((r) => r.is_canceled === '0' && Number(r.adr) > 0);
const monthVolume = {};
const monthAdr = {};
let weekendBookings = 0;
let weekdayBookings = 0;
let weekendAdrSum = 0;
let weekdayAdrSum = 0;

for (const r of activeHotels) {
  const m = r.arrival_date_month;
  monthVolume[m] = (monthVolume[m] || 0) + 1;
  monthAdr[m] = (monthAdr[m] || 0) + Number(r.adr);

  if (Number(r.stays_in_weekend_nights) > 0) {
    weekendBookings++;
    weekendAdrSum += Number(r.adr);
  } else {
    weekdayBookings++;
    weekdayAdrSum += Number(r.adr);
  }
}

const avgMonthVol = mean(Object.values(monthVolume));
const monthDemandIndex = {};
for (const m of MONTHS) {
  monthDemandIndex[m] = avgMonthVol ? (monthVolume[m] || avgMonthVol * 0.85) / avgMonthVol : 1;
}

const weekendOccBoost = 0.08;
const weekdayOccBoost = -0.04;
const weekendAdrPremium = weekdayAdrSum / weekdayBookings > 0
  ? (weekendAdrSum / weekendBookings) / (weekdayAdrSum / weekdayBookings)
  : 1.15;

console.log('  Hotel demand months:', Object.keys(monthVolume).length);
console.log('  Weekend ADR premium:', weekendAdrPremium.toFixed(2));

// ─── Neighborhood stats from real listings ───────────────────────────────────
const neighborhoods = seedNeighborhoods.map((seed) => {
  const nListings = listings.filter((l) => l.neighborhood === seed.id);
  const prices = nListings.map((l) => l.price);
  const ratings = nListings.map((l) => l.rating);
  const occFromAvail = nListings.map((l) => 1 - l.availability365 / 365);

  const avgPrice = prices.length ? Math.round(mean(prices)) : seed.priceTier * 1800;
  const occupancy = occFromAvail.length
    ? Math.round(mean(occFromAvail) * 100) / 100
    : 0.65;
  const demandScore = Math.min(
    95,
    Math.round(occupancy * 55 + (nListings.length / 12) * 25 + seed.priceTier * 4)
  );

  const booked = nListings.filter((l) => l.status === 'booked').length;
  const supplyGap = Math.max(0, Math.round(booked * 0.6 - nListings.length * 0.2));

  return {
    ...seed,
    demandScore,
    avgNightlyPrice: avgPrice,
    activeListings: nListings.length,
    occupancyRate: occupancy,
    supplyGap,
    avgRating: ratings.length
      ? Math.round(mean(ratings) * 10) / 10
      : 4.5,
    dataSource: 'AB_NYC_2019.csv',
  };
});

// ─── County market (Nairobi from real data, others from tiers) ───────────────
const COUNTY_TIERS = {
  nairobi: { demand: 85, price: 8200, occ: 0.74, listings: 520, gap: 12 },
  mombasa: { demand: 78, price: 6800, occ: 0.71, listings: 180, gap: 9 },
  kisumu: { demand: 68, price: 4500, occ: 0.65, listings: 95, gap: 6 },
  nakuru: { demand: 65, price: 4200, occ: 0.63, listings: 110, gap: 5 },
  default: { demand: 52, price: 3200, occ: 0.55, listings: 45, gap: 2 },
};

const nairobiAgg = neighborhoods.reduce(
  (acc, n) => ({
    demand: acc.demand + n.demandScore,
    price: acc.price + n.avgNightlyPrice,
    occ: acc.occ + n.occupancyRate,
    listings: acc.listings + n.activeListings,
    gap: acc.gap + n.supplyGap,
    count: acc.count + 1,
  }),
  { demand: 0, price: 0, occ: 0, listings: 0, gap: 0, count: 0 }
);

const countyMarket = countiesIndex.map((c) => {
  if (c.id === 'nairobi') {
    return {
      ...c,
      demandScore: Math.round(nairobiAgg.demand / nairobiAgg.count),
      avgNightlyPrice: Math.round(nairobiAgg.price / nairobiAgg.count),
      occupancyRate: Math.round((nairobiAgg.occ / nairobiAgg.count) * 100) / 100,
      activeListings: nairobiAgg.listings,
      supplyGap: Math.round(nairobiAgg.gap / nairobiAgg.count),
      shortTermRentalMarket: 'primary',
      dataSource: 'AB_NYC_2019.csv',
      topReviewThemes: ['great location', 'clean', 'fast wifi', 'secure'],
    };
  }
  const t = COUNTY_TIERS[c.id] ?? COUNTY_TIERS.default;
  const jitter = (c.code % 7) - 3;
  return {
    ...c,
    demandScore: Math.min(95, Math.max(35, t.demand + jitter)),
    avgNightlyPrice: Math.round((t.price + jitter * 120) / 100) * 100,
    occupancyRate: Math.min(0.92, Math.max(0.4, t.occ + jitter * 0.01)),
    activeListings: t.listings + jitter * 5,
    supplyGap: Math.max(0, t.gap + Math.floor(jitter / 2)),
    shortTermRentalMarket: t.demand >= 70 ? 'strong' : 'emerging',
    dataSource: 'estimated',
    topReviewThemes: ['good value', 'local experience', 'quiet area'],
  };
});

// ─── Forecast from hotel seasonality + events ───────────────────────────────
const DAY_MULT = { 0: 1.3, 1: 0.85, 2: 0.85, 3: 0.9, 4: 1.0, 5: 1.35, 6: 1.4 };
const forecast = {};
const start = new Date();

for (const n of neighborhoods) {
  forecast[n.id] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const day = d.getDay();
    const monthName = MONTHS[d.getMonth()];

    const event = events.find(
      (e) =>
        e.date === dateStr &&
        (e.neighborhoods.includes('all') || e.neighborhoods.includes(n.id))
    );

    const monthFactor = monthDemandIndex[monthName] ?? 1;
    const isWeekend = day === 5 || day === 6 || day === 0;
    const occBoost = (monthFactor - 1) * 0.25 + (isWeekend ? weekendOccBoost : weekdayOccBoost);
    const eventBoost = event ? (event.demandMultiplier - 1) * 0.35 : 0;

    const occupancy = Math.min(
      0.98,
      Math.max(0.35, n.occupancyRate + occBoost + eventBoost)
    );

    const adrFactor = monthFactor * (isWeekend ? weekendAdrPremium : 1);
    const eventMult = event?.demandMultiplier ?? 1;
    const price = round100(
      n.avgNightlyPrice * adrFactor * eventMult * (DAY_MULT[day] ?? 1)
    );

    forecast[n.id].push({
      date: dateStr,
      occupancy: Math.round(occupancy * 100) / 100,
      recommendedPrice: price,
      demandLevel: occLevel(occupancy),
      event: event ? { name: event.name, type: event.type } : null,
    });
  }
}

// ─── Metadata ────────────────────────────────────────────────────────────────
const dataSources = {
  builtAt: new Date().toISOString(),
  sources: [
    {
      file: 'Data/AB_NYC_2019.csv',
      records: airbnbRaw.length,
      usedFor: ['listings', 'neighborhood pricing', 'occupancy', 'ratings'],
      mappedTo: 'Nairobi neighborhoods via price-tier rank matching',
      listingsExported: listings.length,
    },
    {
      file: 'Data/hotel_bookings.csv',
      records: hotelRaw.length,
      usedFor: ['30-day demand forecast', 'seasonal occupancy', 'weekend ADR premium'],
      activeBookings: activeHotels.length,
      weekendAdrPremium: Math.round(weekendAdrPremium * 100) / 100,
    },
  ],
  nycNeighbourhoodsMapped: Object.keys(nycToNairobi).length,
  priceConversion: `${KSH_PER_USD} KSH per USD (neighborhood-relative scaling)`,
};

// ─── Write output ────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(dataDir, 'listings.json'), JSON.stringify(listings, null, 2));
fs.writeFileSync(path.join(dataDir, 'neighborhoods.json'), JSON.stringify(neighborhoods, null, 2));
fs.writeFileSync(path.join(dataDir, 'county-market.json'), JSON.stringify(countyMarket, null, 2));
fs.writeFileSync(path.join(dataDir, 'forecast.json'), JSON.stringify(forecast, null, 2));
fs.writeFileSync(path.join(dataDir, 'data-sources.json'), JSON.stringify(dataSources, null, 2));

console.log('county-market:', countyMarket.length);
console.log('forecast neighborhoods:', Object.keys(forecast).length);
console.log('Done — datasets built from real CSVs');
