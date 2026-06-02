import { useState, useMemo, useCallback, useEffect } from 'react';
import Map, { NavigationControl } from 'react-map-gl/mapbox';
import { DeckGL } from '@deck.gl/react';
import { GeoJsonLayer, ColumnLayer, TextLayer } from '@deck.gl/layers';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ChevronRight, ZoomIn } from 'lucide-react';
import {
  countyMarket,
  neighborhoods,
  getCounty,
} from '../../utils/dataService';
import { useProperty } from '../../context/PropertyContext';
import { usePricing } from '../../hooks/usePricing';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const GEO_URL = '/geo/kenya-counties.geojson';

const KENYA_VIEW = { longitude: 37.9, latitude: 0.2, zoom: 5.2, pitch: 0, bearing: 0 };

const COLOR_RANGE = [
  [30, 58, 95],
  [45, 106, 159],
  [245, 166, 35],
  [255, 107, 53],
  [255, 45, 85],
];

const LEGEND = [
  { label: 'Low', color: '#e8f4fd' },
  { label: 'Medium', color: '#f5e6c8' },
  { label: 'High', color: '#edb96a' },
  { label: 'Peak', color: '#c8922a' },
];

function demandToColor(score) {
  const t = Math.min(1, score / 100);
  const idx = Math.floor(t * (COLOR_RANGE.length - 1));
  const next = Math.min(idx + 1, COLOR_RANGE.length - 1);
  const blend = (t * (COLOR_RANGE.length - 1)) % 1;
  return [
    ...COLOR_RANGE[idx].map((c, i) => Math.round(c + (COLOR_RANGE[next][i] - c) * blend)),
    levelAlpha(score),
  ];
}

function levelAlpha(score) {
  if (score >= 75) return 200;
  if (score >= 55) return 170;
  return 140;
}

function getCountyStats(code) {
  return countyMarket.find((c) => c.code === code);
}

