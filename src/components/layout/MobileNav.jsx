import { NavLink } from 'react-router-dom';

const items = [
  { to: '/dashboard', label: 'Home', end: true },
  { to: '/map', label: 'Map' },
  { to: '/ask', label: 'Ask AI' },
];

export default function MobileNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 flex justify-around py-3 border-t z-50 bg-[var(--bg-surface)]"
      style={{ borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-raised)' }}
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `text-[11px] font-medium ${isActive ? 'text-[var(--accent-dark)]' : 'text-[var(--text-muted)]'}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
