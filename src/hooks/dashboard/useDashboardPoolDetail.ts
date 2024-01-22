import { useQuery } from "@tanstack/react-query";
import useAPI from "hooks/useAPI";
import useNetwork from "hooks/useNetwork";

const useDashboardPoolDetail = (poolAddress: string) => {
  const network = useNetwork();
  const api = useAPI();
  const { data } = useQuery({
    queryKey: ["dashboard", "pool-detail", poolAddress, network.chainID],
    queryFn: async () => {
      try {
        const res = await api.dashboard.getPoolDetail(poolAddress);
        return res;
      } catch (error) {
        return null;
      }
    },
  });

  return data;
};

export default useDashboardPoolDetail;
