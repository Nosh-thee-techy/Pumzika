import { useEffect, useState, useMemo } from 'react';
import { usePricing } from '../../hooks/usePricing';
import { useProperty } from '../../context/PropertyContext';

export default function PriceTicker() {
  const { recommendedPrice, changePercent, isAboveCurrent, confidence, currentPrice } = usePricing();
  const { neighborhood } = useProperty();
  const [displayPrice, setDisplayPrice] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1000;
    const from = 0;
    const to = recommendedPrice;

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setDisplayPrice(Math.round(from + (to - from) * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [recommendedPrice]);

  const diff = recommendedPrice - currentPrice;
  const range = useMemo(() => {
    const base = neighborhood?.avgNightlyPrice ?? 7000;
    const min = Math.round(base * 0.65 / 100) * 100;
    const max = Math.round(base * 1.45 / 100) * 100;
    const pct = ((recommendedPrice - min) / (max - min)) * 100;
    return { min, max, pct: Math.min(92, Math.max(8, pct)) };
  }, [neighborhood, recommendedPrice]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-label">Recommended price · tonight</span>
        <span className="chip chip-accent">{confidence}% confidence</span>
      </div>

      <p className="text-price">Ksh {displayPrice.toLocaleString()}</p>

      <p
        className="mt-3 text-sm font-medium"
        style={{ color: isAboveCurrent ? 'var(--positive)' : 'var(--negative)' }}
      >
        {isAboveCurrent ? '↑' : '↓'} Ksh {Math.abs(diff).toLocaleString()}{' '}
        {isAboveCurrent ? 'above' : 'below'} your current price{' '}
        <span className="font-normal">
          {isAboveCurrent ? '+' : ''}
          {changePercent}%
        </span>
      </p>

      <hr className="divider" />

      <p className="text-label mb-2">Price range tonight</p>
      <div className="relative h-1.5 rounded-full bg-[var(--bg-raised)]">
        <div
          className="absolute inset-y-0 left-[20%] right-[20%] rounded-full"
          style={{ background: 'var(--accent)', opacity: 0.35 }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2"
          style={{ left: `${range.pct}%`, marginLeft: -7, borderColor: 'var(--accent)' }}
        />
      </div>
      <div className="flex justify-between mt-2 text-meta">
        <span>Ksh {range.min.toLocaleString()} · Budget</span>
        <span className="font-medium" style={{ color: 'var(--accent-dark)' }}>
          Ksh {recommendedPrice.toLocaleString()} · You
        </span>
        <span>Ksh {range.max.toLocaleString()} · Premium</span>
      </div>
    </div>
  );
}
