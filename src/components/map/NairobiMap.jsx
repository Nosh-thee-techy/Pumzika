import { useState, useMemo, useCallback } from 'react';
import Map, { NavigationControl } from 'react-map-gl/mapbox';
import { DeckGL } from '@deck.gl/react';
import { ColumnLayer } from '@deck.gl/layers';
import 'mapbox-gl/dist/mapbox-gl.css';
import neighborhoods from '../../data/neighborhoods.json';
import { useProperty } from '../../context/PropertyContext';
import { usePricing } from '../../hooks/usePricing';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const COLOR_RANGE = [
  [232, 244, 253],
  [186, 217, 245],
  [245, 230, 200],
  [237, 185, 106],
  [200, 146, 42],
];

function scoreToColor(score, max = 100) {
  const t = Math.min(1, score / max);
  const idx = Math.floor(t * (COLOR_RANGE.length - 1));
  const next = Math.min(idx + 1, COLOR_RANGE.length - 1);
  const blend = (t * (COLOR_RANGE.length - 1)) % 1;
  return COLOR_RANGE[idx].map((c, i) => Math.round(c + (COLOR_RANGE[next][i] - c) * blend));
}

const VIEW_MODES = {
  demand: { field: 'demandScore', label: 'Demand' },
  supply: { field: 'supplyGap', label: 'Supply gap' },
  price: { field: 'avgNightlyPrice', label: 'Avg price' },
};

