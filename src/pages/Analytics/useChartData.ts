import { useState } from "react";

import { useGetDashboardChartType } from "~/api/dezswap";
import type { GetDashboardChartTypeDuration } from "~/api/dezswap/models";

type ChartAPIParameters = Parameters<typeof useGetDashboardChartType>;

export const useChartData = (type: ChartAPIParameters[0]) => {
  // TODO: mv duration state to component and remove this wrapper hook
  const [duration, setDuration] = useState<
    GetDashboardChartTypeDuration | "all"
  >("month");
  // @ts-expect-error "all" is valid value but not included in the spec
  const query = useGetDashboardChartType(type, { duration });

  return { ...query, duration, setDuration };
};
