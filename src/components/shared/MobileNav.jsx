import { NavLink } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';

export default function MobileNav() {
  const { role } = useRole();
  const isHost = role === 'host';

  const items = isHost
    ? [
        { to: '/host/dashboard', label: 'Home', end: true },
        { to: '/host/map', label: 'Map' },
        { to: '/host/ask', label: 'Ask AI' },
      ]
    : [
        { to: '/guest/dashboard', label: 'Home', end: true },
        { to: '/guest/explore', label: 'Explore' },
      ];

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
