import { useQuery } from "@tanstack/react-query";
import useAPI from "hooks/useAPI";
import useNetwork from "hooks/useNetwork";
import { useState } from "react";

type ChartAPIParameters = Parameters<
  ReturnType<typeof useAPI>["dashboard"]["getPoolChart"]
>[0];

const useChartData = (address: string, type: ChartAPIParameters["type"]) => {
  const network = useNetwork();
  const api = useAPI();
  const [duration, setDuration] =
    useState<ChartAPIParameters["duration"]>("month");
  const { data } = useQuery({
    queryKey: [type, "chart", duration, network.chainID],
    queryFn: () => api.dashboard.getPoolChart({ address, type, duration }),
  });

  return { type, data, duration, setDuration };
};

export default useChartData;
