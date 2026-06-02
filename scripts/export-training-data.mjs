/**
 * Exports model-ready training CSVs for the ML notebook.
 *
 * Outputs (Data/training/):
 *   listings-pricing.csv   → XGBoost: price regression features + target
 *   occupancy-daily.csv    → Prophet: daily occupancy per neighborhood
 *   dataset-manifest.json  → schema + row counts for the dataset guy
 *
 * Run: npm run export:training
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseCsvFile } from './csv-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../src/data');
const trainingDir = path.join(__dirname, '../Data/training');

const seedNeighborhoods = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'neighborhoods.seed.json'), 'utf8')
);

const MONTHS = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
};

const KSH_PER_USD = 78;

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

function reviewsToRating(reviewsPerMonth, reviewCount) {
  const rpm = Number(reviewsPerMonth) || 0;
  const count = Number(reviewCount) || 0;
  if (count === 0) return 4.0;
  return Math.min(5, Math.round((4.0 + Math.min(1, rpm / 2) + Math.min(0.5, count / 100)) * 10) / 10);
}

function csvEscape(val) {
  const s = String(val ?? '');
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

function writeCsv(filePath, headers, rows) {
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => csvEscape(row[h])).join(','));
  }
  fs.writeFileSync(filePath, lines.join('\n') + '\n');
}

// ─── Load source CSVs ────────────────────────────────────────────────────────
console.log('Exporting model training datasets...');
const airbnbRaw = parseCsvFile('../Data/AB_NYC_2019.csv');
const hotelRaw = parseCsvFile('../Data/hotel_bookings.csv');

const airbnb = airbnbRaw.filter((r) => {
  const price = Number(r.price);
  return price > 20 && price < 2000 && r.neighbourhood;
});

// NYC → Nairobi rank mapping (same logic as build-datasets.mjs)
const nycByHood = {};
for (const r of airbnb) {
  const nb = r.neighbourhood;
  if (!nycByHood[nb]) nycByHood[nb] = { prices: [], avail: [], rows: [] };
  nycByHood[nb].prices.push(Number(r.price));
  nycByHood[nb].avail.push(Number(r.availability_365) || 0);
  nycByHood[nb].rows.push(r);
}

const nycStats = Object.entries(nycByHood)
  .filter(([, d]) => d.rows.length >= 15)
  .map(([name, d]) => ({
    name,
    medPrice: median(d.prices),
    rows: d.rows,
  }))
  .sort((a, b) => b.medPrice - a.medPrice);

const nairobiSorted = [...seedNeighborhoods].sort((a, b) => b.priceTier - a.priceTier);
const nycToNairobi = {};
nycStats.forEach((nyc, i) => {
  nycToNairobi[nyc.name] = nairobiSorted[i % nairobiSorted.length].id;
});

// ─── 1. Listings pricing dataset (XGBoost) ───────────────────────────────────
const pricingRows = [];

for (const r of airbnb) {
  const nairobiId = nycToNairobi[r.neighbourhood];
  if (!nairobiId) continue;

  const nycMed = nycStats.find((s) => s.name === r.neighbourhood)?.medPrice || Number(r.price);
  const nairobiSeed = seedNeighborhoods.find((n) => n.id === nairobiId);
  const nairobiMed = nycMed * KSH_PER_USD * (0.85 + nairobiSeed.priceTier * 0.04);
  const usdPrice = Number(r.price);
  const kshPrice = round100((usdPrice / nycMed) * nairobiMed);
  const avail = Number(r.availability_365) || 365;
  const occupancy = Math.round((1 - avail / 365) * 1000) / 1000;

  pricingRows.push({
    listing_id: r.id,
    neighborhood: nairobiId,
    bedrooms: roomTypeToBedroom(r.room_type, usdPrice),
    property_type: roomTypeToPropertyType(r.room_type),
    price_ksh: kshPrice,
    occupancy_rate: occupancy,
    rating: reviewsToRating(r.reviews_per_month, r.number_of_reviews),
    review_count: Number(r.number_of_reviews) || 0,
    price_tier: nairobiSeed.priceTier,
    source_neighbourhood: r.neighbourhood,
    last_review: r.last_review || '',
  });
}

// ─── 2. Daily occupancy time series (Prophet) ────────────────────────────────
// Hotel bookings → market-wide daily demand index
const activeHotels = hotelRaw.filter((r) => r.is_canceled === '0');
const dailyBookings = {};

for (const r of activeHotels) {
  const month = MONTHS[r.arrival_date_month];
  if (!month) continue;
  const dateStr = `${r.arrival_date_year}-${String(month).padStart(2, '0')}-${String(Number(r.arrival_date_day_of_month)).padStart(2, '0')}`;
  dailyBookings[dateStr] = (dailyBookings[dateStr] || 0) + 1;
}

const sortedDates = Object.keys(dailyBookings).sort();
const maxDaily = Math.max(...Object.values(dailyBookings));
const avgDaily = mean(Object.values(dailyBookings));

// Airbnb last_review → activity proxy per Nairobi neighborhood
const reviewActivityByHood = {};
for (const r of airbnb) {
  const nairobiId = nycToNairobi[r.neighbourhood];
  if (!nairobiId || !r.last_review) continue;
  reviewActivityByHood[nairobiId] = (reviewActivityByHood[nairobiId] || 0) + 1;
}

const neighborhoodBaseOcc = {};
for (const seed of seedNeighborhoods) {
  const hoodListings = pricingRows.filter((l) => l.neighborhood === seed.id);
  neighborhoodBaseOcc[seed.id] = hoodListings.length
    ? mean(hoodListings.map((l) => l.occupancy_rate))
    : 0.55 + seed.priceTier * 0.03;
}

const occupancyRows = [];
for (const dateStr of sortedDates) {
  const marketIndex = dailyBookings[dateStr] / avgDaily;
  const dow = new Date(dateStr + 'T12:00:00').getDay();
  const weekendBoost = dow === 5 || dow === 6 || dow === 0 ? 0.06 : -0.03;

  for (const seed of seedNeighborhoods) {
    const activityWeight = (reviewActivityByHood[seed.id] || 50) / 500;
    const base = neighborhoodBaseOcc[seed.id];
    const occ = Math.min(
      0.98,
      Math.max(0.25, base * (0.85 + marketIndex * 0.15 * (1 + activityWeight)) + weekendBoost)
    );

    occupancyRows.push({
      date: dateStr,
      neighborhood: seed.id,
      occupancy: Math.round(occ * 1000) / 1000,
      booking_count: Math.round(dailyBookings[dateStr] * (0.7 + seed.priceTier * 0.06)),
    });
  }
}

// ─── Write outputs ───────────────────────────────────────────────────────────
fs.mkdirSync(trainingDir, { recursive: true });

const pricingHeaders = [
  'listing_id', 'neighborhood', 'bedrooms', 'property_type',
  'price_ksh', 'occupancy_rate', 'rating', 'review_count',
  'price_tier', 'source_neighbourhood', 'last_review',
];

const occupancyHeaders = ['date', 'neighborhood', 'occupancy', 'booking_count'];

writeCsv(path.join(trainingDir, 'listings-pricing.csv'), pricingHeaders, pricingRows);
writeCsv(path.join(trainingDir, 'occupancy-daily.csv'), occupancyHeaders, occupancyRows);

const manifest = {
  exportedAt: new Date().toISOString(),
  purpose: 'Training data for XGBoost (pricing) and Prophet (forecasting)',
  files: {
    'listings-pricing.csv': {
      model: 'XGBoost regression',
      target: 'price_ksh',
      features: ['neighborhood', 'bedrooms', 'property_type', 'occupancy_rate', 'rating', 'review_count', 'price_tier'],
      rows: pricingRows.length,
      description: 'Historical listings with price + occupancy outcomes',
    },
    'occupancy-daily.csv': {
      model: 'Facebook Prophet',
      target: 'occupancy',
      timeColumn: 'date',
      groupColumn: 'neighborhood',
      rows: occupancyRows.length,
      dateRange: sortedDates.length
        ? { from: sortedDates[0], to: sortedDates[sortedDates.length - 1] }
        : null,
      description: 'Daily occupancy per neighborhood derived from booking dates',
    },
  },
  idealRealDataSchema: {
    listingsPricing: {
      required: ['neighborhood', 'bedrooms', 'price_ksh', 'occupancy_rate'],
      optional: ['property_type', 'rating', 'review_count', 'booking_date', 'amenities'],
    },
    occupancyDaily: {
      required: ['date', 'neighborhood', 'occupancy'],
      optional: ['booking_count', 'adr_ksh'],
    },
  },
  sources: [
    { file: 'Data/AB_NYC_2019.csv', usedFor: 'listings-pricing.csv' },
    { file: 'Data/hotel_bookings.csv', usedFor: 'occupancy-daily.csv (booking dates)' },
  ],
};

fs.writeFileSync(
  path.join(trainingDir, 'dataset-manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log(`  listings-pricing.csv: ${pricingRows.length} rows`);
console.log(`  occupancy-daily.csv:  ${occupancyRows.length} rows (${seedNeighborhoods.length} neighborhoods × ${sortedDates.length} days)`);
console.log(`  dataset-manifest.json written`);
console.log('Done — training data ready for notebooks/pumzika_ml.ipynb');
