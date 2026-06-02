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
    <div data-role="guest" className="dashboard-page">
      <div className="dashboard-inner pb-24 lg:pb-8">
        <TopBar askPath="/guest/explore" />

        <div className="dashboard-grid">
          <div className="section-in">
            <PriceFairness />
          </div>

          <div className="section-in">
            <DemandCalendar role="guest" />
          </div>

          <div className="section-in">
            <GuestQuickStats />
          </div>

          <div className="section-in">
            <NeighborhoodCards />
          </div>

          <section className="card section-in">
            <h3 className="text-headline">Listings in your budget</h3>
            <p className="text-meta mt-1">Tap a listing for full insights</p>
            <div className="mt-5 flex flex-col gap-2">
              {guestListings.slice(0, 8).map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => navigate(`/guest/listing/${l.id}`)}
                  className="w-full flex items-center justify-between gap-4 py-4 px-4 text-left rounded-2xl bg-[var(--bg-soft)] hover:bg-[var(--bg-raised)] transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[14px] truncate">{l.name.slice(0, 40)}</p>
                    <p className="text-meta mt-0.5">
                      {l.neighborhood} · {l.bedrooms} BR
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold">Ksh {l.price.toLocaleString()}</p>
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
