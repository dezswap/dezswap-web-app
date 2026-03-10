import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import useAPI from "~/hooks/useAPI";
import useNetwork from "~/hooks/useNetwork";

type ChartAPIParameters = Parameters<
  ReturnType<typeof useAPI>["dashboard"]["getChart"]
>[0];

const useChartData = (type: ChartAPIParameters["type"]) => {
  const {
    selectedChain: { chainId },
  } = useNetwork();
  const api = useAPI();
  const [duration, setDuration] =
    useState<ChartAPIParameters["duration"]>("month");
  const { data } = useQuery({
    queryKey: [type, "chart", duration, chainId],
    queryFn: () => api.dashboard.getChart({ type, duration }),
  });

  return { type, data, duration, setDuration };
};

export default useChartData;
