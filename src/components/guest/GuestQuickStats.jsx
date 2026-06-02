import { useRole } from '../../context/RoleContext';

export default function GuestQuickStats() {
  const { guestQuickStats } = useRole();
  const cards = [
    { label: 'Best value area', value: guestQuickStats.bestValueArea, ctx: `${guestQuickStats.bestValuePct}% below city avg` },
    { label: 'Cheapest night', value: guestQuickStats.cheapestNight, ctx: `Prices drop ${guestQuickStats.cheapestPct}%` },
    { label: 'Listings in budget', value: guestQuickStats.listingsInBudget, ctx: 'Matching your criteria' },
    { label: 'Avg guest rating', value: `${guestQuickStats.avgGuestRating} ★`, ctx: 'For your price range' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="card">
          <p className="text-label">{c.label}</p>
          <p className="font-semibold text-2xl mt-2">{c.value}</p>
          <p className="text-meta mt-1">{c.ctx}</p>
        </div>
      ))}
    </div>
  );
}
