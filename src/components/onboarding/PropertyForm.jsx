import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProperty } from '../../context/PropertyContext';
import neighborhoods from '../../data/neighborhoods.json';

const NEIGHBORHOOD_LIST = [
  'Westlands', 'Kilimani', 'Karen', 'Lavington', 'Langata', 'Gigiri', 'Parklands',
  'Upperhill', 'Kileleshwa', 'Runda', 'Muthaiga', 'South B', 'South C', 'Ngong Road', 'Thika Road',
];

const BEDROOMS = ['Studio', '1 BR', '2 BR', '3 BR', '4+ BR'];
const TYPES = ['Home', 'Apartment', 'Villa', 'Room'];
const AMENITIES = [
  'WiFi', 'Parking', 'Pool', 'Kitchen', 'Generator', 'DSTV',
  'Air Conditioning', 'Security', 'Gym',
];

function getDemandChip(name) {
  const id = name.toLowerCase().replace(/\s+/g, '-');
  const n = neighborhoods.find((x) => x.id === id || x.name === name);
  if (!n) return { label: 'Steady demand', type: 'neutral' };
  if (n.demandBadge === 'hot' || n.demandScore >= 78) return { label: 'High demand', type: 'accent' };
  if (n.demandBadge === 'slow' || n.supplyGap < 5) return { label: 'Oversupplied', type: 'negative' };
  return { label: 'Rising demand', type: 'positive' };
}

export default function PropertyForm() {
  const navigate = useNavigate();
  const { saveProperty } = useProperty();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    neighborhood: 'Kilimani',
    bedrooms: '2 BR',
    propertyType: 'Apartment',
    currentPrice: '',
    amenities: [],
  });

  const demandChip = useMemo(() => getDemandChip(form.neighborhood), [form.neighborhood]);

  const isComplete =
    form.name.trim() && form.neighborhood && form.bedrooms && form.propertyType && form.currentPrice;

  const toggleAmenity = (a) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isComplete) return;
    setLoading(true);
    setTimeout(() => {
      saveProperty({ ...form, currentPrice: Number(form.currentPrice) });
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Brand panel */}
      <aside
        className="lg:w-1/2 flex flex-col justify-between p-10 lg:p-16 text-[var(--text-inverse)]"
        style={{ background: 'var(--bg-inverse)' }}
      >
        <div>
          <span className="font-display text-2xl" style={{ color: 'var(--accent)' }}>
            pumzika
          </span>
        </div>

        <div>
          <h1 className="font-display text-4xl lg:text-5xl leading-[1.1] italic">
            Price right.
            <br />
            Fill every night.
          </h1>
          <ul className="mt-8 space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            {[
              "Tonight's optimal price",
              '30-day demand forecast',
              'Nairobi market intelligence',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span style={{ color: 'var(--accent)' }}>✦</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-meta text-[var(--text-muted)]">
          Trusted by Pumzika hosts across Nairobi
        </p>
      </aside>

      {/* Form panel */}
      <main className="lg:w-1/2 flex items-center justify-center p-8 lg:p-14 bg-[var(--bg-surface)]">
        <div className="w-full max-w-md">
          {loading ? (
            <div className="py-20 text-center">
              <div
                className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-4"
                style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
              />
              <p className="text-meta">Analysing market data...</p>
            </div>
          ) : (
            <>
              <p className="text-label mb-2">Get started</p>
              <h2 className="text-2xl font-semibold tracking-tight mb-8">Tell us about your property</h2>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label className="text-label block mb-2">Property name</label>
                  <input
                    className="input"
                    placeholder="e.g. Kilimani Cozy Studio"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-label block mb-2">Neighborhood</label>
                  <select
                    className="input"
                    value={form.neighborhood}
                    onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                  >
                    {NEIGHBORHOOD_LIST.map((n) => {
                      const chip = getDemandChip(n);
                      const dot =
                        chip.type === 'accent' ? '●' : chip.type === 'negative' ? '○' : '◐';
                      return (
                        <option key={n} value={n}>
                          {n} {dot}
                        </option>
                      );
                    })}
                  </select>
                  <span
                    className={`chip mt-2 ${
                      demandChip.type === 'accent'
                        ? 'chip-accent'
                        : demandChip.type === 'negative'
                          ? 'chip-negative'
                          : 'chip-positive'
                    }`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background:
                          demandChip.type === 'negative'
                            ? 'var(--negative)'
                            : demandChip.type === 'accent'
                              ? 'var(--accent)'
                              : 'var(--positive)',
                      }}
                    />
                    {demandChip.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-label block mb-2">Bedrooms</label>
                    <div className="flex flex-wrap gap-2">
                      {BEDROOMS.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setForm({ ...form, bedrooms: b })}
                          className={`chip cursor-pointer ${form.bedrooms === b ? 'chip-accent' : ''}`}
                        >
                          {b === '4+ BR' ? '4+' : b.replace(' BR', 'BR')}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-label block mb-2">Type</label>
                    <div className="flex flex-wrap gap-2">
                      {TYPES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setForm({ ...form, propertyType: t })}
                          className={`chip cursor-pointer ${form.propertyType === t ? 'chip-accent' : ''}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-label block mb-2">Your current nightly price (Ksh)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-meta">Ksh</span>
                    <input
                      type="number"
                      className="input pl-12"
                      placeholder="7,000"
                      value={form.currentPrice}
                      onChange={(e) => setForm({ ...form, currentPrice: e.target.value })}
                    />
                  </div>
                  <p className="text-meta mt-2">We&apos;ll show you how to optimise this</p>
                </div>

                <div>
                  <label className="text-label block mb-3">Amenities offered</label>
                  <div className="grid grid-cols-3 gap-3">
                    {AMENITIES.map((a) => (
                      <label
                        key={a}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <input
                          type="checkbox"
                          checked={form.amenities.includes(a)}
                          onChange={() => toggleAmenity(a)}
                          className="accent-[var(--accent)]"
                        />
                        {a}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <button type="submit" className="btn-primary w-full py-3" disabled={!isComplete}>
                    Generate my pricing dashboard →
                  </button>
                  <p className="text-meta text-center mt-3">Takes under 2 seconds</p>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
