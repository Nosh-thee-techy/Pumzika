import { useMemo } from 'react';
import { useProperty } from '../context/RoleContext';
import { getPriceChangePercent } from '../utils/priceEngine';

export function usePricing() {
  const { property, recommendedPrice, confidence, priceReasons, neighborhood } =
    useProperty();

  const changePercent = useMemo(
    () => getPriceChangePercent(recommendedPrice, property?.currentPrice ?? 0),
    [recommendedPrice, property?.currentPrice]
  );

  const isAboveCurrent = changePercent >= 0;

  return {
    recommendedPrice,
    currentPrice: property?.currentPrice ?? 0,
    changePercent,
    isAboveCurrent,
    confidence,
    priceReasons,
    neighborhood,
  };
}
