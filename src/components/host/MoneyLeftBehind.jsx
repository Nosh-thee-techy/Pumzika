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
    <section className="card-dark section-in relative overflow-hidden">
      <div
        className="absolute -right-16 -top-16 w-48 h-48 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--host-accent) 0%, transparent 70%)' }}
        aria-hidden="true"
      />
      <div
        className="absolute -left-8 -bottom-12 w-36 h-36 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--host-accent) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="text-label">Revenue opportunity · Last 7 days</p>
          <p className="font-display text-5xl lg:text-6xl mt-3 tracking-tight" style={{ color: 'var(--host-accent)' }}>
            Ksh {display.toLocaleString()}
          </p>
          <p className="text-[15px] mt-3" style={{ color: 'rgba(250,246,240,0.65)' }}>
            left on the table by underpricing your listing
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-3">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold"
            style={{ background: 'rgba(232,185,35,0.15)', color: 'var(--host-accent)' }}
          >
            <span className="w-2 h-2 rounded-full bg-[var(--host-accent)] animate-pulse" />
            Live pricing active
          </div>
          <button type="button" className="btn-accent">
            Optimize tonight →
          </button>
        </div>
      </div>
    </section>
  );
}
