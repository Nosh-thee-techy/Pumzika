import { NavLink } from 'react-router-dom';

const items = [
  { to: '/dashboard', label: 'Home', icon: '🏠', end: true },
  { to: '/dashboard#calendar', label: 'Calendar', icon: '📅' },
  { to: '/map', label: 'Map', icon: '📍' },
  { to: '/ask', label: 'Ask AI', icon: '🎙️' },
];

export default function MobileNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 flex justify-around py-3 border-t z-50"
      style={{
        borderColor: 'var(--border-subtle)',
        background: 'var(--color-bg-secondary)',
      }}
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[10px] font-medium ${
              isActive ? '' : 'opacity-60'
            }`
          }
          style={({ isActive }) => ({ color: isActive ? 'var(--accent)' : 'var(--text-muted)' })}
        >
          <span className="text-base">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
