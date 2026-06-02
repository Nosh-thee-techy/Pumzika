import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Map, Mic, Settings, Pencil, Compass, Bookmark } from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import neighborhoods from '../../data/neighborhoods.json';

const hostNav = [
  { to: '/host/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/host/dashboard#calendar', label: 'Demand Calendar', icon: Calendar },
  { to: '/host/map', label: 'Nairobi Map', icon: Map },
  { to: '/host/ask', label: 'Ask AI', icon: Mic },
  { to: '/host/dashboard#settings', label: 'Settings', icon: Settings },
];

const guestNav = [
  { to: '/guest/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/guest/explore', label: 'Explore Map', icon: Compass },
  { to: '/guest/dashboard#saved', label: 'Saved Listings', icon: Bookmark },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { role, hostProperty, guestPrefs, neighborhood } = useRole();
  const isHost = role === 'host';
  const navItems = isHost ? hostNav : guestNav;

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
      style={{ background: 'var(--bg-inverse)', boxShadow: '4px 0 24px rgba(0,0,0,0.12)' }}
    >
      <div className="p-5">
        <button type="button" onClick={() => navigate('/')} className="text-left">
          <div className="font-display text-lg" style={{ color: 'var(--accent)' }}>
            pumzika
          </div>
          <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: 'var(--accent-dark)' }}>
            {isHost ? 'host intelligence' : 'guest intelligence'}
          </div>
        </button>
      </div>

      {isHost && hostProperty && (
        <div
          className="mx-5 mb-6 p-3 rounded-lg border"
          style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)' }}
        >
          <div className="text-[13px] font-medium text-[var(--text-inverse)]">{hostProperty.name}</div>
          <div className="text-[12px] mt-1 text-[var(--text-muted)]">
            {hostProperty.neighborhood} · {hostProperty.bedrooms} {hostProperty.propertyType}
          </div>
          <div className="mt-3">
            <span className="chip-positive text-[11px] py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--positive)] inline-block mr-1" />
              Live
            </span>
          </div>
        </div>
      )}

      {!isHost && guestPrefs && (
        <div
          className="mx-5 mb-6 p-3 rounded-lg border"
          style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)' }}
        >
          <div className="text-[13px] font-medium text-[var(--text-inverse)]">
            Ksh {guestPrefs.budgetMin?.toLocaleString()} – {guestPrefs.budgetMax?.toLocaleString()}
          </div>
          <div className="text-[12px] mt-1 text-[var(--text-muted)]">
            {guestPrefs.guests} guests · {guestPrefs.vibes?.join(', ')}
          </div>
        </div>
      )}

      <nav className="flex-1">
        <p className="text-label px-5 mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Menu
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-5 py-2.5 text-[13px] border-l-2 transition-all duration-150 ${
                isActive ? 'border-[var(--accent)] bg-white/[0.05]' : 'border-transparent hover:bg-white/[0.03]'
              }`
            }
            style={({ isActive }) => ({
              color: isActive ? 'var(--text-inverse)' : 'rgba(255,255,255,0.5)',
            })}
          >
            <item.icon size={16} style={{ color: 'inherit' }} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-5 mt-auto">
        <p className="text-label mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Market now
        </p>
        <dl className="space-y-2 text-[12px]">
          {(isHost
            ? [
                ['Avg price tonight', `Ksh ${(neighborhood?.avgNightlyPrice ?? avgPrice).toLocaleString()}`],
                ['Active listings', String(neighborhood?.activeListings ?? totalListings)],
                ['Area occupancy', `${avgOcc}%`],
              ]
            : [
                ['Avg listing price', `Ksh ${avgPrice.toLocaleString()}`],
                ['Best value areas', 'Karen, Langata'],
                ['Cheapest nights', 'Tue–Wed'],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex justify-between gap-2">
              <dt style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</dt>
              <dd className="font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  );
}
