import { createContext, useContext, useState, useMemo } from 'react';
import neighborhoods from '../data/neighborhoods.json';
import listingsData from '../data/listings.json';
import { calculateOptimalPrice, getConfidence, getPriceReasons } from '../utils/priceEngine';
import {
  generateForecast,
  getActionPrompts,
  getForecastSummary,
} from '../utils/forecastEngine';

const PropertyContext = createContext(null);

const DEFAULT_PROPERTY = null;

export function PropertyProvider({ children }) {
  const [property, setProperty] = useState(() => {
    try {
      const saved = localStorage.getItem('pumzika_property');
      return saved ? JSON.parse(saved) : DEFAULT_PROPERTY;
    } catch {
      return DEFAULT_PROPERTY;
    }
  });

  const [settings, setSettings] = useState({
    autopilot: true,
    minPrice: 3000,
    maxPrice: 15000,
  });

  const neighborhood = useMemo(() => {
    if (!property?.neighborhood) return neighborhoods.find((n) => n.id === 'kilimani');
    const id = property.neighborhood.toLowerCase().replace(/\s+/g, '-');
    return neighborhoods.find((n) => n.id === id || n.name === property.neighborhood) ?? neighborhoods[1];
  }, [property]);

  const recommendedPrice = useMemo(() => {
    if (!property || !neighborhood) return 8500;
    const raw = calculateOptimalPrice(property, neighborhood);
    return Math.min(settings.maxPrice, Math.max(settings.minPrice, raw));
  }, [property, neighborhood, settings.maxPrice, settings.minPrice]);

  const confidence = useMemo(
    () => (property && neighborhood ? getConfidence(property, neighborhood) : 87),
    [property, neighborhood]
  );

  const priceReasons = useMemo(
    () =>
      property && neighborhood
        ? getPriceReasons(property, neighborhood, recommendedPrice)
        : [],
    [property, neighborhood, recommendedPrice]
  );

  const forecast = useMemo(() => {
    if (!property || !neighborhood) return [];
    return generateForecast(property, neighborhood, new Date(), 30);
  }, [property, neighborhood]);

  const actionPrompts = useMemo(() => getActionPrompts(forecast), [forecast]);
  const forecastSummary = useMemo(() => getForecastSummary(forecast), [forecast]);

  const comps = useMemo(() => {
    const nid = neighborhood?.id ?? 'kilimani';
    const filtered = listingsData
      .filter((l) => l.neighborhood === nid)
      .sort((a, b) => a.price - b.price);
    return filtered;
  }, [neighborhood]);

  const saveProperty = (data) => {
    setProperty(data);
    localStorage.setItem('pumzika_property', JSON.stringify(data));
  };

  const clearProperty = () => {
    setProperty(null);
    localStorage.removeItem('pumzika_property');
  };

  const value = {
    property,
    saveProperty,
    clearProperty,
    neighborhood,
    neighborhoods,
    recommendedPrice,
    confidence,
    priceReasons,
    forecast,
    actionPrompts,
    forecastSummary,
    comps,
    settings,
    setSettings,
  };

  return (
    <PropertyContext.Provider value={value}>{children}</PropertyContext.Provider>
  );
}

export function useProperty() {
  const ctx = useContext(PropertyContext);
  if (!ctx) throw new Error('useProperty must be used within PropertyProvider');
  return ctx;
}
