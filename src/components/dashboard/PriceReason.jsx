import { usePricing } from '../../hooks/usePricing';

const ICONS = { '🗓️': '🗓', '🏘️': '🏘', '📈': '📈' };

export default function PriceReason() {
  const { priceReasons } = usePricing();

  return (
    <div>
      <p className="text-label mb-4">Pricing signals</p>
      <ul className="space-y-4">
        {priceReasons.map((reason) => (
          <li
            key={reason.text}
            className="pl-3 border-l-[3px] text-[13px] leading-relaxed"
            style={{ borderColor: 'var(--accent)', color: 'var(--text-secondary)' }}
          >
            <span className="mr-2 opacity-60">{ICONS[reason.icon] ?? '·'}</span>
            {reason.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
