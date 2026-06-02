import TopBar from '../../components/layout/TopBar';
import PriceFairness from '../../components/guest/PriceFairness';
import GuestQuickStats from '../../components/guest/GuestQuickStats';
import NeighborhoodCards from '../../components/guest/NeighborhoodCards';
import DemandCalendar from '../../components/dashboard/DemandCalendar';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';

export default function GuestDashboard() {
  const navigate = useNavigate();
  const { guestListings } = useRole();

  return (
    <div data-role="guest" className="flex flex-col flex-1 min-h-0 bg-[var(--bg-canvas)]">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[960px] mx-auto px-5 py-8 lg:px-10 lg:py-10">
          <TopBar askPath="/guest/explore" />

          <div className="section-in mb-8"><PriceFairness /></div>
          <div className="section-in mb-8"><DemandCalendar role="guest" /></div>
          <div className="section-in mb-8"><GuestQuickStats /></div>
          <div className="section-in mb-8"><NeighborhoodCards /></div>

          <section className="card section-in">
            <h3 className="text-headline">Listings in your budget</h3>
            <p className="text-meta mt-1">Tap a listing for full insights</p>
            <div className="mt-4 divide-y divide-[var(--border-subtle)]">
              {guestListings.slice(0, 8).map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => navigate(`/guest/listing/${l.id}`)}
                  className="w-full flex items-center justify-between py-3 text-left hover:bg-[var(--bg-raised)] px-2 rounded-lg transition-colors"
                >
                  <div>
                    <p className="font-medium text-[13px]">{l.name.slice(0, 40)}</p>
                    <p className="text-meta">{l.neighborhood} · {l.bedrooms}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Ksh {l.price.toLocaleString()}</p>
                    <p className="text-meta">{l.rating} ★</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
