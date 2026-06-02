import { Link } from 'react-router-dom';
import { Mic, Bell } from 'lucide-react';
import { useProperty } from '../../context/PropertyContext';

function getDemandBadge(score) {
  if (score >= 78) return { emoji: '🔥', label: 'Hot', class: 'chip-accent' };
  if (score >= 65) return { emoji: '📈', label: 'Rising', class: 'chip-positive' };
  return { emoji: '😴', label: 'Slow', class: 'chip' };
}

export default function TopBar() {
  const { property, neighborhood } = useProperty();
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-KE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const hostName = property?.name?.split(' ')[0] ?? 'Host';
  const badge = getDemandBadge(neighborhood?.demandScore ?? 75);

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          {greeting}, {hostName}
        </h1>
        <p className="text-meta mt-0.5">{dateStr}</p>
      </div>

      <div className="flex items-center gap-3">
        <span className={`chip ${badge.class}`}>
          {badge.emoji} {property?.neighborhood ?? 'Kilimani'} · {badge.label}
        </span>

        <Link
          to="/ask"
          className="w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-150 hover:border-[var(--accent)]"
          style={{
            borderColor: 'var(--border-medium)',
            background: 'var(--bg-surface)',
          }}
          aria-label="Ask Pumzika AI"
        >
          <Mic size={16} style={{ color: 'var(--accent)' }} />
        </Link>

        <button
          type="button"
          className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors hover:border-[var(--border-medium)]"
          style={{
            borderColor: 'var(--border-subtle)',
            background: 'var(--bg-surface)',
          }}
          aria-label="Notifications"
        >
          <Bell size={16} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>
    </header>
  );
}
