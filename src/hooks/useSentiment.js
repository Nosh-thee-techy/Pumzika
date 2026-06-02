import { useMemo } from 'react';
import { useRole } from '../context/RoleContext';
import { getListingInsights } from '../utils/sentimentEngine';
import { getNeighborhood } from '../utils/dataService';

export function useSentiment(listingId) {
  const { getListingById } = useRole();

  return useMemo(() => {
    const listing = getListingById(listingId);
    if (!listing) return null;
    const neighborhood = getNeighborhood(listing.neighborhood);
    return getListingInsights(listing, neighborhood);
  }, [listingId, getListingById]);
}
