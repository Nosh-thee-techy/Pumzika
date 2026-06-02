import TopBar from '../components/layout/TopBar';
import PriceTicker from '../components/dashboard/PriceTicker';
import PriceReason from '../components/dashboard/PriceReason';
import QuickStats from '../components/dashboard/QuickStats';
import NeighborhoodComps from '../components/dashboard/NeighborhoodComps';
import DemandCalendar from '../components/dashboard/DemandCalendar';
import OccupancyChart from '../components/dashboard/OccupancyChart';
import { useProperty } from '../context/PropertyContext';

function QuickSettings() {
  const { settings, setSettings } = useProperty();

  return (
    <section id="settings" className="card">
      <h3 className="text-headline">Pricing controls</h3>
      <p className="text-meta mt-1">Demo settings — adjust guardrails for recommendations</p>

      <div className="mt-6 space-y-6">
        <label className="flex items-center justify-between text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>Smart pricing autopilot</span>
          <button
            type="button"
            onClick={() => setSettings((s) => ({ ...s, autopilot: !s.autopilot }))}
            className={`w-11 h-6 rounded-full relative transition-colors duration-150 ${
              settings.autopilot ? 'bg-[var(--accent)]' : 'bg-[var(--bg-raised)] border'
            }`}
            style={{ borderColor: 'var(--border-medium)' }}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-150 ${
                settings.autopilot ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </label>

        <div>
          <label className="text-label block mb-2">
            Min price — Ksh {settings.minPrice.toLocaleString()}
          </label>
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
          <label className="text-label block mb-2">
            Max price — Ksh {settings.maxPrice.toLocaleString()}
          </label>
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

export default function DashboardPage() {
  const delays = ['0.05s', '0.1s', '0.15s', '0.2s', '0.25s', '0.3s'];

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-[var(--bg-canvas)]">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[960px] mx-auto px-6 py-8 lg:px-10 lg:py-10">
          <TopBar />

          <section
            className="card section-in grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-10"
            style={{ animationDelay: delays[0] }}
          >
            <PriceTicker />
            <PriceReason />
          </section>

          <div className="mt-8 section-in" style={{ animationDelay: delays[1] }}>
            <QuickStats />
          </div>

          <div className="mt-8 section-in" style={{ animationDelay: delays[2] }}>
            <DemandCalendar />
          </div>

          <div className="mt-8 section-in" style={{ animationDelay: delays[3] }}>
            <NeighborhoodComps />
          </div>

          <div className="mt-8 section-in" style={{ animationDelay: delays[4] }}>
            <OccupancyChart />
          </div>

          <div className="mt-8 section-in" style={{ animationDelay: delays[5] }}>
            <QuickSettings />
          </div>
        </div>
      </div>
    </div>
  );
}
