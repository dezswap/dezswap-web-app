import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAPI from "hooks/useAPI";
import useAssets from "hooks/useAssets";
import useNetwork from "hooks/useNetwork";
import { DashboardChartResponse } from "types/dashboard-api";

type ChartAPIParameters = Parameters<
  ReturnType<typeof useAPI>["dashboard"]["getTokenChart"]
>[0];

const getAxlUSDCChartData = (
  duration: ChartAPIParameters["duration"] = "month",
): DashboardChartResponse => {
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

const useChartData = (address: string, type: ChartAPIParameters["type"]) => {
  const {
    selectedChain: { chainId },
  } = useNetwork();
  const api = useAPI();
  const [duration, setDuration] =
    useState<ChartAPIParameters["duration"]>("month");

  const { getAsset } = useAssets();

  // TODO: Remove this when we have a better solution
  const isAxlUSDC = useMemo(() => {
    const asset = getAsset(address);
    return !!(asset?.verified && asset.symbol === "axlUSDC");
  }, [getAsset, address]);

  const { data } = useQuery({
    queryKey: [type, "chart", duration, chainId],
    queryFn: async () => {
      if (isAxlUSDC && type === "price") {
        return getAxlUSDCChartData(duration);
      }
      const res = await api.dashboard.getTokenChart({
        address,
        type,
        duration,
      });
      return res;
    },
  });

  return { type, data, duration, setDuration };
};

export default useChartData;
