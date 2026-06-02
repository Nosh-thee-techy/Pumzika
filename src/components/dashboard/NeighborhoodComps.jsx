import { useProperty } from '../../context/PropertyContext';
import { usePricing } from '../../hooks/usePricing';

const STATUS = {
  booked: { label: 'Booked', dot: '🟢' },
  available: { label: 'Available', dot: '🟡' },
  blocked: { label: 'Blocked', dot: '🔴' },
};

const TIER_COLORS = [
  'linear-gradient(135deg, #1e3a5f, #2d6a9f)',
  'linear-gradient(135deg, #2d6a9f, #4a90d9)',
  'linear-gradient(135deg, #4a90d9, #f5a623)',
  'linear-gradient(135deg, #f5a623, #ff6b35)',
  'linear-gradient(135deg, #ff6b35, #ff2d55)',
];

function priceTier(price, min, max) {
  const t = (price - min) / (max - min || 1);
  return TIER_COLORS[Math.min(4, Math.floor(t * 5))];
}

export default function NeighborhoodComps() {
  const { property, comps, neighborhood } = useProperty();
  const { recommendedPrice } = usePricing();

  const rows = [
    ...comps.map((l) => ({ ...l, isYours: false })),
    {
      id: 'yours',
      name: property?.name ?? 'Your listing',
      bedrooms: property?.bedrooms,
      price: recommendedPrice,
      status: 'available',
      isYours: true,
    },
  ].sort((a, b) => a.price - b.price);

  const prices = rows.map((r) => r.price);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);

  return (
    <section className="card">
      <h3 className="text-headline">What similar listings charge tonight</h3>
      <p className="text-meta mt-1">
        {neighborhood?.name ?? property?.neighborhood} · sorted low to high
      </p>

      <div className="mt-5 flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
        {rows.slice(0, 6).map((row) => {
          const st = STATUS[row.status] ?? STATUS.available;
          return (
            <div
              key={row.id}
              className={`card-hover shrink-0 w-[160px] p-0 overflow-hidden rounded-xl border transition-all duration-150 ${
                row.isYours ? 'ring-2' : ''
              }`}
              style={{
                borderColor: row.isYours ? 'var(--accent)' : 'var(--border-subtle)',
                ringColor: 'var(--accent)',
              }}
            >
              <div
                className="h-20 w-full"
                style={{ background: priceTier(row.price, minP, maxP) }}
              />
              <div className="p-3">
                {row.isYours && (
                  <span className="chip chip-accent text-[10px] py-0 mb-1">You</span>
                )}
                <p className="text-[13px] font-medium truncate">{row.name}</p>
                <p className="text-meta mt-0.5">{row.bedrooms}</p>
                <p className="font-display font-semibold mt-2" style={{ color: 'var(--accent)' }}>
                  Ksh {row.price.toLocaleString()}
                </p>
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  {st.dot} {st.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
