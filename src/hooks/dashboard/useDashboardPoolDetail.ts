import { useQuery } from "@tanstack/react-query";
import useAPI from "hooks/useAPI";
import useNetwork from "hooks/useNetwork";

const useDashboardPoolDetail = (poolAddress: string) => {
  const network = useNetwork();
  const api = useAPI();
  const { data } = useQuery({
    queryKey: ["pool-detail", poolAddress, network.chainID],
    queryFn: () => api.dashboard.getPoolDetail(poolAddress),
  });

  return data;
};

export default useDashboardPoolDetail;
