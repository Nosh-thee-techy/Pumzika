import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import neighborhoods from '../../data/neighborhoods.json';

const NEIGHBORHOOD_LIST = [
  'Westlands', 'Kilimani', 'Karen', 'Lavington', 'Langata', 'Gigiri', 'Parklands',
  'Upperhill', 'Kileleshwa', 'Runda', 'Muthaiga', 'South B', 'South C', 'Ngong Road', 'Thika Road',
];

const BEDROOMS = ['Studio', '1 BR', '2 BR', '3 BR', '4+ BR'];
const TYPES = ['Home', 'Apartment', 'Villa', 'Room'];
const AMENITIES = ['WiFi', 'Parking', 'Pool', 'Kitchen', 'Generator', 'DSTV', 'Air Conditioning', 'Security', 'Gym'];

function getDemandChip(name) {
  const id = name.toLowerCase().replace(/\s+/g, '-');
  const n = neighborhoods.find((x) => x.id === id || x.name === name);
  if (!n) return { label: 'Steady demand', type: 'neutral' };
  if (n.demandBadge === 'hot') return { label: 'High demand', type: 'accent' };
  if (n.demandBadge === 'slow') return { label: 'Oversupplied', type: 'negative' };
  return { label: 'Rising demand', type: 'positive' };
}

export default function HostOnboarding() {
  const navigate = useNavigate();
  const { saveHostProperty } = useRole();
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
  const hoodStats = useMemo(() => {
    const id = form.neighborhood.toLowerCase().replace(/\s+/g, '-');
    return neighborhoods.find((n) => n.id === id);
  }, [form.neighborhood]);

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
      saveHostProperty({ ...form, currentPrice: Number(form.currentPrice) });
      navigate('/host/dashboard');
    }, 1200);
  };

  return (
    <div data-role="host" className="min-h-screen flex flex-col lg:flex-row">
      <aside className="lg:w-[40%] flex flex-col justify-between p-10 lg:p-16 text-[var(--text-inverse)] bg-[var(--bg-inverse)]">
        <div>
          <span className="font-display text-xl text-[var(--host-accent)]">pumzika</span>
          <span className="block text-[10px] uppercase tracking-widest text-[var(--host-accent-dark)] mt-1">for hosts</span>
        </div>
        <div>
          <h1 className="font-display italic text-4xl lg:text-[40px] leading-[1.15]">
            Your revenue manager
            <br />
            starts here.
          </h1>
          <div
            className="mt-8 p-4 rounded-r-lg border-l-[3px] border-[var(--host-accent)]"
            style={{ background: 'rgba(200,146,42,0.08)' }}
          >
            <p className="text-[13px]">Hosts using smart pricing earn 31% more per month</p>
          </div>
        </div>
        <p className="text-meta text-[var(--text-muted)]">Takes 60 seconds to set up</p>
      </aside>

      <main className="lg:w-[60%] flex items-start justify-center p-8 lg:p-14 bg-white overflow-y-auto">
        <div className="w-full max-w-lg">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-[var(--host-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-meta">Analysing Nairobi market data...</p>
            </div>
          ) : (
            <>
              <p className="text-label">Step 1 of 1</p>
              <h2 className="text-[26px] font-semibold mt-2">Tell us about your property</h2>
              <p className="text-meta mt-1">We&apos;ll use this to generate your first price recommendation</p>

              <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                <div>
                  <label className="text-label block mb-2">Property name</label>
                  <input className="input" placeholder="e.g. Kilimani Cozy 2BR" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>

                <div>
                  <label className="text-label block mb-2">Neighborhood</label>
                  <select className="input" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}>
                    {NEIGHBORHOOD_LIST.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  {hoodStats && (
                    <span className="chip chip-accent mt-2">
                      {form.neighborhood} — {Math.round(hoodStats.occupancyRate * 100)}% avg occupancy · Ksh {hoodStats.avgNightlyPrice?.toLocaleString()} avg
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-label block mb-2">Bedrooms</label>
                    <div className="flex flex-wrap gap-2">
                      {BEDROOMS.map((b) => (
                        <button key={b} type="button" onClick={() => setForm({ ...form, bedrooms: b })} className={`pill ${form.bedrooms === b ? 'pill-active' : ''}`}>
                          {b.replace(' BR', 'BR')}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-label block mb-2">Property type</label>
                    <div className="flex flex-wrap gap-2">
                      {TYPES.map((t) => (
                        <button key={t} type="button" onClick={() => setForm({ ...form, propertyType: t })} className={`pill ${form.propertyType === t ? 'pill-active' : ''}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-label block mb-2">Your current nightly price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-meta border-r pr-3 border-[var(--border-subtle)]">Ksh</span>
                    <input type="number" className="input pl-16" placeholder="7,000" value={form.currentPrice} onChange={(e) => setForm({ ...form, currentPrice: e.target.value })} />
                  </div>
                  <p className="text-meta mt-2">We&apos;ll show you how much more you could be earning</p>
                </div>

                <div>
                  <label className="text-label block mb-1">Amenities</label>
                  <p className="text-meta mb-3">Select all that apply</p>
                  <div className="grid grid-cols-3 gap-3">
                    {AMENITIES.map((a) => (
                      <label key={a} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-[13px] ${form.amenities.includes(a) ? 'border-[var(--host-accent)] bg-[var(--host-accent-light)]' : 'border-[var(--border-subtle)] bg-[var(--bg-raised)]'}`}>
                        <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} className="sr-only" />
                        {a}
                      </label>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full py-3.5 text-[15px] rounded-[10px]" disabled={!isComplete}>
                  Generate my dashboard →
                </button>
                <p className="text-meta text-center">Takes under 2 seconds</p>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
