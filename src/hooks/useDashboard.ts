import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import useAPI from "./useAPI";
import useNetwork from "./useNetwork";

const useDashboard = () => {
  const network = useNetwork();
  const api = useAPI();

  const { data: tokens } = useQuery({
    queryKey: ["dashboard", "tokens", network.chainID],
    queryFn: api.dashboard.getTokens,
  });

  const { data: pools } = useQuery({
    queryKey: ["dashboard", "pools", network.chainID],
    queryFn: () => api.dashboard.getPools(),
  });

  const { data: recent } = useQuery({
    queryKey: ["dashboard", "recent", network.chainID],
    queryFn: api.dashboard.getRecent,
  });

  const { data: statistics } = useQuery({
    queryKey: ["dashboard", "statistics", network.chainID],
    queryFn: api.dashboard.getStatistics,
  });

  const { data: transactions } = useQuery({
    queryKey: ["dashboard", "transactions", network.chainID],
    queryFn: () => api.dashboard.getTransactions(),
  });

  return useMemo(
    () => ({ tokens, pools, recent, statistics, transactions }),
    [pools, recent, statistics, tokens, transactions],
  );
};

export default useDashboard;
