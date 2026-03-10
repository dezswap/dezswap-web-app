import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import useAPI from "../useAPI";
import useNetwork from "../useNetwork";

const useDashboard = () => {
  const {
    selectedChain: { chainId },
  } = useNetwork();
  const api = useAPI();

  const { data: tokens } = useQuery({
    queryKey: ["dashboard", "tokens", chainId],
    queryFn: api.dashboard.getTokens,
  });

  const { data: pools } = useQuery({
    queryKey: ["dashboard", "pools", chainId],
    queryFn: () => api.dashboard.getPools(),
  });

  const { data: recent } = useQuery({
    queryKey: ["dashboard", "recent", chainId],
    queryFn: api.dashboard.getRecent,
  });

  const { data: statistics } = useQuery({
    queryKey: ["dashboard", "statistics", chainId],
    queryFn: api.dashboard.getStatistics,
  });

  const { data: transactions } = useQuery({
    queryKey: ["dashboard", "transactions", chainId],
    queryFn: () => api.dashboard.getTransactions(),
  });

  return useMemo(
    () => ({ tokens, pools, recent, statistics, transactions }),
    [pools, recent, statistics, tokens, transactions],
  );
};

export default useDashboard;
