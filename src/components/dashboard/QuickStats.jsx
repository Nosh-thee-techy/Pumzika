import { useProperty } from '../../context/PropertyContext';
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

  const cards = [
    {
      label: 'Demand level',
      value: demandLevel,
      context: 'Peak period ahead',
      color: demandColor,
    },
    {
      label: 'Nearby listings',
      value: String(neighborhood?.activeListings ?? 23),
      context: 'Active tonight',
    },
    {
      label: 'Area occupancy',
      value: `${Math.round((neighborhood?.occupancyRate ?? 0.74) * 100)}%`,
      context: 'Above 65% avg',
    },
    {
      label: 'Your rating',
      value: '4.7★',
      context: `Top 15% in ${neighborhood?.name ?? 'Kilimani'}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="card card-hover p-5">
          <p className="text-label">{card.label}</p>
          <p
            className="text-2xl font-semibold mt-2 tracking-tight"
            style={{ color: card.color ?? 'var(--text-primary)' }}
          >
            {card.value}
          </p>
          <p className="text-meta mt-1">{card.context}</p>
        </div>
      ))}
    </div>
  );
}
