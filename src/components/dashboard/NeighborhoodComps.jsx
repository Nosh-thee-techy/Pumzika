import { useProperty } from '../../context/PropertyContext';
import { usePricing } from '../../hooks/usePricing';

const STATUS_CHIP = {
  booked: { label: 'Booked', class: 'chip-positive' },
  available: { label: 'Available', class: 'chip' },
  blocked: { label: 'Blocked', class: 'chip-negative' },
};

export default function NeighborhoodComps() {
  const { property, comps, neighborhood } = useProperty();
  const { recommendedPrice } = usePricing();

  const rows = [
    ...comps.map((l) => ({
      ...l,
      isYours: false,
      vsYou: l.price - (property?.currentPrice ?? 0),
    })),
    {
      id: 'yours',
      name: property?.name ?? 'Your listing',
      bedrooms: property?.bedrooms,
      price: recommendedPrice,
      status: 'available',
      isYours: true,
      vsYou: 0,
    },
  ].sort((a, b) => a.price - b.price);

  return (
    <section className="card">
      <h3 className="text-headline">Comparable listings tonight</h3>
      <p className="text-meta mt-1">
        Similar properties in {neighborhood?.name ?? property?.neighborhood} right now
      </p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b text-left" style={{ borderColor: 'var(--border-subtle)' }}>
              {['Property', 'Beds', "Tonight's price", 'Status', 'vs You'].map((h) => (
                <th key={h} className="text-label pb-3 pr-4 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const vs =
                row.isYours || row.vsYou === 0
                  ? '—'
                  : row.vsYou > 0
                    ? `+Ksh ${row.vsYou.toLocaleString()}`
                    : `-Ksh ${Math.abs(row.vsYou).toLocaleString()}`;
              const vsClass =
                row.vsYou > 0 ? 'var(--positive)' : row.vsYou < 0 ? 'var(--negative)' : undefined;

              return (
                <tr
                  key={row.id}
                  className="border-b"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    background: row.isYours ? 'var(--accent-light)' : undefined,
                  }}
                >
                  <td className="py-3 pr-4 font-medium">
                    {row.isYours && (
                      <span className="chip chip-accent text-[10px] mr-2 py-0">You</span>
                    )}
                    {row.name}
                  </td>
                  <td className="py-3 pr-4" style={{ color: 'var(--text-secondary)' }}>
                    {row.bedrooms}
                  </td>
                  <td className="py-3 pr-4 font-semibold">Ksh {row.price.toLocaleString()}</td>
                  <td className="py-3 pr-4">
                    <span className={STATUS_CHIP[row.status]?.class ?? 'chip'}>
                      {STATUS_CHIP[row.status]?.label ?? row.status}
                    </span>
                  </td>
                  <td className="py-3 font-medium" style={{ color: vsClass }}>
                    {vs}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
