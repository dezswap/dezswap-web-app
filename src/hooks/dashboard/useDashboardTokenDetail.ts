import { useQuery } from "@tanstack/react-query";

import useAPI from "~/hooks/useAPI";
import useNetwork from "~/hooks/useNetwork";

const useDashboardTokenDetail = (tokenAddress?: string) => {
  const {
    selectedChain: { chainId },
  } = useNetwork();
  const api = useAPI();

  const { data } = useQuery({
    queryKey: ["dashboard", "token", tokenAddress, chainId],
    queryFn: async () => {
      if (!tokenAddress) throw new Error("tokenAddress is undefined");

      try {
        const res = await api.dashboard.getTokenDetail(tokenAddress);
        return res;
      } catch (error) {
        return null;
      }
    },
    enabled: !!tokenAddress,
    staleTime: 1000 * 60 * 5,
  });

  return data;
};

export default useDashboardTokenDetail;
