import { Link } from 'react-router-dom';
import { Search, Mic } from 'lucide-react';
import { useRole } from '../../context/RoleContext';

export default function TopBar({ askPath = '/host/ask' }) {
  const { hostProperty, role } = useRole();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' });

  const name =
    role === 'host'
      ? hostProperty?.name?.split(' ')[0] ?? 'there'
      : 'there';

  return (
    <header className="dashboard-header">
      <div>
        <h1 className="dashboard-greeting">Hi, {name}!</h1>
        <p className="dashboard-date">{dateStr}</p>
      </div>

      <div className="dashboard-header-actions">
        <label className="search-pill">
          <Search size={16} strokeWidth={2} />
          <input type="search" placeholder="Search listings, areas…" aria-label="Search" />
        </label>
        {role === 'host' && hostProperty?.neighborhood && (
          <span className="chip chip-accent hidden sm:inline-flex">📍 {hostProperty.neighborhood}</span>
        )}
        <Link to={askPath} className="btn-primary inline-flex items-center gap-2 no-underline">
          <Mic size={16} strokeWidth={2} />
          Ask AI
        </Link>
      </div>
    </header>
  );
}
