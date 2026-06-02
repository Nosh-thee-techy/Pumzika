import TopBar from '../../components/layout/TopBar';
import MoneyLeftBehind from '../../components/host/MoneyLeftBehind';
import PriceTicker from '../../components/dashboard/PriceTicker';
import PriceReason from '../../components/dashboard/PriceReason';
import QuickStats from '../../components/dashboard/QuickStats';
import DemandCalendar from '../../components/dashboard/DemandCalendar';
import NeighborhoodComps from '../../components/dashboard/NeighborhoodComps';
import OccupancyChart from '../../components/dashboard/OccupancyChart';
import { useRole } from '../../context/RoleContext';

function QuickSettings() {
  const { settings, setSettings } = useRole();

  return (
    <section id="settings" className="card">
      <h3 className="text-headline">Pricing controls</h3>
      <p className="text-meta mt-1">Adjust guardrails for recommendations</p>
      <div className="mt-6 space-y-6">
        <label className="flex items-center justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Smart pricing autopilot</span>
          <button
            type="button"
            onClick={() => setSettings((s) => ({ ...s, autopilot: !s.autopilot }))}
            className={`w-12 h-7 rounded-full relative transition-colors ${settings.autopilot ? 'bg-[var(--accent)]' : 'bg-[var(--bg-raised)]'}`}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${settings.autopilot ? 'left-6' : 'left-1'}`}
            />
          </button>
        </label>
        <div>
          <label className="text-label block mb-3">Min price — Ksh {settings.minPrice.toLocaleString()}</label>
          <input
            type="range"
            min={3000}
            max={15000}
            step={500}
            value={settings.minPrice}
            onChange={(e) => setSettings((s) => ({ ...s, minPrice: Number(e.target.value) }))}
            className="w-full accent-[var(--accent)]"
          />
        </div>
        <div>
          <label className="text-label block mb-3">Max price — Ksh {settings.maxPrice.toLocaleString()}</label>
          <input
            type="range"
            min={3000}
            max={15000}
            step={500}
            value={settings.maxPrice}
            onChange={(e) => setSettings((s) => ({ ...s, maxPrice: Number(e.target.value) }))}
            className="w-full accent-[var(--accent)]"
          />
        </div>
      </div>
    </section>
  );
}

export default function HostDashboard() {
  const delays = ['0.05s', '0.1s', '0.15s', '0.2s', '0.25s', '0.3s'];

  return (
    <div data-role="host" className="dashboard-page">
      <div className="dashboard-inner pb-24 lg:pb-8">
        <TopBar askPath="/host/ask" />

        <div className="dashboard-grid">
          <div className="section-in dashboard-bento-wide" style={{ animationDelay: delays[0] }}>
            <MoneyLeftBehind />
          </div>

          <section className="card price-hero-card section-in dashboard-bento-wide" style={{ animationDelay: delays[1] }}>
            <PriceTicker />
            <div className="price-hero-divider" aria-hidden="true" />
            <PriceReason />
          </section>

          <div className="section-in dashboard-bento-wide" style={{ animationDelay: delays[2] }}>
            <QuickStats />
          </div>

          <div className="section-in" style={{ animationDelay: delays[3] }}>
            <DemandCalendar role="host" />
          </div>

          <div className="dashboard-bento">
            <div className="section-in" style={{ animationDelay: delays[4] }}>
              <OccupancyChart />
            </div>
            <div className="section-in" style={{ animationDelay: delays[4] }}>
              <NeighborhoodComps />
            </div>
          </div>

          <div className="section-in" style={{ animationDelay: delays[5] }}>
            <QuickSettings />
          </div>
        </div>
      </div>
    </div>
  );
}
