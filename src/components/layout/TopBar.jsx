import { Link } from 'react-router-dom';
import { Mic } from 'lucide-react';
import { useProperty } from '../../context/PropertyContext';

export default function TopBar() {
  const { property } = useProperty();
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-KE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <header
      className="flex flex-wrap items-center justify-between gap-4 h-14 border-b mb-8"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <p className="text-sm">
        <span style={{ color: 'var(--text-muted)' }}>{greeting}</span>
        <span style={{ color: 'var(--text-muted)' }}> · </span>
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
          {dateStr}
        </span>
      </p>

      <div className="flex items-center gap-3">
        <button type="button" className="btn-secondary py-2 px-3 text-sm">
          {property?.neighborhood ?? 'Kilimani'} ▾
        </button>
        <Link
          to="/ask"
          className="w-9 h-9 rounded-full border flex items-center justify-center bg-[var(--bg-surface)] transition-colors duration-150 hover:border-[var(--accent)]"
          style={{ borderColor: 'var(--border-medium)' }}
        >
          <Mic size={16} style={{ color: 'var(--text-muted)' }} />
        </Link>
      </div>
    </header>
  );
}
