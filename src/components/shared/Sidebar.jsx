import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Map,
  Mic,
  Settings,
  LogOut,
  Compass,
  Bookmark,
  Bell,
} from 'lucide-react';
import { useRole } from '../../context/RoleContext';

const hostNav = [
  { to: '/host/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/host/dashboard#calendar', label: 'Calendar', icon: Calendar },
  { to: '/host/map', label: 'Map', icon: Map },
  { to: '/host/ask', label: 'Ask AI', icon: Mic },
];

const guestNav = [
  { to: '/guest/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/guest/explore', label: 'Explore', icon: Compass },
  { to: '/guest/dashboard#saved', label: 'Saved', icon: Bookmark },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { role, hostProperty, guestPrefs } = useRole();
  const isHost = role === 'host';
  const navItems = isHost ? hostNav : guestNav;

  const displayName = isHost
    ? hostProperty?.name?.split(' ')[0] ?? 'Host'
    : guestPrefs?.name?.split(' ')[0] ?? 'Guest';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="float-sidebar">
      <div className="float-nav-card float-nav-card-grow">
        <button type="button" onClick={() => navigate('/')} className="float-nav-logo" title="Pumzika home">
          pz
        </button>
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            title={item.label}
            className={({ isActive }) => `float-nav-link${isActive ? ' active' : ''}`}
          >
            <item.icon size={20} strokeWidth={1.75} />
          </NavLink>
        ))}
      </div>

      <div className="float-nav-card">
        <button type="button" className="float-nav-link" title="Notifications">
          <Bell size={20} strokeWidth={1.75} />
        </button>
        <NavLink
          to={isHost ? '/host/dashboard#settings' : '/guest/dashboard'}
          title="Settings"
          className={({ isActive }) => `float-nav-link${isActive ? ' active' : ''}`}
        >
          <Settings size={20} strokeWidth={1.75} />
        </NavLink>
      </div>

      <div className="float-nav-card">
        <button type="button" onClick={() => navigate('/')} className="float-nav-link" title="Switch role">
          <LogOut size={20} strokeWidth={1.75} />
        </button>
        <div className="float-nav-avatar" title={displayName}>
          {initial}
        </div>
      </div>
    </aside>
  );
}
