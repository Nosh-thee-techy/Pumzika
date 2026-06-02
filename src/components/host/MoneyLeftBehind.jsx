import { useEffect, useState } from 'react';
import { useRole } from '../../context/RoleContext';

export default function MoneyLeftBehind() {
  const { moneyLeftBehind } = useRole();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = moneyLeftBehind;
    const start = performance.now();
    const duration = 1500;

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
      setDisplay(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [moneyLeftBehind]);

  return (
    <section
      className="section-in flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-xl p-6 lg:p-8 border"
      style={{
        background: 'var(--bg-inverse)',
        borderColor: 'rgba(200,146,42,0.2)',
        animationDelay: '0s',
      }}
    >
      <div>
        <p className="text-label" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Last 7 days
        </p>
        <p className="font-display text-5xl mt-2" style={{ color: 'var(--host-accent)' }}>
          Ksh {display.toLocaleString()}
        </p>
        <p className="text-[14px] mt-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
          left on the table by underpricing
        </p>
      </div>
      <div className="text-right">
        <div className="text-5xl opacity-80">💰</div>
        <button type="button" className="text-[13px] font-medium mt-2 hover:underline" style={{ color: 'var(--host-accent)' }}>
          Start pricing smart →
        </button>
      </div>
    </section>
  );
}
