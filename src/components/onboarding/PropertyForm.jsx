import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProperty } from '../../context/PropertyContext';
import neighborhoods from '../../data/neighborhoods.json';

const NEIGHBORHOOD_LIST = [
  'Westlands', 'Kilimani', 'Karen', 'Lavington', 'Langata', 'Gigiri', 'Parklands',
  'Upperhill', 'Kileleshwa', 'Runda', 'Muthaiga', 'South B', 'South C', 'Ngong Road', 'Thika Road',
];

const BEDROOMS = ['Studio', '1 BR', '2 BR', '3 BR', '4+ BR'];
const TYPES = [
  { id: 'Entire Home', icon: '🏠' },
  { id: 'Private Room', icon: '🛏' },
  { id: 'Apartment', icon: '🏢' },
  { id: 'Villa', icon: '🏡' },
];
const AMENITIES = [
  'WiFi', 'Pool', 'Parking', 'Generator', 'DSTV', 'Air Conditioning',
  'Kitchen', 'Gym', 'Security', 'Borehole Water',
];

function getDemandBadge(name) {
  const id = name.toLowerCase().replace(/\s+/g, '-');
  const n = neighborhoods.find((x) => x.id === id || x.name === name);
  if (!n) return '📈 Rising';
  if (n.demandBadge === 'hot' || n.demandScore >= 78) return '🔥 Hot';
  if (n.demandBadge === 'slow' || n.supplyGap < 5) return '😴 Slow';
  return '📈 Rising';
}

const fieldVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.35 },
  }),
};

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
    }, 1500);
  };

  return (
    <div className="onboarding-bg min-h-screen flex flex-col">
      <div className="relative z-10 p-6">
        <span className="font-display text-2xl font-bold" style={{ color: 'var(--accent)' }}>
          pumzika
        </span>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[520px] rounded-2xl border p-8"
          style={{
            background: 'var(--color-bg-secondary)',
            borderColor: 'var(--border-subtle)',
            backgroundImage: 'var(--pattern-card)',
          }}
        >
          {loading ? (
            <div className="py-16 text-center">
              <div
                className="w-10 h-10 border-2 rounded-full animate-spin mx-auto mb-4"
                style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
              />
              <p className="text-body italic">Analysing Nairobi market data...</p>
            </div>
          ) : (
            <>
              <h1 className="font-display text-3xl font-extrabold">Let&apos;s set up your property</h1>
              <p className="text-body mt-2 italic">Takes 60 seconds. We&apos;ll handle the rest.</p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
                  <label className="text-label block mb-2">Property name</label>
                  <input
                    className="input"
                    placeholder="e.g. Kilimani Cozy Studio"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </motion.div>

                <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
                  <label className="text-label block mb-2">Neighborhood</label>
                  <select
                    className="input"
                    value={form.neighborhood}
                    onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                  >
                    {NEIGHBORHOOD_LIST.map((n) => (
                      <option key={n} value={n}>
                        {n} · {getDemandBadge(n)}
                      </option>
                    ))}
                  </select>
                </motion.div>

                <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
                  <label className="text-label block mb-2">Bedrooms</label>
                  <div className="flex flex-wrap gap-2">
                    {BEDROOMS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setForm({ ...form, bedrooms: b })}
                        className={`chip cursor-pointer ${form.bedrooms === b ? 'chip-accent' : ''}`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </motion.div>

                <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
                  <label className="text-label block mb-2">Property type</label>
                  <div className="flex flex-wrap gap-2">
                    {TYPES.map(({ id, icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setForm({ ...form, propertyType: id })}
                        className={`chip cursor-pointer ${form.propertyType === id ? 'chip-accent' : ''}`}
                      >
                        {icon} {id}
                      </button>
                    ))}
                  </div>
                </motion.div>

                <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible">
                  <label className="text-label block mb-2">Current nightly price (Ksh)</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="What do you charge now?"
                    value={form.currentPrice}
                    onChange={(e) => setForm({ ...form, currentPrice: e.target.value })}
                  />
                </motion.div>

                <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="visible">
                  <label className="text-label block mb-3">Amenities</label>
                  <div className="flex flex-wrap gap-2">
                    {AMENITIES.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => toggleAmenity(a)}
                        className={`chip cursor-pointer ${form.amenities.includes(a) ? 'chip-accent' : ''}`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </motion.div>

                <motion.div custom={6} variants={fieldVariants} initial="hidden" animate="visible">
                  <button
                    type="submit"
                    className={`btn-primary w-full py-3.5 text-base ${isComplete ? 'btn-ready-pulse' : ''}`}
                    disabled={!isComplete}
                  >
                    Show me my dashboard →
                  </button>
                </motion.div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
