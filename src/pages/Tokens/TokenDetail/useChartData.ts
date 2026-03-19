import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import {
  getDashboardChartTokensAddressType,
  useGetDashboardChartTokensAddressType,
} from "~/api/dezswap";
import type { GetDashboardChartTokensAddressTypeDuration } from "~/api/dezswap/models";

import useAssets from "~/hooks/useAssets";

type ChartAPIParameters = Parameters<
  typeof useGetDashboardChartTokensAddressType
>;

const getAxlUSDCChartData = (
  duration: GetDashboardChartTokensAddressTypeDuration | "all" = "month",
): Awaited<ReturnType<typeof getDashboardChartTokensAddressType>> => {
  const days = {
    year: 365,
    quarter: 90,
    month: 30,
    all: 365,
  }[duration];

  const now = Date.now();
  const data = [];
  for (let i = 0; i < days; i += 1) {
    data.push({
      t: new Date(now - i * 24 * 60 * 60 * 1000).toISOString(),
      v: "1",
    });
  }
  return data.toReversed();
};

export const useChartData = (
  address: ChartAPIParameters[0],
  type: ChartAPIParameters[1],
) => {
  // TODO: mv duration state to component and remove this wrapper hook
  const [duration, setDuration] = useState<
    GetDashboardChartTokensAddressTypeDuration | "all"
  >("month");

  const { assetInfos } = useAssets();

  const isAxlUSDC = useMemo(() => {
    const asset = assetInfos[address];
    return !!(asset?.verified && asset.symbol === "axlUSDC");
  }, [assetInfos, address]);

  const axlUSDCQuery = useQuery({
    queryKey: ["axlUSDCChartData", duration],
    queryFn: () => getAxlUSDCChartData(duration),
    enabled: isAxlUSDC,
  });

  const dashboardQuery = useGetDashboardChartTokensAddressType(
    address,
    type,
    // @ts-expect-error "all" is valid value but not included in the spec
    { duration },
    { query: { enabled: !isAxlUSDC } },
  );

  return {
    ...(isAxlUSDC ? axlUSDCQuery : dashboardQuery),
    type,
    duration,
    setDuration,
  };
};
