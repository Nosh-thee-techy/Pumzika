import { useProperty } from '../context/RoleContext';
import { getDemandCellStyle } from '../utils/forecastEngine';

export function useForecast() {
  const { forecast, actionPrompts, forecastSummary } = useProperty();

  return {
    forecast,
    actionPrompts,
    forecastSummary,
    getDemandCellStyle,
  };
}