export default function NairobiMap({ fullScreen = false }) {
  const { neighborhood, property } = useProperty();
  const { recommendedPrice } = usePricing();
  const [viewMode, setViewMode] = useState('demand');
  const [selected, setSelected] = useState(null);

  const [viewState, setViewState] = useState({
    longitude: neighborhood?.coordinates?.[0] ?? 36.82,
    latitude: neighborhood?.coordinates?.[1] ?? -1.29,
    zoom: fullScreen ? 11 : 12,
    pitch: fullScreen ? 50 : 45,
    bearing: -12,
  });

  const mode = VIEW_MODES[viewMode];
  const layerData = useMemo(
    () => neighborhoods.map((n) => ({ ...n, position: n.coordinates, weight: n[mode.field] })),
    [mode.field]
  );
  const maxWeight = useMemo(() => Math.max(...layerData.map((d) => d.weight)), [layerData]);

  const layers = [
    new ColumnLayer({
      id: 'neighborhood-columns',
      data: layerData,
      diskResolution: 12,
      radius: fullScreen ? 400 : 280,
      extruded: true,
      pickable: true,
      elevationScale: fullScreen ? 20 : 12,
      getPosition: (d) => d.position,
      getFillColor: (d) => scoreToColor(d.weight, maxWeight),
      getElevation: (d) => d.weight,
      onClick: ({ object }) => setSelected(object),
      transitions: { getElevation: 800, getFillColor: 800 },
    }),
  ];

  const onMove = useCallback((evt) => setViewState(evt.viewState), []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="card flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <p className="text-body">
          Add <code className="text-[var(--accent-dark)]">VITE_MAPBOX_TOKEN</code> to your{' '}
          <code>.env</code> file to enable the map.
        </p>
        <div className="grid grid-cols-3 gap-2 w-full max-w-md mt-6">
          {neighborhoods.slice(0, 9).map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setSelected(n)}
              className="p-2 rounded-lg text-xs border text-left"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-raised)' }}
            >
              {n.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${fullScreen ? 'h-full min-h-[calc(100vh-0px)]' : 'h-[420px] rounded-xl overflow-hidden border'}`} style={{ borderColor: 'var(--border-subtle)' }}>
      {fullScreen && (
        <div
          className="absolute top-4 right-4 z-10 w-[200px] p-4 rounded-xl bg-[var(--bg-surface)] border"
          style={{ borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-raised)' }}
        >
          <p className="text-label mb-2">Show</p>
          <div className="flex flex-col gap-2">
            {Object.entries(VIEW_MODES).map(([key, { label }]) => (
              <button
                key={key}
                type="button"
                onClick={() => setViewMode(key)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150 ${
                  viewMode === key
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--bg-raised)] text-[var(--text-muted)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <DeckGL viewState={viewState} onViewStateChange={onMove} controller layers={layers}>
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/light-v11"
          {...viewState}
          onMove={onMove}
          style={{ width: '100%', height: '100%' }}
        >
          {fullScreen && <NavigationControl position="bottom-right" />}
        </Map>
      </DeckGL>

      {neighborhood && (
        <div
          className="absolute z-10 pointer-events-none"
          style={{
            left: '50%',
            top: '45%',
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div
            className="px-2 py-1.5 rounded-lg text-[13px] whitespace-nowrap bg-[var(--bg-surface)] border"
            style={{ boxShadow: 'var(--shadow-float)', borderColor: 'var(--border-subtle)' }}
          >
            <span className="font-medium">Your listing</span>
            <span className="text-meta"> · Ksh {recommendedPrice.toLocaleString()} tonight</span>
          </div>
          <div
            className="w-0 h-0 mx-auto border-l-8 border-r-8 border-t-8 border-transparent"
            style={{ borderTopColor: 'var(--bg-surface)' }}
          />
        </div>
      )}

      {selected && fullScreen && (
        <aside
          className="absolute top-0 right-0 h-full w-[300px] z-20 overflow-y-auto bg-[var(--bg-surface)] border-l p-8"
          style={{ borderColor: 'var(--border-subtle)', boxShadow: '-8px 0 24px rgba(0,0,0,0.06)' }}
        >
          <button
            type="button"
            className="absolute top-6 right-6 text-meta hover:text-[var(--text-primary)]"
            onClick={() => setSelected(null)}
          >
            ×
          </button>
          <h2 className="text-[22px] font-semibold pr-8">{selected.name}</h2>
          <p className="text-meta">{selected.name}, Nairobi</p>

          <hr className="divider" />

          <p className="text-label">Demand score</p>
          <p className="mt-2">
            <span className="text-5xl font-semibold" style={{ color: 'var(--accent)' }}>
              {selected.demandScore}
            </span>
            <span className="text-2xl font-light text-meta">/100</span>
          </p>
          <div className="h-2 rounded-full bg-[var(--bg-raised)] mt-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${selected.demandScore}%`, background: 'var(--accent)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {[
              ['Avg price tonight', `Ksh ${selected.avgNightlyPrice?.toLocaleString()}`],
              ['Active listings', selected.activeListings],
              ['Occupancy rate', `${Math.round(selected.occupancyRate * 100)}%`],
              ['Supply gap', `${selected.supplyGap} bookings`],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-label">{label}</p>
                <p className="font-semibold mt-1">{value}</p>
              </div>
            ))}
          </div>

          <hr className="divider" />

          {selected.supplyGap > 10 ? (
            <div className="p-3 rounded-lg border" style={{ background: 'var(--accent-light)', borderColor: 'rgba(200,146,42,0.3)' }}>
              <p className="text-[13px] font-semibold" style={{ color: 'var(--accent-dark)' }}>
                ✦ Opportunity zone
              </p>
              <p className="text-[12px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                Demand exceeds supply by {selected.supplyGap} bookings/night. Good time to list here.
              </p>
            </div>
          ) : selected.activeListings > 40 ? (
            <div className="p-3 rounded-lg chip-negative border-0">
              <p className="text-[13px] font-semibold">Oversupplied area</p>
              <p className="text-[12px] mt-1">
                More listings than demand. Consider pricing competitively.
              </p>
            </div>
          ) : null}

          <p className="text-label mt-6">Guests mention</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {selected.topReviewThemes?.map((t) => (
              <span key={t} className="chip text-[12px]">
                {t}
              </span>
            ))}
          </div>

          {selected.id === neighborhood?.id && (
            <p className="text-meta mt-4" style={{ color: 'var(--accent-dark)' }}>
              Your listing is in this neighborhood
            </p>
          )}
        </aside>
      )}
    </div>
  );
}
