import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Map, Mic, Settings, Pencil } from 'lucide-react';
import { useProperty } from '../../context/PropertyContext';
import neighborhoods from '../../data/neighborhoods.json';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard#calendar', label: 'Demand Calendar', icon: Calendar },
  { to: '/map', label: 'Nairobi Map', icon: Map },
  { to: '/ask', label: 'Ask AI', icon: Mic },
  { to: '/dashboard#settings', label: 'Settings', icon: Settings },
];

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
      className="hidden lg:flex flex-col w-[220px] shrink-0 h-screen sticky top-0"
      style={{
        background: 'var(--bg-inverse)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.08)',
      }}
    >
      <div className="p-5">
        <div className="font-display text-lg" style={{ color: 'var(--accent)' }}>
          pumzika
        </div>
        <div
          className="text-[10px] uppercase tracking-wider mt-0.5"
          style={{ color: 'var(--accent-dark)' }}
        >
          Host Intelligence
        </div>
      </div>

      {property && (
        <div
          className="group mx-5 mb-8 p-3 rounded-lg border"
          style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)' }}
        >
          <div className="flex justify-between items-start gap-2">
            <div>
              <div className="text-[13px] font-medium" style={{ color: 'var(--text-inverse)' }}>
                {property.name}
              </div>
              <div className="text-[12px] mt-1" style={{ color: 'var(--text-muted)' }}>
                {property.neighborhood} · {property.propertyType}
              </div>
            </div>
            <button type="button" className="opacity-0 group-hover:opacity-100 p-1" aria-label="Edit">
              <Pencil size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
          <div className="flex justify-between items-center mt-3">
            <span className="chip-positive text-[11px] py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--positive)]" />
              Live
            </span>
          </div>
        </div>
      )}

      <nav className="flex-1 px-0">
        <p className="text-label px-5 mb-2" style={{ color: 'rgba(168,158,145,0.8)' }}>
          Navigation
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-5 py-2 text-[13px] transition-colors duration-150 border-l-2 ${
                isActive
                  ? 'border-[var(--accent)] bg-white/[0.04] font-medium'
                  : 'border-transparent hover:bg-white/[0.03]'
              }`
            }
            style={({ isActive }) => ({
              color: isActive ? 'var(--text-inverse)' : 'var(--text-muted)',
            })}
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-5 mt-auto">
        <p className="text-label mb-3" style={{ color: 'rgba(168,158,145,0.8)' }}>
          Market now
        </p>
        <dl className="space-y-2 text-[12px]">
          {[
            ['Avg price', `Ksh ${(neighborhood?.avgNightlyPrice ?? avgPrice).toLocaleString()}`],
            ['Active listings', String(neighborhood?.activeListings ?? totalListings)],
            ['Area occupancy', `${avgOcc}%`],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-2">
              <dt style={{ color: 'var(--text-muted)' }}>{label}</dt>
              <dd className="font-medium" style={{ color: 'var(--text-inverse)' }}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  );
}
