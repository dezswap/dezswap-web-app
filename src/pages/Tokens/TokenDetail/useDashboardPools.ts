import { useQuery } from "@tanstack/react-query";
import useAPI from "hooks/useAPI";
import useNetwork from "hooks/useNetwork";

const useDashboardPools = (tokenAddress: string) => {
  const network = useNetwork();
  const api = useAPI();
  const { data } = useQuery({
    queryKey: ["pools", tokenAddress, network.chainID],
    queryFn: () => api.dashboard.getPools(tokenAddress),
  });

  return data;
};

export default useDashboardPools;
