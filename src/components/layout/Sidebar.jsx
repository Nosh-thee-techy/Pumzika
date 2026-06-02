import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { useProperty } from '../../context/PropertyContext';
import neighborhoods from '../../data/neighborhoods.json';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/dashboard#calendar', label: 'Demand Calendar', icon: '📅' },
  { to: '/map', label: 'Kenya Map', icon: '📍' },
  { to: '/ask', label: 'Ask Pumzika AI', icon: '🎙️' },
  { to: '/dashboard#settings', label: 'Settings', icon: '⚙️' },
];

function AnimatedStat({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const num = parseInt(String(value).replace(/\D/g, ''), 10) || 0;
    const start = performance.now();
    const duration = 800;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(num * (1 - (1 - t) ** 3)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <>{String(value).replace(/\d+/, display.toLocaleString())}</>;
}

export default function Sidebar() {
  const { property, neighborhood } = useProperty();
  const avgPrice = Math.round(
    neighborhoods.reduce((s, n) => s + n.avgNightlyPrice, 0) / neighborhoods.length
  );
  const totalListings = neighborhoods.reduce((s, n) => s + n.activeListings, 0);
  const avgOcc = Math.round(
    (neighborhood?.occupancyRate ??
      neighborhoods.reduce((s, n) => s + n.occupancyRate, 0) / neighborhoods.length) * 100
  );

  return (
    <aside
      className="hidden lg:flex flex-col w-[240px] shrink-0 h-screen sticky top-0 border-r"
      style={{
        background: 'var(--color-bg-secondary)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="p-5">
        <div className="font-display text-xl font-bold" style={{ color: 'var(--accent)' }}>
          pumzika
        </div>
        <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Host Intelligence
        </div>
      </div>

      {property && (
        <div
          className="group mx-4 mb-6 p-3 rounded-xl border"
          style={{
            borderColor: 'var(--border-subtle)',
            background: 'var(--color-bg-tertiary)',
          }}
        >
          <div className="flex justify-between items-start gap-2">
            <div>
              <div className="font-display text-[13px] font-semibold">{property.name}</div>
              <div className="text-[12px] mt-1" style={{ color: 'var(--text-muted)' }}>
                {property.neighborhood} · {property.propertyType}
              </div>
            </div>
            <button type="button" className="opacity-0 group-hover:opacity-100 p-1" aria-label="Edit">
              <Pencil size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            <span className="w-1.5 h-1.5 rounded-full host-pin-pulse" style={{ background: 'var(--accent)' }} />
            <span className="text-[11px]" style={{ color: 'var(--accent)' }}>
              Live
            </span>
          </div>
        </div>
      )}

      <nav className="flex-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 mb-0.5 rounded-lg text-[13px] transition-colors duration-150 border-l-2 ${
                isActive
                  ? 'border-[var(--accent)] font-medium'
                  : 'border-transparent hover:bg-[var(--color-bg-tertiary)]'
              }`
            }
            style={({ isActive }) => ({
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              background: isActive ? 'rgba(245,166,35,0.06)' : undefined,
            })}
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mx-2 mb-2 rounded-xl" style={{ background: 'var(--color-bg-tertiary)' }}>
        <p className="text-label mb-3">Market pulse</p>
        <dl className="space-y-2.5 text-[12px]">
          {[
            ['Avg price tonight', `Ksh ${(neighborhood?.avgNightlyPrice ?? avgPrice).toLocaleString()}`],
            ['Listings active', String(neighborhood?.activeListings ?? totalListings)],
            ['Occupancy this week', `${avgOcc}%`],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-2">
              <dt style={{ color: 'var(--text-muted)' }}>{label}</dt>
              <dd className="font-medium font-display">
                <AnimatedStat value={value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="px-5 pb-4">
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          v0.1 · Pumzika Hackathon 2025
        </p>
        <p className="text-[9px] mt-1 leading-relaxed" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
          Data: Airbnb NYC 2019 + hotel bookings CSV
        </p>
      </div>
    </aside>
  );
}
