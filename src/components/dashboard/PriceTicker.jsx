import { useEffect, useState } from 'react';
import { usePricing } from '../../hooks/usePricing';

export default function PriceTicker() {
  const { recommendedPrice, changePercent, isAboveCurrent, confidence, currentPrice } = usePricing();
  const [displayPrice, setDisplayPrice] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1200;
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

  return (
    <div>
      <span className="text-label">Recommended price tonight</span>

      <p className="text-price mt-2" style={{ fontSize: '72px' }}>
        Ksh {displayPrice.toLocaleString()}
      </p>

      <p
        className="mt-3 text-sm font-medium"
        style={{ color: isAboveCurrent ? 'var(--positive)' : 'var(--negative)' }}
      >
        {isAboveCurrent ? '↑' : '↓'} {Math.abs(changePercent)}%{' '}
        {isAboveCurrent ? 'above' : 'below'} your current price
        <span className="font-normal ml-1" style={{ color: 'var(--text-muted)' }}>
          (Ksh {Math.abs(diff).toLocaleString()})
        </span>
      </p>

      <div className="mt-5">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-label">Model confidence</span>
          <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
            {confidence}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--bg-raised)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${confidence}%`, background: 'var(--accent)' }}
          />
        </div>
      </div>
    </div>
  );
}
