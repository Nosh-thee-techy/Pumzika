import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, Mic, Compass } from 'lucide-react';
import { useRole } from '../../context/RoleContext';

export default function MobileNav() {
  const { role } = useRole();
  const isHost = role === 'host';

  const items = isHost
    ? [
        { to: '/host/dashboard', label: 'Home', icon: LayoutDashboard, end: true },
        { to: '/host/map', label: 'Map', icon: Map },
        { to: '/host/ask', label: 'Ask AI', icon: Mic },
      ]
    : [
        { to: '/guest/dashboard', label: 'Home', icon: LayoutDashboard, end: true },
        { to: '/guest/explore', label: 'Explore', icon: Compass },
      ];

  return (
    <nav className="mobile-nav-float">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
        >
          <item.icon size={20} strokeWidth={1.75} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
