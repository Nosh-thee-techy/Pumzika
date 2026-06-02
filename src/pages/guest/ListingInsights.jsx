import { useParams, useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { getNeighborhood } from '../../utils/dataService';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ListingInsights() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getListingById, getListingInsights } = useRole();

  const listing = getListingById(id);
  const neighborhood = getNeighborhood(listing?.neighborhood);
  const insights = listing ? getListingInsights(listing, neighborhood) : null;

  if (!listing || !insights) {
    return (
      <div className="p-10 text-center">
        <p>Listing not found.</p>
        <button type="button" className="btn-primary mt-4" onClick={() => navigate('/guest/dashboard')}>Back</button>
      </div>
    );
  }

  const history = (insights.priceHistory30d.length ? insights.priceHistory30d : [listing.price, listing.price * 0.95, listing.price * 1.02]).map((p, i) => ({ day: i + 1, price: p }));

  return (
    <div data-role="guest" className="flex-1 overflow-y-auto bg-[var(--bg-canvas)]">
      <div className="max-w-5xl mx-auto px-5 py-10 grid lg:grid-cols-[1.2fr_1fr] gap-10">
        <div>
          <button type="button" onClick={() => navigate(-1)} className="text-meta mb-6 hover:text-[var(--guest-accent)]">← Back</button>
          <div className="h-60 rounded-xl bg-[var(--bg-raised)] flex items-center justify-center relative">
            <span className="text-5xl opacity-30">🏠</span>
            <span className="absolute top-4 right-4 chip bg-white">{listing.rating} ★</span>
          </div>
          <h1 className="text-[22px] font-semibold mt-5">{listing.name}</h1>
          <p className="text-meta mt-1">{listing.bedrooms} · {listing.propertyType} · {neighborhood?.name ?? listing.neighborhood}</p>
          <p className="font-display text-5xl mt-4">Ksh {listing.price.toLocaleString()}</p>
          <p className="text-meta">per night</p>
          {insights.fairnessVerdict === 'great-deal' && (
            <span className="chip chip-positive mt-3 text-[14px]">★ Great Deal — {insights.fairnessPct}% below market</span>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            {(listing.amenities ?? ['WiFi', 'Parking']).slice(0, 4).map((a) => (
              <span key={a} className="chip">{a}</span>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-title">Price History</h3>
            <div className="h-[120px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <XAxis dataKey="day" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip formatter={(v) => [`Ksh ${v}`, 'Price']} />
                  <Line type="monotone" dataKey="price" stroke="var(--guest-accent)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-meta text-[var(--positive)] mt-2">Trending down — good time to book</p>
          </div>

          <div className="card">
            <h3 className="text-title">What Guests Say</h3>
            <p className="text-meta">Summarised from {listing.reviews ?? 47} reviews</p>
            <p className="text-label mt-4 text-[var(--positive)]">Guests love</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {insights.positiveThemes.map((t) => (
                <span key={t} className="chip chip-accent">{t}</span>
              ))}
            </div>
            <p className="text-label mt-4">Guests mention</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {insights.neutralThemes.map((t) => (
                <span key={t} className="chip">{t}</span>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-title">Should You Book Now?</h3>
            <div className={`mt-3 p-4 rounded-lg border-l-[3px] ${insights.shouldBookNow ? 'bg-[var(--negative-bg)] border-[var(--negative)]' : 'bg-[var(--guest-accent-light)] border-[var(--guest-accent)]'}`}>
              <p className="text-[13px] text-[var(--text-secondary)]">
                {insights.shouldBookNow
                  ? 'Book soon — prices may rise this weekend (+23%)'
                  : 'Good time to book — prices stable this week'}
              </p>
            </div>
            <button type="button" className="btn-primary w-full mt-4">Book on Pumzika →</button>
          </div>

          <div className="card">
            <h3 className="text-title">Value Score</h3>
            <p className="font-display text-5xl text-[var(--guest-accent)] mt-2">{insights.valueScore}<span className="text-2xl text-[var(--text-muted)]">/100</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
