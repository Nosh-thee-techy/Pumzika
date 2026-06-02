import { usePricing } from '../../hooks/usePricing';

const SIGNAL_META = {
  '🗓️': { label: 'Demand', glyph: '🗓' },
  '🏘️': { label: 'Market', glyph: '🏘' },
  '📈': { label: 'Occupancy', glyph: '📈' },
};

export default function PriceReason() {
  const { priceReasons } = usePricing();

  return (
    <div className="price-signals">
      <p className="text-label price-signals-heading">Pricing signals</p>
      <ul className="price-signals-list">
        {priceReasons.map((reason) => {
          const meta = SIGNAL_META[reason.icon] ?? { label: 'Signal', glyph: '·' };
          return (
            <li key={reason.text} className="price-signal">
              <div className="price-signal-icon" aria-hidden="true">
                {meta.glyph}
              </div>
              <div className="price-signal-body">
                <span className="price-signal-type">{meta.label}</span>
                <p className="price-signal-text">{reason.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
