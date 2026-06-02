import { useProperty } from '../../context/PropertyContext';

export default function QuickStats() {
  const { neighborhood } = useProperty();

  const demandScore = neighborhood?.demandScore ?? 75;
  const demandLevel =
    demandScore >= 85 ? 'Peak' : demandScore >= 75 ? 'High' : demandScore >= 60 ? 'Medium' : 'Low';

  const pills = [
    { icon: '🔥', label: 'Demand level', value: demandLevel, accent: true },
    { icon: '🏘️', label: 'Competing listings', value: `${neighborhood?.activeListings ?? 23} nearby` },
    { icon: '📊', label: 'Your avg rating', value: `${neighborhood?.avgRating ?? 4.7} ★` },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {pills.map((pill) => (
        <div
          key={pill.label}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full border"
          style={{
            background: 'var(--color-bg-tertiary)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <span>{pill.icon}</span>
          <span className="text-meta">{pill.label}:</span>
          <span
            className="text-sm font-semibold font-display"
            style={{ color: pill.accent ? 'var(--accent)' : 'var(--text-primary)' }}
          >
            {pill.value}
          </span>
        </div>
      ))}
    </div>
  );
}
