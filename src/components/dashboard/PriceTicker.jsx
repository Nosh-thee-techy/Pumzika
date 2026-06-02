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
    const min = Math.round((base * 0.65) / 100) * 100;
    const max = Math.round((base * 1.45) / 100) * 100;
    const pct = ((recommendedPrice - min) / (max - min)) * 100;
    return { min, max, pct: Math.min(92, Math.max(8, pct)) };
  }, [neighborhood, recommendedPrice]);

  return (
    <div className="price-ticker">
      <div className="price-ticker-header">
        <span className="text-label">Recommended price · tonight</span>
        <span className="chip chip-accent">{confidence}% confidence</span>
      </div>

      <p className="price-ticker-amount">Ksh {displayPrice.toLocaleString()}</p>

      <div
        className="price-ticker-change"
        style={{ '--change-color': isAboveCurrent ? 'var(--positive)' : 'var(--negative)' }}
      >
        <span className="price-ticker-change-icon">{isAboveCurrent ? '↑' : '↓'}</span>
        <span>
          Ksh {Math.abs(diff).toLocaleString()} {isAboveCurrent ? 'above' : 'below'} your current price
          <strong>
            {' '}
            {isAboveCurrent ? '+' : ''}
            {changePercent}%
          </strong>
        </span>
      </div>

      <div className="price-ticker-range">
        <p className="text-label price-ticker-range-label">Price range tonight</p>
        <div className="price-ticker-track">
          <div className="price-ticker-track-band" />
          <div className="price-ticker-thumb" style={{ left: `${range.pct}%` }} />
        </div>
        <div className="price-ticker-range-labels">
          <div>
            <span className="price-ticker-range-value">Ksh {range.min.toLocaleString()}</span>
            <span className="price-ticker-range-tier">Budget</span>
          </div>
          <div className="price-ticker-range-you">
            <span className="price-ticker-range-value">Ksh {recommendedPrice.toLocaleString()}</span>
            <span className="price-ticker-range-tier">You</span>
          </div>
          <div>
            <span className="price-ticker-range-value">Ksh {range.max.toLocaleString()}</span>
            <span className="price-ticker-range-tier">Premium</span>
          </div>
        </div>
      </div>
    </div>
  );
}
