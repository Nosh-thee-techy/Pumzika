import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  neighborhoods,
  countyMarket,
  listings,
  enrichNeighborhood,
  getListingsForNeighborhood,
  getListingById,
} from '../utils/dataService';
import {
  calculateOptimalPrice,
  getConfidence,
  getPriceReasons,
  calculateMoneyLeftBehind,
} from '../utils/priceEngine';
import {
  generateForecast,
  getActionPrompts,
  getForecastSummary,
} from '../utils/forecastEngine';
import {
  getListingInsights,
  getNeighborhoodMatch,
  getGuestQuickStats,
} from '../utils/sentimentEngine';

const RoleContext = createContext(null);

function loadJson(key) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function RoleProvider({ children }) {
  const [role, setRole] = useState(() => loadJson('pumzika_role'));
  const [hostProperty, setHostProperty] = useState(() => loadJson('pumzika_property'));
  const [guestPrefs, setGuestPrefs] = useState(() => loadJson('pumzika_guest_prefs'));
  const [settings, setSettings] = useState({
    autopilot: true,
    minPrice: 3000,
    maxPrice: 15000,
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-role', role ?? 'host');
  }, [role]);

  const selectRole = (newRole) => {
    setRole(newRole);
    localStorage.setItem('pumzika_role', JSON.stringify(newRole));
  };

  const saveHostProperty = (data) => {
    setHostProperty(data);
    localStorage.setItem('pumzika_property', JSON.stringify(data));
  };

  const saveGuestPrefs = (data) => {
    setGuestPrefs(data);
    localStorage.setItem('pumzika_guest_prefs', JSON.stringify(data));
  };

  const clearSession = () => {
    setRole(null);
    setHostProperty(null);
    localStorage.removeItem('pumzika_role');
    localStorage.removeItem('pumzika_property');
  };

  const neighborhood = useMemo(() => {
    const nid = hostProperty?.neighborhood?.toLowerCase?.().replace(/\s+/g, '-');
    const raw = neighborhoods.find((n) => n.id === nid || n.name === hostProperty?.neighborhood);
    return enrichNeighborhood(raw ?? neighborhoods.find((n) => n.id === 'kilimani'));
  }, [hostProperty]);

  const county = useMemo(() => {
    const id = neighborhood?.countyId ?? 'nairobi';
    return countyMarket.find((c) => c.id === id) ?? countyMarket.find((c) => c.code === 47);
  }, [neighborhood]);

  const recommendedPrice = useMemo(() => {
    if (!hostProperty || !neighborhood) return 8500;
    const raw = calculateOptimalPrice(hostProperty, neighborhood);
    return Math.min(settings.maxPrice, Math.max(settings.minPrice, raw));
  }, [hostProperty, neighborhood, settings.maxPrice, settings.minPrice]);

  const confidence = useMemo(
    () => (hostProperty && neighborhood ? getConfidence(hostProperty, neighborhood) : 87),
    [hostProperty, neighborhood]
  );

  const priceReasons = useMemo(
    () =>
      hostProperty && neighborhood
        ? getPriceReasons(hostProperty, neighborhood, recommendedPrice)
        : [],
    [hostProperty, neighborhood, recommendedPrice]
  );

  const moneyLeftBehind = useMemo(
    () =>
      hostProperty && neighborhood
        ? calculateMoneyLeftBehind(hostProperty, neighborhood)
        : 0,
    [hostProperty, neighborhood]
  );

  const forecast = useMemo(() => {
    if (!hostProperty || !neighborhood) return [];
    return generateForecast(hostProperty, neighborhood, new Date(), 30);
  }, [hostProperty, neighborhood]);

  const actionPrompts = useMemo(() => getActionPrompts(forecast), [forecast]);
  const forecastSummary = useMemo(() => getForecastSummary(forecast), [forecast]);

  const comps = useMemo(() => {
    if (!neighborhood) return [];
    return getListingsForNeighborhood(neighborhood.id);
  }, [neighborhood]);

  const guestNeighborhoods = useMemo(
    () =>
      [...neighborhoods]
        .map((n) => ({ ...n, matchScore: getNeighborhoodMatch(n, guestPrefs ?? { vibes: [], budgetMin: 4000, budgetMax: 10000 }) }))
        .sort((a, b) => b.matchScore - a.matchScore),
    [guestPrefs]
  );

  const guestQuickStats = useMemo(
    () => getGuestQuickStats(neighborhoods, guestPrefs ?? { budgetMin: 4000, budgetMax: 10000 }),
    [guestPrefs]
  );

  const guestListings = useMemo(() => {
    if (!guestPrefs) return [];
    return listings
      .filter((l) => l.price >= guestPrefs.budgetMin && l.price <= guestPrefs.budgetMax * 1.2)
      .slice(0, 40);
  }, [guestPrefs]);

  const value = {
    role,
    selectRole,
    clearSession,
    hostProperty,
    saveHostProperty,
    guestPrefs,
    saveGuestPrefs,
    settings,
    setSettings,
    neighborhood,
    county,
    neighborhoods,
    countyMarket,
    recommendedPrice,
    confidence,
    priceReasons,
    moneyLeftBehind,
    forecast,
    actionPrompts,
    forecastSummary,
    comps,
    guestNeighborhoods,
    guestQuickStats,
    guestListings,
    getListingById,
    getListingInsights,
    getNeighborhoodMatch,
    property: hostProperty,
    saveProperty: saveHostProperty,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}

export function useProperty() {
  return useRole();
}
