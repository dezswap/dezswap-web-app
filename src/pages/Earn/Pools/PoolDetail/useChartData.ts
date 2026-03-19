import { useState } from "react";

import { useGetDashboardChartPoolsAddressType } from "~/api/dezswap";
import type { GetDashboardChartPoolsAddressTypeDuration } from "~/api/dezswap/models";

type ChartAPIParameters = Parameters<
  typeof useGetDashboardChartPoolsAddressType
>;

export const useChartData = (
  address: ChartAPIParameters[0],
  type: ChartAPIParameters[1],
) => {
  // TODO: mv duration state to component and remove this wrapper hook
  const [duration, setDuration] = useState<
    GetDashboardChartPoolsAddressTypeDuration | "all"
  >("month");

  const query = useGetDashboardChartPoolsAddressType(address, type, {
    // @ts-expect-error "all" is valid value but not included in the spec
    duration,
  });

  return { ...query, type, duration, setDuration };
};