export default function KenyaMap({ fullScreen = false }) {
  const { neighborhood: hostArea, property } = useProperty();
  const { recommendedPrice } = usePricing();

  const [geoData, setGeoData] = useState(null);
  const [level, setLevel] = useState('kenya');
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [viewMode, setViewMode] = useState('demand');
  const [viewState, setViewState] = useState(KENYA_VIEW);

  useEffect(() => {
    fetch(GEO_URL)
      .then((r) => r.json())
      .then(setGeoData)
      .catch(() => setGeoData(null));
  }, []);

  useEffect(() => {
    if (fullScreen && hostArea?.countyCode && geoData && !selectedCounty) {
      const county = getCounty(hostArea.countyCode);
      if (county) setSelectedCounty(county);
    }
  }, [fullScreen, hostArea, geoData, selectedCounty]);

  const flyTo = useCallback((center, zoom, pitch = 0) => {
    setViewState((v) => ({
      ...v,
      longitude: center[0],
      latitude: center[1],
      zoom,
      pitch,
      transitionDuration: 1200,
    }));
  }, []);

  const handleCountyClick = useCallback(
    (code) => {
      const county = getCountyStats(code);
      if (!county) return;
      setSelectedCounty(county);
      setSelectedArea(null);
      setLevel('county');
      flyTo(county.center, county.id === 'nairobi' ? 10.5 : 8.5, county.id === 'nairobi' ? 35 : 0);
    },
    [flyTo]
  );

  const handleAreaClick = useCallback(
    (area) => {
      setSelectedArea(area);
      setLevel('area');
      flyTo(area.coordinates ?? area.center, 12.8, fullScreen ? 45 : 30);
    },
    [flyTo, fullScreen]
  );

  const goKenya = () => {
    setLevel('kenya');
    setSelectedCounty(null);
    setSelectedArea(null);
    setViewState({ ...KENYA_VIEW, pitch: 0, bearing: 0 });
  };

  const goCounty = () => {
    if (!selectedCounty) return goKenya();
    setLevel('county');
    setSelectedArea(null);
    flyTo(selectedCounty.center, selectedCounty.id === 'nairobi' ? 10.5 : 8.5, 25);
  };

  const modeField =
    viewMode === 'demand' ? 'demandScore' : viewMode === 'supply' ? 'supplyGap' : 'avgNightlyPrice';

  const countyLayerData = useMemo(() => {
    if (!geoData) return null;
    return {
      ...geoData,
      features: geoData.features.map((f) => ({
        ...f,
        properties: {
          ...f.properties,
          stats: getCountyStats(f.properties.COUNTY_COD),
        },
      })),
    };
  }, [geoData]);

  const areaData = useMemo(() => {
    if (!selectedCounty) return [];
    if (selectedCounty.id === 'nairobi') {
      return neighborhoods.map((n) => ({
        ...n,
        position: n.coordinates,
        weight: n[modeField] ?? n.demandScore,
      }));
    }
    const sections = selectedCounty.constituencies?.length > 1
      ? selectedCounty.constituencies
      : ['Central', 'North', 'South', 'East', 'West'];
    return sections.map((name, i) => ({
      id: `${selectedCounty.id}-sec-${i}`,
      name: typeof name === 'string' ? name : name,
      position: [
        selectedCounty.center[0] + (i % 3) * 0.12 - 0.12,
        selectedCounty.center[1] + Math.floor(i / 3) * 0.1 - 0.05,
      ],
      weight: (selectedCounty[modeField] ?? selectedCounty.demandScore) * (0.85 + (i % 3) * 0.08),
      demandScore: Math.round(selectedCounty.demandScore * (0.9 + (i % 4) * 0.05)),
      avgNightlyPrice: selectedCounty.avgNightlyPrice,
      activeListings: Math.round(selectedCounty.activeListings / sections.length),
      occupancyRate: selectedCounty.occupancyRate,
      supplyGap: selectedCounty.supplyGap,
      topReviewThemes: selectedCounty.topReviewThemes,
    }));
  }, [selectedCounty, modeField]);

  const layers = useMemo(() => {
    const result = [];

    if (level === 'kenya' && countyLayerData) {
      result.push(
        new GeoJsonLayer({
          id: 'kenya-counties',
          data: countyLayerData,
          pickable: true,
          stroked: true,
          filled: true,
          extruded: false,
          lineWidthMinPixels: 1.5,
          getFillColor: (f) => demandToColor(f.properties.stats?.demandScore ?? 50),
          getLineColor: [255, 255, 255, 80],
          getLineWidth: 1,
          onClick: ({ object }) => {
            if (object?.properties?.COUNTY_COD) handleCountyClick(object.properties.COUNTY_COD);
          },
        })
      );
    }

    if (level === 'county' && countyLayerData && selectedCounty) {
      result.push(
        new GeoJsonLayer({
          id: 'county-highlight',
          data: {
            type: 'FeatureCollection',
            features: countyLayerData.features.filter(
              (f) => f.properties.COUNTY_COD === selectedCounty.code
            ),
          },
          pickable: false,
          stroked: true,
          filled: true,
          getFillColor: [245, 166, 35, 60],
          getLineColor: [245, 166, 35, 220],
          getLineWidth: 2,
        })
      );

      if (selectedCounty.id === 'nairobi' && areaData.length) {
        result.push(
          new ColumnLayer({
            id: 'nairobi-areas',
            data: areaData,
            diskResolution: 12,
            radius: 350,
            extruded: true,
            pickable: true,
            elevationScale: 15,
            getPosition: (d) => d.position,
            getFillColor: (d) => demandToColor(d.demandScore ?? 70),
            getElevation: (d) => d.weight,
            onClick: ({ object }) => object && handleAreaClick(object),
          })
        );
      } else if (areaData.length) {
        result.push(
          new ColumnLayer({
            id: 'county-sections',
            data: areaData,
            diskResolution: 10,
            radius: 800,
            extruded: true,
            pickable: true,
            elevationScale: 8,
            getPosition: (d) => d.position,
            getFillColor: (d) => demandToColor(d.demandScore ?? 55),
            getElevation: (d) => d.weight,
            onClick: ({ object }) => object && setSelectedArea(object),
          })
        );
      }
    }

    if (level === 'area' && areaData.length) {
      const filtered = selectedArea
        ? areaData.filter((a) => a.id === selectedArea.id)
        : areaData;
      result.push(
        new ColumnLayer({
          id: 'area-detail',
          data: filtered.length ? filtered : areaData,
          diskResolution: 14,
          radius: 280,
          extruded: true,
          pickable: true,
          elevationScale: 20,
          getPosition: (d) => d.position,
          getFillColor: (d) =>
            d.id === hostArea?.id ? [245, 166, 35, 230] : demandToColor(d.demandScore ?? 70),
          getElevation: (d) => d.weight,
          onClick: ({ object }) => object && setSelectedArea(object),
        })
      );
    }

    if (level !== 'kenya' && selectedArea) {
      result.push(
        new TextLayer({
          id: 'area-label',
          data: [selectedArea],
          getPosition: (d) => d.coordinates ?? d.position ?? d.center,
          getText: (d) => d.name,
          getSize: 14,
          getColor: [240, 238, 230, 255],
          getPixelOffset: [0, -28],
          fontFamily: 'Syne, sans-serif',
          fontWeight: 600,
        })
      );
    }

    return result;
  }, [
    level,
    countyLayerData,
    selectedCounty,
    areaData,
    selectedArea,
    hostArea,
    handleCountyClick,
    handleAreaClick,
  ]);

  const onMove = useCallback((evt) => setViewState(evt.viewState), []);
  const panelItem = selectedArea ?? selectedCounty;

  if (!MAPBOX_TOKEN) {
    return (
      <div
        className={`flex flex-col p-4 ${fullScreen ? 'h-full min-h-[400px]' : 'min-h-[200px] rounded-xl'}`}
        style={{ background: 'var(--bg-raised)' }}
      >
        <p className="text-body text-sm mb-3">
          Add <code style={{ color: 'var(--accent)' }}>VITE_MAPBOX_TOKEN</code> for the Kenya map
        </p>
        <div className="grid grid-cols-2 gap-2 overflow-y-auto flex-1">
          {countyMarket.slice(0, 12).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleCountyClick(c.code)}
              className="p-2 rounded-lg text-xs border text-left"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-raised)' }}
            >
              <span className="font-medium">{c.name}</span>
              <span className="block text-meta mt-0.5">Demand {c.demandScore}/100</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative ${fullScreen ? 'h-full min-h-[calc(100vh-0px)]' : 'h-[220px] rounded-xl overflow-hidden border'}`}
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      {fullScreen && (
        <div
          className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-1 px-3 py-2 rounded-xl border text-xs"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-raised)' }}
        >
          <button type="button" onClick={goKenya} className="hover:text-[var(--accent)] transition-colors">
            Kenya
          </button>
          {selectedCounty && (
            <>
              <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
              <button type="button" onClick={goCounty} className="hover:text-[var(--accent)]">
                {selectedCounty.name} County
              </button>
            </>
          )}
          {selectedArea && (
            <>
              <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
              <span style={{ color: 'var(--accent)' }}>{selectedArea.name}</span>
            </>
          )}
        </div>
      )}

      {fullScreen && (
        <div
          className="absolute top-4 right-4 z-10 w-[200px] p-3 rounded-xl border"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-raised)' }}
        >
          <p className="text-label mb-2">Data layer</p>
          {['demand', 'supply', 'price'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setViewMode(m)}
              className="block w-full text-left px-2 py-1.5 rounded-lg text-xs mb-1 capitalize"
              style={
                viewMode === m
                  ? { background: 'var(--accent)', color: '#fff' }
                  : { color: 'var(--text-muted)' }
              }
            >
              {m === 'demand' ? 'Demand score' : m === 'supply' ? 'Supply gap' : 'Avg price'}
            </button>
          ))}
          <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
            Click a county to drill down · Nairobi has area-level data
          </p>
        </div>
      )}

      {fullScreen && (
        <div
          className="absolute bottom-6 left-6 z-10 p-3 rounded-xl border"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-raised)' }}
        >
          <p className="text-label mb-2">Demand</p>
          <div className="flex gap-1">
            {LEGEND.map(({ label, color }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <div className="w-5 h-2.5 rounded-sm" style={{ background: color }} />
                <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
                  {label}
                </span>
              </div>
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

      {hostArea && level === 'area' && (
        <div
          className="absolute z-10 pointer-events-none"
          style={{ left: '50%', top: '40%', transform: 'translate(-50%, -50%)' }}
        >
          <div
            className="w-3 h-3 rounded-full border-2 mx-auto"
            style={{ background: 'var(--accent)', borderColor: '#fff' }}
          />
          {!fullScreen && (
            <div
              className="mt-2 px-2 py-1 rounded-lg text-[11px] whitespace-nowrap"
              style={{
                background: 'var(--bg-surface)',
                boxShadow: 'var(--shadow-float)',
                color: 'var(--text-primary)',
              }}
            >
              Your listing · Ksh {recommendedPrice.toLocaleString()} tonight
            </div>
          )}
        </div>
      )}

      {fullScreen && panelItem && (
          <aside
            className="absolute top-0 right-0 h-full w-[300px] z-20 overflow-y-auto border-l p-8"
            style={{
              background: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              boxShadow: '-8px 0 24px rgba(0,0,0,0.06)',
            }}
          >
            <button
              type="button"
              className="absolute top-6 right-6 text-meta"
              onClick={() => {
                setSelectedArea(null);
                if (level === 'area') goCounty();
                else goKenya();
              }}
            >
              ×
            </button>
            <p className="text-label">{selectedArea ? 'Area' : 'County'}</p>
            <h2 className="text-[22px] font-semibold pr-8">{panelItem.name}</h2>
            <p className="text-meta">{panelItem.name}, Kenya</p>

            <hr className="divider" />

            <p className="text-label">Demand score</p>
            <p className="mt-2">
              <span className="text-5xl font-semibold" style={{ color: 'var(--accent)' }}>
                {panelItem.demandScore}
              </span>
              <span className="text-2xl font-light text-meta">/100</span>
            </p>
            <div className="h-2 rounded-full bg-[var(--bg-raised)] mt-3 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${panelItem.demandScore}%`, background: 'var(--accent)' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              {[
                ['Avg price tonight', `Ksh ${panelItem.avgNightlyPrice?.toLocaleString()}`],
                ['Active listings', panelItem.activeListings],
                ['Occupancy rate', `${Math.round((panelItem.occupancyRate ?? 0) * 100)}%`],
                ['Supply gap', `${panelItem.supplyGap} bookings`],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-label">{label}</p>
                  <p className="font-semibold mt-1">{value}</p>
                </div>
              ))}
            </div>

            {panelItem.id === hostArea?.id && (
              <p className="text-meta mt-4" style={{ color: 'var(--accent-dark)' }}>
                Your listing is here · Ksh {recommendedPrice.toLocaleString()} tonight
              </p>
            )}

            {level === 'county' && selectedCounty?.id === 'nairobi' && !selectedArea && (
              <p className="text-meta mt-4 flex items-center gap-1">
                <ZoomIn size={12} /> Click an area to drill down
              </p>
            )}

            {panelItem.topReviewThemes && (
              <>
                <p className="text-label mt-6">Guests mention</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {panelItem.topReviewThemes.map((t) => (
                    <span key={t} className="chip text-[12px]">
                      {t}
                    </span>
                  ))}
                </div>
              </>
            )}
          </aside>
        )}
    </div>
  );
}

// Backward-compatible export
export { KenyaMap as NairobiMap };
