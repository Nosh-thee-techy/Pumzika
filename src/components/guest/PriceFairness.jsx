import { useRole } from '../../context/RoleContext';
import { getComparablePrice } from '../../utils/dataService';

export default function PriceFairness() {
  const { guestPrefs, neighborhood } = useRole();
  const marketPrice = neighborhood?.avgNightlyPrice ?? getComparablePrice('kilimani', '2 BR');
  const samplePrice = Math.round(marketPrice * 0.92);
  const verdict = samplePrice <= marketPrice * 0.95 ? 'great-deal' : samplePrice >= marketPrice * 1.1 ? 'overpriced' : 'fair';
  const pct = Math.round(((marketPrice - samplePrice) / marketPrice) * 100);

  const markerPos = Math.min(95, Math.max(5, 50 + pct));

  return (
    <section className="card grid lg:grid-cols-2 gap-8">
      <div>
        <p className="text-label">Market price tonight</p>
        <p className="font-display text-hero mt-4">Ksh {marketPrice.toLocaleString()}</p>
        <p className="text-meta mt-2">Average for 2BR in {neighborhood?.name ?? 'Kilimani'} tonight</p>

        <p className="text-label mt-8 mb-3">Price fairness scale</p>
        <div className="h-2 rounded-full bg-[var(--bg-raised)] relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--negative)] via-[var(--neutral-bg)] to-[var(--guest-accent)] opacity-60" />
          <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[var(--guest-accent)]" style={{ left: `${markerPos}%` }} />
        </div>
        <div className="flex justify-between text-meta mt-2">
          <span>Overpriced</span>
          <span>Fair value</span>
          <span>Great deal</span>
        </div>

        <div className="mt-6">
          {verdict === 'great-deal' && <span className="chip chip-accent text-[14px] px-4 py-2">★ Great Deal — {pct}% below market</span>}
          {verdict === 'fair' && <span className="chip chip-accent text-[14px] px-4 py-2">✓ Fair Value</span>}
          {verdict === 'overpriced' && <span className="chip chip-negative text-[14px] px-4 py-2">⚠ Overpriced by {Math.abs(pct)}%</span>}
        </div>
      </div>

      <div>
        <p className="text-label mb-4">Pricing signals</p>
        {[
          `Similar 2BR listings in ${neighborhood?.name ?? 'Kilimani'} averaging Ksh ${marketPrice.toLocaleString()}`,
          'Midweek — prices typically 15% lower than weekends',
          '4.6 avg rating for this price range — good value tier',
        ].map((text) => (
          <div key={text} className="border-l-[3px] border-[var(--guest-accent)] pl-3.5 mb-4 text-[13px] text-[var(--text-secondary)]">
            {text}
          </div>
        ))}
      </div>
    </section>
  );
}
