import { useProperty } from '../../context/PropertyContext';

function StatRing({ value, color = 'var(--accent)' }) {
  const pct = Math.min(100, Math.max(0, value));
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="stat-ring">
      <svg viewBox="0 0 72 72" aria-hidden="true">
        <circle cx="36" cy="36" r="28" fill="none" stroke="var(--bg-raised)" strokeWidth="8" />
        <circle
          cx="36"
          cy="36"
          r="28"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="stat-ring-value">{Math.round(pct)}</span>
    </div>
  );
}

export default function QuickStats() {
  const { neighborhood } = useProperty();

  const demandScore = neighborhood?.demandScore ?? 75;
  const demandLevel =
    demandScore >= 85 ? 'Peak' : demandScore >= 75 ? 'High' : demandScore >= 60 ? 'Medium' : 'Low';
  const demandColor =
    demandLevel === 'Peak'
      ? 'var(--accent)'
      : demandLevel === 'High'
        ? 'var(--positive)'
        : demandLevel === 'Low'
          ? 'var(--negative)'
          : 'var(--text-primary)';

  const occPct = Math.round((neighborhood?.occupancyRate ?? 0.74) * 100);

  const cards = [
    {
      label: 'Demand level',
      value: demandLevel,
      context: 'Peak period ahead',
      color: demandColor,
      ring: demandScore,
    },
    {
      label: 'Nearby listings',
      value: String(neighborhood?.activeListings ?? 23),
      context: 'Active tonight',
    },
    {
      label: 'Area occupancy',
      value: `${occPct}%`,
      context: 'Above 65% avg',
      ring: occPct,
    },
    {
      label: 'Your rating',
      value: `${neighborhood?.avgRating ?? 4.7}★`,
      context: `Top 15% in ${neighborhood?.name ?? 'Kilimani'}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
      {cards.map((card) => (
        <div key={card.label} className="stat-card">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-label">{card.label}</p>
              <p
                className="text-2xl font-bold mt-2 tracking-tight"
                style={{ color: card.color ?? 'var(--text-primary)' }}
              >
                {card.value}
              </p>
              <p className="text-meta mt-1.5">{card.context}</p>
            </div>
            {card.ring != null && <StatRing value={card.ring} color={card.color ?? 'var(--accent)'} />}
          </div>
        </div>
      ))}
    </div>
  );
}
