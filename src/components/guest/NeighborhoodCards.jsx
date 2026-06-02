import { useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';

export default function NeighborhoodCards() {
  const navigate = useNavigate();
  const { guestNeighborhoods, guestPrefs } = useRole();

  return (
    <section className="card">
      <h3 className="text-headline">Best Areas For You</h3>
      <p className="text-meta mt-1">
        Based on your vibe: {guestPrefs.vibes?.join(', ')} · Budget: Ksh {guestPrefs.budgetMin?.toLocaleString()}–{guestPrefs.budgetMax?.toLocaleString()}
      </p>

      <div className="flex gap-4 mt-5 scroll-x-hidden pb-2">
        {guestNeighborhoods.slice(0, 6).map((n) => (
          <article
            key={n.id}
            className="card card-hover shrink-0 w-[260px] cursor-pointer"
            onClick={() => navigate('/guest/explore')}
          >
            <h4 className="font-semibold text-lg">{n.name}</h4>
            <div className="flex flex-wrap gap-1 mt-2">
              {(n.vibes ?? []).slice(0, 2).map((v) => (
                <span key={v} className="chip text-[11px]">{v}</span>
              ))}
            </div>
            <dl className="mt-4 space-y-1 text-[13px]">
              <div className="flex justify-between"><dt className="text-meta">Avg tonight</dt><dd className="font-semibold">Ksh {n.avgNightlyPrice?.toLocaleString()}</dd></div>
              <div className="flex justify-between"><dt className="text-meta">Listings</dt><dd>{n.activeListings}</dd></div>
              <div className="flex justify-between"><dt className="text-meta">Occupancy</dt><dd>{Math.round(n.occupancyRate * 100)}%</dd></div>
            </dl>
            <blockquote className="mt-3 pl-3 border-l-[3px] border-[var(--guest-accent)] text-[12px] italic text-[var(--text-secondary)]">
              Guests say: {(n.topReviewThemes ?? []).slice(0, 2).join(', ')}
            </blockquote>
            <div className="mt-4">
              <p className="text-label mb-1">Match for you</p>
              <div className="h-1 rounded bg-[var(--bg-raised)]">
                <div className="h-full rounded bg-[var(--guest-accent)]" style={{ width: `${n.matchScore}%` }} />
              </div>
              <p className="text-meta text-[var(--guest-accent)] mt-1">{n.matchScore}% match</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
